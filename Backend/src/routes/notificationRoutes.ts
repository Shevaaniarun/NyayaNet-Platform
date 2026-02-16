import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications,markNotificationAsRead,markAllAsRead,searchNotifications,
 getNotificationStats, deleteNotification, bulkDeleteNotifications, 
 createNewFollowerNotification, createPostLikeNotification,
 createDiscussionUpvoteNotification,
 createDiscussionReplyNotification,
 createConnectionRequestNotification,
 createPostCommentNotification
 } from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/",getNotifications);
router.get('/search', searchNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllAsRead);


router.get('/stats', getNotificationStats);
router.delete('/:notificationId', deleteNotification); 
router.post('/bulk-delete', bulkDeleteNotifications);
router.post('/new-follower', createNewFollowerNotification);
router.post('/post-like', createPostLikeNotification);
router.post('/discussion-reply', createDiscussionReplyNotification);     
router.post('/discussion-upvote', createDiscussionUpvoteNotification); 
router.post('/connection-request', createConnectionRequestNotification);
router.post('/post-comment', createPostCommentNotification);

 //14 15 16 17 18 
export default router;