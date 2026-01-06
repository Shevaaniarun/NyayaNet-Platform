import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications,markNotificationAsRead } from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/",getNotifications);
router.put('/:notificationId/read', markNotificationAsRead);

export default router;