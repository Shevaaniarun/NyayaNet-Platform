import { DiscussionModel } from '../models/Discussion';
import { DiscussionReplyModel } from '../models/DiscussionReply';
import { DiscussionFollowerModel } from '../models/DiscussionFollower';
import { DiscussionUpvoteModel } from '../models/DiscussionUpvote';
import { UserBookmarkModel } from '../models/UserBookmark';
import {
  CreateDiscussionInput,
  CreateReplyInput,
  DiscussionFilters,
  SearchFilters,
  DiscussionReplyWithAuthor
} from '../types/discussionTypes';

interface FormattedReply {
  id: string;
  content: string;
  upvoteCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  author: {
    id: string;
    fullName?: string;
    role?: string;
    profilePhotoUrl?: string;
  };
  hasUpvoted?: boolean;
  replies: FormattedReply[];
}

interface FormattedDiscussion {
  id: string;
  title: string;
  description: string;
  discussionType: string;
  category: string;
  tags: string[];
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  saveCount: number;
  followerCount: number;
  isResolved: boolean;
  hasBestAnswer: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  author: {
    id: string;
    fullName?: string;
    role?: string;
    profilePhotoUrl?: string;
  };
  isFollowing?: boolean;
  isSaved?: boolean;
  isUpvoted?: boolean;
}

interface PaginatedDiscussions {
  discussions: FormattedDiscussion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  categories: string[];
}

interface DiscussionDetails {
  id: string;
  title: string;
  description: string;
  discussionType: string;
  category: string;
  tags: string[];
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  saveCount: number;
  followerCount: number;
  isResolved: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  author: {
    id: string;
    fullName?: string;
    role?: string;
    profilePhotoUrl?: string;
  };
  bestAnswer: {
    id: string;
    content: string;
    upvoteCount: number;
    author: {
      fullName?: string;
      profilePhotoUrl?: string;
    };
  } | null;
  isFollowing?: boolean;
  isSaved?: boolean;
  isUpvoted?: boolean;
  replies: FormattedReply[];
}

export class DiscussionService {
  // Get all discussions
  static async getDiscussions(filters: DiscussionFilters, userId?: string): Promise<PaginatedDiscussions> {
    const { discussions, total } = await DiscussionModel.findAll(filters, userId);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const pages = Math.ceil(total / limit);

    // Get unique categories for filter
    const categoriesQuery = await DiscussionModel.findAll({}, userId);
    const uniqueCategories = [...new Set(categoriesQuery.discussions.map(d => d.category))];

    const formattedDiscussions: FormattedDiscussion[] = discussions.map(discussion => ({
      id: discussion.id,
      title: discussion.title,
      description: discussion.description,
      discussionType: discussion.discussion_type,
      category: discussion.category,
      tags: discussion.tags,
      replyCount: discussion.reply_count,
      upvoteCount: discussion.upvote_count,
      viewCount: discussion.view_count,
      saveCount: discussion.save_count,
      followerCount: discussion.follower_count,
      isResolved: discussion.is_resolved,
      hasBestAnswer: !!discussion.best_answer_id,
      createdAt: discussion.created_at,
      lastActivityAt: discussion.last_activity_at,
      author: {
        id: discussion.user_id,
        fullName: discussion.author_name,
        role: discussion.author_role,
        profilePhotoUrl: discussion.author_photo
      },
      isFollowing: discussion.is_following,
      isSaved: discussion.is_saved,
      isUpvoted: discussion.is_upvoted
    }));

    return {
      discussions: formattedDiscussions,
      pagination: {
        total,
        page,
        limit,
        pages
      },
      categories: uniqueCategories
    };
  }

  // Create a new discussion
  static async createDiscussion(data: CreateDiscussionInput, userId: string): Promise<DiscussionDetails | null> {
    const discussion = await DiscussionModel.create(data, userId);
    // Note: We don't have ipAddress during creation to pass for view increment here, 
    // but the next fetch call in getDiscussionDetails will handle it if needed.
    return this.getDiscussionDetails(discussion.id, userId);
  }

