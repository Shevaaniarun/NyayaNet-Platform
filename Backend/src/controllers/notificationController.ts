import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationModel } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?. id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { type, unread, page, limit } = req.query;
    const result = await NotificationModel.getNotifications(userId, {
      type: type as string | undefined,
      unread: unread === 'true',
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error:  any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req:  AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const success = await NotificationModel.markAsRead(notificationId, userId);

    if (! success) {
      return res. status(404).json({
        success: false,
        message:  'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};


export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updatedCount = await NotificationModel. markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      message:  'Failed to mark all notifications as read',
      error: error. message
    });
  }
};


export const searchNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { q, type, startDate, endDate } = req. query;

    const notifications = await NotificationModel.searchNotifications(userId, {
      q: q as string | undefined,
      type:  type as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (error: any) {
    console.error('Search notifications error:', error);
    return res.status(500).json({
      success: false,
      message:  'Failed to search notifications',
      error: error.message
    });
  }
};

export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?. id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const stats = await NotificationModel.getNotificationStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error:  any) {
    console.error('Get notification stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await NotificationModel.deleteNotification(userId, notificationId);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete notification error:', error);
    
    if (error.message === 'Notification not found or unauthorized') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};


export const bulkDeleteNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationIds, deleteAllRead, deleteAllBefore } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const deletedCount = await NotificationModel.bulkDeleteNotifications(
      userId,
      notificationIds,
      deleteAllRead,
      deleteAllBefore ?  new Date(deleteAllBefore) : undefined
    );

    return res.status(200).json({
      success: true,
      message: `${deletedCount} notification${deletedCount !== 1 ? 's' :  ''} deleted successfully`,
      data: {
        deletedCount
      }
    });
  } catch (error: any) {
    console.error('Bulk delete notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
      error: error. message
    });
  }
};


// export const createNewFollowerNotification = async (req: AuthRequest, res: Response) => {
//   try {
//     const { receiverId, followerId, followerName } = req.body;

//     if (! receiverId || !followerId || !followerName) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields:  receiverId, followerId, followerName'
//       });
//     }

//     const notificationId = await NotificationModel. createNewFollowerNotification(
//       receiverId,
//       followerId,
//       followerName
//     );

//     return res.status(201).json({
//       success: true,
//       message: 'New follower notification created',
//       data: {
//         notificationId
//       }
//     });
//   } catch (error: any) {
//     console.error('Create follower notification error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to create notification',
//       error: error.message
//     });
//   }
// };