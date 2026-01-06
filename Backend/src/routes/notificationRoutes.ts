import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications,markNotificationAsRead,markAllAsRead,searchNotifications } from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/",getNotifications);
router.get('/search', searchNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllAsRead);

export default router;