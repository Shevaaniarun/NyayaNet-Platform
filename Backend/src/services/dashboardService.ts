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
 * For charts / stats
 */
export const fetchContributionBreakdown = async (userId: string) => {
  const query = `
    SELECT
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
    posts_count: 0,
    discussions_count: 0,
    replies_count: 0,
    best_answers_count: 0,
    ai_queries_count: 0,
    bookmarks_count: 0,
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
