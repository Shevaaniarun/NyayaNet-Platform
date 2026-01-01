export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
  tags: string[];
  is_public: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: Date;
  updated_at: Date;
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
}

export interface PostFilters {
  page?: number;
  limit?: number;
  tags?: string[];
  sort?: 'newest' | 'popular';
}
