import pool from "../config/database";

export interface CreatePostInput {
    userId: string;
    content: string;
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    tags?: string[];
    isPublic?: boolean;
}

export interface Post {
    id: string;
    user_id: string;
    content: string;
    post_type: string;
    created_at: Date;
    like_count: number;
    comment_count: number;
    author?: {
        full_name: string;
        profile_photo_url: string | null;
        designation: string | null;
        organization: string | null;
    };
}

export class PostModel {
    static async create(userId: string, data: CreatePostInput): Promise<Post> {
        const result = await pool.query(
            `
      INSERT INTO posts (
        user_id,
        content,
        post_type,
        tags,
        is_public
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
            [
                userId,
                data.content,
                data.postType || 'POST',
                data.tags || [],
                data.isPublic ?? true
            ]
        );

        // Fetch the created post with author details
        return this.findById(result.rows[0].id);
    }

    static async findById(id: string): Promise<Post> {
        const result = await pool.query(
            `
      SELECT 
        p.*,
        u.full_name,
        u.profile_photo_url,
        u.designation,
        u.organization
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
      `,
            [id]
        );

        const row = result.rows[0];
        if (!row) throw new Error("Post not found");

        return {
            ...row,
            author: {
                full_name: row.full_name,
                profile_photo_url: row.profile_photo_url,
                designation: row.designation,
                organization: row.organization
            }
        };
    }

    static async getFeed(page: number = 1, limit: number = 20): Promise<{ posts: Post[], total: number }> {
        const offset = (page - 1) * limit;

        const postsQuery = await pool.query(
            `
      SELECT 
        p.*,
        u.full_name,
        u.profile_photo_url,
        u.designation,
        u.organization
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
      `,
            [limit, offset]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM posts');

        const posts = postsQuery.rows.map(row => ({
            ...row,
            author: {
                full_name: row.full_name,
                profile_photo_url: row.profile_photo_url,
                designation: row.designation,
                organization: row.organization
            }
        }));

        return {
            posts,
            total: parseInt(countResult.rows[0].count)
        };
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM posts WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }
}
