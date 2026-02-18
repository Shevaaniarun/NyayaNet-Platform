import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { UploadController, upload, uploadCertificate } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Middleware to set upload type
const setUploadType = (type: string) => (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadType = type;
    next();
};

// Profile photo upload
router.post(
    '/profile-photo',
    authenticate,
    setUploadType('profile'),
    upload.single('photo'),
    UploadController.uploadProfilePhoto as RequestHandler
);

// Cover photo upload
router.post(
    '/cover-photo',
    authenticate,
    setUploadType('cover'),
    upload.single('photo'),
    UploadController.uploadCoverPhoto as RequestHandler
);

// Certificate file upload
router.post(
    '/certificate',
    authenticate,
    uploadCertificate.single('certificate'),
    UploadController.uploadCertificateFile as RequestHandler
);

export default router;

