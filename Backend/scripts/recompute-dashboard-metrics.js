#!/usr/bin/env node
const { Client } = require('pg');
require('dotenv').config();

const getConnectionConfig = () => {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL };
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'nyayanet'
  };
};

const client = new Client(getConnectionConfig());

(async () => {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected. Running recompute operations...');

    // Ensure columns exist
    const alterSql = `
      ALTER TABLE user_contribution_summary
        ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS post_likes_received INTEGER DEFAULT 0;
    `;

    console.log('Ensuring columns exist (followers_count, post_likes_received)');
    await client.query(alterSql);
    console.log('Columns ensured.');

    // Check if user_follows table exists
    const followsExists = await client.query("SELECT to_regclass('public.user_follows') as exists");
    const postLikesExists = await client.query("SELECT to_regclass('public.post_likes') as exists");

    // Recompute followers_count if table exists
    if (followsExists.rows[0].exists) {
      console.log('Recomputing followers_count from user_follows...');
      const recomputeFollowers = `
        UPDATE user_contribution_summary ucs
        SET followers_count = COALESCE(sub.count, 0)
        FROM (
          SELECT following_id AS user_id, COUNT(*) AS count
          FROM user_follows
          GROUP BY following_id
        ) sub
        WHERE ucs.user_id = sub.user_id;
      `;
      await client.query(recomputeFollowers);
      // Ensure zeros for users with no followers
      await client.query("UPDATE user_contribution_summary SET followers_count = 0 WHERE followers_count IS NULL;");
      console.log('followers_count recomputed.');
    } else {
      console.warn('user_follows table not found. Skipping followers_count recompute.');
    }

    // Recompute post_likes_received if post_likes exists
    if (postLikesExists.rows[0].exists) {
      console.log('Recomputing post_likes_received from post_likes...');
      const recomputeLikes = `
        UPDATE user_contribution_summary ucs
        SET post_likes_received = COALESCE(sub.like_count, 0)
        FROM (
          SELECT p.user_id AS user_id, COUNT(pl.*) AS like_count
          FROM post_likes pl
          JOIN posts p ON pl.post_id = p.id
          GROUP BY p.user_id
        ) sub
        WHERE ucs.user_id = sub.user_id;
      `;
      await client.query(recomputeLikes);
      await client.query("UPDATE user_contribution_summary SET post_likes_received = 0 WHERE post_likes_received IS NULL;");
      console.log('post_likes_received recomputed.');
    } else {
      console.warn('post_likes table not found. Skipping post_likes_received recompute.');
    }

    console.log('Recompute finished. Verifying sample values for current user if available...');
    try {
      const userStr = process.env.DEBUG_USER_ID || null;
      if (userStr) {
        const { rows } = await client.query('SELECT user_id, followers_count, post_likes_received FROM user_contribution_summary WHERE user_id = $1 LIMIT 1', [userStr]);
        console.log('Sample row:', rows[0]);
      } else {
        const { rows } = await client.query('SELECT user_id, followers_count, post_likes_received FROM user_contribution_summary LIMIT 5');
        console.log('Sample rows:');
        console.table(rows);
      }
    } catch (err) {
      console.warn('Could not print sample rows:', err.message);
    }

    console.log('All done.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error while running recompute script:', err.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
})();
