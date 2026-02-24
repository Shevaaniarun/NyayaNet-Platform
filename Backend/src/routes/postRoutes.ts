import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Media serving endpoint — serves binary from DB (no auth required for viewing)
router.get('/media/:mediaId', PostController.getMedia);

// Upload files (returns media data for subsequent post creation)
router.post('/upload', authenticate, upload.array('files', 5), PostController.uploadFiles);

// Create post with media in a single request (multipart form)
router.post('/with-media', authenticate, upload.array('files', 5), PostController.createPostWithMedia);

// Feed & listing
router.get('/feed', optionalAuthenticate, PostController.getFeed);
router.get('/all', optionalAuthenticate, PostController.getPosts);
router.get('/:postId', optionalAuthenticate, PostController.getPost);

// Protected routes (require authentication)
router.post('/', authenticate, PostController.createPost);
router.put('/:postId', authenticate, PostController.updatePost);
router.delete('/:postId', authenticate, PostController.deletePost);
router.post('/:postId/like', authenticate, PostController.likePost);
router.post('/:postId/save', authenticate, PostController.savePost);
router.post('/:postId/comments', authenticate, PostController.createComment);
router.put('/comments/:commentId', authenticate, PostController.updateComment);
router.delete('/comments/:commentId', authenticate, PostController.deleteComment);
router.get('/:postId/comments', PostController.getComments);

export default router;
