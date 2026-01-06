import { useState, useEffect, useCallback } from 'react';
import { Plus, FileText, Heart, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { CreatePost } from '../components/CreatePost';
import { PostFilters } from '../components/Post/PostFilters';
import { getPosts } from '../api/postsAPI';
import { toast } from 'react-toastify';

interface PostFilterType {
    page: number;
    limit: number;
    sort: 'newest' | 'popular' | 'liked' | 'discussed';
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    tags?: string[];
    q?: string;
}

export function PostsPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<PostFilterType>({
        page: 1,
        limit: 10,
        sort: 'newest'
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    // Calculate statistics
    const stats = {
        total: pagination.total,
        totalLikes: posts.reduce((sum, p) => sum + (p.likeCount || 0), 0),
        totalComments: posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
        questions: posts.filter(p => p.postType === 'QUESTION').length,
    };

    const fetchPosts = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getPosts(filters);

            setPosts(response.posts || []);
            setPagination({
                total: response.pagination?.total || 0,
                page: response.pagination?.page || 1,
                limit: response.pagination?.limit || 10,
                totalPages: response.pagination?.pages || 1
            });
        } catch (error: any) {
            console.error('Failed to fetch posts:', error);
            const errorMessage = error.message || 'Failed to load posts. Please try again later.';
            toast.error(errorMessage);
            setPosts([]);
            setPagination({
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 1
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreatePost = () => {
        setShowCreateForm(false);
        fetchPosts(); // Refresh posts after creating
    };

    const handleFilterChange = (newFilters: {
        postType?: string;
        tags?: string[];
        sort?: 'newest' | 'popular' | 'liked' | 'discussed';
        q?: string;
    }) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters as Partial<PostFilterType>,
            page: 1 // Reset to first page when filters change
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted successfully');
    };

    // Get current user ID
    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return undefined;
        try {
            return JSON.parse(userStr).id;
        } catch {
            return undefined;
        }
    };

    const currentUserId = getCurrentUserId();

    // Loading state
    if (isLoading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-justice-black p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 text-constitution-gold animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    // Create post form
    if (showCreateForm) {
        return (
            <div className="min-h-screen bg-justice-black p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="text-constitution-gold hover:text-constitution-gold/80 transition-colors"
                        >
                            ← Back to Posts
                        </button>
                    </div>
                    <CreatePost onPostCreated={handleCreatePost} />
                </div>
            </div>
        );
    }

    // Main posts list view
    return (
        <div className="min-h-screen bg-justice-black p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-heading font-bold text-judge-ivory text-2xl md:text-3xl mb-1 md:mb-2">
                            Legal Insights
                        </h1>
                        <p className="text-ink-gray/70 text-sm md:text-base">
                            Explore professional insights, questions, and articles
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 md:px-6 py-2 md:py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2 w-full md:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span>Create Post</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={FileText}
                        title="Total Posts"
                        value={stats.total}
                    />
                    <StatCard
                        icon={Heart}
                        title="Total Likes"
                        value={stats.totalLikes}
                    />
                    <StatCard
                        icon={MessageSquare}
                        title="Total Comments"
                        value={stats.totalComments}
                    />
                    <StatCard
                        icon={TrendingUp}
                        title="Questions"
                        value={stats.questions}
                    />
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <PostFilters onFilterChange={handleFilterChange} />
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={currentUserId}
                            onDelete={handlePostDeleted}
                        />
                    ))}
                </div>

                {posts.length === 0 && !isLoading && (
                    <div className="text-center py-12 md:py-16">
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
                            <FileText className="w-8 h-8 md:w-10 md:h-10 text-constitution-gold" />
                        </div>
                        <h3 className="font-heading font-bold text-ink-gray text-xl md:text-2xl mb-2">
                            No posts found
                        </h3>
                        <p className="text-ink-gray/70 mb-6 text-sm md:text-base">
                            Try adjusting your filters or create a new post
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-2 md:py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors text-sm md:text-base"
                        >
                            Create First Post
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    disabled={page === pagination.page}
                                    className={`px-3 py-1 rounded-md ${page === pagination.page
                                        ? 'bg-constitution-gold text-justice-black font-bold'
                                        : 'bg-justice-black text-ink-gray hover:bg-ink-gray/10'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper component for stat cards
function StatCard({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
    return (
        <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-ink-gray/60 text-xs md:text-sm mb-1">{title}</p>
                    <p className="font-heading font-bold text-ink-gray text-xl md:text-2xl">
                        {value.toLocaleString()}
                    </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-constitution-gold" />
                </div>
            </div>
        </div>
    );
}
