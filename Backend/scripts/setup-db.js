const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('⚖️  NyayaNet Local PostgreSQL Setup\n');

// Parse DATABASE_URL or use individual variables
const DATABASE_URL = process.env.DATABASE_URL || 
                     `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;

console.log('Using connection:', DATABASE_URL.replace(/:[^:]*@/, ':****@'));

// Extract components from URL
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
    console.error('❌ Invalid DATABASE_URL format');
    console.error('Expected: postgresql://user:password@host:port/database');
    process.exit(1);
}

const [_, user, password, host, port, database] = urlMatch;

// Set environment variable for psql
process.env.PGPASSWORD = password;

function runCommand(command, ignoreErrors = false) {
    console.log(`\n> ${command}`);
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
    console.log('\n1. Testing PostgreSQL connection...');
    
    // Test basic connection
    const testCmd = `psql -h ${host} -p ${port} -U ${user} -c "SELECT version();"`;
    const result = runCommand(testCmd, true);
    
    if (!result) {
        console.error('\n❌ Cannot connect to PostgreSQL. Please check:');
        console.error('1. Is PostgreSQL installed?');
        console.error('2. Is the service running? (net start postgresql-x64-16)');
        console.error('3. Are credentials correct?');
        console.error('\nTo install PostgreSQL:');
        console.error('https://www.postgresql.org/download/windows/');
        process.exit(1);
    }
    
    console.log('\n2. Creating database if not exists...');
    const createDbCmd = `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE ${database};"`;
    runCommand(createDbCmd, true); // Ignore error if db exists
    
    console.log('\n3. Running schema...');
    const schemaPath = path.join(__dirname, 'database/schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${schemaPath}"`;
        runCommand(schemaCmd);
    } else {
        console.error('Schema file not found:', schemaPath);
    }
    
    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Connection Info:');
    console.log(`   Host: ${host}:${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   User: ${user}`);
    console.log(`\nNext: npm run db:seed`);
}

main().catch(console.error);