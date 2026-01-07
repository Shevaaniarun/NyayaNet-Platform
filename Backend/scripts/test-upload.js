const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log('🧪 Testing File Upload (With Auth)...');

    const email = 'legal.pro@example.com';
    const passwords = ['legal123', 'username123'];

    let token = null;

    // 1. Login
    console.log('🔑 Logging in...');

    for (const password of passwords) {
        try {
            console.log(`Trying password: ${password}`);
            const loginResponse = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (loginResponse.ok) {
                const loginData = await loginResponse.json();
                token = loginData.token || loginData.data?.token;
                if (token) {
                    console.log('✅ Login successful with password:', password);
                    break;
                }
            } else {
                console.log(`❌ Login failed with ${password}:`, await loginResponse.text());
            }
        } catch (e) {
            console.error('Login error:', e.message);
        }
    }

    if (!token) {
        console.error('❌ Could not login with any password (Authentication broken).');
        // Do NOT proceed to upload if auth failed, as it will just be 401
        return;
    }

    // 2. Prepare Upload
    console.log('📤 Uploading file...');
    const filePath = path.join(__dirname, 'test.png');
    // Create verifyable png header
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    fs.writeFileSync(filePath, pngSignature);

    const formData = new FormData();
    const fileContent = fs.readFileSync(filePath);
    const blob = new Blob([fileContent], { type: 'image/png' });
    formData.append('files', blob, 'test.png');

    // 3. Send Upload Request
    try {
        const uploadResponse = await fetch('http://localhost:3000/api/posts/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}\n${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        console.log('✅ Upload successful:', JSON.stringify(uploadData, null, 2));

    } catch (error) {
        console.error('❌ Upload test failed:', error.message);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testUpload();
