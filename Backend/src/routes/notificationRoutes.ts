import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications,markNotificationAsRead,markAllAsRead,searchNotifications,
 getNotificationStats, deleteNotification, bulkDeleteNotifications, 
//  createNewFollowerNotification
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
// router.post('/new-follower', createNewFollowerNotification);


export default router;