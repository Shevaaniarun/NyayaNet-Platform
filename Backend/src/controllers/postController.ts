import { Request, Response } from 'express';
import { PostModel, CreatePostInput } from '../models/Post';

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export class PostController {
    static async createPost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const { content, title, postType, tags, isPublic } = req.body;

            if (!content || content.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Post content is required' });
            }

            const postData: CreatePostInput = {
                content: content.trim(),
                title: title?.trim() || undefined,
                postType: postType || 'POST',
                tags: tags || [],
                isPublic: isPublic !== false
            };

            const post = await PostModel.create(userId, postData);

            return res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: { post }
            });
        } catch (error: any) {
            console.error('Error creating post:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating post',
                error: error.message
            });
        }
    }

    static async getPost(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const requesterId = (req as AuthRequest).user?.id;

            const post = await PostModel.findById(postId, requesterId);

            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            return res.json({ success: true, data: { post } });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching post',
                error: error.message
            });
        }
    }

    static async updatePost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const { postId } = req.params;
            const post = await PostModel.update(postId, userId, req.body);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found or you do not have permission to edit it'
                });
            }

            return res.json({
                success: true,
                message: 'Post updated successfully',
                data: { post }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error updating post',
                error: error.message
            });
        }
    }

    static async deletePost(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const { postId } = req.params;
            const deleted = await PostModel.delete(postId, userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found or you do not have permission to delete it'
                });
            }

            return res.json({ success: true, message: 'Post deleted successfully' });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting post',
                error: error.message
            });
        }
    }

    static async getFeed(req: Request, res: Response) {
        try {
            const { page = '1', limit = '20' } = req.query;
            const result = await PostModel.getFeed(
                parseInt(page as string),
                parseInt(limit as string)
            );

            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching feed',
                error: error.message
            });
        }
    }
}
