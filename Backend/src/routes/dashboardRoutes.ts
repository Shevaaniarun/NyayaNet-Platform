import { Router, RequestHandler } from 'express';
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

router.get('/overview', authenticate, getDashboardOverview as RequestHandler);
router.get('/heatmap', authenticate, getContributionHeatmap as RequestHandler);
router.get('/activity-feed', authenticate, getActivityFeed as RequestHandler);
router.get('/breakdown', authenticate, getContributionBreakdown as RequestHandler);
router.get('/badges', authenticate, getUserBadges as RequestHandler);
router.post('/check-badges', authenticate, checkUserBadges as RequestHandler);  // ADD THIS ROUTE

export default router;