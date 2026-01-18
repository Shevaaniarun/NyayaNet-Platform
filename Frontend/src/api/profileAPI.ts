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


const networkApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
networkApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================
   PROFILE METHODS
============================ */

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

/* ============================
   PHOTO UPLOADS
============================ */

export const uploadProfilePhoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    const response = await profileApi.post('/profile/upload/profile-photo', {
      photoUrl: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    throw error.response?.data || error;
  }
};

export const uploadCoverPhoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadResult = await uploadResponse.json();

    const response = await profileApi.post('/profile/upload/cover-photo', {
      coverPhotoUrl: uploadResult.url,
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Error uploading cover photo:', error);
    throw error.response?.data || error;
  }
};

/* ============================
   CERTIFICATIONS
============================ */

// Certificate file upload (mock / placeholder)
export const uploadCertificateFile = async (file: File) => {
  try {
    console.log('Uploading certificate file:', file.name);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      certificateUrl: `https://example.com/certificates/${Date.now()}_${file.name}`,
      fileType: file.type.includes('pdf') ? 'PDF' : 'IMAGE',
    };
  } catch (error: any) {
    console.error('Error uploading certificate file:', error);
    throw error;
  }
};

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

/* ============================
   USER CONTENT
============================ */

export const getUserPosts = async (
  userId: string,
  page = 1,
  limit = 20,
  sort = 'newest'
) => {
  try {
    const response = await profileApi.get(`/profile/${userId}/posts`, {
      params: { page, limit, sort },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user posts:', error);
    throw error.response?.data || error;
  }
};

export const getUserDiscussions = async (
  userId: string,
  page = 1,
  limit = 20
) => {
  try {
    const response = await profileApi.get(`/profile/${userId}/discussions`, {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching user discussions:', error);
    throw error.response?.data || error;
  }
};

export const getBookmarks = async (
  folder?: string,
  type?: string,
  page = 1,
  limit = 20
) => {
  try {
    const response = await profileApi.get('/profile/bookmarks', {
      params: { folder, type, page, limit },
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
      params: { q: query, type },
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error searching content:', error);
    throw error.response?.data || error;
  }
};

/* ============================
   LIKES & FOLLOWING CONTENT
============================ */

export const getLikedPosts = async (page = 1, limit = 20) => {
  try {
    const response = await profileApi.get('/profile/liked-posts', {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error: any) {
    console.warn('Error fetching liked posts, returning empty array');
    return { posts: [], pagination: { total: 0, page, limit, pages: 0 } };
  }
};

export const getLikedDiscussions = async (page = 1, limit = 20) => {
  try {
    const response = await profileApi.get('/profile/liked-discussions', {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error: any) {
    console.warn('Error fetching liked discussions, returning empty array');
    return { discussions: [], pagination: { total: 0, page, limit, pages: 0 } };
  }
};

export const getFollowingDiscussions = async (page = 1, limit = 20) => {
  try {
    const response = await profileApi.get('/profile/following-discussions', {
      params: { page, limit },
    });
    return response.data.data;
  } catch (error: any) {
    console.warn('Error fetching following discussions, returning empty array');
    return { discussions: [], pagination: { total: 0, page, limit, pages: 0 } };
  }
};



/* ============================
   FOLLOW/FOLLOWERS METHODS
============================ */

export const getFollowers = async () => {
  try {
    const response = await networkApi.get('/network/followers');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting followers:', error);
    throw error.response?.data || error;
  }
};

export const getFollowing = async () => {
  try {
    const response = await networkApi.get('/network/following');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting following:', error);
    throw error.response?.data || error;
  }
};

export const followUser = async (userId: string) => {
  try {
    const response = await networkApi.post('/network/follow', { userId });
    return response.data.data;
  } catch (error: any) {
    console.error('Error following user:', error);
    throw error.response?.data || error;
  }
};

export const unfollowUser = async (userId: string) => {
  try {
    const response = await networkApi.post('/network/unfollow', { userId });
    return response.data.data;
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    throw error.response?.data || error;
  }
};

export const getFollowStatus = async (userId: string) => {
  try {
    const response = await networkApi.get(`/network/follow-status/${userId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting follow status:', error);
    return { status: 'NONE' };
  }
};

export const cancelFollowRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/requests/${requestId}/cancel`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error canceling follow request:', error);
    throw error.response?.data || error;
  }
};


export const getNetworkStats = async () => {
  try {
    const response = await networkApi.get('/network/stats');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting network stats:', error);
    throw error.response?.data || error;
  }
};