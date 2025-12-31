const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function fixSchema() {
    console.log('Fixing schema...');
    try {
        // Check if column exists
        const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='discussion_upvotes' AND column_name='discussion_id';
    `);

        if (checkResult.rows.length === 0) {
            console.log('Adding discussion_id column...');
            await pool.query(`
        ALTER TABLE discussion_upvotes 
        ADD COLUMN discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE;
      `);

            await pool.query(`
        ALTER TABLE discussion_upvotes 
        ALTER COLUMN reply_id DROP NOT NULL;
      `);

            await pool.query(`
        ALTER TABLE discussion_upvotes 
        ADD CONSTRAINT upvote_target_check 
        CHECK ((reply_id IS NOT NULL AND discussion_id IS NULL) OR (reply_id IS NULL AND discussion_id IS NOT NULL));
      `);

            console.log('Column added and constraints updated.');
        } else {
            console.log('Column already exists.');
        }
    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await pool.end();
    }
}

fixSchema();
