import { Router, RequestHandler } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

/* ============================
   FIXED ROUTE ORDER
============================ */

/* ---- SPECIAL ROUTES FIRST ---- */

router.get('/search', authenticate, ProfileController.searchUserContent as RequestHandler);
router.get('/bookmarks', authenticate, ProfileController.getBookmarks as RequestHandler);

router.get('/liked-posts', authenticate, ProfileController.getLikedPosts as RequestHandler);
router.get('/liked-discussions', authenticate, ProfileController.getLikedDiscussions as RequestHandler);
router.get('/following-discussions', authenticate, ProfileController.getFollowingDiscussions as RequestHandler);

/* ---- CERTIFICATIONS ---- */

router.get('/:userId/certifications', authenticate, ProfileController.getCertifications as RequestHandler);
router.post('/certifications', authenticate, ProfileController.addCertification as RequestHandler);
router.delete('/certifications/:certificationId', authenticate, ProfileController.deleteCertification as RequestHandler);

/* ---- USER CONTENT ---- */

router.get('/:userId/posts', authenticate, ProfileController.getUserPosts as RequestHandler);
router.get('/:userId/discussions', authenticate, ProfileController.getUserDiscussions as RequestHandler);
router.get('/:userId/following-discussions', authenticate, ProfileController.getUserFollowingDiscussions as RequestHandler);

/* ---- FOLLOW PLACEHOLDERS ---- */

router.get('/:userId/followers', authenticate, ((req, res) => {
  res.json({ success: true, data: { followers: [] } });
}) as RequestHandler);

router.get('/:userId/following', authenticate, ((req, res) => {
  res.json({ success: true, data: { following: [] } });
}) as RequestHandler);

/* ---- PROFILE CORE (MUST BE LAST) ---- */

router.get('/:userId', authenticate, ProfileController.getProfile as RequestHandler);
router.put('/', authenticate, ProfileController.updateProfile as RequestHandler);

export default router;
