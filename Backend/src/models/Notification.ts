import pool from "../config/database";

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  sourceType: string | null;
  sourceId: string | null;
  data?: {
    userId?: string;
    userName?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsInput {
  type?: string;
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface GetNotificationsResult {
  notifications: NotificationResponse[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface SearchNotificationsInput {
  q?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export class NotificationModel {
  private static async mapRowToResponse(
    row: any
  ): Promise<NotificationResponse> {
    let formattedNotification: NotificationResponse = {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      sourceType: row.source_type,
      sourceId: row.source_id,
      isRead: row.is_read,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString(),
    };

    if (row.data?.userId) {
      const userQuery = `
        SELECT id, full_name as "userName", profile_photo_url as "profilePhoto"
        FROM users
        WHERE id = $1
      `;
      const userResult = await pool.query(userQuery, [row.data.userId]);
      if (userResult.rows.length > 0) {
        formattedNotification.data = {
          userId: userResult.rows[0].id,
          userName: userResult.rows[0].userName,
        };
      }
    }

    return formattedNotification;
  }


  static async getNotifications(
    userId: string,input: GetNotificationsInput): Promise<GetNotificationsResult> {

    const { type, unread, page = 1, limit = 20 } = input;
    const offset = (page - 1) * limit;

    let conditions = ["user_id = $1"];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      conditions.push(`notification_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (unread === true) {
      conditions.push("is_read = false");
    }

    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications
      WHERE ${conditions.join(" AND ")}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const unreadQuery = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const unreadResult = await pool.query(unreadQuery, [userId]);
    const unreadCount = parseInt(unreadResult.rows[0].count);

    params.push(limit, offset);
    const notificationsQuery = `
      SELECT 
        n.id,
        n.notification_type as type,
        n.title,
        n.message,
        n.source_type,
        n.source_id,
        n.data,
        n.is_read,
        n.created_at
      FROM notifications n
      WHERE ${conditions.join(" AND ")}
      ORDER BY n.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const notificationsResult = await pool.query(notificationsQuery, params);
    console.log("Notifications Result:", notificationsResult.rows);
    const notifications = await Promise.all(
      notificationsResult.rows.map(async (notification) => {
        return this.mapRowToResponse(notification);
      })
    );

    const pages = Math.ceil(total / limit);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [notificationId, userId]);
    return result.rows. length > 0;
  }


  static async markAllAsRead(userId:  string): Promise<number> {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    return result. rowCount || 0;
  }
}
