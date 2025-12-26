import pool from '../config/database';
import { Discussion, CreateDiscussionInput } from '../types/discussionTypes';

export class DiscussionModel {
  // Create a new discussion
  static async create(discussionData: CreateDiscussionInput, userId: string): Promise<Discussion> {
    const query = `
      INSERT INTO discussions (
        user_id, title, description, discussion_type, category, tags, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [
      userId,
      discussionData.title,
      discussionData.description,
      discussionData.discussionType,
      discussionData.category,
      discussionData.tags,
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
        EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $2) as is_following,
        EXISTS(SELECT 1 FROM user_bookmarks ub WHERE ub.entity_type = 'DISCUSSION' AND ub.entity_id = d.id AND ub.user_id = $2) as is_saved
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

  // Increment view count
  static async incrementViewCount(id: string): Promise<void> {
    await pool.query(
      'UPDATE discussions SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
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
      following = false
    } = filters;

    const offset = (page - 1) * limit;
    
    let whereConditions = ['d.is_public = true'];
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3;

    // Apply filters
    if (category) {
      whereConditions.push(`d.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`d.discussion_type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      whereConditions.push(`d.tags && $${paramIndex}::text[]`);
      queryParams.push(tags);
      paramIndex++;
    }

    if (status === 'resolved') {
      whereConditions.push('d.is_resolved = true');
    } else if (status === 'active') {
      whereConditions.push('d.is_resolved = false');
    }

    if (following && userId) {
      whereConditions.push(`EXISTS(
        SELECT 1 FROM discussion_followers df 
        WHERE df.discussion_id = d.id AND df.user_id = $${paramIndex}
      )`);
      queryParams.push(userId);
      paramIndex++;
    }

    // Build sort clause
    let sortClause = 'd.created_at DESC';
    switch (sort) {
      case 'active':
        sortClause = 'd.last_activity_at DESC';
        break;
      case 'popular':
        sortClause = 'd.reply_count DESC, d.upvote_count DESC';
        break;
      case 'upvoted':
        sortClause = 'd.upvote_count DESC';
        break;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM discussions d
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(2));
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const query = `
      SELECT 
        d.*,
        u.full_name as author_name,
        u.role as author_role,
        u.profile_photo_url as author_photo,
        ${userId ? `EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $${paramIndex}) as is_following,` : 'false as is_following,'}
        ${userId ? `EXISTS(SELECT 1 FROM user_bookmarks ub WHERE ub.entity_type = 'DISCUSSION' AND ub.entity_id = d.id AND ub.user_id = $${paramIndex}) as is_saved` : 'false as is_saved'}
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY ${sortClause}
      LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, queryParams);
    
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
      SET best_answer_id = $1, updated_at = CURRENT_TIMESTAMP
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
    const queryParams: any[] = [limit, offset];
    let paramIndex = 3;
    let whereConditions = ['d.is_public = true'];
    let orderBy = '';

    // Search query
    if (q) {
      whereConditions.push(`(
        d.title ILIKE $${paramIndex} OR 
        d.description ILIKE $${paramIndex} OR 
        EXISTS(
          SELECT 1 FROM users u 
          WHERE u.id = d.user_id AND u.full_name ILIKE $${paramIndex}
        )
      )`);
      queryParams.push(`%${q}%`);
      paramIndex++;
    }

    // Additional filters
    if (category) {
      whereConditions.push(`d.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (type) {
      whereConditions.push(`d.discussion_type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      whereConditions.push(`d.tags && $${paramIndex}::text[]`);
      queryParams.push(tags);
      paramIndex++;
    }

    if (author) {
      whereConditions.push(`EXISTS(
        SELECT 1 FROM users u 
        WHERE u.id = d.user_id AND u.full_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${author}%`);
      paramIndex++;
    }

    if (status === 'resolved') {
      whereConditions.push('d.is_resolved = true');
    } else if (status === 'active') {
      whereConditions.push('d.is_resolved = false');
    }

    // Build sort clause
    switch (sort) {
      case 'newest':
        orderBy = 'd.created_at DESC';
        break;
      case 'active':
        orderBy = 'd.last_activity_at DESC';
        break;
      case 'popular':
        orderBy = 'd.reply_count DESC, d.upvote_count DESC';
        break;
      case 'relevance':
        if (q) {
          orderBy = `
            CASE 
              WHEN d.title ILIKE '%${q}%' THEN 1
              WHEN d.description ILIKE '%${q}%' THEN 2
              ELSE 3
            END,
            d.reply_count DESC
          `;
        } else {
          orderBy = 'd.last_activity_at DESC';
        }
        break;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM discussions d
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams.slice(2));
    const total = parseInt(countResult.rows[0].total);

    // Get search results
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
        ${userId ? `EXISTS(SELECT 1 FROM discussion_followers df WHERE df.discussion_id = d.id AND df.user_id = $${paramIndex}) as is_following` : 'false as is_following'}
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2;
    `;

    const result = await pool.query(query, queryParams);
    
    return {
      discussions: result.rows,
      total
    };
  }
}