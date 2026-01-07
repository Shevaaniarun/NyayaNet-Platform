import { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { AuthRequest } from '../middleware/auth';
import { CreatePostInput } from '../types/postTypes';

export class PostController {
    static async uploadFiles(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const files = authReq.files;
            if (!files || files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }

            const media = files.map((file: any) => ({
                mediaType: file.mimetype.startsWith('image/') ? 'IMAGE' : 'DOCUMENT',
                mediaUrl: `/uploads/${file.filename}`,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype
            }));

            return res.json({ success: true, data: { media } });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error uploading files', error: error.message });
        }
    }

    static async createPost(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

            let { content, title, postType, tags, isPublic, media } = req.body;

            if (!content) {
                return res.status(400).json({ success: false, message: 'Content is required' });
            }

            // Auto-extract hashtags
            const hashtagRegex = /#(\w+)/g;
            const extractedHashtags = content.match(hashtagRegex)?.map((h: string) => h.slice(1)) || [];

            // Merge tags if provided, ensuring uniqueness
            const finalTags = Array.from(new Set([...(tags || []), ...extractedHashtags]));

            const postData: CreatePostInput = {
                content: content.trim(),
                title: title?.trim() || undefined,
                postType: postType || 'POST',
                tags: finalTags,
                isPublic: isPublic !== false,
                media: media || []
            };

            const post = await PostModel.create(userId, postData);

            return res.status(201).json({ success: true, data: { post } });
        } catch (error: any) {
            console.error('Create post error:', error);
            return res.status(500).json({ success: false, message: 'Error creating post', error: error.message });
        }
    }

    static async getPost(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const userId = (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
            const post = await PostModel.findById(postId, userId);

            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            return res.json({ success: true, data: { post } });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error fetching post', error: error.message });
        }
    }

    static async updatePost(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            const { postId } = authReq.params;
            const updates = authReq.body;

            if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

            const post = await PostModel.update(postId, userId, updates);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
            }

            return res.json({ success: true, data: { post } });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error updating post', error: error.message });
        }
    }

    static async deletePost(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            const { postId } = authReq.params;

            if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

            const success = await PostModel.delete(postId, userId);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
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
            const userId = (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
            const result = await PostModel.getFeed(
                parseInt(page as string),
                parseInt(limit as string),
                userId
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

    static async getPosts(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user?.id;
            const filters = req.query as any;

            const result = await PostModel.findAll(filters, userId);

            return res.json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching posts',
                error: error.message
            });
        }
    }

    static async likePost(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { postId } = authReq.params;
            const { reactionType = 'LIKE' } = authReq.body;

            const result = await PostModel.toggleLike(postId, userId, reactionType);

            return res.json({
                success: true,
                message: result.liked ? 'Post reacted' : 'Reaction removed',
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error processing like', error: error.message });
        }
    }

    static async savePost(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { postId } = authReq.params;
            const result = await PostModel.toggleBookmark(postId, userId);

            return res.json({
                success: true,
                message: result.saved ? 'Post saved' : 'Post unsaved',
                data: result
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error processing save', error: error.message });
        }
    }

    static async createComment(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { postId } = authReq.params;
            const { content, parentCommentId } = authReq.body;

            if (!content || !content.trim()) {
                return res.status(400).json({ success: false, message: 'Comment content is required' });
            }

            const comment = await PostModel.addComment(postId, userId, content.trim(), parentCommentId);

            return res.status(201).json({
                success: true,
                message: 'Comment added',
                data: { comment }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error adding comment', error: error.message });
        }
    }

    static async updateComment(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { commentId } = authReq.params;
            const { content } = authReq.body;

            if (!content || !content.trim()) {
                return res.status(400).json({ success: false, message: 'Comment content is required' });
            }

            const comment = await PostModel.updateComment(commentId, userId, content.trim());
            if (!comment) {
                return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
            }

            return res.json({ success: true, message: 'Comment updated', data: { comment } });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error updating comment', error: error.message });
        }
    }

    static async deleteComment(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            const userId = authReq.user?.id || authReq.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { commentId } = authReq.params;

            const success = await PostModel.deleteComment(commentId, userId);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Comment not found or unauthorized' });
            }

            return res.json({ success: true, message: 'Comment deleted' });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error deleting comment', error: error.message });
        }
    }

    static async getComments(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { page = '1', limit = '50' } = req.query;

            const userId = (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
            const comments = await PostModel.getComments(postId, userId, parseInt(page as string), parseInt(limit as string));

            return res.json({
                success: true,
                data: { comments }
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: 'Error fetching comments', error: error.message });
        }
    }
}
