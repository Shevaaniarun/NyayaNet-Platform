const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from parent directory
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
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

const client = new Client({
    connectionString: connectionString
});

async function listUsers() {
    console.log('DEBUG: DB_PORT in env:', process.env.DB_PORT);
    console.log('Connecting to:', connectionString.replace(/:[^:]*@/, ':****@'));
    try {
        await client.connect();
        console.log('✅ Connected!');

        // Check tables
        const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
        console.log('Tables in DB:', tables.rows.map(r => r.table_name).join(', '));

        const res = await client.query('SELECT id, email, role, is_active FROM users');
        console.log('Users found:', res.rows.length);
        console.table(res.rows);
        await client.end();
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
}

listUsers();
