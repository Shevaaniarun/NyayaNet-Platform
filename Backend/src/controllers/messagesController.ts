/**
 * Messages Controller - Handle messaging operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MessagesService } from '../services/messagesService';

const messagesService = new MessagesService();

export class MessagesController {
  /**
   * Get all legal experts (lawyers, judges, professors)
   */
  static async getExperts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const experts = await messagesService.getExperts();
      res.status(200).json(experts);
    } catch (error: any) {
      console.error('Error fetching experts:', error);
      res.status(500).json({ error: 'Failed to fetch experts' });
    }
  }

  /**
   * Get all conversations for current user
   */
  static async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const conversations = await messagesService.getConversations(userId);
      res.status(200).json(conversations);
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  }

  /**
   * Get messages with a specific user
   */
  static async getConversationWithUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const otherUserId = req.params.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!otherUserId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const messages = await messagesService.getConversationWithUser(userId, otherUserId);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderId = req.user?.id || req.user?.userId;
      const { recipientId, message, messageType = 'TEXT', mediaUrl = null } = req.body;

      if (!senderId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!recipientId || !message) {
        res.status(400).json({ error: 'Recipient ID and message are required' });
        return;
      }

      // For now, only text messages are implemented
      const newMessage = await messagesService.sendMessage(senderId, recipientId, message);
      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const messageId = req.params.messageId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!messageId) {
        res.status(400).json({ error: 'Message ID is required' });
        return;
      }

      await messagesService.markAsRead(messageId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const count = await messagesService.getUnreadCount(userId);
      res.status(200).json({ count });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  /**
   * Start a new conversation with a user
   */
  static async startConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { otherUserId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!otherUserId) {
        res.status(400).json({ error: 'Other user ID is required' });
        return;
      }

      if (userId === otherUserId) {
        res.status(400).json({ error: 'Cannot start conversation with yourself' });
        return;
      }

      // This will get or create the conversation
      const conversationId = await messagesService.getOrCreateConversation(userId, otherUserId);
      
      // Get initial messages (empty or existing)
      const messages = await messagesService.getConversationWithUser(userId, otherUserId);
      
      res.status(200).json({
        conversationId,
        messages
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  }

  /**
 * Mark all messages in a conversation as read
 */
static async markConversationAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.user?.userId;
    const otherUserId = req.params.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!otherUserId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Get conversation ID
    const conversationId = await messagesService.getOrCreateConversation(userId, otherUserId);
    
    // Update last read time
    await messagesService.updateLastRead(userId, conversationId);
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
}
}