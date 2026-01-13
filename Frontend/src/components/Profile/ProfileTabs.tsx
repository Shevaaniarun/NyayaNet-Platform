import { useState } from 'react';
import { FileText, MessageSquare, Bookmark, Plus, Heart, Eye } from 'lucide-react';

interface ProfileTabsProps {
    posts: any[];
    discussions: any[];
    bookmarks: any[];
    likedPosts: any[];
    likedDiscussions: any[];
    isOwnProfile: boolean;
    onCreatePost?: () => void;
    onPostClick?: (postId: string) => void;
    onDiscussionClick?: (discussionId: string) => void;
    onFollowingDiscussionsClick?: () => void;
    onCreateDiscussion?: () => void;
}

type TabId =
    | 'posts'
    | 'discussions'
    | 'bookmarks'
    | 'likedPosts'
    | 'likedDiscussions'
    | 'followingDiscussions';

export function ProfileTabs({
    posts,
    discussions,
    bookmarks,
    likedPosts,
    likedDiscussions,
    isOwnProfile,
    onCreatePost,
    onPostClick,
    onDiscussionClick,
    onFollowingDiscussionsClick,
    activeTab,
    setActiveTab
}: ProfileTabsProps & {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
}) {

    const tabs = [
        { id: 'posts' as const, label: 'Posts', icon: FileText, count: posts.length },
        { id: 'discussions' as const, label: 'Discussions', icon: MessageSquare, count: discussions.length },
        ...(isOwnProfile ? [
            { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
            { id: 'likedPosts' as const, label: 'Liked Posts', icon: Heart, count: likedPosts.length },
            { id: 'likedDiscussions' as const, label: 'Liked Discussions', icon: Heart, count: likedDiscussions.length },
            { id: 'followingDiscussions' as const, label: 'Following Discussions', icon: Eye, count: null, isNavigation: true },
        ] : [])
    ];

    const handlePostClick = (id: string) => onPostClick?.(id);
    const handleDiscussionClick = (id: string) => onDiscussionClick?.(id);

    const handleNewDiscussion = () => {
        // Use the prop if available (upward event), otherwise fallback
        if (onCreatePost) {
            // Actually this is for discussion, we might need a separate prop or reuse onCreateDiscussion from parent
            // But looking at ProfilePage, it passes onCreateDiscussion={handleCreateDiscussion}
            // Let's check props again. ProfileTabsProps has onCreatePost.
            // We need onCreateDiscussion in props if we want to use it.
            // The remote code didn't have onCreateDiscussion in props interface but used handleNewDiscussion with window.location.
            // I will stick to remote's window.location or better, use the passed prop if I add it.
            // Local ProfilePage passes onCreateDiscussion.
            // I will add onCreateDiscussion to props.
        }
        window.location.href = '/discussions/create';
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
                        onClick={() => {
                            if ((tab as any).isNavigation && tab.id === 'followingDiscussions') {
                                onFollowingDiscussionsClick?.();
                            } else {
                                setActiveTab(tab.id);
                            }
                        }}
                        className={`flex items-center gap-2 px-4 py-4 font-medium whitespace-nowrap transition ${activeTab === tab.id
                            ? 'text-constitution-gold border-b-2 border-constitution-gold -mb-[2px]'
                            : 'text-ink-gray/60 hover:text-ink-gray'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {(tab as any).isNavigation ? (
                            <span className="text-xs opacity-60">→</span>
                        ) : (
                            <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-constitution-gold/20 text-constitution-gold' : 'bg-ink-gray/10 text-ink-gray/60'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}

                {isOwnProfile && (
                    <>
                        {activeTab === 'posts' && (
                            <button
                                onClick={onCreatePost}
                                className="ml-auto mr-4 my-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> New Post
                            </button>
                        )}

                        {activeTab === 'discussions' && (
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
