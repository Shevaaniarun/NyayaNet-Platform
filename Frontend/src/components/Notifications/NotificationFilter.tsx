import { Filter } from 'lucide-react';

interface NotificationFiltersProps {
    selectedType: string;
    onTypeChange: (type: string) => void;
    showUnreadOnly: boolean;
    onToggleUnread: () => void;
}

export function NotificationFilters({
    selectedType,
    onTypeChange,
    showUnreadOnly,
    onToggleUnread
}: NotificationFiltersProps) {
    const notificationTypes = [
        { value: '', label: 'All' },
        { value: 'NEW_FOLLOWER', label:  'New Followers' },
        { value: 'POST_LIKE', label: 'Post Likes' },
        { value: 'POST_COMMENT', label: 'Comments' },
        { value: 'DISCUSSION_REPLY', label: 'Replies' },
        { value: 'CONNECTION_REQUEST', label: 'Connections' },
        { value:  'MESSAGE_RECEIVED', label: 'Messages' },
        { value: 'AI_RESULT_READY', label: 'AI Results' },
        { value: 'MENTION', label: 'Mentions' }
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-parchment-cream rounded-lg border border-constitution-gold/20">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-constitution-gold" />
                <span className="text-sm font-medium text-ink-gray">Filters: </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {notificationTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => onTypeChange(type.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedType === type.value
                                ? 'bg-constitution-gold text-justice-black'
                                : 'bg-white border border-constitution-gold/30 text-ink-gray hover:bg-constitution-gold/10'
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={showUnreadOnly}
                    onChange={onToggleUnread}
                    className="w-4 h-4 text-constitution-gold border-constitution-gold/30 rounded focus:ring-constitution-gold"
                />
                <span className="text-sm text-ink-gray">Unread only</span>
            </label>
        </div>
    );
}