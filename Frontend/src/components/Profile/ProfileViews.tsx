
import React from 'react';
import { FileText, MessageSquare, Bookmark, Heart, Users, UserCheck, ArrowLeft } from 'lucide-react';

interface ProfileViewProps {
    title: string;
    onBack: () => void;
    children: React.ReactNode;
}

export function ProfileViewHeader({ title, onBack }: { title: string, onBack: () => void }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-constitution-gold"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-heading font-bold text-judge-ivory">{title}</h2>
        </div>
    );
}

// --- Card Renderers (Moved from ProfileTabs) ---

export const renderPostCard = (post: any, onClick: (id: string) => void, showAuthor = false) => (
    <div
        key={post.id}
        onClick={() => onClick(post.id)}
        className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 cursor-pointer transition"
    >
        {showAuthor && post.authorName && (
            <p className="text-xs text-judge-ivory/60 mb-1">by {post.authorName}</p>
        )}
        <h3 className="font-medium text-judge-ivory mb-2">{post.title || 'Untitled Post'}</h3>
        <p className="text-sm text-judge-ivory/80 line-clamp-2">{post.content}</p>
        <div className="flex gap-4 mt-3 text-xs text-judge-ivory/60">
            <span>❤️ {post.likeCount || 0}</span>
            <span>💬 {post.commentCount || 0}</span>
        </div>
    </div>
);

export const renderDiscussionCard = (d: any, onClick: (id: string) => void, showAuthor = false) => (
    <div
        key={d.id}
        onClick={() => onClick(d.id)}
        className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 cursor-pointer transition"
    >
        <div className="flex gap-2 mb-2 text-xs">
            {d.discussionType && (
                <span className="px-2 py-0.5 rounded bg-constitution-gold/10 text-constitution-gold">
                    {d.discussionType.replace('_', ' ')}
                </span>
            )}
            {d.isResolved && <span className="text-green-400">✓ Resolved</span>}
        </div>
        {showAuthor && d.authorName && (
            <p className="text-xs text-judge-ivory/60 mb-1">by {d.authorName}</p>
        )}
        <h3 className="font-medium text-judge-ivory mb-1">{d.title}</h3>
        <p className="text-sm text-judge-ivory/80 line-clamp-2 italic">"{d.description}"</p>
        <div className="flex gap-4 mt-3 text-xs text-judge-ivory/60">
            <span>💬 {d.replyCount || 0}</span>
            <span>👍 {d.upvoteCount || 0}</span>
        </div>
    </div>
);

export const renderUserCard = (
    user: any,
    isOwnProfile: boolean,
    isFollowerTab: boolean,
    onUserClick: (id: string) => void,
    onFollow?: (id: string) => void,
    onUnfollow?: (id: string) => void
) => (
    <div
        key={user.id}
        className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition"
    >
        <div className="flex items-center justify-between">
            <div
                className="flex items-center gap-3 cursor-pointer flex-1"
                onClick={() => onUserClick(user.id)}
            >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-constitution-gold/20 flex items-center justify-center">
                    {user.profilePhotoUrl ? (
                        <img src={user.profilePhotoUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-lg font-heading text-constitution-gold">
                            {user.fullName?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-judge-ivory">{user.fullName}</h3>
                    <p className="text-sm text-judge-ivory/80">{user.designation || user.role}</p>
                    {user.organization && (
                        <p className="text-xs text-judge-ivory/60">{user.organization}</p>
                    )}
                </div>
            </div>

            {!isOwnProfile && isFollowerTab && user.isFollowingBack === false && (
                <button
                    onClick={() => onFollow?.(user.id)}
                    className="px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg text-sm hover:bg-constitution-gold/90 transition-colors"
                >
                    Follow Back
                </button>
            )}

            {(isFollowerTab && user.isFollowingBack === true) || (!isFollowerTab) ? (
                <button
                    onClick={() => onUnfollow?.(user.id)}
                    className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 transition-colors"
                >
                    Unfollow
                </button>
            ) : null}
        </div>

        <div className="mt-3 flex gap-4 text-xs text-judge-ivory/60">
            <span>Followers: {user.followerCount || 0}</span>
            <span>Following: {user.followingCount || 0}</span>
            {isFollowerTab && user.isFollowingBack && (
                <span className="text-constitution-gold">Mutual</span>
            )}
        </div>
    </div>
);

// --- List Components ---

export const PostList = ({ posts, onPostClick, emptyMessage = "No posts yet" }: { posts: any[], onPostClick: (id: string) => void, emptyMessage?: string }) => (
    <div className="space-y-4">
        {posts.length > 0 ? (
            posts.map(p => renderPostCard(p, onPostClick))
        ) : (
            <div className="text-center py-12 text-judge-ivory/60">{emptyMessage}</div>
        )}
    </div>
);

export const DiscussionList = ({ discussions, onDiscussionClick, emptyMessage = "No discussions yet" }: { discussions: any[], onDiscussionClick: (id: string) => void, emptyMessage?: string }) => (
    <div className="space-y-4">
        {discussions.length > 0 ? (
            discussions.map(d => renderDiscussionCard(d, onDiscussionClick))
        ) : (
            <div className="text-center py-12 text-judge-ivory/60">{emptyMessage}</div>
        )}
    </div>
);

export const UserList = ({
    users,
    isOwnProfile,
    isFollowerTab,
    onUserClick,
    onFollow,
    onUnfollow,
    emptyMessage = "No users found"
}: {
    users: any[],
    isOwnProfile: boolean,
    isFollowerTab: boolean,
    onUserClick: (id: string) => void,
    onFollow?: (id: string) => void,
    onUnfollow?: (id: string) => void,
    emptyMessage?: string
}) => (
    <div className="space-y-4">
        {users.length > 0 ? (
            users.map(u => renderUserCard(u, isOwnProfile, isFollowerTab, onUserClick, onFollow, onUnfollow))
        ) : (
            <div className="text-center py-12 text-judge-ivory/60">{emptyMessage}</div>
        )}
    </div>
);
