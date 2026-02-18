import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostCard, Post as PostComponentType } from './components/Post/PostCard';
import { CaseCard, CaseItem as CaseItemComponentType } from './components/CaseCard';
import { AIAssistant } from './components/AIAssistant';
import { JusticeLoader } from './components/JusticeLoader';
import { CreatePost } from './components/Post/CreatePost';
import { MobileNotice } from './components/MobileNotice';
import { Sparkles, TrendingUp, Gavel, Users, Bell } from 'lucide-react';
import { DiscussionsPage } from './pages/DiscussionPage';
import { PostsPage } from './pages/PostsPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { ProfilePage } from './pages/ProfilePage';
import NotesPage from './pages/NotesPage';
import NotificationsPage from './pages/NotificationsPage';
import { ChatbotPage } from './pages/ChatbotPage';
import ChatWithUsPage from './pages/ChatWithUsPage';
import MessagesPage from './pages/MessagesPage';
import { getFeed, Post as ApiPost } from './api/postsAPI';
import { toast } from 'react-toastify';
import { NetworkPage } from './pages/NetworkPage';
import * as networkApi from './api/networkAPI';
import LandingPage from "./pages/LandingPage";
import DashboardPage from './pages/dashboard/DashboardPage';
import { Toaster } from "react-hot-toast";
import { useNotificationCount } from './hooks/useNotificationCount';

type ViewType =
    | 'dashboard'
    | 'feed'
    | 'cases'
    | 'notes'
    | 'ai'
    | 'chatbot'
    | 'chat-with-us'
    | 'messages'
    | 'discussions'
    | 'profile'
    | 'notifications'
    | 'network'
    | 'connectionRequests'
    | 'createDiscussion'
    | "chat"
    | 'profile-posts'
    | 'profile-discussions'
    | 'profile-followers'
    | 'profile-following'
    | 'profile-bookmarks'
    | 'profile-liked-posts'
    | 'profile-liked-discussions'
    | 'profile-group-discussions';

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

