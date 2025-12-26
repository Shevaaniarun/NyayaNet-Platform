export interface Discussion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  discussion_type: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
  category: string;
  tags: string[];
  is_resolved: boolean;
  is_public: boolean;
  view_count: number;
  reply_count: number;
  upvote_count: number;
  save_count: number;
  follower_count: number;
  best_answer_id?: string;
  created_at: Date;
  updated_at: Date;
  last_activity_at: Date;
}

export interface DiscussionWithAuthor extends Discussion {
  author_name?: string;
  author_role?: string;
  author_photo?: string;
  is_following?: boolean;
  is_saved?: boolean;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  parent_reply_id?: string;
  content: string;
  content_format: string;
  media_url?: string;
  media_type?: string;
  upvote_count: number;
  reply_count: number;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DiscussionReplyWithAuthor extends DiscussionReply {
  author_name?: string;
  author_role?: string;
  author_photo?: string;
  has_upvoted?: boolean;
  depth?: number;
}

export interface DiscussionFollower {
  id: string;
  discussion_id: string;
  user_id: string;
  created_at: Date;
}

export interface DiscussionUpvote {
  id: string;
  reply_id: string;
  user_id: string;
  created_at: Date;
}

export interface CreateDiscussionInput {
  title: string;
  description: string;
  discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
  category: string;
  tags: string[];
  isPublic?: boolean;
}

export interface CreateReplyInput {
  content: string;
  parentReplyId?: string;
}

export interface DiscussionFilters {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  tags?: string[];
  status?: 'resolved' | 'active';
  sort?: 'newest' | 'active' | 'popular' | 'upvoted';
  following?: boolean;
  userId?: string;
}

export interface SearchFilters {
  q: string;
  category?: string;
  tags?: string[];
  author?: string;
  type?: string;
  status?: 'resolved' | 'active';
  sort?: 'relevance' | 'newest' | 'active' | 'popular';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Add this interface to your existing types file
export interface FormattedReply {
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

export interface FormattedDiscussion {
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
}

export interface DiscussionDetails {
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
  replies: FormattedReply[];
}