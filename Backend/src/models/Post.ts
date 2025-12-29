import pool from '../config/database';
import { CreatePostInput } from '../types/postTypes';

export class PostModel {
  static async create(data: CreatePostInput, userId: string) {
    const query = `
      INSERT INTO posts (
        user_id, title, content, post_type, tags, is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      userId,
      data.title || null,
      data.content,
      data.postType || 'POST',
      data.tags || [],
      data.isPublic ?? true
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getFeed(filters: any, userId?: string) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        p.*,
        u.full_name AS author_name,
        u.role AS author_role,
        u.profile_photo_url AS author_photo,
        ${
          userId
            ? `EXISTS (
                SELECT 1 FROM post_likes pl 
                WHERE pl.post_id = p.id AND pl.user_id = $3
              ) AS is_liked`
            : 'false AS is_liked'
        }
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = true
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;

    const params = userId ? [limit, offset, userId] : [limit, offset];
    const posts = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE is_public = true`
    );

    return {
      posts: posts.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }
}
