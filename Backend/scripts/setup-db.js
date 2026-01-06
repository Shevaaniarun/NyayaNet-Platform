#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('⚖️  NyayaNet Database Setup\n');

// Parse DATABASE_URL or use individual variables
const getConnectionString = () => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5433}/${process.env.DB_NAME || 'nyayanet'}`;
};

const connectionString = getConnectionString();
console.log('Using connection:', connectionString.replace(/:[^:]*@/, ':****@'));

// Extract components from URL
const urlMatch = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
    console.error('❌ Invalid connection string format');
    console.error('Expected format: postgresql://user:password@host:port/database');
    console.error('You can also set DATABASE_URL in .env file');
    process.exit(1);
}

const [_, user, password, host, port, database] = urlMatch;

// Set environment variable for psql
process.env.PGPASSWORD = password;

function runCommand(command, ignoreErrors = false) {
    console.log(`\n> ${command.substring(0, 100)}...`);
    try {
        const result = execSync(command, { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', ignoreErrors ? 'pipe' : 'inherit'],
            timeout: 30000
        });
        console.log('✅ Success');
        return result.trim();
    } catch (error) {
        if (!ignoreErrors) {
            console.error(`❌ Failed: ${error.message}`);
            if (error.stdout) console.log('Output:', error.stdout);
            if (error.stderr) console.log('Error:', error.stderr);
        }
        return null;
    }
}

async function checkPostgresConnection() {
    console.log('\n1. Testing PostgreSQL connection...');
    
    const testCmd = `psql -h ${host} -p ${port} -U ${user} -c "SELECT version();"`;
    const result = runCommand(testCmd, true);
    
    if (!result) {
        console.error('\n❌ Cannot connect to PostgreSQL. Please check:');
        console.error('   • Is PostgreSQL installed?');
        console.error('   • Is the service running?');
        console.error('   • Are credentials correct?');
        console.error('\n🔧 Troubleshooting:');
        console.error('   Windows: net start postgresql-x64-16');
        console.error('   Mac/Linux: brew services start postgresql');
        console.error('   Ubuntu: sudo service postgresql start');
        return false;
    }
    
    console.log('✅ PostgreSQL connection successful');
    return true;
}

async function createDatabase() {
    console.log('\n2. Creating database...');
    
    // First check if database exists
    const checkDbCmd = `psql -h ${host} -p ${port} -U ${user} -lqt | cut -d \\| -f 1 | grep -w ${database}`;
    const dbExists = runCommand(checkDbCmd, true);
    
    if (dbExists) {
        console.log(`⚠️  Database '${database}' already exists`);
        const answer = process.argv.includes('--force') ? 'y' : 
            await askQuestion(`Do you want to drop and recreate it? (y/N): `);
        
        if (answer.toLowerCase() === 'y') {
            console.log('Dropping existing database...');
            const dropCmd = `psql -h ${host} -p ${port} -U ${user} -c "DROP DATABASE IF EXISTS ${database};"`;
            runCommand(dropCmd);
            
            const createCmd = `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE ${database};"`;
            runCommand(createCmd);
        } else {
            console.log('Using existing database');
        }
    } else {
        const createCmd = `psql -h ${host} -p ${port} -U ${user} -c "CREATE DATABASE ${database};"`;
        runCommand(createCmd);
    }
    
    return true;
}

async function runSchema() {
    console.log('\n3. Running schema...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Schema file not found: ${schemaPath}`);
        return false;
    }
    
    // Check if schema file is readable
    try {
        const stats = fs.statSync(schemaPath);
        if (stats.size === 0) {
            console.error('❌ Schema file is empty');
            return false;
        }
    } catch (error) {
        console.error(`❌ Cannot read schema file: ${error.message}`);
        return false;
    }
    
    const schemaCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${schemaPath}"`;
    const result = runCommand(schemaCmd);
    
    if (!result) {
        console.error('❌ Failed to run schema');
        return false;
    }
    
    return true;
}

async function verifyDatabase() {
    console.log('\n4. Verifying database setup...');
    
    const verifyCmds = [
        `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "SELECT COUNT(*) as user_count FROM users;" -t`,
        `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "\\dt" -t`
    ];
    
    for (const cmd of verifyCmds) {
        const result = runCommand(cmd, true);
        if (result) {
            console.log(`   ${result.trim()}`);
        }
    }
    
    return true;
}

async function askQuestion(question) {
    process.stdout.write(question);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
}

async function main() {
    console.log('='.repeat(60));
    console.log('NyayaNet Database Setup Tool');
    console.log('='.repeat(60));
    
    try {
        // Check connection
        if (!await checkPostgresConnection()) {
            process.exit(1);
        }
        
        // Create database
        if (!await createDatabase()) {
            process.exit(1);
        }
        
        // Run schema
        if (!await runSchema()) {
            process.exit(1);
        }
        
        // Verify
        await verifyDatabase();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Database setup complete!');
        console.log('\n📊 Next steps:');
        console.log('   1. Run seed data:    npm run db:seed');
        console.log('   2. Start server:     npm run dev');
        console.log('\n🔑 Default admin credentials:');
        console.log('   Email:    admin@nyayanet.com');
        console.log('   Password: admin123');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node setup-db.js [options]

Options:
  --force        Force recreation of database
  --help, -h     Show this help message

Environment variables:
  DATABASE_URL   PostgreSQL connection string
  DB_USER        Database user (default: postgres)
  DB_PASSWORD    Database password (default: postgres)
  DB_HOST        Database host (default: localhost)
  DB_PORT        Database port (default: 5433)
  DB_NAME        Database name (default: nyayanet)
`);
    process.exit(0);
}

main().finally(() => {
    process.stdin.destroy();
});