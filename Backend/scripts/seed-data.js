#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🌱 NyayaNet Database Seeding\n');

// Parse DATABASE_URL or use individual variables
const getConnectionString = () => {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'nyayanet'}`;
};

const connectionString = getConnectionString();
console.log('Using connection:', connectionString.replace(/:[^:]*@/, ':****@'));

// Extract components from URL
const urlMatch = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
    console.error('❌ Invalid connection string format');
    console.error('Expected format: postgresql://user:password@host:port/database');
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
            timeout: 60000
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

async function checkDatabaseExists() {
    console.log('\n1. Checking database...');

    const checkCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "SELECT 1;"`;
    const result = runCommand(checkCmd, true);

    if (!result) {
        console.error(`❌ Database '${database}' does not exist or cannot be accessed`);
        console.error('   Run setup first: npm run db:setup');
        return false;
    }

    console.log('✅ Database connection successful');
    return true;
}

async function checkIfAlreadySeeded() {
    console.log('\n2. Checking for existing data...');

    const checkCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "SELECT COUNT(*) as user_count FROM users;" -t`;
    const result = runCommand(checkCmd, true);

    if (result && parseInt(result.trim()) > 1) { // >1 because admin user is always there
        console.log('⚠️  Database already contains data');

        if (process.argv.includes('--force')) {
            console.log('   Force flag detected, proceeding with reseed...');
            return false;
        }

        const answer = await askQuestion('Do you want to reseed? This will delete all data. (y/N): ');
        if (answer.toLowerCase() !== 'y') {
            console.log('❌ Seeding cancelled');
            return true;
        }
    }

    return false;
}

async function runSeed() {
    console.log('\n3. Running seed data...');

    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    if (!fs.existsSync(seedPath)) {
        console.error(`❌ Seed file not found: ${seedPath}`);
        return false;
    }

    // Check if seed file is readable
    try {
        const stats = fs.statSync(seedPath);
        if (stats.size === 0) {
            console.error('❌ Seed file is empty');
            return false;
        }
    } catch (error) {
        console.error(`❌ Cannot read seed file: ${error.message}`);
        return false;
    }

        // Run dashboard.sql before seeding
        if (!await runDashboardSqlBeforeSeed()) {
            return false;
        }

    const seedCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${seedPath}"`;
    const result = runCommand(seedCmd);

    if (!result) {
        console.error('❌ Failed to run seed data');
        return false;
    }

    return true;
}

async function runDashboardSqlBeforeSeed() {
    console.log('\n2.b Running dashboard schema (contributions + triggers) before seeding...');

    const dashboardPath = path.join(__dirname, '..', 'database', 'dashboard.sql');
    if (!fs.existsSync(dashboardPath)) {
        console.warn(`⚠️ Dashboard SQL not found: ${dashboardPath} — skipping dashboard triggers`);
        return true;
    }

    try {
        const stats = fs.statSync(dashboardPath);
        if (stats.size === 0) {
            console.warn('⚠️ Dashboard SQL is empty — skipping');
            return true;
        }
    } catch (error) {
        console.error(`❌ Cannot read dashboard SQL: ${error.message}`);
        return false;
    }

    const dashCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${dashboardPath}"`;
    const result = runCommand(dashCmd, true);

    if (!result) {
        console.error('❌ Failed to run dashboard.sql — triggers may be missing');
        return false;
    }

    return true;
}

async function verifySeed() {
    console.log('\n4. Verifying seeded data...');

    const verifyQueries = [
        `SELECT '👥 Users: ' || COUNT(*) as count FROM users`,
        `SELECT '📝 Posts: ' || COUNT(*) as count FROM posts`,
        `SELECT '💬 Discussions: ' || COUNT(*) as count FROM discussions`,
        `SELECT '🤖 AI Sessions: ' || COUNT(*) as count FROM ai_sessions`,
        `SELECT '⚖️  Law Acts: ' || COUNT(*) as count FROM law_acts`
    ];

    for (const query of verifyQueries) {
        const cmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "${query}" -t`;
        const result = runCommand(cmd, true);
        if (result) {
            console.log(`   ${result.trim()}`);
        }
    }

        // Run backfill contributions to populate user_contributions and summary from existing content
        const backfillPath = path.join(__dirname, '..', 'database', 'backfill_contributions.sql');
        if (fs.existsSync(backfillPath)) {
            console.log('\n⏱️ Running contributions backfill to compute user contribution records...');
            const backfillCmd = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${backfillPath}"`;
            runCommand(backfillCmd, true);
        } else {
            console.log('\n⚠️ Backfill script not found; skipping contribution backfill');
        }

    // Show test user credentials
    console.log('\n🔑 Test User Credentials (Password: username123):');
    console.log('   student.law@example.com (student123)');
    console.log('   advocate.patel@example.com (advocate123)');
    console.log('   justice.mehta@example.com (justice123)');
    console.log('   lawyer.verma@example.com (lawyer123)');
    console.log('   legal.pro@example.com (legal123)');

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
    console.log('NyayaNet Database Seeding Tool');
    console.log('='.repeat(60));

    try {
        // Check if database exists
        if (!await checkDatabaseExists()) {
            process.exit(1);
        }

        // Check if already seeded
        if (await checkIfAlreadySeeded()) {
            process.exit(0);
        }

        // Run seed
        if (!await runSeed()) {
            process.exit(1);
        }

        // Verify
        await verifySeed();

        console.log('\n' + '='.repeat(60));
        console.log('✅ Database seeding complete!');
        console.log('\n🚀 You can now start the server:');
        console.log('   npm run dev');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Usage: node seed-data.js [options]

Options:
  --force        Force reseed even if data exists
  --help, -h     Show this help message

Environment variables:
  DATABASE_URL   PostgreSQL connection string
  DB_USER        Database user (default: postgres)
  DB_PASSWORD    Database password (default: postgres)
  DB_HOST        Database host (default: localhost)
  DB_PORT        Database port (default: 5432)
  DB_NAME        Database name (default: nyayanet)
`);
    process.exit(0);
}

main().finally(() => {
    process.stdin.destroy();
});