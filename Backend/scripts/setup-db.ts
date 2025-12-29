// Database setup script - Run this to create all tables
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const getConnectionString = () => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;
};

const pool = new Pool({
    connectionString: getConnectionString(),
});

const schema = `
-- =============================================
-- ENUM TYPES (with IF NOT EXISTS handling)
-- =============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('LAW_STUDENT', 'LAWYER', 'JUDGE', 'LEGAL_PROFESSIONAL', 'ADVOCATE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_type AS ENUM ('POST', 'QUESTION', 'ARTICLE', 'ANNOUNCEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE discussion_type AS ENUM ('GENERAL', 'CASE_ANALYSIS', 'LEGAL_QUERY', 'OPINION_POLL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('IMAGE', 'PDF', 'DOCUMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_mode AS ENUM ('RETRIEVAL', 'PREDICTION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ai_request_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE law_category AS ENUM ('CONSUMER_LAW', 'CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'CONSTITUTIONAL_LAW', 'FAMILY_LAW', 'TAX_LAW', 'LABOR_LAW', 'INTELLECTUAL_PROPERTY', 'CYBER_LAW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    designation VARCHAR(100),
    organization VARCHAR(255),
    area_of_interest TEXT[] DEFAULT ARRAY['Consumer Law'],
    bar_council_number VARCHAR(50) UNIQUE,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    bio TEXT,
    location VARCHAR(255),
    website_url TEXT,
    linkedin_url TEXT,
    profile_photo_url TEXT,
    profile_photo_thumbnail_url TEXT,
    cover_photo_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    discussion_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- =============================================
-- 2. USER_CERTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    credential_id VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    certificate_url TEXT NOT NULL,
    file_type media_type NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. USER_FOLLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status connection_status DEFAULT 'ACCEPTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- =============================================
-- 4. POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    post_type post_type NOT NULL DEFAULT 'POST',
    content_format VARCHAR(20) DEFAULT 'TEXT' CHECK (content_format IN ('TEXT', 'HTML', 'MARKDOWN')),
    tags TEXT[],
    is_public BOOLEAN DEFAULT TRUE,
    allow_comments BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. POST_MEDIA TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. DISCUSSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    discussion_type discussion_type DEFAULT 'LEGAL_QUERY',
    category law_category NOT NULL DEFAULT 'CONSUMER_LAW',
    tags TEXT[],
    is_resolved BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    best_answer_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. DISCUSSION_REPLIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'TEXT',
    media_url TEXT,
    media_type media_type,
    upvote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. USER_BOOKMARKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('POST', 'DISCUSSION', 'AI_RESULT', 'LAW_SECTION')),
    entity_id UUID NOT NULL,
    folder VARCHAR(100) DEFAULT 'GENERAL',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_id)
);

-- =============================================
-- 9. POST_LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'LIKE' CHECK (reaction_type IN ('LIKE', 'LOVE', 'INSIGHTFUL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- =============================================
-- 10. POST_COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- =============================================
-- INSERT SAMPLE USER FOR TESTING
-- =============================================
INSERT INTO users (email, password_hash, full_name, role, designation, organization, area_of_interest, experience_years, bio, location, profile_photo_url)
VALUES (
    'priya.sharma@example.com',
    '$2b$10$dummy_hash_for_testing',
    'Adv. Priya Sharma',
    'LAWYER',
    'Senior Advocate',
    'Sharma & Associates',
    ARRAY['Consumer Law', 'Contract Law'],
    12,
    'Senior Advocate specializing in Consumer Protection Act and Contract Law. Practicing at Supreme Court of India.',
    'New Delhi, India',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
)
ON CONFLICT (email) DO NOTHING;
`;

async function setupDatabase() {
    console.log('🔧 Starting database setup...');
    console.log('📊 Connection:', getConnectionString().replace(/:[^:@]+@/, ':***@'));

    try {
        await pool.query(schema);
        console.log('✅ All tables created successfully!');

        // Verify tables
        const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
        console.log('📋 Created tables:');
        result.rows.forEach((row: any) => console.log(`   - ${row.table_name}`));

        // Check sample user
        const userCheck = await pool.query('SELECT id, email, full_name FROM users LIMIT 1');
        if (userCheck.rows.length > 0) {
            console.log('👤 Sample user:', userCheck.rows[0].full_name);
        }

        console.log('\\n🎉 Database setup complete!');
    } catch (error: any) {
        console.error('❌ Error setting up database:', error.message);
        throw error;
    } finally {
        await pool.end();
    }
}

setupDatabase();
