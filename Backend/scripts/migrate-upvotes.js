const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nyayanet'
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration: adding discussion_id to discussion_upvotes');
        await client.query('BEGIN');

        // Add column
        await client.query(`
      ALTER TABLE discussion_upvotes 
      ADD COLUMN IF NOT EXISTS discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE
    `);

        // Make reply_id optional
        await client.query(`
      ALTER TABLE discussion_upvotes 
      ALTER COLUMN reply_id DROP NOT NULL
    `);

        // Add check constraint
        await client.query(`
      ALTER TABLE discussion_upvotes 
      DROP CONSTRAINT IF EXISTS one_target_check;
      
      ALTER TABLE discussion_upvotes 
      ADD CONSTRAINT one_target_check 
      CHECK ((reply_id IS NULL AND discussion_id IS NOT NULL) OR (reply_id NOT NULL AND discussion_id IS NULL));
    `);

        // Add unique constraint per user/thread
        await client.query(`
      ALTER TABLE discussion_upvotes 
      DROP CONSTRAINT IF EXISTS unique_discussion_upvote;
      
      CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_discussion_upvote 
      ON discussion_upvotes (discussion_id, user_id) 
      WHERE discussion_id IS NOT NULL;
    `);

        await client.query('COMMIT');
        console.log('Migration successful!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
