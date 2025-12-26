const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🌱 Seeding NyayaNet Database\n');

// Parse DATABASE_URL or use individual variables
const DATABASE_URL = process.env.DATABASE_URL || 
                     `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;

console.log('Using connection:', DATABASE_URL.replace(/:[^:]*@/, ':****@'));

// Extract components from URL
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
    console.error('❌ Invalid DATABASE_URL format');
    process.exit(1);
}

const [_, user, password, host, port, database] = urlMatch;

// Set environment variable for psql
process.env.PGPASSWORD = password;

function runCommand(command, ignoreErrors = false) {
    console.log(`\n> ${command.substring(0, 80)}...`);
    try {
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', ignoreErrors ? 'pipe' : 'inherit']
        });
        console.log('✓ Success');
        return result.trim();
    } catch (error) {
        if (!ignoreErrors) {
            console.error(`✗ Failed: ${error.message}`);
        }
        return null;
    }
}

async function main() {
    console.log('\n1. Checking database connection...');
    
    const testCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "SELECT 1;"`;
    const result = runCommand(testCmd);
    
    if (!result) {
        console.error('❌ Cannot connect to database. Run npm run db:setup first.');
        process.exit(1);
    }
    
    console.log('\n2. Seeding data...');
    const seedPath = path.join(__dirname, '../database/seed.sql');
    
    if (fs.existsSync(seedPath)) {
        const seedCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${seedPath}"`;
        runCommand(seedCmd);
    } else {
        console.error('Seed file not found:', seedPath);
        process.exit(1);
    }
    
    console.log('\n3. Verifying data...');
    
    const verifyQueries = [
        `SELECT 'Users: ' || COUNT(*) FROM users`,
        `SELECT 'Posts: ' || COUNT(*) FROM posts`,
        `SELECT 'Discussions: ' || COUNT(*) FROM discussions`,
        `SELECT 'AI Sessions: ' || COUNT(*) FROM ai_sessions`
    ];
    
    for (const query of verifyQueries) {
        const verifyCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "${query}" -t`;
        const result = runCommand(verifyCmd, true);
        if (result) console.log(`   ${result}`);
    }
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n👥 Test Users:');
    console.log('   Email: student.law@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 Start server: npm run dev');
}

main().catch(console.error);