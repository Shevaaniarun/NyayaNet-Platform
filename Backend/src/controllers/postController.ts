import { Request, Response } from 'express';
import { PostModel } from '../models/Post';

interface AuthRequest extends Request {
    user?: { userId: string; role: string };
}

export class PostController {
    static async createPost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

            const { content, postType, tags, isPublic } = req.body;

            if (!content) {
                return res.status(400).json({ success: false, message: 'Content is required' });
            }

            const post = await PostModel.create(userId, {
                userId,
                content,
                postType,
                tags,
                isPublic
            });

            return res.status(201).json({ success: true, data: { post } });
        } catch (error: any) {
            console.error('Create post error:', error);
            return res.status(500).json({ success: false, message: 'Error creating post', error: error.message });
        }
    }

    static async getFeed(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await PostModel.getFeed(page, limit);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            console.error('Get feed error:', error);
            return res.status(500).json({ success: false, message: 'Error fetching feed', error: error.message });
        }
    }

    static async getPostById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const post = await PostModel.findById(id);
            return res.json({ success: true, data: { post } });
        } catch (error: any) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
    }

    static async deletePost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            const { id } = req.params;

            if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

            const success = await PostModel.delete(id, userId);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
            }

            return res.json({ success: true, message: 'Post deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error deleting post', error: error.message });
        }
    }
}
