import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database';

interface IPCSection {
  chapter: number;
  chapter_title: string;
  Section: string | number;
  section_title: string;
  section_desc: string;
}

async function importIPC() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📚 Importing Indian Penal Code (IPC)...');
    
    const filePath = path.join(__dirname, '../data/laws/ipc.json');
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`❌ IPC file not found at: ${filePath}`);
      console.log('Please ensure ipc.json is placed in the data/laws directory');
      return;
    }
    
    // Read and parse IPC JSON
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const sections: IPCSection[] = JSON.parse(fileContent);
    
    if (!Array.isArray(sections)) {
      console.error('❌ IPC JSON is not an array');
      return;
    }
    
    console.log(`📊 Found ${sections.length} sections in IPC`);
    
    // Insert IPC Act
    const actResult = await client.query(
      `INSERT INTO law_acts (
        act_name, act_year, short_title, category, preamble, tags
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (act_name, act_year) 
      DO UPDATE SET 
        short_title = EXCLUDED.short_title,
        category = EXCLUDED.category,
        preamble = EXCLUDED.preamble,
        tags = EXCLUDED.tags
      RETURNING id`,
      [
        'Indian Penal Code',
        1860,
        'IPC',
        'CRIMINAL_LAW',
        'The Indian Penal Code, 1860 is the official criminal code of India.',
        ['CRIMINAL_LAW', 'PENAL_CODE']
      ]
    );
    
    const actId = actResult.rows[0].id;
    console.log(`✅ IPC Act inserted with ID: ${actId}`);
    
    // Insert all sections
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      // Validate required fields
      if (!section.Section && section.Section !== 0) {
        console.warn(`  ⚠️ Section at index ${i} missing Section number, skipping`);
        skippedCount++;
        continue;
      }
      
      if (!section.section_desc) {
        console.warn(`  ⚠️ Section ${section.Section} missing description, skipping`);
        skippedCount++;
        continue;
      }
      
      // Prepare section title (use section_title if available, otherwise generate from chapter)
      const sectionTitle = section.section_title || 
                          `Section ${section.Section} of Chapter ${section.chapter || 'Unknown'}`;
      
      // Prepare section text (combine description with chapter context if available)
      let sectionText = section.section_desc;
      if (section.chapter_title) {
        sectionText = `[Chapter ${section.chapter}: ${section.chapter_title}]\n\n${section.section_desc}`;
      }
      
      try {
        await client.query(
          `INSERT INTO law_sections (
            act_id, section_number, section_title, section_text, explanation
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (act_id, section_number) 
          DO UPDATE SET
            section_title = EXCLUDED.section_title,
            section_text = EXCLUDED.section_text,
            explanation = EXCLUDED.explanation`,
          [
            actId,
            section.Section.toString(),
            sectionTitle,
            sectionText,
            null // No explanation field in IPC JSON
          ]
        );
        insertedCount++;
      } catch (error: any) {
        console.error(`  ❌ Error inserting section ${section.Section}:`, error.message);
        skippedCount++;
      }
      
      // Show progress every 25 sections
      if ((i + 1) % 25 === 0) {
        console.log(`  Progress: ${i + 1}/${sections.length} sections processed (${insertedCount} inserted, ${skippedCount} skipped)`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ IPC IMPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total sections in file: ${sections.length}`);
    console.log(`   - Successfully inserted: ${insertedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    
    // Verify the import
    const verifySections = await client.query(
      'SELECT COUNT(*) FROM law_sections WHERE act_id = $1',
      [actId]
    );
    console.log(`   - Sections in database: ${verifySections.rows[0].count}`);
    
    // Show sample of first 5 sections
    const sampleSections = await client.query(
      `SELECT section_number, section_title 
       FROM law_sections 
       WHERE act_id = $1 
       ORDER BY 
         CAST(NULLIF(regexp_replace(section_number, '[^0-9]', '', 'g'), '') AS INTEGER),
         section_number 
       LIMIT 5`,
      [actId]
    );
    
    console.log('\n📝 Sample imported sections:');
    sampleSections.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. Section ${row.section_number}: ${row.section_title || 'No title'}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error importing IPC:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  importIPC()
    .then(() => {
      console.log('\n✨ IPC import script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 IPC import failed:', error);
      process.exit(1);
    });
}

export { importIPC };