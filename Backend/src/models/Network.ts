// [file name]: Network.ts
import pool from "../config/database";

export class NetworkModel {
  // ================== FOLLOW METHODS ==================
  
  static async sendFollowRequest(followerId: string, followingId: string) {
    if (followerId === followingId) {
      return { success: false, message: 'Cannot follow yourself' };
    }

    try {
      // Check if already following
      const existing = await pool.query(
        'SELECT id, status FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        if (row.status === 'ACCEPTED') {
          return { success: false, message: 'Already following this user' };
        } else if (row.status === 'PENDING') {
          return { success: false, message: 'Follow request already sent' };
        } else if (row.status === 'REJECTED') {
          // Update rejected request to pending
          await pool.query(
            'UPDATE user_follows SET status = $1, created_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['PENDING', row.id]
          );
          return { success: true, message: 'Follow request sent', requestId: row.id };
        }
      }

      // Create follow request with PENDING status
      const result = await pool.query(
        `INSERT INTO user_follows (follower_id, following_id, status) 
         VALUES ($1, $2, 'PENDING')
         RETURNING id`,
        [followerId, followingId]
      );

      return { 
        success: true, 
        message: 'Follow request sent',
        requestId: result.rows[0].id
      };
    } catch (error) {
      console.error('Error in sendFollowRequest:', error);
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followingId: string) {
    try {
      const result = await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2 RETURNING id',
        [followerId, followingId]
      );

      if (result.rowCount && result.rowCount > 0) {
        // Update follower count
        await pool.query(
          `UPDATE users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = $1`,
          [followingId]
        );

        // Update following count
        await pool.query(
          `UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1`,
          [followerId]
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      throw error;
    }
  }

  // ================== REQUEST HANDLING ==================
  
  static async acceptFollowRequest(requestId: string, receiverId: string) {
    try {
      // Get the follow request
      const requestResult = await pool.query(
        `SELECT follower_id, following_id FROM user_follows 
         WHERE id = $1 AND following_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      if (requestResult.rows.length === 0) {
        return { success: false, message: 'Follow request not found or already processed' };
      }

      const followerId = requestResult.rows[0].follower_id;

      // Update follow status to ACCEPTED
      await pool.query(
        `UPDATE user_follows 
         SET status = 'ACCEPTED'
         WHERE id = $1`,
        [requestId]
      );

      // Update follower count
      await pool.query(
        `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
        [receiverId]
      );

      // Update following count
      await pool.query(
        `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
        [followerId]
      );

      return { success: true, followerId };
    } catch (error) {
      console.error('Error in acceptFollowRequest:', error);
      throw error;
    }
  }

  static async rejectFollowRequest(requestId: string, receiverId: string) {
    try {
      const result = await pool.query(
        `UPDATE user_follows 
         SET status = 'REJECTED'
         WHERE id = $1 AND following_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in rejectFollowRequest:', error);
      throw error;
    }
  }

  static async cancelFollowRequest(requestId: string, requesterId: string) {
    try {
      const result = await pool.query(
        `DELETE FROM user_follows 
         WHERE id = $1 AND follower_id = $2 AND status = 'PENDING'`,
        [requestId, requesterId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in cancelFollowRequest:', error);
      throw error;
    }
  }

  // ================== GET METHODS ==================

  static async getFollowStatus(requesterId: string, targetUserId: string) {
    try {
      // Check if requester is following target
      const followingResult = await pool.query(
        `SELECT id, status FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2`,
        [requesterId, targetUserId]
      );

      // Check if target is following requester
      const followedByResult = await pool.query(
        `SELECT id, status FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2 AND status = 'ACCEPTED'`,
        [targetUserId, requesterId]
      );

      if (followingResult.rows.length > 0) {
        const row = followingResult.rows[0];
        if (row.status === 'ACCEPTED' && followedByResult.rows.length > 0) {
          return { status: 'MUTUAL', requestId: row.id };
        } else if (row.status === 'ACCEPTED') {
          return { status: 'FOLLOWING', requestId: row.id };
        } else if (row.status === 'PENDING') {
          return { status: 'PENDING', requestId: row.id };
        }
      }

      if (followedByResult.rows.length > 0) {
        return { status: 'FOLLOWED_BY' };
      }

      return { status: 'NONE' };
    } catch (error) {
      console.error('Error in getFollowStatus:', error);
      throw error;
    }
  }

  static async getFollowRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT uf.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization,
                u.role, u.location, u.experience_years, u.bio
         FROM user_follows uf
         JOIN users u ON uf.follower_id = u.id
         WHERE uf.following_id = $1 AND uf.status = 'PENDING'
         ORDER BY uf.created_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        followerId: row.follower_id,
        followingId: row.following_id,
        status: row.status,
        createdAt: row.created_at,
        user: {
          id: row.follower_id,
          fullName: row.full_name,
          profilePhotoUrl: row.profile_photo_url,
          designation: row.designation,
          organization: row.organization,
          role: row.role,
          location: row.location,
          experienceYears: row.experience_years,
          bio: row.bio
        }
      }));
    } catch (error) {
      console.error('Error in getFollowRequests:', error);
      throw error;
    }
  }

  static async getPendingRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT uf.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization,
                u.role, u.location
         FROM user_follows uf
         JOIN users u ON uf.following_id = u.id
         WHERE uf.follower_id = $1 AND uf.status = 'PENDING'
         ORDER BY uf.created_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        followerId: row.follower_id,
        followingId: row.following_id,
        status: row.status,
        createdAt: row.created_at,
        user: {
          id: row.following_id,
          fullName: row.full_name,
          profilePhotoUrl: row.profile_photo_url,
          designation: row.designation,
          organization: row.organization,
          role: row.role,
          location: row.location
        }
      }));
    } catch (error) {
      console.error('Error in getPendingRequests:', error);
      throw error;
    }
  }

  static async getFollowers(userId: string) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.designation, 
                u.organization, u.profile_photo_url, u.location, 
                u.experience_years, u.bio, u.follower_count, u.following_count,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM user_follows uf2 
                    WHERE uf2.follower_id = $1 AND uf2.following_id = u.id AND uf2.status = 'ACCEPTED'
                  ) THEN true
                  ELSE false
                END as is_following_back
         FROM users u
         JOIN user_follows uf ON u.id = uf.follower_id
         WHERE uf.following_id = $1 AND uf.status = 'ACCEPTED'
         ORDER BY u.full_name`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        designation: row.designation,
        organization: row.organization,
        profilePhotoUrl: row.profile_photo_url,
        location: row.location,
        experienceYears: row.experience_years,
        bio: row.bio,
        followerCount: row.follower_count,
        followingCount: row.following_count,
        isFollowingBack: row.is_following_back,
        isFollowedBy: true,
        connectionType: row.is_following_back ? 'mutual' : 'follower'
      }));
    } catch (error) {
      console.error('Error in getFollowers:', error);
      throw error;
    }
  }

  static async getFollowing(userId: string) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.designation, 
                u.organization, u.profile_photo_url, u.location, 
                u.experience_years, u.bio,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM user_follows uf2 
                    WHERE uf2.follower_id = u.id AND uf2.following_id = $1 AND uf2.status = 'ACCEPTED'
                  ) THEN true
                  ELSE false
                END as is_followed_by
         FROM users u
         JOIN user_follows uf ON u.id = uf.following_id
         WHERE uf.follower_id = $1 AND uf.status = 'ACCEPTED'
         ORDER BY u.full_name`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        designation: row.designation,
        organization: row.organization,
        profilePhotoUrl: row.profile_photo_url,
        location: row.location,
        experienceYears: row.experience_years,
        bio: row.bio,
        isFollowedBy: row.is_followed_by,
        connectionType: row.is_followed_by ? 'mutual' : 'following'
      }));
    } catch (error) {
      console.error('Error in getFollowing:', error);
      throw error;
    }
  }

  static async searchUsers(currentUserId: string, query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const searchQuery = `%${query}%`;

    try {
      const result = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.designation, 
                u.organization, u.profile_photo_url, u.location, 
                u.experience_years, u.bio, u.follower_count, u.following_count,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM user_follows uf 
                    WHERE uf.follower_id = $1 AND uf.following_id = u.id AND uf.status = 'ACCEPTED'
                  ) THEN true
                  ELSE false
                END as is_following,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM user_follows uf 
                    WHERE uf.follower_id = u.id AND uf.following_id = $1 AND uf.status = 'ACCEPTED'
                  ) THEN true
                  ELSE false
                END as is_follower,
                EXISTS (
                  SELECT 1 FROM user_follows uf 
                  WHERE uf.follower_id = $1 AND uf.following_id = u.id AND uf.status = 'PENDING'
                ) as has_pending_request
         FROM users u
         WHERE u.is_active = true 
           AND u.id != $1
           AND (u.full_name ILIKE $2 OR u.email ILIKE $2 OR u.designation ILIKE $2 OR u.organization ILIKE $2)
         ORDER BY 
           CASE 
             WHEN u.full_name ILIKE $2 THEN 1
             WHEN u.email ILIKE $2 THEN 2
             ELSE 3
           END,
           u.full_name
         LIMIT $3 OFFSET $4`,
        [currentUserId, searchQuery, limit, offset]
      );

      return {
        users: result.rows.map(row => ({
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          role: row.role,
          designation: row.designation,
          organization: row.organization,
          profilePhotoUrl: row.profile_photo_url,
          location: row.location,
          experienceYears: row.experience_years,
          bio: row.bio,
          followerCount: row.follower_count,
          followingCount: row.following_count,
          isFollowing: row.is_following,
          isFollower: row.is_follower,
          hasPendingRequest: row.has_pending_request
        }))
      };
    } catch (error) {
      console.error('Error in searchUsers:', error);
      throw error;
    }
  }

  static async getNetworkStats(userId: string) {
    try {
      const [
        followersResult,
        followingResult,
        requestsResult,
        pendingResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1 AND status = $2', [userId, 'ACCEPTED']),
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1 AND status = $2', [userId, 'ACCEPTED']),
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1 AND status = $2', [userId, 'PENDING']),
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1 AND status = $2', [userId, 'PENDING'])
      ]);

      return {
        followers: parseInt(followersResult.rows[0].count),
        following: parseInt(followingResult.rows[0].count),
        requests: parseInt(requestsResult.rows[0].count),
        pending: parseInt(pendingResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error in getNetworkStats:', error);
      throw error;
    }
  }
}