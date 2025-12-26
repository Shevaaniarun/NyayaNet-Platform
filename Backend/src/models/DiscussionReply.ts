import pool from '../config/database';
import { DiscussionReply, CreateReplyInput } from '../types/discussionTypes';

export class DiscussionReplyModel {
  // Create a new reply
  static async create(replyData: CreateReplyInput, discussionId: string, userId: string): Promise<DiscussionReply> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO discussion_replies (
          discussion_id, user_id, content, parent_reply_id
        ) VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      
      const values = [
        discussionId,
        userId,
        replyData.content,
        replyData.parentReplyId || null
      ];
      
      const result = await client.query(query, values);
      const reply = result.rows[0];
      
      // Update discussion reply count and last activity
      await client.query(
        'UPDATE discussions SET reply_count = reply_count + 1, last_activity_at = CURRENT_TIMESTAMP WHERE id = $1',
        [discussionId]
      );
      
      // If it's a reply to another reply, increment reply count
      if (replyData.parentReplyId) {
        await client.query(
          'UPDATE discussion_replies SET reply_count = reply_count + 1 WHERE id = $1',
          [replyData.parentReplyId]
        );
      }
      
      await client.query('COMMIT');
      return reply;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get replies for a discussion
  static async findByDiscussionId(discussionId: string, userId?: string): Promise<any[]> {
    const query = `
      WITH RECURSIVE reply_tree AS (
        -- Base case: top-level replies
        SELECT 
          dr.*,
          u.full_name as author_name,
          u.role as author_role,
          u.profile_photo_url as author_photo,
          1 as depth,
          ARRAY[dr.created_at] as path,
          ${userId ? `EXISTS(SELECT 1 FROM discussion_upvotes du WHERE du.reply_id = dr.id AND du.user_id = $2) as has_upvoted` : 'false as has_upvoted'}
        FROM discussion_replies dr
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.discussion_id = $1 AND dr.parent_reply_id IS NULL AND dr.is_deleted = false
        
        UNION ALL
        
        -- Recursive case: nested replies
        SELECT 
          dr.*,
          u.full_name as author_name,
          u.role as author_role,
          u.profile_photo_url as author_photo,
          rt.depth + 1 as depth,
          rt.path || dr.created_at as path,
          ${userId ? `EXISTS(SELECT 1 FROM discussion_upvotes du WHERE du.reply_id = dr.id AND du.user_id = $2) as has_upvoted` : 'false as has_upvoted'}
        FROM discussion_replies dr
        JOIN reply_tree rt ON dr.parent_reply_id = rt.id
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.is_deleted = false
      )
      SELECT * FROM reply_tree
      ORDER BY path;
    `;
    
    const result = await pool.query(query, [discussionId, userId || null]);
    return result.rows;
  }

  // Get reply by ID
  static async findById(id: string): Promise<DiscussionReply | null> {
    const result = await pool.query(
      'SELECT * FROM discussion_replies WHERE id = $1 AND is_deleted = false',
      [id]
    );
    return result.rows[0] || null;
  }

  // Update reply
  static async update(id: string, content: string, userId: string): Promise<DiscussionReply | null> {
    const query = `
      UPDATE discussion_replies 
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    
    const result = await pool.query(query, [content, id, userId]);
    return result.rows[0] || null;
  }

  // Delete reply (soft delete)
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE discussion_replies 
       SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Increment reply count (for nested replies)
  static async incrementReplyCount(parentReplyId: string): Promise<void> {
    await pool.query(
      'UPDATE discussion_replies SET reply_count = reply_count + 1 WHERE id = $1',
      [parentReplyId]
    );
  }
}