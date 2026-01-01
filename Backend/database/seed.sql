-- =============================================
-- CLEAN DATABASE (SAFE MODE - Only if empty)
-- =============================================
DO $$
BEGIN
    -- Only truncate if tables exist and have data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Check if users table has data
        IF (SELECT COUNT(*) FROM users) > 0 THEN
            RAISE NOTICE '⚠️  Database already has data. Skipping truncate.';
        ELSE
            -- Safe truncate in reverse dependency order
            TRUNCATE TABLE 
                activity_logs,
                notifications,
                workspace_notes,
                law_search_history,
                law_bookmarks,
                law_sections,
                law_acts,
                ai_requests,
                ai_messages,
                ai_sessions,
                messages,
                conversation_members,
                conversations,
                post_comments,
                user_bookmarks,
                discussion_upvotes,
                post_likes,
                discussion_followers,
                discussion_replies,
                discussions,
                discussion_views,
                post_media,
                posts,
                connection_requests,
                user_follows,
                user_certifications,
                users 
            CASCADE;
            RAISE NOTICE '🗑️  Database truncated successfully.';
        END IF;
    END IF;
END$$;

-- =============================================
-- 1. USERS (5 users, one for each role)
-- =============================================
INSERT INTO users (id, email, password_hash, full_name, role, designation, organization, area_of_interest, bar_council_number, experience_years, bio, location, profile_photo_url, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'student.law@example.com',
    crypt('student123', gen_salt('bf')), -- Password: student123
    'Rahul Sharma',
    'LAW_STUDENT',
    'Final Year Student',
    'National Law School, Bangalore',
    ARRAY['Consumer Law', 'Constitutional Law'],
    NULL,
    0,
    'Final year law student specializing in consumer protection laws. Passionate about legal tech and access to justice.',
    'Bangalore, Karnataka',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-2222-2222-222222222222',
    'advocate.patel@example.com',
    crypt('advocate123', gen_salt('bf')), -- Password: advocate123
    'Priya Patel',
    'ADVOCATE',
    'Senior Advocate',
    'Patel & Associates',
    ARRAY['Consumer Law', 'Corporate Law', 'IPR'],
    'BAR/2015/12345',
    8,
    'Practicing advocate with expertise in consumer protection and corporate litigation. Appeared in 100+ consumer court cases.',
    'Mumbai, Maharashtra',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'justice.mehta@example.com',
    crypt('justice123', gen_salt('bf')), -- Password: justice123
    'Justice Rajiv Mehta (Retd.)',
    'JUDGE',
    'Former High Court Judge',
    'Delhi High Court (Retired)',
    ARRAY['Consumer Law', 'Civil Law', 'Constitutional Law'],
    'BAR/1985/67890',
    35,
    'Retired High Court Judge with 35 years of judicial experience. Special interest in consumer law jurisprudence.',
    'New Delhi',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face',
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'lawyer.verma@example.com',
    crypt('lawyer123', gen_salt('bf')), -- Password: lawyer123
    'Amit Verma',
    'LAWYER',
    'Managing Partner',
    'Verma Legal Associates',
    ARRAY['Consumer Law', 'Criminal Law', 'Family Law'],
    'BAR/2010/54321',
    12,
    'Managing partner at Verma Legal Associates. Handled landmark consumer protection cases at Supreme Court level.',
    'Chennai, Tamil Nadu',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'legal.pro@example.com',
    crypt('legal123', gen_salt('bf')), -- Password: legal123
    'Dr. Ananya Iyer',
    'LEGAL_PROFESSIONAL',
    'Professor of Law',
    'National Law University, Delhi',
    ARRAY['Consumer Law', 'Legal Research', 'Policy Making'],
    NULL,
    15,
    'Professor and legal researcher specializing in consumer law reforms. Published multiple research papers on CPA 2019.',
    'Delhi',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    designation = EXCLUDED.designation,
    organization = EXCLUDED.organization,
    area_of_interest = EXCLUDED.area_of_interest,
    bar_council_number = EXCLUDED.bar_council_number,
    experience_years = EXCLUDED.experience_years,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    profile_photo_url = EXCLUDED.profile_photo_url,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 2. USER_CERTIFICATIONS (5 certifications)
-- =============================================
INSERT INTO user_certifications (user_id, title, issuing_organization, credential_id, issue_date, expiry_date, certificate_url, file_type, description) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Advocate on Record - Supreme Court',
    'Supreme Court of India',
    'AOR/2021/123',
    '2021-06-15',
    '2026-06-15',
    'https://example.com/certificates/aor-certificate.pdf',
    'PDF',
    'Certified Advocate on Record eligible to practice before Supreme Court of India'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Mediation and Conciliation Certification',
    'National Legal Services Authority',
    'NALSA/MED/2022/456',
    '2022-03-20',
    NULL,
    'https://example.com/certificates/mediation-certificate.pdf',
    'PDF',
    'Certified mediator for consumer dispute resolution'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Bar Council of India Enrollment',
    'Bar Council of India',
    'BCI/2010/54321',
    '2010-05-10',
    NULL,
    'https://example.com/certificates/bci-enrollment.pdf',
    'PDF',
    'Enrollment certificate as Advocate'
),
(
    '55555555-5555-5555-5555-555555555555',
    'PhD in Law',
    'University of Delhi',
    'PhD/LAW/2015/789',
    '2015-12-15',
    NULL,
    'https://example.com/certificates/phd-degree.pdf',
    'PDF',
    'Doctor of Philosophy in Consumer Protection Laws'
),
(
    '11111111-1111-1111-1111-111111111111',
    'Consumer Law Internship Certificate',
    'National Consumer Disputes Redressal Commission',
    'NCDRC/INTERN/2023/001',
    '2023-06-01',
    NULL,
    'https://example.com/certificates/internship-certificate.jpg',
    'IMAGE',
    'Completed 3-month internship at NCDRC'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. USER_FOLLOWS (Following relationships)
-- =============================================
INSERT INTO user_follows (follower_id, following_id, status) VALUES
-- Student follows everyone
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ACCEPTED'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ACCEPTED'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'ACCEPTED'),
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'ACCEPTED'),
-- Advocate follows judge and professor
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'ACCEPTED'),
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'ACCEPTED')
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. CONNECTION_REQUESTS (2 pending requests)
-- =============================================
INSERT INTO connection_requests (requester_id, receiver_id, status, request_message) VALUES
(
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'PENDING',
    'Respected Justice Mehta, would be honored to connect and learn from your vast experience in consumer law.'
),
(
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'ACCEPTED',
    'Sir, as a law student interested in consumer law, I would appreciate your guidance.'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 5. POSTS (5 posts of different types)
-- =============================================
INSERT INTO posts (id, user_id, title, content, post_type, tags, created_at) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Recent Supreme Court Judgment on Defective Products',
    'The Supreme Court in Kumar vs. State of India (2023) has expanded the definition of "defective product" under Section 2(1)(f) of CPA 2019. The court held that even if a product meets technical specifications but fails to meet reasonable consumer expectations, it can be considered defective. This is a landmark judgment that strengthens consumer rights significantly.',
    'ARTICLE',
    ARRAY['Consumer Law', 'Supreme Court', 'Defective Products', 'CPA 2019'],
    CURRENT_TIMESTAMP
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '33333333-3333-3333-3333-333333333333',
    'Question: How to handle e-commerce fraud cases?',
    'With the rise of e-commerce, we are seeing increasing cases of online fraud. What are the best practices for consumers who have been defrauded in online transactions? Specifically looking at jurisdiction issues when seller is in different state.',
    'QUESTION',
    ARRAY['Consumer Law', 'E-commerce', 'Online Fraud', 'Jurisdiction'],
    CURRENT_TIMESTAMP
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '55555555-5555-5555-5555-555555555555',
    'Research Paper Published: Digital Consumer Rights',
    'My latest research paper "Protecting Digital Consumers: Challenges and Solutions under Indian Law" has been published in the Indian Law Review. The paper analyzes gaps in current consumer protection framework for digital transactions.',
    'ANNOUNCEMENT',
    ARRAY['Research', 'Digital Rights', 'Consumer Law', 'Academic'],
    CURRENT_TIMESTAMP
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    'Case Study: Successful Medical Negligence Claim',
    'Recently won a medical negligence case where hospital failed to provide adequate care. The consumer commission awarded ₹25 lakhs compensation. Key learning: Proper documentation and expert opinions are crucial.',
    'POST',
    ARRAY['Medical Negligence', 'Consumer Law', 'Case Study', 'Compensation'],
    CURRENT_TIMESTAMP
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'Internship Experience at District Commission',
    'Completed 2-month internship at District Consumer Commission. Observed 50+ cases. Notable trend: Banking complaints constitute 40% of all cases. Eager to learn more about this area.',
    'POST',
    ARRAY['Internship', 'Consumer Law', 'Banking', 'Experience'],
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 6. POST_MEDIA (Attachments for posts)
-- =============================================
INSERT INTO post_media (post_id, media_type, media_url, caption) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'PDF',
    'https://example.com/documents/supreme-court-judgment.pdf',
    'Full text of Supreme Court judgment'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'PDF',
    'https://example.com/documents/research-paper.pdf',
    'Digital Consumer Rights Research Paper'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'IMAGE',
    'https://example.com/images/case-study-chart.jpg',
    'Compensation awarded statistics'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. DISCUSSIONS (5 discussions)
-- =============================================
INSERT INTO discussions (id, user_id, title, description, discussion_type, category, tags, created_at) VALUES
(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    '11111111-1111-1111-1111-111111111111',
    'How to file a complaint for defective mobile phone?',
    'I purchased a mobile phone that stopped working after 3 months. The manufacturer is refusing warranty. What is the step-by-step process to file a complaint under CPA 2019? What documents are needed?',
    'LEGAL_QUERY',
    'CONSUMER_LAW',
    ARRAY['Defective Products', 'Mobile Phone', 'Warranty', 'Complaint Process'],
    CURRENT_TIMESTAMP
),
(
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    '22222222-2222-2222-2222-222222222222',
    'Landmark Consumer Law Cases Analysis',
    'Let''s discuss the most important consumer law cases from the past 5 years. Which judgments have had the most significant impact on consumer rights?',
    'CASE_ANALYSIS',
    'CONSUMER_LAW',
    ARRAY['Case Law', 'Precedents', 'Judgments', 'Consumer Rights'],
    CURRENT_TIMESTAMP
),
(
    'cccccccc-dddd-eeee-ffff-gggggggggggg',
    '44444444-4444-4444-4444-444444444444',
    'Should there be special courts for consumer cases?',
    'Given the backlog in consumer commissions, should India establish dedicated consumer courts with specialized judges? What would be the pros and cons?',
    'OPINION_POLL',
    'CONSUMER_LAW',
    ARRAY['Judicial Reform', 'Consumer Courts', 'Backlog', 'Specialization'],
    CURRENT_TIMESTAMP
),
(
    'dddddddd-eeee-ffff-gggg-hhhhhhhhhhhh',
    '55555555-5555-5555-5555-555555555555',
    'Limitations of CPA 2019 in digital marketplace',
    'The CPA 2019 was drafted before the massive growth of digital marketplaces. What are its limitations in addressing issues like data privacy, algorithmic pricing, and platform liability?',
    'GENERAL',
    'CONSUMER_LAW',
    ARRAY['Digital Marketplace', 'CPA 2019', 'Limitations', 'Reform'],
    CURRENT_TIMESTAMP
),
(
    'eeeeeeee-ffff-gggg-hhhh-iiiiiiiiiiii',
    '33333333-3333-3333-3333-333333333333',
    'Role of mediation in consumer disputes',
    'From my experience, many consumer disputes can be resolved through mediation. What are the challenges in implementing effective mediation mechanisms in consumer commissions?',
    'GENERAL',
    'CONSUMER_LAW',
    ARRAY['Mediation', 'ADR', 'Dispute Resolution', 'Consumer Commissions'],
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 8. DISCUSSION_REPLIES (5 replies)
-- =============================================
INSERT INTO discussion_replies (discussion_id, user_id, content, upvote_count, created_at) VALUES
(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'Step 1: Send a legal notice to the manufacturer and seller. Step 2: If no response within 30 days, file complaint with District Commission. Required documents: Invoice, warranty card, photos of defect, correspondence with company.',
    15,
    CURRENT_TIMESTAMP
),
(
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'Also include an independent technician''s report confirming the defect. This strengthens your case significantly.',
    8,
    CURRENT_TIMESTAMP
),
(
    'bbbbbbbb-cccc-dddd-eeee-ffffffffffff',
    '33333333-3333-3333-3333-333333333333',
    'In my view, the most significant case is National Insurance Co. vs. Consumer Education (2020) which expanded the concept of "deficiency in service" to include insurance claim delays.',
    22,
    CURRENT_TIMESTAMP
),
(
    'dddddddd-eeee-ffff-gggg-hhhhhhhhhhhh',
    '55555555-5555-5555-5555-555555555555',
    'Major limitation: CPA 2019 doesn''t adequately address data protection issues. When platforms misuse consumer data, the remedies under consumer law are limited.',
    12,
    CURRENT_TIMESTAMP
),
(
    'eeeeeeee-ffff-gggg-hhhh-iiiiiiiiiiii',
    '22222222-2222-2222-2222-222222222222',
    'Main challenge is lack of trained mediators. Most consumer commissions don''t have dedicated mediation cells.',
    7,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Update discussion with best answer
UPDATE discussions SET best_answer_id = (
    SELECT id FROM discussion_replies WHERE discussion_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' AND user_id = '22222222-2222-2222-2222-222222222222'
) WHERE id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

-- =============================================
-- 9. DISCUSSION_FOLLOWERS
-- =============================================
INSERT INTO discussion_followers (discussion_id, user_id) VALUES
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444'),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', '55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. POST_LIKES (Interactions)
-- =============================================
INSERT INTO post_likes (post_id, user_id, reaction_type) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'LIKE'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'INSIGHTFUL'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'LIKE'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'LIKE'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'LOVE')
ON CONFLICT DO NOTHING;

-- =============================================
-- 11. DISCUSSION_UPVOTES
-- =============================================
INSERT INTO discussion_upvotes (reply_id, user_id) VALUES
((SELECT id FROM discussion_replies WHERE discussion_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' AND user_id = '22222222-2222-2222-2222-222222222222'), '11111111-1111-1111-1111-111111111111'),
((SELECT id FROM discussion_replies WHERE discussion_id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' AND user_id = '22222222-2222-2222-222222222222'), '44444444-4444-4444-4444-444444444444'),
((SELECT id FROM discussion_replies WHERE discussion_id = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff' AND user_id = '33333333-3333-3333-3333-333333333333'), '55555555-5555-5555-5555-555555555555')
ON CONFLICT DO NOTHING;

-- =============================================
-- 12. USER_BOOKMARKS (Saved items)
-- =============================================
INSERT INTO user_bookmarks (user_id, entity_type, entity_id, folder, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'POST', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'IMPORTANT', 'Supreme Court judgment on defective products'),
('22222222-2222-2222-2222-222222222222', 'DISCUSSION', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'CASE_REFERENCE', 'Useful for client consultation'),
('44444444-4444-4444-4444-444444444444', 'POST', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'RESEARCH', 'Digital consumer rights paper'),
('55555555-5555-5555-5555-555555555555', 'POST', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'TEACHING', 'Good example for class'),
('33333333-3333-3333-3333-333333333333', 'DISCUSSION', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'REFERENCES', 'Important cases discussion')
ON CONFLICT DO NOTHING;

-- =============================================
-- 13. POST_COMMENTS
-- =============================================
INSERT INTO post_comments (post_id, user_id, content) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Excellent analysis. I would add that this judgment also affects service contracts where quality expectations are not explicitly stated.'
),
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '55555555-5555-5555-5555-555555555555',
    'Could you share the citation for this case? Would like to reference it in my research.'
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'For e-commerce fraud, file complaint with consumer commission where you reside. The jurisdiction issue was resolved in Amazon vs. Consumer (2021).'
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    'Congratulations on the publication! Looking forward to reading it.'
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '11111111-1111-1111-1111-111111111111',
    'This is very helpful. Could you share the format for expert opinion submission?'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 14. CONVERSATIONS (Private chats)
-- =============================================
INSERT INTO conversations (id, conversation_type, title, created_at) VALUES
('aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb', 'PRIVATE', 'Priya Patel - Rahul Sharma', CURRENT_TIMESTAMP),
('bbbbbbbb-2222-3333-4444-cccccccccccc', 'PRIVATE', 'Amit Verma - Justice Mehta', CURRENT_TIMESTAMP),
('cccccccc-3333-4444-5555-dddddddddddd', 'GROUP', 'Consumer Law Professionals', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO conversation_members (conversation_id, user_id, role) VALUES
-- Private chat between student and advocate
('aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'MEMBER'),
('aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'MEMBER'),
-- Private chat between lawyer and judge
('bbbbbbbb-2222-3333-4444-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'MEMBER'),
('bbbbbbbb-2222-3333-4444-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'MEMBER'),
-- Group chat
('cccccccc-3333-4444-5555-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'OWNER'),
('cccccccc-3333-4444-5555-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'MEMBER'),
('cccccccc-3333-4444-5555-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'MEMBER'),
('cccccccc-3333-4444-5555-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'MEMBER')
ON CONFLICT DO NOTHING;

INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES
(
    'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Hello Ma''am, I have a question about consumer complaint procedure.',
    'TEXT'
),
(
    'aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'Hello Rahul, sure. What specific question do you have?',
    'TEXT'
),
(
    'cccccccc-3333-4444-5555-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Welcome everyone to the Consumer Law Professionals group!',
    'TEXT'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 15. AI_SESSIONS
-- =============================================
INSERT INTO ai_sessions (id, user_id, session_name, ai_mode, category, created_at) VALUES
(
    'aaaaaaaa-aaaa-bbbb-cccc-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Defective Product Case Analysis',
    'PREDICTION',
    'CONSUMER_LAW',
    CURRENT_TIMESTAMP
),
(
    'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
    '44444444-4444-4444-4444-444444444444',
    'Medical Negligence Precedents',
    'RETRIEVAL',
    'CONSUMER_LAW',
    CURRENT_TIMESTAMP
),
(
    'cccccccc-cccc-dddd-eeee-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    'Consumer Law Research',
    'RETRIEVAL',
    'CONSUMER_LAW',
    CURRENT_TIMESTAMP
),
(
    'dddddddd-dddd-eeee-ffff-gggggggggggg',
    '33333333-3333-3333-3333-333333333333',
    'Case Outcome Prediction',
    'PREDICTION',
    'CONSUMER_LAW',
    CURRENT_TIMESTAMP
),
(
    'eeeeeeee-eeee-ffff-gggg-hhhhhhhhhhhh',
    '55555555-5555-5555-5555-555555555555',
    'Legal Provisions Research',
    'RETRIEVAL',
    'CONSUMER_LAW',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    session_name = EXCLUDED.session_name,
    updated_at = CURRENT_TIMESTAMP;

-- =============================================
-- 16. AI_MESSAGES
-- =============================================
INSERT INTO ai_messages (session_id, message_type, content, ai_mode, confidence_score, citations) VALUES
(
    'aaaaaaaa-aaaa-bbbb-cccc-dddddddddddd',
    'USER_QUERY',
    'What is the likely outcome for a defective refrigerator case where the product stopped working after 4 months?',
    NULL,
    NULL,
    NULL
),
(
    'aaaaaaaa-aaaa-bbbb-cccc-dddddddddddd',
    'AI_RESPONSE',
    'Based on similar cases, there is 78% probability of favorable outcome for consumer. Relevant provisions: Section 2(1)(f) CPA 2019 (defective goods), Section 35 (reliefs available).',
    'PREDICTION',
    0.78,
    '[{"type": "LAW", "reference": "Consumer Protection Act 2019, Section 2(1)(f)"}, {"type": "CASE", "reference": "Kumar vs. LG Electronics (2021)"}]'
),
(
    'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
    'USER_QUERY',
    'Find relevant laws for medical negligence cases under consumer protection',
    NULL,
    NULL,
    NULL
),
(
    'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
    'AI_RESPONSE',
    'Medical services are covered under CPA 2019. Key provisions: Section 2(1)(g) - deficiency in service, Section 2(42) - unfair trade practice. Important cases: Indian Medical Association vs. V.P. Shantha (1995).',
    'RETRIEVAL',
    0.92,
    '[{"type": "LAW", "reference": "Consumer Protection Act 2019, Section 2(1)(g)"}, {"type": "CASE", "reference": "Indian Medical Association vs. V.P. Shantha (1995)"}]'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 17. AI_REQUESTS
-- =============================================
INSERT INTO ai_requests (user_id, session_id, ai_mode, category, input_text, status, progress, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-bbbb-cccc-dddddddddddd',
    'PREDICTION',
    'CONSUMER_LAW',
    'Defective refrigerator case analysis',
    'COMPLETED',
    100,
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
    'RETRIEVAL',
    'CONSUMER_LAW',
    'Medical negligence laws',
    'COMPLETED',
    100,
    CURRENT_TIMESTAMP
),
(
    '11111111-1111-1111-1111-111111111111',
    'cccccccc-cccc-dddd-eeee-ffffffffffff',
    'RETRIEVAL',
    'CONSUMER_LAW',
    'E-commerce consumer protection',
    'PROCESSING',
    60,
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-dddd-eeee-ffff-gggggggggggg',
    'PREDICTION',
    'CONSUMER_LAW',
    'Banking service deficiency prediction',
    'PENDING',
    0,
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'eeeeeeee-eeee-ffff-gggg-hhhhhhhhhhhh',
    'RETRIEVAL',
    'CONSUMER_LAW',
    'Digital consumer rights provisions',
    'COMPLETED',
    100,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 18. LAW_ACTS
-- =============================================
INSERT INTO law_acts (id, act_name, act_year, short_title, category, sub_category, tags) VALUES
(
    'aaaaaaaa-1111-2222-3333-444444444444',
    'Consumer Protection Act',
    2019,
    'CPA 2019',
    'CONSUMER_LAW',
    'Consumer Rights',
    ARRAY['Consumer', 'Protection', 'Rights', 'CPA']
),
(
    'bbbbbbbb-2222-3333-4444-555555555555',
    'Sale of Goods Act',
    1930,
    'SOGA 1930',
    'CONSUMER_LAW',
    'Commercial Law',
    ARRAY['Sale', 'Goods', 'Commercial', 'Contract']
),
(
    'cccccccc-3333-4444-5555-666666666666',
    'Indian Contract Act',
    1872,
    'ICA 1872',
    'CONSUMER_LAW',
    'Contract Law',
    ARRAY['Contract', 'Agreement', 'Obligation']
),
(
    'dddddddd-4444-5555-6666-777777777777',
    'Competition Act',
    2002,
    'Competition Act 2002',
    'CONSUMER_LAW',
    'Competition Law',
    ARRAY['Competition', 'Monopoly', 'Market']
),
(
    'eeeeeeee-5555-6666-7777-888888888888',
    'Legal Metrology Act',
    2009,
    'LMA 2009',
    'CONSUMER_LAW',
    'Standards',
    ARRAY['Metrology', 'Standards', 'Measurement']
)
ON CONFLICT (id) DO UPDATE SET
    act_name = EXCLUDED.act_name,
    short_title = EXCLUDED.short_title,
    tags = EXCLUDED.tags;

-- =============================================
-- 19. LAW_SECTIONS
-- =============================================
INSERT INTO law_sections (id, act_id, section_number, section_title, section_text, explanation) VALUES
(
    gen_random_uuid(),
    'aaaaaaaa-1111-2222-3333-444444444444',
    '2(1)(f)',
    'Defect',
    '"defect" means any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard which is required to be maintained by or under any law for the time being in force or under any contract, express or implied, or as is claimed by the trader in any manner whatsoever in relation to any goods or product;',
    'Defines what constitutes a defect in goods/products under consumer law'
),
(
    gen_random_uuid(),
    'aaaaaaaa-1111-2222-3333-444444444444',
    '2(1)(g)',
    'Deficiency',
    '"deficiency" means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service;',
    'Defines deficiency in service, crucial for service-related complaints'
),
(
    gen_random_uuid(),
    'aaaaaaaa-1111-2222-3333-444444444444',
    '35',
    'Reliefs available to complainant',
    'The District Commission shall have jurisdiction to entertain complaints where the value of the goods or services paid as consideration does not exceed one crore rupees.',
    'Specifies monetary jurisdiction and available reliefs for consumers'
),
(
    gen_random_uuid(),
    'bbbbbbbb-2222-3333-4444-555555555555',
    '16',
    'Implied conditions as to quality or fitness',
    'Where the buyer, expressly or by implication, makes known to the seller the particular purpose for which the goods are required, there is an implied condition that the goods shall be reasonably fit for such purpose.',
    'Implied warranty of fitness for particular purpose'
),
(
    gen_random_uuid(),
    'cccccccc-3333-4444-5555-666666666666',
    '73',
    'Compensation for loss or damage',
    'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby.',
    'General principle for claiming damages in case of breach'
)
ON CONFLICT (act_id, section_number) DO UPDATE SET
    section_text = EXCLUDED.section_text,
    explanation = EXCLUDED.explanation;

-- =============================================
-- 20. LAW_BOOKMARKS
-- =============================================
INSERT INTO law_bookmarks (user_id, section_id, user_notes) 
SELECT 
    user_id,
    (SELECT id FROM law_sections WHERE section_number = section_num AND act_id = act_id_val),
    notes
FROM (VALUES
    ('22222222-2222-2222-2222-222222222222', '2(1)(f)', 'aaaaaaaa-1111-2222-3333-444444444444', 'Most frequently used section in defective product cases'),
    ('44444444-4444-4444-4444-444444444444', '2(1)(g)', 'aaaaaaaa-1111-2222-3333-444444444444', 'Essential for medical negligence cases'),
    ('55555555-5555-5555-5555-555555555555', '35', 'aaaaaaaa-1111-2222-3333-444444444444', 'Important for jurisdiction determination')
) AS data(user_id, section_num, act_id_val, notes)
WHERE EXISTS (SELECT 1 FROM law_sections WHERE section_number = data.section_num AND act_id = data.act_id_val)
ON CONFLICT (user_id, section_id) DO UPDATE SET
    user_notes = EXCLUDED.user_notes;

-- =============================================
-- 21. LAW_SEARCH_HISTORY
-- =============================================
INSERT INTO law_search_history (user_id, search_query, search_results_count, category) VALUES
('22222222-2222-2222-2222-222222222222', 'defective products', 24, 'CONSUMER_LAW'),
('44444444-4444-4444-4444-444444444444', 'medical negligence consumer', 18, 'CONSUMER_LAW'),
('11111111-1111-1111-1111-111111111111', 'e-commerce fraud', 12, 'CONSUMER_LAW'),
('33333333-3333-3333-3333-333333333333', 'deficiency in service', 32, 'CONSUMER_LAW'),
('55555555-5555-5555-5555-555555555555', 'digital consumer rights', 8, 'CONSUMER_LAW')
ON CONFLICT DO NOTHING;

-- =============================================
-- 22. WORKSPACE_NOTES
-- =============================================
INSERT INTO workspace_notes (user_id, title, content, category, tags, folder, created_at) VALUES
(
    '22222222-2222-2222-222222222222',
    'Defective Product Case Arguments',
    'Key arguments for defective refrigerator case:\n1. Product stopped within warranty period\n2. Multiple repair attempts failed\n3. Consumer expectations not met\n4. Precedent: Kumar vs. LG (2021)',
    'CONSUMER_LAW',
    ARRAY['Case Preparation', 'Arguments', 'Defective Products'],
    'ACTIVE_CASES',
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'Medical Negligence Research',
    'Important points for medical negligence case:\n- Standard of care expected\n- Expert opinion requirements\n- Documentation needed\n- Compensation calculation',
    'CONSUMER_LAW',
    ARRAY['Medical', 'Negligence', 'Research'],
    'RESEARCH',
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'Digital Consumer Rights Paper Outline',
    'Outline for research paper:\nI. Introduction\nII. Current legal framework\nIII. Gaps in CPA 2019\nIV. Proposed reforms\nV. Conclusion',
    'CONSUMER_LAW',
    ARRAY['Research', 'Paper', 'Digital Rights'],
    'ACADEMIC',
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'Important Consumer Law Judgments',
    'Landmark cases:\n1. V.P. Shantha (1995) - Medical services\n2. LIC vs. Consumer (2000) - Insurance\n3. Amazon vs. Consumer (2021) - E-commerce\n4. Kumar vs. State (2023) - Defective goods',
    'CONSUMER_LAW',
    ARRAY['Judgments', 'Precedents', 'Important'],
    'REFERENCES',
    CURRENT_TIMESTAMP
),
(
    '11111111-1111-1111-1111-111111111111',
    'Internship Learnings',
    'Key learnings from District Commission internship:\n- 40% cases are banking related\n- Average disposal time: 6 months\n- Common issues: documentation\n- Mediation success rate: 30%',
    'CONSUMER_LAW',
    ARRAY['Internship', 'Learnings', 'Experience'],
    'PERSONAL',
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 23. NOTIFICATIONS
-- =============================================
INSERT INTO notifications (user_id, notification_type, title, message, source_type, source_id, is_read, created_at) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'NEW_FOLLOWER',
    'New Follower',
    'Priya Patel started following you',
    'USER',
    '22222222-2222-2222-2222-222222222222',
    false,
    CURRENT_TIMESTAMP
),
(
    '22222222-2222-2222-2222-222222222222',
    'POST_LIKE',
    'Post Liked',
    'Justice Mehta liked your post about Supreme Court judgment',
    'POST',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    true,
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'CONNECTION_REQUEST',
    'Connection Request',
    'Rahul Sharma sent you a connection request',
    'USER',
    '11111111-1111-1111-1111-111111111111',
    false,
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'DISCUSSION_REPLY',
    'New Reply to Discussion',
    'Amit Verma replied to your discussion on CPA 2019 limitations',
    'DISCUSSION',
    'dddddddd-eeee-ffff-gggg-hhhhhhhhhhhh',
    true,
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'AI_RESULT_READY',
    'AI Analysis Complete',
    'Your consumer law prediction is ready',
    'AI_SESSION',
    'dddddddd-dddd-eeee-ffff-gggggggggggg',
    false,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 24. ACTIVITY_LOGS
-- =============================================
INSERT INTO activity_logs (user_id, activity_type, entity_type, entity_id, entity_name, created_at) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'POST_CREATED',
    'POST',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Recent Supreme Court Judgment on Defective Products',
    CURRENT_TIMESTAMP
),
(
    '11111111-1111-1111-1111-111111111111',
    'DISCUSSION_CREATED',
    'DISCUSSION',
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    'How to file a complaint for defective mobile phone?',
    CURRENT_TIMESTAMP
),
(
    '44444444-4444-4444-4444-444444444444',
    'AI_SESSION_STARTED',
    'AI_SESSION',
    'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
    'Medical Negligence Precedents',
    CURRENT_TIMESTAMP
),
(
    '33333333-3333-3333-3333-333333333333',
    'POST_LIKED',
    'POST',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Recent Supreme Court Judgment',
    CURRENT_TIMESTAMP
),
(
    '55555555-5555-5555-5555-555555555555',
    'BOOKMARK_ADDED',
    'POST',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Supreme Court Judgment Post',
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- =============================================
-- UPDATE STATISTICS BASED ON INSERTED DATA
-- =============================================

-- Update user statistics
UPDATE users SET 
    follower_count = COALESCE((SELECT COUNT(*) FROM user_follows WHERE following_id = users.id), 0),
    following_count = COALESCE((SELECT COUNT(*) FROM user_follows WHERE follower_id = users.id), 0),
    post_count = COALESCE((SELECT COUNT(*) FROM posts WHERE user_id = users.id), 0),
    discussion_count = COALESCE((SELECT COUNT(*) FROM discussions WHERE user_id = users.id), 0);

-- Update post statistics
UPDATE posts SET 
    like_count = COALESCE((SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id), 0),
    comment_count = COALESCE((SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id), 0);

-- Update discussion statistics
UPDATE discussions SET 
    reply_count = COALESCE((SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = discussions.id), 0),
    follower_count = COALESCE((SELECT COUNT(*) FROM discussion_followers WHERE discussion_id = discussions.id), 0),
    upvote_count = COALESCE((SELECT COUNT(*) FROM discussion_upvotes WHERE discussion_id = discussions.id), 0);

-- Update conversation last message timestamps
UPDATE conversations c SET last_message_at = (
    SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id
);

-- =============================================
-- VERIFICATION AND SUCCESS MESSAGE
-- =============================================
DO $$
DECLARE
    user_count INTEGER;
    post_count INTEGER;
    discussion_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO post_count FROM posts;
    SELECT COUNT(*) INTO discussion_count FROM discussions;
    
    RAISE NOTICE '✅ Database seeding completed successfully!';
    RAISE NOTICE '📊 Statistics:';
    RAISE NOTICE '   Users: %', user_count;
    RAISE NOTICE '   Posts: %', post_count;
    RAISE NOTICE '   Discussions: %', discussion_count;
    RAISE NOTICE '';
    RAISE NOTICE '👥 Test Users (Password: username123):';
    RAISE NOTICE '   student.law@example.com (student123)';
    RAISE NOTICE '   advocate.patel@example.com (advocate123)';
    RAISE NOTICE '   justice.mehta@example.com (justice123)';
    RAISE NOTICE '   lawyer.verma@example.com (lawyer123)';
    RAISE NOTICE '   legal.pro@example.com (legal123)';
END$$;