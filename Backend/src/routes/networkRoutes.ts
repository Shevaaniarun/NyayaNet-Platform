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
router.post('/follow/:targetUserId', authenticate, authHandler(NetworkController.followUser));
router.post('/unfollow/:targetUserId', authenticate, authHandler(NetworkController.unfollowUser));

// ================== CONNECTION REQUEST ROUTES ==================
router.post('/connection-requests/:targetUserId', authenticate, authHandler(NetworkController.sendConnectionRequest));
router.post('/connection-requests/:requestId/cancel', authenticate, authHandler(NetworkController.cancelConnectionRequest));
router.post('/connection-requests/:requestId/accept', authenticate, authHandler(NetworkController.acceptConnectionRequest));
router.post('/connection-requests/:requestId/reject', authenticate, authHandler(NetworkController.rejectConnectionRequest));

// ================== GET ROUTES ==================
router.get('/connection-status/:targetUserId', authenticate, authHandler(NetworkController.getConnectionStatus));
router.get('/connection-requests/pending', authenticate, authHandler(NetworkController.getPendingConnectionRequests));
router.get('/connection-requests/sent', authenticate, authHandler(NetworkController.getSentConnectionRequests));
router.get('/connections', authenticate, authHandler(NetworkController.getConnections));
router.get('/followers', authenticate, authHandler(NetworkController.getFollowers));
router.get('/following', authenticate, authHandler(NetworkController.getFollowing));
router.get('/search', authenticate, authHandler(NetworkController.searchUsers));
router.get('/stats', authenticate, authHandler(NetworkController.getNetworkStats));

export default router;