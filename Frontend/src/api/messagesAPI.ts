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
    const errorText = await response.text();
    console.error('Get experts error:', errorText);
    throw new Error('Failed to fetch experts');
  }
  
  return response.json();
};

// Get conversation with a specific user
export const getConversationWithUser = async (userId: string) => {
  const token = getAuthToken();
  console.log('Fetching conversation for user:', userId, 'with token:', token ? 'Present' : 'Missing');
  
  const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get conversation error:', response.status, errorText);
    throw new Error(`Failed to fetch conversation: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Conversation data received:', data);
  return data;
};

// Mark all messages as read for a conversation with a user
export const markMessagesAsRead = async (userId: string) => {
  const token = getAuthToken();
  console.log('Marking messages as read for conversation with:', userId);
  
  try {
    const response = await fetch(`${API_BASE_URL}/messages/conversation/${userId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('Failed to mark messages as read:', response.status);
      // Don't throw error - this is non-critical
    }
    
    return response.ok ? response.json() : null;
  } catch (error) {
    console.warn('Error marking messages as read:', error);
    return null;
  }
};

// Send a message
export const sendMessage = async (recipientId: string, message: string) => {
  const token = getAuthToken();
  console.log('Sending message to:', recipientId);
  
  const response = await fetch(`${API_BASE_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ recipientId, message })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Send message error:', errorText);
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

// Additional API functions...
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

export const markMessageAsRead = async (messageId: string) => {
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

export const startConversation = async (otherUserId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversation/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ otherUserId })
  });
  
  if (!response.ok) {
    throw new Error('Failed to start conversation');
  }
  
  return response.json();
};