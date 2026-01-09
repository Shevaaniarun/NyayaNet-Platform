import { useState } from 'react';
import { FileText, MessageSquare, Bookmark, Plus, X } from 'lucide-react';
import { PostCard } from '../PostCard';
import { toast } from 'react-toastify';

interface ProfileTabsProps {
    posts: any[];
    discussions: any[];
    bookmarks: any[];
    isOwnProfile: boolean;
    onCreatePost?: () => void;
}

export function ProfileTabs({ posts, discussions, bookmarks, isOwnProfile, onCreatePost }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'discussions' | 'bookmarks'>('posts');
    const [showCreatePostModal, setShowCreatePostModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', postType: 'POST' });

    const tabs = [
        { id: 'posts' as const, label: 'My Posts', icon: FileText, count: posts.length },
        { id: 'discussions' as const, label: 'My Discussions', icon: MessageSquare, count: discussions.length },
        ...(isOwnProfile ? [{ id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark, count: bookmarks.length }] : []),
    ];

    const handleCreatePost = () => {
        if (onCreatePost) {
            onCreatePost();
        } else {
            setShowCreatePostModal(true);
        }
    };

    const handleSubmitPost = () => {
        if (!newPost.title || !newPost.content) {
            alert('Please fill in both title and content');
            return;
        }
        // In a real app, this would call an API
        alert(`Post created: "${newPost.title}"`);
        setNewPost({ title: '', content: '', postType: 'POST' });
        setShowCreatePostModal(false);
    };

    return (
        <>
            <div className="aged-paper rounded-lg border border-constitution-gold/20">
                <div className="flex border-b border-constitution-gold/20">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id ? 'text-constitution-gold border-b-2 border-constitution-gold -mb-[2px]' : 'text-ink-gray/60 hover:text-ink-gray'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-constitution-gold/20 text-constitution-gold' : 'bg-ink-gray/10 text-ink-gray/60'}`}>{tab.count}</span>
                        </button>
                    ))}
                    {isOwnProfile && activeTab === 'posts' && (
                        <button onClick={handleCreatePost} className="ml-auto mr-4 my-2 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors flex items-center gap-2">
                            <Plus className="w-4 h-4" />New Post
                        </button>
                    )}
                </div>
                <div className="p-6">
                    {activeTab === 'posts' && (
                        <div>
                            {posts.length > 0 ? (
                                <div className="space-y-4">
                                    {posts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onDelete={(id) => {
                                                // Handle local state update if needed, though ProfilePage manages this
                                                toast.success('Post deleted');
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" />
                                    <p className="text-ink-gray/60">No posts yet</p>
                                    {isOwnProfile && (
                                        <button onClick={handleCreatePost} className="mt-4 px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90">
                                            Create Your First Post
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'discussions' && (
                        <div>
                            {discussions.length > 0 ? (
                                <div className="space-y-4">
                                    {discussions.map((d) => (
                                        <div key={d.id} className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition-colors cursor-pointer">
                                            <h3 className="font-medium text-ink-gray mb-2">{d.title}</h3>
                                            <p className="text-sm text-ink-gray/70 line-clamp-2">{d.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-ink-gray/50">
                                                <span>{d.replyCount || 0} replies</span>
                                                <span>{d.upvoteCount || 0} upvotes</span>
                                                {d.isResolved && <span className="text-green-400">✓ Resolved</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" /><p className="text-ink-gray/60">No discussions yet</p></div>
                            )}
                        </div>
                    )}
                    {activeTab === 'bookmarks' && isOwnProfile && (
                        <div>
                            {bookmarks.length > 0 ? (
                                <div className="space-y-4">
                                    {bookmarks.map((b) => (
                                        <div key={b.id} className="p-4 bg-justice-black/20 rounded-lg border border-constitution-gold/10 hover:border-constitution-gold/30 transition-colors cursor-pointer">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{b.entityType}</span>
                                                {b.folder && <span className="px-2 py-0.5 rounded text-xs bg-constitution-gold/10 text-constitution-gold">{b.folder}</span>}
                                            </div>
                                            <h3 className="font-medium text-ink-gray">{b.title}</h3>
                                            {b.authorName && <p className="text-sm text-ink-gray/60 mt-1">by {b.authorName}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12"><Bookmark className="w-12 h-12 text-ink-gray/30 mx-auto mb-4" /><p className="text-ink-gray/60">No bookmarks yet</p><p className="text-sm text-ink-gray/40 mt-1">Save posts and discussions to find them later</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreatePostModal && (
                <div className="fixed inset-0 bg-justice-black/80 flex items-center justify-center z-50 p-4">
                    <div className="aged-paper rounded-lg w-full max-w-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-constitution-gold/20">
                            <h2 className="font-heading font-bold text-ink-gray text-xl">Create New Post</h2>
                            <button onClick={() => setShowCreatePostModal(false)} className="p-1 hover:bg-constitution-gold/10 rounded">
                                <X className="w-5 h-5 text-ink-gray" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Post Type</label>
                                <select
                                    value={newPost.postType}
                                    onChange={(e) => setNewPost({ ...newPost, postType: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                                >
                                    <option value="POST">Post</option>
                                    <option value="ARTICLE">Article</option>
                                    <option value="LEGAL_INSIGHT">Legal Insight</option>
                                    <option value="CASE_DISCUSSION">Case Discussion</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Title *</label>
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder="Enter a compelling title..."
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-ink-gray/70 mb-1">Content *</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="Share your legal insights, analysis, or updates..."
                                    rows={6}
                                    className="w-full px-3 py-2 bg-white border border-constitution-gold/20 rounded-lg text-ink-gray focus:outline-none focus:border-constitution-gold resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t border-constitution-gold/20">
                            <button onClick={() => setShowCreatePostModal(false)} className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5">
                                Cancel
                            </button>
                            <button onClick={handleSubmitPost} className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90">
                                Publish Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
