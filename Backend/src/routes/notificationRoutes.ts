import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getNotifications, markNotificationAsRead, markAllAsRead, searchNotifications,
    getNotificationStats, deleteNotification, bulkDeleteNotifications,
    createNewFollowerNotification, createPostLikeNotification,
    createDiscussionUpvoteNotification,
    createDiscussionReplyNotification,
    createConnectionRequestNotification,
    createPostCommentNotification,
    //  createMessageReceivedNotification
} from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/", getNotifications as RequestHandler);
router.get('/search', searchNotifications as RequestHandler);
router.put('/:notificationId/read', markNotificationAsRead as RequestHandler);
router.put('/read-all', markAllAsRead as RequestHandler);


router.get('/stats', getNotificationStats as RequestHandler);
router.delete('/:notificationId', deleteNotification as RequestHandler);
router.post('/bulk-delete', bulkDeleteNotifications as RequestHandler);
router.post('/new-follower', createNewFollowerNotification as RequestHandler);
router.post('/post-like', createPostLikeNotification as RequestHandler);
router.post('/discussion-reply', createDiscussionReplyNotification as RequestHandler);
router.post('/discussion-upvote', createDiscussionUpvoteNotification as RequestHandler);
router.post('/connection-request', createConnectionRequestNotification as RequestHandler);
router.post('/post-comment', createPostCommentNotification as RequestHandler);
// router.post('/message-received', createMessageReceivedNotification);
//14
export default router;