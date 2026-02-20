import React, { useRef, useState } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';
import ViewDetailedProgress from './ViewDetailedProgress';

interface DashboardOverview {
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

interface Props {
  data?: DashboardOverview | null;
}

// Count up animation hook
const useCountUp = (end: number, duration: number = 600) => {
  const [count, setCount] = React.useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  React.useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      const currentCount = Math.floor(easedProgress * end);
      setCount(currentCount);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    setCount(0);
    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [end, duration]);

  return count;
};

// LeetCode-style Multi-Level Progress Ring with hover focus
const LevelProgressRing: React.FC<{
  score: number;
  currentLevel: string;
}> = ({ score, currentLevel }) => {
  const [hoveredLevel, setHoveredLevel] = React.useState<string | null>(null);
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Level definitions with constitution-gold theme
  const levels = [
    { 
      name: 'New Contributor', 
      min: 0, 
      max: 50, 
      color: 'rgba(210, 179, 130, 0.8)', // Light constitution-gold
      nextLevel: 'Active Member',
      bgColor: '#F1E8D7' // Card background color
    },
    { 
      name: 'Active Member', 
      min: 50, 
      max: 150, 
      color: 'rgba(210, 179, 130, 0.8)', // Light constitution-gold
      nextLevel: 'Legal Contributor',
      bgColor: '#F1E8D7' // Card background color
    },
    { 
      name: 'Legal Contributor', 
      min: 150, 
      max: 400, 
      color: 'rgba(210, 179, 130, 0.8)', // Light constitution-gold
      nextLevel: 'Legal Expert',
      bgColor: '#F1E8D7' // Card background color
    },
    { 
      name: 'Legal Expert', 
      min: 400, 
      max: 800, 
      color: 'rgba(210, 179, 130, 0.8)', // Light constitution-gold
      nextLevel: 'NyayaNet Mentor',
      bgColor: '#F1E8D7' // Card background color
    }
  ];

  // Find current level
  const activeLevel = levels.find(level => score >= level.min && score < level.max) || levels[0];
  const nextLevel = levels.find(level => level.min === activeLevel.max);
  
  // Calculate score in each level
  const getLevelScore = (levelIndex: number) => {
    const level = levels[levelIndex];
    
    if (score < level.min) {
      return 0; // Not reached this level yet
    } else if (score >= level.max) {
      return level.max - level.min; // Completed this level
    } else {
      return score - level.min; // Currently in this level
    }
  };

  // Calculate total possible score for each level
  const getLevelMaxScore = (levelIndex: number) => {
    const level = levels[levelIndex];
    return level.max - level.min;
  };

  // Calculate progress percentage for each level
  const getLevelProgress = (levelIndex: number) => {
    const level = levels[levelIndex];
    
    if (score < level.min) return 0;
    if (score >= level.max) return 100;
    
    return ((score - level.min) / (level.max - level.min)) * 100;
  };

  // Calculate visible progress percentages based on hover
  const calculateVisibleProgress = () => {
    const progressData = levels.map((_, index) => getLevelProgress(index));
    
    if (hoveredLevel) {
      // Find the hovered level index
      const hoveredIndex = levels.findIndex(level => level.name === hoveredLevel);
      if (hoveredIndex !== -1) {
        // Only show progress for the hovered level
        return progressData.map((progress, index) => 
          index === hoveredIndex ? progress : 0
        );
      }
    }
    
    // Normal view: show cumulative progress
    let cumulative = 0;
    return progressData.map(p => {
      const adjusted = Math.min(p, 100 - cumulative);
      cumulative += adjusted;
      return adjusted;
    });
  };

  const progressPercentages = calculateVisibleProgress();
  
  // Calculate stroke dash values for each segment
  const calculateSegment = (percentage: number, index: number) => {
    const offset = progressPercentages.slice(0, index).reduce((a, b) => a + b, 0);
    const segmentCircumference = circumference * (percentage / 100);
    const strokeDashoffset = circumference - segmentCircumference;
    
    return {
      strokeDasharray: `${segmentCircumference} ${circumference - segmentCircumference}`,
      strokeDashoffset: -offset * (circumference / 100),
    };
  };

  // Get display info based on hover state
  const getDisplayInfo = () => {
    if (hoveredLevel) {
      const level = levels.find(l => l.name === hoveredLevel);
      if (level) {
        const levelIndex = levels.indexOf(level);
        const levelScore = getLevelScore(levelIndex);
        const levelMaxScore = getLevelMaxScore(levelIndex);
        const isLocked = score < level.min;
        const isCompleted = score >= level.max;
        
        let status = '';
        if (isLocked) status = ' (Locked)';
        else if (isCompleted) status = ' (Completed)';
        
        return { 
          title: `${level.name}${status}`, 
          value: `${levelScore}/${levelMaxScore}`,
          subtitle: `Score in this level: ${levelScore} pts`
        };
      }
    }
    
    // Default: show current level progress
    const levelScore = Math.min(
      Math.max(score - activeLevel.min, 0), 
      activeLevel.max - activeLevel.min
    );
    const totalInCurrent = activeLevel.max - activeLevel.min;
    
    return { 
      title: activeLevel.name, 
      value: `${levelScore}/${totalInCurrent}`,
      subtitle: nextLevel ? `Next: ${nextLevel.name}` : 'Max Level Achieved'
    };
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background track - very light */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(210, 179, 130, 0.1)" // Very light constitution-gold/10
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress segments */}
          {levels.map((level, index) => {
            const segment = calculateSegment(progressPercentages[index], index);
            const isHovered = hoveredLevel === level.name;
            
            return (
              <circle
                key={level.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={level.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
                opacity={isHovered ? 1 : hoveredLevel ? 0.3 : 0.9}
                className="transition-all duration-300"
                onMouseEnter={() => setHoveredLevel(level.name)}
                onMouseLeave={() => setHoveredLevel(null)}
              />
            );
          })}
        </svg>
        
        {/* Center content */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-300"
          onMouseEnter={() => setHoveredLevel(null)}
          onMouseLeave={() => setHoveredLevel(null)}
        >
          <div className="text-3xl font-bold text-gray-900">
            {hoveredLevel ? 
              levels.find(l => l.name === hoveredLevel) ? 
                getLevelScore(levels.findIndex(l => l.name === hoveredLevel)) : 
                score
              : score
            }
          </div>
          <div className="text-xs text-gray-500">
            {hoveredLevel ? 'Level Score' : 'Total Score'}
          </div>
        </div>
        
        {/* Level indicator dots - only show on hovered segment */}
        {levels.map((level, index) => {
          const levelProgress = getLevelProgress(index);
          const angle = (levelProgress / 100) * 360;
          const radian = (angle * Math.PI) / 180;
          const dotX = size / 2 + radius * Math.cos(radian - Math.PI / 2);
          const dotY = size / 2 + radius * Math.sin(radian - Math.PI / 2);
          
          const isActive = score >= level.min;
          const shouldShowDot = levelProgress > 0 && levelProgress < 100;
          
          if (!shouldShowDot) return null;
          
          return (
            <div
              key={`dot-${level.name}`}
              className={`absolute w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${
                hoveredLevel === level.name ? 'shadow-lg scale-125' : 'shadow-sm'
              }`}
              style={{
                left: dotX - 6,
                top: dotY - 6,
                backgroundColor: level.color,
                opacity: hoveredLevel ? (hoveredLevel === level.name ? 1 : 0.5) : 1
              }}
              onMouseEnter={() => setHoveredLevel(level.name)}
              onMouseLeave={() => setHoveredLevel(null)}
            />
          );
        })}
      </div>
      
      {/* Info display */}
      <div className="mt-6 text-center transition-all duration-300">
        <div className="text-lg font-semibold text-gray-900 mb-1">
          {displayInfo.title}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {displayInfo.value}
        </div>
        {displayInfo.subtitle && (
          <div className="text-xs text-gray-500">
            {displayInfo.subtitle}
          </div>
        )}
      </div>
      
      {/* Level legend with #F1E8D7 background */}
      <div className="grid grid-cols-2 gap-3 mt-6 w-full">
        {levels.map((level) => {
          const levelIndex = levels.indexOf(level);
          const levelScore = getLevelScore(levelIndex);
          const levelMaxScore = getLevelMaxScore(levelIndex);
          const isActive = score >= level.min;
          const isCurrent = activeLevel.name === level.name;
          const isHovered = hoveredLevel === level.name;
          const progress = getLevelProgress(levelIndex);
          
          return (
            <div 
              key={level.name}
              className="p-3 rounded-lg border transition-all duration-300 hover:shadow-sm"
              style={{
                backgroundColor: level.bgColor, // #F1E8D7
                borderColor: isHovered ? 'rgba(210, 179, 130, 0.3)' : 
                            isCurrent ? 'rgba(210, 179, 130, 0.2)' : 'rgba(210, 179, 130, 0.15)'
              }}
              onMouseEnter={() => setHoveredLevel(level.name)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: level.color,
                      opacity: isHovered ? 1 : isActive ? 1 : 0.5
                    }}
                  />
                  <div className={`text-xs font-medium transition-all duration-300 ${
                    isHovered ? 'text-gray-900' :
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {level.name}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-700">
                  {levelScore}/{levelMaxScore}
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {levelMaxScore} pts {score < level.min && '(Locked)'}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div 
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: level.color,
                    opacity: isHovered ? 1 : 0.8
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HeaderStats: React.FC<Props> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);
  const animatedTotalScore = useCountUp(data?.totalScore || 0);
  const animatedCurrentStreak = useCountUp(data?.currentStreak || 0);
  const animatedLongestStreak = useCountUp(data?.longestStreak || 0);

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

  const displayData = data || {
    totalScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: ""
  };

  // Safe modal score/value fallbacks to avoid optional chaining issues in expressions
  const modalScore = data?.totalScore ?? 0;
  const modalLevel = modalScore >= 150 ? 'Legal Contributor' : modalScore >= 50 ? 'Active Member' : 'New Contributor';

  return (
    <div className="w-full">
      {/* Overview full-width */}
      <div 
        className="rounded-lg border p-5 hover:shadow-sm transition-shadow w-full"
        style={{
          backgroundColor: '#F1E8D7',
          border: '1px solid rgba(210, 179, 130, 0.15)'
        }}
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Track your contribution progress</p>
        </div>

        {/* LeetCode-style Multi-Level Progress Ring */}
        <LevelProgressRing 
          score={displayData.totalScore}
          currentLevel={displayData.totalScore >= 150 ? "Legal Contributor" : 
                       displayData.totalScore >= 50 ? "Active Member" : "New Contributor"}
        />

        {/* View Details Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            className="w-full px-4 py-2.5 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: 'rgba(210, 179, 130, 0.8)' }}
            onClick={() => setShowDetails(true)}
          >
            View Detailed Progress
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Detail Modal - Using the new component */}
<ViewDetailedProgress 
  isOpen={showDetails}
  onClose={() => setShowDetails(false)}
  data={data ? data : null}  // This converts undefined to null
/>

      {/* Row of three compact stat cards under the Overview */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Streak Card */}
        <div 
          className="rounded-lg border p-5 hover:shadow-sm transition-shadow"
          style={{
            backgroundColor: '#F1E8D7',
            border: '1px solid rgba(210, 179, 130, 0.15)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Current Streak</h3>
            <div className="flex items-center gap-1">
              <Flame size={16} className="text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">
                {animatedCurrentStreak}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            {displayData.currentStreak > 0 ? "🔥 Keep the momentum going!" : "Start building your streak"}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{displayData.currentStreak}/30 days</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((displayData.currentStreak / 30) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Longest Streak Card */}
        <div 
          className="rounded-lg border p-5 hover:shadow-sm transition-shadow"
          style={{
            backgroundColor: '#F1E8D7',
            border: '1px solid rgba(210, 179, 130, 0.15)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Longest Streak</h3>
            <div className="flex items-center gap-1">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-2xl font-bold text-gray-900">
                {animatedLongestStreak}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Your personal best record
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Current vs Best</div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${Math.min(
                        (displayData.currentStreak / (displayData.longestStreak || 1)) * 100, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700">
                {Math.round((displayData.currentStreak / (displayData.longestStreak || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Last Activity Card */}
        <div 
          className="rounded-lg border p-5 hover:shadow-sm transition-shadow"
          style={{
            backgroundColor: '#F1E8D7',
            border: '1px solid rgba(210, 179, 130, 0.15)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Last Activity</h3>
            <Calendar size={16} className="text-gray-500" />
          </div>
          <div className="text-base font-bold text-gray-900 mb-2">
            {formatDate(displayData.lastActiveDate)}
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Latest contribution date
          </div>
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Days since last activity:{" "}
              <span className="font-medium text-gray-900">
                {displayData.lastActiveDate 
                  ? Math.floor((Date.now() - new Date(displayData.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24))
                  : "—"
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderStats;