import pool from '../config/database';
import { UpdateProfileInput, ProfileResponse } from '../types/profileTypes';

export class UserModel {
    static async findById(id: string, requesterId?: string): Promise<ProfileResponse | null> {
        const query = `
      SELECT 
        u.id, u.email, u.full_name, u.role, u.designation, u.organization,
        u.area_of_interest, u.experience_years, u.bio, u.location,
        u.website_url, u.linkedin_url, u.profile_photo_url, u.cover_photo_url,
        u.follower_count, u.following_count, u.post_count, u.discussion_count, u.created_at,
        ${requesterId ? `EXISTS(SELECT 1 FROM user_follows uf WHERE uf.follower_id = $2 AND uf.following_id = u.id AND uf.status = 'ACCEPTED') as is_following` : 'false as is_following'}
      FROM users u WHERE u.id = $1 AND u.is_active = true;
    `;
        const params = requesterId ? [id, requesterId] : [id];
        const result = await pool.query(query, params);
        if (!result.rows[0]) return null;
        const row = result.rows[0];
        return {
            id: row.id, fullName: row.full_name, email: row.email, role: row.role,
            designation: row.designation, organization: row.organization,
            areaOfInterest: row.area_of_interest || [], experienceYears: row.experience_years,
            bio: row.bio, profilePhotoUrl: row.profile_photo_url, coverPhotoUrl: row.cover_photo_url,
            location: row.location, websiteUrl: row.website_url, linkedinUrl: row.linkedin_url,
            followerCount: row.follower_count, followingCount: row.following_count,
            postCount: row.post_count, discussionCount: row.discussion_count,
            isFollowing: row.is_following, createdAt: row.created_at.toISOString()
        };
    }

    static async update(userId: string, updates: UpdateProfileInput): Promise<ProfileResponse | null> {
        const fieldMappings: Record<string, string> = {
            fullName: 'full_name', designation: 'designation', organization: 'organization',
            areaOfInterest: 'area_of_interest', bio: 'bio', location: 'location',
            websiteUrl: 'website_url', linkedinUrl: 'linkedin_url'
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
        if (updateFields.length === 0) return this.findById(userId);
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND is_active = true RETURNING *;`;
        await pool.query(query, values);
        return this.findById(userId);
    }

    static async updateProfilePhoto(userId: string, photoUrl: string, thumbnailUrl?: string): Promise<boolean> {
        const result = await pool.query(
            `UPDATE users SET profile_photo_url = $1, profile_photo_thumbnail_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND is_active = true;`,
            [photoUrl, thumbnailUrl, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async updateCoverPhoto(userId: string, coverUrl: string): Promise<boolean> {
        const result = await pool.query(
            `UPDATE users SET cover_photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_active = true;`,
            [coverUrl, userId]
        );
        return (result.rowCount ?? 0) > 0;
    }

    static async getUserPosts(userId: string, page = 1, limit = 20, sort = 'newest') {
        const offset = (page - 1) * limit;
        const orderBy = sort === 'popular' ? 'p.like_count DESC' : 'p.created_at DESC';
        const countResult = await pool.query(`SELECT COUNT(*) FROM posts p WHERE p.user_id = $1 AND p.is_public = true`, [userId]);
        const total = parseInt(countResult.rows[0].count);
        const result = await pool.query(
            `SELECT id, title, content, post_type, tags, like_count, comment_count, view_count, created_at
       FROM posts WHERE user_id = $1 AND is_public = true ORDER BY ${orderBy} LIMIT $2 OFFSET $3;`,
            [userId, limit, offset]
        );
        return {
            posts: result.rows.map((row: any) => ({
                id: row.id, title: row.title, content: row.content, postType: row.post_type,
                tags: row.tags || [], likeCount: row.like_count, commentCount: row.comment_count,
                viewCount: row.view_count, createdAt: row.created_at.toISOString()
            })),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    static async getUserDiscussions(userId: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const countResult = await pool.query(`SELECT COUNT(*) FROM discussions WHERE user_id = $1 AND is_public = true`, [userId]);
        const total = parseInt(countResult.rows[0].count);
        const result = await pool.query(
            `SELECT id, title, description, category, reply_count, upvote_count, is_resolved, created_at
       FROM discussions WHERE user_id = $1 AND is_public = true ORDER BY created_at DESC LIMIT $2 OFFSET $3;`,
            [userId, limit, offset]
        );
        return {
            discussions: result.rows.map((row: any) => ({
                id: row.id, title: row.title, description: row.description, category: row.category,
                replyCount: row.reply_count, upvoteCount: row.upvote_count, isResolved: row.is_resolved,
                createdAt: row.created_at.toISOString()
            })),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    static async getUserBookmarks(userId: string, folder?: string, entityType?: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        let whereConditions = ['ub.user_id = $1'];
        const params: any[] = [userId];
        let paramIndex = 2;
        if (folder) { whereConditions.push(`ub.folder = $${paramIndex}`); params.push(folder); paramIndex++; }
        if (entityType) { whereConditions.push(`ub.entity_type = $${paramIndex}`); params.push(entityType); paramIndex++; }
        const whereClause = whereConditions.join(' AND ');
        const countResult = await pool.query(`SELECT COUNT(*) FROM user_bookmarks ub WHERE ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count);
        params.push(limit, offset);
        const result = await pool.query(
            `SELECT id, entity_type, entity_id, folder, notes, created_at FROM user_bookmarks ub WHERE ${whereClause}
       ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1};`, params
        );
        const foldersResult = await pool.query(`SELECT DISTINCT folder FROM user_bookmarks WHERE user_id = $1`, [userId]);
        return {
            bookmarks: result.rows.map((row: any) => ({
                id: row.id, entityType: row.entity_type, entityId: row.entity_id,
                folder: row.folder, notes: row.notes, createdAt: row.created_at.toISOString()
            })),
            folders: foldersResult.rows.map((r: any) => r.folder),
            pagination: { total, page, limit, pages: Math.ceil(total / limit) }
        };
    }

    static async searchUserContent(userId: string, query: string, type?: string) {
        const searchTerm = `%${query}%`;
        const results: any = { posts: [], discussions: [] };
        if (!type || type === 'posts') {
            const postsResult = await pool.query(
                `SELECT id, title, LEFT(content, 150) as excerpt, created_at FROM posts
         WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2) ORDER BY created_at DESC LIMIT 10;`,
                [userId, searchTerm]
            );
            results.posts = postsResult.rows.map((row: any) => ({
                id: row.id, title: row.title, excerpt: row.excerpt, createdAt: row.created_at.toISOString()
            }));
        }
        if (!type || type === 'discussions') {
            const discussionsResult = await pool.query(
                `SELECT id, title, LEFT(description, 150) as excerpt, created_at FROM discussions
         WHERE user_id = $1 AND (title ILIKE $2 OR description ILIKE $2) ORDER BY created_at DESC LIMIT 10;`,
                [userId, searchTerm]
            );
            results.discussions = discussionsResult.rows.map((row: any) => ({
                id: row.id, title: row.title, excerpt: row.excerpt, createdAt: row.created_at.toISOString()
            }));
        }
        return { results };
    }
}
