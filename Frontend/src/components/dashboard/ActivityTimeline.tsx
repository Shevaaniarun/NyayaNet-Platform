import React from 'react';
import './ActivityTimeline.css';
import { FileText, MessageCircle, Brain, Bot, Bookmark, BarChart3, Newspaper, HelpCircle, Megaphone, BookOpen } from 'lucide-react';

// Types based on your actual data structure
interface ActivityItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  postType: 'POST' | 'ARTICLE' | 'QUESTION' | 'ANNOUNCEMENT' | string;
  createdAt: string; // ISO
  // Add other fields that might exist
  points?: number;
  entityType?: string;
  entityId?: string;
}

interface Props {
  items?: ActivityItem[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// Activity type configuration
interface ActivityConfig {
  icon: React.ReactNode;
  text: (title: string) => string; // Function to generate text with title
  color: string;
  defaultPoints: number;
}

const ActivityTimeline: React.FC<Props> = ({ 
  items = [], 
  loading = false, 
  error = null,
  hasMore = false,
  onLoadMore
}) => {
  // Activity configuration based on postType
  const activityConfig: Record<string, ActivityConfig> = {
    POST: {
      icon: <FileText size={20} strokeWidth={2} className="text-constitution-gold" />,
      text: (title) => `Posted: "${title}"`,
      color: 'var(--activity-post, #2563eb)',
      defaultPoints: 10
    },
    ARTICLE: {
      icon: <Newspaper size={20} strokeWidth={2} className="text-constitution-gold" />,
      text: (title) => `Published article: "${title}"`,
      color: 'var(--activity-article, #10b981)',
      defaultPoints: 15
    },
    QUESTION: {
      icon: <HelpCircle size={20} strokeWidth={2} className="text-constitution-gold" />,
      text: (title) => `Asked question: "${title}"`,
      color: 'var(--activity-question, #f59e0b)',
      defaultPoints: 5
    },
    ANNOUNCEMENT: {
      icon: <Megaphone size={20} strokeWidth={2} className="text-constitution-gold" />,
      text: (title) => `Made announcement: "${title}"`,
      color: 'var(--activity-announcement, #8b5cf6)',
      defaultPoints: 12
    },
    // Fallback for any other types
    DEFAULT: {
      icon: <BookOpen size={20} strokeWidth={2} className="text-constitution-gold" />,
      text: (title) => `Created: "${title}"`,
      color: 'var(--activity-default, #6b7280)',
      defaultPoints: 8
    }
  };

  // Safe config getter function
  const getActivityConfig = (postType: string): ActivityConfig => {
    const normalizedType = postType?.toUpperCase() || 'DEFAULT';
    return activityConfig[normalizedType] || activityConfig.DEFAULT;
  };

  // Format timestamp
  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      // Show relative time for recent activities
      if (diffHours < 24) {
        if (diffHours < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return diffMins < 1 ? 'Just now' : `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      // Show full date for older activities
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      return 'Recently';
    }
  };

  // Format points display
  const formatPoints = (points: number | undefined, defaultPoints: number): string => {
    const actualPoints = points || defaultPoints;
    return `+${actualPoints} point${actualPoints !== 1 ? 's' : ''}`;
  };

  // Truncate content for display
  const truncateContent = (content: string, maxLength: number = 80): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="aged-paper rounded-xl p-6 border border-constitution-gold/20">
      <div className="timeline-header">
        <h2 className="timeline-title">Recent Activity</h2>
        <div className="timeline-subtitle">
          Your contribution history
        </div>
      </div>

      {error && (
        <div className="timeline-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="timeline-wrapper">
        {loading && items.length === 0 ? (
          <div className="timeline-loading">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="activity-item loading">
                <div className="activity-icon-skeleton"></div>
                <div className="activity-content-skeleton">
                  <div className="activity-text-skeleton"></div>
                  <div className="activity-meta-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BarChart3
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
            </div>
            <h3 className="empty-state-title">No activity yet</h3>
            <p className="empty-state-description">
              Start contributing by creating posts, articles, or asking questions.
            </p>
          </div>
        ) : (
          <>
            <div className="timeline">
              {items.map((activity) => {
                // Safely get config based on postType
                const config = getActivityConfig(activity.postType);
                
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-timeline-line"></div>
                    
                    <div 
                      className="activity-icon"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      {config.icon}
                    </div>
                    
                    <div className="activity-content">
                      <div className="activity-text-row">
                        <span className="activity-text">
                          {config.text(activity.title)}
                        </span>
                        <span 
                          className="activity-points"
                          style={{ color: config.color }}
                        >
                          {formatPoints(activity.points, config.defaultPoints)}
                        </span>
                      </div>
                      
                      {/* Show truncated content */}
                      <div className="activity-content-preview">
                        {truncateContent(activity.content)}
                      </div>
                      
                      <div className="activity-meta">
                        <span className="activity-timestamp">
                          {formatTimestamp(activity.createdAt)}
                        </span>
                        <span className="activity-type-badge" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                          {activity.postType || 'POST'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasMore && !loading && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn"
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Activities'}
                </button>
              </div>
            )}
            
            {loading && items.length > 0 && (
              <div className="loading-more">
                <div className="loading-spinner-small"></div>
                <span>Loading more activities...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;