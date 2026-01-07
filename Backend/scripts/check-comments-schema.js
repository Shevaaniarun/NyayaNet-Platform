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

async function checkSchema() {
    try {
        await client.connect();
        console.log('✅ Connected!');

        // Check columns of post_comments
        const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'post_comments'
        ORDER BY ordinal_position
    `);
        console.log('Columns in post_comments:');
        console.table(res.rows);

        await client.end();
    } catch (err) {
        console.error('Database query error:', err);
        process.exit(1);
    }
}

checkSchema();
