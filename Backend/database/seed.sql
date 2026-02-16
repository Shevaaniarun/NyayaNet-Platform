BEGIN;

------------------------------------------------------------
-- 1. USERS (5 USERS)
------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, role, location)
VALUES
(gen_random_uuid(),'user1@test.com',crypt('pass', gen_salt('bf')),'Rahul Sharma','LAW_STUDENT','Chennai'),
(gen_random_uuid(),'user2@test.com',crypt('pass', gen_salt('bf')),'Priya Patel','ADVOCATE','Mumbai'),
(gen_random_uuid(),'user3@test.com',crypt('pass', gen_salt('bf')),'Amit Verma','LAWYER','Delhi'),
(gen_random_uuid(),'user4@test.com',crypt('pass', gen_salt('bf')),'Justice Mehta','JUDGE','Delhi'),
(gen_random_uuid(),'user5@test.com',crypt('pass', gen_salt('bf')),'Dr Ananya','LEGAL_PROFESSIONAL','Bangalore')
ON CONFLICT DO NOTHING;

------------------------------------------------------------
-- 2. POSTS (5 POSTS)
------------------------------------------------------------
INSERT INTO posts (id,user_id,title,content,post_type)
SELECT gen_random_uuid(), id, 'Legal Post','Sample legal content','POST'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 3. DISCUSSIONS (5)
------------------------------------------------------------
INSERT INTO discussions (id,user_id,title,description)
SELECT gen_random_uuid(), id,'Consumer Law Question','How to file complaint?'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 4. DISCUSSION REPLIES (5)
------------------------------------------------------------
INSERT INTO discussion_replies (discussion_id,user_id,content)
SELECT d.id, u.id,'Helpful reply'
FROM discussions d
JOIN users u ON TRUE
LIMIT 5;

------------------------------------------------------------
-- 5. USER FOLLOWS (5)
------------------------------------------------------------
INSERT INTO user_follows (follower_id,following_id)
SELECT u1.id,u2.id
FROM users u1
JOIN users u2 ON u1.id<>u2.id
LIMIT 5;

------------------------------------------------------------
-- 6. CONNECTION REQUESTS (5)
------------------------------------------------------------
INSERT INTO connection_requests (requester_id,receiver_id)
SELECT u1.id,u2.id
FROM users u1
JOIN users u2 ON u1.id<>u2.id
LIMIT 5;

------------------------------------------------------------
-- 7. CONVERSATIONS (5)
------------------------------------------------------------
INSERT INTO conversations (id,conversation_type,title)
VALUES
(gen_random_uuid(),'PRIVATE','Chat 1'),
(gen_random_uuid(),'PRIVATE','Chat 2'),
(gen_random_uuid(),'GROUP','Group 1'),
(gen_random_uuid(),'GROUP','Group 2'),
(gen_random_uuid(),'PRIVATE','Chat 3');

------------------------------------------------------------
-- 8. CONVERSATION MEMBERS
------------------------------------------------------------
INSERT INTO conversation_members (conversation_id,user_id)
SELECT c.id,u.id
FROM conversations c
JOIN users u ON TRUE
LIMIT 10;

------------------------------------------------------------
-- 9. MESSAGES (5)
------------------------------------------------------------
INSERT INTO messages (conversation_id,sender_id,content,message_type)
SELECT c.id,u.id,'Hello message','TEXT'
FROM conversations c
JOIN users u ON TRUE
LIMIT 5;

------------------------------------------------------------
-- 10. AI SESSIONS (5)
------------------------------------------------------------
INSERT INTO ai_sessions (id,user_id,session_name,ai_mode)
SELECT gen_random_uuid(),id,'Test AI','RETRIEVAL'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 11. AI REQUESTS (5)
------------------------------------------------------------
INSERT INTO ai_requests (user_id,ai_mode,input_text,status)
SELECT id,'RETRIEVAL','Explain CPA','COMPLETED'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 12. LAW ACTS (5)
------------------------------------------------------------
INSERT INTO law_acts (id,act_name,act_year,category)
VALUES
(gen_random_uuid(),'Consumer Protection Act',2019,'CONSUMER_LAW'),
(gen_random_uuid(),'Indian Contract Act',1872,'CONSUMER_LAW'),
(gen_random_uuid(),'Sale of Goods Act',1930,'CONSUMER_LAW'),
(gen_random_uuid(),'Competition Act',2002,'CONSUMER_LAW'),
(gen_random_uuid(),'Legal Metrology Act',2009,'CONSUMER_LAW');

------------------------------------------------------------
-- 13. LAW SECTIONS (5)
------------------------------------------------------------
INSERT INTO law_sections (act_id,section_number,section_text)
SELECT id,'1','Sample Section'
FROM law_acts
LIMIT 5;

------------------------------------------------------------
-- 14. LAW BOOKMARKS (5)
------------------------------------------------------------
INSERT INTO law_bookmarks (user_id,section_id)
SELECT u.id,s.id
FROM users u
JOIN law_sections s ON TRUE
LIMIT 5;

------------------------------------------------------------
-- 15. NOTIFICATIONS (5)
------------------------------------------------------------
INSERT INTO notifications (user_id,notification_type,title)
SELECT id,'NEW_FOLLOWER','You have new follower'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 16. ACTIVITY LOGS (5)
------------------------------------------------------------
INSERT INTO activity_logs (user_id,activity_type)
SELECT id,'LOGIN'
FROM users
LIMIT 5;

------------------------------------------------------------
-- 17. USER CONTRIBUTION SUMMARY
------------------------------------------------------------
INSERT INTO user_contribution_summary (user_id)
SELECT id FROM users
ON CONFLICT DO NOTHING;

COMMIT;

DO $$
BEGIN
RAISE NOTICE 'Seed completed successfully';
END$$;
