import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/chatbot/chat
 * @desc Send a message to the AI chatbot
 * @access Private
 */
router.post('/chat', authenticate, ChatbotController.chat);

/**
 * @route GET /api/chatbot/history
 * @desc Get all chats for the current user
 * @access Private
 */
router.get('/history', authenticate, ChatbotController.getChatHistory);

/**
 * @route GET /api/chatbot/chat/:chatId
 * @desc Get messages for a specific chat
 * @access Private
 */
router.get('/chat/:chatId', authenticate, ChatbotController.getChatMessages);

/**
 * @route DELETE /api/chatbot/chat/:chatId
 * @desc Delete a specific chat
 * @access Private
 */
router.delete('/chat/:chatId', authenticate, ChatbotController.deleteChat);

/**
 * @route PUT /api/chatbot/chat/:chatId
 * @desc Update chat name
 * @access Private
 */
router.put('/chat/:chatId', authenticate, ChatbotController.updateChatName);

export default router;