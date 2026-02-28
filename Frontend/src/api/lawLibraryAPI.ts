import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const lawLibraryAPI = {
  // Get all acts
  getActs: async (params?: { category?: string; page?: number; limit?: number }) => {
    const response = await api.get('/library/acts', { params });
    return response.data;
  },

  // Get single act with sections
  getActById: async (actId: string) => {
    const response = await api.get(`/library/acts/${actId}`);
    return response.data;
  },

  // Get single section
  getSectionById: async (sectionId: string) => {
    const response = await api.get(`/library/sections/${sectionId}`);
    return response.data;
  },

  // Search laws
  searchLaws: async (params: { q: string; category?: string; act_id?: string; page?: number; limit?: number }) => {
    const response = await api.get('/library/search', { params });
    return response.data;
  },

  // Toggle bookmark
  toggleBookmark: async (sectionId: string) => {
    const response = await api.post(`/library/bookmarks/${sectionId}`);
    return response.data;
  },

  // Get user bookmarks
  getBookmarks: async () => {
    const response = await api.get('/library/bookmarks');
    return response.data;
  }
};