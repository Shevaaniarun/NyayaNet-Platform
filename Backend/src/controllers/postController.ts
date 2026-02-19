import { Request, Response } from "express";
import { PostModel } from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { CreatePostInput, PostMediaInput } from "../types/postTypes";
import pool from "../config/database";
import { NotificationModel } from "../models/Notification";

export class PostController {
  /**
   * Upload files — reads file buffers from multer memoryStorage,
   * stores them directly in the database as BYTEA, and returns media IDs.
   */
  static async uploadFiles(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });

      const files = authReq.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No files uploaded" });
      }

      // Build media array with binary data from memory buffers
      const media: PostMediaInput[] = files.map((file) => ({
        mediaType: file.mimetype.startsWith("image/") ? "IMAGE" as const
          : file.mimetype === "application/pdf" ? "PDF" as const
            : "DOCUMENT" as const,
        mediaData: file.buffer,
        mediaMimeType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
      }));

      return res.json({ success: true, data: { media } });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error uploading files",
        error: error.message,
      });
    }
  }

  /**
   * Serve media binary data from DB by media ID.
   * GET /api/posts/media/:mediaId
   */
  static async getMedia(req: Request, res: Response) {
    try {
      const { mediaId } = req.params;

      const mediaData = await PostModel.getMediaData(mediaId);
      if (!mediaData) {
        return res.status(404).json({ success: false, message: "Media not found" });
      }

      // Set appropriate headers
      res.set('Content-Type', mediaData.mediaMimeType);
      res.set('Content-Disposition', `inline; filename="${mediaData.fileName || 'file'}"`);
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24h

      return res.send(mediaData.mediaData);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching media",
        error: error.message,
      });
    }
  }

  static async createPost(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });

      let { content, title, postType, tags, isPublic, media } = req.body;

      if (!content) {
        return res
          .status(400)
          .json({ success: false, message: "Content is required" });
      }

      const hashtagRegex = /#(\w+)/g;
      const extractedHashtags =
        content.match(hashtagRegex)?.map((h: string) => h.slice(1)) || [];

      const finalTags = Array.from(
        new Set([...(tags || []), ...extractedHashtags]),
      );

      // Convert base64 media data back to Buffers if sent via JSON
      const processedMedia: PostMediaInput[] = (media || []).map((m: any) => ({
        mediaType: m.mediaType,
        mediaData: m.mediaData ? (typeof m.mediaData === 'string' ? Buffer.from(m.mediaData, 'base64') : m.mediaData) : Buffer.alloc(0),
        mediaMimeType: m.mediaMimeType || m.mimeType || 'application/octet-stream',
        fileName: m.fileName || 'unnamed',
        fileSize: m.fileSize || 0,
      }));

      const postData: CreatePostInput = {
        content: content.trim(),
        title: title?.trim() || undefined,
        postType: postType || "POST",
        tags: finalTags,
        isPublic: isPublic !== false,
        media: processedMedia,
      };

      const post = await PostModel.create(userId, postData);

      return res.status(201).json({ success: true, data: { post } });
    } catch (error: any) {
      console.error("Create post error:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating post",
        error: error.message,
      });
    }
  }

  /**
   * Create a post with files uploaded via multipart form data.
   * POST /api/posts/with-media (multipart)
   */
  static async createPostWithMedia(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });

      const { content, title, postType, tags, isPublic } = req.body;
      const files = (authReq.files as Express.Multer.File[]) || [];

      if (!content && files.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Content or files required" });
      }

      // Extract hashtags
      const hashtagRegex = /#(\w+)/g;
      const extractedHashtags =
        (content || '').match(hashtagRegex)?.map((h: string) => h.slice(1)) || [];

      let parsedTags: string[] = [];
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }

      const finalTags = Array.from(
        new Set([...parsedTags, ...extractedHashtags]),
      );

      // Build media from uploaded files
      const media: PostMediaInput[] = files.map((file) => ({
        mediaType: file.mimetype.startsWith("image/") ? "IMAGE" as const
          : file.mimetype === "application/pdf" ? "PDF" as const
            : "DOCUMENT" as const,
        mediaData: file.buffer,
        mediaMimeType: file.mimetype,
        fileName: file.originalname,
        fileSize: file.size,
      }));

      const postData: CreatePostInput = {
        content: (content || '').trim(),
        title: title?.trim() || undefined,
        postType: postType || "POST",
        tags: finalTags,
        isPublic: isPublic !== 'false' && isPublic !== false,
        media,
      };

      const post = await PostModel.create(userId, postData);

      return res.status(201).json({ success: true, data: { post } });
    } catch (error: any) {
      console.error("Create post with media error:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating post",
        error: error.message,
      });
    }
  }

  static async getPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const userId =
        (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
      const post = await PostModel.findById(postId, userId);

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      return res.json({ success: true, data: { post } });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching post",
        error: error.message,
      });
    }
  }

  static async updatePost(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      const { postId } = authReq.params;
      const updates = authReq.body;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });

      const post = await PostModel.update(postId, userId, updates);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found or unauthorized" });
      }

      return res.json({ success: true, data: { post } });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error updating post",
        error: error.message,
      });
    }
  }

  static async deletePost(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      const { postId } = authReq.params;

      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });

      const success = await PostModel.delete(postId, userId);
      if (!success) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found or unauthorized" });
      }

      return res.json({ success: true, message: "Post deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error deleting post",
        error: error.message,
      });
    }
  }

  static async getFeed(req: Request, res: Response) {
    try {
      const { page = "1", limit = "20" } = req.query;
      const userId =
        (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
      const result = await PostModel.getFeed(
        parseInt(page as string),
        parseInt(limit as string),
        userId,
      );

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching feed",
        error: error.message,
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
        message: "Error fetching posts",
        error: error.message,
      });
    }
  }

  static async likePost(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      const { postId } = authReq.params;
      const { reactionType = "LIKE" } = authReq.body;

      const result = await PostModel.toggleLike(postId, userId, reactionType);

      if (result.liked) {
        try {
          const postQuery = `
                    SELECT p.user_id, p.content, p.title, u.full_name as liker_name
                    FROM posts p
                    CROSS JOIN users u
                    WHERE p.id = $1 AND u.id = $2
                `;
          const postResult = await pool.query(postQuery, [postId, userId]);

          if (postResult.rows.length > 0) {
            const post = postResult.rows[0];
            const postOwnerId = post.user_id;
            const likerName = post.liker_name || "Someone";

            if (postOwnerId !== userId) {
              const postTitle =
                post.title || post.content?.substring(0, 50) || "your post";

              await NotificationModel.createPostLikeNotification(
                postOwnerId,
                userId,
                likerName,
                postId,
                postTitle,
              );
            }
          }
        } catch (notifError: any) {
          console.error(
            "⚠️ Failed to create like notification:",
            notifError.message,
          );
        }
      }

      return res.json({
        success: true,
        message: result.liked ? "Post reacted" : "Reaction removed",
        data: result,
      });
    } catch (error: any) {
      console.error("Like post error:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing like",
        error: error.message,
      });
    }
  }

  static async savePost(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      const { postId } = authReq.params;
      const result = await PostModel.toggleBookmark(postId, userId);

      return res.json({
        success: true,
        message: result.saved ? "Post saved" : "Post unsaved",
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error processing save",
        error: error.message,
      });
    }
  }

  static async createComment(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      const { postId } = authReq.params;
      const { content, parentCommentId } = authReq.body;

      if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Comment content is required" });
      }

      const comment = await PostModel.addComment(
        postId,
        userId,
        content.trim(),
        parentCommentId,
      );

      try {
        const postQuery = `
        SELECT p.user_id as post_owner_id, p.title as post_title, u.full_name as commenter_name
        FROM posts p
        CROSS JOIN users u
        WHERE p.id = $1 AND u.id = $2
      `;
        const result = await pool.query(postQuery, [postId, userId]);

        console.log("📊 Post query result:", result.rows);

        if (result.rows.length > 0) {
          const { post_owner_id, post_title, commenter_name } = result.rows[0];

          console.log("📝 Post info:", {
            post_owner_id,
            post_title,
            commenter_name,
            commenterId: userId,
          });

          if (post_owner_id !== userId) {
            console.log("✨ Creating notification...");

            const notificationId =
              await NotificationModel.createPostCommentNotification(
                post_owner_id,
                userId,
                commenter_name || "Someone",
                postId,
                post_title || "a post",
                content.substring(0, 100),
                comment.id,
              );

            console.log(
              "✅ Post comment notification created with ID:",
              notificationId,
            );
          } else {
            console.log(
              "⚠️ Skipping notification - user commented on own post",
            );
          }
        } else {
          console.log("⚠️ No post found or user not found");
        }
      } catch (notifError: any) {
        console.error("❌ Failed to create comment notification:", notifError);
        console.error("Stack:", notifError.stack);
      }

      return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: { comment },
      });
    } catch (error: any) {
      console.error("❌ Add comment error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add comment",
        error: error.message,
      });
    }
  }

  static async updateComment(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      const { commentId } = authReq.params;
      const { content } = authReq.body;

      if (!content || !content.trim()) {
        return res
          .status(400)
          .json({ success: false, message: "Comment content is required" });
      }

      const comment = await PostModel.updateComment(
        commentId,
        userId,
        content.trim(),
      );
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found or unauthorized",
        });
      }

      return res.json({
        success: true,
        message: "Comment updated",
        data: { comment },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error updating comment",
        error: error.message,
      });
    }
  }

  static async deleteComment(req: Request, res: Response) {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id || authReq.user?.userId;
      if (!userId)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      const { commentId } = authReq.params;

      const success = await PostModel.deleteComment(commentId, userId);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Comment not found or unauthorized",
        });
      }

      return res.json({ success: true, message: "Comment deleted" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error deleting comment",
        error: error.message,
      });
    }
  }

  static async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { page = "1", limit = "50" } = req.query;

      const userId =
        (req as AuthRequest).user?.id || (req as AuthRequest).user?.userId;
      const comments = await PostModel.getComments(
        postId,
        userId,
        parseInt(page as string),
        parseInt(limit as string),
      );

      return res.json({
        success: true,
        data: { comments },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error fetching comments",
        error: error.message,
      });
    }
  }
}
