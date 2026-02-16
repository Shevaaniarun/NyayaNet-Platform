import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

// Import dashboard components
import HeaderStats from '../../components/dashboard/HeaderStats';
import ContributionHeatmap from '../../components/dashboard/ContributionHeat';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ContributionBreakdown from '../../components/dashboard/ContributionBreakdown';
import BadgesGrid from '../../components/dashboard/BadgesGrid';

// Import API functions
import {
  getDashboardOverview,
  getContributionHeatmap,
  getContributionBreakdown,
  getUserBadges
} from "../../api/dashboardAPI";

// For activity feed
import { getFeed } from '../../api/postsAPI';

const DashboardPage: React.FC = () => {
  // State for dashboard data
  const [overview, setOverview] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllActivities, setShowAllActivities] = useState(false);

  // Fetch all dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const currentYear = new Date().getFullYear();
        
        // Fetch all data in parallel
        const [overviewData, heatmapData, breakdownData, badgesData] = 
          await Promise.all([
            getDashboardOverview(),
            getContributionHeatmap(currentYear),
            getContributionBreakdown(),
            getUserBadges()
          ]);
        
        // For activities, use the feed API
        let activitiesData: any[] = []; // Explicitly type as any[]
        try {
          const feedData = await getFeed(1, 10);
          activitiesData = feedData.posts || [];
        } catch (feedError) {
          console.warn('Could not fetch activities from feed:', feedError);
          // Fallback: use heatmap data or empty array
          activitiesData = [];
        }
        
        // Compute active days from heatmap (count of days with contributions > 0)
        const normalizedHeatmap = Array.isArray(heatmapData) ? heatmapData : [];
        const activeDaysCount = normalizedHeatmap.reduce((acc, d) => {
          const c = Number((d as any).count ?? (d as any).contributionCount ?? 0);
          return acc + (c > 0 ? 1 : 0);
        }, 0);

        // Set state with fetched data directly
        setOverview(overviewData || null);
        setHeatmap(normalizedHeatmap);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
  setBreakdown(breakdownData || null);
  setBadges(Array.isArray(badgesData) ? badgesData : []);
  // Also update a small local state for active days if needed later
  // (we'll pass activeDaysCount directly into the heatmap component below)
        
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        
        // Set fallback data to prevent UI breakage
        setOverview({
          totalScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date().toISOString().split('T')[0]
        });
        setHeatmap([]);
        setActivities([]);
        setBreakdown({
          posts: 0,
          discussions: 0,
          replies: 0,
          bestAnswers: 0,
          aiQueries: 0,
          lawBookmarks: 0
        });
        setBadges([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-justice-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-constitution-gold mx-auto mb-4"></div>
          <p className="text-judge-ivory">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !overview) {
    return (
      <div className="min-h-screen bg-justice-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️</div>
          <p className="text-judge-ivory">{error}</p>
        </div>
      </div>
    );
  }

  const visibleActivities = showAllActivities ? activities : activities.slice(0, 5);

  return (
    <div className="min-h-screen bg-justice-black p-8">
      {/* Page Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Contribution Dashboard</h1>
        <p className="dashboard-subtitle">
          Track your contributions, activities, and professional growth on NyayaNet
        </p>
      </header>

  {/* Top Section: Header Stats (Overview full-width, streak cards below) */}
  <section className="dashboard-section stats-section">
        <div className="section-header">
          <h2 className="section-title">Overview</h2>
          <p className="section-description">
            Your contribution metrics and activity statistics
          </p>
        </div>
        <HeaderStats data={overview || {
          totalScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date().toISOString().split('T')[0]
        }} />
      </section>

      {/* Contribution Breakdown - full width */}
      <section className="dashboard-section breakdown-section mt-6">
        <div className="section-header">
          <h2 className="section-title">Contribution Breakdown</h2>
          <p className="section-description">Distribution of your contribution types</p>
        </div>
        <div className="mt-3">
          <ContributionBreakdown data={breakdown || {
            posts: 0,
            discussions: 0,
            replies: 0,
            bestAnswers: 0,
            aiQueries: 0,
            lawBookmarks: 0
          }} />
        </div>
      </section>

      {/* Heatmap Section */}
      <section className="dashboard-section heatmap-section mt-6">
        <div className="section-header">
          <h2 className="section-title">Contribution Activity</h2>
          <p className="section-description">
            Daily contribution heatmap showing your consistency over time
          </p>
        </div>
        {/* Pass summary stats from overview and compute active days from heatmap */}
        {(() => {
          const activeDays = (heatmap || []).reduce((acc, d) => {
            const c = Number((d as any).count ?? (d as any).contributionCount ?? 0);
            return acc + (c > 0 ? 1 : 0);
          }, 0);

          const totalSubmissions = overview?.totalContributions ?? overview?.total_contributions ?? 0;
          const maxStreak = overview?.longestStreak ?? overview?.longest_streak ?? 0;
          const currentStreak = overview?.currentStreak ?? overview?.current_streak ?? 0;

          return (
            <ContributionHeatmap
              data={heatmap || []}
              totalSubmissions={totalSubmissions}
              totalActiveDays={activeDays}
              maxStreak={maxStreak}
              currentStreak={currentStreak}
            />
          );
        })()}
      </section>

      {/* Recent Activity (below breakdown) - show 5 by default with option to view full */}
      <section className="dashboard-section recent-activity-section mt-6">
        <div className="section-header flex items-center justify-between">
          <div>
            <h2 className="section-title">Recent Activity</h2>
            <p className="section-description">Your latest contributions and interactions</p>
          </div>
          {activities && activities.length > 5 && (
            <div>
              <button
                className="px-3 py-1 text-sm rounded bg-constitution-gold/10 text-constitution-gold"
                onClick={() => setShowAllActivities(!showAllActivities)}
              >
                {showAllActivities ? 'Show less' : `View full (${activities.length})`}
              </button>
            </div>
          )}
        </div>

        <div className="mt-3">
          <ActivityTimeline items={visibleActivities || []} hasMore={!showAllActivities && activities.length > visibleActivities.length} />
        </div>
      </section>

      {/* Bottom Section: Badges Grid */}
      <section className="dashboard-section badges-section">
        <div className="section-header">
          <h2 className="section-title">Achievement Badges</h2>
          <p className="section-description">
            Professional recognition for your contributions and milestones
          </p>
        </div>
        <BadgesGrid badges={badges || []} />
      </section>

      {/* Footer Note */}
      <footer className="dashboard-footer">
        <p className="footer-note">
          Dashboard updates in real-time. All data is based on your contributions to the NyayaNet legal community.
        </p>
        <p className="footer-timestamp">
          Last updated: Just now
        </p>
      </footer>
    </div>
  );
};

export default DashboardPage;