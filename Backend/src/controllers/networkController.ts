// [file name]: networkController.ts
import { Request, Response } from 'express';
import { NetworkModel } from '../models/Network';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class NetworkController {
  // ================== FOLLOW METHODS ==================
  
  static async sendFollowRequest(req: AuthRequest, res: Response) {
    try {
      const followerId = req.user?.id;
      const { targetUserId } = req.params;
      
      if (!followerId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const result = await NetworkModel.sendFollowRequest(followerId, targetUserId);
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }
      
      return res.json({
        success: true,
        message: result.message,
        data: { requestId: result.requestId }
      });
    } catch (error: any) {
      console.error('sendFollowRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error sending follow request', error: error.message });
    }
  }

  static async unfollowUser(req: AuthRequest, res: Response) {
    try {
      const followerId = req.user?.id;
      const { targetUserId } = req.params;
      
      if (!followerId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const success = await NetworkModel.unfollowUser(followerId, targetUserId);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Follow relationship not found' });
      }
      
      return res.json({
        success: true,
        message: 'Unfollowed successfully'
      });
    } catch (error: any) {
      console.error('unfollowUser error:', error.message);
      return res.status(500).json({ success: false, message: 'Error unfollowing user', error: error.message });
    }
  }

  // ================== REQUEST HANDLING ==================

  static async acceptFollowRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const result = await NetworkModel.acceptFollowRequest(requestId, userId);
      
      if (!result.success) {
        return res.status(404).json({ success: false, message: result.message });
      }
      
      return res.json({
        success: true,
        message: 'Follow request accepted'
      });
    } catch (error: any) {
      console.error('acceptFollowRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error accepting follow request', error: error.message });
    }
  }

  static async rejectFollowRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const success = await NetworkModel.rejectFollowRequest(requestId, userId);
      
      return res.json({
        success: true,
        message: success ? 'Follow request rejected' : 'Request not found or already processed'
      });
    } catch (error: any) {
      console.error('rejectFollowRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error rejecting follow request', error: error.message });
    }
  }

  static async cancelFollowRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const success = await NetworkModel.cancelFollowRequest(requestId, userId);
      
      return res.json({
        success: true,
        message: success ? 'Follow request cancelled' : 'Request not found or already processed'
      });
    } catch (error: any) {
      console.error('cancelFollowRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error cancelling follow request', error: error.message });
    }
  }

  // ================== GET METHODS ==================

  static async getFollowStatus(req: AuthRequest, res: Response) {
    try {
      const requesterId = req.user?.id;
      const { targetUserId } = req.params;
      
      if (!requesterId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const status = await NetworkModel.getFollowStatus(requesterId, targetUserId);
      
      return res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('getFollowStatus error:', error.message);
      return res.status(500).json({ success: false, message: 'Error getting follow status', error: error.message });
    }
  }

  static async getFollowRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const requests = await NetworkModel.getFollowRequests(userId);
      
      return res.json({
        success: true,
        data: requests
      });
    } catch (error: any) {
      console.error('getFollowRequests error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching follow requests', error: error.message });
    }
  }

  static async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const requests = await NetworkModel.getPendingRequests(userId);
      
      return res.json({
        success: true,
        data: requests
      });
    } catch (error: any) {
      console.error('getPendingRequests error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching pending requests', error: error.message });
    }
  }

  static async getFollowers(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const followers = await NetworkModel.getFollowers(userId);
      
      return res.json({
        success: true,
        data: followers
      });
    } catch (error: any) {
      console.error('getFollowers error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching followers', error: error.message });
    }
  }

  static async getFollowing(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const following = await NetworkModel.getFollowing(userId);
      
      return res.json({
        success: true,
        data: following
      });
    } catch (error: any) {
      console.error('getFollowing error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching following', error: error.message });
    }
  }

  static async searchUsers(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const { q, page = '1', limit = '20' } = req.query;
      if (!q) return res.status(400).json({ success: false, message: 'Search query required' });

      const result = await NetworkModel.searchUsers(userId, q as string, parseInt(page as string), parseInt(limit as string));
      
      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('searchUsers error:', error.message);
      return res.status(500).json({ success: false, message: 'Error searching users', error: error.message });
    }
  }

  static async getNetworkStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const stats = await NetworkModel.getNetworkStats(userId);
      
      return res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('getNetworkStats error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching network stats', error: error.message });
    }
  }
}