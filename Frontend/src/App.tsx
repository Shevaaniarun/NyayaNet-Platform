/**
 * NyayaNet - Indian Legal Professional Networking & AI Assistance Platform
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostCard, Post } from './components/PostCard';
import { CaseCard, CaseItem } from './components/CaseCard';
import { AIAssistant } from './components/AIAssistant';
import { JusticeLoader } from './components/JusticeLoader';
import { CreatePost } from './components/CreatePost';
import { MobileNotice } from './components/MobileNotice';
import { Sparkles, TrendingUp, Gavel } from 'lucide-react';
import { DiscussionsPage } from './pages/DiscussionPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import { ProfilePage } from './pages/ProfilePage';

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      fullName: 'Adv. Priya Sharma',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'Senior Advocate',
      designation: 'Senior Advocate, Supreme Court',
      organization: 'Supreme Court of India',
    },
    postType: 'legal_insight',
    content: 'The recent Supreme Court judgment on Consumer Rights establishes crucial precedent.',
    createdAt: '2 hours ago',
    likeCount: 248,
    commentCount: 32,
    tags: ['ConsumerLaw', 'SupremeCourt'],
  },
  {
    id: '2',
    author: {
      fullName: 'Justice Rajiv Mehta (Retd.)',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      role: 'Retired Judge',
      designation: 'Former High Court Judge',
      organization: 'Delhi High Court',
    },
    postType: 'case_discussion',
    content: 'Reflecting on the evolution of Article 21 jurisprudence over the past three decades.',
    createdAt: '5 hours ago',
    likeCount: 412,
    commentCount: 56,
    tags: ['Constitution', 'Article21'],
  },
];

const mockCases: CaseItem[] = [
  {
    id: '1',
    caseTitle: 'Kumar v. State Bank of India',
    caseNumber: 'CC/2024/1547',
    caseStatus: 'hearing_scheduled',
    courtName: 'District Consumer Disputes Redressal Commission',
    courtLevel: 'District Court',
    clientName: 'Rajesh Kumar',
    hearingDate: 'Jan 15, 2024',
    caseDescription: 'Consumer complaint regarding unauthorized deductions.',
    documentCount: 12,
    tags: ['Consumer Law', 'Banking'],
  },
  {
    id: '2',
    caseTitle: 'Mehta Electronics v. Reliance Consumer',
    caseNumber: 'CA/2023/8934',
    caseStatus: 'active',
    courtName: 'State Consumer Disputes Redressal Commission',
    courtLevel: 'State Court',
    clientName: 'Mehta Electronics Pvt. Ltd.',
    hearingDate: 'Jan 22, 2024',
    caseDescription: 'Appeal against District Forum order.',
    documentCount: 24,
    tags: ['Product Liability', 'Warranty'],
  },
];

type ViewType = 'feed' | 'cases' | 'ai' | 'dashboard' | 'discussions' | 'profile';

export default function App() {

  const [isLoading, setIsLoading] = useState(true);

  // ✅ FIX: derive auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [authView, setAuthView] = useState<"register" | "login">("register");
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem("token", localStorage.getItem("token") || "");
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleNavigation = (path: string) => {
    const viewMap: Record<string, ViewType> = {
      '/': 'dashboard',
      '/feed': 'feed',
      '/cases': 'cases',
      '/ai': 'ai',
      '/discussions': 'discussions',
      '/profile': 'profile',
    };
    setCurrentView(viewMap[path] || 'dashboard');
  };

  if (isLoading) return <JusticeLoader />;

  // ✅ AUTH GATE (NO LOOP NOW)
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
            {/* dashboard content unchanged */}
            <h1 className="text-white text-3xl">Dashboard</h1>
          </div>
        )}

        {currentView === 'feed' && (
          <div className="min-h-screen bg-justice-black p-8">
            <CreatePost />
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {currentView === 'cases' && (
          <div className="min-h-screen bg-justice-black p-8">
            {mockCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        )}

        {currentView === 'ai' && <AIAssistant />}
        {currentView === 'discussions' && <DiscussionsPage />}
        {currentView === 'profile' && (
          <ProfilePage
            currentUserId="mock-user-1"
            onBack={() => setCurrentView('dashboard')}
            onNavigateToFeed={() => setCurrentView('feed')}
          />
        )}
      </div>
    </div>
  );
}
