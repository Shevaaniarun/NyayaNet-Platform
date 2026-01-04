import pool from '../config/database';
import { UserBookmarkModel } from './UserBookmark';

export interface PostMediaInput {
  mediaType: 'IMAGE' | 'PDF' | 'DOCUMENT';
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface CreatePostInput {
  content: string;
  title?: string;
  postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
  tags?: string[];
  isPublic?: boolean;
  media?: PostMediaInput[];
}

export interface PostMedia {
  id: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  fileName: string | null;
  displayOrder: number;
}

export interface CommentResponse {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  isEdited: boolean;
  commentCount: number;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
  };
  replies?: CommentResponse[];
}

export interface PostResponse {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  postType: string;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  media?: PostMedia[];
  isLiked?: boolean;
  isSaved?: boolean;
  reactionType?: string | null;
  author?: {
    id: string;
    fullName: string;
    profilePhotoUrl: string | null;
    designation: string | null;
  };
}

export class PostModel {
  static async create(userId: string, input: CreatePostInput): Promise<PostResponse> {
    const { content, title, postType = 'POST', tags = [], isPublic = true, media = [] } = input;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO posts (user_id, title, content, post_type, tags, is_public, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                 RETURNING id, user_id, title, content, post_type, tags, is_public, view_count, like_count, comment_count, created_at, updated_at`,
        [userId, title || null, content, postType, tags, isPublic]
      );

      const post = result.rows[0];

      // Insert media if any
      if (media.length > 0) {
        const mediaValues: any[] = [];
        const mediaPlaceholders: string[] = [];
        let pIdx = 1;

        media.forEach((m: PostMediaInput, index) => {
          mediaValues.push(post.id, m.mediaType, m.mediaUrl, m.thumbnailUrl || null, m.fileName || null, m.fileSize || null, m.mimeType || null, index);
          mediaPlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, $${pIdx + 5}, $${pIdx + 6}, $${pIdx + 7})`);
          pIdx += 8;
        });

        await client.query(
          `INSERT INTO post_media (post_id, media_type, media_url, thumbnail_url, file_name, file_size, mime_type, display_order)
                     VALUES ${mediaPlaceholders.join(', ')}`,
          mediaValues
        );
      }

      await client.query('COMMIT');

      // Fetch complete post with media
      return this.findById(post.id) as Promise<PostResponse>;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id: string, requesterId?: string): Promise<PostResponse | null> {
    const result = await pool.query(
      `SELECT p.*, u.full_name, u.profile_photo_url, u.designation,
             (SELECT COUNT(*) > 0 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $2) as is_liked,
             (SELECT COUNT(*) > 0 FROM user_bookmarks ub WHERE ub.entity_id = p.id AND ub.entity_type = 'POST' AND ub.user_id = $2) as is_saved,
             COALESCE(
                json_agg(
                    json_build_object(
                        'id', pm.id,
                        'mediaType', pm.media_type,
                        'mediaUrl', pm.media_url,
                        'thumbnailUrl', pm.thumbnail_url,
                        'fileName', pm.file_name,
                        'displayOrder', pm.display_order
                    ) ORDER BY pm.display_order ASC
                ) FILTER (WHERE pm.id IS NOT NULL),
                '[]'::json
            ) as media,
            (SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = $2) as reaction_type
             FROM posts p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN post_media pm ON p.id = pm.post_id
             WHERE p.id = $1
             GROUP BY p.id, u.id`,
      [id, requesterId || null]
    );

    if (!result.rows[0]) return null;

    const row = result.rows[0];
    return this.mapRowToResponse(row, true);
  }

  static async update(id: string, userId: string, updates: Partial<CreatePostInput>): Promise<PostResponse | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First verify ownership
      const existing = await client.query('SELECT user_id FROM posts WHERE id = $1', [id]);
      if (!existing.rows[0] || existing.rows[0].user_id !== userId) return null;

      const fieldMappings: Record<string, string> = {
        content: 'content',
        title: 'title',
        postType: 'post_type',
        tags: 'tags',
        isPublic: 'is_public'
      };

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (fieldMappings[key] && value !== undefined) {
          updateFields.push(`${fieldMappings[key]} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (updateFields.length > 0) {
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);
        const updateQuery = `UPDATE posts SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
        await client.query(updateQuery, values);
      }

      // Handle media updates if provided
      if (updates.media !== undefined) {
        // Simple strategy: Clear old media and insert new ones
        await client.query('DELETE FROM post_media WHERE post_id = $1', [id]);

        if (updates.media.length > 0) {
          const mediaValues: any[] = [];
          const mediaPlaceholders: string[] = [];
          let pIdx = 1;

          updates.media.forEach((m: PostMediaInput, index) => {
            mediaValues.push(id, m.mediaType, m.mediaUrl, m.thumbnailUrl || null, m.fileName || null, m.fileSize || null, m.mimeType || null, index);
            mediaPlaceholders.push(`($${pIdx}, $${pIdx + 1}, $${pIdx + 2}, $${pIdx + 3}, $${pIdx + 4}, $${pIdx + 5}, $${pIdx + 6}, $${pIdx + 7})`);
            pIdx += 8;
          });

          await client.query(
            `INSERT INTO post_media (post_id, media_type, media_url, thumbnail_url, file_name, file_size, mime_type, display_order)
             VALUES ${mediaPlaceholders.join(', ')}`,
            mediaValues
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(id, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async getFeed(page = 1, limit = 20, userId?: string): Promise<{ posts: PostResponse[], pagination: any }> {
    return this.findAll({ page, limit }, userId);
  }

  // Get posts with filters (similar to discussions)
  static async findAll(filters: any, userId?: string): Promise<{ posts: PostResponse[], pagination: any }> {
    const {
      page = 1,
      limit = 20,
      tags,
      postType,
      sort = 'newest',
      q
    } = filters;

    const offset = (page - 1) * limit;

    // Increment view count if postId is provided in params or if called from findById
    // Note: Actually, views are handled in incrementViewCount method called by controller

    // Build filter conditions
    let baseConditions = ['p.is_public = true'];
    const commonParams: any[] = [];
    let pIdx = 1;

    // Search query
    if (q) {
      baseConditions.push(`(
        p.title ILIKE $${pIdx} OR 
        p.content ILIKE $${pIdx} OR 
        EXISTS(
          SELECT 1 FROM users u 
          WHERE u.id = p.user_id AND u.full_name ILIKE $${pIdx}
        ) OR
        EXISTS(
          SELECT 1 FROM unnest(p.tags) AS t 
          WHERE t ILIKE $${pIdx} OR ('#' || t) ILIKE $${pIdx}
        )
      )`);
      commonParams.push(`%${q}%`);
      pIdx++;
    }

    // Filter by post type
    if (postType) {
      baseConditions.push(`p.post_type = $${pIdx}`);
      commonParams.push(postType);
      pIdx++;
    }

    // Filter by tags
    if (tags && (Array.isArray(tags) ? tags.length > 0 : !!tags)) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      baseConditions.push(`EXISTS (
        SELECT 1 FROM unnest(p.tags) AS t 
        WHERE UPPER(t) = ANY($${pIdx}::text[])
      )`);
      commonParams.push(tagsArray.map(t => t.toUpperCase()));
      pIdx++;
    }

    const whereClause = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM posts p ${whereClause}`;
    const countResult = await pool.query(countQuery, commonParams);
    const total = parseInt(countResult.rows[0].total);

    // Build sort clause
    let sortClause = 'p.created_at DESC';
    switch (sort) {
      case 'popular':
        sortClause = 'p.view_count DESC';
        break;
      case 'liked':
        sortClause = 'p.like_count DESC';
        break;
      case 'discussed':
        sortClause = 'p.comment_count DESC';
        break;
    }

    // Get paginated results
    const finalParams = [...commonParams];
    const limitIdx = finalParams.length + 1;
    const offsetIdx = finalParams.length + 2;
    const userIdx = finalParams.length + 3;
    finalParams.push(limit, offset, userId || null);

    const query = `
      SELECT p.*, u.full_name, u.profile_photo_url, u.designation,
             (SELECT COUNT(*) > 0 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $${userIdx}) as is_liked,
             (SELECT COUNT(*) > 0 FROM user_bookmarks ub WHERE ub.entity_id = p.id AND ub.entity_type = 'POST' AND ub.user_id = $${userIdx}) as is_saved,
             COALESCE(
                json_agg(
                    json_build_object(
                        'id', pm.id,
                        'mediaType', pm.media_type,
                        'mediaUrl', pm.media_url,
                        'thumbnailUrl', pm.thumbnail_url,
                        'fileName', pm.file_name,
                        'displayOrder', pm.display_order
                    ) ORDER BY pm.display_order ASC
                ) FILTER (WHERE pm.id IS NOT NULL),
                '[]'::json
            ) as media,
            (SELECT reaction_type FROM post_likes WHERE post_id = p.id AND user_id = $${userIdx}) as reaction_type
             FROM posts p
             JOIN users u ON p.user_id = u.id
             LEFT JOIN post_media pm ON p.id = pm.post_id
             ${whereClause}
             GROUP BY p.id, u.id
             ORDER BY ${sortClause}
             LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const result = await pool.query(query, finalParams);

    return {
      posts: result.rows.map((row: any) => this.mapRowToResponse(row, true)),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    };
  }

  // Engagement Features

  static async toggleLike(postId: string, userId: string, reactionType: string = 'LIKE'): Promise<{ liked: boolean; count: number; reactionType: string | null }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const check = await client.query(
        'SELECT id, reaction_type FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      let liked = false;
      let finalReactionType: string | null = null;

      if (check.rows[0]) {
        if (check.rows[0].reaction_type === reactionType) {
          // Remove reaction if clicking the same one
          await client.query('DELETE FROM post_likes WHERE id = $1', [check.rows[0].id]);
          await client.query('UPDATE posts SET like_count = GREATEST(0, like_count - 1) WHERE id = $1', [postId]);
        } else {
          // Change reaction type
          await client.query('UPDATE post_likes SET reaction_type = $1 WHERE id = $2', [reactionType, check.rows[0].id]);
          liked = true;
          finalReactionType = reactionType;
        }
      } else {
        // Add new reaction
        await client.query(
          'INSERT INTO post_likes (post_id, user_id, reaction_type) VALUES ($1, $2, $3)',
          [postId, userId, reactionType]
        );
        await client.query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [postId]);
        liked = true;
        finalReactionType = reactionType;
      }

      const countResult = await client.query('SELECT like_count FROM posts WHERE id = $1', [postId]);

      await client.query('COMMIT');
      return {
        liked,
        count: countResult.rows[0]?.like_count || 0,
        reactionType: finalReactionType
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async incrementViewCount(id: string, userId?: string, ipAddress?: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let insertResult;
      if (userId) {
        insertResult = await client.query(
          'INSERT INTO post_views (post_id, user_id) VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING RETURNING id',
          [id, userId]
        );
      } else if (ipAddress) {
        insertResult = await client.query(
          'INSERT INTO post_views (post_id, ip_address) VALUES ($1, $2) ON CONFLICT (post_id, ip_address) WHERE user_id IS NULL DO NOTHING RETURNING id',
          [id, ipAddress]
        );
      } else {
        await client.query(
          'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
          [id]
        );
        await client.query('COMMIT');
        return;
      }

      if (insertResult.rows.length > 0) {
        await client.query(
          'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
          [id]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error incrementing post view count:', error);
    } finally {
      client.release();
    }
  }

  static async toggleBookmark(postId: string, userId: string): Promise<{ saved: boolean; saveCount: number }> {
    const result = await UserBookmarkModel.toggleBookmark(userId, 'POST', postId);
    return {
      saved: result.bookmarked,
      saveCount: result.saveCount
    };
  }

  static async addComment(postId: string, userId: string, content: string, parentCommentId: string | null = null): Promise<CommentResponse> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO post_comments (post_id, user_id, content, parent_comment_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, content, parent_comment_id, is_edited, comment_count, created_at`,
        [postId, userId, content, parentCommentId]
      );

      const row = result.rows[0];

      // Increment post comment count
      await client.query('UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1', [postId]);

      // If it's a nested comment, increment parent comment count
      if (parentCommentId) {
        await client.query('UPDATE post_comments SET comment_count = comment_count + 1 WHERE id = $1', [parentCommentId]);
      }

      // Fetch user details
      const userRes = await client.query('SELECT full_name, profile_photo_url FROM users WHERE id = $1', [userId]);
      const user = userRes.rows[0];

      await client.query('COMMIT');

      return {
        id: row.id,
        postId,
        userId,
        content: row.content,
        parentCommentId: row.parent_comment_id,
        isEdited: row.is_edited,
        commentCount: row.comment_count,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
        author: {
          id: userId,
          fullName: user.full_name,
          profilePhotoUrl: user.profile_photo_url
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getComments(postId: string, userId?: string, page = 1, limit = 100): Promise<CommentResponse[]> {
    const query = `
      WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments
        SELECT 
          c.*,
          u.full_name as author_name,
          u.profile_photo_url as author_photo,
          1 as depth,
          ARRAY[c.created_at] as path
        FROM post_comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1 AND c.parent_comment_id IS NULL AND c.is_deleted = false
        
        UNION ALL
        
        -- Recursive case: nested comments
        SELECT 
          c.*,
          u.full_name as author_name,
          u.profile_photo_url as author_photo,
          ct.depth + 1 as depth,
          ct.path || c.created_at as path
        FROM post_comments c
        JOIN comment_tree ct ON c.parent_comment_id = ct.id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.is_deleted = false AND ct.depth < 10
      )
      SELECT * FROM comment_tree
      ORDER BY path;
    `;

    const result = await pool.query(query, [postId]);

    // Build the tree structure in memory
    const comments: any[] = result.rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      parentCommentId: row.parent_comment_id,
      isEdited: row.is_edited,
      commentCount: row.comment_count,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      author: {
        id: row.user_id,
        fullName: row.author_name,
        profilePhotoUrl: row.author_photo
      },
      replies: []
    }));

    const commentMap = new Map();
    const rootComments: CommentResponse[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, comment);
    });

    comments.forEach(comment => {
      if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
        const parent = commentMap.get(comment.parentCommentId);
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  static async updateComment(id: string, userId: string, content: string): Promise<CommentResponse | null> {
    const query = `
      UPDATE post_comments 
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [content, id, userId]);
    if (!result.rows[0]) return null;

    const row = result.rows[0];
    const userRes = await pool.query('SELECT full_name, profile_photo_url FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      parentCommentId: row.parent_comment_id,
      isEdited: row.is_edited,
      commentCount: row.comment_count,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      author: {
        id: userId,
        fullName: user.full_name,
        profilePhotoUrl: user.profile_photo_url
      }
    };
  }

  static async deleteComment(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE post_comments 
       SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  private static mapRowToResponse(row: any, includeAuthor = false): PostResponse {
    const response: PostResponse = {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      postType: row.post_type,
      tags: row.tags || [],
      isPublic: row.is_public,
      viewCount: row.view_count || 0,
      likeCount: row.like_count || 0,
      commentCount: row.comment_count || 0,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString(),
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
      media: Array.isArray(row.media) ? row.media : [],
      isLiked: !!row.is_liked,
      isSaved: !!row.is_saved,
      reactionType: row.reaction_type || null
    };

    if (includeAuthor && row.full_name) {
      response.author = {
        id: row.user_id,
        fullName: row.full_name,
        profilePhotoUrl: row.profile_photo_url,
        designation: row.designation
      };
    }

    return response;
  }
}
