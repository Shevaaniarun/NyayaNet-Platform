import pool from '../config/database';

export interface BookmarkResult {
    bookmarked: boolean;
    saveCount: number;
}

export class UserBookmarkModel {
    static async toggleBookmark(userId: string, entityType: string, entityId: string): Promise<BookmarkResult> {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if already bookmarked
            const checkQuery = `
        SELECT 1 FROM user_bookmarks 
        WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3
      `;
            const checkResult = await client.query(checkQuery, [userId, entityType, entityId]);

            let bookmarked = false;

            if (checkResult.rows.length > 0) {
                // Remove bookmark
                await client.query(
                    'DELETE FROM user_bookmarks WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
                    [userId, entityType, entityId]
                );

                // Update save count on the entity table if it's a discussion
                if (entityType === 'DISCUSSION') {
                    await client.query(
                        'UPDATE discussions SET save_count = GREATEST(0, save_count - 1) WHERE id = $1',
                        [entityId]
                    );
                }
                bookmarked = false;
            } else {
                // Add bookmark
                await client.query(
                    `INSERT INTO user_bookmarks (user_id, entity_type, entity_id) 
           VALUES ($1, $2, $3)`,
                    [userId, entityType, entityId]
                );

                // Update save count on the entity table if it's a discussion
                if (entityType === 'DISCUSSION') {
                    await client.query(
                        'UPDATE discussions SET save_count = save_count + 1 WHERE id = $1',
                        [entityId]
                    );
                }
                bookmarked = true;
            }

            await client.query('COMMIT');

            // Get new count if it's a discussion
            let saveCount = 0;
            if (entityType === 'DISCUSSION') {
                const countResult = await client.query(
                    'SELECT save_count FROM discussions WHERE id = $1',
                    [entityId]
                );
                saveCount = countResult.rows[0]?.save_count || 0;
            }

            return {
                bookmarked,
                saveCount
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async isBookmarked(userId: string, entityType: string, entityId: string): Promise<boolean> {
        const result = await pool.query(
            'SELECT 1 FROM user_bookmarks WHERE user_id = $1 AND entity_type = $2 AND entity_id = $3',
            [userId, entityType, entityId]
        );
        return result.rows.length > 0;
    }
}
