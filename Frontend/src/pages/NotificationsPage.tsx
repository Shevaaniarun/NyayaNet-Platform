import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { NotificationItem } from '../components/Notifications/NotificationItem';
import { NotificationFilters } from '../components/Notifications/NotificationFilter';
import { NotificationActions } from '../components/Notifications/NotificationAction';
import {
    getNotifications,
    markNotificationAsRead,
    markAllAsRead,
    searchNotifications,
    Notification
} from '../api/notificationsAPI';
import { toast } from 'react-toastify';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page:  1,
        limit: 20,
        pages: 1
    });

    useEffect(() => {
        fetchNotifications();
    }, [selectedType, showUnreadOnly, currentPage]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            
            const params:  any = {
                page: currentPage,
                limit:  20
            };

            if (selectedType && selectedType !== '') {
                params.type = selectedType;
            }

            if (showUnreadOnly) {
                params.unread = true;
            }


            const data = await getNotifications(params);

            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setPagination(data. pagination);
        } catch (error:  any) {
            console.error('❌ Fetch error:', error);
            toast.error(error.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (! notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ?  { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                toast.success('Marked as read');
            } catch (error: any) {
                toast.error('Failed to mark as read');
            }
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setIsMarkingAllRead(true);
            await markAllAsRead();
            setNotifications(prev => prev. map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark all as read');
        } finally {
            setIsMarkingAllRead(false);
        }
    };

    const handleSearch = async (query:  string) => {
        setSearchQuery(query);
        if (query.trim()) {
            try {
                setLoading(true);
                const results = await searchNotifications({ q: query });
                setNotifications(results);
                setPagination({ total: results.length, page: 1, limit: 20, pages: 1 });
            } catch (error: any) {
                toast.error('Search failed');
            } finally {
                setLoading(false);
            }
        } else {
            setCurrentPage(1);
        }
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        setCurrentPage(1);
        setSearchQuery('');
    };

    const handleToggleUnread = () => {
        setShowUnreadOnly(!showUnreadOnly);
        setCurrentPage(1);
        setSearchQuery(''); 
    };

    return (
        <div className="min-h-screen bg-parchment-light py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="aged-paper rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-constitution-gold/20 rounded-full flex items-center justify-center">
                            <Bell className="w-6 h-6 text-constitution-gold" />
                        </div>
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-ink-gray">Notifications</h1>
                            <p className="text-ink-gray/60">
                                {unreadCount > 0 ?  `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' :  ''}` : 'You\'re all caught up!'}
                            </p>
                        </div>
                    </div>
                </div>

                <NotificationActions
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onSearch={handleSearch}
                    isMarkingAllRead={isMarkingAllRead}
                />

                <NotificationFilters
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
                    showUnreadOnly={showUnreadOnly}
                    onToggleUnread={handleToggleUnread}
                />

                <div className="aged-paper rounded-lg overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-constitution-gold animate-spin mb-4" />
                            <p className="text-ink-gray/60">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Bell className="w-16 h-16 text-ink-gray/20 mb-4" />
                            <p className="text-ink-gray/60 text-lg mb-2">No notifications</p>
                            <p className="text-ink-gray/40 text-sm">
                                {searchQuery ? 'No results found for your search' : selectedType ? `No ${selectedType} notifications` : 'You\'ll see notifications here when they arrive'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={handleNotificationClick}
                                />
                            ))}

                            {pagination.pages > 1 && (
                                <div className="flex items-center justify-center gap-2 p-4 border-t border-constitution-gold/10">
                                    <button
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white border border-constitution-gold/30 rounded-lg text-sm font-medium text-ink-gray disabled:opacity-50 hover:bg-constitution-gold/5 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-ink-gray/60">
                                        Page {pagination.page} of {pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        disabled={currentPage === pagination.pages}
                                        className="px-4 py-2 bg-white border border-constitution-gold/30 rounded-lg text-sm font-medium text-ink-gray disabled: opacity-50 hover:bg-constitution-gold/5 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}