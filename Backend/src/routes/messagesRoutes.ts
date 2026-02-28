/**
 * Messages Routes - API endpoints for user messaging
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MessagesController, uploadMedia } from '../controllers/messagesController';

const router = Router();

// Get all legal experts
router.get('/experts', authenticate, MessagesController.getExperts);

// --- CONVERSATION APIs ---
// Get all conversations for current user
router.get('/conversations', authenticate, MessagesController.getConversations);

// Get conversation details
router.get('/conversations/:conversationId', authenticate, MessagesController.getConversationDetails);

// Start private conversation
router.post('/conversations/private', authenticate, MessagesController.startPrivateConversation);

// Create group conversation
router.post('/conversations/group', authenticate, MessagesController.createGroup);

// Delete conversation (soft delete)
router.delete('/conversations/:conversationId', authenticate, MessagesController.deleteConversation);


// --- BLOCK USER APIs --- (Must be ABOVE /:conversationId to avoid wildcard match)
// Get blocked users
router.get('/blocked', authenticate, MessagesController.getBlockedUsers);

// Block user
router.post('/block', authenticate, MessagesController.blockUser);

// Unblock user
router.delete('/block/:userId', authenticate, MessagesController.unblockUser);


// --- MESSAGE APIs ---
// Send a media message
router.post('/send-media', authenticate, uploadMedia.single('file'), MessagesController.sendMedia);

// Get media data
router.get('/media/:messageId', authenticate, MessagesController.getMedia);

// Get messages of a conversation (with pagination)
router.get('/:conversationId', authenticate, MessagesController.getMessages);

// Send a message
router.post('/send', authenticate, MessagesController.sendMessage);

// Edit message
router.put('/:messageId', authenticate, MessagesController.editMessage);

// Delete message
router.delete('/:messageId', authenticate, MessagesController.deleteMessage);


// --- GROUP MANAGEMENT APIs ---
// Add member
router.post('/group/:conversationId/add', authenticate, MessagesController.addMember);

// Remove member
router.delete('/group/:conversationId/remove/:userId', authenticate, MessagesController.removeMember);

// Leave group
router.post('/group/:conversationId/leave', authenticate, MessagesController.leaveGroup);

// Change role
router.put('/group/:conversationId/role', authenticate, MessagesController.changeRole);


// --- READ RECEIPT APIs ---
// Mark message read
router.post('/read/:messageId', authenticate, MessagesController.markAsRead);

// Mark conversation read
router.post('/read/conversation/:conversationId', authenticate, MessagesController.markConversationAsRead);

// Get unread count
router.get('/unread/count', authenticate, MessagesController.getUnreadCount);


// --- LEGACY / COMPATIBILITY (Temporary) ---
router.get('/conversation/:userId', authenticate, MessagesController.getConversationWithUser);
router.post('/conversation/start', authenticate, MessagesController.startConversation);
router.put('/conversation/:userId/read', authenticate, MessagesController.markConversationAsRead);

export default router;