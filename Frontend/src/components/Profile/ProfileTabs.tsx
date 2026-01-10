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
}

type TabId = 'posts' | 'discussions' | 'bookmarks' | 'likedPosts' | 'likedDiscussions' | 'followingDiscussions';

export function ProfileTabs({
    posts, discussions, bookmarks, likedPosts, likedDiscussions,
    isOwnProfile, onCreatePost, onPostClick, onDiscussionClick, onFollowingDiscussionsClick
}: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>('posts');

    const tabs = [
        { id: 'posts' as const, label: 'My Posts', icon: FileText, count: posts.length },
        { id: 'discussions' as const, label: 'My Discussions', icon: MessageSquare, count: discussions.length },
        ...(isOwnProfile ? [
            { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, count: bookmarks.length },
            { id: 'likedPosts' as const, label: 'Liked Posts', icon: Heart, count: likedPosts.length },
            { id: 'likedDiscussions' as const, label: 'Liked Discussions', icon: Heart, count: likedDiscussions.length },
            { id: 'followingDiscussions' as const, label: 'Following Discussions', icon: Eye, count: null, isNavigation: true },
        ] : []),
    ];

    const handlePostClick = (postId: string) => {
        if (onPostClick) onPostClick(postId);
    };

    const handleDiscussionClick = (discussionId: string) => {
        if (onDiscussionClick) onDiscussionClick(discussionId);
    };

    // Compact Post Card for profile tabs
    const renderPostCard = (post: any, showAuthor = false) => (
        <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition-colors cursor-pointer"
        >
            {showAuthor && post.authorName && (
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-constitution-gold/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-constitution-gold">{post.authorName?.charAt(0)}</span>
                    </div>
                    <span className="text-xs text-ink-gray/60">{post.authorName}</span>
                </div>
            )}
            <h3 className="font-medium text-ink-gray mb-2">{post.title || 'Untitled Post'}</h3>
            <p className="text-sm text-ink-gray/70 line-clamp-2">{post.content}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-ink-gray/50">
                <span>❤️ {post.likeCount || 0} likes</span>
                <span>💬 {post.commentCount || 0} comments</span>
            </div>
        </div>
    );

    // Compact Discussion Card for profile tabs
    const renderDiscussionCard = (d: any, showAuthor = false) => (
        <div
            key={d.id}
            onClick={() => handleDiscussionClick(d.id)}
            className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition-colors cursor-pointer"
        >
            <div className="flex items-center gap-2 mb-2">
                {d.discussionType && (
                    <span className="px-2 py-0.5 rounded text-xs bg-constitution-gold/10 text-constitution-gold uppercase">
                        {d.discussionType.replace('_', ' ')}
                    </span>
                )}
                {d.category && (
                    <span className="px-2 py-0.5 rounded text-xs bg-ink-gray/10 text-ink-gray/60">
                        {d.category.replace('_', ' ')}
                    </span>
                )}
                {d.isResolved && <span className="text-green-400 text-xs">✓ Resolved</span>}
            </div>
            {showAuthor && d.authorName && (
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-ink-gray/60">by {d.authorName}</span>
                </div>
            )}
            <h3 className="font-medium text-ink-gray mb-2">{d.title}</h3>
            <p className="text-sm text-ink-gray/70 line-clamp-2 italic">"{d.description}"</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-ink-gray/50">
                <span>💬 {d.replyCount || 0} replies</span>
                <span>👍 {d.upvoteCount || 0} upvotes</span>
            </div>
        </div>
    );

    const renderEmptyState = (icon: React.ReactNode, message: string, actionLabel?: string, onAction?: () => void) => (
        <div className="text-center py-12">
            <div className="w-12 h-12 text-ink-gray/30 mx-auto mb-4 flex items-center justify-center">{icon}</div>
            <p className="text-ink-gray/60">{message}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="mt-4 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90">
                    {actionLabel}
                </button>
            )}
        </div>
    );

    return (
        <div className="aged-paper rounded-lg border border-constitution-gold/20">
            {/* Tab Headers */}
            <div className="flex border-b border-constitution-gold/20 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { if ((tab as any).isNavigation && tab.id === 'followingDiscussions') { onFollowingDiscussionsClick?.(); } else { setActiveTab(tab.id); } }}
                        className={`flex items-center gap-2 px-4 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'text-constitution-gold border-b-2 border-constitution-gold -mb-[2px]'
                            : 'text-ink-gray/60 hover:text-ink-gray'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {(tab as any).isNavigation ? (
                            <span className="text-xs opacity-60">→</span>
                        ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-constitution-gold/20 text-constitution-gold' : 'bg-ink-gray/10 text-ink-gray/60'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}

            </div>

            {/* Tab Content */}
            <div className="p-6">
                {/* My Posts */}
                {activeTab === 'posts' && (
                    posts.length > 0 ? (
                        <div className="space-y-4">{posts.map(post => renderPostCard(post))}</div>
                    ) : renderEmptyState(<FileText className="w-12 h-12" />, "No posts yet", isOwnProfile ? "Create Your First Post" : undefined, onCreatePost)
                )}

                {/* My Discussions */}
                {activeTab === 'discussions' && (
                    discussions.length > 0 ? (
                        <div className="space-y-4">{discussions.map(d => renderDiscussionCard(d))}</div>
                    ) : renderEmptyState(<MessageSquare className="w-12 h-12" />, "No discussions yet")
                )}

                {/* Bookmarks */}
                {activeTab === 'bookmarks' && isOwnProfile && (
                    bookmarks.length > 0 ? (
                        <div className="space-y-4">
                            {bookmarks.map((b) => (
                                <div
                                    key={b.id}
                                    onClick={() => b.entityType === 'POST' ? handlePostClick(b.entityId) : handleDiscussionClick(b.entityId)}
                                    className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{b.entityType}</span>
                                        {b.folder && <span className="px-2 py-0.5 rounded text-xs bg-constitution-gold/10 text-constitution-gold">{b.folder}</span>}
                                    </div>
                                    <h3 className="font-medium text-ink-gray">{b.title}</h3>
                                    {b.authorName && <p className="text-sm text-ink-gray/60 mt-1">by {b.authorName}</p>}
                                </div>
                            ))}
                        </div>
                    ) : renderEmptyState(<Bookmark className="w-12 h-12" />, "No bookmarks yet", undefined, undefined)
                )}

                {/* Liked Posts */}
                {activeTab === 'likedPosts' && isOwnProfile && (
                    likedPosts.length > 0 ? (
                        <div className="space-y-4">{likedPosts.map(post => renderPostCard(post, true))}</div>
                    ) : renderEmptyState(<Heart className="w-12 h-12" />, "No liked posts yet")
                )}

                {/* Liked Discussions */}
                {activeTab === 'likedDiscussions' && isOwnProfile && (
                    likedDiscussions.length > 0 ? (
                        <div className="space-y-4">{likedDiscussions.map(d => renderDiscussionCard(d, true))}</div>
                    ) : renderEmptyState(<Heart className="w-12 h-12" />, "No liked discussions yet")
                )}
            </div>
        </div>
    );
}
