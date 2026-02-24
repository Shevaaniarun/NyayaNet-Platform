/**
 * Messages API - Handle messaging operations
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get authorization token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// --- EXPERT APIs ---

// Get all legal experts
export const getExperts = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/experts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch experts');
  return response.json();
};

// --- CONVERSATION APIs ---

// Get all conversations for current user
export const getConversations = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch conversations');
  return response.json();
};

// Get conversation details
export const getConversationDetails = async (conversationId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch conversation details');
  return response.json();
};

// Start or get a private conversation
export const startPrivateConversation = async (userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations/private`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) throw new Error('Failed to start conversation');
  return response.json();
};

// Create a group
export const createGroup = async (title: string, memberIds: string[]) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations/group`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, memberIds })
  });

  if (!response.ok) throw new Error('Failed to create group');
  return response.json();
};

// Delete conversation
export const deleteConversation = async (conversationId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to delete conversation');
  return response.json();
};

// --- MESSAGE APIs ---

// Get messages for a conversation (paginated)
export const getMessages = async (conversationId: string, page = 1, limit = 20) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

// Send text message
export const sendMessage = async (conversationId: string, content: string, messageType = 'TEXT') => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conversationId, content, messageType })
  });

  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// Send media message
export const sendMedia = async (conversationId: string, file: File, messageType: 'IMAGE' | 'PDF', content?: string) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('conversationId', conversationId);
  formData.append('messageType', messageType);
  if (content) formData.append('content', content);

  const response = await fetch(`${API_BASE_URL}/messages/send-media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type, fetch will set it for FormData
    },
    body: formData
  });

  if (!response.ok) throw new Error('Failed to send media');
  return response.json();
};

// Edit message
export const editMessage = async (messageId: string, content: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) throw new Error('Failed to edit message');
  return response.json();
};

// Delete message
export const deleteMessage = async (messageId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to delete message');
  return response.json();
};

// --- GROUP MANAGEMENT APIs ---

export const addGroupMember = async (conversationId: string, userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/group/${conversationId}/add`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });
  return response.ok;
};

export const removeGroupMember = async (conversationId: string, userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/group/${conversationId}/remove/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

export const leaveGroup = async (conversationId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/group/${conversationId}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

// --- BLOCK APIs ---

export const blockUser = async (userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/block`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  });
  return response.ok;
};

export const unblockUser = async (userId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/block/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

export const getBlockedUsers = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/blocked`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// --- READ RECEIPT & UTILITY APIs ---

export const markAsRead = async (messageId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/read/${messageId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

export const markConversationRead = async (conversationId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/read/conversation/${conversationId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.ok;
};

export const getUnreadCount = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/messages/unread/count`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) return { count: 0 };
  return response.json();
};

// --- LEGACY COMPATIBILITY ---
export const getConversationWithUser = async (userId: string) => {
  // Use startPrivateConversation to get the ID, then fetch messages
  const { conversationId } = await startPrivateConversation(userId);
  return getMessages(conversationId, 1, 50);
};

export const startConversation = startPrivateConversation;
export const markMessagesAsRead = markConversationRead;
export const markMessageAsRead = markAsRead;
