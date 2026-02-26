import { Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/dashboard/overview
 * Returns top summary stats
 */
export const getDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const overview = await dashboardService.fetchDashboardOverview(userId);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard overview',
    });
  }
};

/**
 * GET /api/dashboard/heatmap?year=2026
 * Returns contribution heatmap data
 */
export const getContributionHeatmap = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const year = Number(req.query.year) || new Date().getFullYear();

    const heatmap = await dashboardService.fetchContributionHeatmap(
      userId,
      year
    );

    return res.status(200).json({
      success: true,
      data: heatmap,
    });
  } catch (error) {
    console.error('Contribution Heatmap Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load contribution heatmap',
    });
  }
};

/**
 * GET /api/dashboard/activity-feed?page=1&limit=20
 * Returns recent activity timeline
 */
export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const feed = await dashboardService.fetchActivityFeed(
      userId,
      page,
      limit
    );

    return res.status(200).json({
      success: true,
      data: feed,
    });
  } catch (error) {
    console.error('Activity Feed Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load activity feed',
    });
  }
};

/**
 * GET /api/dashboard/breakdown
 * Returns contribution breakdown
 */
export const getContributionBreakdown = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const breakdown = await dashboardService.fetchContributionBreakdown(userId);

    // Map the data to match what your component expects
    const mappedBreakdown = {
      posts: breakdown.posts_count,
      discussions: breakdown.discussions_count,
      replies: breakdown.replies_count,
      bestAnswers: breakdown.best_answers_count,
      aiQueries: breakdown.ai_queries_count,
      bookmarks: breakdown.bookmarks_count,
      followers: breakdown.followers_count,
      postLikesReceived: breakdown.post_likes_received
    };

    return res.status(200).json({
      success: true,
      data: mappedBreakdown,
    });
  } catch (error) {
    console.error('Contribution Breakdown Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load contribution breakdown',
    });
  }
};

/**
 * GET /api/dashboard/badges
 * Returns earned + locked badges
 */
export const getUserBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const badges = await dashboardService.fetchUserBadges(userId);

    return res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error('User Badges Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load badges',
    });
  }
};

/**
 * POST /api/dashboard/check-badges
 * Manually trigger badge check for the current user
 * ADD THIS NEW FUNCTION
 */
export const checkUserBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    await dashboardService.checkAndAwardBadges(userId);

    // Get updated badges after checking
    const updatedBadges = await dashboardService.fetchUserBadges(userId);

    return res.status(200).json({
      success: true,
      message: 'Badges checked and awarded successfully',
      data: updatedBadges
    });
  } catch (error) {
    console.error('Check Badges Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check badges',
    });
  }
};