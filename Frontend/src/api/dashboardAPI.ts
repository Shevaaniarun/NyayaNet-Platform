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
  followers: number;        // ADD THIS
  postLikesReceived: number; // ADD THIS
}

// In api/dashboardAPI.ts - Update the Badge interface
type BadgeCategory = 'contribution' | 'streak' | 'quality' | 'engagement' | 'special';
type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  code: string;
  title: string;
  description: string;
  icon?: string;
  earned: boolean;
  earnedAt?: string;
  category?: BadgeCategory;  // Use the specific type
  rarity?: BadgeRarity;      // Use the specific type
  progress?: number;
  progressTotal?: number;
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
 * 4️⃣ Contribution Breakdown - UPDATED with followers and likes
 */
export const getContributionBreakdown = async (): Promise<any> => {
    const res = await api.get("/dashboard/breakdown");
    const payload = res.data && res.data.data ? res.data.data : res.data;
    
    console.log('Raw breakdown payload:', payload); // Debug log
    
    return {
      posts: payload.posts ?? payload.posts_count ?? 0,
      discussions: payload.discussions ?? payload.discussions_count ?? 0,
      replies: payload.replies ?? payload.replies_count ?? 0,
      bestAnswers: payload.bestAnswers ?? payload.best_answers_count ?? 0,
      aiQueries: payload.aiQueries ?? payload.ai_queries_count ?? 0,
      bookmarks: payload.bookmarks ?? payload.bookmarks_count ?? 0,
      followers: payload.followers ?? payload.followers_count ?? 0,
      postLikesReceived: payload.postLikesReceived ?? payload.post_likes_received ?? 0,
    };
};
/**
 * 5️⃣ Badges & Achievements - UPDATED with rich data
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
    earned: b.earned || false,
    earnedAt: b.earned_at ?? b.earnedAt ?? null,
    category: determineCategory(b.code, b.title) as BadgeCategory,  // Cast to specific type
    rarity: determineRarity(b.code, b.threshold) as BadgeRarity,    // Cast to specific type
    progress: b.progress || 0,
    progressTotal: b.threshold || 100
  }));
};

// Helper functions to determine category and rarity - with proper return types
const determineCategory = (code: string, title: string): BadgeCategory => {
  const str = (code + title).toLowerCase();
  if (str.includes('streak')) return 'streak';
  if (str.includes('best') || str.includes('quality')) return 'quality';
  if (str.includes('follower') || str.includes('like')) return 'engagement';
  if (str.includes('first') || str.includes('special')) return 'special';
  return 'contribution';  // Default
};

const determineRarity = (code: string, threshold: number): BadgeRarity => {
  if (threshold >= 500) return 'legendary';
  if (threshold >= 100) return 'epic';
  if (threshold >= 50) return 'rare';
  return 'common';  // Default
};

/**
 * POST /dashboard/check-badges - manually trigger badge evaluation/awarding for current user
 */
export const checkUserBadges = async (): Promise<void> => {
  await api.post('/dashboard/check-badges');
};