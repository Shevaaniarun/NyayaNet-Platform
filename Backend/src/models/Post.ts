import pool from '../config/database';

export interface CreatePostInput {
    content: string;
    title?: string;
    postType?: 'POST' | 'QUESTION' | 'ARTICLE' | 'ANNOUNCEMENT';
    tags?: string[];
    isPublic?: boolean;
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
    author?: {
        id: string;
        fullName: string;
        profilePhotoUrl: string | null;
        designation: string | null;
    };
}

export class PostModel {
    static async create(userId: string, input: CreatePostInput): Promise<PostResponse> {
        const { content, title, postType = 'POST', tags = [], isPublic = true } = input;

        const result = await pool.query(
            `INSERT INTO posts (user_id, title, content, post_type, tags, is_public, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, user_id, title, content, post_type, tags, is_public, view_count, like_count, comment_count, created_at, updated_at`,
            [userId, title || null, content, postType, tags, isPublic]
        );

        const row = result.rows[0];
        return this.mapRowToResponse(row);
    }

    static async findById(id: string, requesterId?: string): Promise<PostResponse | null> {
        const result = await pool.query(
            `SELECT p.*, u.full_name, u.profile_photo_url, u.designation
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1`,
            [id]
        );

        if (!result.rows[0]) return null;

        const row = result.rows[0];
        return this.mapRowToResponse(row, true);
    }

    static async update(id: string, userId: string, updates: Partial<CreatePostInput>): Promise<PostResponse | null> {
        // First verify ownership
        const existing = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
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

        if (updateFields.length === 0) return this.findById(id);

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await pool.query(
            `UPDATE posts SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return this.findById(id);
    }

    static async delete(id: string, userId: string): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM posts WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async getFeed(page = 1, limit = 20): Promise<{ posts: PostResponse[], pagination: any }> {
        const offset = (page - 1) * limit;

        const countResult = await pool.query('SELECT COUNT(*) FROM posts WHERE is_public = true');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            `SELECT p.*, u.full_name, u.profile_photo_url, u.designation
             FROM posts p
             JOIN users u ON p.user_id = u.id
             WHERE p.is_public = true
             ORDER BY p.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return {
            posts: result.rows.map((row: any) => this.mapRowToResponse(row, true)),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        };
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
            viewCount: row.view_count,
            likeCount: row.like_count,
            commentCount: row.comment_count,
            createdAt: row.created_at.toISOString(),
            updatedAt: row.updated_at.toISOString()
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
