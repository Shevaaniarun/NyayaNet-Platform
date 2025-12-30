import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected Routes
router.use(authenticate);

router.post('/', PostController.createPost);
router.get('/feed', PostController.getFeed);
router.get('/:id', PostController.getPostById);
router.delete('/:id', PostController.deletePost);

export default router;
