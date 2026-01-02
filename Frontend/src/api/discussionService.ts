import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface DiscussionAuthor {
  id: string;
  fullName?: string;
  role?: string;
  profilePhotoUrl?: string | null;
}

export interface DiscussionReply {
  id: string;
  content: string;
  upvoteCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  author: DiscussionAuthor;
  hasUpvoted?: boolean;
  replies: DiscussionReply[];
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
  category: string;
  tags: string[];
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  saveCount: number;
  followerCount: number;
  isResolved: boolean;
  hasBestAnswer: boolean;
  createdAt: string;
  lastActivityAt: string;
  author: DiscussionAuthor;
  isFollowing?: boolean;
  isSaved?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  upvoteCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  author: DiscussionAuthor;
  isUpvoted?: boolean;
  replies?: Comment[];
  isBestAnswer?: boolean;
}

export interface DiscussionFilters {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  tags?: string[];
  status?: 'active' | 'resolved';
  sort?: 'newest' | 'active' | 'popular' | 'upvoted';
  following?: boolean;
  q?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    discussions: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    categories?: string[];
  };
}

export interface CreateDiscussionInputData {
  title: string;
  description: string;
  discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
  category: string;
  tags: string[];
  isPublic?: boolean;
}

export interface CreateReplyData {
  content: string;
  parentReplyId?: string;
}

// API Functions
export const discussionService = {
  // Get discussions with filters
  getDiscussions: async (filters: DiscussionFilters = {}) => {
    const params = new URLSearchParams();

    // Add all filter parameters
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.q) params.append('q', filters.q);
    if (filters.following !== undefined) params.append('following', filters.following.toString());
    if (filters.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }

    const response = await api.get<PaginatedResponse<Discussion>>(`/discussions?${params.toString()}`);
    return response.data.data;
  },

  // Get discussion by ID
  getDiscussionById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: { discussion: any } }>(`/discussions/${id}`);
    return response.data.data.discussion;
  },

  // Create a new discussion
  createDiscussion: async (data: CreateDiscussionInputData) => {
    const response = await api.post<{ success: boolean; data: { discussion: Discussion } }>('/discussions', data);
    return response.data.data.discussion;
  },

  // Add reply to discussion
  addReply: async (discussionId: string, data: CreateReplyData) => {
    const response = await api.post<{ success: boolean; data: { reply: Comment } }>(
      `/discussions/${discussionId}/replies`,
      data
    );
    return response.data.data.reply;
  },

  // Toggle upvote on reply
  toggleReplyUpvote: async (replyId: string) => {
    const response = await api.post<{ success: boolean; data: { upvoted: boolean; upvoteCount: number } }>(
      `/discussions/replies/${replyId}/upvote`
    );
    return response.data.data;
  },

  // Toggle upvote on discussion
  toggleDiscussionUpvote: async (discussionId: string) => {
    const response = await api.post<{ success: boolean; data: { upvoted: boolean; upvoteCount: number } }>(
      `/discussions/${discussionId}/upvote`
    );
    return response.data.data;
  },

  // Toggle follow discussion
  toggleFollow: async (discussionId: string) => {
    const response = await api.post<{ success: boolean; data: { following: boolean; followerCount: number } }>(
      `/discussions/${discussionId}/follow`
    );
    return response.data.data;
  },

  // Toggle save discussion
  toggleSave: async (discussionId: string) => {
    const response = await api.post<{ success: boolean; data: { saved: boolean; saveCount: number } }>(
      `/discussions/${discussionId}/save`
    );
    return response.data.data;
  },

  // Mark reply as best answer
  markBestAnswer: async (discussionId: string, replyId: string) => {
    const response = await api.post<{ success: boolean }>(
      `/discussions/${discussionId}/best-answer`,
      { replyId }
    );
    return response.data.success;
  },

  // Mark discussion as resolved
  markResolved: async (discussionId: string) => {
    const response = await api.post<{ success: boolean }>(
      `/discussions/${discussionId}/resolve`
    );
    return response.data.success;
  },

  // Search discussions
  searchDiscussions: async (query: string, filters?: Partial<DiscussionFilters>) => {
    const params = new URLSearchParams();
    params.append('q', query);

    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
    }

    const response = await api.get<PaginatedResponse<Discussion>>(`/discussions/search?${params.toString()}`);
    return response.data.data;
  },
};

// Export individual functions for backward compatibility
export const getDiscussions = discussionService.getDiscussions;
export const createDiscussion = discussionService.createDiscussion;
export const getDiscussionById = discussionService.getDiscussionById;
export const addReply = discussionService.addReply;
export const upvoteReply = discussionService.toggleReplyUpvote;
export const toggleDiscussionUpvote = discussionService.toggleDiscussionUpvote;
export const followDiscussion = discussionService.toggleFollow;
export const saveDiscussion = discussionService.toggleSave;
export const markBestAnswer = discussionService.markBestAnswer;
export const markResolved = discussionService.markResolved;
export const searchDiscussions = discussionService.searchDiscussions;

// For DiscussionPage component compatibility
export type { Discussion as ApiDiscussion };
export type { Comment as ApiComment };