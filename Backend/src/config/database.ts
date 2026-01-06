import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL or construct from individual variables
const getConnectionString = (): string => {
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

const pool = new Pool({
  connectionString: getConnectionString(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err: Error) => {
  console.error('❌ Database connection error:', err.message);
});

// Test connection immediately
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('📊 Database test query successful');
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
    console.error('Connection string:', getConnectionString().replace(/:[^:@]+@/, ':***@'));
    console.error('Check your DATABASE_URL in .env file or run: npm run db:setup');
  }
})();

export default pool;