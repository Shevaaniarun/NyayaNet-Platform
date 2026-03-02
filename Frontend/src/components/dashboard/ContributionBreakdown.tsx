import React from 'react';
import './ContributionBreakdown.css';
import { FileText, MessageCircle, Reply, Trophy, Users, Heart, BarChart3 } from 'lucide-react';

// Types
interface ContributionBreakdownData {
  posts: number;
  discussions: number;
  replies: number;
  bestAnswers: number;
  followers: number;        // Changed from aiQueries
  postLikesReceived: number; // Changed from lawBookmarks
}

interface Props {
  data?: ContributionBreakdownData | null;
  loading?: boolean;
  error?: string | null;
}

interface StatCardConfig {
  key: keyof ContributionBreakdownData;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ContributionBreakdown: React.FC<Props> = ({ 
  data = null, 
  loading = false, 
  error = null 
}) => {
  // Default data structure to prevent undefined values
  const defaultData: ContributionBreakdownData = {
    posts: 0,
    discussions: 0,
    replies: 0,
    bestAnswers: 0,
    followers: 0,
    postLikesReceived: 0
  };

  // Use provided data or default (keep original safeData for backward compatibility)
  const safeData = data || defaultData;

  // === NEW: normalization to handle different API field names ===
  const normalizedData: ContributionBreakdownData = {
    posts: Number((data as any)?.posts ?? safeData.posts ?? 0),
    discussions: Number((data as any)?.discussions ?? safeData.discussions ?? 0),
    replies: Number((data as any)?.replies ?? safeData.replies ?? 0),
    bestAnswers: Number((data as any)?.bestAnswers ?? (data as any)?.best_answers ?? safeData.bestAnswers ?? 0),
    // Support followers, followers_count, followersCount
    followers: Number(
      (data as any)?.followers ??
      (data as any)?.followers_count ??
      (data as any)?.followersCount ??
      safeData.followers ??
      0
    ),
    // Support various names for post likes
    postLikesReceived: Number(
      (data as any)?.postLikesReceived ??
      (data as any)?.post_likes_received ??
      (data as any)?.postLikes ??
      safeData.postLikesReceived ??
      0
    )
  };
  // === end normalization ===

  // Stat card configuration with Lucide icons - Updated with new metrics
  const statCardsConfig: StatCardConfig[] = [
    {
      key: 'posts',
      label: 'Posts Created',
      description: 'Original content contributions',
      icon: <FileText
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-posts, #3b82f6)'
    },
    {
      key: 'discussions',
      label: 'Discussions Started',
      description: 'Threads you initiated',
      icon: <MessageCircle
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-discussions, #10b981)'
    },
    {
      key: 'replies',
      label: 'Replies Given',
      description: 'Responses to discussions',
      icon: <Reply
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-replies, #8b5cf6)'
    },
    {
      key: 'bestAnswers',
      label: 'Best Answers',
      description: 'High-quality responses',
      icon: <Trophy
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-best-answers, #f59e0b)'
    },
    {
      key: 'followers',
      label: 'Followers',
      description: 'Users who follow you',
      icon: <Users
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-followers, #ec4899)'
    },
    {
      key: 'postLikesReceived',
      label: 'Post Likes',
      description: 'Likes received on your posts',
      icon: <Heart
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-likes, #ef4444)'
    }
  ];

  // Calculate total contributions — include likes received as part of contributions
  const calculateTotalContributions = () => {
    const contributionMetrics = [
      normalizedData.posts,
      normalizedData.discussions,
      normalizedData.replies,
      normalizedData.bestAnswers,
      // Treat post likes as a contribution metric so they count toward totals
      normalizedData.postLikesReceived
    ];
    return contributionMetrics.reduce((sum, val) => sum + (val || 0), 0);
  };

  const totalContributions = calculateTotalContributions();

  // Calculate total engagement (followers only)
  const totalEngagement = (normalizedData.followers || 0);

  // Format large numbers
  const formatNumber = (num: number | undefined): string => {
    const safeNum = num || 0;
    
    if (safeNum >= 1000000) {
      return `${(safeNum / 1000000).toFixed(1)}M`;
    }
    if (safeNum >= 1000) {
      return `${(safeNum / 1000).toFixed(1)}K`;
    }
    return safeNum.toString();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="breakdown-container aged-paper rounded-xl p-6 border border-constitution-gold/20">
        <div className="breakdown-header">
          <h2 className="breakdown-title">Contribution Breakdown</h2>
          <div className="breakdown-subtitle">
            How you contribute to NyayaNet
          </div>
        </div>
        
        <div className="breakdown-loading">
          <div className="stats-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="stat-card loading">
                <div className="stat-icon-skeleton"></div>
                <div className="stat-content-skeleton">
                  <div className="stat-value-skeleton"></div>
                  <div className="stat-label-skeleton"></div>
                  <div className="stat-desc-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render empty state (new user or error)
  const hasNoContributions = totalContributions === 0 && totalEngagement === 0;

  return (
    <div className="aged-paper rounded-xl p-6 border border-constitution-gold/20">
      <div className="breakdown-header">
        <div className="breakdown-title-section">
          <h2 className="breakdown-title">Contribution Breakdown</h2>
          <div className="breakdown-subtitle">
            Your impact on NyayaNet
          </div>
        </div>
        
        {!hasNoContributions && !error && (
          <div className="breakdown-total">
            <span className="total-label">Total Contributions:</span>
            <span className="total-value">{formatNumber(totalContributions)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="breakdown-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {hasNoContributions && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BarChart3
              size={20}
              strokeWidth={2}
              className="text-constitution-gold"
            />
          </div>
          <h3 className="empty-state-title">No contributions yet</h3>
          <p className="empty-state-description">
            Your contribution breakdown will appear here as you participate in discussions, 
            create content, and build your community.
          </p>
          <div className="empty-state-tips">
            <div className="tip">
              <MessageCircle
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
              Join a discussion
            </div>
            <div className="tip">
              <FileText
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
              Create your first post
            </div>
            <div className="tip">
              <Users
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
              Connect with others
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {statCardsConfig.map((config) => {
              // Use normalized values so followers display reliably
              const value = (normalizedData as any)[config.key] || 0;
              
              // Calculate percentage differently for engagement vs contribution metrics
              let percentage = 0;
              if (config.key === 'followers') {
                // followers are engagement; base percentage on engagement total
                percentage = totalEngagement > 0 
                  ? Math.round((value / totalEngagement) * 100) 
                  : 0;
              } else {
                // everything else (including postLikesReceived) is treated as contribution
                percentage = totalContributions > 0 
                  ? Math.round((value / totalContributions) * 100) 
                  : 0;
              }
              
              return (
                <div 
                  key={config.key}
                  className="stat-card"
                  style={{ 
                    '--stat-color': config.color 
                  } as React.CSSProperties}
                >
                  <div className="stat-header">
                    <div 
                      className="stat-icon-wrapper"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      <div className="stat-icon" style={{ color: config.color }}>
                        {config.icon}
                      </div>
                    </div>
                    
                    <div className="stat-value-wrapper">
                      <div className="stat-value">{formatNumber(value)}</div>
                      {percentage > 0 && (
                        <div className="stat-percentage">
                          {percentage}% of total {config.key === 'followers' || config.key === 'postLikesReceived' ? 'engagement' : 'contributions'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="stat-label">{config.label}</h3>
                  <p className="stat-description">{config.description}</p>
                  
                  {/* Visual indicator bar */}
                  {percentage > 0 && (
                    <div className="stat-bar-container">
                      <div 
                        className="stat-bar"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Engagement Summary */}
          {totalEngagement > 0 && (
            <div className="engagement-summary">
              <div className="engagement-summary-content">
                <Users size={16} className="engagement-icon" />
                <span className="engagement-text">
                  You have <strong>{formatNumber(totalEngagement)}</strong> followers
                  {totalContributions > 0 && (
                    <>, and <strong>{formatNumber(normalizedData.postLikesReceived || 0)}</strong> post likes counted as contributions</>
                  )}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContributionBreakdown;