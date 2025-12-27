/**
 * NyayaNet - Indian Legal Professional Networking & AI Assistance Platform
 * A sophisticated platform for legal professionals with constitution-inspired design
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostCard, Post } from './components/PostCard';
import { CaseCard, CaseItem } from './components/CaseCard';
import { AIAssistant } from './components/AIAssistant';
import { JusticeLoader } from './components/JusticeLoader';
import { Header } from './components/Header';
import { CreatePost } from './components/CreatePost';
import { MobileNotice } from './components/MobileNotice';
import { Sparkles, TrendingUp, Gavel } from 'lucide-react';
import { DiscussionsPage } from './pages/DiscussionPage';
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

// Mock data for posts
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
    content:
      'The recent Supreme Court judgment on Consumer Rights under Section 2(7) of the Consumer Protection Act, 2019 establishes crucial precedent. The Court held that "deficiency in service" extends beyond contractual obligations to include reasonable expectations of quality and safety. This interpretation significantly broadens consumer protection and will impact future litigation strategies.',
    createdAt: '2 hours ago',
    likeCount: 248,
    commentCount: 32,
    tags: ['ConsumerLaw', 'SupremeCourt', 'LegalPrecedent', 'ConsumerRights'],
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
    content:
      'Reflecting on the evolution of Article 21 jurisprudence over the past three decades. The right to life has been interpreted to include dignity, livelihood, clean environment, and now digital privacy. The Constitution remains a living document, adapting to contemporary challenges while preserving fundamental principles.',
    createdAt: '5 hours ago',
    likeCount: 412,
    commentCount: 56,
    tags: ['Constitution', 'Article21', 'FundamentalRights', 'Jurisprudence'],
  },
  {
    id: '3',
    author: {
      fullName: 'Dr. Ananya Iyer',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      role: 'Legal Scholar',
      designation: 'Professor of Constitutional Law',
      organization: 'National Law School, Bangalore',
    },
    postType: 'research_paper',
    content:
      'Published my latest research paper on "Balancing Individual Liberty and Public Health: Constitutional Perspectives in Post-Pandemic India". The paper examines judicial review of emergency measures and proposes a framework for proportionality analysis. Available for peer review and academic discussion.',
    createdAt: '1 day ago',
    likeCount: 186,
    commentCount: 24,
    tags: ['Research', 'PublicHealth', 'ConstitutionalLaw', 'AcademicPaper'],
  },
];

// Mock data for cases
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
    caseDescription:
      'Consumer complaint regarding unauthorized deductions from savings account and deficiency in banking services. Seeking compensation for mental harassment and refund of wrongly debited amounts.',
    documentCount: 12,
    tags: ['Consumer Law', 'Banking Services', 'Compensation'],
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
    caseDescription:
      'Appeal against District Forum order regarding defective product warranty claims. Product liability case involving electronic appliances with manufacturing defects.',
    documentCount: 24,
    tags: ['Product Liability', 'Warranty', 'Appeal'],
  },
  {
    id: '3',
    caseTitle: 'Sharma v. City Hospital',
    caseNumber: 'CC/2024/2156',
    caseStatus: 'pending',
    courtName: 'District Consumer Disputes Redressal Commission',
    courtLevel: 'District Court',
    clientName: 'Anita Sharma',
    hearingDate: 'Feb 05, 2024',
    caseDescription:
      'Medical negligence case alleging deficiency in service by hospital and medical practitioners. Seeking damages for improper treatment and delayed diagnosis.',
    documentCount: 18,
    tags: ['Medical Negligence', 'Healthcare', 'Damages'],
  },
];

type ViewType = 'feed' | 'cases' | 'ai' | 'dashboard' | 'discussions';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<"register" | "login">("register");
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4500); // Show loader for 4.5 seconds to see the full animation

    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (path: string) => {
    const viewMap: Record<string, ViewType> = {
      '/': 'dashboard',
      '/feed': 'feed',
      '/cases': 'cases',
      '/ai': 'ai',
      '/discussions': 'discussions',
    };
    setCurrentView(viewMap[path] || 'dashboard');
  };

  if (isLoading) {
    return <JusticeLoader />;
  }

 if (!isAuthenticated) {
  return authView === "register" ? (
    <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
  ) : (
    <LoginPage onSwitchToRegister={() => setAuthView("register")} />
  );
}


  return (
    
    <div className="flex min-h-screen bg-justice-black">
      
      {/* Mobile Notice - Shows on screens smaller than lg (1024px) */}
      <MobileNotice />

      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentView === 'dashboard' ? '/' : 
                    currentView === 'feed' ? '/feed' : 
                    currentView === 'cases' ? '/cases' : 
                    currentView === 'ai' ? '/ai' : 
                    '/discussions'}
        onNavigate={handleNavigation}
      />

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="min-h-screen bg-justice-black p-8">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="aged-paper rounded-2xl p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-constitution-gold via-gavel-bronze to-constitution-gold"></div>
                
                <div className="relative z-10">
                  <h1 className="font-heading font-bold text-ink-gray mb-4" style={{ fontSize: '3rem' }}>
                    Welcome to NyayaNet
                  </h1>
                  <p className="text-ink-gray/70 max-w-3xl leading-relaxed mb-6" style={{ fontSize: '1.25rem' }}>
                    India's premier legal professional networking and AI-powered assistance platform. Connect with colleagues, manage cases, and leverage artificial intelligence for legal research and predictions.
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentView('ai')}
                      className="px-8 py-4 bg-constitution-gold text-justice-black rounded-lg font-bold tracking-wide hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Try Legal AI</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('discussions')}
                      className="px-8 py-4 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold tracking-wide hover:bg-constitution-gold/5 transition-colors flex items-center space-x-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Join Legal Debates</span>
                    </button>
                  </div>
                </div>

                {/* Corner decorations */}
                <div className="absolute bottom-4 right-4 opacity-5" style={{ fontSize: '8rem' }}>⚖️</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Active Cases</p>
                    <p className="font-heading font-bold text-ink-gray" style={{ fontSize: '2rem' }}>5</p>
                  </div>
                  <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-constitution-gold" />
                  </div>
                </div>
              </div>

              <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Network Connections</p>
                    <p className="font-heading font-bold text-ink-gray" style={{ fontSize: '2rem' }}>248</p>
                  </div>
                  <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-constitution-gold" />
                  </div>
                </div>
              </div>

              <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>AI Analyses</p>
                    <p className="font-heading font-bold text-ink-gray" style={{ fontSize: '2rem' }}>12</p>
                  </div>
                  <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-constitution-gold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="font-heading font-bold text-judge-ivory mb-6">Recent Legal Updates</h2>
              <div className="space-y-6">
                {mockPosts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feed View */}
        {currentView === 'feed' && (
          <div className="min-h-screen bg-justice-black p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-heading font-bold text-judge-ivory mb-8">Legal Feed</h1>
              <CreatePost />
              <div className="space-y-6">
                {mockPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cases View */}
        {currentView === 'cases' && (
          <div className="min-h-screen bg-justice-black p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="font-heading font-bold text-judge-ivory mb-8">Case Docket</h1>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {mockCases.map((caseItem) => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant View */}
        {currentView === 'ai' && <AIAssistant />}

        {/* Discussions Page View */}
        {currentView === 'discussions' && <DiscussionsPage />}
      </div>
    </div>
  );
}