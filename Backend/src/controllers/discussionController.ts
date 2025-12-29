import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { DiscussionService } from "../services/discussionService";

export class DiscussionController {
  /* ---------- PUBLIC ---------- */

  static async getDiscussions(req: Request, res: Response) {
    try {
      const discussions = await DiscussionService.getDiscussions(
        req.query as any
      );
      return res.status(200).json(discussions);
    } catch {
      return res.status(500).json({ message: "Failed to fetch discussions" });
    }
  }

  static async searchDiscussions(req: Request, res: Response) {
    try {
      const results = await DiscussionService.searchDiscussions(
        req.query as any
      );
      return res.status(200).json(results);
    } catch {
      return res.status(500).json({ message: "Search failed" });
    }
  }

  static async getDiscussionDetails(req: Request, res: Response) {
    try {
      const discussion = await DiscussionService.getDiscussionDetails(
        req.params.discussionId
      );
      return res.status(200).json(discussion);
    } catch {
      return res.status(404).json({ message: "Discussion not found" });
    }
  }

  /* ---------- PROTECTED ---------- */

  static async createDiscussion(req: AuthRequest, res: Response) {
    try {
      const discussion = await DiscussionService.createDiscussion(
        req.body,
        req.user!.userId
      );
      return res.status(201).json(discussion);
    } catch {
      return res.status(500).json({ message: "Failed to create discussion" });
    }
  }

  static async addReply(req: AuthRequest, res: Response) {
    try {
      const reply = await DiscussionService.addReply(
        req.params.discussionId,
        req.body,
        req.user!.userId
      );
      return res.status(201).json(reply);
    } catch {
      return res.status(500).json({ message: "Failed to add reply" });
    }
  }

  static async toggleUpvote(req: AuthRequest, res: Response) {
    const result = await DiscussionService.toggleUpvote(
      req.params.replyId,
      req.user!.userId
    );
    return res.json(result);
  }

  static async toggleFollow(req: AuthRequest, res: Response) {
    const result = await DiscussionService.toggleFollow(
      req.params.discussionId,
      req.user!.userId
    );
    return res.json(result);
  }

  static async markBestAnswer(req: AuthRequest, res: Response) {
    const result = await DiscussionService.markBestAnswer(
      req.params.discussionId,
      req.body.replyId,
      req.user!.userId
    );
    return res.json(result);
  }

  static async markResolved(req: AuthRequest, res: Response) {
    const result = await DiscussionService.markResolved(
      req.params.discussionId,
      req.user!.userId
    );
    return res.json(result);
  }
}
