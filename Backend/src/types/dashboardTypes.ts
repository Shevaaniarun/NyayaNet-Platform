/* =========================================
   DASHBOARD TYPES — NyayaNet
   ========================================= */

/* ---------- OVERVIEW ---------- */

export interface DashboardOverview {
  total_points: number;
  total_contributions: number;

  current_streak: number;
  longest_streak: number;
  last_active_at: string | null;

  posts_count: number;
  discussions_count: number;
  replies_count: number;
  best_answers_count: number;
  ai_queries_count: number;
  bookmarks_count: number;
}

/* ---------- HEATMAP ---------- */

export interface ContributionHeatmapDay {
  date: string;        // YYYY-MM-DD
  count: number;       // number of activities
  points: number;      // total points earned that day
}

/* ---------- ACTIVITY FEED ---------- */

export type ContributionType =
  | 'POST_CREATED'
  | 'DISCUSSION_CREATED'
  | 'REPLY_CREATED'
  | 'BEST_ANSWER'
  | 'AI_QUERY'
  | 'LAW_BOOKMARK';

export interface ActivityFeedItem {
  contribution_type: ContributionType;
  entity_type: string;
  entity_id: string;
  points: number;
  created_at: string;
}

/* ---------- BREAKDOWN ---------- */

export interface ContributionBreakdown {
  posts_count: number;
  discussions_count: number;
  replies_count: number;
  best_answers_count: number;
  ai_queries_count: number;
  bookmarks_count: number;
}

/* ---------- BADGES ---------- */

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string | null;
  threshold: number | null;

  earned: boolean;
  earned_at: string | null;
}


