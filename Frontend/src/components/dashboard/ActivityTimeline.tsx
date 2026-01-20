import React, { useEffect, useState } from 'react';
import './ActivityTimeline.css';
import { FileText, MessageCircle, Brain, Bot, Bookmark, BarChart3 } from 'lucide-react';

// Types
interface ActivityItem {
  id: string;
  type: ActivityType;
  entityType: string;
  entityId: string;
  points: number;
  createdAt: string; // ISO
}

type ActivityType = 
  | 'POST_CREATED'
  | 'REPLY_CREATED'
  | 'BEST_ANSWER'
  | 'AI_QUERY'
  | 'LAW_BOOKMARK';

// Activity type configuration
interface ActivityConfig {
  icon: React.ReactNode;
  text: string;
  color: string;
}

const ActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  // Activity configuration with Lucide icons
  const activityConfig: Record<ActivityType, ActivityConfig> = {
    POST_CREATED: {
      icon: <FileText
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      text: 'You created a post',
      color: 'var(--activity-post, #2563eb)'
    },
    REPLY_CREATED: {
      icon: <MessageCircle
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      text: 'You replied to a discussion',
      color: 'var(--activity-reply, #10b981)'
    },
    BEST_ANSWER: {
      icon: <Brain
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      text: 'Your reply was marked as Best Answer',
      color: 'var(--activity-best-answer, #f59e0b)'
    },
    AI_QUERY: {
      icon: <Bot
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      text: 'You used Legal AI',
      color: 'var(--activity-ai, #8b5cf6)'
    },
    LAW_BOOKMARK: {
      icon: <Bookmark
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      text: 'You bookmarked a law section',
      color: 'var(--activity-bookmark, #ec4899)'
    }
  };

  // Generate mock activities
  const generateMockActivities = (count: number): ActivityItem[] => {
    const types: ActivityType[] = ['POST_CREATED', 'REPLY_CREATED', 'BEST_ANSWER', 'AI_QUERY', 'LAW_BOOKMARK'];
    const mockActivities: ActivityItem[] = [];
    
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const hoursAgo = Math.floor(Math.random() * 48);
      const date = new Date(now);
      date.setHours(date.getHours() - hoursAgo);
      
      // Assign points based on activity type
      let points = 0;
      switch (type) {
        case 'POST_CREATED':
          points = Math.floor(Math.random() * 10) + 5;
          break;
        case 'REPLY_CREATED':
          points = Math.floor(Math.random() * 8) + 3;
          break;
        case 'BEST_ANSWER':
          points = Math.floor(Math.random() * 15) + 15;
          break;
        case 'AI_QUERY':
          points = Math.floor(Math.random() * 5) + 1;
          break;
        case 'LAW_BOOKMARK':
          points = Math.floor(Math.random() * 3) + 1;
          break;
      }
      
      mockActivities.push({
        id: `activity-${i}-${Date.now()}`,
        type,
        entityType: 'DISCUSSION',
        entityId: `entity-${Math.random().toString(36).substr(2, 9)}`,
        points,
        createdAt: date.toISOString()
      });
    }
    
    // Sort by date (newest first)
    return mockActivities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Fetch activities
  const fetchActivities = async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/dashboard/activity-feed?page=${pageNum}`);
      // const result = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate mock data
      const mockData = generateMockActivities(pageNum === 1 ? 8 : 4);
      
      if (isLoadMore) {
        setActivities(prev => [...prev, ...mockData]);
      } else {
        setActivities(mockData);
      }
      
      // Simulate pagination limit
      setHasMore(pageNum < 3);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('Failed to load activity history');
      
      // Set empty state for error
      if (!isLoadMore) {
        setActivities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchActivities(1);
  }, []);

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  };

  // Format timestamp
  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      // Show relative time for recent activities
      if (diffHours < 24) {
        if (diffHours < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
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
      return 'Recently';
    }
  };

  // Format points display
  const formatPoints = (points: number): string => {
    return `+${points} point${points !== 1 ? 's' : ''}`;
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
        {loading && activities.length === 0 ? (
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
        ) : activities.length === 0 ? (
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
              Start contributing by creating posts, replying to discussions, or using Legal AI.
            </p>
          </div>
        ) : (
          <>
            <div className="timeline">
              {activities.map((activity) => {
                const config = activityConfig[activity.type];
                
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
                        <span className="activity-text">{config.text}</span>
                        <span 
                          className="activity-points"
                          style={{ color: config.color }}
                        >
                          {formatPoints(activity.points)}
                        </span>
                      </div>
                      
                      <div className="activity-meta">
                        <span className="activity-timestamp">
                          {formatTimestamp(activity.createdAt)}
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
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Activities'}
                </button>
              </div>
            )}
            
            {loading && activities.length > 0 && (
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