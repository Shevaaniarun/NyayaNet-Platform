import pool from '../config/database';

export class PostLikeModel {
  static async toggleLike(postId: string, userId: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const check = await client.query(
        'SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );

      if (check.rows.length) {
        await client.query(
          'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
        await client.query(
          'UPDATE posts SET like_count = like_count - 1 WHERE id = $1',
          [postId]
        );
        await client.query('COMMIT');
        return { liked: false };
      } else {
        await client.query(
          'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
        await client.query(
          'UPDATE posts SET like_count = like_count + 1 WHERE id = $1',
          [postId]
        );
        await client.query('COMMIT');
        return { liked: true };
      }
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
