import { ChevronRight } from 'lucide-react';

interface ProfileStatsProps {
    followerCount: number;
    followingCount: number;
    postCount: number;
    discussionCount: number;
    onFollowersClick?: () => void;
    onFollowingClick?: () => void;
    onPostsClick?: () => void;
    onDiscussionsClick?: () => void;
}

export function ProfileStats({ followerCount, followingCount, postCount, discussionCount, onFollowersClick, onFollowingClick, onPostsClick, onDiscussionsClick }: ProfileStatsProps) {
    const stats = [
        { label: 'Followers', count: followerCount, onClick: onFollowersClick, clickable: !!onFollowersClick },
        { label: 'Following', count: followingCount, onClick: onFollowingClick, clickable: !!onFollowingClick },
        { label: 'Posts', count: postCount, onClick: onPostsClick, clickable: !!onPostsClick },
        { label: 'Discussions', count: discussionCount, onClick: onDiscussionsClick, clickable: !!onDiscussionsClick },
    ];

    const formatCount = (count: number): string => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    return (
        <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <button key={index} onClick={stat.onClick} disabled={!stat.clickable} className={`group text-center rounded-lg p-3 transition-all ${stat.clickable ? 'hover:bg-constitution-gold/10 cursor-pointer' : 'cursor-default'}`}>
                        <p className={`font-heading font-bold text-2xl ${stat.clickable ? 'text-ink-gray group-hover:text-constitution-gold transition-colors' : 'text-ink-gray'}`}>{formatCount(stat.count)}</p>
                        <p className={`text-sm flex items-center justify-center gap-1 ${stat.clickable ? 'text-ink-gray/60 group-hover:text-constitution-gold group-hover:underline transition-colors' : 'text-ink-gray/60'}`}>{stat.label}{stat.clickable && <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
