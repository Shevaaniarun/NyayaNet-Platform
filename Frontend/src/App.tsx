import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostCard, Post as PostComponentType } from './components/PostCard';
import { CaseCard, CaseItem as CaseItemComponentType } from './components/CaseCard';
import { AIAssistant } from './components/AIAssistant';
import { JusticeLoader } from './components/JusticeLoader';
import { CreatePost } from './components/CreatePost';
import { MobileNotice } from './components/MobileNotice';
import { Sparkles, TrendingUp, Gavel, Users, Bell } from 'lucide-react';
import { DiscussionsPage } from './pages/DiscussionPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { ProfilePage } from './pages/ProfilePage';
import { getFeed, Post as ApiPost } from './api/postsAPI';
import { toast } from 'react-toastify';
import NotesPage from './pages/NotesPage';
import { NetworkPage } from './pages/NetworkPage';
import * as networkApi from './api/networkAPI';

type ViewType =
    | 'feed'
    | 'cases'
    | 'ai'
    | 'dashboard'
    | 'discussions'
    | 'profile'
    | 'notes'
    | 'connectionRequests';

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr);
        return {
            id: user.id || user._id || '',
            fullName: user.fullName || user.name || 'User',
            email: user.email || '',
            role: user.role || 'USER',
            profilePhotoUrl: user.profilePhotoUrl || '',
            designation: user.designation || '',
            organization: user.organization || ''
        };
    } catch {
        return null;
    }
};

