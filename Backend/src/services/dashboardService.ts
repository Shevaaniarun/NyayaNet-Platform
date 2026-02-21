import db from '../config/database';

/**
 * DASHBOARD OVERVIEW
 * Top summary cards
 */
export const fetchDashboardOverview = async (userId: string) => {
  const query = `
    SELECT
      total_points,
      total_contributions,
      current_streak,
      longest_streak,
      last_active_at,
      posts_count,
      discussions_count,
      replies_count,
      best_answers_count,
      ai_queries_count,
      bookmarks_count
    FROM user_contribution_summary
    WHERE user_id = $1
  `;

  const { rows } = await db.query(query, [userId]);

  return rows[0] || {
    total_points: 0,
    total_contributions: 0,
    current_streak: 0,
    longest_streak: 0,
    last_active_at: null,
    posts_count: 0,
    discussions_count: 0,
    replies_count: 0,
    best_answers_count: 0,
    ai_queries_count: 0,
    bookmarks_count: 0,
  };
};

/**
 * CONTRIBUTION HEATMAP (GitHub style)
 * Returns [{ date, count, points }]
 */
export const fetchContributionHeatmap = async (
  userId: string,
  year: number
) => {
  const query = `
    SELECT
      contribution_date AS date,
      COUNT(*) AS count,
      SUM(points) AS points
    FROM user_contributions
    WHERE user_id = $1
      AND EXTRACT(YEAR FROM contribution_date) = $2
    GROUP BY contribution_date
    ORDER BY contribution_date ASC
  `;

  const { rows } = await db.query(query, [userId, year]);

  return rows.map(row => ({
    date: row.date,
    count: Number(row.count),
    points: Number(row.points),
  }));
};

/**
 * ACTIVITY FEED (Timeline)
 */
export const fetchActivityFeed = async (
  userId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      contribution_type,
      entity_type,
      entity_id,
      points,
      created_at
    FROM user_contributions
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const { rows } = await db.query(query, [userId, limit, offset]);

  return rows;
};

/**
 * CONTRIBUTION BREAKDOWN
 * For charts / stats - UPDATED with followers and post likes
 */
export const fetchContributionBreakdown = async (userId: string) => {
  const query = `
    SELECT
      posts_count,
      discussions_count,
      replies_count,
      best_answers_count,
      ai_queries_count,
      bookmarks_count,
      followers_count,
      post_likes_received
    FROM user_contribution_summary
    WHERE user_id = $1
  `;

  const { rows } = await db.query(query, [userId]);

  return rows[0] || {
    posts_count: 0,
    discussions_count: 0,
    replies_count: 0,
    best_answers_count: 0,
    ai_queries_count: 0,
    bookmarks_count: 0,
    followers_count: 0,
    post_likes_received: 0,
  };
};

/**
 * BADGES (Earned + Locked)
 */
export const fetchUserBadges = async (userId: string) => {
  const query = `
    SELECT
      b.id,
      b.code,
      b.title,
      b.description,
      b.icon,
      b.threshold,
      ub.earned_at
    FROM badges b
    LEFT JOIN user_badges ub
      ON ub.badge_id = b.id
      AND ub.user_id = $1
    ORDER BY b.threshold ASC
  `;

  const { rows } = await db.query(query, [userId]);

  return rows.map(badge => ({
    id: badge.id,
    code: badge.code,
    title: badge.title,
    description: badge.description,
    icon: badge.icon,
    threshold: badge.threshold,
    earned: !!badge.earned_at,
    earned_at: badge.earned_at,
  }));
};

// ... (your existing functions like fetchDashboardOverview, fetchContributionHeatmap, etc.) ...

/**
 * Check and award badges based on user metrics
 * Add this at the END of your dashboardService.ts file
 */
