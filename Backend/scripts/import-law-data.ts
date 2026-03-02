import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database';

// Define interface for the common structure
interface LegalSection {
  chapter: number;
  section: string | number;
  section_title: string;
  section_desc: string;
}

// Configuration for each act
const ACT_CONFIGS: Record<string, {
  name: string;
  year: number;
  shortTitle: string;
  category: string;
  preamble: string;
}> = {
  'crpc.json': {
    name: 'Code of Criminal Procedure, 1973',
    year: 1973,
    shortTitle: 'CrPC',
    category: 'CRIMINAL_LAW',
    preamble: 'An Act to consolidate and amend the law relating to criminal procedure.'
  },
  'iea.json': {
    name: 'Indian Evidence Act, 1872',
    year: 1872,
    shortTitle: 'IEA',
    category: 'CIVIL_LAW',
    preamble: 'An Act to consolidate, define and amend the law of Evidence.'
  },
  'nia.json': {
    name: 'Negotiable Instruments Act, 1881',
    year: 1881,
    shortTitle: 'NIA',
    category: 'CORPORATE_LAW',
    preamble: 'An Act to define and amend the law relating to Promissory Notes, Bills of Exchange and Cheques.'
  }
};

async function importCriminalCodes() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📚 Importing Criminal Procedure Code, Evidence Act, and Negotiable Instruments Act...');
    
    const dataDir = path.join(__dirname, '../data/laws');
    
    // Check if directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.error(`❌ Directory not found: ${dataDir}`);
      return;
    }
    
    // Files to import
    const filesToImport = ['crpc.json', 'iea.json', 'nia.json'];
    
    for (const file of filesToImport) {
      const config = ACT_CONFIGS[file];
      if (!config) continue;
      
      console.log(`\n📄 Importing ${file} (${config.name})...`);
      
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      let sections: LegalSection[];
      try {
        sections = JSON.parse(fileContent);
      } catch (parseError) {
        console.error(`❌ Error parsing ${file}:`, parseError);
        continue;
      }
      
      if (!Array.isArray(sections)) {
        console.error(`❌ Invalid format in ${file}: expected array`);
        continue;
      }
      
      console.log(`📊 Found ${sections.length} sections`);
      
      // Check if act already exists
      const existingAct = await client.query(
        `SELECT id FROM law_acts WHERE act_name = $1 AND act_year = $2`,
        [config.name, config.year]
      );
      
      let actId: string;
      
      if (existingAct.rows.length > 0) {
        actId = existingAct.rows[0].id;
        console.log(`✅ Found existing act with ID: ${actId}`);
        
        // Delete existing sections to avoid conflicts
        const deleteResult = await client.query(
          'DELETE FROM law_sections WHERE act_id = $1',
          [actId]
        );
        console.log(`🗑️ Cleared ${deleteResult.rowCount} existing sections`);
      } else {
        // Insert new act
        const actResult = await client.query(
          `INSERT INTO law_acts (
            act_name, act_year, short_title, category, preamble, tags
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
          [
            config.name,
            config.year,
            config.shortTitle,
            config.category,
            config.preamble,
            [config.category, 'ACT']
          ]
        );
        
        actId = actResult.rows[0].id;
        console.log(`✅ New act inserted with ID: ${actId}`);
      }
      
      // Insert sections
      let insertedCount = 0;
      let skippedCount = 0;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Validate required fields
        if (section.section === undefined || section.section === null) {
          console.warn(`  ⚠️ Section at index ${i} missing section number, skipping`);
          skippedCount++;
          continue;
        }
        
        if (!section.section_desc) {
          console.warn(`  ⚠️ Section ${section.section} missing description, skipping`);
          skippedCount++;
          continue;
        }
        
        // Format section number (handle alphanumeric like "53A", "65B")
        const sectionNumber = section.section.toString().trim();
        
        // Prepare section title
        const sectionTitle = section.section_title || '';
        
        // Prepare section text with chapter context
        let sectionText = section.section_desc;
        if (section.chapter) {
          // Add chapter information at the beginning
          sectionText = `[Chapter ${section.chapter}]\n\n${section.section_desc}`;
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
              sectionNumber,
              sectionTitle,
              sectionText,
              null // No explanation field in these JSON files
            ]
          );
          insertedCount++;
        } catch (error: any) {
          console.error(`  ❌ Error inserting section ${sectionNumber}:`, error.message);
          skippedCount++;
        }
        
        // Show progress every 25 sections
        if ((i + 1) % 25 === 0 || i === sections.length - 1) {
          console.log(`  Progress: ${i + 1}/${sections.length} sections (${insertedCount} inserted, ${skippedCount} skipped)`);
        }
      }
      
      console.log(`  ✅ Imported ${insertedCount} sections from ${file} (${skippedCount} skipped)`);
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    // Verify the import
    const verifyActs = await client.query(`
      SELECT 
        a.id, 
        a.act_name, 
        a.act_year, 
        a.category,
        COUNT(s.id) as section_count 
      FROM law_acts a
      LEFT JOIN law_sections s ON a.id = s.act_id
      WHERE a.act_name ILIKE '%Procedure%' 
         OR a.act_name ILIKE '%Evidence%' 
         OR a.act_name ILIKE '%Negotiable%'
      GROUP BY a.id, a.act_name, a.act_year, a.category
      ORDER BY a.act_year
    `);
    
    console.log('\n🔍 Verification:');
    if (verifyActs.rows.length === 0) {
      console.log('   No acts found. Import may have failed.');
    } else {
      verifyActs.rows.forEach(act => {
        console.log(`   - ${act.act_name} (${act.act_year}): ${act.section_count} sections [${act.category}]`);
      });
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error importing acts:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  importCriminalCodes()
    .then(() => {
      console.log('\n✨ Import script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error);
      process.exit(1);
    });
}

export { importCriminalCodes };