/**
 * Messages Service - Business logic for messaging
 */

import pool from '../config/database';

export class MessagesService {
  /**
   * Get all legal experts (lawyers, judges, professors)
   */
  async getExperts() {
    const query = `
      SELECT 
        id, 
        full_name, 
        email, 
        role, 
        designation,
        organization,
        area_of_interest,
        profile_photo_url,
        experience_years
      FROM users
      WHERE role IN ('LAWYER', 'ADVOCATE', 'JUDGE', 'LEGAL_PROFESSIONAL')
        AND is_active = true
      ORDER BY role, full_name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string) {
    const query = `
      WITH latest_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END
        )
          id,
          sender_id,
          recipient_id,
          message,
          is_read,
          created_at,
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END as other_user_id
        FROM user_messages
        WHERE sender_id = $1 OR recipient_id = $1
        ORDER BY 
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END,
          created_at DESC
      )
      SELECT 
        lm.*,
        u.full_name,
        u.role,
        u.designation,
        u.profile_photo_url,
        (SELECT COUNT(*) FROM user_messages 
         WHERE recipient_id = $1 
           AND sender_id = lm.other_user_id 
           AND is_read = false) as unread_count
      FROM latest_messages lm
      JOIN users u ON u.id = lm.other_user_id
      ORDER BY lm.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get all messages between two users
   */
  async getConversationWithUser(userId: string, otherUserId: string) {
    const query = `
      SELECT 
        m.*,
        sender.full_name as sender_name,
        sender.profile_photo_url as sender_photo,
        recipient.full_name as recipient_name,
        recipient.profile_photo_url as recipient_photo
      FROM user_messages m
      JOIN users sender ON sender.id = m.sender_id
      JOIN users recipient ON recipient.id = m.recipient_id
      WHERE 
        (m.sender_id = $1 AND m.recipient_id = $2)
        OR (m.sender_id = $2 AND m.recipient_id = $1)
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(query, [userId, otherUserId]);
    
    // Mark messages as read
    await this.markConversationAsRead(userId, otherUserId);
    
    return result.rows;
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: string, recipientId: string, message: string) {
    const query = `
      INSERT INTO user_messages (sender_id, recipient_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [senderId, recipientId, message]);
    return result.rows[0];
  }

  /**
   * Mark a specific message as read
   */
  async markAsRead(messageId: string, userId: string) {
    const query = `
      UPDATE user_messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND recipient_id = $2
    `;
    
    await pool.query(query, [messageId, userId]);
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(userId: string, otherUserId: string) {
    const query = `
      UPDATE user_messages
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false
    `;
    
    await pool.query(query, [userId, otherUserId]);
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string) {
    const query = `
      SELECT COUNT(*) as count
      FROM user_messages
      WHERE recipient_id = $1 AND is_read = false
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}
