import { Request, Response } from 'express';
import { PostService } from '../services/postServices';

interface AuthRequest extends Request {
  user?: { id: string };
}

export class PostController {
  static async createPost(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await PostService.createPost(req.body, userId);
    res.status(201).json({ success: true, data: post });
  }

  static async getFeed(req: AuthRequest, res: Response) {
    const { page, limit } = req.query;
    const result = await PostService.getFeed(
      { page: Number(page), limit: Number(limit) },
      req.user?.id
    );

    res.json({ success: true, data: result });
  }

  static async toggleLike(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const result = await PostService.toggleLike(req.params.postId, userId);
    res.json({ success: true, data: result });
  }
}
