import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationModel } from '../models/Notification';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?. id;
    console.log("Authenticated User ID:", userId);
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