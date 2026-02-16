-- Backfill user_contributions and user_contribution_summary from existing data
-- Safe to run multiple times; attempts to avoid duplicate contribution rows by checking entity_id+entity_type

BEGIN;

-- 1) Ensure a summary row exists for every user referenced in content tables
INSERT INTO user_contribution_summary (user_id)
SELECT DISTINCT user_id FROM (
  SELECT user_id FROM posts
  UNION
  SELECT user_id FROM discussions
  UNION
  SELECT user_id FROM discussion_replies
  UNION
  SELECT user_id FROM ai_requests
  UNION
  SELECT user_id FROM law_bookmarks
) s
ON CONFLICT (user_id) DO NOTHING;

-- 2) Backfill POST_CREATED contributions (10 points)
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT p.user_id, 'POST_CREATED', 'POST', p.id, 10, DATE(p.created_at), p.created_at
FROM posts p
WHERE NOT EXISTS (
  SELECT 1 FROM user_contributions uc WHERE uc.entity_type = 'POST' AND uc.entity_id = p.id
);

-- 3) Backfill DISCUSSION_CREATED contributions (8 points)
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT d.user_id, 'DISCUSSION_CREATED', 'DISCUSSION', d.id, 8, DATE(d.created_at), d.created_at
FROM discussions d
WHERE NOT EXISTS (
  SELECT 1 FROM user_contributions uc WHERE uc.entity_type = 'DISCUSSION' AND uc.entity_id = d.id
);

-- 4) Backfill REPLY_CREATED contributions (4 points)
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT r.user_id, 'REPLY_CREATED', 'DISCUSSION_REPLY', r.id, 4, DATE(r.created_at), r.created_at
FROM discussion_replies r
WHERE NOT EXISTS (
  SELECT 1 FROM user_contributions uc WHERE uc.entity_type = 'DISCUSSION_REPLY' AND uc.entity_id = r.id
);

-- 5) Backfill BEST_ANSWER contributions (20 points) for replies marked as best_answer in discussions
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT rr.user_id, 'BEST_ANSWER', 'DISCUSSION_REPLY', d.best_answer_id, 20, DATE(COALESCE(rr.created_at, CURRENT_TIMESTAMP)), COALESCE(rr.created_at, CURRENT_TIMESTAMP)
FROM discussions d
JOIN discussion_replies rr ON rr.id = d.best_answer_id
WHERE d.best_answer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_contributions uc WHERE uc.contribution_type = 'BEST_ANSWER' AND uc.entity_id = d.best_answer_id
  );

-- 6) Backfill AI_QUERY contributions (+2) for ai_requests with status COMPLETED
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT a.user_id, 'AI_QUERY', 'AI_SESSION', a.id, 2, DATE(a.updated_at), a.updated_at
FROM ai_requests a
WHERE a.status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1 FROM user_contributions uc WHERE uc.entity_type = 'AI_SESSION' AND uc.entity_id = a.id
  );

-- 7) Backfill LAW_BOOKMARK contributions (+1)
INSERT INTO user_contributions (user_id, contribution_type, entity_type, entity_id, points, contribution_date, created_at)
SELECT lb.user_id, 'LAW_BOOKMARK', 'LAW_SECTION', lb.section_id, 1, DATE(lb.created_at), lb.created_at
FROM law_bookmarks lb
WHERE NOT EXISTS (
  SELECT 1 FROM user_contributions uc WHERE uc.entity_type = 'LAW_SECTION' AND uc.entity_id = lb.section_id AND uc.user_id = lb.user_id
);

-- 8) Update user_contribution_summary aggregates from user_contributions (recompute safely)
-- This will set summary columns based on counted rows and sum of points

UPDATE user_contribution_summary ucs
SET
  total_points = COALESCE(sub.points_sum, 0),
  total_contributions = COALESCE(sub.count_sum, 0),
  posts_count = COALESCE(sub.posts_count, 0),
  discussions_count = COALESCE(sub.discussions_count, 0),
  replies_count = COALESCE(sub.replies_count, 0),
  best_answers_count = COALESCE(sub.best_answers_count, 0),
  ai_queries_count = COALESCE(sub.ai_queries_count, 0),
  bookmarks_count = COALESCE(sub.bookmarks_count, 0),
  last_active_at = GREATEST(ucs.last_active_at, (SELECT MAX(contribution_date) FROM user_contributions WHERE user_id = ucs.user_id))
FROM (
  SELECT
    user_id,
    SUM(points) AS points_sum,
    COUNT(*) AS count_sum,
    SUM(CASE WHEN entity_type = 'POST' THEN 1 ELSE 0 END) AS posts_count,
    SUM(CASE WHEN entity_type = 'DISCUSSION' THEN 1 ELSE 0 END) AS discussions_count,
    SUM(CASE WHEN entity_type = 'DISCUSSION_REPLY' THEN 1 ELSE 0 END) AS replies_count,
    SUM(CASE WHEN contribution_type = 'BEST_ANSWER' THEN 1 ELSE 0 END) AS best_answers_count,
    SUM(CASE WHEN contribution_type = 'AI_QUERY' THEN 1 ELSE 0 END) AS ai_queries_count,
    SUM(CASE WHEN contribution_type = 'LAW_BOOKMARK' THEN 1 ELSE 0 END) AS bookmarks_count
  FROM user_contributions
  GROUP BY user_id
) sub
WHERE ucs.user_id = sub.user_id;

-- 9) For users that may have no contributions yet, ensure zeros are present (no-op for existing rows)
INSERT INTO user_contribution_summary (user_id)
SELECT id FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_contribution_summary s WHERE s.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- End of backfill script
