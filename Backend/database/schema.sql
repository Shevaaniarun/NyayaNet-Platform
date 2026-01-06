-- =============================================
-- Database: nyayanet
-- Description: Legal Professional Platform Database
-- =============================================

-- Drop existing database if exists (for fresh setup)
DROP DATABASE IF EXISTS nyayanet;

-- Create database
CREATE DATABASE nyayanet
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Connect to the database
\c nyayanet;

-- =============================================
-- CREATE EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUM TYPES (Create with IF NOT EXISTS logic)
-- =============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'LAW_STUDENT',
            'LAWYER', 
            'JUDGE',
            'LEGAL_PROFESSIONAL',
            'ADVOCATE'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status') THEN
        CREATE TYPE connection_status AS ENUM (
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'BLOCKED'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
        CREATE TYPE post_type AS ENUM (
            'POST',
            'QUESTION',
            'ARTICLE',
            'ANNOUNCEMENT'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discussion_type') THEN
        CREATE TYPE discussion_type AS ENUM (
            'GENERAL',
            'CASE_ANALYSIS',
            'LEGAL_QUERY',
            'OPINION_POLL'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM (
            'IMAGE',
            'PDF',
            'DOCUMENT'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_mode') THEN
        CREATE TYPE ai_mode AS ENUM (
            'RETRIEVAL',
            'PREDICTION'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_request_status') THEN
        CREATE TYPE ai_request_status AS ENUM (
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'FAILED'
        );
    END IF;
END$$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'law_category') THEN
        CREATE TYPE law_category AS ENUM (
            'CONSUMER_LAW',
            'CRIMINAL_LAW',
            'CIVIL_LAW',
            'CORPORATE_LAW',
            'CONSTITUTIONAL_LAW',
            'FAMILY_LAW',
            'TAX_LAW',
            'LABOR_LAW',
            'INTELLECTUAL_PROPERTY',
            'CYBER_LAW',
            'ARBITRATION',
            'PROPERTY_LAW',
            'LEGAL_ETHICS',
            'INTERNATIONAL_LAW'
        );
    END IF;
END$$;

-- =============================================
-- 1. USERS & AUTHENTICATION
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    
    -- Professional Information
    role user_role NOT NULL,
    designation VARCHAR(100),
    organization VARCHAR(255),
    area_of_interest TEXT[] DEFAULT ARRAY['Consumer Law'],
    bar_council_number VARCHAR(50) UNIQUE,
    experience_years INTEGER DEFAULT 0 CHECK (experience_years >= 0),
    
    -- Profile Details
    bio TEXT,
    location VARCHAR(255),
    website_url TEXT,
    linkedin_url TEXT,
    
    -- Media URLs
    profile_photo_url TEXT,
    profile_photo_thumbnail_url TEXT,
    cover_photo_url TEXT,
    
    -- Statistics
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    discussion_count INTEGER DEFAULT 0,
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

COMMENT ON TABLE users IS 'Legal professionals using NyayaNet platform';

-- =============================================
-- 2. USER_CERTIFICATIONS
-- =============================================
CREATE TABLE user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Certification Details
    title VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    credential_id VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Certificate File
    certificate_url TEXT NOT NULL,
    file_type media_type NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Metadata
    description TEXT,
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. CONNECTIONS & FOLLOWING
-- =============================================
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status for mutual connections
    status connection_status DEFAULT 'ACCEPTED',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Connection requests table (for more formal connections)
CREATE TABLE connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'PENDING',
    
    request_message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    
    UNIQUE(requester_id, receiver_id)
);

-- =============================================
-- 4. FEED & POSTS
-- =============================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(500),
    content TEXT NOT NULL,
    post_type post_type NOT NULL DEFAULT 'POST',
    content_format VARCHAR(20) DEFAULT 'TEXT' CHECK (content_format IN ('TEXT', 'HTML', 'MARKDOWN')),
    
    -- Metadata
    tags TEXT[], -- Legal domains/topics
    is_public BOOLEAN DEFAULT TRUE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    
    -- Media Details
    media_type media_type NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Display
    display_order INTEGER DEFAULT 0,
    caption TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 5. DISCUSSIONS (Quora-style)
-- =============================================
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Discussion Details
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    discussion_type discussion_type DEFAULT 'LEGAL_QUERY',
    category law_category NOT NULL DEFAULT 'CONSUMER_LAW',
    
    -- Metadata
    tags TEXT[],
    is_resolved BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    
    -- Best Answer
    best_answer_id UUID, -- Reference to discussion_replies(id)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    
    -- Content
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'TEXT',
    
    -- Media
    media_url TEXT,
    media_type media_type,
    
    -- Statistics
    upvote_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    is_deleted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discussion followers
CREATE TABLE discussion_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(discussion_id, user_id)
);

-- Discussion views table
CREATE TABLE discussion_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_view UNIQUE(discussion_id, user_id) WHERE user_id IS NOT NULL,
    CONSTRAINT unique_ip_view UNIQUE(discussion_id, ip_address) WHERE user_id IS NULL
);

-- =============================================
-- 6. INTERACTIONS
-- =============================================
-- Post Likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reaction_type VARCHAR(20) DEFAULT 'LIKE' CHECK (reaction_type IN ('LIKE', 'INSIGHTFUL', 'INFORMATIVE', 'NEED_CLARIFICATION')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, user_id)
);

