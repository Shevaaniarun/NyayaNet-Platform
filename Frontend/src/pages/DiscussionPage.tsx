import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, TrendingUp, Users, BookOpen, Loader2 } from 'lucide-react';
import { DiscussionCard } from '../components/Discussion/DiscussionCard';
import { DiscussionDetail } from '../components/Discussion/DiscussionDetail';
import { CreateDiscussion } from '../components/Discussion/CreateDiscussion';
import { DiscussionFilters } from '../components/Discussion/DiscussionFilters';
import {
  discussionService,
  Discussion as ApiDiscussion,
  DiscussionFilters as ApiDiscussionFilters
} from '../api/discussionService';
import { toast } from 'react-toastify';

// Types for the component
interface Discussion extends ApiDiscussion {
  isUpvoted?: boolean;
  isFollowing?: boolean;
  isSaved?: boolean;
}

// Create a Reply type that matches DiscussionDetail's expectations
interface Reply {
  id: string;
  content: string;
  upvoteCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  author: {
    id: string;
    fullName?: string;
    role?: string;
    profilePhotoUrl?: string | null;
  };
  hasUpvoted?: boolean;
  replies: Reply[];
  isBestAnswer?: boolean;
}

interface DiscussionDetailState extends Discussion {
  replies: Reply[];
  isLoadingReplies: boolean;
  bestAnswer?: Reply;
  updatedAt: string;
  isPublic: boolean;
}

interface DiscussionFilterType {
  page: number;
  limit: number;
  sort: 'newest' | 'active' | 'popular' | 'upvoted';
  status?: 'active' | 'resolved';
  category?: string;
  type?: string;
  tags?: string[];
  q?: string;
  following?: boolean;
}

// Available discussion categories
// Available discussion categories (mapped to backend enum)
const DISCUSSION_CATEGORIES = [
  'CONSTITUTIONAL_LAW',
  'CRIMINAL_LAW',
  'CIVIL_LAW',
  'CORPORATE_LAW',
  'INTELLECTUAL_PROPERTY',
  'TAX_LAW',
  'ARBITRATION',
  'CONSUMER_LAW',
  'FAMILY_LAW',
  'PROPERTY_LAW',
  'CYBER_LAW',
  'LEGAL_ETHICS',
  'INTERNATIONAL_LAW',
];

