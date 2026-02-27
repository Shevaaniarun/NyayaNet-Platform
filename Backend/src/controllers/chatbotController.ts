import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService';
import { AuthRequest } from '../middleware/auth';
import Chat from '../models/Chat';
import mongoose from 'mongoose';

const chatbotService = new ChatbotService();

export class ChatbotController {
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatId } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

        // Get AI response
        console.log(`chatbotController: processing message for user=${userId} chatId=${chatId || 'new'} messagePreview=${String(message).slice(0,80)}`);
        const response = await chatbotService.processMessage(message, userId);
        console.log('chatbotController: AI response received summary=', { hasMessage: !!response?.message, source: response?.context?.source ?? 'unknown' });

        // If Mongo is not connected, skip persistence and return the AI response immediately
        if (!(mongoose.connection && mongoose.connection.readyState === 1)) {
          console.warn('chatbotController: MongoDB not connected, skipping chat persistence');
          res.status(200).json({
            message: response.message,
            context: response.context,
            suggestions: response.suggestions,
            chatId: null,
            chatName: null
          });
          return;
        }

        // Find or create chat (Mongo is connected)
        let chat;
        if (chatId) {
          chat = await Chat.findOne({ _id: chatId, userId });
        }

        if (!chat) {
          // Create new chat
          chat = new Chat({
            userId,
            name: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            messages: []
          });
        }

        // Add user message and assistant message
        chat.messages.push({ role: 'user', content: message, timestamp: new Date() });
        chat.messages.push({ role: 'assistant', content: response.message, timestamp: new Date() });

        chat.updatedAt = new Date();
        try {
          await chat.save();
        } catch (saveErr) {
          console.error('chatbotController: failed to save chat, returning AI response anyway', saveErr);
          res.status(200).json({
            message: response.message,
            context: response.context,
            suggestions: response.suggestions,
            chatId: null,
            chatName: null
          });
          return;
        }

        res.status(200).json({
          message: response.message,
          context: response.context,
          suggestions: response.suggestions,
          chatId: chat._id,
          chatName: chat.name
        });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        message: error.message 
      });
    }
  }

  static async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const chats = await Chat.find({ userId })
        .sort({ updatedAt: -1 })
        .select('_id name createdAt updatedAt')
        .lean();

      res.status(200).json(chats);
    } catch (error: any) {
      console.error('Failed to get chat history:', error);
      res.status(500).json({ 
        error: 'Failed to get chat history',
        message: error.message 
      });
    }
  }

  static async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const chat = await Chat.findOne({ _id: chatId, userId });
      
      if (!chat) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }

      res.status(200).json(chat.messages);
    } catch (error: any) {
      console.error('Failed to get chat messages:', error);
      res.status(500).json({ 
        error: 'Failed to get chat messages',
        message: error.message 
      });
    }
  }

  static async deleteChat(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await Chat.deleteOne({ _id: chatId, userId });
      
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error: any) {
      console.error('Failed to delete chat:', error);
      res.status(500).json({ 
        error: 'Failed to delete chat',
        message: error.message 
      });
    }
  }

  static async updateChatName(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params;
      const { name } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        { name },
        { new: true }
      );
      
      if (!chat) {
        res.status(404).json({ error: 'Chat not found' });
        return;
      }

      res.status(200).json(chat);
    } catch (error: any) {
      console.error('Failed to update chat name:', error);
      res.status(500).json({ 
        error: 'Failed to update chat name',
        message: error.message 
      });
    }
  }
}