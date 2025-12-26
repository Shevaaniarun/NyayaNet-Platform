import { Request, Response } from 'express';
import { DiscussionService } from '../services/discussionService';
import { validationResult } from '../utils/validation';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class DiscussionController {
  // Get all discussions
  static async getDiscussions(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        type,
        tags,
        status,
        sort = 'newest',
        following
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        category: category as string,
        type: type as string,
        tags: tags ? (tags as string).split(',') : undefined,
        status: status as 'resolved' | 'active',
        sort: sort as 'newest' | 'active' | 'popular' | 'upvoted',
        following: following === 'true'
      };

      const userId = req.user?.id;
      const result = await DiscussionService.getDiscussions(filters, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error getting discussions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch discussions',
        error: error.message
      });
    }
  }

  // Create a new discussion
  static async createDiscussion(req: AuthRequest, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, description, discussionType, category, tags, isPublic } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const discussion = await DiscussionService.createDiscussion(
        {
          title,
          description,
          discussionType,
          category,
          tags,
          isPublic
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Discussion created successfully',
        data: {
          discussion
        }
      });
    } catch (error: any) {
      console.error('Error creating discussion:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create discussion',
        error: error.message
      });
    }
  }

  // Get discussion details
  static async getDiscussionDetails(req: AuthRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const userId = req.user?.id;

      const discussion = await DiscussionService.getDiscussionDetails(discussionId, userId);

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          discussion
        }
      });
    } catch (error: any) {
      console.error('Error getting discussion details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch discussion details',
        error: error.message
      });
    }
  }

  // Add reply to discussion
  static async addReply(req: AuthRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const { content, parentReplyId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const reply = await DiscussionService.addReply(
        discussionId,
        { content, parentReplyId },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: {
          reply
        }
      });
    } catch (error: any) {
      console.error('Error adding reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add reply',
        error: error.message
      });
    }
  }

  // Toggle upvote on reply
  static async toggleUpvote(req: AuthRequest, res: Response) {
    try {
      const { replyId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await DiscussionService.toggleUpvote(replyId, userId);

      res.status(200).json({
        success: true,
        message: result.upvoted ? 'Reply upvoted' : 'Upvote removed',
        data: {
          upvoted: result.upvoted,
          upvoteCount: result.count
        }
      });
    } catch (error: any) {
      console.error('Error toggling upvote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle upvote',
        error: error.message
      });
    }
  }

  // Follow/unfollow discussion
  static async toggleFollow(req: AuthRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const result = await DiscussionService.toggleFollow(discussionId, userId);

      res.status(200).json({
        success: true,
        message: result.following ? 'Discussion followed' : 'Discussion unfollowed',
        data: {
          following: result.following,
          followerCount: result.followerCount
        }
      });
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle follow',
        error: error.message
      });
    }
  }

  // Mark reply as best answer
  static async markBestAnswer(req: AuthRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const { replyId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      await DiscussionService.markBestAnswer(discussionId, replyId, userId);

      res.status(200).json({
        success: true,
        message: 'Best answer marked successfully'
      });
    } catch (error: any) {
      console.error('Error marking best answer:', error);
      if (error.message === 'Discussion not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found or unauthorized'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to mark best answer',
        error: error.message
      });
    }
  }

  // Mark discussion as resolved
  static async markResolved(req: AuthRequest, res: Response) {
    try {
      const { discussionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      await DiscussionService.markResolved(discussionId, userId);

      res.status(200).json({
        success: true,
        message: 'Discussion marked as resolved'
      });
    } catch (error: any) {
      console.error('Error marking resolved:', error);
      if (error.message === 'Discussion not found or unauthorized') {
        return res.status(404).json({
          success: false,
          message: 'Discussion not found or unauthorized'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to mark discussion as resolved',
        error: error.message
      });
    }
  }

  // Search discussions
  static async searchDiscussions(req: AuthRequest, res: Response) {
    try {
      const {
        q = '',
        category,
        tags,
        author,
        type,
        status,
        sort = 'relevance',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        q: q as string,
        category: category as string,
        tags: tags ? (tags as string).split(',') : undefined,
        author: author as string,
        type: type as string,
        status: status as 'resolved' | 'active',
        sort: sort as 'relevance' | 'newest' | 'active' | 'popular',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const userId = req.user?.id;
      const result = await DiscussionService.searchDiscussions(filters, userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error searching discussions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search discussions',
        error: error.message
      });
    }
  }
}