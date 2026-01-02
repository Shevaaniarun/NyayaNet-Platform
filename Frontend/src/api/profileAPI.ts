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

export async function getProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data = await response.json();
    return data.data;
}

export async function updateProfile(updates: any) {
    const response = await fetch(`${API_BASE_URL}/profile`, { method: 'PUT', headers: createHeaders(true), body: JSON.stringify(updates) });
    if (!response.ok) throw new Error('Failed to update profile');
    const data = await response.json();
    return data.data;
}

export async function getCertifications(userId: string) {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/certifications`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to fetch certifications');
    const data = await response.json();
    return data.data.certifications;
}

export async function addCertification(certData: any) {
    const response = await fetch(`${API_BASE_URL}/profile/certifications`, { method: 'POST', headers: createHeaders(true), body: JSON.stringify(certData) });
    if (!response.ok) throw new Error('Failed to add certification');
    const data = await response.json();
    return data.data.certification;
}

export async function deleteCertification(certificationId: string) {
    const response = await fetch(`${API_BASE_URL}/profile/certifications/${certificationId}`, { method: 'DELETE', headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to delete certification');
}

export async function getUserPosts(userId: string, page = 1, limit = 20, sort = 'newest') {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), sort });
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/posts?${params}`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to fetch user posts');
    const data = await response.json();
    return data.data;
}

export async function getUserDiscussions(userId: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${API_BASE_URL}/profile/${userId}/discussions?${params}`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to fetch discussions');
    const data = await response.json();
    return data.data;
}

export async function getBookmarks(folder?: string, type?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (folder) params.append('folder', folder);
    if (type) params.append('type', type);
    const response = await fetch(`${API_BASE_URL}/profile/bookmarks?${params}`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    const data = await response.json();
    return data.data;
}

export async function searchUserContent(query: string, type?: string) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    const response = await fetch(`${API_BASE_URL}/profile/search?${params}`, { headers: createHeaders(true) });
    if (!response.ok) throw new Error('Failed to search');
    const data = await response.json();
    return data.data;
}

export async function uploadProfilePhoto(file: File): Promise<{ profilePhotoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });

    if (!response.ok) throw new Error('Failed to upload profile photo');
    const data = await response.json();
    return data.data;
}

export async function uploadCoverPhoto(file: File): Promise<{ coverPhotoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/cover-photo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });

    if (!response.ok) throw new Error('Failed to upload cover photo');
    const data = await response.json();
    return data.data;
}

export async function uploadCertificateFile(file: File): Promise<{ certificateUrl: string; fileType: string; originalName: string }> {
    const formData = new FormData();
    formData.append('certificate', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/certificate`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });

    if (!response.ok) throw new Error('Failed to upload certificate');
    const data = await response.json();
    return data.data;
}
