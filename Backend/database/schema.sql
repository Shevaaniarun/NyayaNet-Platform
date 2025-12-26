```sql
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
-- ENUM TYPES
-- =============================================
CREATE TYPE user_role AS ENUM (
    'LAW_STUDENT',
    'LAWYER', 
    'JUDGE',
    'LEGAL_PROFESSIONAL',
    'ADVOCATE'
);

CREATE TYPE connection_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'BLOCKED'
);

CREATE TYPE post_type AS ENUM (
    'POST',
    'QUESTION',
    'ARTICLE',
    'ANNOUNCEMENT'
);

CREATE TYPE discussion_type AS ENUM (
    'GENERAL',
    'CASE_ANALYSIS',
    'LEGAL_QUERY',
    'OPINION_POLL'
);

CREATE TYPE media_type AS ENUM (
    'IMAGE',
    'PDF',
    'DOCUMENT'
);

CREATE TYPE ai_mode AS ENUM (
    'RETRIEVAL',
    'PREDICTION'
);

CREATE TYPE ai_request_status AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED'
);

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
    'CYBER_LAW'
);

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
    last_login_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_certifications_user (user_id)
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
    INDEX idx_user_follows_follower (follower_id),
    INDEX idx_user_follows_following (following_id),
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
    
    UNIQUE(requester_id, receiver_id),
    INDEX idx_connection_requests_requester (requester_id),
    INDEX idx_connection_requests_receiver (receiver_id)
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
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_posts_user (user_id),
    INDEX idx_posts_type (post_type),
    INDEX idx_posts_created (created_at DESC),
    INDEX idx_posts_popularity (like_count DESC, comment_count DESC),
    INDEX idx_posts_tags USING GIN (tags)
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
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_post_media_post (post_id)
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
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_discussions_user (user_id),
    INDEX idx_discussions_category (category),
    INDEX idx_discussions_activity (last_activity_at DESC),
    INDEX idx_discussions_popularity (upvote_count DESC, reply_count DESC)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_discussion_replies_discussion (discussion_id),
    INDEX idx_discussion_replies_user (user_id),
    INDEX idx_discussion_replies_parent (parent_reply_id),
    INDEX idx_discussion_replies_created (created_at DESC)
);

-- Discussion followers
CREATE TABLE discussion_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(discussion_id, user_id),
    INDEX idx_discussion_followers_discussion (discussion_id),
    INDEX idx_discussion_followers_user (user_id)
);

-- =============================================
-- 6. INTERACTIONS
-- =============================================
-- Post Likes
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    reaction_type VARCHAR(20) DEFAULT 'LIKE' CHECK (reaction_type IN ('LIKE', 'LOVE', 'INSIGHTFUL')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(post_id, user_id),
    INDEX idx_post_likes_post (post_id),
    INDEX idx_post_likes_user (user_id)
);

-- Discussion Upvotes
CREATE TABLE discussion_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES discussion_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(reply_id, user_id),
    INDEX idx_discussion_upvotes_reply (reply_id),
    INDEX idx_discussion_upvotes_user (user_id)
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
    
    UNIQUE(user_id, entity_type, entity_id),
    INDEX idx_user_bookmarks_user (user_id),
    INDEX idx_user_bookmarks_entity (entity_type, entity_id)
);

-- Comments on Posts
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_post_comments_post (post_id),
    INDEX idx_post_comments_user (user_id),
    INDEX idx_post_comments_parent (parent_comment_id)
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
    last_message_at TIMESTAMP,
    
    INDEX idx_conversations_updated (updated_at DESC)
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(20) DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN', 'OWNER')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    
    UNIQUE(conversation_id, user_id),
    INDEX idx_conversation_members_conv (conversation_id),
    INDEX idx_conversation_members_user (user_id)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_created (created_at DESC)
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
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ai_sessions_user (user_id),
    INDEX idx_ai_sessions_mode (ai_mode),
    INDEX idx_ai_sessions_category (category),
    INDEX idx_ai_sessions_activity (last_activity_at DESC)
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
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ai_messages_session (session_id),
    INDEX idx_ai_messages_type (message_type),
    INDEX idx_ai_messages_created (created_at DESC)
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
    completed_at TIMESTAMP,
    
    INDEX idx_ai_requests_user (user_id),
    INDEX idx_ai_requests_status (status),
    INDEX idx_ai_requests_mode (ai_mode),
    INDEX idx_ai_requests_category (category),
    INDEX idx_ai_requests_created (created_at DESC)
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
    
    -- Indexes
    INDEX idx_law_acts_name (act_name),
    INDEX idx_law_acts_category (category),
    INDEX idx_law_acts_year (act_year),
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
    
    -- Indexes
    INDEX idx_law_sections_act (act_id),
    INDEX idx_law_sections_number (section_number),
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
    
    UNIQUE(user_id, section_id),
    INDEX idx_law_bookmarks_user (user_id),
    INDEX idx_law_bookmarks_section (section_id)
);

-- Law search history
CREATE TABLE law_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    search_query TEXT NOT NULL,
    search_results_count INTEGER,
    category law_category,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_law_search_history_user (user_id),
    INDEX idx_law_search_history_created (created_at DESC)
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
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_workspace_notes_user (user_id),
    INDEX idx_workspace_notes_category (category),
    INDEX idx_workspace_notes_updated (updated_at DESC),
    INDEX idx_workspace_notes_accessed (last_accessed_at DESC)
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
    read_at TIMESTAMP,
    
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at DESC)
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
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_activity_logs_user (user_id),
    INDEX idx_activity_logs_type (activity_type),
    INDEX idx_activity_logs_created (created_at DESC),
    INDEX idx_activity_logs_entity (entity_type, entity_id)
);

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

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nyayanet TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO