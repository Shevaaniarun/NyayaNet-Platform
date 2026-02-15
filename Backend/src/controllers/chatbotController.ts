import { Request, Response } from 'express';
import { ChatbotService } from '../services/chatbotService';
import { AuthRequest } from '../middleware/auth';

const chatbotService = new ChatbotService();

export class ChatbotController {
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const response = await chatbotService.processMessage(message, userId);

      res.status(200).json({
        message: response.message,
        context: response.context,
        suggestions: response.suggestions
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

      // In a real implementation, you would fetch from database
      res.status(200).json([]);
    } catch (error: any) {
      console.error('Failed to get chat history:', error);
      res.status(500).json({ 
        error: 'Failed to get chat history',
        message: error.message 
      });
    }
  }
}
