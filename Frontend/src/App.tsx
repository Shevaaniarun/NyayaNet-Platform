import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostCard, Post as PostComponentType } from './components/PostCard';
import { CaseCard, CaseItem as CaseItemComponentType } from './components/CaseCard';
import { AIAssistant } from './components/AIAssistant';
import { JusticeLoader } from './components/JusticeLoader';
import { CreatePost } from './components/CreatePost';
import { MobileNotice } from './components/MobileNotice';
import { Sparkles, TrendingUp, Gavel } from 'lucide-react';
import { DiscussionsPage } from './pages/DiscussionPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { ProfilePage } from './pages/ProfilePage';
import { getFeed, Post as ApiPost } from './api/postsAPI';
import { toast } from 'react-toastify';
import NotesPage from './pages/NotesPage';

type ViewType =
    | 'feed'
    | 'cases'
    | 'ai'
    | 'dashboard'
    | 'discussions'
    | 'profile'
    | 'notes';

// Helper to get current user from localStorage
const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

// Type adapters
const adaptPost = (apiPost: ApiPost): PostComponentType => ({
    id: apiPost.id,
    userId: apiPost.userId,
    author: {
        fullName: apiPost.author?.fullName || 'Unknown User',
        profilePhotoUrl: apiPost.author?.profilePhotoUrl || '',
        role: 'User',
        designation: apiPost.author?.designation || '',
        organization: ''
    },
    postType: apiPost.postType || 'POST',
    content: apiPost.content,
    createdAt: new Date(apiPost.createdAt).toLocaleDateString(),
    likeCount: apiPost.likeCount || 0,
    commentCount: apiPost.commentCount || 0,
    tags: apiPost.tags || [],
    isLiked: apiPost.isLiked,
    isSaved: apiPost.isSaved,
    media: apiPost.media?.map(m => ({
        id: m.id,
        url: m.mediaUrl,
        type: m.mediaType
    }))
});

