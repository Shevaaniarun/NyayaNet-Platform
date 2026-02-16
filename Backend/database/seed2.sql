-- =============================================
-- NYAYANET CLEAN SEED FILE
-- Works with your schema.sql
-- =============================================

BEGIN;

-- =============================================
-- USERS (5 users)
-- =============================================

INSERT INTO users (id, email, password_hash, full_name, role, designation, organization, experience_years, location)
VALUES
('11111111-1111-1111-1111-111111111111','student1@nyayanet.com', crypt('pass123', gen_salt('bf')),'Rahul Sharma','LAW_STUDENT','Final Year','NLU Bangalore',0,'Bangalore'),
('22222222-2222-2222-2222-222222222222','advocate1@nyayanet.com', crypt('pass123', gen_salt('bf')),'Priya Patel','ADVOCATE','Senior Advocate','Patel & Assoc',8,'Mumbai'),
('33333333-3333-3333-3333-333333333333','judge1@nyayanet.com', crypt('pass123', gen_salt('bf')),'Justice Mehta','JUDGE','Retd Judge','Delhi HC',30,'Delhi'),
('44444444-4444-4444-4444-444444444444','lawyer1@nyayanet.com', crypt('pass123', gen_salt('bf')),'Amit Verma','LAWYER','Partner','Verma Legal',12,'Chennai'),
('55555555-5555-5555-5555-555555555555','prof1@nyayanet.com', crypt('pass123', gen_salt('bf')),'Dr Ananya Iyer','LEGAL_PROFESSIONAL','Professor','NLU Delhi',15,'Delhi')
ON CONFLICT DO NOTHING;



-- =============================================
-- USER FOLLOWS
-- =============================================

INSERT INTO user_follows (follower_id, following_id)
VALUES
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222'),
('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333'),
('22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333'),
('44444444-4444-4444-4444-444444444444','22222222-2222-2222-2222-222222222222'),
('55555555-5555-5555-5555-555555555555','33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;



-- =============================================
-- POSTS (5 posts)
-- =============================================

INSERT INTO posts (id,user_id,title,content,post_type)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','Consumer Court Success','Won case about defective fridge','POST'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','11111111-1111-1111-1111-111111111111','Internship Experience','Learnt about mediation','POST'),
('cccccccc-cccc-cccc-cccc-cccccccccccc','33333333-3333-3333-3333-333333333333','Judgment Note','Important Supreme Court ruling','ARTICLE'),
('dddddddd-dddd-dddd-dddd-dddddddddddd','44444444-4444-4444-4444-444444444444','Medical Negligence Case','Client got compensation','POST'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','55555555-5555-5555-5555-555555555555','Research Published','Paper on CPA 2019','ANNOUNCEMENT')
ON CONFLICT DO NOTHING;



-- =============================================
-- DISCUSSIONS (5)
-- =============================================

INSERT INTO discussions (id,user_id,title,description)
VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','Defective phone help','Phone stopped working'),
('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb','22222222-2222-2222-2222-222222222222','Ecommerce fraud','How to handle online fraud'),
('cccc1111-cccc-cccc-cccc-cccccccccccc','33333333-3333-3333-3333-333333333333','Insurance delay','Company delaying claim'),
('dddd1111-dddd-dddd-dddd-dddddddddddd','44444444-4444-4444-4444-444444444444','Medical negligence','Hospital mistake case'),
('eeee1111-eeee-eeee-eeee-eeeeeeeeeeee','55555555-5555-5555-5555-555555555555','Digital consumer rights','CPA limitations')
ON CONFLICT DO NOTHING;



-- =============================================
-- DISCUSSION REPLIES
-- =============================================

INSERT INTO discussion_replies (discussion_id,user_id,content)
VALUES
('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','Send legal notice first'),
('bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333','File complaint online'),
('cccc1111-cccc-cccc-cccc-cccccccccccc','44444444-4444-4444-4444-444444444444','Insurance ombudsman'),
('dddd1111-dddd-dddd-dddd-dddddddddddd','55555555-5555-5555-5555-555555555555','Need expert opinion'),
('eeee1111-eeee-eeee-eeee-eeeeeeeeeeee','11111111-1111-1111-1111-111111111111','CPA needs reform')
ON CONFLICT DO NOTHING;



-- =============================================
-- CONVERSATIONS
-- =============================================

INSERT INTO conversations (id,conversation_type,title)
VALUES
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','PRIVATE','Rahul & Priya'),
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb','PRIVATE','Judge & Lawyer'),
('cccc2222-cccc-cccc-cccc-cccccccccccc','GROUP','Consumer Law Group'),
('dddd2222-dddd-dddd-dddd-dddddddddddd','GROUP','Law Students'),
('eeee2222-eeee-eeee-eeee-eeeeeeeeeeee','GROUP','Research Team')
ON CONFLICT DO NOTHING;



-- =============================================
-- CONVERSATION MEMBERS
-- =============================================

INSERT INTO conversation_members (conversation_id,user_id)
VALUES
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111'),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222'),
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333'),
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb','44444444-4444-4444-4444-444444444444'),
('cccc2222-cccc-cccc-cccc-cccccccccccc','55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;



-- =============================================
-- MESSAGES
-- =============================================

INSERT INTO messages (conversation_id,sender_id,content)
VALUES
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','Hello maam'),
('aaaa2222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','Hello Rahul'),
('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333','Good evening'),
('cccc2222-cccc-cccc-cccc-cccccccccccc','55555555-5555-5555-5555-555555555555','Welcome everyone'),
('dddd2222-dddd-dddd-dddd-dddddddddddd','44444444-4444-4444-4444-444444444444','Group created')
ON CONFLICT DO NOTHING;



-- =============================================
-- AI SESSIONS
-- =============================================

INSERT INTO ai_sessions (id,user_id,session_name,ai_mode)
VALUES
('aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','Defective Product','PREDICTION'),
('bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb','33333333-3333-3333-3333-333333333333','Insurance Case','RETRIEVAL'),
('cccc3333-cccc-cccc-cccc-cccccccccccc','44444444-4444-4444-4444-444444444444','Medical Case','PREDICTION'),
('dddd3333-dddd-dddd-dddd-dddddddddddd','55555555-5555-5555-5555-555555555555','Digital Rights','RETRIEVAL'),
('eeee3333-eeee-eeee-eeee-eeeeeeeeeeee','11111111-1111-1111-1111-111111111111','Consumer Help','RETRIEVAL')
ON CONFLICT DO NOTHING;



-- =============================================
-- AI REQUESTS
-- =============================================

INSERT INTO ai_requests (user_id,session_id,ai_mode,input_text,status)
VALUES
('22222222-2222-2222-2222-222222222222','aaaa3333-aaaa-aaaa-aaaa-aaaaaaaaaaaa','PREDICTION','Fridge case','COMPLETED'),
('33333333-3333-3333-3333-333333333333','bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb','RETRIEVAL','Insurance delay','COMPLETED'),
('44444444-4444-4444-4444-444444444444','cccc3333-cccc-cccc-cccc-cccccccccccc','PREDICTION','Medical negligence','PROCESSING'),
('55555555-5555-5555-5555-555555555555','dddd3333-dddd-dddd-dddd-dddddddddddd','RETRIEVAL','CPA digital','COMPLETED'),
('11111111-1111-1111-1111-111111111111','eeee3333-eeee-eeee-eeee-eeeeeeeeeeee','RETRIEVAL','Complaint process','PENDING')
ON CONFLICT DO NOTHING;



COMMIT;

-- =============================================
-- DONE
-- =============================================
