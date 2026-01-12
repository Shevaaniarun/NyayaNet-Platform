import { X, TrendingUp, Bell, CheckCircle, Calendar } from 'lucide-react';
import { NotificationStats } from '../../api/notificationsAPI';

interface NotificationStatsModalProps {
    stats: NotificationStats | null;
    onClose: () => void;
}

export function NotificationStatsModal({ stats, onClose }: NotificationStatsModalProps) {
    if (!stats) return null;

    const typeLabels:  Record<string, string> = {
        'NEW_FOLLOWER':  'New Followers',
        'POST_LIKE': 'Post Likes',
        'POST_COMMENT': 'Comments',
        'DISCUSSION_REPLY': 'Replies',
        'DISCUSSION_UPVOTE': 'Upvotes',
        'CONNECTION_REQUEST': 'Connections',
        'MESSAGE_RECEIVED': 'Messages',
        'AI_RESULT_READY': 'AI Results',
        'MENTION': 'Mentions'
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="aged-paper rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-constitution-gold/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-constitution-gold/20 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-constitution-gold" />
                        </div>
                        <h2 className="font-heading text-2xl font-bold text-ink-gray">Notification Statistics</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-constitution-gold/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-ink-gray" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Bell className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-ink-gray/60">Total</p>
                                    <p className="text-2xl font-bold text-ink-gray">{stats.totalNotifications}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Bell className="w-8 h-8 text-red-500" />
                                <div>
                                    <p className="text-sm text-ink-gray/60">Unread</p>
                                    <p className="text-2xl font-bold text-ink-gray">{stats. unreadCount}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-ink-gray/60">Read</p>
                                    <p className="text-2xl font-bold text-ink-gray">{stats. readCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-heading text-lg font-semibold text-ink-gray mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-constitution-gold" />
                            By Type
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(stats.countByType).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between p-3 bg-constitution-gold/5 rounded-lg border border-constitution-gold/20">
                                    <span className="font-medium text-ink-gray">{typeLabels[type] || type}</span>
                                    <span className="px-3 py-1 bg-constitution-gold text-justice-black rounded-full text-sm font-bold">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {stats.countByDay.length > 0 && (
                        <div>
                            <h3 className="font-heading text-lg font-semibold text-ink-gray mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-constitution-gold" />
                                Last 7 Days
                            </h3>
                            <div className="space-y-2">
                                {stats.countByDay.map((day) => (
                                    <div key={day.date} className="flex items-center justify-between p-3 bg-white rounded-lg border border-constitution-gold/20">
                                        <span className="text-sm text-ink-gray">{new Date(day.date).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-constitution-gold/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-constitution-gold rounded-full"
                                                    style={{ width: `${(day.count / stats.totalNotifications) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-ink-gray w-8 text-right">{day.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-constitution-gold/20">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}