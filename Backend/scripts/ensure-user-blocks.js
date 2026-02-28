require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ensureUserBlocks() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(blocker_id, blocked_id),
        CHECK(blocker_id <> blocked_id)
      )
    `);
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id)');
        console.log('user_blocks table ensured');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

ensureUserBlocks();
