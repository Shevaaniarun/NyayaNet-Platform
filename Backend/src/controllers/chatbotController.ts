import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService';
import { AuthRequest } from '../middleware/auth';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const chatbotService = new ChatbotService();

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; 
}

export class ChatbotController {
  // In-memory fallback store (userId => chats[])
  private static inMemoryChats: Map<string, any[]> = new Map();

  // Ensure table exists method - guarded for missing pool
  private static async ensureTableExists(): Promise<void> {
    if (!pool || typeof pool.query !== 'function') {
      console.warn('⚠️ DB pool unavailable — using in-memory chat store');
      return;
    }
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chats (
          id UUID PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          messages JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
        CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at);
      `);

      console.log('✅ Chats table ready');
    } catch (error) {
      console.error('❌ Failed to ensure chats table exists:', error);
      throw error;
    }
  }

  // Helper: in-memory operations
  private static inMemoryGetChats(userId: string) {
    return this.inMemoryChats.get(userId) || [];
  }

  private static inMemorySaveChats(userId: string, chats: any[]) {
    this.inMemoryChats.set(userId, chats);
  }

  private static inMemoryCreateChat(userId: string, name: string, initialMessages: Message[]) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const chat = { id, user_id: userId, name, messages: initialMessages, created_at: now, updated_at: now };
    const chats = this.inMemoryGetChats(userId);
    chats.unshift(chat); // keep most recent first
    this.inMemorySaveChats(userId, chats);
    return chat;
  }

  private static inMemoryFindChat(userId: string, chatId: string) {
    const chats = this.inMemoryGetChats(userId);
    return chats.find(c => c.id === chatId);
  }

  private static inMemoryUpdateMessages(userId: string, chatId: string, messages: Message[]) {
    const chats = this.inMemoryGetChats(userId);
    const idx = chats.findIndex(c => c.id === chatId);
    if (idx !== -1) {
      chats[idx].messages = messages;
      chats[idx].updated_at = new Date().toISOString();
      this.inMemorySaveChats(userId, chats);
      return true;
    }
    return false;
  }

  private static inMemoryDeleteChat(userId: string, chatId: string) {
    const chats = this.inMemoryGetChats(userId).filter(c => c.id !== chatId);
    this.inMemorySaveChats(userId, chats);
    return true;
  }

  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatId } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      console.log('📝 Chat request:', { message: message?.substring(0, 50), chatId, userId });

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      if (!userId) {
        console.log('❌ No userId found in request');
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get AI response
      console.log(`🤖 Getting AI response for user=${userId}`);
      let response: any;
      try {
        response = await chatbotService.processMessage(message, userId);
        console.log('✅ AI response received');
      } catch (aiError) {
        console.error('❌ AI Service error:', aiError);
        response = {
          message: "I'm here to help with legal questions. Could you please rephrase your question?",
          context: { source: 'fallback' },
          suggestions: ["What is Article 21?", "Difference between civil and criminal law?", "What are fundamental rights?"]
        };
      }

      // Ensure chats table exists (no-op if pool unavailable)
      try {
        await ChatbotController.ensureTableExists();
      } catch (err) {
        console.warn('ensureTableExists failed, continuing with fallback if needed');
      }

      let chatId_to_use = chatId;
      let chatName = '';

      try {
        // If no chatId, create new chat
        if (!chatId_to_use) {
          console.log('🆕 Creating new chat');
          const newChatId = uuidv4();
          const chatNameToUse = message.substring(0, 50) + (message.length > 50 ? '...' : '');

          const initialMessages: Message[] = [{
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
          }];

          if (pool && typeof pool.query === 'function') {
            const insertResult = await pool.query(
              `INSERT INTO chats (id, user_id, name, messages, created_at, updated_at) 
               VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW()) 
               RETURNING id, name`,
              [newChatId, userId, chatNameToUse, JSON.stringify(initialMessages)]
            );
            chatId_to_use = newChatId;
            chatName = insertResult.rows[0]?.name || chatNameToUse;
            console.log('✅ New chat created (DB):', chatId_to_use);
          } else {
            const chat = ChatbotController.inMemoryCreateChat(userId, chatNameToUse, initialMessages);
            chatId_to_use = chat.id;
            chatName = chat.name;
            console.log('✅ New chat created (in-memory):', chatId_to_use);
          }
        } else {
          console.log('📂 Using existing chat:', chatId_to_use);
          // Get existing chat
          if (pool && typeof pool.query === 'function') {
            const chatResult = await pool.query(
              'SELECT name, messages FROM chats WHERE id = $1 AND user_id = $2',
              [chatId_to_use, userId]
            );

            if (chatResult.rows.length > 0) {
              chatName = chatResult.rows[0].name;
              const currentMessages = chatResult.rows[0].messages || [];

              // Add user message
              const updatedMessages = [
                ...currentMessages,
                { role: 'user', content: message, timestamp: new Date().toISOString() }
              ];

              await pool.query(
                `UPDATE chats 
                 SET messages = $1::jsonb, updated_at = NOW() 
                 WHERE id = $2 AND user_id = $3`,
                [JSON.stringify(updatedMessages), chatId_to_use, userId]
              );
              console.log('✅ User message added to chat (DB)');
            } else {
              console.log('⚠️ Chat not found in DB, creating new one');
              const newChatId = uuidv4();
              const chatNameToUse = message.substring(0, 50) + (message.length > 50 ? '...' : '');
              const initialMessages: Message[] = [{
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
              }];
              const insertResult = await pool.query(
                `INSERT INTO chats (id, user_id, name, messages, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW()) 
                 RETURNING id, name`,
                [newChatId, userId, chatNameToUse, JSON.stringify(initialMessages)]
              );
              chatId_to_use = newChatId;
              chatName = insertResult.rows[0]?.name || chatNameToUse;
            }
          } else {
            // In-memory path
            const existing = ChatbotController.inMemoryFindChat(userId, chatId_to_use);
            if (existing) {
              chatName = existing.name;
              const updatedMessages = [
                ...existing.messages,
                { role: 'user', content: message, timestamp: new Date().toISOString() }
              ];
              ChatbotController.inMemoryUpdateMessages(userId, chatId_to_use, updatedMessages);
              console.log('✅ User message added to chat (in-memory)');
            } else {
              console.log('⚠️ Chat not found (in-memory), creating new one');
              const chatNameToUse = message.substring(0, 50) + (message.length > 50 ? '...' : '');
              const initialMessages: Message[] = [{
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
              }];
              const chat = ChatbotController.inMemoryCreateChat(userId, chatNameToUse, initialMessages);
              chatId_to_use = chat.id;
              chatName = chat.name;
            }
          }
        }

        // Add assistant message
        console.log('💬 Adding assistant response to chat');
        if (pool && typeof pool.query === 'function') {
          const messagesResult = await pool.query(
            'SELECT messages FROM chats WHERE id = $1 AND user_id = $2',
            [chatId_to_use, userId]
          );

          const currentMessages = messagesResult.rows[0]?.messages || [];
          const updatedMessages = [
            ...currentMessages,
            { role: 'assistant', content: response.message, timestamp: new Date().toISOString() }
          ];

          await pool.query(
            `UPDATE chats 
             SET messages = $1::jsonb, updated_at = NOW() 
             WHERE id = $2 AND user_id = $3`,
            [JSON.stringify(updatedMessages), chatId_to_use, userId]
          );
          console.log('✅ Assistant message added to chat (DB)');
        } else {
          const existing = ChatbotController.inMemoryFindChat(userId, chatId_to_use);
          const currentMessages = existing?.messages || [];
          const updatedMessages = [
            ...currentMessages,
            { role: 'assistant', content: response.message, timestamp: new Date().toISOString() }
          ];
          if (existing) {
            ChatbotController.inMemoryUpdateMessages(userId, chatId_to_use, updatedMessages);
          } else {
            // create new chat with assistant message if somehow missing
            const chatNameToUse = message.substring(0, 50) + (message.length > 50 ? '...' : '');
            ChatbotController.inMemoryCreateChat(userId, chatNameToUse, updatedMessages);
            chatName = chatName || chatNameToUse;
          }
          console.log('✅ Assistant message added to chat (in-memory)');
        }

      } catch (dbError) {
        console.error('❌ Database operation failed (handled):', dbError);
      }

      res.status(200).json({
        message: response.message,
        context: response.context,
        suggestions: response.suggestions,
        chatId: chatId_to_use,
        chatName: chatName
      });

    } catch (error: any) {
      console.error('🔥 CRITICAL ERROR in chat:', error);
      console.error('Error stack:', error.stack);
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

      console.log('📋 Fetching chat history for user:', userId);

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      try {
        await ChatbotController.ensureTableExists();
      } catch (err) {
        console.warn('ensureTableExists failed in getChatHistory, continuing with fallback');
      }

      if (pool && typeof pool.query === 'function') {
        const result = await pool.query(
          'SELECT id, name, created_at, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
          [userId]
        );

        console.log(`✅ Found ${result.rows.length} chats for user`);

        const chats = result.rows.map(row => ({
          _id: row.id,
          name: row.name,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));

        res.status(200).json(chats);
        return;
      }

      // Fallback: in-memory
      const chats = ChatbotController.inMemoryGetChats(userId).map((c: any) => ({
        _id: c.id,
        name: c.name,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));
      console.log(`ℹ️ Returning ${chats.length} in-memory chats`);
      res.status(200).json(chats);

    } catch (error: any) {
      console.error('❌ Failed to get chat history:', error);
      console.error('Error stack:', error.stack);
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

      console.log('💬 Fetching messages for chat:', chatId, 'user:', userId);

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (pool && typeof pool.query === 'function') {
        const result = await pool.query(
          'SELECT messages FROM chats WHERE id = $1 AND user_id = $2',
          [chatId, userId]
        );

        if (result.rows.length === 0) {
          // fallback to in-memory if DB has no row
          const inMemory = ChatbotController.inMemoryFindChat(userId, chatId);
          if (!inMemory) {
            console.log('❌ Chat not found:', chatId);
            res.status(404).json({ error: 'Chat not found' });
            return;
          }
          const messages = (inMemory.messages || []).map((msg: any, index: number) => ({
            id: `${chatId}-${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }));
          console.log(`✅ Found ${messages.length} messages (in-memory fallback)`);
          res.status(200).json(messages);
          return;
        }

        const messages = result.rows[0].messages.map((msg: any, index: number) => ({
          id: `${chatId}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));

        console.log(`✅ Found ${messages.length} messages`);
        res.status(200).json(messages);
        return;
      }

      // In-memory only path
      const chat = ChatbotController.inMemoryFindChat(userId, chatId);
      if (!chat) {
        console.log('❌ Chat not found (in-memory):', chatId);
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      const messages = (chat.messages || []).map((msg: any, index: number) => ({
        id: `${chatId}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      console.log(`✅ Found ${messages.length} messages (in-memory)`);
      res.status(200).json(messages);
    } catch (error: any) {
      console.error('❌ Failed to get chat messages:', error);
      console.error('Error stack:', error.stack);
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

      console.log('🗑️ Deleting chat:', chatId, 'for user:', userId);

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (pool && typeof pool.query === 'function') {
        const result = await pool.query(
          'DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING id',
          [chatId, userId]
        );

        if (result.rows.length === 0) {
          // attempt in-memory delete
          const inMemory = ChatbotController.inMemoryFindChat(userId, chatId);
          if (!inMemory) {
            console.log('❌ Chat not found for deletion');
            res.status(404).json({ error: 'Chat not found' });
            return;
          }
          ChatbotController.inMemoryDeleteChat(userId, chatId);
          console.log('✅ Chat deleted successfully (in-memory fallback)');
          res.status(200).json({ message: 'Chat deleted successfully' });
          return;
        }

        console.log('✅ Chat deleted successfully (DB)');
        res.status(200).json({ message: 'Chat deleted successfully' });
        return;
      }

      // In-memory delete
      const inMemory = ChatbotController.inMemoryFindChat(userId, chatId);
      if (!inMemory) {
        console.log('❌ Chat not found for deletion (in-memory)');
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      ChatbotController.inMemoryDeleteChat(userId, chatId);
      console.log('✅ Chat deleted successfully (in-memory)');
      res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error: any) {
      console.error('❌ Failed to delete chat:', error);
      console.error('Error stack:', error.stack);
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

      console.log('✏️ Updating chat name:', chatId, 'to:', name);

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Name is required' });
        return;
      }

      if (pool && typeof pool.query === 'function') {
        const result = await pool.query(
          'UPDATE chats SET name = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
          [name, chatId, userId]
        );

        if (result.rows.length === 0) {
          // try in-memory rename if DB didn't find it
          const inMemory = ChatbotController.inMemoryFindChat(userId, chatId);
          if (!inMemory) {
            console.log('❌ Chat not found for rename');
            res.status(404).json({ error: 'Chat not found' });
            return;
          }
          inMemory.name = name;
          inMemory.updated_at = new Date().toISOString();
          res.status(200).json({
            id: inMemory.id,
            name: inMemory.name,
            createdAt: inMemory.created_at,
            updatedAt: inMemory.updated_at
          });
          return;
        }

        console.log('✅ Chat renamed successfully (DB)');
        res.status(200).json({
          id: result.rows[0].id,
          name: result.rows[0].name,
          createdAt: result.rows[0].created_at,
          updatedAt: result.rows[0].updated_at
        });
        return;
      }

      // In-memory rename path (when DB unavailable)
      const inMemory = ChatbotController.inMemoryFindChat(userId, chatId);
      if (!inMemory) {
        console.log('❌ Chat not found for rename (in-memory)');
        res.status(404).json({ error: 'Chat not found' });
        return;
      }
      inMemory.name = name;
      inMemory.updated_at = new Date().toISOString();
      res.status(200).json({
        id: inMemory.id,
        name: inMemory.name,
        createdAt: inMemory.created_at,
        updatedAt: inMemory.updated_at
      });
    } catch (error: any) {
      console.error('❌ Failed to update chat name:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        error: 'Failed to update chat name',
        message: error.message
      });
    }
  }
}