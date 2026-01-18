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
        experience_years,
        bio
      FROM users
      WHERE role IN ('LAWYER', 'ADVOCATE', 'JUDGE', 'LEGAL_PROFESSIONAL')
        AND is_active = true
      ORDER BY 
        CASE role
          WHEN 'JUDGE' THEN 1
          WHEN 'LAWYER' THEN 2
          WHEN 'ADVOCATE' THEN 3
          WHEN 'LEGAL_PROFESSIONAL' THEN 4
          ELSE 5
        END,
        experience_years DESC,
        full_name
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get all conversations for a user
   */
  async getConversations(userId: string): Promise<ConversationWithUser[]> {
    const query = `
      WITH user_conversations AS (
        -- Get all conversations where user is a member
        SELECT DISTINCT cm.conversation_id
        FROM conversation_members cm
        WHERE cm.user_id = $1
      ),
      latest_messages AS (
        -- Get the latest message for each conversation
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          m.id as message_id,
          m.content,
          m.created_at,
          m.sender_id
        FROM messages m
        INNER JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        WHERE m.is_deleted = false
        ORDER BY m.conversation_id, m.created_at DESC
      ),
      unread_counts AS (
        -- Count unread messages for each conversation
        SELECT 
          m.conversation_id,
          COUNT(*) as unread_count
        FROM messages m
        INNER JOIN user_conversations uc ON m.conversation_id = uc.conversation_id
        LEFT JOIN conversation_members cm ON m.conversation_id = cm.conversation_id AND cm.user_id = $1
        WHERE m.is_deleted = false
          AND m.sender_id != $1
          AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
        GROUP BY m.conversation_id
      ),
      conversation_partners AS (
        -- Get the other user in each private conversation
        SELECT 
          cm.conversation_id,
          u.id as user_id,
          u.full_name,
          u.role,
          u.designation,
          u.organization,
          u.profile_photo_url,
          ROW_NUMBER() OVER (PARTITION BY cm.conversation_id ORDER BY cm.joined_at) as rn
        FROM conversation_members cm
        INNER JOIN users u ON u.id = cm.user_id
        INNER JOIN user_conversations uc ON cm.conversation_id = uc.conversation_id
        WHERE u.id != $1
          AND u.is_active = true
      )
      SELECT 
        cp.conversation_id as id,
        cp.user_id,
        cp.full_name,
        cp.role,
        cp.designation,
        cp.organization,
        cp.profile_photo_url,
        lm.content as last_message,
        lm.created_at as last_message_at,
        COALESCE(uc.unread_count, 0) as unread_count
      FROM conversation_partners cp
      LEFT JOIN latest_messages lm ON cp.conversation_id = lm.conversation_id
      LEFT JOIN unread_counts uc ON cp.conversation_id = uc.conversation_id
      WHERE cp.rn = 1  -- Only get the first partner (for private conversations)
      ORDER BY lm.created_at DESC NULLS LAST, cp.full_name
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    // First, try to find existing conversation
    const findQuery = `
      SELECT c.id
      FROM conversations c
      INNER JOIN conversation_members cm1 ON c.id = cm1.conversation_id
      INNER JOIN conversation_members cm2 ON c.id = cm2.conversation_id
      WHERE c.conversation_type = 'PRIVATE'
        AND cm1.user_id = $1
        AND cm2.user_id = $2
      LIMIT 1
    `;
    
    const existing = await pool.query(findQuery, [userId1, userId2]);
    
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    
    // Create new conversation
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create conversation
      const conversationQuery = `
        INSERT INTO conversations (conversation_type)
        VALUES ('PRIVATE')
        RETURNING id
      `;
      const conversationResult = await client.query(conversationQuery);
      const conversationId = conversationResult.rows[0].id;
      
      // Add both users as members
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
   * Get all messages between two users
   */
  async getConversationWithUser(userId: string, otherUserId: string): Promise<Message[]> {
    // Get or create conversation
    const conversationId = await this.getOrCreateConversation(userId, otherUserId);
    
    const query = `
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.profile_photo_url as sender_photo,
        u.role as sender_role
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
        AND m.is_deleted = false
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    
    // Update last read time
    await this.updateLastRead(userId, conversationId);
    
    return result.rows;
  }

  /**
   * Send a message
   */
  async sendMessage(senderId: string, recipientId: string, message: string): Promise<Message> {
    // Get or create conversation
    const conversationId = await this.getOrCreateConversation(senderId, recipientId);
    
    const query = `
      INSERT INTO messages (conversation_id, sender_id, message_type, content)
      VALUES ($1, $2, 'TEXT', $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [conversationId, senderId, message]);
    return result.rows[0];
  }

  /**
   * Mark a specific message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    // For individual message marking, we need to update conversation_members.last_read_at
    // when the user views the conversation
    const query = `
      UPDATE conversation_members cm
      SET last_read_at = CURRENT_TIMESTAMP
      FROM messages m
      WHERE cm.conversation_id = m.conversation_id
        AND cm.user_id = $2
        AND m.id = $1
    `;
    
    await pool.query(query, [messageId, userId]);
  }

  /**
   * Update last read time for a conversation
   */
  async updateLastRead(userId: string, conversationId: string): Promise<void> {
    const query = `
      UPDATE conversation_members
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `;
    
    await pool.query(query, [conversationId, userId]);
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM messages m
      INNER JOIN conversation_members cm ON m.conversation_id = cm.conversation_id
      WHERE cm.user_id = $1
        AND m.sender_id != $1
        AND m.is_deleted = false
        AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}