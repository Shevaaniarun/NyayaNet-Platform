import pool from '../config/database';

export class UserBlockService {
    /**
     * Block a user
     */
    async blockUser(blockerId: string, blockedId: string): Promise<void> {
        await pool.query(`
      INSERT INTO user_blocks (blocker_id, blocked_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [blockerId, blockedId]);
    }

    /**
     * Unblock a user
     */
    async unblockUser(blockerId: string, blockedId: string): Promise<void> {
        await pool.query(`
      DELETE FROM user_blocks
      WHERE blocker_id = $1 AND blocked_id = $2
    `, [blockerId, blockedId]);
    }

    /**
     * Get blocked users for a user
     */
    async getBlockedUsers(userId: string): Promise<any[]> {
        const result = await pool.query(`
      SELECT u.id, u.full_name, u.profile_photo_url
      FROM user_blocks ub
      JOIN users u ON u.id = ub.blocked_id
      WHERE ub.blocker_id = $1
    `, [userId]);
        return result.rows;
    }

    /**
     * Check if communication is blocked between two users
     */
    async isBlocked(userA: string, userB: string): Promise<boolean> {
        const result = await pool.query(`
      SELECT 1 FROM user_blocks
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1)
    `, [userA, userB]);
        return result.rows.length > 0;
    }

    /**
     * Check if sender is blocked by any member of a conversation
     */
    async isBlockedInConversation(senderId: string, conversationId: string): Promise<boolean> {
        const result = await pool.query(`
      SELECT 1 
      FROM conversation_members cm
      JOIN user_blocks ub ON ub.blocker_id = cm.user_id
      WHERE cm.conversation_id = $1 
        AND ub.blocked_id = $2
        AND cm.is_left = false
    `, [conversationId, senderId]);
        return result.rows.length > 0;
    }
}
