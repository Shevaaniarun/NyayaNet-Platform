import React, { useState, useEffect } from 'react';
import './BadgesGrid.css';
import { 
  ChevronRight, ChevronLeft, 
  Trophy, Calendar, X,
  Scale, Flame, Target, Award,
  Brain, Book, Users, Zap,
  Shield, Crown, Check,
  PartyPopper
} from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
}

interface Props {
  badges?: Badge[];
}

const BadgesGrid: React.FC<Props> = ({ badges = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const [previousEarnedCount, setPreviousEarnedCount] = useState(0);

  // Track badge earning for celebration
  useEffect(() => {
    const earnedBadges = badges.filter(badge => badge.earned);
    const currentEarnedCount = earnedBadges.length;
    
    // Check if a new badge was earned
    if (currentEarnedCount > previousEarnedCount) {
      // Find the most recently earned badge (by earnedAt date)
      const newBadges = earnedBadges.filter(badge => {
        if (!badge.earnedAt) return false;
        const earnedTime = new Date(badge.earnedAt).getTime();
        return earnedTime > Date.now() - 60000; // Earned in the last minute
      });
      
      if (newBadges.length > 0) {
        // Sort by most recent
        const mostRecent = newBadges.sort((a, b) => 
          new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
        )[0];
        
        setNewlyEarnedBadge(mostRecent);
        setShowCelebration(true);
        
        // Auto-hide celebration after 5 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
    
    setPreviousEarnedCount(currentEarnedCount);
  }, [badges, previousEarnedCount]);

  const earnedBadges = badges.filter(badge => badge.earned);
  const mostRecentBadge = earnedBadges.sort((a, b) => 
    new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
  )[0];

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Celebration content
  const renderCelebration = () => {
    if (!showCelebration || !newlyEarnedBadge) return null;

    return (
      <div className="celebration-overlay" onClick={closeCelebration}>
        <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
          <div className="celebration-content">
            <div className="celebration-icon">
              <PartyPopper size={48} />
            </div>
            <h3 className="celebration-title">Congratulations!</h3>
            <p className="celebration-message">
              You've earned the <strong>{newlyEarnedBadge.title}</strong> badge!
            </p>
            <div className="celebration-badge-preview">
              <div className="celebration-badge-icon">
                {newlyEarnedBadge.icon}
              </div>
              <div className="celebration-badge-name">
                {newlyEarnedBadge.title}
              </div>
            </div>
            <button className="celebration-close-btn" onClick={closeCelebration}>
              Awesome!
            </button>
          </div>
        </div>
      </div>
    );
  };

  // If there are very few badges, show some nice placeholders so the grid looks full
  const iconPool = [
    <Award size={28} />, <Flame size={28} />, <Target size={28} />, <Brain size={28} />,
    <Book size={28} />, <Users size={28} />, <Zap size={28} />, <Shield size={28} />,
    <Crown size={28} />
  ];

  const normalizedBadges = React.useMemo(() => {
    const list = [...badges];
    const minCount = 8; // Fixed to always show 8 badges
    const existingTitles = new Set(list.map(b => b.title));
    const placeholderTitles = [
      'Community Helper', 'Researcher', 'Top Commentator', 'Legal Scholar',
      'Contributor Mentor', 'Content Curator', 'Trusted Reviewer', 'Policy Advocate'
    ];

    // helper: map string/icon-less badges to a lucide icon element
    const iconMap: Record<string, JSX.Element> = {
      'trophy': <Trophy size={28} />,
      'calendar': <Calendar size={28} />,
      'scale': <Scale size={28} />,
      'flame': <Flame size={28} />,
      'target': <Target size={28} />,
      'award': <Award size={28} />,
      'brain': <Brain size={28} />,
      'book': <Book size={28} />,
      'users': <Users size={28} />,
      'zap': <Zap size={28} />,
      'shield': <Shield size={28} />,
      'crown': <Crown size={28} />,
      'check': <Check size={28} />
    };

    // normalize existing badges first: ensure each has a React icon element
    for (let idx = 0; idx < list.length; idx++) {
      const b = list[idx] as any;
      // If icon is already a valid React element, leave it
      const provided = b.icon;
      if (provided && React.isValidElement(provided)) continue;

      // If icon is a string, try to map by name
      if (typeof provided === 'string') {
        const key = provided.toLowerCase();
        b.icon = iconMap[key] ?? iconPool[idx % iconPool.length];
        continue;
      }

      // If no icon provided, pick based on title keywords or fall back to pool
      const title = (b.title || '').toLowerCase();
      if (title.includes('community') || title.includes('contributor')) b.icon = <Users size={28} />;
      else if (title.includes('research') || title.includes('scholar')) b.icon = <Brain size={28} />;
      else if (title.includes('comment') || title.includes('commentator')) b.icon = <Zap size={28} />;
      else if (title.includes('legal') || title.includes('policy') || title.includes('law')) b.icon = <Scale size={28} />;
      else if (title.includes('trusted') || title.includes('review')) b.icon = <Shield size={28} />;
      else if (title.includes('top') || title.includes('award')) b.icon = <Award size={28} />;
      else b.icon = iconPool[idx % iconPool.length];
    }

    // Ensure we have EXACTLY 8 badges
    let i = 0;
    while (list.length < minCount) {
      const idx = list.length;
      // pick a placeholder title that doesn't collide with existing titles
      const titleBase = placeholderTitles[i % placeholderTitles.length];
      let title = titleBase;
      let suffix = 1;
      while (existingTitles.has(title)) {
        title = `${titleBase} ${suffix}`;
        suffix++;
      }
      existingTitles.add(title);

      list.push({
        id: `placeholder-${idx}`,
        title,
        description: 'Locked — contribute more to unlock',
        icon: iconPool[i % iconPool.length],
        earned: false
      } as any);
      i++;
    }

    // If we somehow have more than 8, trim to exactly 8
    if (list.length > minCount) {
      return list.slice(0, minCount);
    }

    return list;
  }, [badges]);

  return (
    <div className="badges-container">
      {/* Celebration Popup */}
      {renderCelebration()}

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
              <span className="total-count">/ {normalizedBadges.length} total</span>
            </div>
          </div>

          <div className="badges-grid">
            {normalizedBadges.map((badge) => (
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