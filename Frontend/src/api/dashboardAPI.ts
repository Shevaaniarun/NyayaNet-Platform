import axios from "axios";

/**
 * Axios instance
 * Assumes you already have auth token stored in localStorage
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================================================
   TYPES (frontend-facing, mirrors backend responses)
   ========================================================= */

export interface DashboardOverview {
  totalPoints: number;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  reputationLevel: string;
  lastActiveAt: string | null;
}

export interface HeatmapDay {
  date: string;        // YYYY-MM-DD
  count: number;       // number of contributions
  points: number;     // total points that day
}

export interface ActivityItem {
  id: string;
  contributionType: string;
  entityType: string;
  entityId: string;
  points: number;
  createdAt: string;
}

export interface ContributionBreakdown {
  posts: number;
  discussions: number;
  replies: number;
  bestAnswers: number;
  aiQueries: number;
  bookmarks: number;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon?: string;
  earnedAt?: string;
}

/* =========================================================
   API CALLS
   ========================================================= */

/**
 * 1️⃣ Dashboard Overview
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const res = await api.get("/dashboard/overview");
  // Backend returns { success: true, data: { ... } }
  const payload = res.data && res.data.data ? res.data.data : res.data;

  // Normalize snake_case -> camelCase expected by frontend components
  return {
    // HeaderStats expects `totalScore`
    totalScore: payload.total_points ?? payload.totalPoints ?? 0,
    // other helpful fields
    totalContributions: payload.total_contributions ?? payload.totalContributions ?? 0,
    currentStreak: payload.current_streak ?? payload.currentStreak ?? 0,
    longestStreak: payload.longest_streak ?? payload.longestStreak ?? 0,
    reputationLevel: payload.reputation_level ?? payload.reputationLevel ?? 'New Contributor',
    // HeaderStats expects `lastActiveDate`
    lastActiveDate: payload.last_active_at ?? payload.lastActiveAt ?? null,
  } as any;
};

/**
 * 2️⃣ Contribution Heatmap
 */
export const getContributionHeatmap = async (
  year: number
): Promise<HeatmapDay[]> => {
  const res = await api.get("/dashboard/heatmap", {
    params: { year },
  });
  const payload = res.data && res.data.data ? res.data.data : res.data;
  // Ensure numeric types
  return (Array.isArray(payload) ? payload : []).map((d: any) => ({
    date: d.date,
    count: Number(d.count || 0),
    points: Number(d.points || 0),
  }));
};

/**
 * 3️⃣ Activity Timeline
 */
export const getActivityFeed = async (
  page = 1,
  limit = 10
): Promise<ActivityItem[]> => {
  const res = await api.get("/dashboard/activity-feed", {
    params: { page, limit },
  });
  const payload = res.data && res.data.data ? res.data.data : res.data;
  return (Array.isArray(payload) ? payload : []).map((r: any) => ({
    id: r.id ?? `${r.entity_type}-${r.entity_id}-${r.created_at}`,
    contributionType: r.contribution_type ?? r.contributionType,
    entityType: r.entity_type ?? r.entityType,
    entityId: r.entity_id ?? r.entityId,
    points: Number(r.points || 0),
    createdAt: r.created_at ?? r.createdAt,
  }));
};

/**
 * 4️⃣ Contribution Breakdown
 */
export const getContributionBreakdown = async (): Promise<any> => {
    const res = await api.get("/dashboard/breakdown");
    const payload = res.data && res.data.data ? res.data.data : res.data;
    // Map backend snake_case to frontend expected keys
    return {
      posts: payload.posts_count ?? payload.posts ?? 0,
      discussions: payload.discussions_count ?? payload.discussions ?? 0,
      replies: payload.replies_count ?? payload.replies ?? 0,
      bestAnswers: payload.best_answers_count ?? payload.bestAnswers ?? 0,
      aiQueries: payload.ai_queries_count ?? payload.aiQueries ?? 0,
      bookmarks: payload.bookmarks_count ?? payload.bookmarks ?? 0,
      // legacy frontend used lawBookmarks in some components — keep it for compatibility
      lawBookmarks: payload.bookmarks_count ?? payload.bookmarks ?? 0,
    };
};
/**
 * 5️⃣ Badges & Achievements
 */
export const getUserBadges = async (): Promise<Badge[]> => {
  const res = await api.get("/dashboard/badges");
  const payload = res.data && res.data.data ? res.data.data : res.data;
  return (Array.isArray(payload) ? payload : []).map((b: any) => ({
    id: b.id,
    code: b.code,
    title: b.title,
    description: b.description,
    icon: b.icon,
    earnedAt: b.earned_at ?? b.earnedAt ?? null,
  }));
};
