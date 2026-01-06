// [file name]: profileController.ts
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { CertificationModel } from '../models/Certification';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class ProfileController {
  static async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      console.log('getProfile called with userId:', userId);
      const requesterId = (req as AuthRequest).user?.id;
      const profile = await UserModel.findById(userId, requesterId);
      console.log('getProfile result:', profile ? 'found' : 'not found');
      if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error('getProfile error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const profile = await UserModel.update(userId, req.body);
      if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, message: 'Profile updated', data: profile });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
    }
  }

  static async uploadProfilePhoto(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const { photoUrl, thumbnailUrl } = req.body;
      const success = await UserModel.updateProfilePhoto(userId, photoUrl, thumbnailUrl);
      if (!success) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, message: 'Profile photo updated', data: { profilePhotoUrl: photoUrl, thumbnailUrl } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error uploading photo', error: error.message });
    }
  }

  static async uploadCoverPhoto(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const { coverPhotoUrl } = req.body;
      const success = await UserModel.updateCoverPhoto(userId, coverPhotoUrl);
      if (!success) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, message: 'Cover photo updated', data: { coverPhotoUrl } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error uploading cover', error: error.message });
    }
  }

  static async getCertifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const certifications = await CertificationModel.findByUserId(userId);
      return res.json({ success: true, data: { certifications } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error fetching certifications', error: error.message });
    }
  }

  static async addCertification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const certification = await CertificationModel.create(userId, req.body);
      return res.status(201).json({ success: true, message: 'Certification added', data: { certification } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error adding certification', error: error.message });
    }
  }

  static async deleteCertification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const { certificationId } = req.params;
      const deleted = await CertificationModel.delete(certificationId, userId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Certification not found' });
      return res.json({ success: true, message: 'Certification deleted' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error deleting certification', error: error.message });
    }
  }

  static async getUserPosts(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '20', sort = 'newest' } = req.query;
      const result = await UserModel.getUserPosts(userId, parseInt(page as string), parseInt(limit as string), sort as string);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error fetching posts', error: error.message });
    }
  }

  static async getUserDiscussions(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '20' } = req.query;
      const result = await UserModel.getUserDiscussions(userId, parseInt(page as string), parseInt(limit as string));
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error fetching discussions', error: error.message });
    }
  }

  static async getBookmarks(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const { folder, type, page = '1', limit = '20' } = req.query;
      const result = await UserModel.getUserBookmarks(userId, folder as string, type as string, parseInt(page as string), parseInt(limit as string));
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error fetching bookmarks', error: error.message });
    }
  }

  static async searchUserContent(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      const { q, type } = req.query;
      if (!q) return res.status(400).json({ success: false, message: 'Search query required' });
      const result = await UserModel.searchUserContent(userId, q as string, type as string);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Error searching', error: error.message });
    }
  }
}