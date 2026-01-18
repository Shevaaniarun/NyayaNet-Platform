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
 * @desc Get chat history for the current user
 * @access Private
 */
router.get('/history', authenticate, ChatbotController.getChatHistory);

export default router;
