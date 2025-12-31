const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function updateEnumAndSeed() {
    console.log('Updating law_category enum...');
    try {
        const categories = ['ARBITRATION', 'PROPERTY_LAW', 'LEGAL_ETHICS', 'INTERNATIONAL_LAW'];
        for (const cat of categories) {
            await pool.query(`ALTER TYPE law_category ADD VALUE IF NOT EXISTS '${cat}'`);
        }
        console.log('Enum updated successfully.');

        // Check if we have users
        const users = await pool.query('SELECT id FROM users LIMIT 1');
        if (users.rows.length > 0) {
            const userId = users.rows[0].id;
            console.log('Adding sample discussion...');
            await pool.query(`
        INSERT INTO discussions (user_id, title, description, discussion_type, category, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING;
      `, [userId, 'Sample Discussion for Verification', 'This is a sample discussion to verify that creation is working correctly after enum update.', 'GENERAL', 'CONSTITUTIONAL_LAW', ['test', 'verification']]);
            console.log('Sample discussion added.');
        }
    } catch (error) {
        if (error.code === '42710') {
            console.log('Enum values already exist.');
        } else {
            console.error('Error updating enum:', error);
        }
    } finally {
        await pool.end();
    }
}

updateEnumAndSeed();
