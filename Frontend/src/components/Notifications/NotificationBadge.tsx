interface NotificationBadgeProps {
    count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {count > 9 ? '9+' : count}
        </span>
    );
}