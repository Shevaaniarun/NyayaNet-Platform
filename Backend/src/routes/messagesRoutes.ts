/**
 * Messages Routes - API endpoints for user messaging
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MessagesController } from '../controllers/messagesController';

const router = Router();

// Get all legal experts (lawyers, judges, professors)
router.get('/experts', authenticate, MessagesController.getExperts);

// Get all conversations for current user
router.get('/conversations', authenticate, MessagesController.getConversations);

// Get messages with a specific user
router.get('/conversation/:userId', authenticate, MessagesController.getConversationWithUser);

// Start a new conversation
router.post('/conversation/start', authenticate, MessagesController.startConversation);

// Send a message
router.post('/send', authenticate, MessagesController.sendMessage);

// Mark message as read
router.put('/:messageId/read', authenticate, MessagesController.markAsRead);

// Get unread message count
router.get('/unread/count', authenticate, MessagesController.getUnreadCount);

// Mark all messages in a conversation as read
router.put('/conversation/:userId/read', authenticate, MessagesController.markConversationAsRead);

export default router;