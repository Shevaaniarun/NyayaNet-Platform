import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  message: string;
  context?: any;
  suggestions?: string[];
}

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.post<ChatResponse>(
      `${API_URL}/chatbot/chat`,
      { message },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    throw new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      'Failed to send message'
    );
  }
};

export const getChatHistory = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(
      `${API_URL}/chatbot/history`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Failed to get chat history:', error);
    return [];
  }
};