  // Get discussion details
  static async getDiscussionDetails(id: string, userId?: string, ipAddress?: string): Promise<DiscussionDetails | null> {
    const discussionResult = await DiscussionModel.findById(id, userId);

    if (!discussionResult) {
      return null;
    }

    // Increment view count
    await DiscussionModel.incrementViewCount(id, userId, ipAddress);

    // Get replies
    const replies = await DiscussionReplyModel.findByDiscussionId(id, userId);

    const formattedReplies = this.formatRepliesForResponse(replies, null, discussionResult.best_answer_id);

    return {
      id: discussionResult.id,
      title: discussionResult.title,
      description: discussionResult.description,
      discussionType: discussionResult.discussion_type,
      category: discussionResult.category,
      tags: discussionResult.tags,
      replyCount: discussionResult.reply_count,
      upvoteCount: discussionResult.upvote_count,
      viewCount: discussionResult.view_count,
      saveCount: discussionResult.save_count,
      followerCount: discussionResult.follower_count,
      isResolved: discussionResult.is_resolved,
      isPublic: discussionResult.is_public,
      createdAt: discussionResult.created_at,
      updatedAt: discussionResult.updated_at,
      lastActivityAt: discussionResult.last_activity_at,
      author: {
        id: discussionResult.user_id,
        fullName: discussionResult.author_name,
        role: discussionResult.author_role,
        profilePhotoUrl: discussionResult.author_photo
      },
      bestAnswer: discussionResult.bestAnswer || null,
      isFollowing: discussionResult.is_following,
      isSaved: discussionResult.is_saved,
      isUpvoted: discussionResult.is_upvoted,
      replies: formattedReplies
    };
  }

  // Add reply to discussion
  static async addReply(discussionId: string, data: CreateReplyInput, userId: string): Promise<FormattedReply | null> {
    const discussion = await DiscussionModel.findById(discussionId);
    if (!discussion) throw new Error('Discussion not found');
    if (discussion.is_resolved) throw new Error('Cannot add insights to a resolved discussion');

    // Check depth if parentReplyId is provided
    if (data.parentReplyId) {
      const parentReply = await DiscussionReplyModel.findById(data.parentReplyId);
      if (!parentReply) throw new Error('Parent reply not found');

      // We can check depth from the path if we fetch it, or just use a query
      // For simplicity, let's fetch the reply tree and find parent depth
      const allReplies = await DiscussionReplyModel.findByDiscussionId(discussionId);
      const findDepth = (replies: any[], id: string, currentDepth: number): number | null => {
        for (const r of replies) {
          if (r.id === id) return currentDepth;
          // Note: replies from findByDiscussionId are already flat but have parent_reply_id
        }
        return null;
      };

      const parentRecord = allReplies.find(r => r.id === data.parentReplyId);
      if (parentRecord && parentRecord.depth >= 3) {
        throw new Error('Maximum nesting depth reached');
      }
    }

    const reply = await DiscussionReplyModel.create(data, discussionId, userId);

    // Fetch all replies to get the formatted structure
    const allReplies = await DiscussionReplyModel.findByDiscussionId(discussionId, userId);

    const formattedReplies = this.formatRepliesForResponse(allReplies, null, discussion?.best_answer_id);

    const flatFind = (replies: FormattedReply[]): FormattedReply | null => {
      for (const r of replies) {
        if (r.id === reply.id) return r;
        const found = flatFind(r.replies);
        if (found) return found;
      }
      return null;
    };

    return flatFind(formattedReplies);
  }

