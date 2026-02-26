import pool from '../config/database';
import { UUID } from 'crypto';

export interface Message {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  message_type: 'TEXT' | 'IMAGE' | 'PDF' | 'SYSTEM';
  content: string | null;
  media_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  sender_name?: string;
  sender_photo?: string;
}

export interface ConversationWithUser {
  id: UUID;
  full_name: string;
  role: string;
  designation: string | null;
  organization: string | null;
  profile_photo_url: string | null;
  last_message: string | null;
  last_message_at: Date | null;
  unread_count: number;
}

export interface ConversationDetails {
  id: UUID;
  conversation_type: 'PRIVATE' | 'GROUP';
  title: string | null;
  description: string | null;
  avatar: Buffer | null;
  created_by: UUID | null;
  created_at: Date;
  members: {
    user_id: string;
    full_name: string;
    role: string;
    joined_at: Date;
    profile_photo_url: string | null;
  }[];
}

export class MessagesService {
  /**
   * Get all legal experts (lawyers, judges, professors)
   */
  async getExperts(currentUserId?: string): Promise<any[]> {
    const query = `
      SELECT DISTINCT ON (u.full_name)
        u.id, 
        u.full_name, 
        u.role, 
        u.designation,
        u.organization,
        u.area_of_interest,
        u.profile_photo_url,
        u.experience_years,
        u.bio
      FROM users u
      ${currentUserId ? `
      LEFT JOIN conversation_members cm ON cm.user_id = u.id
      LEFT JOIN conversation_members cm_me ON cm.conversation_id = cm_me.conversation_id AND cm_me.user_id = $1
      ` : ''}
      WHERE u.role IN ('LAWYER', 'ADVOCATE', 'JUDGE', 'LEGAL_PROFESSIONAL')
        AND u.is_active = true
      ORDER BY 
        u.full_name,
        ${currentUserId ? '(cm_me.user_id IS NOT NULL) DESC,' : ''}
        u.experience_years DESC
    `;

    const result = await pool.query(query, currentUserId ? [currentUserId] : []);
    return result.rows;
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<any[]> {
    const query = `
      WITH user_conversations AS (
        SELECT cm.conversation_id, cm.last_read_at
        FROM conversation_members cm
        WHERE cm.user_id = $1 AND COALESCE(cm.is_left, false) = false
      ),
      latest_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          m.content,
          m.created_at,
          m.sender_id
        FROM messages m
        INNER JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        WHERE m.is_deleted = false
        ORDER BY m.conversation_id, m.created_at DESC
      ),
      unread_counts AS (
        SELECT 
          m.conversation_id,
          COUNT(*) as unread_count
        FROM messages m
        INNER JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        WHERE m.is_deleted = false
          AND m.sender_id != $1
          AND (uc.last_read_at IS NULL OR m.created_at > uc.last_read_at)
        GROUP BY m.conversation_id
      ),
      other_members AS (
        -- For PRIVATE chats, get the other user info (ensure only one row per conv)
        SELECT DISTINCT ON (cm.conversation_id)
          cm.conversation_id,
          u.id as user_id,
          u.full_name,
          u.profile_photo_url,
          u.role,
          u.designation,
          u.organization
        FROM conversation_members cm
        JOIN users u ON u.id = cm.user_id
        JOIN conversations c ON c.id = cm.conversation_id
        WHERE c.conversation_type = 'PRIVATE'
          AND cm.user_id != $1
        ORDER BY cm.conversation_id, u.id
      ),
      base_list AS (
        SELECT 
          c.id,
          c.conversation_type,
          COALESCE(
            CASE 
              WHEN c.conversation_type = 'PRIVATE' THEN om.full_name 
              ELSE c.title 
            END,
            'Unnamed Conversation'
          ) as display_name,
          CASE 
            WHEN c.conversation_type = 'PRIVATE' THEN om.profile_photo_url 
            ELSE NULL 
          END as avatar_url,
          lm.content as last_message,
          lm.created_at as last_message_at,
          COALESCE(un.unread_count, 0) as unread_count,
          om.user_id as other_user_id
        FROM conversations c
        INNER JOIN user_conversations uc ON c.id = uc.conversation_id
        LEFT JOIN latest_messages lm ON c.id = lm.conversation_id
        LEFT JOIN unread_counts un ON c.id = un.conversation_id
        LEFT JOIN other_members om ON c.id = om.conversation_id
        WHERE COALESCE(c.is_active, true) = true
      )
      SELECT DISTINCT ON (display_name) *
      FROM base_list
      ORDER BY display_name, last_message_at DESC NULLS LAST
    `;

    const result = await pool.query(query, [userId]);
    // Re-sort by time after distinct-by-name
    return result.rows.sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return timeB - timeA;
    });
  }

  /**
   * Get total unread count across all conversations
   */
  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages m
      INNER JOIN conversation_members cm ON m.conversation_id = cm.conversation_id
      WHERE cm.user_id = $1
        AND m.sender_id != $1
        AND m.is_deleted = false
        AND cm.is_left = false
        AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get or create a private conversation between two users
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    const findQuery = `
      SELECT c.id
      FROM conversations c
      INNER JOIN conversation_members cm1 ON c.id = cm1.conversation_id
      INNER JOIN conversation_members cm2 ON c.id = cm2.conversation_id
      WHERE c.conversation_type = 'PRIVATE'
        AND cm1.user_id = $1
        AND cm2.user_id = $2
        AND c.is_active = true
      LIMIT 1
    `;

    const existing = await pool.query(findQuery, [userId1, userId2]);
    if (existing.rows.length > 0) return existing.rows[0].id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const conversationQuery = `
        INSERT INTO conversations (conversation_type)
        VALUES ('PRIVATE')
        RETURNING id
      `;
      const conversationResult = await client.query(conversationQuery);
      const conversationId = conversationResult.rows[0].id;

      const membersQuery = `
        INSERT INTO conversation_members (conversation_id, user_id, role)
        VALUES ($1, $2, 'MEMBER'), ($1, $3, 'MEMBER')
      `;
      await client.query(membersQuery, [conversationId, userId1, userId2]);

      await client.query('COMMIT');
      return conversationId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create a group conversation
   */
  async createGroup(creatorId: string, title: string, memberIds: string[]): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const conversationQuery = `
        INSERT INTO conversations (conversation_type, title, created_by)
        VALUES ('GROUP', $1, $2)
        RETURNING id
      `;
      const conversationResult = await client.query(conversationQuery, [title, creatorId]);
      const conversationId = conversationResult.rows[0].id;

      // Add creator as OWNER
      await client.query(`
        INSERT INTO conversation_members (conversation_id, user_id, role)
        VALUES ($1, $2, 'OWNER')
      `, [conversationId, creatorId]);

      // Add other members
      const filteredMemberIds = memberIds.filter(id => id !== creatorId);
      if (filteredMemberIds.length > 0) {
        for (const memberId of filteredMemberIds) {
          await client.query(`
            INSERT INTO conversation_members (conversation_id, user_id, role)
            VALUES ($1, $2, 'MEMBER')
          `, [conversationId, memberId]);
        }
      }

      await client.query('COMMIT');
      return conversationId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(conversationId: string, page = 1, limit = 20): Promise<Message[]> {
    const offset = (page - 1) * limit;
    const query = `
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.profile_photo_url as sender_photo,
        u.role as sender_role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [conversationId, limit, offset]);
    return result.rows.reverse(); // Return in chronological order for UI
  }

  /**
   * Get conversation details and members
   */
  async getConversationDetails(conversationId: string, userId: string): Promise<ConversationDetails | null> {
    const convQuery = `
      SELECT 
        c.*,
        COALESCE(
          CASE 
            WHEN c.conversation_type = 'PRIVATE' THEN (
              SELECT u.full_name FROM conversation_members cm
              JOIN users u ON u.id = cm.user_id
              WHERE cm.conversation_id = c.id AND cm.user_id != $2
              LIMIT 1
            )
            ELSE c.title 
          END,
          'Unnamed Conversation'
        ) as display_name,
        CASE 
          WHEN c.conversation_type = 'PRIVATE' THEN (
            SELECT u.profile_photo_url FROM conversation_members cm
            JOIN users u ON u.id = cm.user_id
            WHERE cm.conversation_id = c.id AND cm.user_id != $2
            LIMIT 1
          )
          ELSE NULL 
        END as avatar_url
      FROM conversations c 
      WHERE c.id = $1 AND c.is_active = true
    `;
    const convResult = await pool.query(convQuery, [conversationId, userId]);
    if (convResult.rows.length === 0) return null;

    const membersQuery = `
      SELECT cm.user_id, u.full_name, cm.role, cm.joined_at, u.profile_photo_url
      FROM conversation_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.conversation_id = $1 AND cm.is_left = false
    `;
    const membersResult = await pool.query(membersQuery, [conversationId]);

    const conversation = convResult.rows[0];
    return {
      ...conversation,
      members: membersResult.rows
    };
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: string, conversationId: string, content: string, messageType: string = 'TEXT'): Promise<Message> {
    const query = `
      INSERT INTO messages (conversation_id, sender_id, message_type, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [conversationId, senderId, messageType, content]);
    return result.rows[0];
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, userId: string, newContent: string): Promise<Message> {
    const query = `
      UPDATE messages
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND sender_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [newContent, messageId, userId]);
    if (result.rows.length === 0) throw new Error('Message not found or unauthorized');
    return result.rows[0];
  }

  /**
   * Soft delete a message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const query = `
      UPDATE messages
      SET is_deleted = true, deleted_by = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND (sender_id = $1 OR EXISTS (
        SELECT 1 FROM conversation_members 
        WHERE conversation_id = messages.conversation_id 
        AND user_id = $1 AND role IN ('ADMIN', 'OWNER')
      ))
    `;
    await pool.query(query, [userId, messageId]);
  }

  /**
   * Soft delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const query = `
      UPDATE conversations
      SET is_active = false
      WHERE id = $1 AND (created_by = $2 OR EXISTS (
        SELECT 1 FROM conversation_members 
        WHERE conversation_id = conversations.id 
        AND user_id = $2 AND role IN ('ADMIN', 'OWNER')
      ))
    `;
    await pool.query(query, [conversationId, userId]);
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(userId: string, conversationId: string): Promise<void> {
    await pool.query(`
      UPDATE conversation_members
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, userId]);
  }

  /**
   * Mark specific message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    await pool.query(`
      INSERT INTO message_reads (message_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (message_id, user_id) DO NOTHING
    `, [messageId, userId]);
  }

  /**
   * Add a member to a group
   */
  async addMember(conversationId: string, userId: string, role: string = 'MEMBER'): Promise<void> {
    await pool.query(`
      INSERT INTO conversation_members (conversation_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (conversation_id, user_id) 
      DO UPDATE SET is_left = false, joined_at = CURRENT_TIMESTAMP, role = EXCLUDED.role
    `, [conversationId, userId, role]);
  }

  /**
   * Remove a member from a group (by admin/owner)
   */
  async removeMember(conversationId: string, userId: string): Promise<void> {
    await pool.query(`
      UPDATE conversation_members
      SET is_left = true, left_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, userId]);
  }

  /**
   * User leaves a group
   */
  async leaveGroup(conversationId: string, userId: string): Promise<void> {
    await pool.query(`
      UPDATE conversation_members
      SET is_left = true, left_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, userId]);
  }

  /**
   * Change a member's role
   */
  async changeRole(conversationId: string, userId: string, newRole: string): Promise<void> {
    await pool.query(`
      UPDATE conversation_members
      SET role = $1
      WHERE conversation_id = $2 AND user_id = $3
    `, [newRole, conversationId, userId]);
  }

  /**
   * Check user role in group
   */
  async getUserRole(userId: string, conversationId: string): Promise<string | null> {
    const result = await pool.query(`
      SELECT role FROM conversation_members 
      WHERE conversation_id = $1 AND user_id = $2 AND is_left = false
    `, [conversationId, userId]);
    return result.rows.length > 0 ? result.rows[0].role : null;
  }

  /**
   * Send a media message (Image/PDF)
   */
  async sendMedia(
    senderId: string,
    conversationId: string,
    content: string | null,
    messageType: 'IMAGE' | 'PDF',
    mediaBuffer: Buffer,
    mimeType: string,
    fileName: string,
    fileSize: number
  ): Promise<Message> {
    const query = `
      INSERT INTO messages (
        conversation_id, sender_id, message_type, content, 
        media_data, media_mime_type, file_name, file_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      conversationId, senderId, messageType, content,
      mediaBuffer, mimeType, fileName, fileSize
    ]);
    return result.rows[0];
  }

  /**
   * Get media data for a message
   */
  async getMedia(messageId: string): Promise<any> {
    const query = `
      SELECT media_data as data, media_mime_type as mime_type, file_name 
      FROM messages 
      WHERE id = $1 AND media_data IS NOT NULL
    `;
    const result = await pool.query(query, [messageId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Check if user is member of conversation
   */
  async isMember(userId: string, conversationId: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT 1 FROM conversation_members 
      WHERE conversation_id = $1 AND user_id = $2 AND is_left = false
    `, [conversationId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Get or create conversation with user (private utility)
   */
  async getConversationWithUser(userId: string, otherUserId: string): Promise<Message[]> {
    const conversationId = await this.getOrCreateConversation(userId, otherUserId);
    return this.getMessages(conversationId, 1, 50);
  }
}