const adaptPost = (apiPost: ApiPost): PostComponentType => ({
    id: apiPost.id,
    userId: apiPost.userId,
    author: {
        fullName: apiPost.author?.fullName || 'Unknown User',
        profilePhotoUrl: apiPost.author?.profilePhotoUrl || '',
        role: 'Legal Professional',
        designation: apiPost.author?.designation || '',
        organization: apiPost.author?.organization || ''
    },
    postType: apiPost.postType || 'POST',
    title: apiPost.title || '',
    content: apiPost.content || '',
    createdAt: apiPost.createdAt ? new Date(apiPost.createdAt).toLocaleDateString() : '',
    likeCount: apiPost.likeCount || 0,
    commentCount: apiPost.commentCount || 0,
    tags: apiPost.tags || [],
    isLiked: !!apiPost.isLiked,
    isSaved: !!apiPost.isSaved,
    media: apiPost.media?.map(m => ({
        id: m.id,
        url: m.mediaUrl || '',
        type: m.mediaType || '',
        mimeType: m.mediaType || '',
        mediaUrl: m.mediaUrl || '',
        mediaType: m.mediaType || '',
        fileName: m.fileName || undefined
    })) || []
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
    const { unreadCount, refetch: refetchNotificationCount } = useNotificationCount(60000);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authView, setAuthView] = useState<"register" | "login">("register");
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

    const currentUser = getCurrentUser();

    const loadPendingConnectionCount = async () => {
        if (!isAuthenticated || !currentUser?.id) return;
        try {
            // placeholder for actual API call
            // const pendingRequests = await networkApi.getPendingConnectionRequests();
            // setPendingConnectionCount(pendingRequests.length || 0);
        } catch (error) {
            console.error('Failed to load connection requests:', error);
            setPendingConnectionCount(Math.floor(Math.random() * 5));
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuth = !!token;
        setIsAuthenticated(isAuth);

        if (isAuth) {
            if (currentPath === '/') {
                setCurrentView('dashboard');
                window.history.replaceState({ view: 'dashboard' }, '', '/');
            }
            else if (currentPath === '/login' || currentPath === '/register') {
                setCurrentView('profile');
                window.history.replaceState({ view: 'profile' }, '', '/profile');
            }
            else if (currentPath === '/dashboard') {
                setCurrentView('dashboard');
            } else {
                const viewMap: Record<string, ViewType> = {
                    '/': 'dashboard',
                    '/feed': 'feed',
                    '/cases': 'cases',
                    '/notes': 'notes',
                    '/ai': 'ai',
                    '/chatbot': 'chatbot',
                    '/chat-with-us': 'chat-with-us',
                    '/messages': 'messages',
                    '/discussions': 'discussions',
                    '/profile': 'profile',
                    '/profile/posts': 'profile-posts',
                    '/profile/discussions': 'profile-discussions',
                    '/profile/group-discussions': 'profile-group-discussions',
                    '/profile/followers': 'profile-followers',
                    '/profile/following': 'profile-following',
                    '/profile/bookmarks': 'profile-bookmarks',
                    '/profile/liked-posts': 'profile-liked-posts',
                    '/profile/liked-discussions': 'profile-liked-discussions',
                    '/notifications': 'notifications',
                    '/network': 'network',
                    '/connection-requests': 'connectionRequests',
                    '/create-discussion': 'createDiscussion',
                    "/chat": "chat",
                };

                const newView = viewMap[currentPath] || 'profile';
                setCurrentView(newView);
            }

            refreshPosts();
            loadPendingConnectionCount();
        } else {
            if (currentPath === '/login') setAuthView('login');
            else if (currentPath === '/register') setAuthView('register');
            else if (currentPath === '/dashboard' || currentPath === '/profile') {
                window.history.replaceState({}, '', '/login');
                setAuthView('login');
            } else if (currentPath !== '/') {
                window.history.replaceState({}, '', '/');
                setCurrentPath('/');
            }
        }

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, [currentPath]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            setCurrentPath(window.location.pathname);
            if (event.state?.view) {
                setCurrentView(event.state.view);
                if (event.state.view === 'feed' || event.state.view === 'dashboard') refreshPosts();
            }
        };
        window.addEventListener('popstate', handlePopState);
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
                setCurrentView('profile');
                setSelectedProfileUserId(null);
                refreshPosts();
                loadPendingConnectionCount();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        const interval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && !isAuthenticated) {
                setIsAuthenticated(true);
                setCurrentView('profile');
                setSelectedProfileUserId(null);
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
        setIsAuthenticated(true);

        setCurrentView("dashboard");
        setCurrentPath("/");

        window.history.replaceState({ view: "dashboard" }, "", "/");
    };


    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setAuthView("login");
        setPosts([]);
        setPendingConnectionCount(0);
        setCurrentPath('/');
        window.history.replaceState({}, '', '/');
    };

    const handleNavigation = (path: string, pushToHistory = true) => {
        const viewMap: Record<string, ViewType> = {
            '/': 'dashboard',
            '/feed': 'feed',
            '/cases': 'cases',
            '/ai': 'ai',
            '/chatbot': 'chatbot',
            '/chat-with-us': 'chat-with-us',
            '/discussions': 'discussions',
            '/profile': 'profile',
            '/profile/posts': 'profile-posts',
            '/profile/discussions': 'profile-discussions',
            '/profile/following-discussions': 'profile-following-discussions',
            '/profile/followers': 'profile-followers',
            '/profile/following': 'profile-following',
            '/profile/bookmarks': 'profile-bookmarks',
            '/profile/liked-posts': 'profile-liked-posts',
            '/profile/liked-discussions': 'profile-liked-discussions',
            '/notes': 'notes',
            '/notifications': 'notifications',
            '/network': 'network',
            '/connection-requests': 'connectionRequests',
            '/create-discussion': 'createDiscussion',
        };

        // Handle messages with user ID
        if (path.startsWith('/messages/')) {
            setCurrentView('messages');
            if (pushToHistory) {
                window.history.pushState({ view: 'messages', path }, '', path);
            }
            return;
        }

        // ✅ Keep only this
        const newView = viewMap[path] || 'dashboard';

        setCurrentView(newView);
        setCurrentPath(path);

        if (!newView.startsWith('profile')) setSelectedProfileUserId(null);

        if (newView !== 'notifications') {
            setTimeout(() => refetchNotificationCount(), 1000);
        }

        if (pushToHistory) {
            window.history.pushState({ view: newView }, '', path);
        }

        if (newView === 'feed' || newView === 'dashboard') {
            refreshPosts();
        }
    };


    const navigateTo = (view: ViewType) => {
        const path = view === 'dashboard' ? '/' : view === 'createDiscussion' ? '/create-discussion' : `/${view}`;
        handleNavigation(path, true);
    };

    const handlePostAuthorClick = (userId: string) => {
        setSelectedProfileUserId(userId);
        navigateTo('profile');
    };

    const handleDiscussionProfileClick = (userId: string) => {
        setSelectedProfileUserId(userId);
        navigateTo('profile');
    };

    const handleRefreshConnectionCount = () => loadPendingConnectionCount();

    if (isLoading) return <JusticeLoader />;

    if (!isAuthenticated) {
        if (currentPath === '/') return <LandingPage />;
        if (currentPath === '/login') return <LoginPage onSwitchToRegister={() => { setAuthView('register'); setCurrentPath('/register'); window.history.replaceState({}, '', '/register'); }} onLoginSuccess={handleLoginSuccess} />;
        if (currentPath === '/register') return <RegisterPage onSwitchToLogin={() => { setAuthView('login'); setCurrentPath('/login'); window.history.replaceState({}, '', '/login'); }} />;
        setCurrentPath('/');
        window.history.replaceState({}, '', '/');
        return <LandingPage />;
    }

    return (
        <div className="flex min-h-screen bg-justice-black">
            <MobileNotice />
            <Sidebar
                currentPath={currentPath}
                onNavigate={handleNavigation}
                pendingConnectionCount={pendingConnectionCount}
                notificationCount={unreadCount}
                onLogout={handleLogout}
            />


            <div className="flex-1 ml-64 min-h-screen">
                {currentView === 'dashboard' && <DashboardPage />}

                {currentView === 'feed' && <PostsPage onNavigateToProfile={handlePostAuthorClick} />}

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
                {currentView === 'chatbot' && <ChatbotPage />}
                {currentView === 'chat-with-us' && <ChatWithUsPage onNavigate={handleNavigation} />}
                {currentView === 'messages' && <MessagesPage onNavigate={handleNavigation} />}
                {currentView === 'discussions' && <DiscussionsPage onNavigateToProfile={handleDiscussionProfileClick} />}
                {currentView === 'notes' && <NotesPage />}

                {(currentView === 'connectionRequests' || currentView === 'network') && (
                    <NetworkPage
                        onBack={() => setCurrentView('dashboard')}
                        currentUserId={currentUser?.id}
                        onNavigateToProfile={(userId) => { setSelectedProfileUserId(userId); navigateTo('profile'); }}
                    />
                )}

                {currentView.startsWith('profile') && (
                    <ProfilePage
                        userId={selectedProfileUserId || undefined}
                        currentUserId={currentUser?.id || ''}
                        activeTab={(currentView === 'profile' ? 'menu' : currentView.replace('profile-', '')) as any}
                        onBack={() => navigateTo('dashboard')}
                        onNavigateToFeed={() => navigateTo('feed')}
                        onNavigateToDiscussion={() => navigateTo('discussions')}
                        onNavigateToTab={(tab: string) => handleNavigation(tab === 'menu' ? '/profile' : `/profile/${tab}`)}
                    />
                )}

                {currentView === 'notifications' && <NotificationsPage />}
                {currentView === "chat" && <MessagesPage onNavigate={handleNavigation} />}
                {currentView === 'createDiscussion' && (
                    <div className="max-w-3xl mx-auto p-8">
                        <div className="aged-paper rounded-lg p-8">
                            <h2 className="text-3xl font-heading mb-4">Create New Discussion</h2>
                            <p className="text-lg text-gray-400">Discussion creation form goes here.</p>
                            <button className="mt-8 px-6 py-2 rounded-lg font-bold border border-constitution-gold text-constitution-gold hover:bg-constitution-gold/10" onClick={() => navigateTo('discussions')}>
                                Back to Discussions
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}