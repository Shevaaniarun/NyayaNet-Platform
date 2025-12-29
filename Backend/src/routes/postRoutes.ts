import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/feed', PostController.getFeed);
router.get('/:postId', PostController.getPost);

// Protected routes (require authentication)
router.post('/', authenticate, PostController.createPost);
router.put('/:postId', authenticate, PostController.updatePost);
router.delete('/:postId', authenticate, PostController.deletePost);

export default router;
