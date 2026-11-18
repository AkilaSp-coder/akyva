-- AKYVA PostgreSQL Schema Migration V2
-- Connect. Communicate. Create. Grow.
-- Extends messaging with Statuses (Stories), WebRTC Calls, Moments (Social Feed), Creator Studio, AI Productivity, and Subscriptions.

-- 1. Extend Messages Table with Rich Multimedia, Pinning, Starring, Forwarding
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from VARCHAR(100);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url VARCHAR(1024);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type VARCHAR(50);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS transcription TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(conversation_id, is_pinned);
CREATE INDEX IF NOT EXISTS idx_messages_starred ON messages(conversation_id, is_starred);

-- 2. Status Updates (24-Hour WhatsApp-Style Stories)
CREATE TABLE IF NOT EXISTS statuses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT', -- 'TEXT', 'IMAGE', 'VIDEO'
    content TEXT,
    media_url VARCHAR(1024),
    caption TEXT,
    bg_gradient VARCHAR(100),
    privacy VARCHAR(30) NOT NULL DEFAULT 'CONTACTS', -- 'EVERYONE', 'CONTACTS', 'CUSTOM'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_statuses_user ON statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_statuses_expires ON statuses(expires_at);

CREATE TABLE IF NOT EXISTS status_views (
    id VARCHAR(36) PRIMARY KEY,
    status_id VARCHAR(36) NOT NULL REFERENCES statuses(id) ON DELETE CASCADE,
    viewer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_status_viewer UNIQUE (status_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_status_views_status ON status_views(status_id);

-- 3. WebRTC Call History & Sessions
CREATE TABLE IF NOT EXISTS call_records (
    id VARCHAR(36) PRIMARY KEY,
    caller_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    conversation_id VARCHAR(36) REFERENCES conversations(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'AUDIO', -- 'AUDIO', 'VIDEO'
    status VARCHAR(20) NOT NULL DEFAULT 'MISSED', -- 'ANSWERED', 'MISSED', 'DECLINED', 'BUSY'
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_calls_caller ON call_records(caller_id);
CREATE INDEX IF NOT EXISTS idx_calls_receiver ON call_records(receiver_id);
CREATE INDEX IF NOT EXISTS idx_calls_started ON call_records(started_at);

-- 4. Moments (Short-Form Social Video & Photo Feed)
CREATE TABLE IF NOT EXISTS moments (
    id VARCHAR(36) PRIMARY KEY,
    author_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url VARCHAR(1024) NOT NULL,
    thumbnail_url VARCHAR(1024),
    caption TEXT NOT NULL,
    tags TEXT[],
    sound_title VARCHAR(150),
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    shares_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moments_author ON moments(author_id);
CREATE INDEX IF NOT EXISTS idx_moments_created ON moments(created_at);

CREATE TABLE IF NOT EXISTS moment_likes (
    id VARCHAR(36) PRIMARY KEY,
    moment_id VARCHAR(36) NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_moment_like UNIQUE (moment_id, user_id)
);

CREATE TABLE IF NOT EXISTS moment_comments (
    id VARCHAR(36) PRIMARY KEY,
    moment_id VARCHAR(36) NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_moment_comments_moment ON moment_comments(moment_id);

CREATE TABLE IF NOT EXISTS user_follows (
    id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_follow UNIQUE (follower_id, following_id)
);

-- 5. Creator Studio (Instagram/YouTube OAuth Integrations & AI Script Hub)
CREATE TABLE IF NOT EXISTS connected_social_accounts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL, -- 'INSTAGRAM', 'YOUTUBE'
    account_handle VARCHAR(100) NOT NULL,
    account_name VARCHAR(150),
    avatar_url VARCHAR(512),
    followers_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'CONNECTED',
    token_preview VARCHAR(50),
    connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_social_account UNIQUE (user_id, platform, account_handle)
);

CREATE TABLE IF NOT EXISTS creator_posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    script_prompt TEXT,
    script_content TEXT,
    language VARCHAR(20) NOT NULL DEFAULT 'en', -- 'en', 'ta' (Tamil), etc.
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'SCHEDULED', 'PUBLISHED'
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_posts_user ON creator_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_posts_scheduled ON creator_posts(scheduled_for);

-- 6. AI Productivity & Action Items
CREATE TABLE IF NOT EXISTS ai_tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date VARCHAR(50),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    source_context VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_tasks_user ON ai_tasks(user_id);

-- 7. Premium Subscriptions & Billing
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_tier VARCHAR(30) NOT NULL DEFAULT 'FREE', -- 'FREE', 'PLUS', 'CREATOR_PRO', 'BUSINESS'
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    price_cents INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