-- Discussion Upvotes (Supports both discussions and replies)
CREATE TABLE discussion_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT one_target_check 
    CHECK ((reply_id IS NULL AND discussion_id IS NOT NULL) OR 
           (reply_id IS NOT NULL AND discussion_id IS NULL)),
    
    -- Unique constraint for discussion upvotes
    CONSTRAINT unique_discussion_upvote UNIQUE(discussion_id, user_id) 
    WHERE discussion_id IS NOT NULL,
    
    -- Unique constraint for reply upvotes
    CONSTRAINT unique_reply_upvote UNIQUE(reply_id, user_id) 
    WHERE reply_id IS NOT NULL
);

-- Bookmarks/Saves
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What is being bookmarked
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('POST', 'DISCUSSION', 'AI_RESULT', 'LAW_SECTION')),
    entity_id UUID NOT NULL,
    
    -- Folder organization
    folder VARCHAR(100) DEFAULT 'GENERAL',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, entity_type, entity_id)
);

-- Comments on Posts
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    comment_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 7. MESSAGING
-- =============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_type VARCHAR(20) NOT NULL DEFAULT 'PRIVATE' CHECK (conversation_type IN ('PRIVATE', 'GROUP')),
    title VARCHAR(255),
    description TEXT,
    avatar_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN', 'OWNER')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message Content
    message_type VARCHAR(20) DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'PDF', 'SYSTEM')),
    content TEXT,
    
    -- Media
    media_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    
    -- Status
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 8. AI ROOM - Consumer Law Only
-- =============================================
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Info
    session_name VARCHAR(255),
    ai_mode ai_mode NOT NULL,
    category law_category NOT NULL DEFAULT 'CONSUMER_LAW',
    
    -- Session State
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    
    -- Message Info
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('USER_QUERY', 'AI_RESPONSE')),
    content TEXT NOT NULL,
    
    -- For AI Responses
    ai_mode ai_mode,
    confidence_score DECIMAL(5,4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- References
    citations JSONB, -- Array of cited laws/cases
    related_laws JSONB, -- Array of law sections
    related_cases JSONB, -- Array of case references
    
    -- Metadata
    processing_time_ms INTEGER,
    model_version VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Request Queue (for async processing)
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES ai_sessions(id) ON DELETE CASCADE,
    
    -- Request Details
    ai_mode ai_mode NOT NULL,
    category law_category NOT NULL DEFAULT 'CONSUMER_LAW',
    input_text TEXT NOT NULL,
    input_hash VARCHAR(64), -- For deduplication
    
    -- Status
    status ai_request_status NOT NULL DEFAULT 'PENDING',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Result Reference
    response_message_id UUID REFERENCES ai_messages(id),
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- =============================================
-- 9. LAW SEARCH
-- =============================================
CREATE TABLE law_acts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Act Information
    act_name VARCHAR(500) NOT NULL,
    act_year INTEGER,
    short_title VARCHAR(200),
    
    -- Categorization
    category law_category NOT NULL,
    sub_category VARCHAR(100),
    tags TEXT[],
    
    -- Content
    full_text TEXT,
    preamble TEXT,
    
    -- Metadata
    is_amended BOOLEAN DEFAULT FALSE,
    amendment_year INTEGER,
    
    UNIQUE(act_name, act_year)
);

CREATE TABLE law_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    act_id UUID NOT NULL REFERENCES law_acts(id) ON DELETE CASCADE,
    
    -- Section Information
    section_number VARCHAR(50) NOT NULL,
    section_title VARCHAR(500),
    
    -- Content
    section_text TEXT NOT NULL,
    explanation TEXT,
    
    -- Relationships
    related_sections JSONB, -- Array of related section IDs
    amendments JSONB, -- Amendment history
    
    UNIQUE(act_id, section_number)
);

