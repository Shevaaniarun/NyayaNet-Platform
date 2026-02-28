/**
 * Messages Controller - Handle messaging operations
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MessagesService } from '../services/messagesService';
import { UserBlockService } from '../services/userBlockService';
import { NotificationModel } from '../models/Notification';
import pool from '../config/database';
import multer from 'multer';

const messagesService = new MessagesService();
const userBlockService = new UserBlockService();

// Configure multer for memory storage (for BYTEA)
const storage = multer.memoryStorage();
export const uploadMedia = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export class MessagesController {
  /**
   * Get all legal experts
   */
  static async getExperts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const experts = await messagesService.getExperts(userId);
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
   * Get conversation details
   */
  static async getConversationDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const isMember = await messagesService.isMember(userId, conversationId);
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this conversation' });
        return;
      }

      const details = await messagesService.getConversationDetails(conversationId, userId);
      if (!details) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      res.status(200).json(details);
    } catch (error: any) {
      console.error('Error fetching conversation details:', error);
      res.status(500).json({ error: 'Failed to fetch conversation details' });
    }
  }

  /**
   * Start or get a private conversation
   */
  static async startPrivateConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { userId: otherUserId } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!otherUserId) {
        res.status(400).json({ error: 'Target User ID is required' });
        return;
      }

      const conversationId = await messagesService.getOrCreateConversation(userId, otherUserId);
      res.status(200).json({ conversationId });
    } catch (error: any) {
      console.error('Error starting private conversation:', error);
      res.status(500).json({ error: 'Failed to start private conversation' });
    }
  }

  /**
   * Create a group conversation
   */
  static async createGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { title, memberIds = [] } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const members = Array.isArray(memberIds) ? memberIds : [];
      const conversationId = await messagesService.createGroup(userId, title, members);
      res.status(201).json({ conversationId });
    } catch (error: any) {
      console.error('Error creating group:', error);
      res.status(500).json({ error: 'Failed to create group' });
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const isMember = await messagesService.isMember(userId, conversationId);
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this conversation' });
        return;
      }

      const messages = await messagesService.getMessages(conversationId, page, limit);

      // Update last read
      await messagesService.markConversationAsRead(userId, conversationId);

      res.status(200).json(messages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderId = req.user?.id || req.user?.userId;
      const { conversationId, content, messageType = 'TEXT' } = req.body;

      if (!senderId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!conversationId || !content) {
        res.status(400).json({ error: 'conversationId and content are required' });
        return;
      }

      const isMember = await messagesService.isMember(senderId, conversationId);
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this conversation' });
        return;
      }

      const isBlocked = await userBlockService.isBlockedInConversation(senderId, conversationId);
      if (isBlocked) {
        res.status(403).json({ error: 'Messaging blocked by a participant' });
        return;
      }

      const newMessage = await messagesService.sendMessage(senderId, conversationId, content, messageType);
      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  /**
   * Block a user
   */
  static async blockUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const blockerId = req.user?.id || req.user?.userId;
      const { userId: blockedId } = req.body;

      if (!blockerId || !blockedId) {
        res.status(400).json({ error: 'User ID to block is required' });
        return;
      }

      await userBlockService.blockUser(blockerId, blockedId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      res.status(500).json({ error: 'Failed' });
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const blockerId = req.user?.id || req.user?.userId;
      const { userId: blockedId } = req.params;

      if (!blockerId || !blockedId) {
        res.status(400).json({ error: 'User ID to unblock is required' });
        return;
      }

      await userBlockService.unblockUser(blockerId, blockedId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      res.status(500).json({ error: 'Failed' });
    }
  }

  /**
   * Get blocked users
   */
  static async getBlockedUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const blockedUsers = await userBlockService.getBlockedUsers(userId!);
      res.status(200).json(blockedUsers);
    } catch (error: any) {
      console.error('Error fetching blocked users:', error);
      res.status(500).json({ error: 'Failed' });
    }
  }


  /**
   * Send a media message
   */
  static async sendMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderId = req.user?.id || req.user?.userId;
      const { conversationId, content, messageType } = req.body;
      const file = req.file;

      if (!senderId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!conversationId || !file || !messageType) {
        res.status(400).json({ error: 'conversationId, file, and messageType are required' });
        return;
      }

      const isMember = await messagesService.isMember(senderId, conversationId);
      if (!isMember) {
        res.status(403).json({ error: 'Not a member of this conversation' });
        return;
      }

      const isBlocked = await userBlockService.isBlockedInConversation(senderId, conversationId);
      if (isBlocked) {
        res.status(403).json({ error: 'Messaging blocked by a participant' });
        return;
      }

      const newMessage = await messagesService.sendMedia(
        senderId,
        conversationId,
        content || null,
        messageType as 'IMAGE' | 'PDF',
        file.buffer,
        file.mimetype,
        file.originalname,
        file.size
      );

      res.status(201).json(newMessage);
    } catch (error: any) {
      console.error('Error sending media:', error);
      res.status(500).json({ error: 'Failed to send media' });
    }
  }

  /**
   * Get media data
   */
  static async getMedia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const media = await messagesService.getMedia(messageId);

      if (!media) {
        res.status(404).json({ error: 'Media not found' });
        return;
      }

      res.set({
        'Content-Type': media.mime_type,
        'Content-Disposition': `inline; filename="${media.file_name}"`,
        'Cache-Control': 'public, max-age=31536000'
      });

      res.send(media.data);
    } catch (error: any) {
      console.error('Error fetching media:', error);
      res.status(500).json({ error: 'Failed' });
    }
  }

  /**
   * Edit a message
   */
  static async editMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { messageId } = req.params;
      const { content } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const updatedMessage = await messagesService.editMessage(messageId, userId, content);
      res.status(200).json(updatedMessage);
    } catch (error: any) {
      console.error('Error editing message:', error);
      res.status(500).json({ error: error.message || 'Failed to edit message' });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { messageId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await messagesService.deleteMessage(messageId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }

  /**
   * Delete a conversation
   */
  static async deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await messagesService.deleteConversation(conversationId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      res.status(500).json({ error: 'Failed to delete conversation' });
    }
  }

  /**
   * Add a member to a group
   */
  static async addMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;
      const { userId } = req.body;

      if (!adminId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const adminRole = await messagesService.getUserRole(adminId, conversationId);
      if (adminRole !== 'OWNER' && adminRole !== 'ADMIN') {
        res.status(403).json({ error: 'Only admins or owners can add members' });
        return;
      }

      await messagesService.addMember(conversationId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error adding member:', error);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }

  /**
   * Remove a member from a group
   */
  static async removeMember(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user?.id || req.user?.userId;
      const { conversationId, userId } = req.params;

      if (!adminId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const adminRole = await messagesService.getUserRole(adminId, conversationId);
      if (adminRole !== 'OWNER' && adminRole !== 'ADMIN') {
        res.status(403).json({ error: 'Only admins or owners can remove members' });
        return;
      }

      await messagesService.removeMember(conversationId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error removing member:', error);
      res.status(500).json({ error: 'Failed to remove member' });
    }
  }

  /**
   * User leaves a group
   */
  static async leaveGroup(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await messagesService.leaveGroup(conversationId, userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error leaving group:', error);
      res.status(500).json({ error: 'Failed to leave group' });
    }
  }

  /**
   * Change a member's role
   */
  static async changeRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const adminId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;
      const { userId, role } = req.body;

      if (!adminId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const adminRole = await messagesService.getUserRole(adminId, conversationId);
      if (adminRole !== 'OWNER' && adminRole !== 'ADMIN') {
        res.status(403).json({ error: 'Only admins or owners can change roles' });
        return;
      }

      await messagesService.changeRole(conversationId, userId, role);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error changing role:', error);
      res.status(500).json({ error: 'Failed to change role' });
    }
  }

  /**
   * Mark conversation as read
   */
  static async markConversationAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { conversationId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      await messagesService.markConversationAsRead(userId, conversationId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Error marking conversation read:', error);
      res.status(500).json({ error: 'Failed' });
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { messageId } = req.params;
      await messagesService.markAsRead(messageId, userId!);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const count = await messagesService.getUnreadCount(userId!);
      res.status(200).json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }

  // LEGACY: Keeping this for temporary frontend compatibility if needed
  static async getConversationWithUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const otherUserId = req.params.userId;
      const messages = await messagesService.getConversationWithUser(userId!, otherUserId);
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }

  // LEGACY: Start conversation with user
  static async startConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { otherUserId } = req.body;
      const conversationId = await messagesService.getOrCreateConversation(userId!, otherUserId);
      const messages = await messagesService.getMessages(conversationId, 1, 50);
      res.status(200).json({ conversationId, messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed' });
    }
  }
}
