import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageSquare, TrendingUp, Users, BookOpen } from 'lucide-react';
import { DiscussionCard, Discussion } from '../components/Discussion/DiscussionCard';
import { DiscussionDetail } from '../components/Discussion/DiscussionDetail';
import { CreateDiscussion } from '../components/Discussion/CreateDiscussion';
import { DiscussionFilters } from '../components/Discussion/DiscussionFilters';

// Mock data - Replace with API calls
const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'Interpretation of Article 21 in Digital Age - Right to Privacy vs National Security',
    description: 'Analyzing the recent Supreme Court judgment on digital privacy and its implications for fundamental rights in the context of national security concerns.',
    discussionType: 'CASE_ANALYSIS',
    category: 'Constitutional Law',
    tags: ['Article21', 'DigitalPrivacy', 'SupremeCourt', 'FundamentalRights'],
    replyCount: 42,
    upvoteCount: 128,
    viewCount: 567,
    followerCount: 89,
    isResolved: false,
    hasBestAnswer: true,
    createdAt: new Date('2024-01-10T10:30:00'),
    lastActivityAt: new Date('2024-01-15T14:20:00'),
    author: {
      id: '1',
      fullName: 'Adv. Rajesh Kumar',
      role: 'Senior Advocate',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    isFollowing: true,
    isSaved: true,
  },
  {
    id: '2',
    title: 'Consumer Protection Act 2019 - Key Changes and Practical Implications',
    description: 'Discussion on the major amendments in the new Consumer Protection Act and how they affect legal practice and consumer rights enforcement.',
    discussionType: 'LEGAL_QUERY',
    category: 'Consumer Law',
    tags: ['ConsumerProtection', 'Amendment', 'LegalPractice'],
    replyCount: 28,
    upvoteCount: 76,
    viewCount: 342,
    followerCount: 45,
    isResolved: true,
    hasBestAnswer: true,
    createdAt: new Date('2024-01-05T14:20:00'),
    lastActivityAt: new Date('2024-01-12T11:45:00'),
    author: {
      id: '2',
      fullName: 'Dr. Priya Sharma',
      role: 'Legal Scholar',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    },
    isFollowing: false,
    isSaved: false,
  },
  {
    id: '3',
    title: 'Opinion: Should AI-generated legal arguments be admissible in court?',
    description: 'A poll and discussion on the ethical and practical considerations of using AI-generated legal arguments in court proceedings.',
    discussionType: 'OPINION_POLL',
    category: 'Legal Ethics',
    tags: ['AI', 'LegalTech', 'Ethics', 'CourtProcedure'],
    replyCount: 156,
    upvoteCount: 234,
    viewCount: 892,
    followerCount: 167,
    isResolved: false,
    hasBestAnswer: false,
    createdAt: new Date('2024-01-08T09:15:00'),
    lastActivityAt: new Date('2024-01-16T16:30:00'),
    author: {
      id: '3',
      fullName: 'Justice Mehta (Retd.)',
      role: 'Former High Court Judge',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    },
    isFollowing: true,
    isSaved: true,
  },
  {
    id: '4',
    title: 'Case Analysis: Landmark Judgment on Environmental Protection under Article 48A',
    description: 'Detailed analysis of the recent Supreme Court judgment expanding the scope of Article 48A and its implications for environmental litigation.',
    discussionType: 'CASE_ANALYSIS',
    category: 'Environmental Law',
    tags: ['Environment', 'Article48A', 'JudgmentAnalysis', 'PublicInterest'],
    replyCount: 34,
    upvoteCount: 92,
    viewCount: 456,
    followerCount: 67,
    isResolved: false,
    hasBestAnswer: true,
    createdAt: new Date('2024-01-12T11:00:00'),
    lastActivityAt: new Date('2024-01-16T10:15:00'),
    author: {
      id: '4',
      fullName: 'Adv. Ananya Iyer',
      role: 'Environmental Lawyer',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    },
    isFollowing: false,
    isSaved: false,
  },
];

const categories = [
  'Constitutional Law',
  'Criminal Law',
  'Civil Law',
  'Corporate Law',
  'IPR Law',
  'Tax Law',
  'Family Law',
  'Consumer Law',
  'Environmental Law',
  'Cyber Law',
  'Legal Ethics',
  'International Law',
];

