/// <reference types="vite/client" />
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = (): string | null => localStorage.getItem('token');

const createHeaders = (includeAuth = false): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export interface PostMediaInput {
    mediaType: 'IMAGE' | 'PDF' | 'DOCUMENT';
    mediaUrl: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
}

export interface CreatePostData {
    content: string;
    title?: string;
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    tags?: string[];
    isPublic?: boolean;
    media?: PostMediaInput[];
}

export interface PostMedia {
    id: string;
    mediaType: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    fileName: string | null;
    displayOrder: number;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
    };
}

export interface Post {
    id: string;
    userId: string;
    title: string | null;
    content: string;
    postType: string;
    tags: string[];
    isPublic: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    media?: PostMedia[];
    isLiked?: boolean;
    isSaved?: boolean;
    author?: {
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
        designation: string | null;
        organization: string | null;
    };
}

export async function createPost(data: CreatePostData): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
    }

    const result = await response.json();
    return result.data.post;
}

export async function getPost(postId: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: createHeaders(true)
    });

    if (!response.ok) throw new Error('Failed to fetch post');
    const result = await response.json();
    return result.data.post;
}

export async function updatePost(postId: string, data: Partial<CreatePostData>): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update post');
    }

    const result = await response.json();
    return result.data.post;
}

export async function deletePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: createHeaders(true)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete post');
    }
}

export async function uploadFiles(files: File[]): Promise<PostMediaInput[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/posts/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload files');
    }

    const result = await response.json();
    return result.data.media;
}

export async function getFeed(page = 1, limit = 20): Promise<{ posts: Post[], pagination: any }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}/posts/feed?${params}`, {
        headers: createHeaders(true) // Feed needs auth now for isLiked status
    });

    if (!response.ok) throw new Error('Failed to fetch feed');
    const result = await response.json();
    return result.data;
}

export interface PostFilters {
    page?: number;
    limit?: number;
    tags?: string[];
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    sort?: 'newest' | 'popular' | 'liked' | 'discussed';
    q?: string;
}

export async function getPosts(filters: PostFilters = {}): Promise<{ posts: Post[], pagination: any }> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.postType) params.append('postType', filters.postType);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.q) params.append('q', filters.q);
    if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append('tags', tag));
    }

    const response = await fetch(`${API_BASE_URL}/posts/all?${params}`, {
        headers: createHeaders(true)
    });

    if (!response.ok) throw new Error('Failed to fetch posts');
    const result = await response.json();
    return result.data;
}

export async function likePost(postId: string): Promise<{ liked: boolean; count: number }> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: createHeaders(true)
    });

    if (!response.ok) throw new Error('Failed to toggle like');
    const result = await response.json();
    return result.data;
}

export async function savePost(postId: string): Promise<{ saved: boolean }> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
        method: 'POST',
        headers: createHeaders(true)
    });

    if (!response.ok) throw new Error('Failed to toggle save');
    const result = await response.json();
    return result.data;
}

export async function createComment(postId: string, content: string): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify({ content })
    });

    if (!response.ok) throw new Error('Failed to create comment');
    const result = await response.json();
    return result.data.comment;
}

export async function getComments(postId: string, page = 1, limit = 50): Promise<Comment[]> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments?${params}`, {
        headers: createHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch comments');
    const result = await response.json();
    return result.data.comments;
}
