// [file name]: routes/profileRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { ProfileController } from '../controllers/profileController';
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

// Profile routes
router.get('/:userId', ProfileController.getProfile);
router.put('/', authenticate, authHandler(ProfileController.updateProfile));
router.get('/:userId/certifications', ProfileController.getCertifications);
router.post('/certifications', authenticate, authHandler(ProfileController.addCertification));
router.delete('/certifications/:certificationId', authenticate, authHandler(ProfileController.deleteCertification));
router.get('/:userId/posts', ProfileController.getUserPosts);
router.get('/:userId/discussions', ProfileController.getUserDiscussions);
router.get('/bookmarks', authenticate, authHandler(ProfileController.getBookmarks));
router.get('/search', authenticate, authHandler(ProfileController.searchUserContent));

// Photo upload routes
router.post('/upload/profile-photo', authenticate, authHandler(ProfileController.uploadProfilePhoto));
router.post('/upload/cover-photo', authenticate, authHandler(ProfileController.uploadCoverPhoto));

export default router;