import React, { useEffect, useState } from 'react';
import './ContributionBreakdown.css';
import { FileText, MessageCircle, Reply, Trophy, Bot, Bookmark, BarChart3 } from 'lucide-react';

// Types
interface ContributionBreakdownData {
  posts: number;
  discussions: number;
  replies: number;
  bestAnswers: number;
  aiQueries: number;
  lawBookmarks: number;
}

interface StatCardConfig {
  key: keyof ContributionBreakdownData;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ContributionBreakdown: React.FC = () => {
  // Mock data
  const mockBreakdown: ContributionBreakdownData = {
    posts: 12,
    discussions: 8,
    replies: 96,
    bestAnswers: 7,
    aiQueries: 41,
    lawBookmarks: 19
  };

  // Stat card configuration with Lucide icons
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
      key: 'aiQueries',
      label: 'AI Queries',
      description: 'Legal AI interactions',
      icon: <Bot
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-ai, #ec4899)'
    },
    {
      key: 'lawBookmarks',
      label: 'Law Bookmarks',
      description: 'Saved legal sections',
      icon: <Bookmark
        size={20}
        strokeWidth={2}
        className="text-constitution-gold"
      />,
      color: 'var(--stat-bookmarks, #06b6d4)'
    }
  ];

  const [breakdown, setBreakdown] = useState<ContributionBreakdownData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total contributions
  const totalContributions = breakdown ? Object.values(breakdown).reduce((sum, val) => sum + val, 0) : 0;

  // Fetch breakdown data
  useEffect(() => {
    const fetchBreakdownData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // const response = await fetch('/dashboard/contributions/breakdown');
        // const result = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Use mock data for now
        setBreakdown(mockBreakdown);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch breakdown data:', err);
        setError('Unable to load contribution breakdown');
        
        // Set null for error state
        setBreakdown(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdownData();
  }, []);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="breakdown-container">
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
  const isEmpty = !breakdown || totalContributions === 0;

  return (
    <div className="aged-paper rounded-xl p-6 border border-constitution-gold/20">
      <div className="breakdown-header">
        <div className="breakdown-title-section">
          <h2 className="breakdown-title">Contribution Breakdown</h2>
          <div className="breakdown-subtitle">
            How you contribute to NyayaNet
          </div>
        </div>
        
        {!isEmpty && !error && (
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

      {isEmpty && !error ? (
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
            create content, and use legal resources.
          </p>
          <div className="empty-state-tips">
            <div className="tip">
              <MessageCircle
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
              Start by joining a discussion
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
              <Bot
                size={20}
                strokeWidth={2}
                className="text-constitution-gold"
              />
              Try our Legal AI assistant
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          {statCardsConfig.map((config) => {
            const value = breakdown![config.key];
            const percentage = totalContributions > 0 
              ? Math.round((value / totalContributions) * 100) 
              : 0;
            
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
                        {percentage}% of total
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
      )}
    </div>
  );
};

export default ContributionBreakdown;