/**
 * Messages API - Handle messaging operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get authorization token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get all legal experts
export const getExperts = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/experts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch experts');
  }
  
  return response.json();
};

// Get all conversations
export const getConversations = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversations');
  }
  
  return response.json();
};

// Get conversation with a specific user
export const getConversationWithUser = async (userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }
  
  return response.json();
};

// Send a message
export const sendMessage = async (recipientId: string, message: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipientId, message })
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

// Mark message as read
export const markAsRead = async (messageId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark message as read');
  }
  
  return response.json();
};

// Get unread message count
export const getUnreadCount = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/unread/count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch unread count');
  }
  
  return response.json();
};