export function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionDetailState | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [filters, setFilters] = useState<DiscussionFilterType>({
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
  const [availableCategories, setAvailableCategories] = useState<string[]>(DISCUSSION_CATEGORIES);

  // Calculate statistics
  const stats = {
    total: pagination.total,
    active: discussions.filter(d => !d.isResolved).length,
    resolved: discussions.filter(d => d.isResolved).length,
    totalReplies: discussions.reduce((sum, d) => sum + (d.replyCount || 0), 0),
  };

  const fetchDiscussions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await discussionService.getDiscussions(filters);

      setDiscussions(response.discussions || []);
      setPagination({
        total: response.pagination?.total || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        totalPages: response.pagination?.pages || 1
      });

      // Update available categories from API if provided
      if (response.categories && response.categories.length > 0) {
        setAvailableCategories(response.categories);
      }
    } catch (error: any) {
      console.error('Failed to fetch discussions:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load discussions. Please try again later.';
      toast.error(errorMessage);
      setDiscussions([]);
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
    fetchDiscussions();
  }, [fetchDiscussions]);

  const handleCreateDiscussion = async (data: {
    title: string;
    description: string;
    discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
    category: string;
    tags: string[];
    isPublic: boolean;
  }) => {
    try {
      setIsCreating(true);
      const newDiscussion = await discussionService.createDiscussion(data);
      if (newDiscussion) {
        setDiscussions(prev => [newDiscussion as unknown as Discussion, ...prev]);
        setShowCreateForm(false);
        toast.success('Discussion created successfully!');
      }
    } catch (error: any) {
      console.error('Failed to create discussion:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create discussion. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpvote = async (discussionId: string) => {
    try {
      const result = await discussionService.toggleDiscussionUpvote(discussionId);

      setDiscussions(prev =>
        prev.map(discussion =>
          discussion.id === discussionId
            ? {
              ...discussion,
              upvoteCount: result.upvoteCount,
              isUpvoted: result.upvoted
            }
            : discussion
        )
      );

      // Update selected discussion if it's the one being upvoted
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prev => prev ? {
          ...prev,
          upvoteCount: result.upvoteCount,
          isUpvoted: result.upvoted
        } : null);
      }

      toast.success(result.upvoted ? 'Discussion upvoted!' : 'Discussion unvoted!');
    } catch (error: any) {
      console.error('Failed to upvote:', error);
      const errorMessage = error.response?.data?.message || 'Failed to toggle upvote.';
      toast.error(errorMessage);
    }
  };

  const handleReplyUpvote = async (replyId: string) => {
    try {
      const result = await discussionService.toggleReplyUpvote(replyId);

      if (selectedDiscussion) {
        const updateRepliesRecursively = (replies: Reply[]): Reply[] => {
          return replies.map(r => {
            if (r.id === replyId) {
              return { ...r, upvoteCount: result.upvoteCount, hasUpvoted: result.upvoted };
            }
            if (r.replies && r.replies.length > 0) {
              return { ...r, replies: updateRepliesRecursively(r.replies) };
            }
            return r;
          });
        };

        setSelectedDiscussion(prev => prev ? {
          ...prev,
          replies: updateRepliesRecursively(prev.replies)
        } : null);
      }

      toast.success(result.upvoted ? 'Reply upvoted!' : 'Reply unvoted!');
    } catch (error: any) {
      console.error('Failed to upvote reply:', error);
      toast.error('Failed to upvote reply.');
    }
  };

  const handleFollow = async (discussionId: string) => {
    try {
      const result = await discussionService.toggleFollow(discussionId);
      setDiscussions(prev =>
        prev.map(discussion =>
          discussion.id === discussionId
            ? {
              ...discussion,
              followerCount: result.followerCount,
              isFollowing: result.following
            }
            : discussion
        )
      );

      // Update selected discussion if it's the one being followed
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prev => prev ? {
          ...prev,
          followerCount: result.followerCount,
          isFollowing: result.following
        } : null);
      }
    } catch (error: any) {
      console.error('Failed to follow discussion:', error);
      const errorMessage = error.response?.data?.message || 'Failed to follow discussion. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSave = async (discussionId: string) => {
    try {
      const result = await discussionService.toggleSave(discussionId);
      setDiscussions(prev =>
        prev.map(discussion =>
          discussion.id === discussionId
            ? { ...discussion, isSaved: result.saved }
            : discussion
        )
      );

      // Update selected discussion if it's the one being saved
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prev => prev ? {
          ...prev,
          isSaved: result.saved
        } : null);
      }

      toast.success(result.saved ? 'Discussion saved!' : 'Discussion unsaved!');
    } catch (error) {
      console.error('Failed to save discussion:', error);
      toast.error('Failed to save discussion. Please try again.');
    }
  };

  const handleFilterChange = (newFilters: Partial<DiscussionFilterType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleDiscussionClick = async (discussion: Discussion) => {
    try {
      // Fetch discussion details
      const discussionDetail = await discussionService.getDiscussionById(discussion.id);

      // Transform to match DiscussionDetailState interface
      const detailState: DiscussionDetailState = {
        ...discussionDetail,
        replies: discussionDetail.replies || [],
        isLoadingReplies: false,
        isPublic: discussionDetail.isPublic !== undefined ? discussionDetail.isPublic : true,
        updatedAt: discussionDetail.updatedAt || discussionDetail.lastActivityAt || discussionDetail.createdAt,
        bestAnswer: discussionDetail.bestAnswer || undefined
      };

      setSelectedDiscussion(detailState);

    } catch (error: any) {
      console.error('Failed to load discussion details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load discussion details.';
      toast.error(errorMessage);
    }
  };

  const handleBackToList = () => {
    setSelectedDiscussion(null);
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
  if (isLoading && !selectedDiscussion) {
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

  // Create discussion form
  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-justice-black p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <CreateDiscussion
            onSubmit={handleCreateDiscussion}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  // Discussion detail view
  if (selectedDiscussion) {
    return (
      <div className="min-h-screen bg-justice-black p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleBackToList}
            className="flex items-center text-constitution-gold hover:text-constitution-gold/80 mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Discussions
          </button>

          <DiscussionDetail
            discussion={selectedDiscussion}
            currentUserId={currentUserId}
            onBack={handleBackToList}
            onDiscussionUpvote={() => handleUpvote(selectedDiscussion.id)}
            onFollow={() => handleFollow(selectedDiscussion.id)}
            onSave={() => handleSave(selectedDiscussion.id)}
            onReply={async (content, parentId) => {
              try {
                const reply = await discussionService.addReply(selectedDiscussion.id, {
                  content,
                  parentReplyId: parentId
                });
                toast.success('Reply added successfully!');

                if (reply) {
                  // Add the new reply to the local state recursively
                  const addReplyRecursively = (replies: Reply[], newReply: any): Reply[] => {
                    if (!newReply.parentReplyId) {
                      return [...replies, newReply as Reply];
                    }
                    return replies.map(r => {
                      if (r.id === newReply.parentReplyId) {
                        return { ...r, replies: [...(r.replies || []), newReply as Reply] };
                      }
                      if (r.replies && r.replies.length > 0) {
                        return { ...r, replies: addReplyRecursively(r.replies, newReply) };
                      }
                      return r;
                    });
                  };

                  setSelectedDiscussion(prev => prev ? {
                    ...prev,
                    replyCount: (prev.replyCount || 0) + 1,
                    replies: addReplyRecursively(prev.replies, reply)
                  } : null);

                  // Also update in the list
                  setDiscussions(prev => prev.map(d =>
                    d.id === selectedDiscussion.id
                      ? { ...d, replyCount: (d.replyCount || 0) + 1 }
                      : d
                  ));
                }
              } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Failed to add reply.';
                toast.error(errorMessage);
              }
            }}
            onUpvote={handleReplyUpvote}
            onShare={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              toast.info('Link copied to clipboard!');
            }}
            onMarkBestAnswer={async (replyId) => {
              try {
                const success = await discussionService.markBestAnswer(selectedDiscussion.id, replyId);
                if (success) {
                  toast.success('Best answer marked!');

                  // Refresh discussion details
                  const updatedDiscussion = await discussionService.getDiscussionById(selectedDiscussion.id);
                  setSelectedDiscussion(prev => prev ? {
                    ...prev,
                    ...updatedDiscussion
                  } : null);
                }
              } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Failed to mark as best answer.';
                toast.error(errorMessage);
              }
            }}
            onMarkResolved={async () => {
              try {
                const success = await discussionService.markResolved(selectedDiscussion.id);
                if (success) {
                  toast.success('Discussion marked as resolved!');

                  // Update local state
                  setSelectedDiscussion(prev => prev ? {
                    ...prev,
                    isResolved: true
                  } : null);

                  // Update discussions list
                  setDiscussions(prev =>
                    prev.map(d =>
                      d.id === selectedDiscussion.id
                        ? { ...d, isResolved: true }
                        : d
                    )
                  );
                }
              } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Failed to mark as resolved.';
                toast.error(errorMessage);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Main discussions list view
  return (
    <div className="min-h-screen bg-justice-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-heading font-bold text-judge-ivory text-2xl md:text-3xl mb-1 md:mb-2">
              Legal Debates
            </h1>
            <p className="text-ink-gray/70 text-sm md:text-base">
              Professional discussions, case analyses, and legal queries
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isCreating}
            className="px-4 md:px-6 py-2 md:py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors flex items-center space-x-2 w-full md:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            )}
            <span>{isCreating ? 'Creating...' : 'Start Discussion'}</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={MessageSquare}
            title="Total Discussions"
            value={stats.total}
          />
          <StatCard
            icon={TrendingUp}
            title="Active"
            value={stats.active}
          />
          <StatCard
            icon={BookOpen}
            title="Resolved"
            value={stats.resolved}
          />
          <StatCard
            icon={Users}
            title="Total Replies"
            value={stats.totalReplies}
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <DiscussionFilters
            onFilterChange={handleFilterChange}
            availableCategories={availableCategories}
          />
        </div>

        {/* Discussions List */}
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onClick={() => handleDiscussionClick(discussion)}
              onFollow={() => handleFollow(discussion.id)}
              onSave={() => handleSave(discussion.id)}
            />
          ))}
        </div>

        {discussions.length === 0 && !isLoading && (
          <div className="text-center py-12 md:py-16">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full border-2 border-constitution-gold/30 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-constitution-gold" />
            </div>
            <h3 className="font-heading font-bold text-ink-gray text-xl md:text-2xl mb-2">
              No discussions found
            </h3>
            <p className="text-ink-gray/70 mb-6 text-sm md:text-base">
              Try adjusting your filters or start a new discussion
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 md:py-3 bg-constitution-gold text-justice-black rounded-lg font-bold hover:bg-constitution-gold/90 transition-colors text-sm md:text-base"
            >
              Start First Discussion
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