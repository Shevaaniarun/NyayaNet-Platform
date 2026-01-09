/// <reference types="vite/client" />
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const getAuthToken = (): string | null => localStorage.getItem('token');

const createHeaders = (includeAuth = false): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type':   'application/json' };
    if (includeAuth) {
        const token = getAuthToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    sourceType: string | null;
    sourceId: string | null;
    data? :  {
        userId? :  string;
        userName?: string;
    };
    isRead: boolean;
    createdAt: string;
}

export interface GetNotificationsResponse {
    notifications: Notification[];
    unreadCount: number;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export async function getNotifications(params?: {
    type?: string;
    unread?: boolean;
    page?: number;
    limit?: number;
}): Promise<GetNotificationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.type && params. type !== '') {
        queryParams.append('type', params.type);
    }
    
    if (params?.unread !== undefined && params.unread !== null) {
        queryParams.append('unread', params.unread. toString());
    }
    
    if (params?.page) {
        queryParams.append('page', params.page.toString());
    }
    
    if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
    }

    const url = `${API_BASE_URL}/notifications?${queryParams. toString()}`;

    const response = await fetch(url, {
        headers: createHeaders(true)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch notifications');
    }

    const result = await response.json();
    return result. data;
}

export async function markNotificationAsRead(notificationId:   string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: createHeaders(true)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark notification as read');
    }
}

export async function markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: createHeaders(true)
    });

    if (!response.ok) {
        const error = await response. json();
        throw new Error(error.message || 'Failed to mark all as read');
    }
}

export async function searchNotifications(params:   {
    q?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.type) queryParams.append('type', params.type);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await fetch(`${API_BASE_URL}/notifications/search?${queryParams}`, {
        headers: createHeaders(true)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to search notifications');
    }

    const result = await response.json();
    return result.data. notifications;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  countByType: Record<string, number>;
  countByDay: Array<{ date: string; count:  number }>;
}

export async function getNotificationStats(): Promise<NotificationStats> {
  const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
    headers: createHeaders(true)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notification stats');
  }

  const result = await response.json();
  return result. data;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: createHeaders(true)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete notification');
  }
}

export async function bulkDeleteNotifications(params: {
  notificationIds?:  string[];
  deleteAllRead?:  boolean;
  deleteAllBefore?: string;
}): Promise<{ deletedCount: number }> {
  const response = await fetch(`${API_BASE_URL}/notifications/bulk-delete`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to bulk delete notifications');
  }

  const result = await response.json();
  return result.data;
}
