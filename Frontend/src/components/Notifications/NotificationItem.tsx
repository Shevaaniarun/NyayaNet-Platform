import { Bell, UserPlus, Heart, MessageSquare, Award, Mail, Zap, AtSign, Trash2 } from 'lucide-react';
import { Notification } from '../../api/notificationsAPI';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface NotificationItemProps {
    notification: Notification;
    onClick: (notification: Notification) => void;
    onDelete: (notificationId: string) => void;
}

export function NotificationItem({ notification, onClick, onDelete }: NotificationItemProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'NEW_FOLLOWER': 
                return <UserPlus className="w-5 h-5 text-constitution-gold" />;
            case 'POST_LIKE':
                return <Heart className="w-5 h-5 text-red-500" />;
            case 'POST_COMMENT':  
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'DISCUSSION_REPLY':
                return <MessageSquare className="w-5 h-5 text-emerald-500" />;
            case 'DISCUSSION_UPVOTE':
                return <Award className="w-5 h-5 text-amber-500" />;
            case 'CONNECTION_REQUEST':
                return <UserPlus className="w-5 h-5 text-purple-500" />;
            case 'MESSAGE_RECEIVED': 
                return <Mail className="w-5 h-5 text-indigo-500" />;
            case 'AI_RESULT_READY':
                return <Zap className="w-5 h-5 text-constitution-gold" />;
            case 'MENTION':
                return <AtSign className="w-5 h-5 text-pink-500" />;
            default:
                return <Bell className="w-5 h-5 text-constitution-gold" />;
        }
    };

    const getIconBgColor = (type: string) => {
        switch (type) {
            case 'NEW_FOLLOWER':
                return 'bg-constitution-gold/10';
            case 'POST_LIKE':
                return 'bg-red-500/10';
            case 'POST_COMMENT':
                return 'bg-blue-500/10';
            case 'DISCUSSION_REPLY':
                return 'bg-emerald-500/10';
            case 'DISCUSSION_UPVOTE':
                return 'bg-amber-500/10';
            case 'CONNECTION_REQUEST':
                return 'bg-purple-500/10';
            case 'MESSAGE_RECEIVED':
                return 'bg-indigo-500/10';
            case 'AI_RESULT_READY':
                return 'bg-constitution-gold/10';
            case 'MENTION':
                return 'bg-pink-500/10';
            default:
                return 'bg-constitution-gold/10';
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this notification?')) {
            setIsDeleting(true);
            await onDelete(notification.id);
        }
    };

    const commentPreview = notification.data?.commentPreview;
    const replyPreview = notification.data?.replyPreview;

    return (
        <div
            className={`flex items-start gap-4 p-4 border-b border-constitution-gold/10 hover:bg-constitution-gold/5 transition-colors relative group ${
                !notification.isRead ? 'bg-constitution-gold/5' : ''
            }`}
        >
            <div 
                onClick={() => onClick(notification)}
                className="flex items-start gap-4 flex-1 cursor-pointer"
            >
                <div className={`p-2 rounded-full ${getIconBgColor(notification.type)} flex-shrink-0`}>
                    {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-ink-gray">
                                {notification.title}
                            </p>
                            
                            <p className="text-sm text-ink-gray/70 mt-1">
                                {notification.message}
                            </p>
                            {notification.type === 'POST_COMMENT' && commentPreview && (
                                <p className="text-sm text-ink-gray/80 mt-2 italic">
                                    "{commentPreview}"
                                </p>
                            )}

                            {notification.type === 'DISCUSSION_REPLY' && replyPreview && (
                                <p className="text-sm text-ink-gray/80 mt-2 italic">
                                    "{replyPreview}"
                                </p>
                            )}

                            <p className="text-xs text-ink-gray/50 mt-2">
                                {timeAgo}
                            </p>
                        </div>

                        {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-full text-red-500 disabled:opacity-50"
                title="Delete notification"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}