// [file name]: profileAPI.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Configure axios instance
const profileApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
profileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Profile methods
export const getProfile = async (userId: string) => {
  try {
    const response = await profileApi.get(`/profile/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    throw error.response?.data || error;
  }
};

export const updateProfile = async (data: any) => {
  try {
    const response = await profileApi.put('/profile', data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error.response?.data || error;
  }
};

export const uploadProfilePhoto = async (file: File) => {
  try {
    // In a real app, you'd upload to storage service first
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to your storage service
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const uploadResult = await uploadResponse.json();
    
    // Then update profile with URL
    const response = await profileApi.post('/profile/upload/profile-photo', {
      photoUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    throw error.response?.data || error;
  }
};

export const uploadCoverPhoto = async (file: File) => {
  try {
    // In a real app, you'd upload to storage service first
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to your storage service
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    const uploadResult = await uploadResponse.json();
    
    // Then update profile with URL
    const response = await profileApi.post('/profile/upload/cover-photo', {
      coverPhotoUrl: uploadResult.url
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error uploading cover photo:', error);
    throw error.response?.data || error;
  }
};

// Certificate file upload (new method)
export const uploadCertificateFile = async (file: File) => {
  try {
    // Mock implementation - in real app, upload to storage service
    console.log('Uploading certificate file:', file.name);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URL - in real app, this would come from your storage service
    return {
      certificateUrl: `https://example.com/certificates/${Date.now()}_${file.name}`,
      fileType: file.type.includes('pdf') ? 'PDF' : 'IMAGE'
    };
  } catch (error: any) {
    console.error('Error uploading certificate file:', error);
    throw error;
  }
};

// Certification methods
export const getCertifications = async (userId: string) => {
  try {
    const response = await profileApi.get(`/profile/${userId}/certifications`);
    return response.data.data.certifications;
  } catch (error: any) {
    console.error('Error fetching certifications:', error);
    throw error.response?.data || error;
  }
};

export const addCertification = async (data: any) => {
  try {
    const response = await profileApi.post('/profile/certifications', data);
    return response.data.data.certification;
  } catch (error: any) {
    console.error('Error adding certification:', error);
    throw error.response?.data || error;
  }
};

export const deleteCertification = async (certificationId: string) => {
  try {
    const response = await profileApi.delete(`/profile/certifications/${certificationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting certification:', error);
    throw error.response?.data || error;
  }
};

// Content methods
export const getUserPosts = async (userId: string, page = 1, limit = 20, sort = 'newest') => {
  try {
    const response = await profileApi.get(`/profile/${userId}/posts`, {
      params: { page, limit, sort }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    throw error.response?.data || error;
  }
};

export const getUserDiscussions = async (userId: string, page = 1, limit = 20) => {
  try {
    const response = await profileApi.get(`/profile/${userId}/discussions`, {
      params: { page, limit }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user discussions:', error);
    throw error.response?.data || error;
  }
};

export const getBookmarks = async (folder?: string, type?: string, page = 1, limit = 20) => {
  try {
    const response = await profileApi.get('/profile/bookmarks', {
      params: { folder, type, page, limit }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching bookmarks:', error);
    throw error.response?.data || error;
  }
};

export const searchUserContent = async (query: string, type?: string) => {
  try {
    const response = await profileApi.get('/profile/search', {
      params: { q: query, type }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error searching content:', error);
    throw error.response?.data || error;
  }
};