-- =============================================
-- DROP OLD MESSAGING TABLES
-- =============================================
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_members CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type_enum') THEN
        CREATE TYPE conversation_type_enum AS ENUM ('PRIVATE', 'GROUP');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_role_enum') THEN
        CREATE TYPE conversation_role_enum AS ENUM ('MEMBER', 'ADMIN', 'OWNER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
        CREATE TYPE message_type_enum AS ENUM ('TEXT', 'IMAGE', 'PDF', 'SYSTEM');
    END IF;
END$$;

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_type conversation_type_enum NOT NULL,
    title VARCHAR(255),
    description TEXT,
    avatar BYTEA, -- store avatar in DB

    created_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role conversation_role_enum DEFAULT 'MEMBER',

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,

    is_muted BOOLEAN DEFAULT FALSE,

    -- NEW
    is_left BOOLEAN DEFAULT FALSE,
    left_at TIMESTAMP,

    UNIQUE(conversation_id, user_id)
);

CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    message_type message_type_enum DEFAULT 'TEXT',

    content TEXT,

    -- MEDIA STORED IN DB
    media_data BYTEA,
    media_mime_type VARCHAR(100),
    file_name VARCHAR(255),
    file_size BIGINT,

    -- STATUS
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_by UUID REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_conv_members_conv ON conversation_members(conversation_id);
CREATE INDEX idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

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

