/**
 * Messages Routes - API endpoints for user messaging
 */

import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { MessagesController } from '../controllers/messagesController';

const router = Router();

// Get all legal experts (lawyers, judges, professors)
router.get('/experts', authenticate, MessagesController.getExperts as RequestHandler);

// Get all conversations for current user
router.get('/conversations', authenticate, MessagesController.getConversations as RequestHandler);

// Get messages with a specific user
router.get('/conversation/:userId', authenticate, MessagesController.getConversationWithUser as RequestHandler);

// Start a new conversation
router.post('/conversation/start', authenticate, MessagesController.startConversation as RequestHandler);

// Send a message
router.post('/send', authenticate, MessagesController.sendMessage as RequestHandler);

// Mark message as read
router.put('/:messageId/read', authenticate, MessagesController.markAsRead as RequestHandler);

// Get unread message count
router.get('/unread/count', authenticate, MessagesController.getUnreadCount as RequestHandler);

// Mark all messages in a conversation as read
router.put('/conversation/:userId/read', authenticate, MessagesController.markConversationAsRead as RequestHandler);

export default router;