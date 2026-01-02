import { MessageSquare, Eye, Heart, Bookmark, Users, Scale, Calendar, Gavel, CheckCircle, TrendingUp, ArrowBigUp } from 'lucide-react';

export interface Discussion {
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

interface DiscussionCardProps {
  discussion: Discussion;
  onClick?: () => void;
  onFollow?: (e: React.MouseEvent) => void;
  onSave?: (e: React.MouseEvent) => void;
  onUpvote?: (e: React.MouseEvent) => void;
}

export function DiscussionCard({ discussion, onClick, onFollow, onSave, onUpvote }: DiscussionCardProps) {

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CASE_ANALYSIS':
        return 'bg-seal-red/10 text-seal-red border-seal-red/20';
      case 'LEGAL_QUERY':
        return 'bg-constitution-gold/10 text-constitution-gold border-constitution-gold/20';
      case 'OPINION_POLL':
        return 'bg-judge-ivory/10 text-judge-ivory border-judge-ivory/20';
      default:
        return 'bg-ink-gray/10 text-ink-gray border-ink-gray/20';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative">
      <div
        className="aged-paper rounded-xl p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-all cursor-pointer hover:shadow-xl hover:shadow-constitution-gold/5 overflow-hidden"
        onClick={onClick}
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-constitution-gold/50 via-gavel-bronze/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Author Info at Top (Quora-style) */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream">
              {discussion.author.profilePhotoUrl ? (
                <img
                  src={discussion.author.profilePhotoUrl}
                  alt={discussion.author.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-constitution-gold" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-ink-gray text-sm hover:text-constitution-gold transition-colors">
                  {discussion.author.fullName}
                </p>
                <span className="w-1 h-1 bg-ink-gray/30 rounded-full"></span>
                <span className="text-constitution-gold text-xs font-medium uppercase tracking-wider">
                  {discussion.author.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-ink-gray/50 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(discussion.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onFollow?.(e); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${discussion.isFollowing
                ? 'bg-constitution-gold text-justice-black'
                : 'bg-constitution-gold/5 text-constitution-gold border border-constitution-gold/20 hover:bg-constitution-gold/10'
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {discussion.isFollowing ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSave?.(e); }}
              className={`p-1.5 rounded-lg border transition-all ${discussion.isSaved
                ? 'bg-constitution-gold text-justice-black border-constitution-gold'
                : 'bg-ink-gray/5 text-ink-gray/40 border-transparent hover:border-constitution-gold/30 hover:text-constitution-gold'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${discussion.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-ink-gray/5 text-ink-gray/60 border border-ink-gray/10 rounded-md font-bold uppercase tracking-tight" style={{ fontSize: '0.65rem' }}>
              <span>{discussion.discussionType.replace('_', ' ')}</span>
            </span>

            {discussion.category && (
              <span className="px-2.5 py-1 bg-ink-gray/5 text-ink-gray/60 border border-ink-gray/10 rounded-md font-bold uppercase tracking-tight" style={{ fontSize: '0.65rem' }}>
                {discussion.category.replace('_', ' ')}
              </span>
            )}

            {discussion.isResolved && (
              <span className="flex items-center gap-1 text-seal-red font-bold uppercase tracking-tight" style={{ fontSize: '0.65rem' }}>
                <CheckCircle className="w-3 h-3" />
                Resolved
              </span>
            )}
          </div>

          <h3 className="font-heading font-bold text-ink-gray text-xl mb-2 line-clamp-2 leading-tight group-hover:text-constitution-gold transition-colors">
            {discussion.title}
          </h3>

          <p className="text-ink-gray/70 text-sm line-clamp-2 mb-4 leading-relaxed italic">
            "{discussion.description}"
          </p>
        </div>

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {discussion.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/30 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ fontSize: '0.7rem' }}
              >
                #{tag}
              </span>
            ))}
            {discussion.tags.length > 3 && (
              <span className="text-ink-gray/40 text-[0.7rem] pt-0.5">+{discussion.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-constitution-gold/10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-ink-gray/60">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{discussion.replyCount}</span>
              <span className="text-[10px] uppercase font-medium">Replies</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onUpvote?.(e); }}
              className={`flex items-center space-x-1.5 transition-all px-2 py-1 rounded-md border ${discussion.isUpvoted
                ? 'bg-constitution-gold/20 text-constitution-gold border-constitution-gold/40'
                : 'text-ink-gray/60 border-transparent hover:border-constitution-gold/20 hover:text-constitution-gold'
                }`}
            >
              <ArrowBigUp className={`w-4 h-4 ${discussion.isUpvoted ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">{discussion.upvoteCount}</span>
              <span className="text-[10px] uppercase font-medium">Upvotes</span>
            </button>
            <div className="flex items-center space-x-1.5 text-ink-gray/60">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-bold">{discussion.viewCount}</span>
              <span className="text-[10px] uppercase font-medium">Views</span>
            </div>
          </div>

          {discussion.hasBestAnswer && (
            <div className="flex items-center gap-1.5 text-constitution-gold font-bold">
              <CheckCircle className="w-4 h-4 fill-constitution-gold/10" />
              <span className="text-[10px] uppercase tracking-wider">Expert Solution Available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
