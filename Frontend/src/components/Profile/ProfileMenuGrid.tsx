
import { FileText, MessageSquare, Bookmark, Heart, Users, UserCheck } from 'lucide-react';

interface ProfileMenuGridProps {
    menuStats: {
        posts: number;
        discussions: number;
        followers: number;
        following: number;
        bookmarks: number;
        likedPosts: number;
        likedDiscussions: number;
    };
    isOwnProfile: boolean;
    onNavigate: (view: string) => void;
}

export function ProfileMenuGrid({
    menuStats,
    isOwnProfile,
    onNavigate
}: ProfileMenuGridProps) {

    const menuItems = [
        { id: 'posts', label: 'Posts', icon: FileText, count: menuStats.posts },
        { id: 'discussions', label: 'Discussions', icon: MessageSquare, count: menuStats.discussions },
        { id: 'followers', label: 'Followers', icon: Users, count: menuStats.followers },
        { id: 'following', label: 'Following', icon: UserCheck, count: menuStats.following },
    ];

    if (isOwnProfile) {
        menuItems.push(
            { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: menuStats.bookmarks },
            { id: 'liked-posts', label: 'Liked Posts', icon: Heart, count: menuStats.likedPosts },
            { id: 'liked-discussions', label: 'Liked Discussions', icon: Heart, count: menuStats.likedDiscussions }
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="p-6 rounded-lg border border-constitution-gold/30 bg-neutral-900 hover:bg-neutral-800 transition-all text-left group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <item.icon className="w-6 h-6 text-constitution-gold group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold text-judge-ivory">
                            {item.count}
                        </span>
                    </div>
                    <span className="font-medium text-white group-hover:text-judge-ivory transition-colors">
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