// Fixed type adapter based on actual API response
const adaptPost = (apiPost: ApiPost): PostComponentType => ({
    id: apiPost.id,
    userId: apiPost.userId,
    author: {
        fullName: apiPost.author?.fullName || 'Unknown User',
        profilePhotoUrl: apiPost.author?.profilePhotoUrl || '',
        // Use default values since API doesn't provide role and organization
        role: 'Legal Professional', // Default value
        designation: apiPost.author?.designation || '',
        organization: apiPost.author?.organization || '' // Default value
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
    const [pendingConnectionCount, setPendingConnectionCount] = useState(0);

    // Initialize auth state properly
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState<"register" | "login">("register");
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');

    // State for viewing another user's profile
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

    // Get current user
    const currentUser = getCurrentUser();

    // Function to load pending connection count
    const loadPendingConnectionCount = async () => {
        if (!isAuthenticated || !currentUser?.id) return;
        
        try {
            // Use the network API call
            const pendingRequests = await networkApi.getPendingConnectionRequests();
            console.log('Pending requests from API:', pendingRequests);
            setPendingConnectionCount(pendingRequests.length || 0);
        } catch (error) {
            console.error('Failed to load connection requests:', error);
            // Fallback to mock data for development
            const mockCount = Math.floor(Math.random() * 5);
            setPendingConnectionCount(mockCount);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuth = !!token;
        setIsAuthenticated(isAuth);

        if (isAuth) {
            setCurrentView('dashboard');
            refreshPosts();
            loadPendingConnectionCount();
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500); // Reduced from 4500ms for better UX

        return () => clearTimeout(timer);
    }, []);

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (event.state?.view) {
                setCurrentView(event.state.view);
                if (event.state.view === 'feed' || event.state.view === 'dashboard') {
                    refreshPosts();
                }
            }
        };

        window.addEventListener('popstate', handlePopState);

        // Set initial state
        if (!window.history.state?.view) {
            window.history.replaceState({ view: currentView }, '', `/${currentView === 'dashboard' ? '' : currentView}`);
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            if (token) {
                setIsAuthenticated(true);
                setCurrentView('dashboard');
                refreshPosts();
                loadPendingConnectionCount();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const interval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && !isAuthenticated) {
                setIsAuthenticated(true);
                setCurrentView('dashboard');
                refreshPosts();
                loadPendingConnectionCount();
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
            loadPendingConnectionCount();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setAuthView("login");
        setPosts([]);
        setPendingConnectionCount(0);
    };

    const handleNavigation = (path: string, pushToHistory = true) => {
        const viewMap: Record<string, ViewType> = {
            '/': 'dashboard',
            '/feed': 'feed',
            '/cases': 'cases',
            '/ai': 'ai',
            '/discussions': 'discussions',
            '/profile': 'profile',
            '/notes': 'notes',
            '/connection-requests': 'connectionRequests',
        };

        const newView = viewMap[path] || 'dashboard';
        setCurrentView(newView);

        // Clear profile user selection on navigation
        if (newView !== 'profile') {
            setSelectedProfileUserId(null);
        }

        // Push to browser history for back button support
        if (pushToHistory) {
            window.history.pushState({ view: newView }, '', path);
        }

        if (newView === 'feed' || newView === 'dashboard') {
            refreshPosts();
        }
    };

    // Helper to navigate with history
    const navigateTo = (view: ViewType) => {
        const path = view === 'dashboard' ? '/' : `/${view}`;
        handleNavigation(path, true);
    };

    // Author click handler for PostCard
    const handlePostAuthorClick = (userId: string) => {
        setSelectedProfileUserId(userId);
        navigateTo('profile');
    };

    // Handle refresh of connection count
    const handleRefreshConnectionCount = () => {
        loadPendingConnectionCount();
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
                pendingConnectionCount={pendingConnectionCount}
            />

            <div className="ml-64 flex-1">
                {currentView === 'dashboard' && (
                    <div className="min-h-screen bg-justice-black p-8">
                        <div className="mb-12">
                            <div className="aged-paper rounded-2xl p-12 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-constitution-gold via-gavel-bronze to-constitution-gold"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="font-heading font-bold text-ink-gray mb-4 text-5xl">
                                                Welcome to NyayaNet
                                            </h1>
                                            <p className="text-ink-gray/70 max-w-3xl leading-relaxed mb-6 text-xl">
                                                India's premier legal professional networking and AI-powered assistance platform.
                                            </p>
                                        </div>
                                        {pendingConnectionCount > 0 && (
                                            <button
                                                onClick={() => navigateTo('connectionRequests')}
                                                className="flex items-center gap-2 px-4 py-2 bg-constitution-gold/10 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/20 transition-colors"
                                            >
                                                <Bell className="w-5 h-5" />
                                                <span>Connection Requests</span>
                                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {pendingConnectionCount}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => navigateTo('ai')}
                                            className="px-8 py-4 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2"
                                        >
                                            <Sparkles className="w-5 h-5" /><span>Try Legal AI</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedProfileUserId(null); // Ensure own profile
                                                navigateTo('profile');
                                            }}
                                            className="px-8 py-4 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold hover:bg-constitution-gold/5 transition-colors flex items-center space-x-2"
                                        >
                                            <Users className="w-5 h-5" /><span>View Profile</span>
                                        </button>
                                        {pendingConnectionCount > 0 && (
                                            <button
                                                onClick={() => navigateTo('connectionRequests')}
                                                className="px-8 py-4 bg-red-500/10 border-2 border-red-500 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors flex items-center space-x-2"
                                            >
                                                <Bell className="w-5 h-5" />
                                                <span>View Requests ({pendingConnectionCount})</span>
                                            </button>
                                        )}
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors cursor-pointer"
                                onClick={() => navigateTo('cases')}>
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
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors cursor-pointer"
                                onClick={() => navigateTo('connectionRequests')}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ink-gray/60 mb-1 text-sm">Connections</p>
                                        <p className="font-heading font-bold text-ink-gray text-2xl">248</p>
                                    </div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-constitution-gold" />
                                    </div>
                                </div>
                                {pendingConnectionCount > 0 && (
                                    <div className="mt-2 flex items-center gap-1 text-sm">
                                        <span className="text-constitution-gold font-medium">
                                            {pendingConnectionCount} pending request{pendingConnectionCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors cursor-pointer"
                                onClick={() => navigateTo('ai')}>
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
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-colors cursor-pointer"
                                onClick={() => {
                                    setSelectedProfileUserId(null);
                                    navigateTo('profile');
                                }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-ink-gray/60 mb-1 text-sm">Your Posts</p>
                                        <p className="font-heading font-bold text-ink-gray text-2xl">7</p>
                                    </div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-constitution-gold" />
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
                                            currentUserId={currentUser?.id}
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
                                        currentUserId={currentUser?.id}
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
                {currentView === 'notes' && <NotesPage />}
                {currentView === 'connectionRequests' && (
                    <NetworkPage 
                        onBack={() => navigateTo('dashboard')}
                        currentUserId={currentUser?.id}
                    />
                )}

                {currentView === 'profile' && (
                    <ProfilePage
                        // ProfilePage will show other's profile if selectedProfileUserId is set, otherwise current user's
                        userId={selectedProfileUserId || undefined}
                        currentUserId={currentUser?.id || ''}
                        onBack={() => navigateTo('dashboard')}
                        onNavigateToFeed={() => navigateTo('feed')}
                        onNavigateToDiscussion={(discussionId) => {
                            navigateTo('discussions');
                        }}
                    />
                )}
            </div>
        </div>
    );
}