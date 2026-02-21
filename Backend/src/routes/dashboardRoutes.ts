import { Router } from 'express';
import {
  getDashboardOverview,
  getContributionHeatmap,
  getActivityFeed,
  getContributionBreakdown,
  getUserBadges,
  checkUserBadges,  // ADD THIS IMPORT
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Dashboard APIs
 * All routes are protected
 * Base path: /api/dashboard
 */

router.get('/overview', authenticate, getDashboardOverview);
router.get('/heatmap', authenticate, getContributionHeatmap);
router.get('/activity-feed', authenticate, getActivityFeed);
router.get('/breakdown', authenticate, getContributionBreakdown);
router.get('/badges', authenticate, getUserBadges);
router.post('/check-badges', authenticate, checkUserBadges);  // ADD THIS ROUTE

export default router;