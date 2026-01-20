import React from 'react';
import './DashboardPage.css';

// Import dashboard components
import HeaderStats from '../../components/dashboard/HeaderStats';
import ContributionHeatmap from '../../components/dashboard/ContributionHeat';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import ContributionBreakdown from '../../components/dashboard/ContributionBreakdown';
import BadgesGrid from '../../components/dashboard/BadgesGrid';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-justice-black p-8">
      {/* Page Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Contribution Dashboard</h1>
        <p className="dashboard-subtitle">
          Track your contributions, activities, and professional growth on NyayaNet
        </p>
      </header>

      {/* Top Section: Header Stats */}
      <section className="dashboard-section stats-section">
        <div className="section-header">
          <h2 className="section-title">Overview</h2>
          <p className="section-description">
            Your contribution metrics and activity statistics
          </p>
        </div>
        <HeaderStats />
      </section>

      {/* Second Section: Heatmap */}
      <section className="dashboard-section heatmap-section">
        <div className="section-header">
          <h2 className="section-title">Contribution Activity</h2>
          <p className="section-description">
            Daily contribution heatmap showing your consistency over time
          </p>
        </div>
        <ContributionHeatmap />
      </section>

      {/* Middle Section: Two-column layout */}
      <section className="dashboard-section middle-section">
        <div className="two-column-layout">
          {/* Left Column: Activity Timeline */}
          <div className="column left-column">
            <div className="column-header">
              <h2 className="section-title">Recent Activity</h2>
              <p className="section-description">
                Your latest contributions and interactions
              </p>
            </div>
            <ActivityTimeline />
          </div>

          {/* Right Column: Contribution Breakdown */}
          <div className="column right-column">
            <div className="column-header">
              <h2 className="section-title">Contribution Breakdown</h2>
              <p className="section-description">
                Distribution of your contribution types
              </p>
            </div>
            <ContributionBreakdown />
          </div>
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
        <BadgesGrid />
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