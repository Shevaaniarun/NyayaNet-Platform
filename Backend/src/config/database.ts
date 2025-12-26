import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL or construct from individual variables
const getConnectionString = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  return `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;
};

const pool = new Pool({
  connectionString: getConnectionString(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

// Test connection immediately
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('📊 Database test query successful');
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
    console.error('Check your DATABASE_URL in .env file');
  }
})();

export default pool;