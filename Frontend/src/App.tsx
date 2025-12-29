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
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 4500);
        return () => clearTimeout(timer);
    }, []);

    const handleNavigation = (path: string) => {
        const viewMap: Record<string, ViewType> = {
            '/': 'dashboard', '/feed': 'feed', '/cases': 'cases', '/ai': 'ai', '/discussions': 'discussions', '/profile': 'profile',
        };
        setCurrentView(viewMap[path] || 'dashboard');
    };

    if (isLoading) return <JusticeLoader />;

    return (
        <div className="flex min-h-screen bg-justice-black">
            <MobileNotice />
            <Sidebar currentPath={currentView === 'dashboard' ? '/' : `/${currentView}`} onNavigate={handleNavigation} />

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
                                        <button onClick={() => setCurrentView('ai')} className="px-8 py-4 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2">
                                            <Sparkles className="w-5 h-5" /><span>Try Legal AI</span>
                                        </button>
                                        <button onClick={() => setCurrentView('profile')} className="px-8 py-4 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold hover:bg-constitution-gold/5 transition-colors flex items-center space-x-2">
                                            <Sparkles className="w-5 h-5" /><span>View Profile</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4 opacity-5 text-8xl">⚖️</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-ink-gray/60 mb-1 text-sm">Active Cases</p><p className="font-heading font-bold text-ink-gray text-2xl">5</p></div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center"><Gavel className="w-6 h-6 text-constitution-gold" /></div>
                                </div>
                            </div>
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-ink-gray/60 mb-1 text-sm">Connections</p><p className="font-heading font-bold text-ink-gray text-2xl">248</p></div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center"><TrendingUp className="w-6 h-6 text-constitution-gold" /></div>
                                </div>
                            </div>
                            <div className="aged-paper rounded-lg p-6 border border-constitution-gold/20">
                                <div className="flex items-center justify-between">
                                    <div><p className="text-ink-gray/60 mb-1 text-sm">AI Analyses</p><p className="font-heading font-bold text-ink-gray text-2xl">12</p></div>
                                    <div className="w-12 h-12 bg-constitution-gold/10 rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-constitution-gold" /></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-heading font-bold text-judge-ivory mb-6">Recent Legal Updates</h2>
                            <div className="space-y-6">{mockPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
                        </div>
                    </div>
                )}

                {currentView === 'feed' && (
                    <div className="min-h-screen bg-justice-black p-8">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="font-heading font-bold text-judge-ivory mb-8">Legal Feed</h1>
                            <CreatePost />
                            <div className="space-y-6">{mockPosts.map((post) => <PostCard key={post.id} post={post} />)}</div>
                        </div>
                    </div>
                )}

                {currentView === 'cases' && (
                    <div className="min-h-screen bg-justice-black p-8">
                        <div className="max-w-6xl mx-auto">
                            <h1 className="font-heading font-bold text-judge-ivory mb-8">Case Docket</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{mockCases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)}</div>
                        </div>
                    </div>
                )}

                {currentView === 'ai' && <AIAssistant />}
                {currentView === 'discussions' && <DiscussionsPage />}
                {currentView === 'profile' && (
                    <ProfilePage currentUserId="mock-user-1" onBack={() => setCurrentView('dashboard')} onNavigateToFeed={() => setCurrentView('feed')} />
                )}
            </div>
        </div>
    );
}
