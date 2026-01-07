const bcrypt = require('bcrypt');

async function test() {
    console.log('Testing bcrypt...');
    try {
        const start = Date.now();
        const hash = await bcrypt.hash('testpassword', 10);
        console.log('Hash generated:', hash);
        console.log('Time taken:', Date.now() - start, 'ms');

        const match = await bcrypt.compare('testpassword', hash);
        console.log('Match result:', match);
    } catch (e) {
        console.error('Bcrypt error:', e);
    }
}

test();