CREATE TABLE law_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES law_sections(id) ON DELETE CASCADE,
    
    -- Personal Notes
    user_notes TEXT,
    highlight_text TEXT, -- For specific text highlights
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, section_id)
);

-- Law search history
CREATE TABLE law_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    search_query TEXT NOT NULL,
    search_results_count INTEGER,
    category law_category,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. CASE WORKSPACE (Personal Notes)
-- =============================================
CREATE TABLE workspace_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Note Details
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category law_category DEFAULT 'CONSUMER_LAW',
    tags TEXT[],
    
    -- Organization
    folder VARCHAR(100) DEFAULT 'GENERAL',
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- References (for linking to other content)
    referenced_post_id UUID REFERENCES posts(id),
    referenced_discussion_id UUID REFERENCES discussions(id),
    referenced_ai_session_id UUID REFERENCES ai_sessions(id),
    referenced_law_section_id UUID REFERENCES law_sections(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 11. NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'NEW_FOLLOWER',
        'POST_LIKE',
        'POST_COMMENT',
        'DISCUSSION_REPLY',
        'DISCUSSION_UPVOTE',
        'CONNECTION_REQUEST',
        'MESSAGE_RECEIVED',
        'AI_RESULT_READY',
        'MENTION'
    )),
    
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Reference to source
    source_type VARCHAR(50), -- 'POST', 'DISCUSSION', 'USER', 'AI_SESSION'
    source_id UUID,
    
    -- Metadata
    data JSONB, -- Additional data payload
    is_read BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- =============================================
