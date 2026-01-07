// [file name]: User.ts
import pool from "../config/database";
import { UpdateProfileInput, ProfileResponse } from "../types/profileTypes";

/* ======================================================
   AUTH / CORE USER TYPES (used for login & registration)
====================================================== */

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  barCouncilNumber?: string;
  experienceYears?: number;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  last_login_at: Date | null;
}

/* ======================================================
   AUTH-RELATED QUERIES
====================================================== */

export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
};

export const findUserById = async (
  id: string
): Promise<User | null> => {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
};

export const createUser = async (
  data: CreateUserInput
): Promise<User> => {
  const result = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      role,
      bar_council_number,
      experience_years
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      email,
      password_hash,
      full_name,
      role,
      is_active,
      created_at,
      last_login_at
    `,
    [data.email, data.passwordHash, data.fullName, data.role, data.barCouncilNumber || null, data.experienceYears ?? 0]
  );

  return result.rows[0];
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [userId]
  );
};

/* ======================================================
   PROFILE / SOCIAL FEATURES MODEL
====================================================== */

export class UserModel {
  static async findById(
    id: string,
    requesterId?: string
  ): Promise<ProfileResponse | null> {
    const query = `
      SELECT 
        u.id, u.email, u.full_name, u.role, u.designation, u.organization,
        u.area_of_interest, u.bar_council_number, u.experience_years, u.bio, u.location,
        u.website_url, u.linkedin_url, u.profile_photo_url, u.cover_photo_url,
        u.follower_count, u.following_count, u.post_count, u.discussion_count,
        u.created_at,
        ${requesterId
        ? `EXISTS(
                SELECT 1 FROM user_follows uf
                WHERE uf.follower_id = $2
                AND uf.following_id = u.id
                AND uf.status = 'ACCEPTED'
              ) AS is_following`
        : "false AS is_following"
      }
      FROM users u
      WHERE u.id = $1 AND u.is_active = true
    `;

    const params = requesterId ? [id, requesterId] : [id];
    const result = await pool.query(query, params);

    if (!result.rows[0]) return null;
    const row = result.rows[0];

    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      designation: row.designation,
      organization: row.organization,
      areaOfInterest: row.area_of_interest || [],
      barCouncilNumber: row.bar_council_number,
      experienceYears: row.experience_years,
      bio: row.bio,
      location: row.location,
      websiteUrl: row.website_url,
      linkedinUrl: row.linkedin_url,
      profilePhotoUrl: row.profile_photo_url,
      coverPhotoUrl: row.cover_photo_url,
      followerCount: row.follower_count,
      followingCount: row.following_count,
      postCount: row.post_count,
      discussionCount: row.discussion_count,
      isFollowing: row.is_following,
      createdAt: row.created_at.toISOString()
    };
  }

  static async update(
    userId: string,
    updates: UpdateProfileInput
  ): Promise<ProfileResponse | null> {
    const fieldMap: Record<string, string> = {
      fullName: "full_name",
      designation: "designation",
      organization: "organization",
      areaOfInterest: "area_of_interest",
      bio: "bio",
      location: "location",
      websiteUrl: "website_url",
      linkedinUrl: "linkedin_url",
      barCouncilNumber: "bar_council_number",
      experienceYears: "experience_years"
    };

    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (!fields.length) return this.findById(userId);

    values.push(userId);
    await pool.query(
      `
      UPDATE users
      SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx} AND is_active = true
      `,
      values
    );

    return this.findById(userId);
  }

  // ================== FOLLOW METHODS ==================
  
  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      // Check if already following
      const existing = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2 AND status = $3',
        [followerId, followingId, 'ACCEPTED']
      );

      if (existing.rows.length > 0) {
        return false; // Already following
      }

      // Create follow relationship
      await pool.query(
        `INSERT INTO user_follows (follower_id, following_id, status) 
         VALUES ($1, $2, 'ACCEPTED')`,
        [followerId, followingId]
      );

      return true;
    } catch (error) {
      console.error('Error in followUser:', error);
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followingId: string) {
    try {
      const result = await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      throw error;
    }
  }

  static async getFollowStatus(requesterId: string, targetUserId: string) {
    try {
      const result = await pool.query(
        `SELECT id, status FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2`,
        [requesterId, targetUserId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in getFollowStatus:', error);
      throw error;
    }
  }

  static async getFollowRequests(receiverId: string) {
    try {
      const result = await pool.query(
        `SELECT cr.*, u.full_name, u.profile_photo_url, u.designation, u.organization
         FROM connection_requests cr
         JOIN users u ON cr.requester_id = u.id
         WHERE cr.receiver_id = $1 AND cr.status = 'PENDING'
         ORDER BY cr.requested_at DESC`,
        [receiverId]
      );

      return result.rows.map(row => ({
        id: row.id,
        requesterId: row.requester_id,
        receiverId: row.receiver_id,
        status: row.status,
        requestMessage: row.request_message,
        requestedAt: row.requested_at,
        respondedAt: row.responded_at,
        fullName: row.full_name,
        profilePhotoUrl: row.profile_photo_url,
        designation: row.designation,
        organization: row.organization
      }));
    } catch (error) {
      console.error('Error in getFollowRequests:', error);
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

  // ================== EXISTING METHODS ==================
  
  static async getUserPosts(userId: string, page = 1, limit = 20, sort = 'newest') {
    const offset = (page - 1) * limit;
    const orderBy = sort === 'newest' ? 'created_at DESC' : 'created_at ASC';

    const result = await pool.query(
      `SELECT id, title, content, post_type, tags, like_count, comment_count, created_at
       FROM posts 
       WHERE user_id = $1 AND is_public = true
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE user_id = $1 AND is_public = true',
      [userId]
    );

    return {
      posts: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        postType: row.post_type,
        tags: row.tags || [],
        likeCount: row.like_count || 0,
        commentCount: row.comment_count || 0,
        createdAt: row.created_at?.toISOString()
      })),
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    };
  }

  static async getUserDiscussions(userId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, title, description, category, reply_count, upvote_count, is_resolved, created_at
       FROM discussions 
       WHERE created_by = $1 AND is_public = true
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM discussions WHERE created_by = $1 AND is_public = true',
      [userId]
    );

    return {
      discussions: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        replyCount: row.reply_count || 0,
        upvoteCount: row.upvote_count || 0,
        isResolved: row.is_resolved || false,
        createdAt: row.created_at?.toISOString()
      })),
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    };
  }

  static async getUserBookmarks(userId: string, folder?: string, type?: string, page = 1, limit = 20) {
    // Return empty bookmarks for now (bookmarks table may not exist)
    return {
      bookmarks: [],
      pagination: { total: 0, page, limit, pages: 0 }
    };
  }

  static async searchUserContent(userId: string, query: string, type?: string) {
    // Return empty results for now
    return { results: { posts: [], discussions: [] } };
  }

  static async updateProfilePhoto(userId: string, photoUrl: string, thumbnailUrl?: string) {
    const result = await pool.query(
      'UPDATE users SET profile_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_active = true RETURNING id',
      [photoUrl, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  static async updateCoverPhoto(userId: string, coverPhotoUrl: string) {
    const result = await pool.query(
      'UPDATE users SET cover_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_active = true RETURNING id',
      [coverPhotoUrl, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
/*
  // ================== CONNECTION REQUEST METHODS ==================
  
  static async sendConnectionRequest(requesterId: string, receiverId: string, message?: string) {
    if (requesterId === receiverId) {
      throw new Error('Cannot send connection request to yourself');
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

      // Check if already connected
      const connected = await pool.query(
        `SELECT id FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2 AND status = 'ACCEPTED'`,
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

  static async getConnectionStatus(requesterId: string, receiverId: string) {
    try {
      // Check if already following
      const followResult = await pool.query(
        `SELECT id, status FROM user_follows 
         WHERE follower_id = $1 AND following_id = $2`,
        [requesterId, receiverId]
      );

      if (followResult.rows.length > 0) {
        return {
          status: 'CONNECTED',
          followId: followResult.rows[0].id
        };
      }

      // Check for pending request
      const requestResult = await pool.query(
        `SELECT id, status, request_message FROM connection_requests 
         WHERE requester_id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requesterId, receiverId]
      );

      if (requestResult.rows.length > 0) {
        return {
          status: 'PENDING',
          requestId: requestResult.rows[0].id,
          requestMessage: requestResult.rows[0].request_message
        };
      }

      return { status: 'NONE' };
    } catch (error) {
      console.error('Error in getConnectionStatus:', error);
      throw error;
    }
  }

  // Update acceptFollowRequest to handle connection requests properly
  static async acceptFollowRequest(requestId: string, receiverId: string) {
    try {
      // Get the connection request
      const requestResult = await pool.query(
        `SELECT requester_id FROM connection_requests 
         WHERE id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('Connection request not found or already processed');
      }

      const requesterId = requestResult.rows[0].requester_id;

      // Update connection request status
      await pool.query(
        `UPDATE connection_requests 
         SET status = 'ACCEPTED', responded_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [requestId]
      );

      // Create follow relationship (both ways for mutual connection)
      // User follows the requester
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
      }

      // Requester follows the user
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
      }

      return { success: true, requesterId };
    } catch (error) {
      console.error('Error in acceptFollowRequest:', error);
      throw error;
    }
  }

  // Update rejectFollowRequest
  static async rejectFollowRequest(requestId: string, receiverId: string) {
    try {
      const result = await pool.query(
        `UPDATE connection_requests 
         SET status = 'REJECTED', responded_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND receiver_id = $2 AND status = 'PENDING'`,
        [requestId, receiverId]
      );

      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error in rejectFollowRequest:', error);
      throw error;
    }
  }

  // Get pending connection requests for a user
  static async getPendingConnectionRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization,
                u.role, u.location, u.experience_years
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
          experienceYears: row.experience_years
        }
      }));
    } catch (error) {
      console.error('Error in getPendingConnectionRequests:', error);
      throw error;
    }
  }

  // Get sent connection requests
  static async getSentConnectionRequests(userId: string) {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
                u.full_name, u.profile_photo_url, u.designation, u.organization
         FROM connection_requests cr
         JOIN users u ON cr.receiver_id = u.id
         WHERE cr.requester_id = $1 AND cr.status = 'PENDING'
         ORDER BY cr.requested_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error in getSentConnectionRequests:', error);
      throw error;
    }
  }

  // Get connections/followers (mutual follows)
  static async getConnections(userId: string) {
    try {
      const result = await pool.query(
        `SELECT u.* 
         FROM users u
         JOIN user_follows uf1 ON u.id = uf1.following_id
         JOIN user_follows uf2 ON u.id = uf2.follower_id
         WHERE uf1.follower_id = $1 
           AND uf2.following_id = $1
           AND uf1.status = 'ACCEPTED'
           AND uf2.status = 'ACCEPTED'`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error in getConnections:', error);
      throw error;
    }
  }
  */
}
  