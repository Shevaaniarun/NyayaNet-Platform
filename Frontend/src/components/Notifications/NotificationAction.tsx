import { CheckCheck, Search, Trash2, BarChart3 } from 'lucide-react';

interface NotificationActionsProps {
    onMarkAllAsRead: () => void;
    onSearch: (query: string) => void;
    onBulkDelete: () => void;
    onViewStats: () => void;
    isMarkingAllRead:  boolean;
    isBulkDeleting: boolean;
}

export function NotificationActions({ 
    onMarkAllAsRead, 
    onSearch, 
    onBulkDelete,
    onViewStats,
    isMarkingAllRead,
    isBulkDeleting
}: NotificationActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ink-gray/40" />
                <input
                    type="text"
                    placeholder="Search notifications..."
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-constitution-gold/30 rounded-lg text-sm text-ink-gray placeholder-ink-gray/40 focus:outline-none focus: border-constitution-gold transition-colors"
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onViewStats}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Stats</span>
                </button>

                <button
                    onClick={onBulkDelete}
                    disabled={isBulkDeleting}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{isBulkDeleting ?  'Deleting...' :  'Delete All'}</span>
                </button>

                <button
                    onClick={onMarkAllAsRead}
                    disabled={isMarkingAllRead}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover: bg-constitution-gold/90 transition-colors disabled:opacity-50"
                >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">{isMarkingAllRead ? 'Marking.. .' : 'Mark All Read'}</span>
                </button>
            </div>
        </div>
    );
}