export function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>(mockDiscussions);

  const handleDiscussionClick = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedDiscussion(null);
  };

  const handleCreateDiscussion = (data: any) => {
    // In real app, make API call here
    const newDiscussion: Discussion = {
      id: (discussions.length + 1).toString(),
      ...data,
      replyCount: 0,
      upvoteCount: 0,
      viewCount: 0,
      followerCount: 0,
      isResolved: false,
      hasBestAnswer: false,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      author: {
        id: 'current-user',
        fullName: 'Current User',
        role: 'Lawyer',
      },
      isFollowing: true,
      isSaved: false,
    };
    setDiscussions([newDiscussion, ...discussions]);
    setShowCreateForm(false);
  };

  const handleFilterChange = (filters: any) => {
    // In real app, make API call with filters
    console.log('Filters:', filters);
    // For now, just filter locally
    let filtered = [...mockDiscussions];
    
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.description.toLowerCase().includes(query) ||
        d.tags.some(tag => tag.toLowerCase().includes(query)) ||
        d.author.fullName?.toLowerCase().includes(query)
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(d => d.category === filters.category);
    }
    
    if (filters.type) {
      filtered = filtered.filter(d => d.discussionType === filters.type);
    }
    
    if (filters.status === 'resolved') {
      filtered = filtered.filter(d => d.isResolved);
    } else if (filters.status === 'active') {
      filtered = filtered.filter(d => !d.isResolved);
    }
    
    if (filters.following) {
      filtered = filtered.filter(d => d.isFollowing);
    }
    
    // Apply sorting
    if (filters.sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sort === 'active') {
      filtered.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
    } else if (filters.sort === 'popular') {
      filtered.sort((a, b) => b.replyCount + b.viewCount - (a.replyCount + a.viewCount));
    } else if (filters.sort === 'upvoted') {
      filtered.sort((a, b) => b.upvoteCount - a.upvoteCount);
    }
    
    setFilteredDiscussions(filtered);
  };

  const stats = {
    total: discussions.length,
    active: discussions.filter(d => !d.isResolved).length,
    resolved: discussions.filter(d => d.isResolved).length,
    totalReplies: discussions.reduce((sum, d) => sum + d.replyCount, 0),
  };

  if (view === 'detail' && selectedDiscussion) {
    // Add mock replies for detail view
    const discussionWithReplies = {
      ...selectedDiscussion,
      isPublic: true,
      updatedAt: selectedDiscussion.lastActivityAt,
      bestAnswer: selectedDiscussion.hasBestAnswer ? {
        id: 'best-1',
        content: 'This is an excellent analysis. The Supreme Court has indeed expanded the interpretation while maintaining the balance with national security concerns.',
        upvoteCount: 42,
        author: {
          fullName: 'Expert Lawyer',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        },
      } : null,
      replies: [
        {
          id: 'reply-1',
          content: 'Excellent analysis. I would add that the balancing test applied by the Court sets an important precedent for future digital rights cases.',
          upvoteCount: 24,
          replyCount: 3,
          isEdited: false,
          createdAt: new Date('2024-01-11T14:30:00'),
          author: {
            id: 'user-1',
            fullName: 'Adv. Sharma',
            role: 'Constitutional Lawyer',
            profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          },
          hasUpvoted: false,
          replies: [
            {
              id: 'reply-1-1',
              content: 'I agree, the balancing test is crucial. It provides a framework for lower courts to follow.',
              upvoteCount: 8,
              replyCount: 0,
              isEdited: false,
              createdAt: new Date('2024-01-12T10:15:00'),
              author: {
                id: 'user-2',
                fullName: 'Dr. Patel',
                role: 'Legal Scholar',
              },
              hasUpvoted: true,
              replies: [],
            },
          ],
        },
        {
          id: 'reply-2',
          content: 'The judgment leaves some questions unanswered regarding implementation. How will this affect existing surveillance frameworks?',
          upvoteCount: 18,
          replyCount: 2,
          isEdited: true,
          createdAt: new Date('2024-01-12T09:45:00'),
          author: {
            id: 'user-3',
            fullName: 'Adv. Gupta',
            role: 'Criminal Lawyer',
            profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
          },
          hasUpvoted: false,
          replies: [],
          isBestAnswer: selectedDiscussion.hasBestAnswer,
        },
      ],
    };

    return (
      <DiscussionDetail
        discussion={discussionWithReplies}
        onBack={handleBackToList}
        onReply={(content, parentReplyId) => {
          console.log('New reply:', content, 'Parent:', parentReplyId);
          // In real app, make API call
        }}
        onUpvote={(replyId) => {
          console.log('Upvote reply:', replyId);
          // In real app, make API call
        }}
        onFollow={() => {
          console.log('Toggle follow');
          // In real app, make API call
        }}
        onSave={() => {
          console.log('Toggle save');
          // In real app, make API call
        }}
        onMarkBestAnswer={(replyId) => {
          console.log('Mark as best answer:', replyId);
          // In real app, make API call
        }}
        onMarkResolved={() => {
          console.log('Mark as resolved');
          // In real app, make API call
        }}
      />
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-justice-black p-8">
        <div className="max-w-4xl mx-auto">
          <CreateDiscussion
            onSubmit={handleCreateDiscussion}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-justice-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-judge-ivory text-3xl mb-2">Legal Debates</h1>
            <p className="text-ink-gray/70">Professional discussions, case analyses, and legal queries</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Start Discussion</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Total Discussions</p>
                <p className="font-heading font-bold text-ink-gray text-2xl">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-constitution-gold" />
              </div>
            </div>
          </div>

          <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Active</p>
                <p className="font-heading font-bold text-ink-gray text-2xl">{stats.active}</p>
              </div>
              <div className="w-10 h-10 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-constitution-gold" />
              </div>
            </div>
          </div>

          <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Resolved</p>
                <p className="font-heading font-bold text-ink-gray text-2xl">{stats.resolved}</p>
              </div>
              <div className="w-10 h-10 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-constitution-gold" />
              </div>
            </div>
          </div>

          <div className="aged-paper rounded-lg p-4 border border-constitution-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-ink-gray/60 mb-1" style={{ fontSize: '0.875rem' }}>Total Replies</p>
                <p className="font-heading font-bold text-ink-gray text-2xl">{stats.totalReplies}</p>
              </div>
              <div className="w-10 h-10 bg-constitution-gold/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-constitution-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <DiscussionFilters
          onFilterChange={handleFilterChange}
          availableCategories={categories}
        />

        {/* Discussions List */}
        <div className="space-y-6">
          {filteredDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => handleDiscussionClick(discussion)}
            />
          ))}
        </div>

        {filteredDiscussions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-constitution-gold" />
            </div>
            <h3 className="font-heading font-bold text-ink-gray text-xl mb-2">No discussions found</h3>
            <p className="text-ink-gray/70 mb-6">Try adjusting your filters or start a new discussion</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors"
            >
              Start First Discussion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}