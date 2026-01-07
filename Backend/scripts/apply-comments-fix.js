const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from parent directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const getConnectionString = () => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    const user = process.env.DB_USER || 'postgres';
    const password = process.env.DB_PASSWORD || 'postgres';
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5433';
    const database = process.env.DB_NAME || 'nyayanet';
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

const connectionString = getConnectionString();
const client = new Client({ connectionString });

async function applyFix() {
    try {
        await client.connect();
        console.log('✅ Connected!');

        console.log('Adding is_deleted column to post_comments...');
        await client.query(`
        ALTER TABLE post_comments 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE
    `);
        console.log('✅ Column added successfully');

        await client.end();
    } catch (err) {
        console.error('Database fix error:', err);
        process.exit(1);
    }
}

applyFix();
