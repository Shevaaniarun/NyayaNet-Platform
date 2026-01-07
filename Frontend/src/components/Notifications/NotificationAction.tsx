import { CheckCheck, Search } from 'lucide-react';

interface NotificationActionsProps {
    onMarkAllAsRead: () => void;
    onSearch: (query: string) => void;
    isMarkingAllRead: boolean;
}

export function NotificationActions({ onMarkAllAsRead, onSearch, isMarkingAllRead }: NotificationActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-gray/40" />
                <input
                    type="text"
                    placeholder="Search notifications..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-constitution-gold/30 rounded-lg text-sm text-ink-gray placeholder-ink-gray/40 focus:outline-none focus:border-constitution-gold transition-colors"
                />
            </div>

            <button
                onClick={onMarkAllAsRead}
                disabled={isMarkingAllRead}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors disabled:opacity-50"
            >
                <CheckCheck className="w-4 h-4" />
                <span>{isMarkingAllRead ? 'Marking.. .' : 'Mark All as Read'}</span>
            </button>
        </div>
    );
}