import { useState } from 'react';
import { Send, Bookmark, Share2, Flag, CheckCircle, Gavel, Users, MessageSquare, Eye, Calendar, ChevronLeft, User, TrendingUp, Heart, Lock, ArrowBigUp } from 'lucide-react';
import { ReplyCard, ReplyType } from './ReplyCard';

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
    profilePhotoUrl?: string | null;
  };
  isFollowing?: boolean;
  isSaved?: boolean;
  isUpvoted?: boolean;
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
        profilePhotoUrl?: string | null;
      };
    } | null;
    replies: ReplyType[];
  };
  currentUserId?: string;
  onBack?: () => void;
  onReply?: (content: string, parentReplyId?: string) => void;
  onUpvote?: (replyId: string) => void;
  onDiscussionUpvote?: () => void;
  onFollow?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onMarkBestAnswer?: (replyId: string) => void;
  onMarkResolved?: () => void;
}

export function DiscussionDetail({
  discussion,
  currentUserId,
  onBack,
  onReply,
  onUpvote,
  onDiscussionUpvote,
  onFollow,
  onSave,
  onShare,
  onMarkBestAnswer,
  onMarkResolved,
}: DiscussionDetailProps) {
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && onReply) {
      onReply(replyContent, replyingTo?.id);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleReplyAction = (replyId: string, authorName: string) => {
    setReplyingTo({ id: replyId, name: authorName });
    // Scroll to reply form
    const formElement = document.getElementById('reply-form');
    formElement?.scrollIntoView({ behavior: 'smooth' });
  };

  const isAuthor = currentUserId === discussion.author.id;

  return (
    <div className="min-h-screen bg-justice-black pb-20">
      {/* Premium Header */}
      <div className="border-b border-constitution-gold/10 bg-justice-black/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-constitution-gold hover:text-gavel-bronze transition-all group"
            >
              <div className="p-1 rounded-full group-hover:bg-constitution-gold/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <span className="font-bold uppercase tracking-widest text-xs">Back</span>
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={onDiscussionUpvote}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${discussion.isUpvoted
                  ? 'bg-constitution-gold text-justice-black'
                  : 'border border-constitution-gold/30 text-constitution-gold hover:bg-constitution-gold/10'
                  }`}
              >
                <ArrowBigUp className={`w-4 h-4 ${discussion.isUpvoted ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">{discussion.isUpvoted ? 'Upvoted' : 'Upvote'}</span>
              </button>

              <button
                onClick={onFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${discussion.isFollowing
                  ? 'bg-constitution-gold text-justice-black'
                  : 'border border-constitution-gold/30 text-constitution-gold hover:bg-constitution-gold/10'
                  }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">{discussion.isFollowing ? 'Following' : 'Follow Thread'}</span>
              </button>

              <button
                onClick={onSave}
                className={`p-2.5 rounded-full border transition-all ${discussion.isSaved
                  ? 'bg-constitution-gold text-justice-black border-constitution-gold'
                  : 'bg-justice-black/50 text-constitution-gold border-constitution-gold/20 hover:bg-constitution-gold/10'
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${discussion.isSaved ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={onShare}
                className="p-2.5 rounded-full bg-justice-black/50 border border-constitution-gold/20 text-constitution-gold hover:bg-constitution-gold/10 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Discussion Main Post */}
        <article className="aged-paper rounded-2xl p-6 md:p-10 mb-10 border border-constitution-gold/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Gavel className="w-32 h-32 text-constitution-gold" />
          </div>

          <header className="relative z-10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {discussion.discussionType.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {discussion.category}
              </span>
              {discussion.isResolved && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-seal-red/10 text-seal-red border border-seal-red/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3" />
                  Resolved
                </span>
              )}
            </div>

            <h1 className="font-heading font-black text-ink-gray text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight tracking-tight">
              {discussion.title}
            </h1>

            <div className="flex items-center gap-4 py-6 border-y border-constitution-gold/10">
              <div className="w-14 h-14 rounded-full border-2 border-constitution-gold overflow-hidden bg-parchment-cream shadow-inner">
                {discussion.author.profilePhotoUrl ? (
                  <img
                    src={discussion.author.profilePhotoUrl}
                    alt={discussion.author.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-constitution-gold" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-heading font-bold text-ink-gray text-xl">{discussion.author.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-constitution-gold font-bold text-[10px] uppercase tracking-wider">{discussion.author.role}</span>
                  <span className="w-1 h-1 bg-ink-gray/20 rounded-full"></span>
                  <span className="text-ink-gray/40 text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(discussion.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <section className="relative z-10">
            <div className="constitution-texture p-6 md:p-8 rounded-2xl bg-parchment-cream/30 border border-constitution-gold/5 mb-8">
              <p className="text-ink-gray leading-relaxed text-lg md:text-xl whitespace-pre-line font-body italic opacity-90">
                "{discussion.description}"
              </p>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-constitution-gold" />
                  <div className="flex flex-col">
                    <span className="font-bold text-ink-gray text-lg leading-none">{discussion.replyCount}</span>
                    <span className="text-[10px] uppercase font-bold text-ink-gray/40 tracking-tighter">Insights</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Eye className="w-5 h-5 text-constitution-gold" />
                  <div className="flex flex-col">
                    <span className="font-bold text-ink-gray text-lg leading-none">{discussion.viewCount}</span>
                    <span className="text-[10px] uppercase font-bold text-ink-gray/40 tracking-tighter">Views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-constitution-gold" />
                  <div className="flex flex-col">
                    <span className="font-bold text-ink-gray text-lg leading-none">{discussion.followerCount}</span>
                    <span className="text-[10px] uppercase font-bold text-ink-gray/40 tracking-tighter">Followers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!discussion.isResolved && isAuthor && (
                  <button
                    onClick={onMarkResolved}
                    className="px-6 py-2.5 bg-seal-red text-judge-ivory rounded-full font-bold text-xs uppercase tracking-widest hover:bg-seal-red/90 transition-all shadow-lg"
                  >
                    Mark Resolved
                  </button>
                )}
                <button className="flex items-center gap-2 text-ink-gray/40 hover:text-constitution-gold transition-colors font-bold text-xs uppercase tracking-widest">
                  <Flag className="w-4 h-4" />
                  Report Issue
                </button>
              </div>
            </footer>

            {discussion.tags && discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-constitution-gold/10">
                {discussion.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-ink-gray/5 border border-ink-gray/10 rounded-full text-link-blue hover:text-link-blue/80 transition-all cursor-pointer font-bold text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        </article>

        {/* expert solution section */}
        {discussion.bestAnswer && (
          <div className="aged-paper rounded-2xl p-8 mb-12 border-2 border-constitution-gold/30 shadow-2xl relative">
            <div className="absolute top-0 left-10 -translate-y-1/2 px-6 py-1.5 bg-constitution-gold text-justice-black rounded-full shadow-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-black text-xs uppercase tracking-tighter">Expert Solution</span>
            </div>

            <div className="flex items-start gap-6 mt-4">
              <div className="w-12 h-12 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream flex-shrink-0">
                {discussion.bestAnswer.author.profilePhotoUrl ? (
                  <img
                    src={discussion.bestAnswer.author.profilePhotoUrl}
                    alt={discussion.bestAnswer.author.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-constitution-gold" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-ink-gray text-lg">{discussion.bestAnswer.author.fullName}</h4>
                  <div className="flex items-center gap-2 text-constitution-gold bg-constitution-gold/10 px-3 py-1 rounded-full border border-constitution-gold/20">
                    <ArrowBigUp className="w-4 h-4 fill-current" />
                    <span className="text-sm font-black">{discussion.bestAnswer.upvoteCount}</span>
                  </div>
                </div>
                <div className="constitution-texture p-6 rounded-xl border border-constitution-gold/10 bg-white/40">
                  <p className="text-ink-gray leading-relaxed text-lg italic opacity-90">{discussion.bestAnswer.content}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-heading font-black text-judge-ivory text-2xl md:text-3xl flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-constitution-gold" />
              <span>{discussion.replies.length} Insights</span>
            </h3>
          </div>

          <div className="space-y-4">
            {discussion.replies.length > 0 ? (
              discussion.replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  canMarkBestAnswer={isAuthor && !discussion.isResolved}
                  onUpvote={onUpvote}
                  onReply={handleReplyAction}
                  onMarkBestAnswer={onMarkBestAnswer}
                />
              ))
            ) : (
              <div className="aged-paper rounded-2xl p-12 text-center border border-dashed border-constitution-gold/20">
                <div className="mb-4 flex justify-center opacity-20">
                  <MessageSquare className="w-16 h-16 text-constitution-gold" />
                </div>
                <h4 className="text-ink-gray/60 font-bold mb-2">No insights yet</h4>
                <p className="text-ink-gray/40 text-sm">Be the first to share your legal analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Reply Form – FIXED & TOP LAYER */}
        {discussion.isResolved ? (
          <div className="aged-paper rounded-2xl p-8 border-2 border-constitution-gold/30 shadow-xl text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-constitution-gold/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Lock className="w-10 h-10 text-constitution-gold" />
            </div>
            <h3 className="font-heading font-black text-ink-gray uppercase tracking-tighter text-2xl mb-2">
              Discussion Resolved
            </h3>
            <p className="font-body text-ink-gray/70 leading-relaxed max-w-md mx-auto">
              This legal exploration has reached its conclusion. No further insights or replies are being accepted at this time.
            </p>
          </div>
        ) : (
          <div
            id="reply-form"
            className="
              aged-paper
              rounded-2xl
              p-6
              md:p-8
              border-2
              border-constitution-gold
              shadow-2xl
              sticky
              bottom-8
              z-[9999]
              relative
              transform
              transition-transform
              hover:-translate-y-1
            "
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-constitution-gold rounded-lg">
                <Send className="w-5 h-5 text-justice-black" />
              </div>
              <h3 className="font-heading font-black text-ink-gray uppercase tracking-tighter text-xl">
                Add your Insight
              </h3>
            </div>

            <form onSubmit={handleSubmitReply}>
              <div className="flex flex-col gap-4">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-constitution-gold/10 px-4 py-2 rounded-lg border border-constitution-gold/20 animate-in fade-in slide-in-from-left-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-constitution-gold uppercase tracking-wider">
                      <User className="w-4 h-4" />
                      <span>Replying to {replyingTo.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="text-constitution-gold hover:text-seal-red transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="relative group">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={
                      replyingTo
                        ? 'Write your counter-argument or supporting analysis...'
                        : 'Share your legal insights, analysis or questions...'
                    }
                    className="
                    w-full
                    parchment-bg
                    border-2
                    border-constitution-gold/20
                    rounded-xl
                    p-5
                    text-ink-gray
                    font-body
                    focus:outline-none
                    focus:border-constitution-gold
                    resize-none
                    shadow-inner
                    text-lg
                    leading-relaxed
                    placeholder:opacity-30
                  "
                    rows={4}
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] font-bold text-ink-gray/20 uppercase tracking-widest group-focus-within:text-constitution-gold/50 transition-colors">
                    Markdown Supported
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="
                    group
                    relative
                    px-10
                    py-4
                    bg-constitution-gold
                    text-justice-black
                    rounded-xl
                    font-black
                    text-sm
                    uppercase
                    tracking-widest
                    hover:bg-constitution-gold/90
                    transition-all
                    disabled:opacity-50
                    disabled:grayscale
                    flex
                    items-center
                    gap-3
                    shadow-xl
                    active:scale-95
                  "
                  >
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Post Insight</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
