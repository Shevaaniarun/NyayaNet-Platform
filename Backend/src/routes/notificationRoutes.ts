import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getNotifications } from '../controllers/notificationController';
const router = Router();

router.use(authenticate)

router.get("/",getNotifications);

export default router;