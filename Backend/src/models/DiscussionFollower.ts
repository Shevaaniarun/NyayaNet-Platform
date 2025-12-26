import pool from '../config/database';

export class DiscussionFollowerModel {
  // Follow a discussion
  static async follow(discussionId: string, userId: string): Promise<boolean> {
    try {
      await pool.query(
        `INSERT INTO discussion_followers (discussion_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT (discussion_id, user_id) DO NOTHING`,
        [discussionId, userId]
      );
      
      // Update follower count
      await pool.query(
        'UPDATE discussions SET follower_count = follower_count + 1 WHERE id = $1',
        [discussionId]
      );
      
      return true;
    } catch (error) {
      console.error('Error following discussion:', error);
      return false;
    }
  }

  // Unfollow a discussion
  static async unfollow(discussionId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM discussion_followers WHERE discussion_id = $1 AND user_id = $2',
      [discussionId, userId]
    );
    
    if (result.rowCount && result.rowCount > 0) {
      // Update follower count
      await pool.query(
        'UPDATE discussions SET follower_count = follower_count - 1 WHERE id = $1',
        [discussionId]
      );
      return true;
    }
    
    return false;
  }

  // Check if user is following
  static async isFollowing(discussionId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM discussion_followers WHERE discussion_id = $1 AND user_id = $2',
      [discussionId, userId]
    );
    return result.rows.length > 0;
  }

  // Get follower count
  static async getFollowerCount(discussionId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM discussion_followers WHERE discussion_id = $1',
      [discussionId]
    );
    return parseInt(result.rows[0].count);
  }
}