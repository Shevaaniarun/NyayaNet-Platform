// [file name]: networkAPI.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Configure axios instance
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

// Follow methods
export const sendFollowRequest = async (targetUserId: string) => {
  try {
    const response = await networkApi.post(`/network/follow/${targetUserId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error sending follow request:', error);
    throw error.response?.data || error;
  }
};

export const unfollowUser = async (targetUserId: string) => {
  try {
    const response = await networkApi.post(`/network/unfollow/${targetUserId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    throw error.response?.data || error;
  }
};

export const acceptFollowRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/requests/${requestId}/accept`);
    return response.data;
  } catch (error: any) {
    console.error('Error accepting follow request:', error);
    throw error.response?.data || error;
  }
};

export const rejectFollowRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/requests/${requestId}/reject`);
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting follow request:', error);
    throw error.response?.data || error;
  }
};

export const cancelFollowRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling follow request:', error);
    throw error.response?.data || error;
  }
};

// Get Methods
export const getFollowStatus = async (targetUserId: string) => {
  try {
    const response = await networkApi.get(`/network/follow-status/${targetUserId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting follow status:', error);
    throw error.response?.data || error;
  }
};

export const getFollowRequests = async () => {
  try {
    const response = await networkApi.get('/network/requests/received');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting follow requests:', error);
    throw error.response?.data || error;
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await networkApi.get('/network/requests/sent');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting pending requests:', error);
    throw error.response?.data || error;
  }
};

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

export const searchUsers = async (query: string, page = 1, limit = 20) => {
  try {
    const response = await networkApi.get('/network/search', {
      params: { q: query, page, limit }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
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