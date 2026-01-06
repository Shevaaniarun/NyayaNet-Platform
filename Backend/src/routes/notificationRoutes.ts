import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications,markNotificationAsRead,markAllAsRead } from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/",getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);
router.put('/read-all', markAllAsRead);

export default router;