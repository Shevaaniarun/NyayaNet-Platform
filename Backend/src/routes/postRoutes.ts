import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', PostController.getFeed);
router.post('/', authenticate, PostController.createPost);
router.post('/:postId/like', authenticate, PostController.toggleLike);

export default router;
