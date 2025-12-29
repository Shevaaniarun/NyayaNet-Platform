import { useState, useEffect } from 'react';
import { Send, Heart, Bookmark, Share2, Flag, MoreVertical, CheckCircle, Gavel, Users, MessageSquare, Eye, Calendar, ChevronLeft, User, Reply } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  description: string;
  discussionType: 'GENERAL' | 'CASE_ANALYSIS' | 'LEGAL_QUERY' | 'OPINION_POLL';
  category: string;
  tags: string[];
  replyCount: number;
  upvoteCount: number;
  viewCount: number;
  followerCount: number;
  isResolved: boolean;
  hasBestAnswer: boolean;
  createdAt: string;
  lastActivityAt: string;
  author: {
    id: string;
    fullName?: string;
    role?: string;
    profilePhotoUrl?: string | null;  // Made consistent
  };
  isFollowing?: boolean;
  isSaved?: boolean;
}

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
    profilePhotoUrl?: string | null;  // Made consistent
  };
  hasUpvoted?: boolean;
  replies: Reply[];
  isBestAnswer?: boolean;
}

interface DiscussionDetailProps {
  discussion: Discussion & {
    isPublic: boolean;
    updatedAt: string;
    bestAnswer?: {
      id: string;
      content: string;
      upvoteCount: number;
      author: {
        fullName?: string;
        profilePhotoUrl?: string | null;  // Made consistent
      };
    } | null;
    replies: Reply[];
  };
  onBack?: () => void;
  onReply?: (content: string, parentReplyId?: string) => void;
  onUpvote?: (replyId: string) => void;
  onFollow?: () => void;
  onSave?: () => void;
  onMarkBestAnswer?: (replyId: string) => void;
  onMarkResolved?: () => void;
}

