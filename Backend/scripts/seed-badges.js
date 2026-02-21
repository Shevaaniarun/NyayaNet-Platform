#!/usr/bin/env node
require('dotenv').config();
const { Client } = require('pg');

// Build connection config from DATABASE_URL or env vars
const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;

const badges = [
  { code: 'FIRST_CONTRIBUTION', title: 'First Contribution', description: 'Made your first contribution', threshold: 1 },
  { code: 'CONTRIBUTOR_10', title: 'Contributor ×10', description: 'Completed 10 contributions', threshold: 10 },
  { code: 'CONTRIBUTOR_50', title: 'Contributor ×50', description: 'Completed 50 contributions', threshold: 50 },
  { code: 'CONTRIBUTOR_100', title: 'Contributor ×100', description: 'Completed 100 contributions', threshold: 100 },
  { code: 'CONTRIBUTOR_500', title: 'Contributor ×500', description: 'Completed 500 contributions', threshold: 500 },

  { code: 'STREAK_7', title: '7 Day Streak', description: 'Active for 7 consecutive days', threshold: 7 },
  { code: 'STREAK_30', title: '30 Day Streak', description: 'Active for 30 consecutive days', threshold: 30 },
  { code: 'STREAK_100', title: '100 Day Streak', description: 'Active for 100 consecutive days', threshold: 100 },

  { code: 'BEST_ANSWER_5', title: 'Best Answer ×5', description: '5 answers marked as best', threshold: 5 },
  { code: 'BEST_ANSWER_10', title: 'Best Answer ×10', description: '10 answers marked as best', threshold: 10 },
  { code: 'BEST_ANSWER_25', title: 'Best Answer ×25', description: '25 answers marked as best', threshold: 25 },

  { code: 'FOLLOWERS_10', title: '10 Followers', description: 'Gained 10 followers', threshold: 10 },
  { code: 'FOLLOWERS_50', title: '50 Followers', description: 'Gained 50 followers', threshold: 50 },
  { code: 'FOLLOWERS_100', title: '100 Followers', description: 'Gained 100 followers', threshold: 100 },
  { code: 'FOLLOWERS_500', title: '500 Followers', description: 'Gained 500 followers', threshold: 500 },

  { code: 'POST_LIKES_10', title: '10 Post Likes', description: 'Your posts received 10 likes', threshold: 10 },
  { code: 'POST_LIKES_50', title: '50 Post Likes', description: 'Your posts received 50 likes', threshold: 50 },
  { code: 'POST_LIKES_100', title: '100 Post Likes', description: 'Your posts received 100 likes', threshold: 100 },
  { code: 'POST_LIKES_500', title: '500 Post Likes', description: 'Your posts received 500 likes', threshold: 500 },
  { code: 'POST_LIKES_1000', title: '1000 Post Likes', description: 'Your posts received 1000 likes', threshold: 1000 },

  { code: 'AI_PIONEER', title: 'AI Pioneer', description: 'Used AI features', threshold: 1 },
  { code: 'BOOKWORM', title: 'Bookworm', description: 'Saved 10 bookmarks', threshold: 10 }
];

(async () => {
  const client = new Client({ connectionString, ssl: process.env.DB_SSL === 'true' });

  try {
    await client.connect();
    console.log('Connected to DB');

    for (const b of badges) {
      const res = await client.query(
        `INSERT INTO badges (code, title, description, threshold) VALUES ($1,$2,$3,$4) ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, threshold = EXCLUDED.threshold RETURNING id, code`,
        [b.code, b.title, b.description, b.threshold]
      );
      console.log(`Upserted badge: ${res.rows[0].code}`);
    }

    console.log('All badges ensured.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
