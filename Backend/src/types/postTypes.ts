export interface PostMediaInput {
  mediaType: 'IMAGE' | 'PDF' | 'DOCUMENT';
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  postType: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  media?: any[];
  isLiked?: boolean;
  isSaved?: boolean;
  author?: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
    designation: string | null;
  };
}

export interface PostWithAuthor extends Post {
  author_name?: string;
  author_role?: string;
  author_photo?: string;
  is_liked?: boolean;
}

export interface CreatePostInput {
  title?: string;
  content: string;
  postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
  tags?: string[];
  isPublic?: boolean;
  media?: PostMediaInput[];
}

export interface PostFilters {
  page?: number;
  limit?: number;
  tags?: string[];
  sort?: 'newest' | 'popular';
}
