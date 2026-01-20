import React, { useState } from 'react';
import './BadgesGrid.css';
import { 
  ChevronRight, ChevronLeft, 
  Trophy, Calendar, X,
  Scale, Flame, Target, Award,
  Brain, Book, Users, Zap,
  Shield, Crown, Check
} from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
}

const BadgesGrid: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const mockBadges: Badge[] = [
    {
      id: 'first-answer',
      title: 'First Answer',
      description: 'Posted your first reply to a legal discussion',
      icon: <Scale size={20} />,
      earned: true,
      earnedAt: '2026-01-10'
    },
    {
      id: '7-day-streak',
      title: '7-Day Streak',
      description: 'Contributed for 7 consecutive days',
      icon: <Flame size={20} />,
      earned: true,
      earnedAt: '2026-01-15'
    },
    {
      id: '100-contributions',
      title: '100 Contributions',
      description: 'Reached 100 total contributions to the community',
      icon: <Target size={20} />,
      earned: true,
      earnedAt: '2026-01-20'
    },
    {
      id: '10-best-answers',
      title: '10 Best Answers',
      description: 'Provided 10 answers marked as best by community',
      icon: <Award size={20} />,
      earned: false
    },
    {
      id: 'ai-explorer',
      title: 'AI Explorer',
      description: 'Used Legal AI assistant for the first time',
      icon: <Brain size={20} />,
      earned: true,
      earnedAt: '2026-01-05'
    },
    {
      id: 'legal-scholar',
      title: 'Legal Scholar',
      description: 'Bookmarked 50 different law sections',
      icon: <Book size={20} />,
      earned: false
    },
    {
      id: 'discussion-leader',
      title: 'Discussion Leader',
      description: 'Started 20 different discussion threads',
      icon: <Users size={20} />,
      earned: false
    },
    {
      id: 'rapid-responder',
      title: 'Rapid Responder',
      description: 'Posted 50 replies within first 24 hours',
      icon: <Zap size={20} />,
      earned: true,
      earnedAt: '2026-01-18'
    },
    {
      id: 'quality-contributor',
      title: 'Quality Contributor',
      description: 'Maintained 80%+ upvote ratio on contributions',
      icon: <Shield size={20} />,
      earned: false
    },
    {
      id: 'year-commitment',
      title: 'Year Commitment',
      description: 'Active contributor for one full year',
      icon: <Crown size={20} />,
      earned: false
    }
  ];

  const earnedBadges = mockBadges.filter(badge => badge.earned);
  const mostRecentBadge = earnedBadges.sort((a, b) => 
    new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
  )[0];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="badges-container">
      {/* Compact View (Default) */}
      <div className="compact-view">
        <div className="badges-header">
          <div className="header-left">
            <Trophy size={18} className="badge-icon" />
            <span className="badges-label">Badges</span>
            <span className="badges-count">{earnedBadges.length}</span>
          </div>
          <button 
            className="expand-btn"
            onClick={toggleExpanded}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {mostRecentBadge && (
          <div className="most-recent-badge">
            <div className="recent-badge-icon">
              {mostRecentBadge.icon}
            </div>
            <div className="recent-badge-info">
              <div className="recent-badge-label">Most Recent Badge</div>
              <div className="recent-badge-title">{mostRecentBadge.title}</div>
              <div className="recent-badge-date">
                {mostRecentBadge.earnedAt ? 
                  new Date(mostRecentBadge.earnedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : ''
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded View - Conditionally Rendered */}
      {isExpanded && (
        <div className="expanded-view">
          <div className="expanded-header">
            <h3>All Badges</h3>
            <div className="badges-summary">
              <span className="earned-count">{earnedBadges.length} earned</span>
              <span className="total-count">/ {mockBadges.length} total</span>
            </div>
          </div>

          <div className="badges-grid">
            {mockBadges.map((badge) => (
              <div 
                key={badge.id}
                className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
                onClick={() => badge.earned && handleBadgeClick(badge)}
              >
                <div className="badge-icon-wrapper">
                  <div className="badge-icon-bg">
                    {badge.icon}
                  </div>
                  {badge.earned && (
                    <div className="badge-earned-indicator">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                <div className="badge-title">{badge.title}</div>
                <div className="badge-status">
                  {badge.earned ? 'Earned' : 'Locked'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={closeModal}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              <X size={20} />
            </button>
            
            <div className="modal-badge-icon">
              <div className="modal-icon-wrapper">
                {selectedBadge.icon}
              </div>
            </div>
            
            <h3 className="modal-badge-title">{selectedBadge.title}</h3>
            <p className="modal-badge-description">{selectedBadge.description}</p>
            
            <div className="modal-badge-meta">
              <div className="meta-item">
                <span className="meta-label">Earned on:</span>
                <span className="meta-value">
                  {selectedBadge.earnedAt ? 
                    new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Not earned yet'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesGrid;