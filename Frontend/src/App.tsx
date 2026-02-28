import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import { Sidebar } from "./components/Sidebar";
import { JusticeLoader } from "./components/JusticeLoader";
import { MobileNotice } from "./components/MobileNotice";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import { PostsPage } from "./pages/PostsPage";
import { DiscussionsPage } from "./pages/DiscussionPage";
import { ProfilePage } from "./pages/ProfilePage";
import NotesPage from "./pages/NotesPage";
import NotificationsPage from "./pages/NotificationsPage";
import { ChatbotPage } from "./pages/ChatbotPage";
import ChatWithUsPage from "./pages/ChatWithUsPage";
import MessagesPage from "./pages/MessagesPage";
import { NetworkPage } from "./pages/NetworkPage";

import { useNotificationCount } from "./hooks/useNotificationCount";
import { getFeed } from "./api/postsAPI";
import { toast } from "react-toastify";

/* ================= HELPERS ================= */

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Better typing for Protected component
interface ProtectedProps {
  children: React.ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const token = localStorage.getItem("token");
  const location = useLocation(); // Add this to preserve redirect location
  
  if (!token) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

/* ================= ROUTE WRAPPERS ================= */

function ProfileRouteWrapper() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  return (
    <ProfilePage
      userId={userId}
      currentUserId={currentUser?.id}
      onBack={() => navigate("/dashboard")}
      onNavigateToFeed={() => navigate("/feed")}
      onNavigateToDiscussion={(id) =>
        navigate(id ? `/discussions/${id}` : "/discussions")
      }
    />
  );
}

function MessagesRouteWrapper() {
  const { userId } = useParams();
  const navigate = useNavigate();

  return (
    <MessagesPage onNavigate={(p) => navigate(p)} urlId={userId} />
  );
}

/* ================= MAIN CONTENT ================= */

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotificationCount(60000);

  const [loading, setLoading] = useState(true);

  const isAuth = !!localStorage.getItem("token");
  const currentUser = getCurrentUser();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <JusticeLoader />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true }); // Changed from /login to / for better UX
  };

  return (
    <div className="flex min-h-screen bg-justice-black">
      <MobileNotice />

      {isAuth && (
        <Sidebar
          currentPath={location.pathname}
          onNavigate={(p) => navigate(p)}
          pendingConnectionCount={0}
          notificationCount={unreadCount}
          onLogout={handleLogout}
        />
      )}

      {/* Fix the margin - only apply when sidebar is visible */}
      <div className={`flex-1 ${isAuth ? 'ml-64' : ''} min-h-screen`}>
        <Routes>
          {/* Public */}
          <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <LandingPage />} />

          <Route
            path="/login"
            element={
              <LoginPage
                onSwitchToRegister={() => navigate("/register")}
                onLoginSuccess={() => {
                  // Check if there's a saved location to redirect to
                  const state = location.state as any;
                  const from = state?.from?.pathname || "/dashboard";
                  navigate(from, { replace: true });
                }}
              />
            }
          />

          <Route
            path="/register"
            element={<RegisterPage onSwitchToLogin={() => navigate("/login")} />}
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />

          <Route
            path="/feed"
            element={
              <Protected>
                <PostsPage onNavigateToProfile={(id) => navigate(`/profile/${id}`)} />
              </Protected>
            }
          />

          <Route
            path="/profile"
            element={<Protected><ProfileRouteWrapper /></Protected>}
          />
          <Route
            path="/profile/:userId"
            element={<Protected><ProfileRouteWrapper /></Protected>}
          />

          <Route
            path="/discussions"
            element={
              <Protected>
                <DiscussionsPage
                  onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </Protected>
            }
          />
          <Route
            path="/discussions/:discussionId"
            element={
              <Protected>
                <DiscussionsPage
                  onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </Protected>
            }
          />

          <Route
            path="/messages"
            element={<Protected><MessagesRouteWrapper /></Protected>}
          />
          <Route
            path="/messages/:userId"
            element={<Protected><MessagesRouteWrapper /></Protected>}
          />

          <Route
            path="/network"
            element={
              <Protected>
                <NetworkPage
                  currentUserId={currentUser?.id}
                  onBack={() => navigate("/dashboard")}
                  onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </Protected>
            }
          />
          <Route
            path="/connection-requests"
            element={
              <Protected>
                <NetworkPage
                  currentUserId={currentUser?.id}
                  onBack={() => navigate("/dashboard")}
                  onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                />
              </Protected>
            }
          />

          <Route path="/notes" element={<Protected><NotesPage /></Protected>} />
          <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
          <Route path="/chatbot" element={<Protected><ChatbotPage /></Protected>} />
          <Route path="/chat" element={<Protected><MessagesRouteWrapper /></Protected>} />
          <Route path="/chat/:userId" element={<Protected><MessagesRouteWrapper /></Protected>} />
          
          <Route
            path="/chat-with-us"
            element={
              <Protected>
                <ChatWithUsPage onNavigate={(p) => navigate(p)} />
              </Protected>
            }
          />

          {/* Add create-discussion route if needed */}
          <Route
            path="/create-discussion"
            element={
              <Protected>
                <div className="max-w-3xl mx-auto p-8">
                  <div className="aged-paper rounded-lg p-8">
                    <h2 className="text-3xl font-heading mb-4">Create New Discussion</h2>
                    <p className="text-lg text-gray-400">Discussion creation form goes here.</p>
                    <button 
                      className="mt-8 px-6 py-2 rounded-lg font-bold border border-constitution-gold text-constitution-gold hover:bg-constitution-gold/10" 
                      onClick={() => navigate('/discussions')}
                    >
                      Back to Discussions
                    </button>
                  </div>
                </div>
              </Protected>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

/* ================= APP ROOT ================= */

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}