export function DiscussionDetail({
  discussion,
  onBack,
  onReply,
  onUpvote,
  onFollow,
  onSave,
  onMarkBestAnswer,
  onMarkResolved,
}: DiscussionDetailProps) {
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleReplyExpansion = (replyId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(replyId)) {
      newExpanded.delete(replyId);
    } else {
      newExpanded.add(replyId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && onReply) {
      onReply(replyContent, replyingTo || undefined);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const renderReply = (reply: Reply, depth: number = 0) => {
    const isExpanded = expandedReplies.has(reply.id);
    const canReply = depth < 3; // Limit nesting depth

    return (
      <div key={reply.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}>
        {/* Reply Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream">
                {reply.author.profilePhotoUrl ? (
                  <img
                    src={reply.author.profilePhotoUrl}
                    alt={reply.author.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-constitution-gold" />
                  </div>
                )}
              </div>
              {reply.isBestAnswer && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-constitution-gold rounded-full border-2 border-parchment-cream flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-justice-black" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-ink-gray">{reply.author.fullName}</h4>
                <span className="text-ink-gray/60 text-sm">{reply.author.role}</span>
              </div>
              <div className="flex items-center space-x-3 text-ink-gray/60 text-xs">
                <span>{formatDate(reply.createdAt)}</span>
                {reply.isEdited && <span className="italic">(edited)</span>}
              </div>
            </div>
          </div>

          {/* Reply Actions */}
          <div className="flex items-center space-x-3">
            {discussion.author.id === 'current-user-id' && !discussion.isResolved && (
              <button
                onClick={() => onMarkBestAnswer?.(reply.id)}
                className="px-3 py-1 bg-constitution-gold/10 hover:bg-constitution-gold/20 border border-constitution-gold/30 rounded text-constitution-gold text-sm transition-colors"
              >
                Mark Best Answer
              </button>
            )}
            <button
              onClick={() => onUpvote?.(reply.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded ${reply.hasUpvoted ? 'bg-constitution-gold/20 text-constitution-gold' : 'bg-constitution-gold/5 text-ink-gray/70 hover:text-constitution-gold'} transition-colors`}
            >
              <Heart className={`w-4 h-4 ${reply.hasUpvoted ? 'fill-constitution-gold' : ''}`} />
              <span>{reply.upvoteCount}</span>
            </button>
          </div>
        </div>

        {/* Reply Content */}
        <div className="mt-3 ml-13">
          <div className="constitution-texture p-4 rounded-lg">
            <p className="text-ink-gray leading-relaxed">{reply.content}</p>
          </div>

          {/* Reply Actions */}
          <div className="flex items-center space-x-4 mt-3">
            {canReply && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === reply.id ? null : reply.id);
                  setReplyContent(replyingTo === reply.id ? '' : `@${reply.author.fullName} `);
                }}
                className="flex items-center space-x-1 text-ink-gray/70 hover:text-constitution-gold transition-colors text-sm"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
            <button className="flex items-center space-x-1 text-ink-gray/70 hover:text-constitution-gold transition-colors text-sm">
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </button>
            {reply.replyCount > 0 && (
              <button
                onClick={() => toggleReplyExpansion(reply.id)}
                className="flex items-center space-x-1 text-constitution-gold hover:text-gavel-bronze transition-colors text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {isExpanded ? 'Hide' : 'Show'} {reply.replyCount} repl{reply.replyCount === 1 ? 'y' : 'ies'}
                </span>
              </button>
            )}
          </div>

          {/* Nested Replies */}
          {isExpanded && reply.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {reply.replies.map((nestedReply) => renderReply(nestedReply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-justice-black">
      {/* Header */}
      <div className="border-b border-constitution-gold/20 bg-justice-black/95 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-constitution-gold hover:text-gavel-bronze transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Discussions</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={onFollow}
                className={`px-4 py-2 rounded-lg font-medium ${discussion.isFollowing ? 'bg-constitution-gold text-justice-black' : 'border border-constitution-gold text-constitution-gold hover:bg-constitution-gold/5'} transition-colors`}
              >
                {discussion.isFollowing ? 'Following' : 'Follow Discussion'}
              </button>
              <button
                onClick={onSave}
                className={`p-2 rounded-lg ${discussion.isSaved ? 'text-constitution-gold' : 'text-ink-gray/70 hover:text-constitution-gold'} transition-colors`}
              >
                <Bookmark className={`w-5 h-5 ${discussion.isSaved ? 'fill-constitution-gold' : ''}`} />
              </button>
              <button className="p-2 rounded-lg text-ink-gray/70 hover:text-constitution-gold transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Discussion Header */}
        <div className="aged-paper rounded-lg p-8 mb-8 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-constitution-gold to-transparent"></div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream">
                    {discussion.author.profilePhotoUrl ? (
                      <img
                        src={discussion.author.profilePhotoUrl}
                        alt={discussion.author.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                        <Gavel className="w-6 h-6 text-constitution-gold" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-ink-gray">{discussion.author.fullName}</h2>
                    <p className="text-ink-gray/60 text-sm">{discussion.author.role}</p>
                  </div>
                </div>
                <div className="text-ink-gray/60 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Started {formatDate(discussion.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>Last updated {formatDate(discussion.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <h1 className="font-heading font-bold text-ink-gray text-3xl mb-4">{discussion.title}</h1>

              <div className="flex items-center space-x-4 mb-6">
                <span className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/20 rounded-full text-sm">
                  {discussion.discussionType.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-gavel-bronze/10 text-gavel-bronze border border-gavel-bronze/20 rounded-full text-sm">
                  {discussion.category}
                </span>
                {discussion.isResolved && (
                  <span className="px-3 py-1 bg-constitution-gold text-justice-black rounded-full font-medium text-sm">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="constitution-texture p-6 rounded-lg mb-6">
            <p className="text-ink-gray leading-relaxed text-lg whitespace-pre-line">{discussion.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-6 border-t border-constitution-gold/20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-ink-gray/60" />
                <span className="font-medium text-ink-gray">{discussion.replyCount} replies</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-ink-gray/60" />
                <span className="font-medium text-ink-gray">{discussion.viewCount} views</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-ink-gray/60" />
                <span className="font-medium text-ink-gray">{discussion.followerCount} followers</span>
              </div>
            </div>

            {!discussion.isResolved && discussion.author.id === 'current-user-id' && (
              <button
                onClick={onMarkResolved}
                className="px-4 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors"
              >
                Mark as Resolved
              </button>
            )}
          </div>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-constitution-gold/20">
              {discussion.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-constitution-gold/5 border border-constitution-gold/20 rounded-full text-ink-gray/80 hover:bg-constitution-gold/10 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Best Answer */}
        {discussion.bestAnswer && (
          <div className="aged-paper rounded-lg p-6 mb-8 border-2 border-constitution-gold/30">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-constitution-gold" />
              <h3 className="font-heading font-bold text-ink-gray">Best Answer</h3>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream">
                {discussion.bestAnswer.author.profilePhotoUrl ? (
                  <img
                    src={discussion.bestAnswer.author.profilePhotoUrl}
                    alt={discussion.bestAnswer.author.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-constitution-gold" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-ink-gray">{discussion.bestAnswer.author.fullName}</h4>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-constitution-gold" />
                    <span className="text-sm text-ink-gray">{discussion.bestAnswer.upvoteCount}</span>
                  </div>
                </div>
                <div className="constitution-texture p-4 rounded">
                  <p className="text-ink-gray">{discussion.bestAnswer.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Replies */}
        <div className="mb-8">
          <h3 className="font-heading font-bold text-judge-ivory mb-6 text-xl">
            {discussion.replies.length} {discussion.replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          <div className="space-y-8">
            {discussion.replies.map((reply) => renderReply(reply))}
          </div>
        </div>

        {/* Reply Form */}
        <div className="aged-paper rounded-lg p-6 sticky bottom-8">
          <form onSubmit={handleSubmitReply}>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full border border-constitution-gold/30 bg-parchment-cream flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-constitution-gold" />
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={replyingTo ? "Write your reply..." : "Share your legal insights or analysis..."}
                  className="w-full parchment-bg border border-constitution-gold/30 rounded-lg p-4 text-ink-gray font-body focus:outline-none focus:border-constitution-gold resize-none"
                  rows={4}
                />
                {replyingTo && (
                  <div className="mt-2 text-sm text-constitution-gold">
                    Replying to a comment
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 border border-constitution-gold/30 text-constitution-gold rounded-lg hover:bg-constitution-gold/5 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-6 py-2 bg-constitution-gold text-justice-black rounded-lg font-medium hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}