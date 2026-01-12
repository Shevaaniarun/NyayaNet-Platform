import { useState, useEffect } from 'react';
import { getNotifications } from '../api/notificationsAPI';

export function useNotificationCount(refreshInterval = 30000) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const data = await getNotifications({ page: 1, limit:  1 });
      setUnreadCount(data.unreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, refreshInterval);

    const handleNotificationRead = () => {
      fetchUnreadCount();
    };

    window.addEventListener('notificationRead', handleNotificationRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationRead', handleNotificationRead);
    };
  }, [refreshInterval]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
}