  // Helper moved from getDiscussionDetails to be reusable
  private static formatRepliesForResponse(
    repliesArray: DiscussionReplyWithAuthor[],
    parentId: string | null = null,
    bestAnswerId?: string
  ): any[] {
    return repliesArray
      .filter(reply => {
        if (parentId === null) {
          return reply.parent_reply_id === null;
        } else {
          return reply.parent_reply_id === parentId;
        }
      })
      .map(reply => ({
        id: reply.id,
        content: reply.content,
        upvoteCount: reply.upvote_count,
        replyCount: reply.reply_count,
        isEdited: reply.is_edited,
        isBestAnswer: reply.id === bestAnswerId,
        createdAt: reply.created_at,
        author: {
          id: reply.user_id,
          fullName: reply.author_name,
          role: reply.author_role,
          profilePhotoUrl: reply.author_photo
        },
        hasUpvoted: reply.has_upvoted,
        replies: this.formatRepliesForResponse(repliesArray, reply.id, bestAnswerId)
      }));
  }

  // Toggle upvote on reply
  static async toggleUpvote(replyId: string, userId: string): Promise<{ upvoted: boolean; count: number }> {
    const result = await DiscussionUpvoteModel.toggleUpvote(replyId, userId);
    return result;
  }

  // Toggle upvote on discussion
  static async toggleDiscussionUpvote(discussionId: string, userId: string): Promise<{ upvoted: boolean; count: number }> {
    return DiscussionModel.toggleUpvote(discussionId, userId);
  }

  // Follow/unfollow discussion
  static async toggleFollow(discussionId: string, userId: string): Promise<{ following: boolean; followerCount: number }> {
    const isFollowing = await DiscussionFollowerModel.isFollowing(discussionId, userId);

    if (isFollowing) {
      await DiscussionFollowerModel.unfollow(discussionId, userId);
    } else {
      await DiscussionFollowerModel.follow(discussionId, userId);
    }

    const newFollowerCount = await DiscussionFollowerModel.getFollowerCount(discussionId);

    return {
      following: !isFollowing,
      followerCount: newFollowerCount
    };
  }

  // Toggle save (bookmark) on discussion
  static async toggleSave(discussionId: string, userId: string): Promise<{ saved: boolean; saveCount: number }> {
    const result = await UserBookmarkModel.toggleBookmark(userId, 'DISCUSSION', discussionId);

    return {
      saved: result.bookmarked,
      saveCount: result.saveCount
    };
  }

  // Mark reply as best answer
  static async markBestAnswer(discussionId: string, replyId: string, userId: string): Promise<boolean> {
    const discussion = await DiscussionModel.setBestAnswer(discussionId, replyId, userId);

    if (!discussion) {
      throw new Error('Discussion not found or unauthorized');
    }

    return true;
  }

  // Mark discussion as resolved
  static async markResolved(discussionId: string, userId: string): Promise<boolean> {
    const discussion = await DiscussionModel.markAsResolved(discussionId, userId);

    if (!discussion) {
      throw new Error('Discussion not found or unauthorized');
    }

    return true;
  }

  // Search discussions
  static async searchDiscussions(filters: SearchFilters, userId?: string): Promise<{
    discussions: Array<{
      id: string;
      title: string;
      excerpt: string;
      category: string;
      replyCount: number;
      upvoteCount: number;
      createdAt: Date;
      author: {
        fullName?: string;
        profilePhotoUrl?: string;
      };
      isFollowing?: boolean;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const { discussions, total } = await DiscussionModel.search(filters, userId);

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const pages = Math.ceil(total / limit);

    const formattedDiscussions = discussions.map(discussion => ({
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.description.length > 150
        ? discussion.description.substring(0, 150) + '...'
        : discussion.description,
      category: discussion.category,
      tags: discussion.tags,
      replyCount: discussion.reply_count,
      upvoteCount: discussion.upvote_count,
      viewCount: discussion.view_count,
      createdAt: discussion.created_at,
      author: {
        fullName: discussion.author_name,
        profilePhotoUrl: discussion.author_photo
      },
      isFollowing: discussion.is_following,
      isUpvoted: discussion.is_upvoted
    }));

    return {
      discussions: formattedDiscussions,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }
}