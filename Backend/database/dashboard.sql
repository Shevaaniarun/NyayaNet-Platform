/* =========================================================
   DASHBOARD SYSTEM - FULL SQL
   NyayaNet Contribution Tracking
   ========================================================= */


/* =========================================================
   1. CORE CONTRIBUTION EVENTS TABLE
   ========================================================= */

CREATE TABLE IF NOT EXISTS user_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    contribution_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,

    points INTEGER NOT NULL DEFAULT 0,

    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_contributions_user_date
ON user_contributions(user_id, contribution_date);

CREATE INDEX IF NOT EXISTS idx_user_contributions_user_time
ON user_contributions(user_id, created_at DESC);



/* =========================================================
   2. CONTRIBUTION SUMMARY TABLE
   ========================================================= */

CREATE TABLE IF NOT EXISTS user_contribution_summary (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    total_points INTEGER DEFAULT 0,
    total_contributions INTEGER DEFAULT 0,

    posts_count INTEGER DEFAULT 0,
    discussions_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    best_answers_count INTEGER DEFAULT 0,
    ai_queries_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,

    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    last_active_at DATE
);

/* Ensure all existing users have summary rows */
INSERT INTO user_contribution_summary (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;



/* =========================================================
   3. BADGES SYSTEM
   ========================================================= */

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon TEXT,
    threshold INTEGER
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);



/* =========================================================
   4. HELPER FUNCTION
   Ensures summary row always exists
   ========================================================= */

CREATE OR REPLACE FUNCTION ensure_summary_row(p_user UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_contribution_summary(user_id)
    VALUES (p_user)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;



/* =========================================================
   5. GENERIC CONTRIBUTION FUNCTION
   ========================================================= */

CREATE OR REPLACE FUNCTION add_contribution(
    p_user UUID,
    p_type TEXT,
    p_entity TEXT,
    p_entity_id UUID,
    p_points INT
)
RETURNS VOID AS $$
BEGIN
    PERFORM ensure_summary_row(p_user);

    INSERT INTO user_contributions(
        user_id, contribution_type, entity_type, entity_id, points
    )
    VALUES(p_user, p_type, p_entity, p_entity_id, p_points);

    UPDATE user_contribution_summary
    SET
        total_points = total_points + p_points,
        total_contributions = total_contributions + 1,
        last_active_at = CURRENT_DATE
    WHERE user_id = p_user;
END;
$$ LANGUAGE plpgsql;



/* =========================================================
   6. TRIGGERS
   ========================================================= */


/* POST CREATED +10 */
CREATE OR REPLACE FUNCTION trg_post_created_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_contribution(NEW.user_id, 'POST_CREATED', 'POST', NEW.id, 10);

    UPDATE user_contribution_summary
    SET posts_count = posts_count + 1
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_created
AFTER INSERT ON posts
FOR EACH ROW EXECUTE FUNCTION trg_post_created_fn();



/* DISCUSSION CREATED +8 */
CREATE OR REPLACE FUNCTION trg_discussion_created_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_contribution(NEW.user_id, 'DISCUSSION_CREATED', 'DISCUSSION', NEW.id, 8);

    UPDATE user_contribution_summary
    SET discussions_count = discussions_count + 1
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_discussion_created
AFTER INSERT ON discussions
FOR EACH ROW EXECUTE FUNCTION trg_discussion_created_fn();



/* REPLY CREATED +4 */
CREATE OR REPLACE FUNCTION trg_reply_created_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_contribution(NEW.user_id, 'REPLY_CREATED', 'DISCUSSION_REPLY', NEW.id, 4);

    UPDATE user_contribution_summary
    SET replies_count = replies_count + 1
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reply_created
AFTER INSERT ON discussion_replies
FOR EACH ROW EXECUTE FUNCTION trg_reply_created_fn();



/* BEST ANSWER +20 */
CREATE OR REPLACE FUNCTION trg_best_answer_fn()
RETURNS TRIGGER AS $$
DECLARE answer_user UUID;
BEGIN
    IF NEW.best_answer_id IS NOT NULL AND OLD.best_answer_id IS NULL THEN
        SELECT user_id INTO answer_user
        FROM discussion_replies WHERE id = NEW.best_answer_id;

        PERFORM add_contribution(answer_user, 'BEST_ANSWER', 'DISCUSSION_REPLY', NEW.best_answer_id, 20);

        UPDATE user_contribution_summary
        SET best_answers_count = best_answers_count + 1
        WHERE user_id = answer_user;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_best_answer
AFTER UPDATE ON discussions
FOR EACH ROW EXECUTE FUNCTION trg_best_answer_fn();



/* AI QUERY +2 */
CREATE OR REPLACE FUNCTION trg_ai_query_fn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' THEN
        PERFORM add_contribution(NEW.user_id, 'AI_QUERY', 'AI_SESSION', NEW.id, 2);

        UPDATE user_contribution_summary
        SET ai_queries_count = ai_queries_count + 1
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ai_query_completed
AFTER UPDATE ON ai_requests
FOR EACH ROW EXECUTE FUNCTION trg_ai_query_fn();



/* BOOKMARK +1 */
CREATE OR REPLACE FUNCTION trg_bookmark_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_contribution(NEW.user_id, 'LAW_BOOKMARK', 'LAW_SECTION', NEW.section_id, 1);

    UPDATE user_contribution_summary
    SET bookmarks_count = bookmarks_count + 1
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bookmark
AFTER INSERT ON law_bookmarks
FOR EACH ROW EXECUTE FUNCTION trg_bookmark_fn();



/* =========================================================
   7. STREAK UPDATE
   ========================================================= */

CREATE OR REPLACE FUNCTION trg_update_streak_fn()
RETURNS TRIGGER AS $$
DECLARE prev_date DATE;
BEGIN
    SELECT MAX(contribution_date)
    INTO prev_date
    FROM user_contributions
    WHERE user_id = NEW.user_id
      AND contribution_date < NEW.contribution_date;

    IF prev_date = NEW.contribution_date - INTERVAL '1 day' THEN
        UPDATE user_contribution_summary
        SET current_streak = current_streak + 1
        WHERE user_id = NEW.user_id;
    ELSE
        UPDATE user_contribution_summary
        SET current_streak = 1
        WHERE user_id = NEW.user_id;
    END IF;

    UPDATE user_contribution_summary
    SET longest_streak = GREATEST(longest_streak, current_streak)
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_streak
AFTER INSERT ON user_contributions
FOR EACH ROW EXECUTE FUNCTION trg_update_streak_fn();



/* =========================================================
   8. DEFAULT BADGES
   ========================================================= */

INSERT INTO badges (code, title, description, threshold) VALUES
('FIRST_CONTRIBUTION', 'First Contribution', 'Made your first contribution', 1),
('STREAK_7', '7 Day Streak', 'Active for 7 consecutive days', 7),
('CONTRIBUTOR_100', '100 Contributions', 'Completed 100 contributions', 100),
('BEST_ANSWER_10', 'Best Answer ×10', '10 answers marked as best', 10)
ON CONFLICT (code) DO NOTHING;
