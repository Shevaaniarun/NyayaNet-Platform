import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', authenticate, ProfileController.searchUserContent);
router.get('/bookmarks', authenticate, ProfileController.getBookmarks);
router.get('/:userId', ProfileController.getProfile);
router.get('/:userId/certifications', ProfileController.getCertifications);
router.get('/:userId/posts', ProfileController.getUserPosts);
router.get('/:userId/discussions', ProfileController.getUserDiscussions);

router.put('/', authenticate, ProfileController.updateProfile);
router.post('/photo', authenticate, ProfileController.uploadProfilePhoto);
router.post('/cover-photo', authenticate, ProfileController.uploadCoverPhoto);
router.post('/certifications', authenticate, ProfileController.addCertification);
router.delete('/certifications/:certificationId', authenticate, ProfileController.deleteCertification);

export default router;
