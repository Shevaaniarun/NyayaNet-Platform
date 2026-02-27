const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', password: 'postgres123', host: 'localhost', port: 5432, database: 'nyayanet' });

async function check() {
    // Total counts
    const convCount = await pool.query('SELECT COUNT(*) as total FROM conversations');
    const msgCount = await pool.query('SELECT COUNT(*) as total FROM messages');
    const memberCount = await pool.query('SELECT COUNT(*) as total FROM conversation_members');

    console.log('\n=== DATABASE CHAT SUMMARY ===');
    console.log('Total Conversations:', convCount.rows[0].total);
    console.log('Total Messages:', msgCount.rows[0].total);
    console.log('Total Conversation Member records:', memberCount.rows[0].total);

    // Per-conversation details with member names and message counts
    const details = await pool.query(`
    SELECT 
      c.id,
      c.conversation_type,
      c.title,
      c.is_active,
      c.created_at,
      COUNT(DISTINCT cm.user_id) as member_count,
      COUNT(DISTINCT m.id) as message_count,
      string_agg(DISTINCT u.full_name, ', ') as members
    FROM conversations c
    LEFT JOIN conversation_members cm ON cm.conversation_id = c.id AND COALESCE(cm.is_left, false) = false
    LEFT JOIN users u ON u.id = cm.user_id
    LEFT JOIN messages m ON m.conversation_id = c.id AND m.is_deleted = false
    GROUP BY c.id, c.conversation_type, c.title, c.is_active, c.created_at
    ORDER BY c.created_at DESC
  `);

    console.log('\n=== CONVERSATIONS DETAIL ===');
    details.rows.forEach((r, i) => {
        console.log(`\n[${i + 1}] ID: ${r.id}`);
        console.log(`    Type: ${r.conversation_type} | Active: ${r.is_active} | Messages: ${r.message_count}`);
        console.log(`    Members (${r.member_count}): ${r.members || 'none'}`);
        console.log(`    Created: ${r.created_at}`);
    });

    // Active vs inactive
    const activeConvs = details.rows.filter(r => r.is_active !== false);
    const inactiveConvs = details.rows.filter(r => r.is_active === false);
    console.log(`\n=== SUMMARY ===`);
    console.log(`Active conversations: ${activeConvs.length}`);
    console.log(`Inactive conversations: ${inactiveConvs.length}`);
    console.log(`Conversations with messages: ${details.rows.filter(r => parseInt(r.message_count) > 0).length}`);
    console.log(`Conversations with NO messages: ${details.rows.filter(r => parseInt(r.message_count) === 0).length}`);

    pool.end();
}

check().catch(e => { console.error('Error:', e.message); pool.end(); });
