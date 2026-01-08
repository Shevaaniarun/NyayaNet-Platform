// [file name]: routes/profileRoutes.ts
import express from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/* ============================
   FIXED ROUTE ORDER
============================ */

/* ---- SPECIAL ROUTES FIRST ---- */

router.get('/search', authenticate, ProfileController.searchUserContent);
router.get('/bookmarks', authenticate, ProfileController.getBookmarks);

router.get('/liked-posts', authenticate, ProfileController.getLikedPosts);
router.get('/liked-discussions', authenticate, ProfileController.getLikedDiscussions);
router.get('/following-discussions', authenticate, ProfileController.getFollowingDiscussions);

/* ---- CERTIFICATIONS ---- */

router.get('/:userId/certifications', authenticate, ProfileController.getCertifications);
router.post('/certifications', authenticate, ProfileController.addCertification);
router.delete('/certifications/:certificationId', authenticate, ProfileController.deleteCertification);

/* ---- USER CONTENT ---- */

router.get('/:userId/posts', authenticate, ProfileController.getUserPosts);
router.get('/:userId/discussions', authenticate, ProfileController.getUserDiscussions);

/* ---- FOLLOW PLACEHOLDERS ---- */

router.get('/:userId/followers', authenticate, (req, res) => {
  res.json({ success: true, data: { followers: [] } });
});

router.get('/:userId/following', authenticate, (req, res) => {
  res.json({ success: true, data: { following: [] } });
});

/* ---- PROFILE CORE (MUST BE LAST) ---- */

router.get('/:userId', authenticate, ProfileController.getProfile);
router.put('/', authenticate, ProfileController.updateProfile);

export default router;
