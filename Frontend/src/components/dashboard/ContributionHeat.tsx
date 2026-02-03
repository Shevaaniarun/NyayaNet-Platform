import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import './ContributionHeatmap.css';

interface HeatmapDay {
  date: string;
  contributionCount?: number;
  count?: number;
  points: number;
}

interface Props {
  data?: HeatmapDay[];
  selectedYear?: number;
  onYearChange?: (year: number) => void;
  totalSubmissions?: number;
  totalActiveDays?: number;
  maxStreak?: number;
  currentStreak?: number;
  loading?: boolean;
}

interface WeekData {
  days: (HeatmapDay | null)[];
  offset: number;
}

interface HeatmapData {
  weeks: WeekData[];
  monthLabels: { month: string; weekIndex: number; x: number }[];
  svgWidth: number;
}

const safeNumber = (value: number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || isNaN(value as any)) return fallback;
  return value as number;
};

const ContributionHeatmap: React.FC<Props> = ({
  data = [],
  selectedYear = new Date().getFullYear(),
  onYearChange,
  totalSubmissions = 438,
  totalActiveDays = 101,
  maxStreak = 27,
  currentStreak = 0,
  loading = false
}) => {
  const currentYear = new Date().getFullYear();
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{date: string; contributions: number; points: number; x: number; y: number} | null>(null);

  const CELL = 18;
  const GAP = 4;
  const MONTH_GAP = 12;

  const heatmapData: HeatmapData = useMemo(() => {
    // Build grid using local dates so the heatmap maps to the user's local day boundaries
    const WEEKS = 53;

    // Normalize incoming data to local YYYY-MM-DD keys
    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      const day = `${d.getDate()}`.padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const dataMap = new Map((data || []).map(d => {
      const raw = (d.date || '').toString();
      // If backend sends YYYY-MM-DD already, use it
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return [raw, d] as const;
      // Otherwise parse date and convert to local date string
      try {
        const dt = new Date(raw);
        return [formatLocal(dt), d] as const;
      } catch {
        return [raw.split('T')[0], d] as const;
      }
    }));

    const weeksArray: WeekData[] = Array.from({ length: WEEKS }, () => ({ days: Array(7).fill(null), offset: 0 }));
    const labels: { month: string; weekIndex: number; x: number }[] = [];

    // Find first Sunday on or before Jan 1st (local)
    const startDate = new Date(selectedYear, 0, 1);
    const startDay = startDate.getDay();
    const firstSunday = new Date(startDate);
    if (startDay !== 0) firstSunday.setDate(firstSunday.getDate() - startDay);

    let offset = 0;
    let prevWeekMonth = firstSunday.getMonth();

    for (let w = 0; w < WEEKS; w++) {
      const weekStart = new Date(firstSunday);
      weekStart.setDate(firstSunday.getDate() + w * 7);

      const weekStartMonth = weekStart.getMonth();
      const weekStartYear = weekStart.getFullYear();

      if (w > 0 && weekStartMonth !== prevWeekMonth) {
        offset += MONTH_GAP;
      }

      const xPos = w * (CELL + GAP) + offset;
      weeksArray[w].offset = offset;

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + d);

        if (dayDate.getFullYear() !== selectedYear) {
          weeksArray[w].days[d] = null;
          continue;
        }

        const dateStr = formatLocal(dayDate);
        const existingData = dataMap.get(dateStr) as any;
        if (existingData) {
          weeksArray[w].days[d] = {
            date: dateStr,
            contributionCount: Number(existingData.contributionCount ?? existingData.count ?? 0),
            points: Number(existingData.points ?? 0)
          };
        } else {
          weeksArray[w].days[d] = { date: dateStr, contributionCount: 0, points: 0 };
        }

        // month label when day is 1
        if (dayDate.getDate() === 1) {
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          if (!labels.some(l => l.month === monthNames[dayDate.getMonth()])) {
            labels.push({ month: monthNames[dayDate.getMonth()], weekIndex: w, x: xPos });
          }
        }
      }

      prevWeekMonth = weekStartMonth;
    }

    // compute svg width from last non-empty week
    const lastWeekIndex = weeksArray.map((w, i) => ({ w, i })).reverse().find(item => item.w.days.some(Boolean));
    const lastIndex = lastWeekIndex ? lastWeekIndex.i : WEEKS - 1;
    const totalWidth = Math.round((lastIndex) * (CELL + GAP) + CELL + 40 + (weeksArray[lastIndex]?.offset ?? 0));

    return { weeks: weeksArray, monthLabels: labels, svgWidth: totalWidth };
  }, [data, selectedYear]);

  const { weeks, monthLabels, svgWidth } = heatmapData;

  const getFillColor = (contributions: number): string => {
    const c = safeNumber(contributions, 0);
    if (c === 0) return 'rgba(255, 250, 240, 0.9)';
    if (c <= 1) return 'var(--fill-tertiary)';
    if (c <= 3) return 'var(--fill-secondary)';
    if (c <= 7) return 'var(--fill-primary)';
    return 'var(--fill-accent)';
  };

  const getBorderColor = (contributions: number): string => {
    const c = safeNumber(contributions, 0);
    if (c === 0) return 'var(--border-empty)';
    if (c <= 1) return 'var(--border-tertiary)';
    if (c <= 3) return 'var(--border-secondary)';
    if (c <= 7) return 'var(--border-primary)';
    return 'var(--border-accent)';
  };

  const handleYearChange = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYear - 1 : selectedYear + 1;
    if (onYearChange) {
      onYearChange(newYear);
    }
  };

  const handleDayHover = (event: React.MouseEvent, dayData: HeatmapDay | null) => {
    if (!dayData) {
      setHoveredDay(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const contributions = Number(dayData.contributionCount ?? dayData.count ?? 0);
    setHoveredDay({
      date: dayData.date,
      contributions,
      points: Number(dayData.points || 0),
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10
    });
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  const svgHeight = 7 * (CELL + GAP) + 40;

  return (
    <div className="contribution-heatmap-container">
      <div className="heatmap-card">
        <div className="heatmap-header">
          <div className="submissions-count">
            <span className="submissions-number">
              {safeNumber(totalSubmissions, 0)}
            </span>
            <span className="submissions-label">
              submissions in the past year
            </span>
            <div className="info-icon-container">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="info-button"
                onMouseEnter={() => setShowInfo(true)}
                onMouseLeave={() => setShowInfo(false)}
              >
                <Info size={16} />
              </button>
              
              {showInfo && (
                <div className="info-tooltip">
                  Total number of submissions you made in {selectedYear}
                  <div className="info-tooltip-arrow" />
                </div>
              )}
            </div>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Total active days:</span>
              <span className="stat-value">{safeNumber(totalActiveDays, 0)}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Max streak:</span>
              <span className="stat-value">{safeNumber(maxStreak, 0)}</span>
            </div>
          </div>

          <div className="year-selector">
            <button 
              onClick={() => handleYearChange('prev')}
              disabled={selectedYear <= currentYear - 5}
              className="year-nav-button"
            >
              <ChevronLeft size={16} />
            </button>
            
            <select 
              value={selectedYear}
              onChange={(e) => onYearChange?.(Number(e.target.value))}
              className="year-dropdown"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button 
              onClick={() => handleYearChange('next')}
              disabled={selectedYear >= currentYear}
              className="year-nav-button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="desktop-heatmap">
          <div className="heatmap-grid-container">
            <div className="heatmap-svg-container">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="heatmap-svg"
                preserveAspectRatio="xMidYMin meet"
              >
                {/* Background lines for month separation */}
                {monthLabels.map((label, index) => {
                  if (index > 0) {
                    // Draw a subtle background line between months
                    const prevLabel = monthLabels[index - 1];
                    const lineX = prevLabel.x + (label.x - prevLabel.x) / 2;
                    return (
                      <line
                        key={`bg-line-${index}`}
                        x1={lineX}
                        y1={0}
                        x2={lineX}
                        y2={7 * (CELL + GAP)}
                        stroke="var(--border-control)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.5"
                      />
                    );
                  }
                  return null;
                })}
                
                {/* Heatmap squares */}
                {weeks.map((week, weekIndex) => (
                  <g key={weekIndex} transform={`translate(${weekIndex * (CELL + GAP) + week.offset}, 0)`}>
                    {week.days.map((dayData, dayIndex) => {
                      // Only render rects for actual days within the selected year
                      if (!dayData) return null;

                      const contributions = Number(dayData.contributionCount ?? dayData.count ?? 0);
                      const fillColor = getFillColor(contributions);
                      const borderColor = getBorderColor(contributions);

                      return (
                        <rect
                          key={`${weekIndex}-${dayIndex}`}
                          x={0}
                          y={dayIndex * (CELL + GAP)}
                          width={CELL}
                          height={CELL}
                          fill={fillColor}
                          stroke={borderColor}
                          strokeWidth={1}
                          rx={3}
                          ry={3}
                          className="heatmap-cell"
                          onMouseEnter={(e) => handleDayHover(e, dayData)}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={{
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })}
                  </g>
                ))}

                {/* Month labels */}
                {monthLabels.map((label, index) => (
                  <text
                    key={index}
                    x={label.x}
                    y={7 * (CELL + GAP) + 30}
                    fontSize="12px"
                    fill="var(--text-label-3)"
                    className="month-label"
                    textAnchor="start"
                    fontWeight="500"
                  >
                    {label.month}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="mobile-heatmap">
          <div className="mobile-heatmap-scroll">
            <div className="heatmap-grid-container">
              <div className="heatmap-svg-container">
                <svg 
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                  className="heatmap-svg mobile"
                  width={svgWidth}
                  height={svgHeight}
                >
                  {/* Background lines for month separation - mobile */}
                  {monthLabels.map((label, index) => {
                    if (index > 0) {
                      const prevLabel = monthLabels[index - 1];
                      const lineX = prevLabel.x + (label.x - prevLabel.x) / 2;
                      return (
                        <line
                          key={`mobile-bg-line-${index}`}
                          x1={lineX}
                          y1={0}
                          x2={lineX}
                          y2={7 * (CELL + GAP)}
                          stroke="var(--border-control)"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                          opacity="0.5"
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {weeks.map((week, weekIndex) => (
                    <g key={`mobile-${weekIndex}`} transform={`translate(${weekIndex * (CELL + GAP) + week.offset}, 0)`}>
                      {week.days.map((dayData, dayIndex) => {
                        const contributions = dayData ? Number(dayData.contributionCount ?? dayData.count ?? 0) : 0;
                        const fillColor = getFillColor(contributions);
                        const borderColor = getBorderColor(contributions);

                          // Only render real days
                          if (!dayData) return null;

                          return (
                            <rect
                              key={`mobile-${weekIndex}-${dayIndex}`}
                              x={0}
                              y={dayIndex * (CELL + GAP)}
                              width={CELL}
                              height={CELL}
                              fill={fillColor}
                              stroke={borderColor}
                              strokeWidth={1}
                              rx={3}
                              ry={3}
                              className="heatmap-cell"
                              onMouseEnter={(e) => handleDayHover(e, dayData)}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          );
                      })}
                    </g>
                  ))}

                  {monthLabels.map((label, index) => (
                    <text
                      key={`mobile-label-${index}`}
                      x={label.x}
                      y={7 * (CELL + GAP) + 30}
                      fontSize="12px"
                      fill="var(--text-label-3)"
                      className="month-label"
                      textAnchor="start"
                      fontWeight="500"
                    >
                      {label.month}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="heatmap-legend">
          <span className="legend-label">Less</span>
          {[
            { bg: 'rgba(255, 250, 240, 0.9)', border: 'var(--border-empty)' },
            { bg: 'var(--fill-tertiary)', border: 'var(--border-tertiary)' },
            { bg: 'var(--fill-secondary)', border: 'var(--border-secondary)' },
            { bg: 'var(--fill-primary)', border: 'var(--border-primary)' },
            { bg: 'var(--fill-accent)', border: 'var(--border-accent)' }
          ].map((color, idx) => (
            <div
              key={idx}
              className="legend-color"
              style={{
                background: color.bg,
                borderColor: color.border
              }}
            />
          ))}
          <span className="legend-label">More</span>
        </div>

        {hoveredDay && (
          <div 
            className="day-tooltip"
            style={{
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y}px`
            }}
          >
            <div className="tooltip-date">{formatDate(hoveredDay.date)}</div>
            <div className="tooltip-stats">
              <span className="tooltip-count">{hoveredDay.contributions} submission{hoveredDay.contributions !== 1 ? 's' : ''}</span>
              <span className="tooltip-points">• {hoveredDay.points} points</span>
            </div>
            <div className="tooltip-arrow" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributionHeatmap;