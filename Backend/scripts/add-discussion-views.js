const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function migrate() {
    console.log('Creating discussion_views table...');
    try {
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS discussion_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        ip_address TEXT,
        viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(discussion_id, user_id)
      );
    `);

        // Also add an index for performance
        await pool.query('CREATE INDEX IF NOT EXISTS idx_discussion_views_discussion_id ON discussion_views(discussion_id);');

        // Add partial unique index for guest views by IP
        await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_discussion_views_guest_unique ON discussion_views(discussion_id, ip_address) WHERE user_id IS NULL;');

        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
