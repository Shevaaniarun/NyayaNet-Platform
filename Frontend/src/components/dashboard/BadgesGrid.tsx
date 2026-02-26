import React, { useState, useEffect } from 'react';
import './BadgesGrid.css';
import { 
  ChevronRight, ChevronLeft, 
  Trophy, Calendar, X,
  Scale, Flame, Target, Award,
  Brain, Book, Users, Zap,
  Shield, Crown, Check,
  PartyPopper, Star, Sparkles,
  Medal, Gem, Lock, Clock,
  TrendingUp, Heart, MessageCircle,
  FileText, HelpCircle, Reply,
  Gift, Rocket, ThumbsUp, MessageSquare,
  GitPullRequest, StarHalf, Disc, Sun,
  Coffee, Smile, Award as AwardIcon
} from 'lucide-react';

// Import the celebration component
import BadgeCelebration from './BadgeCelebration';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
  category?: 'contribution' | 'streak' | 'quality' | 'engagement' | 'special';
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: number;
  progressTotal?: number;
  code?: string;
}

interface Props {
  badges?: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

const BadgesGrid: React.FC<Props> = ({ badges = [], onBadgeClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const [previousEarnedCount, setPreviousEarnedCount] = useState(0);
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Rarity colors and effects
  const rarityConfig = {
    common: {
      bg: 'linear-gradient(135deg, #6b7280, #4b5563)',
      shadow: '0 8px 20px rgba(107, 114, 128, 0.3)',
      border: '#9ca3af',
      text: 'Common'
    },
    rare: {
      bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      shadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
      border: '#60a5fa',
      text: 'Rare'
    },
    epic: {
      bg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      shadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
      border: '#a78bfa',
      text: 'Epic'
    },
    legendary: {
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      shadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
      border: '#fbbf24',
      text: 'Legendary'
    }
  };

  // Category icons
  const categoryIcons = {
    contribution: <FileText size={14} />,
    streak: <Flame size={14} />,
    quality: <Star size={14} />,
    engagement: <Heart size={14} />,
    special: <Sparkles size={14} />
  };

  // Track badge earning for celebration
  useEffect(() => {
    const earnedBadges = badges.filter(badge => badge.earned);
    const currentEarnedCount = earnedBadges.length;
    
    if (currentEarnedCount > previousEarnedCount) {
      const newBadges = earnedBadges.filter(badge => {
        if (!badge.earnedAt) return false;
        const earnedTime = new Date(badge.earnedAt).getTime();
        return earnedTime > Date.now() - 60000;
      });
      
      if (newBadges.length > 0) {
        const mostRecent = newBadges.sort((a, b) => 
          new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
        )[0];
        
        setNewlyEarnedBadge(mostRecent);
        setShowCelebration(true);
        
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

  // Filter badges by category
  const filteredBadges = filterCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === filterCategory);

  const handleBadgeClick = (badge: Badge) => {
    if (!badge.earned) return;
    setSelectedBadge(badge);
    if (onBadgeClick) onBadgeClick(badge);
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

  // Get icon based on badge code/title
  const getBadgeIcon = (badge: any) => {
    if (badge.icon && React.isValidElement(badge.icon)) return badge.icon;
    
    const title = badge.title?.toLowerCase() || '';
    const code = badge.code?.toLowerCase() || '';
    
    // Contribution Badges
    if (code.includes('first_contribution')) return <Gift size={32} />;
    if (code.includes('contributor_10')) return <Star size={32} />;
    if (code.includes('contributor_50')) return <AwardIcon size={32} />;
    if (code.includes('contributor_100')) return <Medal size={32} />;
    if (code.includes('contributor_500')) return <Crown size={32} />;
    
    // Streak Badges
    if (code.includes('streak_7')) return <Flame size={32} />;
    if (code.includes('streak_30')) return <Zap size={32} />;
    if (code.includes('streak_100')) return <Rocket size={32} />;
    
    // Quality Badges
    if (code.includes('best_answer_5')) return <ThumbsUp size={32} />;
    if (code.includes('best_answer_10')) return <Trophy size={32} />;
    if (code.includes('best_answer_25')) return <Crown size={32} />;
    
    // Engagement Badges
    if (code.includes('followers_10')) return <Users size={32} />;
    if (code.includes('followers_50')) return <Users size={32} />;
    if (code.includes('followers_100')) return <Users size={32} />;
    if (code.includes('followers_500')) return <Users size={32} />;
    
    // Popularity Badges
    if (code.includes('post_likes_10')) return <Heart size={32} />;
    if (code.includes('post_likes_50')) return <Heart size={32} />;
    if (code.includes('post_likes_100')) return <Heart size={32} />;
    if (code.includes('post_likes_500')) return <Heart size={32} />;
    if (code.includes('post_likes_1000')) return <Heart size={32} />;
    
    // Special Badges
    if (code.includes('ai_pioneer')) return <Brain size={32} />;
    if (code.includes('bookworm')) return <Book size={32} />;
    
    // Fallback to category-based icons
    if (badge.category === 'streak') return <Flame size={32} />;
    if (badge.category === 'quality') return <Trophy size={32} />;
    if (badge.category === 'engagement') return <Heart size={32} />;
    if (badge.category === 'special') return <Sparkles size={32} />;
    
    return <Medal size={32} />;
  };

  // Category filter tabs
  const renderCategoryTabs = () => {
    const categories = [
      { id: 'all', label: 'All', icon: <Star size={14} /> },
      { id: 'contribution', label: 'Contributions', icon: <FileText size={14} /> },
      { id: 'streak', label: 'Streaks', icon: <Flame size={14} /> },
      { id: 'quality', label: 'Quality', icon: <Trophy size={14} /> },
      { id: 'engagement', label: 'Engagement', icon: <Heart size={14} /> },
      { id: 'special', label: 'Special', icon: <Sparkles size={14} /> }
    ];

    return (
      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${filterCategory === cat.id ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat.id)}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="badges-container">
      {/* Celebration Popup - Using the new BadgeCelebration component */}
      {showCelebration && newlyEarnedBadge && (
        <BadgeCelebration 
          badge={{
            title: newlyEarnedBadge.title,
            description: newlyEarnedBadge.description,
            icon: getBadgeIcon(newlyEarnedBadge),
            rarity: newlyEarnedBadge.rarity || 'common'
          }}
          onClose={closeCelebration}
        />
      )}

      {/* Compact View */}
      <div className="compact-view">
        <div className="badges-header">
          <div className="header-left">
            <Trophy size={18} className="badge-icon" />
            <span className="badges-label">Achievement Badges</span>
            <span className="badges-count">{earnedBadges.length}</span>
          </div>
          <button 
            className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
            onClick={toggleExpanded}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {mostRecentBadge && (
          <div className="most-recent-badge" onClick={() => handleBadgeClick(mostRecentBadge)}>
            <div className="recent-badge-icon">
              {getBadgeIcon(mostRecentBadge)}
            </div>
            <div className="recent-badge-info">
              <div className="recent-badge-label">
                <Clock size={12} />
                <span>Most Recent</span>
              </div>
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
            <div className="recent-badge-arrow">
              <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="expanded-view">
          <div className="expanded-header">
            <div className="header-content">
              <h3>All Badges</h3>
              <div className="badges-summary">
                <span className="earned-count">{earnedBadges.length}</span>
                <span className="total-count">/{badges.length} earned</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
              />
            </div>
          </div>

          {renderCategoryTabs()}

          <div className="badges-grid">
            {filteredBadges.map((badge) => {
              const isEarned = badge.earned;
              const rarity = badge.rarity || 'common';
              const config = rarityConfig[rarity];
              
              return (
                <div 
                  key={badge.id}
                  className={`badge-item ${isEarned ? 'earned' : 'locked'} ${rarity} ${hoveredBadge === badge.id ? 'hovered' : ''}`}
                  onClick={() => handleBadgeClick(badge)}
                  onMouseEnter={() => setHoveredBadge(badge.id)}
                  onMouseLeave={() => setHoveredBadge(null)}
                >
                  <div className="badge-inner">
                    <div className="badge-icon-wrapper">
                      <div 
                        className="badge-icon-bg"
                        style={isEarned ? { background: config.bg } : undefined}
                      >
                        {getBadgeIcon(badge)}
                      </div>
                      {isEarned && (
                        <div className="badge-earned-indicator">
                          <Check size={12} />
                        </div>
                      )}
                      {!isEarned && (
                        <div className="badge-lock">
                          <Lock size={16} />
                        </div>
                      )}
                    </div>
                    
                    <div className="badge-content">
                      <h4 className="badge-title">{badge.title}</h4>
                      <p className="badge-description">{badge.description}</p>
                      
                      {badge.progress !== undefined && badge.progressTotal && (
                        <div className="badge-progress">
                          <div className="progress-bar-small">
                            <div 
                              className="progress-fill-small"
                              style={{ width: `${(badge.progress / badge.progressTotal) * 100}%` }}
                            />
                          </div>
                          <span className="progress-text">
                            {badge.progress}/{badge.progressTotal}
                          </span>
                        </div>
                      )}
                      
                      <div className="badge-footer">
                        <span className={`badge-rarity ${rarity}`}>
                          {rarityConfig[rarity].text}
                        </span>
                        <span className="badge-status">
                          {isEarned ? 'Earned' : 'Locked'}
                        </span>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    {hoveredBadge === badge.id && isEarned && (
                      <div className="badge-hover-effect">
                        <Sparkles size={20} />
                        <span>Click to view details</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
            
            <div className="modal-header">
              <div 
                className="modal-badge-icon"
                style={{ 
                  background: selectedBadge.rarity 
                    ? rarityConfig[selectedBadge.rarity].bg 
                    : 'linear-gradient(135deg, #D2B382, #c4a571)'
                }}
              >
                {getBadgeIcon(selectedBadge)}
              </div>
              <div className="modal-header-info">
                {selectedBadge.rarity && (
                  <span className={`modal-rarity ${selectedBadge.rarity}`}>
                    {rarityConfig[selectedBadge.rarity].text}
                  </span>
                )}
                <h3 className="modal-badge-title">{selectedBadge.title}</h3>
              </div>
            </div>
            
            <p className="modal-badge-description">{selectedBadge.description}</p>
            
            <div className="modal-badge-meta">
              {selectedBadge.category && (
                <div className="meta-item">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value category">
                    {categoryIcons[selectedBadge.category]}
                    <span>{selectedBadge.category.charAt(0).toUpperCase() + selectedBadge.category.slice(1)}</span>
                  </span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <span className={`meta-value status ${selectedBadge.earned ? 'earned' : 'locked'}`}>
                  {selectedBadge.earned ? 'Earned' : 'Not yet earned'}
                </span>
              </div>
              
              {selectedBadge.earned && selectedBadge.earnedAt && (
                <div className="meta-item">
                  <span className="meta-label">Earned on:</span>
                  <span className="meta-value date">
                    <Calendar size={14} />
                    {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              {selectedBadge.progress !== undefined && selectedBadge.progressTotal && (
                <div className="meta-item progress-item">
                  <span className="meta-label">Progress:</span>
                  <div className="meta-progress">
                    <div className="progress-bar-modal">
                      <div 
                        className="progress-fill-modal"
                        style={{ width: `${(selectedBadge.progress / selectedBadge.progressTotal) * 100}%` }}
                      />
                    </div>
                    <span className="progress-text-modal">
                      {selectedBadge.progress}/{selectedBadge.progressTotal}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!selectedBadge.earned && (
              <div className="modal-cta">
                <button className="cta-button">
                  Learn How to Earn
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesGrid;