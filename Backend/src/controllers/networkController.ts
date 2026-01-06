// [file name]: networkController.ts
import { Request, Response } from 'express';
import { NetworkModel } from '../models/Network';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class NetworkController {
  // ================== FOLLOW METHODS ==================
  
  static async followUser(req: AuthRequest, res: Response) {
    try {
      const followerId = req.user?.id;
      const { targetUserId } = req.params;
      
      if (!followerId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const result = await NetworkModel.followUser(followerId, targetUserId);
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }
      
      return res.json({
        success: true,
        message: result.message,
        data: { 
          followId: result.followId,
          followerCount: result.followerCount
        }
      });
    } catch (error: any) {
      console.error('followUser error:', error.message);
      return res.status(500).json({ success: false, message: 'Error following user', error: error.message });
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
      
      // Update follower count
      const followerCount = await NetworkModel.getFollowerCount(targetUserId);
      
      return res.json({
        success: true,
        message: 'Unfollowed successfully',
        data: { followerCount }
      });
    } catch (error: any) {
      console.error('unfollowUser error:', error.message);
      return res.status(500).json({ success: false, message: 'Error unfollowing user', error: error.message });
    }
  }

  // ================== CONNECTION REQUEST METHODS ==================

  static async sendConnectionRequest(req: AuthRequest, res: Response) {
    try {
      const requesterId = req.user?.id;
      const { targetUserId } = req.params;
      const { message } = req.body;
      
      if (!requesterId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const result = await NetworkModel.sendConnectionRequest(requesterId, targetUserId, message);
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.message });
      }
      
      return res.json({
        success: true,
        message: result.message,
        data: { requestId: result.requestId }
      });
    } catch (error: any) {
      console.error('sendConnectionRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error sending connection request', error: error.message });
    }
  }

  static async cancelConnectionRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const success = await NetworkModel.cancelConnectionRequest(requestId, userId);
      
      return res.json({
        success: true,
        message: success ? 'Connection request cancelled' : 'Request not found or already processed'
      });
    } catch (error: any) {
      console.error('cancelConnectionRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error cancelling connection request', error: error.message });
    }
  }

  static async acceptConnectionRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const result = await NetworkModel.acceptConnectionRequest(requestId, userId);
      
      if (!result.success) {
        return res.status(404).json({ success: false, message: result.message });
      }
      
      return res.json({
        success: true,
        message: 'Connection request accepted'
      });
    } catch (error: any) {
      console.error('acceptConnectionRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error accepting connection request', error: error.message });
    }
  }

  static async rejectConnectionRequest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!requestId) return res.status(400).json({ success: false, message: 'Request ID required' });

      const success = await NetworkModel.rejectConnectionRequest(requestId, userId);
      
      return res.json({
        success: true,
        message: success ? 'Connection request rejected' : 'Request not found or already processed'
      });
    } catch (error: any) {
      console.error('rejectConnectionRequest error:', error.message);
      return res.status(500).json({ success: false, message: 'Error rejecting connection request', error: error.message });
    }
  }

  // ================== GET METHODS ==================

  static async getConnectionStatus(req: AuthRequest, res: Response) {
    try {
      const requesterId = req.user?.id;
      const { targetUserId } = req.params;
      
      if (!requesterId) return res.status(401).json({ success: false, message: 'Authentication required' });
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID required' });

      const status = await NetworkModel.getConnectionStatus(requesterId, targetUserId);
      
      return res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('getConnectionStatus error:', error.message);
      return res.status(500).json({ success: false, message: 'Error getting connection status', error: error.message });
    }
  }

  static async getPendingConnectionRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const requests = await NetworkModel.getPendingConnectionRequests(userId);
      
      return res.json({
        success: true,
        data: requests
      });
    } catch (error: any) {
      console.error('getPendingConnectionRequests error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching pending connection requests', error: error.message });
    }
  }

  static async getSentConnectionRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const requests = await NetworkModel.getSentConnectionRequests(userId);
      
      return res.json({
        success: true,
        data: requests
      });
    } catch (error: any) {
      console.error('getSentConnectionRequests error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching sent connection requests', error: error.message });
    }
  }

  static async getConnections(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

      const connections = await NetworkModel.getConnections(userId);
      
      return res.json({
        success: true,
        data: connections
      });
    } catch (error: any) {
      console.error('getConnections error:', error.message);
      return res.status(500).json({ success: false, message: 'Error fetching connections', error: error.message });
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