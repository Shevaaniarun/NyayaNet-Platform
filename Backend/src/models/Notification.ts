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

    if (row.data) {
      let parsedData = row.data;
      if (typeof row.data === "string") {
        try {
          parsedData = JSON.parse(row.data);
        } catch (e) {
          parsedData = null;
        }
      }

      if (parsedData && parsedData.userId) {
        try {
          const userQuery = `
          SELECT id, full_name as "userName", profile_photo_url as "profilePhoto"
          FROM users
          WHERE id = $1
        `;
          const userResult = await pool.query(userQuery, [parsedData.userId]);

          if (userResult.rows.length > 0) {
            formattedNotification.data = {
              userId: userResult.rows[0].id,
              userName: userResult.rows[0].userName,
            };
          }
        } catch (error) {
          console.error("Error fetching user data for notification:", error);
        }
      }
    }

    return formattedNotification;
  }

  static async getNotifications(
    userId: string,
    input: GetNotificationsInput
  ): Promise<GetNotificationsResult> {
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

    const queryParams = [...params, limit, offset];

    const notificationsQuery = `
    SELECT 
      n. id,
      n.notification_type as type,
      n. title,
      n.message,
      n.source_type,
      n.source_id,
      n.data::jsonb as data,
      n.is_read,
      n.created_at
    FROM notifications n
    WHERE ${conditions.join(" AND ")}
    ORDER BY n.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

    const notificationsResult = await pool.query(
      notificationsQuery,
      queryParams
    );

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

  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  static async searchNotifications(
    userId: string,
    input: SearchNotificationsInput
  ): Promise<NotificationResponse[]> {
    const { q, type, startDate, endDate } = input;

    let conditions = ["user_id = $1"];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (q) {
      conditions.push(
        `(title ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`
      );
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (type) {
      conditions.push(`notification_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const query = `
    SELECT 
      id,
      notification_type as type,
      title,
      message,
      source_type,
      source_id,
      data::jsonb as data,
      is_read,
      created_at
    FROM notifications
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT 50
  `;

    const result = await pool.query(query, params);
    return Promise.all(result.rows.map((row) => this.mapRowToResponse(row)));
  }

  static async getNotificationStats(userId: string): Promise<{
    totalNotifications: number;
    unreadCount: number;
    readCount: number;
    countByType: Record<string, number>;
    countByDay: Array<{ date: string; count: number }>;
  }> {
    const countQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_read = false) as unread,
      COUNT(*) FILTER (WHERE is_read = true) as read
    FROM notifications
    WHERE user_id = $1
  `;
    const countResult = await pool.query(countQuery, [userId]);

    const typeQuery = `
    SELECT 
      notification_type,
      COUNT(*) as count
    FROM notifications
    WHERE user_id = $1
    GROUP BY notification_type
    ORDER BY count DESC
  `;
    const typeResult = await pool.query(typeQuery, [userId]);

    const dayQuery = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM notifications
    WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
    const dayResult = await pool.query(dayQuery, [userId]);

    const countByType: Record<string, number> = {};
    typeResult.rows.forEach((row) => {
      countByType[row.notification_type] = parseInt(row.count);
    });

    const countByDay = dayResult.rows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      count: parseInt(row.count),
    }));

    return {
      totalNotifications: parseInt(countResult.rows[0].total),
      unreadCount: parseInt(countResult.rows[0].unread),
      readCount: parseInt(countResult.rows[0].read),
      countByType,
      countByDay,
    };
  }

  static async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<void> {
    const query = `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
  `;
    const result = await pool.query(query, [notificationId, userId]);

    if (result.rowCount === 0) {
      throw new Error("Notification not found or unauthorized");
    }
  }

  static async bulkDeleteNotifications(
    userId: string,
    notificationIds?: string[],
    deleteAllRead?: boolean,
    deleteAllBefore?: Date
  ): Promise<number> {
    let query = "DELETE FROM notifications WHERE user_id = $1";
    const params: any[] = [userId];
    let paramIndex = 2;

    if (notificationIds && notificationIds.length > 0) {
      query += ` AND id = ANY($${paramIndex}::uuid[])`;
      params.push(notificationIds);
      paramIndex++;
    } else if (deleteAllRead) {
      query += " AND is_read = true";
    } else if (deleteAllBefore) {
      query += ` AND created_at < $${paramIndex}`;
      params.push(deleteAllBefore);
      paramIndex++;
    }

    const result = await pool.query(query, params);
    return result.rowCount || 0;
  }

  // static async createNewFollowerNotification(
  //   receiverId: string,
  //   followerId: string,
  //   followerName: string
  // ): Promise<string> {
  //   const query = `
  //   INSERT INTO notifications (
  //     user_id,
  //     notification_type,
  //     title,
  //     message,
  //     source_type,
  //     source_id,
  //     data,
  //     is_read
  //   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  //   RETURNING id
  // `;

  //   const values = [
  //     receiverId,
  //     "NEW_FOLLOWER",
  //     "New Follower",
  //     `${followerName} started following you`,
  //     "USER",
  //     followerId,
  //     JSON.stringify({ userId: followerId }),
  //     false,
  //   ];

  //   const result = await pool.query(query, values);
  //   return result.rows[0].id;
  // }
}
