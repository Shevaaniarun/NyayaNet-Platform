// [file name]: networkAPI.ts
import axios from 'axios';

const API_BASE_URL =  'http://localhost:3000/api';

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

// Follow/Unfollow
export const followUser = async (targetUserId: string) => {
  try {
    const response = await networkApi.post(`/network/follow/${targetUserId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error following user:', error);
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

// Connection Requests
export const sendConnectionRequest = async (targetUserId: string, message?: string) => {
  try {
    const response = await networkApi.post(`/network/connection-requests/${targetUserId}`, { message });
    return response.data;
  } catch (error: any) {
    console.error('Error sending connection request:', error);
    throw error.response?.data || error;
  }
};

export const cancelConnectionRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/connection-requests/${requestId}/cancel`);
    return response.data;
  } catch (error: any) {
    console.error('Error cancelling connection request:', error);
    throw error.response?.data || error;
  }
};

export const acceptConnectionRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/connection-requests/${requestId}/accept`);
    return response.data;
  } catch (error: any) {
    console.error('Error accepting connection request:', error);
    throw error.response?.data || error;
  }
};

export const rejectConnectionRequest = async (requestId: string) => {
  try {
    const response = await networkApi.post(`/network/connection-requests/${requestId}/reject`);
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting connection request:', error);
    throw error.response?.data || error;
  }
};

// Get Methods
export const getConnectionStatus = async (targetUserId: string) => {
  try {
    const response = await networkApi.get(`/network/connection-status/${targetUserId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting connection status:', error);
    throw error.response?.data || error;
  }
};

export const getPendingConnectionRequests = async () => {
  try {
    const response = await networkApi.get('/network/connection-requests/pending');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting pending connection requests:', error);
    throw error.response?.data || error;
  }
};

export const getSentConnectionRequests = async () => {
  try {
    const response = await networkApi.get('/network/connection-requests/sent');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting sent connection requests:', error);
    throw error.response?.data || error;
  }
};

export const getConnections = async () => {
  try {
    const response = await networkApi.get('/network/connections');
    return response.data.data;
  } catch (error: any) {
    console.error('Error getting connections:', error);
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