const fs = require('fs');
const path = require('path');

async function testComments() {
    console.log('🧪 Testing Comments Functionality...');

    const email = 'legal.pro@example.com';
    const password = 'legal123'; // Assuming this works from previous session

    let token = null;

    // 1. Login
    console.log('🔑 Logging in...');
    try {
        const loginResponse = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.token || loginData.data?.token;
            console.log('✅ Login successful');
        } else {
            console.error('❌ Login failed:', await loginResponse.text());
            return;
        }
    } catch (e) {
        console.error('Login error:', e.message);
        return;
    }

    // 2. Get a post ID
    console.log('📄 Fetching feed to get a post ID...');
    let postId = null;
    try {
        const feedResponse = await fetch('http://localhost:3000/api/posts/feed', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedData = await feedResponse.json();
        const posts = feedData.data.posts || feedData.data;
        if (posts && posts.length > 0) {
            postId = posts[0].id;
            console.log('✅ Got post ID:', postId);
        } else {
            console.error('❌ No posts found in feed');
            return;
        }
    } catch (e) {
        console.error('Feed error:', e.message);
        return;
    }

    // 3. Test Add Comment
    console.log('💬 Adding a comment...');
    try {
        const commentResponse = await fetch(`http://localhost:3000/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: 'Test insight from script' })
        });

        if (commentResponse.ok) {
            const commentData = await commentResponse.json();
            console.log('✅ Comment added:', JSON.stringify(commentData, null, 2));
        } else {
            console.error('❌ Add comment failed:', await commentResponse.text());
        }
    } catch (e) {
        console.error('Add comment error:', e.message);
    }

    // 4. Test Fetch Comments
    console.log('🔍 Fetching comments...');
    try {
        const getCommentsResponse = await fetch(`http://localhost:3000/api/posts/${postId}/comments`);
        if (getCommentsResponse.ok) {
            const commentsData = await getCommentsResponse.json();
            console.log('✅ Comments fetched:', JSON.stringify(commentsData, null, 2));
        } else {
            console.error('❌ Fetch comments failed:', await getCommentsResponse.text());
        }
    } catch (e) {
        console.error('Fetch comments error:', e.message);
    }
}

testComments();