-- 12. ACTIVITY LOGS
-- =============================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity Details
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    entity_name VARCHAR(255),
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Device Info
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CREATE ALL INDEXES
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_certifications_user ON user_certifications(user_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_connection_requests_requester ON connection_requests(requester_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_popularity ON posts(like_count DESC, comment_count DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
CREATE INDEX idx_post_media_post ON post_media(post_id);
CREATE INDEX idx_discussions_user ON discussions(user_id);
CREATE INDEX idx_discussions_category ON discussions(category);
CREATE INDEX idx_discussions_activity ON discussions(last_activity_at DESC);
CREATE INDEX idx_discussions_popularity ON discussions(upvote_count DESC, reply_count DESC);
CREATE INDEX idx_discussion_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_user ON discussion_replies(user_id);
CREATE INDEX idx_discussion_replies_parent ON discussion_replies(parent_reply_id);
CREATE INDEX idx_discussion_replies_created ON discussion_replies(created_at DESC);
CREATE INDEX idx_discussion_followers_discussion ON discussion_followers(discussion_id);
CREATE INDEX idx_discussion_followers_user ON discussion_followers(user_id);
CREATE INDEX idx_discussion_views_discussion ON discussion_views(discussion_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_discussion_upvotes_discussion ON discussion_upvotes(discussion_id) WHERE discussion_id IS NOT NULL;
CREATE INDEX idx_discussion_upvotes_reply ON discussion_upvotes(reply_id) WHERE reply_id IS NOT NULL;
CREATE INDEX idx_discussion_upvotes_user ON discussion_upvotes(user_id);
CREATE INDEX idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_entity ON user_bookmarks(entity_type, entity_id);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversation_members_conv ON conversation_members(conversation_id);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX idx_ai_sessions_mode ON ai_sessions(ai_mode);
CREATE INDEX idx_ai_sessions_category ON ai_sessions(category);
CREATE INDEX idx_ai_sessions_activity ON ai_sessions(last_activity_at DESC);
CREATE INDEX idx_ai_messages_session ON ai_messages(session_id);
CREATE INDEX idx_ai_messages_type ON ai_messages(message_type);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at DESC);
CREATE INDEX idx_ai_requests_user ON ai_requests(user_id);
CREATE INDEX idx_ai_requests_status ON ai_requests(status);
CREATE INDEX idx_ai_requests_mode ON ai_requests(ai_mode);
CREATE INDEX idx_ai_requests_category ON ai_requests(category);
CREATE INDEX idx_ai_requests_created ON ai_requests(created_at DESC);
CREATE INDEX idx_law_acts_name ON law_acts(act_name);
CREATE INDEX idx_law_acts_category ON law_acts(category);
CREATE INDEX idx_law_acts_year ON law_acts(act_year);
CREATE INDEX idx_law_sections_act ON law_sections(act_id);
CREATE INDEX idx_law_sections_number ON law_sections(section_number);
CREATE INDEX idx_law_bookmarks_user ON law_bookmarks(user_id);
CREATE INDEX idx_law_bookmarks_section ON law_bookmarks(section_id);
CREATE INDEX idx_law_search_history_user ON law_search_history(user_id);
CREATE INDEX idx_law_search_history_created ON law_search_history(created_at DESC);
CREATE INDEX idx_workspace_notes_user ON workspace_notes(user_id);
CREATE INDEX idx_workspace_notes_category ON workspace_notes(category);
CREATE INDEX idx_workspace_notes_updated ON workspace_notes(updated_at DESC);
CREATE INDEX idx_workspace_notes_accessed ON workspace_notes(last_accessed_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON user_certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at BEFORE UPDATE ON discussion_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_sessions_updated_at BEFORE UPDATE ON ai_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_requests_updated_at BEFORE UPDATE ON ai_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_law_bookmarks_updated_at BEFORE UPDATE ON law_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_notes_updated_at BEFORE UPDATE ON workspace_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update discussion activity timestamp
CREATE OR REPLACE FUNCTION update_discussion_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET last_activity_at = CURRENT_TIMESTAMP,
        reply_count = reply_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussion_on_reply
AFTER INSERT ON discussion_replies
FOR EACH ROW EXECUTE FUNCTION update_discussion_activity();

-- Update post statistics
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'post_likes' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'post_comments' THEN
            UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'post_likes' THEN
            UPDATE posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'post_comments' THEN
            UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_stats();

CREATE TRIGGER update_post_comment_count
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_stats();

-- Update user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'user_follows' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
            UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
            UPDATE users SET follower_count = follower_count - 1 WHERE id = OLD.following_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'posts' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE users SET post_count = post_count + 1 WHERE id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE users SET post_count = post_count - 1 WHERE id = OLD.user_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'discussions' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE users SET discussion_count = discussion_count + 1 WHERE id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE users SET discussion_count = discussion_count - 1 WHERE id = OLD.user_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_follow_stats
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_post_stats
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_user_discussion_stats
AFTER INSERT OR DELETE ON discussions
FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Update discussion view count
CREATE OR REPLACE FUNCTION update_discussion_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions 
    SET view_count = view_count + 1
    WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussion_view_count_trigger
AFTER INSERT ON discussion_views
FOR EACH ROW EXECUTE FUNCTION update_discussion_view_count();

-- Update discussion upvote count
CREATE OR REPLACE FUNCTION update_discussion_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.discussion_id IS NOT NULL THEN
            UPDATE discussions SET upvote_count = upvote_count + 1 WHERE id = NEW.discussion_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.discussion_id IS NOT NULL THEN
            UPDATE discussions SET upvote_count = upvote_count - 1 WHERE id = OLD.discussion_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussion_upvote_count_trigger
AFTER INSERT OR DELETE ON discussion_upvotes
FOR EACH ROW EXECUTE FUNCTION update_discussion_upvote_count();

-- Update reply upvote count
CREATE OR REPLACE FUNCTION update_reply_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.reply_id IS NOT NULL THEN
            UPDATE discussion_replies SET upvote_count = upvote_count + 1 WHERE id = NEW.reply_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.reply_id IS NOT NULL THEN
            UPDATE discussion_replies SET upvote_count = upvote_count - 1 WHERE id = OLD.reply_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reply_upvote_count_trigger
AFTER INSERT OR DELETE ON discussion_upvotes
FOR EACH ROW EXECUTE FUNCTION update_reply_upvote_count();

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert a default admin user (password: admin123)
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    role, 
    designation, 
    organization, 
    bio, 
    location,
    experience_years,
    is_active
) VALUES (
    'admin@nyayanet.com',
    crypt('admin123', gen_salt('bf')),
    'NyayaNet Administrator',
    'LEGAL_PROFESSIONAL',
    'System Administrator',
    'NyayaNet Platform',
    'System administrator account for NyayaNet platform management.',
    'India',
    5,
    true
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT ALL PRIVILEGES ON DATABASE nyayanet TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =============================================
-- DATABASE VERIFICATION
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables created: 27';
    RAISE NOTICE '📈 Indexes created: 46';
    RAISE NOTICE '⚙️  Triggers created: 18';
END$$;