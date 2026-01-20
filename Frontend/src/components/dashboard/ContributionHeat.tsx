import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Calendar, Trophy } from 'lucide-react';

interface HeatmapDay {
  date: string;
  contributionCount: number;
  points: number;
}

interface TooltipData {
  date: Date;
  contributionCount: number;
  points: number;
  x: number;
  y: number;
}

const ContributionHeatmap: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  
  const [totalSubmissions, setTotalSubmissions] = useState<number>(0);
  const [totalActiveDays, setTotalActiveDays] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  const generateMockData = (year: number): HeatmapDay[] => {
    const days: HeatmapDay[] = [];
    const today = new Date();
    const startDate = new Date(year, 0, 1);
    const endDate = year === currentYear ? today : new Date(year, 11, 31);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const hasActivity = isWeekday ? Math.random() < 0.5 : Math.random() < 0.2;
      
      if (hasActivity) {
        const contributionCount = Math.floor(Math.random() * 4) + 1;
        const points = Math.floor(Math.random() * 25) + 1;
        days.push({ date: dateStr, contributionCount, points });
      } else {
        days.push({ date: dateStr, contributionCount: 0, points: 0 });
      }
    }
    
    return days;
  };

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockData = generateMockData(selectedYear);
        setHeatmapData(mockData);
        
        const activeDays = mockData.filter(d => d.points > 0).length;
        setTotalActiveDays(activeDays);
        
        const submissions = mockData.reduce((sum, day) => sum + day.contributionCount, 0);
        setTotalSubmissions(submissions);
        
        let maxStreakCount = 0;
        let tempStreak = 0;
        
        for (let i = 0; i < mockData.length; i++) {
          if (mockData[i].points > 0) {
            tempStreak++;
            maxStreakCount = Math.max(maxStreakCount, tempStreak);
          } else {
            tempStreak = 0;
          }
        }
        
        let currentStreakCount = 0;
        for (let i = mockData.length - 1; i >= 0; i--) {
          if (mockData[i].points > 0) {
            currentStreakCount++;
          } else {
            break;
          }
        }
        
        setCurrentStreak(currentStreakCount);
        setMaxStreak(maxStreakCount);
      } catch (err) {
        console.error('Failed to fetch heatmap data:', err);
        setHeatmapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [selectedYear, currentYear]);

  const weeksData = useMemo(() => {
    if (heatmapData.length === 0) return { weeks: [], monthLabels: [] };
    
    const firstDate = new Date(heatmapData[0].date);
    const lastDate = new Date(heatmapData[heatmapData.length - 1].date);
    
    const startDate = new Date(firstDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks: (HeatmapDay | null)[][] = [];
    const monthLabels: { month: string; weekIndex: number }[] = [];
    const dataMap = new Map(heatmapData.map(d => [d.date, d]));
    
    let currentDate = new Date(startDate);
    let weekIndex = 0;
    let lastMonth = -1;
    
    while (currentDate <= lastDate) {
      const week: (HeatmapDay | null)[] = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const currentMonth = currentDate.getMonth();
        
        if (currentMonth !== lastMonth && day === 0 && weekIndex > 0) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          monthLabels.push({
            month: monthNames[currentMonth],
            weekIndex: weekIndex
          });
          lastMonth = currentMonth;
        }
        
        if (currentDate >= firstDate && currentDate <= lastDate) {
          week.push(dataMap.get(dateStr) || { date: dateStr, contributionCount: 0, points: 0 });
        } else {
          week.push(null);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      weekIndex++;
    }
    
    return { weeks, monthLabels };
  }, [heatmapData]);

  const getColorClass = (points: number): string => {
    if (points === 0) return 'empty';
    if (points <= 5) return 'level-1';
    if (points <= 10) return 'level-2';
    if (points <= 20) return 'level-3';
    return 'level-4';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSquareHover = (event: React.MouseEvent, dayData: HeatmapDay | null) => {
    if (!dayData || dayData.points === 0) {
      setTooltip(null);
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      date: new Date(dayData.date),
      contributionCount: dayData.contributionCount,
      points: dayData.points,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY - 70
    });
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    setSelectedYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div style={{
      background: '#F1E8D7',
      borderRadius: '16px',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      color: '#5D4037',
      boxShadow: '0 4px 20px rgba(210, 179, 130, 0.1)',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#5D4037',
            margin: '0 0 6px 0',
            letterSpacing: '-0.2px'
          }}>Contribution Heatmap</h2>
          <p style={{
            fontSize: '14px',
            color: '#8B7355',
            margin: 0,
            fontWeight: 400
          }}>Your coding activity throughout {selectedYear}</p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          border: '2px solid #E0D6C2',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button 
            onClick={() => handleYearChange('prev')}
            disabled={selectedYear <= currentYear - 5}
            style={{
              background: 'transparent',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: selectedYear <= currentYear - 5 ? 'not-allowed' : 'pointer',
              color: '#8B7355',
              opacity: selectedYear <= currentYear - 5 ? 0.4 : 1,
              padding: 0,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedYear > currentYear - 5) {
                e.currentTarget.style.background = '#F1E8D7';
                e.currentTarget.style.color = '#5D4037';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#8B7355';
            }}
          >
            <ChevronLeft size={18} />
          </button>
          
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '16px',
              fontWeight: 600,
              color: '#5D4037',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '80px',
              outline: 'none'
            }}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button 
            onClick={() => handleYearChange('next')}
            disabled={selectedYear >= currentYear}
            style={{
              background: 'transparent',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: selectedYear >= currentYear ? 'not-allowed' : 'pointer',
              color: '#8B7355',
              opacity: selectedYear >= currentYear ? 0.4 : 1,
              padding: 0,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (selectedYear < currentYear) {
                e.currentTarget.style.background = '#F1E8D7';
                e.currentTarget.style.color = '#5D4037';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#8B7355';
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          { icon: <Calendar size={20} />, value: totalSubmissions, label: 'Total Submissions', period: `in ${selectedYear}` },
          { icon: <Trophy size={20} />, value: maxStreak, label: 'Max Streak', period: 'days in a row' },
          { icon: <Flame size={20} />, value: currentStreak, label: 'Current Streak', period: 'keep it up!' },
          { icon: <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#D2B382' }}>✓</div>, value: totalActiveDays, label: 'Active Days', period: `${Math.round((totalActiveDays / (heatmapData.length || 1)) * 100)}% of period` }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            border: '2px solid #E0D6C2',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#D2B382';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(210, 179, 130, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = '#E0D6C2';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#F1E8D7',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B7355',
              flexShrink: 0
            }}>
              {stat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#5D4037',
                lineHeight: 1.2,
                marginBottom: '2px'
              }}>{stat.value}</div>
              <div style={{
                fontSize: '13px',
                color: '#8B7355',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
              }}>{stat.label}</div>
              <div style={{
                fontSize: '12px',
                color: '#A99276'
              }}>{stat.period}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'white',
        border: '2px solid #E0D6C2',
        borderRadius: '12px',
        padding: '20px',
        overflowX: 'auto'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E0D6C2',
              borderTopColor: '#D2B382',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ color: '#8B7355', fontSize: '14px' }}>
              Loading contribution data for {selectedYear}...
            </div>
          </div>
        ) : (
          <>
           {/* Month Labels */}
<div
  style={{
    position: 'relative',
    height: '18px',
    marginBottom: '8px'
  }}
>
  {weeksData.monthLabels.map((label, idx) => (
    <div
      key={idx}
      style={{
        position: 'absolute',
        left: `${label.weekIndex * 14}px`,
        fontSize: '11px',
        color: '#8B7355',
        fontWeight: 500,
        whiteSpace: 'nowrap'
      }}
    >
      {label.month}
    </div>
  ))}
</div>

{/* Heatmap Grid */}
<div
  style={{
    display: 'flex',
    gap: '2px'
  }}
>
  {weeksData.weeks.map((week, weekIdx) => (
    <div
      key={weekIdx}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }}
    >
      {week.map((dayData, dayIdx) => {
        const colorMap = {
          empty: { bg: '#F5F0E6', border: '#F5F0E6' },
          'level-1': { bg: '#FFEDCC', border: '#FFE4B5' },
          'level-2': { bg: '#FFDBA3', border: '#FFD089' },
          'level-3': { bg: '#FFC97A', border: '#FFBF5F' },
          'level-4': { bg: '#D2B382', border: '#C4A46D' }
        };

        const colorClass = dayData
          ? getColorClass(dayData.points)
          : 'empty';

        const colors =
          colorMap[colorClass as keyof typeof colorMap];

        return (
          <div
            key={`${weekIdx}-${dayIdx}`}
            onMouseEnter={(e) =>
              handleSquareHover(e, dayData)
            }
            onMouseLeave={() => setTooltip(null)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              cursor: dayData ? 'pointer' : 'default',
              background: dayData ? colors.bg : 'transparent',
              border: dayData
                ? `1px solid ${colors.border}`
                : 'none'
            }}
          />
        );
      })}
    </div>
  ))}
</div>

            {/* Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: '20px',
              gap: '8px',
              fontSize: '11px',
              color: '#8B7355'
            }}>
              <span>Less</span>
              {[
                { bg: '#F5F0E6', border: '#F5F0E6' },
                { bg: '#FFEDCC', border: '#FFE4B5' },
                { bg: '#FFDBA3', border: '#FFD089' },
                { bg: '#FFC97A', border: '#FFBF5F' },
                { bg: '#D2B382', border: '#C4A46D' }
              ].map((color, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    background: color.bg,
                    border: `1px solid ${color.border}`
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: `${tooltip.x}px`,
          top: `${tooltip.y}px`,
          background: 'rgba(93, 64, 55, 0.95)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            fontWeight: 600,
            marginBottom: '4px',
            color: '#FFDBA3'
          }}>{formatDate(tooltip.date)}</div>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <span style={{ color: 'white', fontWeight: 500 }}>
              {tooltip.contributionCount} submission{tooltip.contributionCount !== 1 ? 's' : ''}
            </span>
            <span style={{ color: '#FFC97A' }}>
              • {tooltip.points} points
            </span>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(93, 64, 55, 0.95)'
          }} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ContributionHeatmap;