const mapCaseStatus = (status: string): CaseItemComponentType['caseStatus'] => {
    const statusMap: Record<string, CaseItemComponentType['caseStatus']> = {
        'active': 'active',
        'closed': 'closed',
        'hearing_scheduled': 'hearing_scheduled',
        'appealed': 'pending',
        'dismissed': 'closed',
        'pending': 'pending'
    };
    return statusMap[status] || 'active';
};

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [posts, setPosts] = useState<PostComponentType[]>([]);
    const [cases] = useState<CaseItemComponentType[]>([]);

    // Initialize auth state properly
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState<"register" | "login">("register");
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');

    // NEW: state for viewing another user's profile
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuth = !!token;
        setIsAuthenticated(isAuth);

        if (isAuth) {
            setCurrentView('dashboard');
            refreshPosts();
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 4500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            if (token) {
                setIsAuthenticated(true);
                setCurrentView('dashboard');
                refreshPosts();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const interval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && !isAuthenticated) {
                setIsAuthenticated(true);
                setCurrentView('dashboard');
                refreshPosts();
            }
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isAuthenticated]);

    const refreshPosts = async () => {
        if (!isAuthenticated) return;

        try {
            setIsLoadingPosts(true);
            const postsData = await getFeed(1, 10);
            setPosts(postsData.posts.map(adaptPost));
        } catch (error) {
            console.error('Failed to refresh posts:', error);
            toast.error('Failed to refresh posts');
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const handleLoginSuccess = () => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
            setCurrentView("dashboard");
            refreshPosts();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setAuthView("login");
        setPosts([]);
    };

    const handleNavigation = (path: string) => {
        const viewMap: Record<string, ViewType> = {
            '/': 'dashboard',
            '/feed': 'feed',
            '/cases': 'cases',
            '/ai': 'ai',
            '/discussions': 'discussions',
            '/profile': 'profile',
            '/notes': 'notes', // ✅ ADDED
        };

        const newView = viewMap[path] || 'dashboard';
        setCurrentView(newView);

        // Clear profile user selection on navigation
        if (newView !== 'profile') {
            setSelectedProfileUserId(null);
        }

        if (newView === 'feed' || newView === 'dashboard') {
            refreshPosts();
        }
    };

    // Author click handler for PostCard
    const handlePostAuthorClick = (userId: string) => {
        setSelectedProfileUserId(userId);
        setCurrentView('profile');
    };

    if (isLoading) {
        return <JusticeLoader />;
    }

    if (!isAuthenticated) {
        return authView === "register" ? (
            <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
        ) : (
            <LoginPage
                onSwitchToRegister={() => setAuthView("register")}
                onLoginSuccess={handleLoginSuccess}
            />
        );
    }

    return (
        <div className="flex min-h-screen bg-justice-black">
            <MobileNotice />
            <Sidebar
                currentPath={currentView === 'dashboard' ? '/' : `/${currentView}`}
                onNavigate={handleNavigation}
            />

            <div className="ml-64 flex-1">
                {currentView === 'dashboard' && (
                    <div className="min-h-screen bg-justice-black p-8">
                        <div className="mb-12">
                            <div className="aged-paper rounded-2xl p-12 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-constitution-gold via-gavel-bronze to-constitution-gold"></div>
                                <div className="relative z-10">
                                    <h1 className="font-heading font-bold text-ink-gray mb-4 text-5xl">Welcome to NyayaNet</h1>
                                    <p className="text-ink-gray/70 max-w-3xl leading-relaxed mb-6 text-xl">
                                        India's premier legal professional networking and AI-powered assistance platform.
                                    </p>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => setCurrentView('ai')}
                                            className="px-8 py-4 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2"
                                        >
                                            <Sparkles className="w-5 h-5" /><span>Try Legal AI</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentView('profile');
                                                setSelectedProfileUserId(null); // Ensure own profile
                                            }}
                                            className="px-8 py-4 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold hover:bg-constitution-gold/5 transition-colors flex items-center space-x-2"
                                        >
                                            <Sparkles className="w-5 h-5" /><span>View Profile</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-8 py-4 border-2 border-red-500 text-red-500 rounded-lg font-bold hover:bg-red-500/5 transition-colors flex items-center space-x-2"
                                        >
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-5 text-8xl">⚖️</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ink-gray/60 mb-1 text-sm">Active Cases</p>
                                        <p className="font-heading font-bold text-ink-gray text-2xl">5</p>
                                    </div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                                        <Gavel className="w-6 h-6 text-constitution-gold" />
                                    </div>
                                </div>
                            </div>
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ink-gray/60 mb-1 text-sm">Connections</p>
                                        <p className="font-heading font-bold text-ink-gray text-2xl">248</p>
                                    </div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-constitution-gold" />
                                    </div>
                                </div>
                            </div>
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ink-gray/60 mb-1 text-sm">AI Analyses</p>
                                        <p className="font-heading font-bold text-ink-gray text-2xl">12</p>
                                    </div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-constitution-gold" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-heading font-bold text-judge-ivory mb-6">Recent Legal Updates</h2>
                            <div className="space-y-6">
                                {isLoadingPosts ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-justice-blue"></div>
                                    </div>
                                ) : posts.length > 0 ? (
                                    posts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            currentUserId={getCurrentUser()?.id}
                                            onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                                            onAuthorClick={handlePostAuthorClick}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <p>No posts found. Be the first to post something!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'feed' && (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <CreatePost onPostCreated={refreshPosts} />
                            {isLoadingPosts ? (
                                <div className="flex justify-center p-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-justice-blue"></div>
                                </div>
                            ) : posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        currentUserId={getCurrentUser()?.id}
                                        onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                                        onAuthorClick={handlePostAuthorClick}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <p>No posts found. Be the first to post something!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentView === 'cases' && (
                    <div className="min-h-screen bg-justice-black p-8">
                        <div className="max-w-6xl mx-auto">
                            <h1 className="font-heading font-bold text-judge-ivory mb-8">Case Docket</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {cases.map((caseItem) => (
                                    <CaseCard key={caseItem.id} caseItem={caseItem} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {currentView === 'ai' && <AIAssistant />}
                {currentView === 'discussions' && <DiscussionsPage />}
                {currentView === 'notes' && <NotesPage />} {/* ✅ ADDED */}

                {currentView === 'profile' && (
                    <ProfilePage
                        // ProfilePage will show other's profile if selectedProfileUserId is set, otherwise current user's
                        userId={selectedProfileUserId}
                        currentUserId={getCurrentUser()?.id || ''}
                        onBack={() => {
                            setCurrentView('dashboard');
                            setSelectedProfileUserId(null);
                        }}
                        onNavigateToFeed={() => setCurrentView('feed')}
                        // To allow ProfilePage to show another user, pass a callback to setSelectedProfileUserId:
                        onViewUserProfile={userId => {
                            setSelectedProfileUserId(userId);
                            setCurrentView('profile');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
