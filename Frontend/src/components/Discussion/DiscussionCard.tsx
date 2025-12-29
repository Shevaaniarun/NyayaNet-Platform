import { MessageSquare, Eye, Heart, Bookmark, Users, Scale, Calendar, Gavel } from 'lucide-react';

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
    profilePhotoUrl?: string | null;  // Made consistent with service
  };
  isFollowing?: boolean;
  isSaved?: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onClick?: () => void;
}

export function DiscussionCard({ discussion, onClick }: DiscussionCardProps) {
  const getDiscussionTypeIcon = (type: string) => {
    switch (type) {
      case 'CASE_ANALYSIS':
        return <Gavel className="w-4 h-4" />;
      case 'LEGAL_QUERY':
        return <MessageSquare className="w-4 h-4" />;
      case 'OPINION_POLL':
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

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
      {/* Main Card */}
      <div
        className="aged-paper rounded-lg p-6 border border-constitution-gold/20 hover:border-constitution-gold/40 transition-all cursor-pointer hover:shadow-lg hover:shadow-constitution-gold/5"
        onClick={onClick}
      >
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full border flex items-center gap-1.5 ${getTypeColor(discussion.discussionType)}`} style={{ fontSize: '0.75rem' }}>
                {getDiscussionTypeIcon(discussion.discussionType)}
                <span>{discussion.discussionType.replace('_', ' ')}</span>
              </span>
              
              {discussion.isResolved && (
                <span className="px-3 py-1 bg-constitution-gold/10 text-constitution-gold border border-constitution-gold/20 rounded-full" style={{ fontSize: '0.75rem' }}>
                  ✓ Resolved
                </span>
              )}
              
              {discussion.hasBestAnswer && (
                <span className="px-3 py-1 bg-gavel-bronze/10 text-gavel-bronze border border-gavel-bronze/20 rounded-full" style={{ fontSize: '0.75rem' }}>
                  ★ Best Answer
                </span>
              )}
            </div>

            <h3 className="font-heading font-bold text-ink-gray mb-2 line-clamp-2">
              {discussion.title}
            </h3>

            <p className="text-ink-gray/70 text-sm line-clamp-2 mb-4">
              {discussion.description}
            </p>
          </div>

          {discussion.isSaved && (
            <div className="ml-4">
              <Bookmark className="w-5 h-5 text-constitution-gold fill-constitution-gold/20" />
            </div>
          )}
        </div>

        {/* Author & Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-constitution-gold/10">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full border border-constitution-gold/30 overflow-hidden bg-parchment-cream">
                {discussion.author.profilePhotoUrl ? (
                  <img
                    src={discussion.author.profilePhotoUrl}
                    alt={discussion.author.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-constitution-gold/10 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-constitution-gold" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-ink-gray text-sm">{discussion.author.fullName}</p>
                <p className="text-ink-gray/60 text-xs">{discussion.author.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-1 text-ink-gray/60">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">{formatDate(discussion.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1 text-ink-gray/60">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">{discussion.lastActivityAt && formatDate(discussion.lastActivityAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4 text-ink-gray/60" />
              <span className="text-sm font-medium text-ink-gray">{discussion.replyCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4 text-ink-gray/60" />
              <span className="text-sm font-medium text-ink-gray">{discussion.viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-ink-gray/60" />
              <span className="text-sm font-medium text-ink-gray">{discussion.upvoteCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-ink-gray/60" />
              <span className="text-sm font-medium text-ink-gray">{discussion.followerCount}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {discussion.tags && discussion.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-constitution-gold/10">
            {discussion.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-constitution-gold/5 border border-constitution-gold/20 rounded-full text-ink-gray/80 hover:bg-constitution-gold/10 transition-colors cursor-pointer"
                style={{ fontSize: '0.75rem' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-constitution-gold rounded-lg opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
    </div>
  );
}