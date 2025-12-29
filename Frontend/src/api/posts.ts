/// <reference types="vite/client" />
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = (): string | null => localStorage.getItem('authToken');

const createHeaders = (includeAuth = false): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export interface CreatePostData {
    content: string;
    title?: string;
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    tags?: string[];
    isPublic?: boolean;
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
    author?: {
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
        designation: string | null;
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

export async function getFeed(page = 1, limit = 20): Promise<{ posts: Post[], pagination: any }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}/posts/feed?${params}`, {
        headers: createHeaders()
    });

    if (!response.ok) throw new Error('Failed to fetch feed');
    const result = await response.json();
    return result.data;
}
