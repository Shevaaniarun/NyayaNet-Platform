import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { UserModel } from '../models/User';

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../../uploads');
const profilePhotosDir = path.join(uploadsDir, 'profile-photos');
const coverPhotosDir = path.join(uploadsDir, 'cover-photos');
const certificatesDir = path.join(uploadsDir, 'certificates');

[uploadsDir, profilePhotosDir, coverPhotosDir, certificatesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = (req as any).uploadType || 'profile-photos';
        const destDir = type === 'cover' ? coverPhotosDir : profilePhotosDir;
        cb(null, destDir);
    },
    filename: (req, file, cb) => {
        const userId = (req as AuthRequest).user?.id || 'unknown';
        const ext = path.extname(file.originalname);
        const filename = `${userId}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Certificate-specific storage
const certificateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, certificatesDir);
    },
    filename: (req, file, cb) => {
        const userId = (req as AuthRequest).user?.id || 'unknown';
        const ext = path.extname(file.originalname);
        const filename = `cert-${userId}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const certificateFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed for certificates.'));
    }
};

export const uploadCertificate = multer({
    storage: certificateStorage,
    fileFilter: certificateFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for certificates
    }
});

export class UploadController {
    static async uploadProfilePhoto(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Generate URL for the uploaded file
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            const photoUrl = `${baseUrl}/uploads/profile-photos/${req.file.filename}`;

            // Update user's profile photo URL in database
            const success = await UserModel.updateProfilePhoto(userId, photoUrl);

            if (!success) {
                // Delete the uploaded file if DB update fails
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.json({
                success: true,
                message: 'Profile photo uploaded successfully',
                data: { profilePhotoUrl: photoUrl }
            });
        } catch (error: any) {
            // Clean up uploaded file on error
            if (req.file) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(500).json({ success: false, message: 'Error uploading photo', error: error.message });
        }
    }

    static async uploadCoverPhoto(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Generate URL for the uploaded file
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            const coverPhotoUrl = `${baseUrl}/uploads/cover-photos/${req.file.filename}`;

            // Update user's cover photo URL in database
            const success = await UserModel.updateCoverPhoto(userId, coverPhotoUrl);

            if (!success) {
                // Delete the uploaded file if DB update fails
                fs.unlinkSync(req.file.path);
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            return res.json({
                success: true,
                message: 'Cover photo uploaded successfully',
                data: { coverPhotoUrl }
            });
        } catch (error: any) {
            // Clean up uploaded file on error
            if (req.file) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(500).json({ success: false, message: 'Error uploading cover', error: error.message });
        }
    }

    static async uploadCertificateFile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Generate URL for the uploaded file
            const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            const certificateUrl = `${baseUrl}/uploads/certificates/${req.file.filename}`;
            const fileType = req.file.mimetype === 'application/pdf' ? 'PDF' : 'IMAGE';

            return res.json({
                success: true,
                message: 'Certificate uploaded successfully',
                data: { certificateUrl, fileType, originalName: req.file.originalname }
            });
        } catch (error: any) {
            // Clean up uploaded file on error
            if (req.file) {
                try { fs.unlinkSync(req.file.path); } catch { }
            }
            return res.status(500).json({ success: false, message: 'Error uploading certificate', error: error.message });
        }
    }
}
