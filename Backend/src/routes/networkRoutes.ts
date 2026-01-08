// [file name]: routes/networkRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { NetworkController } from '../controllers/networkController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Define a type for authenticated requests
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Helper function to handle authenticated requests
const authHandler = (handler: (req: AuthRequest, res: Response, next: NextFunction) => any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthRequest, res, next);
  };
};

// ================== FOLLOW ROUTES ==================
router.post('/follow/:targetUserId', authenticate, authHandler(NetworkController.sendFollowRequest));
router.post('/unfollow/:targetUserId', authenticate, authHandler(NetworkController.unfollowUser));

// ================== REQUEST HANDLING ROUTES ==================
router.post('/requests/:requestId/accept', authenticate, authHandler(NetworkController.acceptFollowRequest));
router.post('/requests/:requestId/reject', authenticate, authHandler(NetworkController.rejectFollowRequest));
router.post('/requests/:requestId/cancel', authenticate, authHandler(NetworkController.cancelFollowRequest));

// ================== GET ROUTES ==================
router.get('/follow-status/:targetUserId', authenticate, authHandler(NetworkController.getFollowStatus));
router.get('/requests/received', authenticate, authHandler(NetworkController.getFollowRequests));
router.get('/requests/sent', authenticate, authHandler(NetworkController.getPendingRequests));
router.get('/followers', authenticate, authHandler(NetworkController.getFollowers));
router.get('/following', authenticate, authHandler(NetworkController.getFollowing));
router.get('/search', authenticate, authHandler(NetworkController.searchUsers));
router.get('/stats', authenticate, authHandler(NetworkController.getNetworkStats));

export default router;