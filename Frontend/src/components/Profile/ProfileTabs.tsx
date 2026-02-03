import { useState } from 'react';
import { FileText, MessageSquare, Bookmark, Plus, Heart, Users, UserCheck } from 'lucide-react';

interface ProfileTabsProps {
    posts: any[];
    discussions: any[];
    bookmarks: any[];
    likedPosts: any[];
    likedDiscussions: any[];
    followers: any[]; // Add this
    following: any[]; // Add this
    isOwnProfile: boolean;
    onCreatePost?: () => void;
    onCreateDiscussion?: () => void;
    onPostClick?: (postId: string) => void;
    onDiscussionClick?: (discussionId: string) => void;
    onUserClick?: (userId: string) => void; // Add this for user clicks
    onFollow?: (userId: string) => void; // Add this for follow actions
    onUnfollow?: (userId: string) => void; // Add this for unfollow actions
}

type TabId =
    | 'posts'
    | 'discussions'
    | 'bookmarks'
    | 'likedPosts'
    | 'likedDiscussions'
    | 'followers'  // Add this
    | 'following'; // Add this

export function ProfileTabs({
    posts,
    discussions,
    bookmarks,
    likedPosts,
    likedDiscussions,
    followers, // Add this
    following, // Add this
    isOwnProfile,
    onCreatePost,
    onCreateDiscussion,
    onPostClick,
    onDiscussionClick,
    onUserClick, // Add this
    onFollow,    // Add this
    onUnfollow   // Add this
}: ProfileTabsProps) {

    const [activeTab, setActiveTab] = useState<TabId>('posts');

    const tabs = [
        { id: 'posts' as const, label: 'Posts', icon: FileText, count: posts.length },
        { id: 'discussions' as const, label: 'Discussions', icon: MessageSquare, count: discussions.length },
        { id: 'followers' as const, label: 'Followers', icon: Users, count: followers.length },
        { id: 'following' as const, label: 'Following', icon: UserCheck, count: following.length },
        ...(isOwnProfile ? [
            { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
            { id: 'likedPosts' as const, label: 'Liked Posts', icon: Heart, count: likedPosts.length },
            { id: 'likedDiscussions' as const, label: 'Liked Discussions', icon: Heart, count: likedDiscussions.length }
        ] : [])
    ];

    const handlePostClick = (id: string) => onPostClick?.(id);
    const handleDiscussionClick = (id: string) => onDiscussionClick?.(id);
    const handleUserClick = (userId: string) => onUserClick?.(userId);

    const handleNewDiscussion = () => {
        onCreateDiscussion?.();
    };

    /* ---------------- Cards ---------------- */

    const renderPostCard = (post: any, showAuthor = false) => (
        <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 cursor-pointer transition"
        >
            {showAuthor && post.authorName && (
                <p className="text-xs text-ink-gray/60 mb-1">by {post.authorName}</p>
            )}

            <h3 className="font-medium text-ink-gray mb-2">
                {post.title || 'Untitled Post'}
            </h3>

            <p className="text-sm text-ink-gray/70 line-clamp-2">
                {post.content}
            </p>

            <div className="flex gap-4 mt-3 text-xs text-ink-gray/50">
                <span>❤️ {post.likeCount || 0}</span>
                <span>💬 {post.commentCount || 0}</span>
            </div>
        </div>
    );

    const renderDiscussionCard = (d: any, showAuthor = false) => (
        <div
            key={d.id}
            onClick={() => handleDiscussionClick(d.id)}
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
                <p className="text-xs text-ink-gray/60 mb-1">by {d.authorName}</p>
            )}

            <h3 className="font-medium text-ink-gray mb-1">{d.title}</h3>

            <p className="text-sm text-ink-gray/70 line-clamp-2 italic">
                "{d.description}"
            </p>

            <div className="flex gap-4 mt-3 text-xs text-ink-gray/50">
                <span>💬 {d.replyCount || 0}</span>
                <span>👍 {d.upvoteCount || 0}</span>
            </div>
        </div>
    );

    const renderUserCard = (user: any, isFollowerTab: boolean) => (
        <div
            key={user.id}
            className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition"
        >
            <div className="flex items-center justify-between">
                <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => handleUserClick(user.id)}
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
                        <h3 className="font-medium text-ink-gray">{user.fullName}</h3>
                        <p className="text-sm text-ink-gray/60">{user.designation || user.role}</p>
                        {user.organization && (
                            <p className="text-xs text-ink-gray/50">{user.organization}</p>
                        )}
                    </div>
                </div>
                
                {/* Action buttons for non-own profile */}
                {!isOwnProfile && isFollowerTab && user.isFollowingBack === false && (
                    <button
                        onClick={() => onFollow?.(user.id)}
                        className="px-3 py-1.5 bg-constitution-gold text-justice-black rounded-lg text-sm hover:bg-constitution-gold/90 transition-colors"
                    >
                        Follow Back
                    </button>
                )}
                
                {isFollowerTab && user.isFollowingBack === true && (
                    <button
                        onClick={() => onUnfollow?.(user.id)}
                        className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 transition-colors"
                    >
                        Unfollow
                    </button>
                )}
                
                {!isFollowerTab && ( // In Following tab
                    <button
                        onClick={() => onUnfollow?.(user.id)}
                        className="px-3 py-1.5 border border-constitution-gold/30 text-constitution-gold rounded-lg text-sm hover:bg-constitution-gold/5 transition-colors"
                    >
                        Unfollow
                    </button>
                )}
            </div>
            
            {/* Connection info */}
            <div className="mt-3 flex gap-4 text-xs text-ink-gray/50">
                <span>Followers: {user.followerCount || 0}</span>
                <span>Following: {user.followingCount || 0}</span>
                {isFollowerTab && user.isFollowingBack && (
                    <span className="text-constitution-gold">Mutual</span>
                )}
            </div>
        </div>
    );

    const emptyState = (Icon: any, text: string) => (
        <div className="text-center py-12">
            <Icon className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" />
            <p className="text-ink-gray/60">{text}</p>
        </div>
    );

    /* ---------------- Render ---------------- */

    return (
        <div className="aged-paper rounded-lg border border-constitution-gold/20">

            {/* Tabs */}
            <div className="flex border-b border-constitution-gold/20 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-4 font-medium whitespace-nowrap transition ${
                            activeTab === tab.id
                                ? 'text-constitution-gold border-b-2 border-constitution-gold -mb-[2px]'
                                : 'text-ink-gray/60 hover:text-ink-gray'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-constitution-gold/20 text-constitution-gold">
                            {tab.count}
                        </span>
                    </button>
                ))}

                {isOwnProfile && (
                    <>
                        {activeTab === 'posts' && onCreatePost && (
                            <button
                                onClick={onCreatePost}
                                className="ml-auto mr-4 my-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> New Post
                            </button>
                        )}

                        {activeTab === 'discussions' && onCreateDiscussion && (
                            <button
                                onClick={handleNewDiscussion}
                                className="ml-auto mr-4 my-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> New Discussion
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'posts' &&
                    (posts.length
                        ? <div className="space-y-4">{posts.map(p => renderPostCard(p))}</div>
                        : emptyState(FileText, 'No posts yet'))}

                {activeTab === 'discussions' &&
                    (discussions.length
                        ? <div className="space-y-4">{discussions.map(d => renderDiscussionCard(d))}</div>
                        : emptyState(MessageSquare, 'No discussions yet'))}

                {activeTab === 'followers' &&
                    (followers.length
                        ? <div className="space-y-4">{followers.map(user => renderUserCard(user, true))}</div>
                        : emptyState(Users, 'No followers yet'))}

                {activeTab === 'following' &&
                    (following.length
                        ? <div className="space-y-4">{following.map(user => renderUserCard(user, false))}</div>
                        : emptyState(UserCheck, 'Not following anyone yet'))}

                {activeTab === 'bookmarks' && isOwnProfile &&
                    (bookmarks.length
                        ? <div className="space-y-4">
                            {bookmarks.map(b => (
                                <div
                                    key={b.id}
                                    onClick={() =>
                                        b.entityType === 'POST'
                                            ? handlePostClick(b.entityId)
                                            : handleDiscussionClick(b.entityId)
                                    }
                                    className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 cursor-pointer"
                                >
                                    <h3 className="font-medium text-ink-gray">{b.title}</h3>
                                </div>
                            ))}
                        </div>
                        : emptyState(Bookmark, 'No bookmarks yet'))}

                {activeTab === 'likedPosts' && isOwnProfile &&
                    (likedPosts.length
                        ? <div className="space-y-4">{likedPosts.map(p => renderPostCard(p, true))}</div>
                        : emptyState(Heart, 'No liked posts yet'))}

                {activeTab === 'likedDiscussions' && isOwnProfile &&
                    (likedDiscussions.length
                        ? <div className="space-y-4">{likedDiscussions.map(d => renderDiscussionCard(d, true))}</div>
                        : emptyState(Heart, 'No liked discussions yet'))}
            </div>
        </div>
    );
}