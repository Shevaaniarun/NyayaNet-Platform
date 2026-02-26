import pool from './src/config/database';

async function alterTable() {
    try {
        await pool.query('ALTER TABLE post_media ADD COLUMN IF NOT EXISTS media_mime_type VARCHAR(100);');
        await pool.query('ALTER TABLE post_media ADD COLUMN IF NOT EXISTS media_data BYTEA;');
        await pool.query('ALTER TABLE post_media ADD COLUMN IF NOT EXISTS file_size BIGINT;');
        await pool.query('ALTER TABLE post_media ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);');
        console.log('Columns added successfully');
    } catch (error) {
        console.error('Error adding columns', error);
    } finally {
        process.exit(0);
    }
}

alterTable();
