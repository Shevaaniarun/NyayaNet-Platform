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
        { label: 'Followers', count: followerCount, onClick: onFollowersClick },
        { label: 'Following', count: followingCount, onClick: onFollowingClick },
        { label: 'Posts', count: postCount, onClick: onPostsClick },
        { label: 'Discussions', count: discussionCount, onClick: onDiscussionsClick },
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
                    <button key={index} onClick={stat.onClick} className="text-center hover:bg-constitution-gold/5 rounded-lg p-3 transition-colors">
                        <p className="font-heading font-bold text-2xl text-ink-gray">{formatCount(stat.count)}</p>
                        <p className="text-sm text-ink-gray/60">{stat.label}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
