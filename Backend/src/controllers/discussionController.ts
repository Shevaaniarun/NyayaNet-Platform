import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DiscussionService } from "../services/discussionService";
import { NotificationModel } from "../models/Notification";
import pool from "../config/database";

export class DiscussionController {
  /* ---------- PUBLIC ---------- */

  static async getDiscussions(req: Request, res: Response) {
    try {
      const data = await DiscussionService.getDiscussions(
        req.query as any,
        (req as any).user?.userId
      );
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("getDiscussions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch discussions",
      });
    }
  }

  static async searchDiscussions(req: Request, res: Response) {
    try {
      const data = await DiscussionService.searchDiscussions(
        req.query as any,
        (req as any).user?.userId
      );
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("searchDiscussions error:", error);
      return res.status(500).json({
        success: false,
        message: "Search failed",
      });
    }
  }

  static async getDiscussionDetails(req: Request, res: Response) {
    try {
      const { discussionId } = req.params;
      const userId = (req as any).user?.id;
      const ipAddress = req.ip;

      const discussion = await DiscussionService.getDiscussionDetails(
        discussionId,
        userId,
        ipAddress
      );

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: "Discussion not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: { discussion },
      });
    } catch (error) {
      console.error("getDiscussionDetails error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch discussion details",
      });
    }
  }

  /* ---------- PROTECTED ---------- */

  static async createDiscussion(req: AuthRequest, res: Response) {
    try {
      const discussion = await DiscussionService.createDiscussion(
        req.body,
        req.user!.userId
      );
      return res.status(201).json({
        success: true,
        message: "Discussion created successfully",
        data: { discussion },
      });
    } catch (error) {
      console.error("createDiscussion error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create discussion",
      });
    }
  }

  static async addReply(req: AuthRequest, res: Response) {
    try {
      const reply = await DiscussionService.addReply(
        req.params.discussionId,
        req.body,
        req.user!.userId
      );

      try {
        const discussionId = req.params.discussionId;
        const replierId = req.user!.userId;

        const discussionQuery = `
          SELECT d.user_id as discussion_owner_id, d.title as discussion_title, u.full_name as replier_name
          FROM discussions d
          CROSS JOIN users u
          WHERE d. id = $1 AND u.id = $2
        `;
        const result = await pool.query(discussionQuery, [
          discussionId,
          replierId,
        ]);

        if (result.rows.length > 0) {
          const { discussion_owner_id, discussion_title, replier_name } =
            result.rows[0];

          const isReplyToComment = !!req.body.parentReplyId;
          let notificationReceiverId = discussion_owner_id;

          if (isReplyToComment && req.body.parentReplyId) {
            const parentQuery = `SELECT user_id FROM discussion_replies WHERE id = $1`;
            const parentResult = await pool.query(parentQuery, [
              req.body.parentReplyId,
            ]);
            if (parentResult.rows.length > 0) {
              notificationReceiverId = parentResult.rows[0].user_id;
            }
          }
          if (notificationReceiverId !== replierId) {
            await NotificationModel.createDiscussionReplyNotification(
              notificationReceiverId,
              replierId,
              replier_name || "Someone",
              discussionId,
              discussion_title || "a discussion",
              req.body.content?.substring(0, 100) || "",
              isReplyToComment,
              req.body.parentReplyId
            );

            console.log("✅ Discussion reply notification created");
          }
        }
      } catch (notifError: any) {
        console.error(
          "⚠️ Failed to create reply notification:",
          notifError.message
        );
      }

      return res.status(201).json({
        success: true,
        message: "Reply added successfully",
        data: { reply },
      });
    } catch (error) {
      console.error("addReply error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add reply",
      });
    }
  }

  static async toggleUpvote(req: AuthRequest, res: Response) {
    try {
      const result = await DiscussionService.toggleUpvote(
        req.params.replyId,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: result.upvoted ? "Reply upvoted" : "Reply unvoted",
        data: {
          upvoted: result.upvoted,
          upvoteCount: result.count,
        },
      });
    } catch (error) {
      console.error("toggleUpvote error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle upvote",
      });
    }
  }

  static async toggleDiscussionUpvote(req: AuthRequest, res: Response) {
    try {
      const result = await DiscussionService.toggleDiscussionUpvote(
        req.params.discussionId,
        req.user!.userId
      );

      if (result.upvoted) {
        try {
          const discussionId = req.params.discussionId;
          const upvoterId = req.user!.userId;

          const query = `
            SELECT 
              d.user_id as discussion_owner_id,
              d.title as discussion_title,
              u.full_name as upvoter_name
            FROM discussions d
            CROSS JOIN users u
            WHERE d. id = $1 AND u.id = $2
          `;
          const queryResult = await pool.query(query, [
            discussionId,
            upvoterId,
          ]);

          if (queryResult.rows.length > 0) {
            const { discussion_owner_id, discussion_title, upvoter_name } =
              queryResult.rows[0];

            if (discussion_owner_id !== upvoterId) {
              await NotificationModel.createDiscussionUpvoteNotification(
                discussion_owner_id,
                upvoterId,
                upvoter_name || "Someone",
                discussionId,
                discussion_title || "your discussion",
                undefined,
                false
              );

              console.log("✅ Discussion upvote notification created");
            }
          }
        } catch (notifError: any) {
          console.error(
            "⚠️ Failed to create discussion upvote notification:",
            notifError.message
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: result.upvoted ? "Discussion upvoted" : "Discussion unvoted",
        data: {
          upvoted: result.upvoted,
          upvoteCount: result.count,
        },
      });
    } catch (error) {
      console.error("toggleDiscussionUpvote error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle discussion upvote",
      });
    }
  }

  static async toggleFollow(req: AuthRequest, res: Response) {
    try {
      const result = await DiscussionService.toggleFollow(
        req.params.discussionId,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: result.following
          ? "Discussion followed"
          : "Discussion unfollowed",
        data: {
          following: result.following,
          followerCount: result.followerCount,
        },
      });
    } catch (error) {
      console.error("toggleFollow error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle follow",
      });
    }
  }

  static async toggleSave(req: AuthRequest, res: Response) {
    try {
      const result = await DiscussionService.toggleSave(
        req.params.discussionId,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: result.saved ? "Discussion saved" : "Discussion unsaved",
        data: {
          saved: result.saved,
          saveCount: result.saveCount,
        },
      });
    } catch (error) {
      console.error("toggleSave error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to toggle save",
      });
    }
  }

  static async markBestAnswer(req: AuthRequest, res: Response) {
    try {
      await DiscussionService.markBestAnswer(
        req.params.discussionId,
        req.body.replyId,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: "Best answer marked successfully",
      });
    } catch (error: any) {
      console.error("markBestAnswer error:", error);
      return res
        .status(error.message.includes("unauthorized") ? 403 : 500)
        .json({
          success: false,
          message: error.message || "Failed to mark best answer",
        });
    }
  }

  static async markResolved(req: AuthRequest, res: Response) {
    try {
      await DiscussionService.markResolved(
        req.params.discussionId,
        req.user!.userId
      );
      return res.status(200).json({
        success: true,
        message: "Discussion marked as resolved",
      });
    } catch (error: any) {
      console.error("markResolved error:", error);
      return res
        .status(error.message.includes("unauthorized") ? 403 : 500)
        .json({
          success: false,
          message: error.message || "Failed to mark as resolved",
        });
    }
  }
}
