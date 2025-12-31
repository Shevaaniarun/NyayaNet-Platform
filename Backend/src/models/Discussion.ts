import pool from '../config/database';
import { Discussion, CreateDiscussionInput } from '../types/discussionTypes';

export class DiscussionModel {
  // Helper to normalize tags (UPPERCASE and handling comma-separated string)
  private static normalizeTags(tags: any): string[] {
    if (!tags) return [];
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.toUpperCase().trim()).filter(Boolean);
    }
    if (Array.isArray(tags)) {
      return tags.map(tag => tag.toUpperCase().trim()).filter(Boolean);
    }
    return [];
  }

  // Create a new discussion
  static async create(discussionData: CreateDiscussionInput, userId: string): Promise<Discussion> {
    const query = `
      INSERT INTO discussions (
        user_id, title, description, discussion_type, category, tags, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const normalizedTags = this.normalizeTags(discussionData.tags);

    const values = [
      userId,
      discussionData.title,
      discussionData.description,
      discussionData.discussionType,
      discussionData.category,
      normalizedTags,
      discussionData.isPublic ?? true
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get discussion by ID
  static async findById(id: string, userId?: string): Promise<any | null> {
    const query = `
      SELECT 
        d.*,
        u.full_name as author_name,
        u.role as author_role,
        u.profile_photo_url as author_photo,
        CASE WHEN $2::uuid IS NULL THEN false ELSE EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $2) END as is_following,
        CASE WHEN $2::uuid IS NULL THEN false ELSE EXISTS(SELECT 1 FROM user_bookmarks ub WHERE ub.entity_type = 'DISCUSSION' AND ub.entity_id = d.id AND ub.user_id = $2) END as is_saved
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id = $1 AND d.is_public = true;
    `;

    const result = await pool.query(query, [id, userId || null]);

    if (!result.rows[0]) return null;

    const row = result.rows[0];

    // Get best answer details if exists
    let bestAnswer = null;
    if (row.best_answer_id) {
      const baQuery = `
        SELECT dr.*, u.full_name as author_name, u.profile_photo_url as author_photo
        FROM discussion_replies dr
        LEFT JOIN users u ON dr.user_id = u.id
        WHERE dr.id = $1 AND dr.is_deleted = false;
      `;
      const baResult = await pool.query(baQuery, [row.best_answer_id]);
      if (baResult.rows[0]) {
        bestAnswer = {
          id: baResult.rows[0].id,
          content: baResult.rows[0].content,
          upvoteCount: baResult.rows[0].upvote_count,
          author: {
            fullName: baResult.rows[0].author_name,
            profilePhotoUrl: baResult.rows[0].author_photo
          }
        };
      }
    }

    return {
      ...row,
      bestAnswer
    };
  }

  // Increment view count (unique per user/IP)
  static async incrementViewCount(id: string, userId?: string, ipAddress?: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let insertResult;
      if (userId) {
        // Track by userId
        insertResult = await client.query(
          'INSERT INTO discussion_views (discussion_id, user_id) VALUES ($1, $2) ON CONFLICT (discussion_id, user_id) DO NOTHING RETURNING id',
          [id, userId]
        );
      } else if (ipAddress) {
        // Track by IP for guests
        insertResult = await client.query(
          'INSERT INTO discussion_views (discussion_id, ip_address) VALUES ($1, $2) ON CONFLICT (discussion_id, ip_address) WHERE user_id IS NULL DO NOTHING RETURNING id',
          [id, ipAddress]
        );
      } else {
        // Unconditional increment if no tracking info (fallback)
        await client.query(
          'UPDATE discussions SET view_count = view_count + 1 WHERE id = $1',
          [id]
        );
        await client.query('COMMIT');
        return;
      }

      // If a new record was inserted, increment the main count
      if (insertResult.rows.length > 0) {
        await client.query(
          'UPDATE discussions SET view_count = view_count + 1 WHERE id = $1',
          [id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error incrementing view count:', error);
    } finally {
      client.release();
    }
  }

  // Get discussions with filters
  static async findAll(filters: any, userId?: string): Promise<{ discussions: any[], total: number }> {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      tags,
      status,
      sort = 'newest',
      following = false,
      q
    } = filters;

    const offset = (page - 1) * limit;

    // Build common filter conditions
    let baseConditions = ['d.is_public = true'];
    const commonParams: any[] = [];
    let pIdx = 1;

    if (q) {
      baseConditions.push(`(
        d.title ILIKE $${pIdx} OR 
        d.description ILIKE $${pIdx} OR 
        EXISTS(
          SELECT 1 FROM users u 
          WHERE u.id = d.user_id AND u.full_name ILIKE $${pIdx}
        ) OR
        EXISTS(
          SELECT 1 FROM unnest(d.tags) AS t 
          WHERE t ILIKE $${pIdx} OR ('#' || t) ILIKE $${pIdx}
        )
      )`);
      commonParams.push(`%${q}%`);
      pIdx++;
    }

    if (category) {
      baseConditions.push(`d.category = $${pIdx}`);
      commonParams.push(category);
      pIdx++;
    }

    if (type) {
      baseConditions.push(`d.discussion_type = $${pIdx}`);
      commonParams.push(type);
      pIdx++;
    }

    if (tags && (Array.isArray(tags) ? tags.length > 0 : !!tags)) {
      const tagsArray = this.normalizeTags(tags);
      baseConditions.push(`EXISTS (
        SELECT 1 FROM unnest(d.tags) AS t 
        WHERE UPPER(t) = ANY($${pIdx}::text[])
      )`);
      commonParams.push(tagsArray);
      pIdx++;
    }

    if (status === 'resolved') {
      baseConditions.push('d.is_resolved = true');
    } else if (status === 'active') {
      baseConditions.push('d.is_resolved = false');
    }

    if (following && userId) {
      baseConditions.push(`EXISTS(
        SELECT 1 FROM discussion_followers df 
        WHERE df.discussion_id = d.id AND df.user_id = $${pIdx}
      )`);
      commonParams.push(userId);
      pIdx++;
    }

    const whereClause = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';

    // 1. Get total count
    const countQuery = `SELECT COUNT(*) as total FROM discussions d ${whereClause}`;
    const countResult = await pool.query(countQuery, commonParams);
    const total = parseInt(countResult.rows[0].total);

    // 2. Build sort clause
    let sortClause = 'd.created_at DESC';
    switch (sort) {
      case 'active':
        sortClause = 'd.reply_count DESC';
        break;
      case 'popular':
        sortClause = 'd.view_count DESC';
        break;
      case 'upvoted':
        sortClause = 'd.upvote_count DESC';
        break;
    }

    // 3. Get paginated results
    const finalParams = [...commonParams];
    const limitIdx = finalParams.length + 1;
    const offsetIdx = finalParams.length + 2;
    const userIdx = finalParams.length + 3;
    finalParams.push(limit, offset, userId || null);

    const query = `
      SELECT 
        d.*,
        u.full_name as author_name,
        u.role as author_role,
        u.profile_photo_url as author_photo,
        CASE WHEN $${userIdx}::uuid IS NULL THEN false ELSE EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $${userIdx}) END as is_following,
        CASE WHEN $${userIdx}::uuid IS NULL THEN false ELSE EXISTS(SELECT 1 FROM user_bookmarks ub WHERE ub.entity_type = 'DISCUSSION' AND ub.entity_id = d.id AND ub.user_id = $${userIdx}) END as is_saved
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await pool.query(query, finalParams);

    return {
      discussions: result.rows,
      total
    };
  }

  // Update discussion
  static async update(id: string, updates: Partial<Discussion>, userId: string): Promise<Discussion | null> {
    const allowedUpdates = ['title', 'description', 'tags', 'is_public', 'is_resolved'];
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.tags) {
      updates.tags = this.normalizeTags(updates.tags);
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    const query = `
      UPDATE discussions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  // Mark as resolved
  static async markAsResolved(id: string, userId: string): Promise<Discussion | null> {
    const query = `
      UPDATE discussions 
      SET is_resolved = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }

  // Set best answer
  static async setBestAnswer(discussionId: string, replyId: string, userId: string): Promise<Discussion | null> {
    // Verify user owns the discussion
    const verifyQuery = 'SELECT user_id FROM discussions WHERE id = $1';
    const verifyResult = await pool.query(verifyQuery, [discussionId]);

    if (verifyResult.rows.length === 0 || verifyResult.rows[0].user_id !== userId) {
      return null;
    }

    const query = `
      UPDATE discussions 
      SET best_answer_id = $1, is_resolved = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const result = await pool.query(query, [replyId, discussionId]);
    return result.rows[0] || null;
  }

  // Delete discussion
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM discussions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Toggle upvote on discussion
  static async toggleUpvote(discussionId: string, userId: string): Promise<{ upvoted: boolean; count: number }> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const checkQuery = 'SELECT 1 FROM discussion_upvotes WHERE discussion_id = $1 AND user_id = $2';
      const checkResult = await client.query(checkQuery, [discussionId, userId]);

      if (checkResult.rows.length > 0) {
        // Remove upvote
        await client.query(
          'DELETE FROM discussion_upvotes WHERE discussion_id = $1 AND user_id = $2',
          [discussionId, userId]
        );

        await client.query(
          'UPDATE discussions SET upvote_count = upvote_count - 1 WHERE id = $1',
          [discussionId]
        );

        await client.query('COMMIT');

        const countResult = await client.query(
          'SELECT upvote_count FROM discussions WHERE id = $1',
          [discussionId]
        );

        return {
          upvoted: false,
          count: parseInt(countResult.rows[0].upvote_count)
        };
      } else {
        // Add upvote
        await client.query(
          'INSERT INTO discussion_upvotes (discussion_id, user_id) VALUES ($1, $2)',
          [discussionId, userId]
        );

        await client.query(
          'UPDATE discussions SET upvote_count = upvote_count + 1 WHERE id = $1',
          [discussionId]
        );

        await client.query('COMMIT');

        const countResult = await client.query(
          'SELECT upvote_count FROM discussions WHERE id = $1',
          [discussionId]
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

  // Search discussions
  static async search(searchParams: any, userId?: string): Promise<{ discussions: any[], total: number }> {
    const {
      q,
      category,
      tags,
      author,
      type,
      status,
      sort = 'relevance',
      page = 1,
      limit = 20
    } = searchParams;

    const offset = (page - 1) * limit;

    // Build common filter conditions
    let baseConditions = ['d.is_public = true'];
    const commonParams: any[] = [];
    let pIdx = 1;

    if (q) {
      baseConditions.push(`(
        d.title ILIKE $${pIdx} OR 
        d.description ILIKE $${pIdx} OR 
        EXISTS(
          SELECT 1 FROM users u 
          WHERE u.id = d.user_id AND u.full_name ILIKE $${pIdx}
        ) OR
        EXISTS(
          SELECT 1 FROM unnest(d.tags) AS t 
          WHERE t ILIKE $${pIdx} OR ('#' || t) ILIKE $${pIdx}
        )
      )`);
      commonParams.push(`%${q}%`);
      pIdx++;
    }

    if (category) {
      baseConditions.push(`d.category = $${pIdx}`);
      commonParams.push(category);
      pIdx++;
    }

    if (type) {
      baseConditions.push(`d.discussion_type = $${pIdx}`);
      commonParams.push(type);
      pIdx++;
    }

    if (tags && (Array.isArray(tags) ? tags.length > 0 : !!tags)) {
      const tagsArray = this.normalizeTags(tags);
      baseConditions.push(`EXISTS (
        SELECT 1 FROM unnest(d.tags) AS t 
        WHERE UPPER(t) = ANY($${pIdx}::text[])
      )`);
      commonParams.push(tagsArray);
      pIdx++;
    }

    if (author) {
      baseConditions.push(`EXISTS(
        SELECT 1 FROM users u 
        WHERE u.id = d.user_id AND u.full_name ILIKE $${pIdx}
      )`);
      commonParams.push(`%${author}%`);
      pIdx++;
    }

    if (status === 'resolved') {
      baseConditions.push('d.is_resolved = true');
    } else if (status === 'active') {
      baseConditions.push('d.is_resolved = false');
    }

    const whereClause = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';

    // 1. Get total count
    const countQuery = `SELECT COUNT(*) as total FROM discussions d ${whereClause}`;
    const countResult = await pool.query(countQuery, commonParams);
    const total = parseInt(countResult.rows[0].total);

    // 2. Build sort clause
    let orderBy = 'd.created_at DESC';
    switch (sort) {
      case 'newest':
        orderBy = 'd.created_at DESC';
        break;
      case 'active':
        orderBy = 'd.reply_count DESC';
        break;
      case 'popular':
        orderBy = 'd.view_count DESC';
        break;
      case 'relevance':
        if (q) {
          orderBy = `
            CASE 
              WHEN d.title ILIKE $1 THEN 1
              WHEN d.description ILIKE $1 THEN 2
              ELSE 3
            END,
            d.reply_count DESC
          `;
        }
        break;
    }

    // 3. Get paginated results
    const finalParams = [...commonParams];
    const limitIdx = finalParams.length + 1;
    const offsetIdx = finalParams.length + 2;
    const userIdx = finalParams.length + 3;
    finalParams.push(limit, offset, userId || null);

    const query = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.discussion_type,
        d.category,
        d.tags,
        d.reply_count,
        d.upvote_count,
        d.view_count,
        d.is_resolved,
        d.created_at,
        d.last_activity_at,
        u.full_name as author_name,
        u.profile_photo_url as author_photo,
        CASE WHEN $${userIdx}::uuid IS NULL THEN false ELSE EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $${userIdx}) END as is_following
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const result = await pool.query(query, finalParams);

    return {
      discussions: result.rows,
      total
    };
  }
}