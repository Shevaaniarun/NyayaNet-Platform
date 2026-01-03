import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Routes
router.post('/upload', authenticate, upload.array('files', 5), PostController.uploadFiles);
router.get('/feed', optionalAuthenticate, PostController.getFeed);
router.get('/all', optionalAuthenticate, PostController.getPosts); // New route for filtered posts
router.get('/:postId', optionalAuthenticate, PostController.getPost);
router.get('/:postId/comments', PostController.getComments);

// Protected routes (require authentication)
router.post('/', authenticate, PostController.createPost);
router.put('/:postId', authenticate, PostController.updatePost);
router.delete('/:postId', authenticate, PostController.deletePost);
router.post('/:postId/like', authenticate, PostController.likePost);
router.post('/:postId/save', authenticate, PostController.savePost);
router.post('/:postId/comments', authenticate, PostController.createComment);

export default router;