export const checkAndAwardBadges = async (userId: string) => {
  // Get user's current metrics
  const summary = await fetchDashboardOverview(userId);
  
  // Diagnostic log: print the summary fetched for this user
  console.log(`badge-check: user=${userId} summary=`, JSON.stringify(summary));

  // Get all badges
  const allBadges = await fetchUserBadges(userId);
  console.log(`badge-check: fetched ${allBadges.length} badge rows (earned flags included)`);
  
  // Define badge thresholds
  const badgeThresholds = [
    { code: 'FIRST_CONTRIBUTION', field: 'total_contributions', threshold: 1 },
    { code: 'CONTRIBUTOR_10', field: 'total_contributions', threshold: 10 },
    { code: 'CONTRIBUTOR_50', field: 'total_contributions', threshold: 50 },
    { code: 'CONTRIBUTOR_100', field: 'total_contributions', threshold: 100 },
    { code: 'CONTRIBUTOR_500', field: 'total_contributions', threshold: 500 },
    { code: 'STREAK_7', field: 'current_streak', threshold: 7 },
    { code: 'STREAK_30', field: 'current_streak', threshold: 30 },
    { code: 'STREAK_100', field: 'current_streak', threshold: 100 },
    { code: 'BEST_ANSWER_5', field: 'best_answers_count', threshold: 5 },
    { code: 'BEST_ANSWER_10', field: 'best_answers_count', threshold: 10 },
    { code: 'BEST_ANSWER_25', field: 'best_answers_count', threshold: 25 },
    { code: 'FOLLOWERS_10', field: 'followers_count', threshold: 10 },
    { code: 'FOLLOWERS_50', field: 'followers_count', threshold: 50 },
    { code: 'FOLLOWERS_100', field: 'followers_count', threshold: 100 },
    { code: 'FOLLOWERS_500', field: 'followers_count', threshold: 500 },
    { code: 'POST_LIKES_10', field: 'post_likes_received', threshold: 10 },
    { code: 'POST_LIKES_50', field: 'post_likes_received', threshold: 50 },
    { code: 'POST_LIKES_100', field: 'post_likes_received', threshold: 100 },
    { code: 'POST_LIKES_500', field: 'post_likes_received', threshold: 500 },
    { code: 'POST_LIKES_1000', field: 'post_likes_received', threshold: 1000 },
    { code: 'AI_PIONEER', field: 'ai_queries_count', threshold: 1 },
    { code: 'BOOKWORM', field: 'bookmarks_count', threshold: 10 }
  ];

  // Check each badge
  for (const badge of badgeThresholds) {
    const userValue = summary[badge.field] || 0;
    
    // Diagnostic: log evaluation for this badge
    console.log(`badge-check: evaluating ${badge.code} field=${badge.field} userValue=${userValue} threshold=${badge.threshold}`);

    if (userValue >= badge.threshold) {
      // Check if user already has this badge
      const hasBadge = allBadges.some(b => b.code === badge.code && b.earned);
      console.log(`badge-check: hasBadge=${hasBadge} for ${badge.code}`);
      
      if (!hasBadge) {
        // Award the badge
        await awardBadgeToUser(userId, badge.code);
      }
    }
  }
};

/**
 * Award a specific badge to a user
 * Add this helper function right after checkAndAwardBadges
 */
const awardBadgeToUser = async (userId: string, badgeCode: string) => {
  const query = `
    INSERT INTO user_badges (user_id, badge_id, earned_at)
    SELECT $1, id, CURRENT_TIMESTAMP
    FROM badges
    WHERE code = $2
    ON CONFLICT (user_id, badge_id) DO NOTHING
    RETURNING *;
  `;
  
  const { rows } = await db.query(query, [userId, badgeCode]);
  
  if (rows.length > 0) {
    console.log(`🎉 Badge "${badgeCode}" awarded to user ${userId}`);
  }
  else {
    // If no rows returned, either the badge code doesn't exist or ON CONFLICT prevented insert
    console.log(`badge-award: no rows returned when awarding ${badgeCode} to ${userId} — verify badge exists and codes match`);
  }

  return rows;
};
