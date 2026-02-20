import React, { useState } from 'react';
import { 
  X, Award, Target, Star, TrendingUp, 
  Calendar, Flame, Trophy, Clock, Zap, 
  User, Users, Scale, BookOpen, BarChart3,
  Sparkles, ChevronRight
} from 'lucide-react';
import './ViewDetailedProgress.css';

interface DashboardOverview {
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

interface ViewDetailedProgressProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashboardOverview | null;
}

const ViewDetailedProgress: React.FC<ViewDetailedProgressProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen) return null;

  const score = data?.totalScore || 0;
  const currentStreak = data?.currentStreak || 0;
  const longestStreak = data?.longestStreak || 0;
  const lastActiveDate = data?.lastActiveDate || '';

  const formatDate = (dateString: string): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return "—";
    }
  };

  // Level definitions
  const levels = [
    { name: 'New Contributor', min: 0, max: 50, icon: User, color: '#D2B382' },
    { name: 'Active Member', min: 50, max: 150, icon: Users, color: '#D2B382' },
    { name: 'Legal Contributor', min: 150, max: 400, icon: Scale, color: '#D2B382' },
    { name: 'Legal Expert', min: 400, max: 800, icon: BookOpen, color: '#D2B382' }
  ];

  // Get current level
  const currentLevel = levels.find(level => score >= level.min && score < level.max) || levels[0];
  
  // Calculate level progress
  const getLevelProgress = (level: typeof levels[0]) => {
    if (score < level.min) return 0;
    if (score >= level.max) return 100;
    return ((score - level.min) / (level.max - level.min)) * 100;
  };

  const getLevelScore = (level: typeof levels[0]) => {
    if (score < level.min) return 0;
    if (score >= level.max) return level.max - level.min;
    return score - level.min;
  };

  // Achievement milestones
  const achievements = [
    { name: 'First Contribution', achieved: score > 0, icon: Award, description: 'Made your first contribution' },
    { name: 'Week Streak', achieved: currentStreak >= 7, icon: Flame, description: '7 days consecutive activity' },
    { name: 'Month Streak', achieved: currentStreak >= 30, icon: Zap, description: '30 days consecutive activity' },
    { name: 'Score 100', achieved: score >= 100, icon: Star, description: 'Reached 100 total points' },
    { name: 'Score 250', achieved: score >= 250, icon: Trophy, description: 'Reached 250 total points' },
    { name: 'Score 500', achieved: score >= 500, icon: Award, description: 'Reached 500 total points' },
  ];

  // Activity summary
  const activitySummary = [
    { label: 'Total Contributions', value: Math.floor(score / 5), icon: BarChart3 },
    { label: 'Active Days', value: currentStreak, icon: Calendar },
    { label: 'Completion Rate', value: `${Math.min(Math.floor((score / 800) * 100), 100)}%`, icon: TrendingUp },
    { label: 'Rank', value: score >= 400 ? 'Expert' : score >= 150 ? 'Intermediate' : 'Beginner', icon: Star },
  ];

  return (
    <div className="vdp-modal-overlay">
      <div className="vdp-modal-container">
        {/* Header */}
        <div className="vdp-header">
          <div className="vdp-header-left">
            <div className="vdp-header-icon">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="vdp-header-title">Detailed Progress Analysis</h2>
              <p className="vdp-header-subtitle">Comprehensive view of your contribution journey and achievements</p>
            </div>
          </div>
          <button className="vdp-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Quick Stats Pills */}
        <div className="vdp-quick-stats">
          {activitySummary.slice(0, 2).map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="vdp-quick-stat-pill">
                <Icon size={14} />
                <span>{stat.label}:</span>
                <strong>{stat.value}</strong>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="vdp-tabs">
          {['overview', 'achievements', 'activity'].map((tab) => (
            <button
              key={tab}
              className={`vdp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && <div className="vdp-tab-indicator" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="vdp-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="vdp-overview">
              {/* Level Cards Grid */}
              <div className="vdp-level-grid">
                {levels.map((level) => {
                  const LevelIcon = level.icon;
                  const isActive = score >= level.min;
                  const progress = getLevelProgress(level);
                  const currentScore = getLevelScore(level);
                  const levelMax = level.max - level.min;
                  
                  return (
                    <div 
                      key={level.name}
                      className={`vdp-level-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="vdp-level-card-header">
                        <div className={`vdp-level-icon ${isActive ? 'active' : ''}`}>
                          <LevelIcon size={20} />
                        </div>
                        <span className="vdp-level-range">{level.min}-{level.max} pts</span>
                      </div>
                      
                      <h3 className="vdp-level-name">{level.name}</h3>
                      
                      <div className="vdp-level-score">
                        <span className="vdp-level-current">{currentScore}</span>
                        <span className="vdp-level-max">/{levelMax}</span>
                      </div>
                      
                      <div className="vdp-progress-container">
                        <div className="vdp-progress-header">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="vdp-progress-bar">
                          <div 
                            className="vdp-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      
                      {isActive && score < level.max && (
                        <div className="vdp-next-level">
                          <Target size={12} />
                          <span>{level.max - score} pts to next level</span>
                        </div>
                      )}
                      
                      {score >= level.max && (
                        <div className="vdp-completed">
                          <Award size={12} />
                          <span>Completed</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Next Milestone */}
              <div className="vdp-milestone-card">
                <div className="vdp-milestone-header">
                  <Target size={18} />
                  <span>Next Milestone</span>
                </div>
                <div className="vdp-milestone-content">
                  <div>
                    <div className="vdp-milestone-text">
                      {score < 50 ? 'New Contributor → Active Member' :
                       score < 150 ? 'Active Member → Legal Contributor' :
                       score < 400 ? 'Legal Contributor → Legal Expert' :
                       'Legal Expert → NyayaNet Mentor'}
                    </div>
                    <div className="vdp-milestone-points">
                      {score < 50 ? `${50 - score} points needed` :
                       score < 150 ? `${150 - score} points needed` :
                       score < 400 ? `${400 - score} points needed` :
                       'Maximum level reached'}
                    </div>
                  </div>
                  <div className="vdp-milestone-emoji">🚀</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="vdp-achievements">
              <div className="vdp-achievements-header">
                <Star size={16} />
                <span>Your Achievements ({achievements.filter(a => a.achieved).length}/{achievements.length})</span>
              </div>
              
              <div className="vdp-achievements-grid">
                {achievements.map((achievement, idx) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={idx}
                      className={`vdp-achievement-card ${achievement.achieved ? 'achieved' : 'locked'}`}
                    >
                      <div className="vdp-achievement-icon">
                        <Icon size={20} />
                      </div>
                      <div className="vdp-achievement-info">
                        <h4>{achievement.name}</h4>
                        <p>{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="vdp-activity">
              <h3 className="vdp-activity-title">
                <Clock size={16} />
                Activity Summary
              </h3>
              
              {/* Streak Cards */}
              <div className="vdp-streak-cards">
                <div className="vdp-streak-card current">
                  <div className="vdp-streak-header">
                    <Flame size={20} />
                    <span>Current Streak</span>
                  </div>
                  <div className="vdp-streak-value">{currentStreak} days</div>
                  <div className="vdp-streak-subtitle">Keep the momentum going!</div>
                </div>
                
                <div className="vdp-streak-card longest">
                  <div className="vdp-streak-header">
                    <Trophy size={20} />
                    <span>Longest Streak</span>
                  </div>
                  <div className="vdp-streak-value">{longestStreak} days</div>
                  <div className="vdp-streak-subtitle">Personal best record</div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="vdp-last-activity">
                <div className="vdp-last-activity-header">
                  <Calendar size={20} />
                  <span>Last Activity</span>
                </div>
                <div className="vdp-last-activity-date">{formatDate(lastActiveDate)}</div>
                <div className="vdp-last-activity-days">
                  {lastActiveDate 
                    ? `${Math.floor((Date.now() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                    : "No activity recorded"
                  }
                </div>
              </div>

              {/* Tips Section */}
              <div className="vdp-tips-card">
                <h4>💡 Tips to Improve</h4>
                <ul>
                  <li>Contribute daily to maintain your streak</li>
                  <li>Each contribution gives you 5 points</li>
                  <li>Reach 50 points to become an Active Member</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="vdp-footer">
          <button className="vdp-footer-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="vdp-footer-btn primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailedProgress;