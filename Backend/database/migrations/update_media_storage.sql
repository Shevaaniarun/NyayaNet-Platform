-- Migration script to update post_media table
-- Adds media_data and media_mime_type columns while making media_url nullable

ALTER TABLE post_media ALTER COLUMN media_url DROP NOT NULL;
ALTER TABLE post_media ADD COLUMN IF NOT EXISTS media_data BYTEA;
ALTER TABLE post_media ADD COLUMN IF NOT EXISTS media_mime_type VARCHAR(100);

-- Migrate existing mime_type to media_mime_type if it's not set
UPDATE post_media SET media_mime_type = mime_type WHERE media_mime_type IS NULL AND mime_type IS NOT NULL;
