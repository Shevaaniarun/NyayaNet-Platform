// [file name]: Network.ts
import pool from "../config/database";

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestMessage?: string;
  requestedAt: Date;
  respondedAt?: Date;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
}

export interface UserConnection {
  id: string;
  fullName: string;
  email: string;
  role: string;
  designation?: string;
  organization?: string;
  profilePhotoUrl?: string;
  location?: string;
  experienceYears: number;
  isFollowing?: boolean;
  isFollower?: boolean;
  connectionStatus?: string;
}

export class NetworkModel {
  // ================== FOLLOW METHODS ==================
  
  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      return { success: false, message: 'Cannot follow yourself' };
    }

    try {
      // Check if already following
      const existing = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2 AND status = $3',
        [followerId, followingId, 'ACCEPTED']
      );

      if (existing.rows.length > 0) {
        return { success: false, message: 'Already following this user' };
      }

      // Check for pending request
      const pending = await pool.query(
        'SELECT id FROM connection_requests WHERE requester_id = $1 AND receiver_id = $2 AND status = $3',
        [followerId, followingId, 'PENDING']
      );

      if (pending.rows.length > 0) {
        return { success: false, message: 'Connection request already sent' };
      }

      // Create follow relationship directly (public follow)
      const result = await pool.query(
        `INSERT INTO user_follows (follower_id, following_id, status) 
         VALUES ($1, $2, 'ACCEPTED')
         RETURNING id`,
        [followerId, followingId]
      );

      // Update follower count
      await pool.query(
        `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
        [followingId]
      );

      // Update following count
      await pool.query(
        `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
        [followerId]
      );

      const followId = result.rows[0].id;
      const followerCount = await this.getFollowerCount(followingId);

      return { 
        success: true, 
        message: 'Successfully followed user',
        followId,
        followerCount
      };
    } catch (error) {
      console.error('Error in followUser:', error);
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

  // ================== CONNECTION REQUEST METHODS ==================
  
  static async sendConnectionRequest(requesterId: string, receiverId: string, message?: string) {
    if (requesterId === receiverId) {
      return { success: false, message: 'Cannot send connection request to yourself' };
    }

    try {
      // Check if request already exists
      const existing = await pool.query(
        `SELECT id FROM connection_requests 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requesterId, receiverId]
      );

      if (existing.rows.length > 0) {
        return { success: false, message: 'Request already sent' };
      }

      // Check if already connected (mutual follow)
      const connected = await pool.query(
        `SELECT 1 FROM user_follows uf1
         JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
         WHERE uf1.follower_id = $1 AND uf1.following_id = $2
           AND uf1.status = 'ACCEPTED' AND uf2.status = 'ACCEPTED'`,
        [requesterId, receiverId]
      );

      if (connected.rows.length > 0) {
        return { success: false, message: 'Already connected' };
      }

      // Create connection request
      const result = await pool.query(
        `INSERT INTO connection_requests (requester_id, receiver_id, request_message, status) 
         VALUES ($1, $2, $3, 'PENDING') 
         RETURNING id, requested_at`,
        [requesterId, receiverId, message || null]
      );

      return { 
        success: true, 
        message: 'Connection request sent',
        requestId: result.rows[0].id 
      };
    } catch (error) {
      console.error('Error in sendConnectionRequest:', error);
      throw error;
    }
  }

  static async cancelConnectionRequest(requestId: string, requesterId: string) {
    try {
      const result = await pool.query(
        `DELETE FROM connection_requests 
         WHERE id = $1 AND requester_id = $2 AND status = 'PENDING'`,
        [requestId, requesterId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in cancelConnectionRequest:', error);
      throw error;
    }
  }

  static async acceptConnectionRequest(requestId: string, receiverId: string) {
    try {
      // Get the connection request
      const requestResult = await pool.query(
        `SELECT requester_id FROM connection_requests 
         WHERE id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      if (requestResult.rows.length === 0) {
        return { success: false, message: 'Connection request not found or already processed' };
      }

      const requesterId = requestResult.rows[0].requester_id;

      // Update connection request status
      await pool.query(
        `UPDATE connection_requests 
         SET status = 'ACCEPTED', responded_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [requestId]
      );

      // Create mutual follow relationships
      // Receiver follows requester
      const existingFollow1 = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [receiverId, requesterId]
      );

      if (existingFollow1.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_follows (follower_id, following_id, status) 
           VALUES ($1, $2, 'ACCEPTED')`,
          [receiverId, requesterId]
        );

        // Update counts
        await pool.query(
          `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
          [requesterId]
        );
        await pool.query(
          `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
          [receiverId]
        );
      }

      // Requester follows receiver
      const existingFollow2 = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [requesterId, receiverId]
      );

      if (existingFollow2.rows.length === 0) {
        await pool.query(
          `INSERT INTO user_follows (follower_id, following_id, status) 
           VALUES ($1, $2, 'ACCEPTED')`,
          [requesterId, receiverId]
        );

        // Update counts
        await pool.query(
          `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
          [receiverId]
        );
        await pool.query(
          `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
          [requesterId]
        );
      }

      return { success: true, requesterId };
    } catch (error) {
      console.error('Error in acceptConnectionRequest:', error);
      throw error;
    }
  }

  static async rejectConnectionRequest(requestId: string, receiverId: string) {
    try {
      const result = await pool.query(
        `UPDATE connection_requests 
         SET status = 'REJECTED', responded_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in rejectConnectionRequest:', error);
      throw error;
    }
  }

  // ================== GET METHODS ==================

  static async getConnectionStatus(requesterId: string, targetUserId: string) {
    try {
      // Check if already connected (mutual follow)
      const connectedResult = await pool.query(
        `SELECT 1 FROM user_follows uf1
         JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
         WHERE uf1.follower_id = $1 AND uf1.following_id = $2
           AND uf1.status = 'ACCEPTED' AND uf2.status = 'ACCEPTED'`,
        [requesterId, targetUserId]
      );

      if (connectedResult.rows.length > 0) {
        return {
          status: 'CONNECTED',
          type: 'mutual'
        };
      }

      // Check if following (one-way)
      const followResult = await pool.query(
        `SELECT id FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2 AND status = 'ACCEPTED'`,
        [requesterId, targetUserId]
      );

      if (followResult.rows.length > 0) {
        return {
          status: 'FOLLOWING',
          type: 'one-way',
          followId: followResult.rows[0].id
        };
      }

      // Check if being followed (one-way)
      const followedResult = await pool.query(
        `SELECT id FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2 AND status = 'ACCEPTED'`,
        [targetUserId, requesterId]
      );

      if (followedResult.rows.length > 0) {
        return {
          status: 'FOLLOWED_BY',
          type: 'one-way',
          followId: followedResult.rows[0].id
        };
      }

      // Check for pending request
      const requestResult = await pool.query(
        `SELECT id, request_message FROM connection_requests 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requesterId, targetUserId]
      );

      if (requestResult.rows.length > 0) {
        return {
          status: 'REQUEST_SENT',
          type: 'pending',
          requestId: requestResult.rows[0].id,
          requestMessage: requestResult.rows[0].request_message
        };
      }

      // Check for pending request from them
      const incomingRequestResult = await pool.query(
        `SELECT id, request_message FROM connection_requests 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [targetUserId, requesterId]
      );

      if (incomingRequestResult.rows.length > 0) {
        return {
          status: 'REQUEST_RECEIVED',
          type: 'pending',
          requestId: incomingRequestResult.rows[0].id,
          requestMessage: incomingRequestResult.rows[0].request_message
        };
      }

      return { status: 'NONE', type: 'none' };
    } catch (error) {
      console.error('Error in getConnectionStatus:', error);
      throw error;
    }
  }

  static async getPendingConnectionRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization,
                u.role, u.location, u.experience_years, u.bio
         FROM connection_requests cr
         JOIN users u ON cr.requester_id = u.id
         WHERE cr.receiver_id = $1 AND cr.status = 'PENDING'
         ORDER BY cr.requested_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        requesterId: row.requester_id,
        receiverId: row.receiver_id,
        status: row.status,
        requestMessage: row.request_message,
        requestedAt: row.requested_at,
        respondedAt: row.responded_at,
        user: {
          id: row.requester_id,
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
      console.error('Error in getPendingConnectionRequests:', error);
      throw error;
    }
  }

  static async getSentConnectionRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization,
                u.role, u.location
         FROM connection_requests cr
         JOIN users u ON cr.receiver_id = u.id
         WHERE cr.requester_id = $1 AND cr.status = 'PENDING'
         ORDER BY cr.requested_at DESC`,
        [userId]
      );

      return result.rows.map(row => ({
        id: row.id,
        requesterId: row.requester_id,
        receiverId: row.receiver_id,
        status: row.status,
        requestMessage: row.request_message,
        requestedAt: row.requested_at,
        respondedAt: row.responded_at,
        user: {
          id: row.receiver_id,
          fullName: row.full_name,
          profilePhotoUrl: row.profile_photo_url,
          designation: row.designation,
          organization: row.organization,
          role: row.role,
          location: row.location
        }
      }));
    } catch (error) {
      console.error('Error in getSentConnectionRequests:', error);
      throw error;
    }
  }

  static async getConnections(userId: string) {
    try {
      // Get mutual follows (connections)
      const result = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.designation, 
                u.organization, u.profile_photo_url, u.location, 
                u.experience_years, u.bio, u.follower_count, u.following_count
         FROM users u
         WHERE u.id IN (
           SELECT uf1.following_id
           FROM user_follows uf1
           JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id 
             AND uf1.following_id = uf2.follower_id
           WHERE uf1.follower_id = $1 
             AND uf1.status = 'ACCEPTED' 
             AND uf2.status = 'ACCEPTED'
         )
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
        connectionType: 'mutual'
      }));
    } catch (error) {
      console.error('Error in getConnections:', error);
      throw error;
    }
  }

  static async getFollowers(userId: string) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.designation, 
                u.organization, u.profile_photo_url, u.location, 
                u.experience_years, u.bio,
                CASE 
                  WHEN EXISTS (
                    SELECT 1 FROM user_follows uf2 
                    WHERE uf2.follower_id = $1 AND uf2.following_id = u.id
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
        isFollowingBack: row.is_following_back,
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
                    WHERE uf2.follower_id = u.id AND uf2.following_id = $1
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
                END as is_follower
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

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM users u
         WHERE u.is_active = true 
           AND u.id != $1
           AND (u.full_name ILIKE $2 OR u.email ILIKE $2 OR u.designation ILIKE $2 OR u.organization ILIKE $2)`,
        [currentUserId, searchQuery]
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
          connectionType: row.is_following && row.is_follower ? 'mutual' : 
                         row.is_following ? 'following' : 
                         row.is_follower ? 'follower' : 'none'
        })),
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page,
          limit,
          pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
        }
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
        connectionsResult,
        pendingRequestsResult,
        sentRequestsResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1 AND status = $2', [userId, 'ACCEPTED']),
        pool.query('SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1 AND status = $2', [userId, 'ACCEPTED']),
        pool.query(
          `SELECT COUNT(*) as count 
           FROM user_follows uf1
           JOIN user_follows uf2 ON uf1.follower_id = uf2.following_id AND uf1.following_id = uf2.follower_id
           WHERE uf1.follower_id = $1 AND uf1.status = 'ACCEPTED' AND uf2.status = 'ACCEPTED'`,
          [userId]
        ),
        pool.query('SELECT COUNT(*) as count FROM connection_requests WHERE receiver_id = $1 AND status = $2', [userId, 'PENDING']),
        pool.query('SELECT COUNT(*) as count FROM connection_requests WHERE requester_id = $1 AND status = $2', [userId, 'PENDING'])
      ]);

      return {
        followers: parseInt(followersResult.rows[0].count),
        following: parseInt(followingResult.rows[0].count),
        connections: parseInt(connectionsResult.rows[0].count),
        pendingRequests: parseInt(pendingRequestsResult.rows[0].count),
        sentRequests: parseInt(sentRequestsResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error in getNetworkStats:', error);
      throw error;
    }
  }

  static async getFollowerCount(userId: string) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1 AND status = $2',
        [userId, 'ACCEPTED']
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error in getFollowerCount:', error);
      throw error;
    }
  }

  static async getFollowingCount(userId: string) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = $1 AND status = $2',
        [userId, 'ACCEPTED']
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error in getFollowingCount:', error);
      throw error;
    }
  }
}