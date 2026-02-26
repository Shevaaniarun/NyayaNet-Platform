/**
 * Messages Routes - API endpoints for user messaging
 */

import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { MessagesController, uploadMedia } from '../controllers/messagesController';

const router = Router();

// Get all legal experts
router.get('/experts', authenticate, MessagesController.getExperts as RequestHandler);

// --- CONVERSATION APIs ---
// Get all conversations for current user
router.get('/conversations', authenticate, MessagesController.getConversations as RequestHandler);

// Get conversation details
router.get('/conversations/:conversationId', authenticate, MessagesController.getConversationDetails as RequestHandler);

// Start private conversation
router.post('/conversations/private', authenticate, MessagesController.startPrivateConversation as RequestHandler);

// Create group conversation
router.post('/conversations/group', authenticate, MessagesController.createGroup as RequestHandler);

// Delete conversation (soft delete)
router.delete('/conversations/:conversationId', authenticate, MessagesController.deleteConversation as RequestHandler);


// --- MESSAGE APIs ---
// Send a media message
router.post('/send-media', authenticate, uploadMedia.single('file'), MessagesController.sendMedia as RequestHandler);

// Get media data
router.get('/media/:messageId', authenticate, MessagesController.getMedia as RequestHandler);

// Get messages of a conversation (with pagination)
router.get('/:conversationId', authenticate, MessagesController.getMessages as RequestHandler);

// Send a message
router.post('/send', authenticate, MessagesController.sendMessage as RequestHandler);

// Edit message
router.put('/:messageId', authenticate, MessagesController.editMessage as RequestHandler);

// Delete message
router.delete('/:messageId', authenticate, MessagesController.deleteMessage as RequestHandler);


// --- GROUP MANAGEMENT APIs ---
// Add member
router.post('/group/:conversationId/add', authenticate, MessagesController.addMember as RequestHandler);

// Remove member
router.delete('/group/:conversationId/remove/:userId', authenticate, MessagesController.removeMember as RequestHandler);

// Leave group
router.post('/group/:conversationId/leave', authenticate, MessagesController.leaveGroup as RequestHandler);

// Change role
router.put('/group/:conversationId/role', authenticate, MessagesController.changeRole as RequestHandler);


// --- BLOCK USER APIs ---
// Block user
router.post('/block', authenticate, MessagesController.blockUser as RequestHandler);

// Unblock user
router.delete('/block/:userId', authenticate, MessagesController.unblockUser as RequestHandler);

// Get blocked users
router.get('/blocked', authenticate, MessagesController.getBlockedUsers as RequestHandler);


// --- READ RECEIPT APIs ---
// Mark message read
router.post('/read/:messageId', authenticate, MessagesController.markAsRead as RequestHandler);

// Mark conversation read
router.post('/read/conversation/:conversationId', authenticate, MessagesController.markConversationAsRead as RequestHandler);

// Get unread count
router.get('/unread/count', authenticate, MessagesController.getUnreadCount as RequestHandler);


// --- LEGACY / COMPATIBILITY (Temporary) ---
router.get('/conversation/:userId', authenticate, MessagesController.getConversationWithUser as RequestHandler);
router.post('/conversation/start', authenticate, MessagesController.startConversation as RequestHandler);
router.put('/conversation/:userId/read', authenticate, MessagesController.markConversationAsRead as RequestHandler);

export default router;