import pool from '../config/database';

interface UpvoteResult {
  upvoted: boolean;
  count: number;
}

export class DiscussionUpvoteModel {
  // Toggle upvote on reply
  static async toggleUpvote(replyId: string, userId: string): Promise<UpvoteResult> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if already upvoted
      const checkQuery = 'SELECT 1 FROM discussion_upvotes WHERE reply_id = $1 AND user_id = $2';
      const checkResult = await client.query(checkQuery, [replyId, userId]);
      
      if (checkResult.rows.length > 0) {
        // Remove upvote
        await client.query(
          'DELETE FROM discussion_upvotes WHERE reply_id = $1 AND user_id = $2',
          [replyId, userId]
        );
        
        await client.query(
          'UPDATE discussion_replies SET upvote_count = upvote_count - 1 WHERE id = $1',
          [replyId]
        );
        
        await client.query('COMMIT');
        
        // Get new count
        const countResult = await client.query(
          'SELECT upvote_count FROM discussion_replies WHERE id = $1',
          [replyId]
        );
        
        return {
          upvoted: false,
          count: parseInt(countResult.rows[0].upvote_count)
        };
      } else {
        // Add upvote
        await client.query(
          'INSERT INTO discussion_upvotes (reply_id, user_id) VALUES ($1, $2)',
          [replyId, userId]
        );
        
        await client.query(
          'UPDATE discussion_replies SET upvote_count = upvote_count + 1 WHERE id = $1',
          [replyId]
        );
        
        await client.query('COMMIT');
        
        // Get new count
        const countResult = await client.query(
          'SELECT upvote_count FROM discussion_replies WHERE id = $1',
          [replyId]
        );
        
        return {
          upvoted: true,
          count: parseInt(countResult.rows[0].upvote_count)
        };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Check if user has upvoted
  static async hasUpvoted(replyId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM discussion_upvotes WHERE reply_id = $1 AND user_id = $2',
      [replyId, userId]
    );
    return result.rows.length > 0;
  }
}