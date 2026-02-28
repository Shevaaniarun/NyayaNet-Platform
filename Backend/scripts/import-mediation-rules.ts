import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database';

interface MediationRule {
  law_id: string;
  law_type: string;
  parent_act?: {
    act_id: string;
    act_name: string;
  };
  act_name: string;
  act_abbreviation: string;
  act_type: string;
  category: string;
  chapter_number?: string | null;
  chapter_name?: string | null;
  section_number: string;
  section_title: string;
  section_text: string;
  sub_sections?: Array<{ clause_id: string; text: string }>;
  definitions?: Array<{ term: string; definition: string }>;
  related_keywords?: string[];
  related_sections?: string[];
  cross_references?: {
    parent_act_sections?: string[];
    related_rules?: string[];
    related_forms?: string[];
    related_schedules?: string[];
  };
}

async function fixMediationRules() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📚 Fixing Consumer Protection (Mediation) Rules, 2020 import...');
    
    const filePath = path.join(__dirname, '../data/laws/CPMR2020.json');
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(`❌ File not found at: ${filePath}`);
      return;
    }
    
    // Read and parse JSON
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const rules: MediationRule[] = JSON.parse(fileContent);
    
    if (!Array.isArray(rules)) {
      console.error('❌ CPMR2020.json is not an array');
      return;
    }
    
    console.log(`📊 Found ${rules.length} rules in mediation rules`);
    
    // Find or create the Mediation Rules act
    let actId: string;
    
    // Check if act already exists
    const existingAct = await client.query(
      `SELECT id FROM law_acts 
       WHERE act_name = $1 AND act_year = $2`,
      ['Consumer Protection (Mediation) Rules, 2020', 2020]
    );
    
    if (existingAct.rows.length > 0) {
      actId = existingAct.rows[0].id;
      console.log(`✅ Found existing act with ID: ${actId}`);
      
      // Delete existing sections to re-import
      await client.query(
        'DELETE FROM law_sections WHERE act_id = $1',
        [actId]
      );
      console.log('🗑️ Cleared existing sections for re-import');
    } else {
      // Insert the act
      const actResult = await client.query(
        `INSERT INTO law_acts (
          act_name, act_year, short_title, category, preamble, tags
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          'Consumer Protection (Mediation) Rules, 2020',
          2020,
          'Mediation Rules 2020',
          'CONSUMER_LAW',
          'Rules governing mediation proceedings under the Consumer Protection Act, 2019.',
          ['CONSUMER_LAW', 'RULE', 'MEDIATION']
        ]
      );
      
      actId = actResult.rows[0].id;
      console.log(`✅ New act inserted with ID: ${actId}`);
    }
    
    // Insert all rules
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      
      try {
        // Format section number from the rule's section_number field
        let sectionNumber = rule.section_number;
        if (!sectionNumber.includes('Rule')) {
          sectionNumber = `Rule ${sectionNumber.replace('Rule ', '')}`;
        }
        
        const sectionTitle = rule.section_title || '';
        let sectionText = rule.section_text || '';
        
        // Build explanation text from sub_sections if available
        let explanation = '';
        if (rule.sub_sections && rule.sub_sections.length > 0) {
          explanation = rule.sub_sections.map(ss => ss.text).join('\n\n');
        }
        
        // Add definitions if available
        if (rule.definitions && rule.definitions.length > 0) {
          if (explanation) explanation += '\n\n';
          explanation += 'Definitions:\n' + 
            rule.definitions.map(d => `• ${d.term}: ${d.definition}`).join('\n');
        }
        
        // Prepare related sections JSON
        let relatedSections = null;
        if (rule.related_sections && rule.related_sections.length > 0) {
          relatedSections = JSON.stringify(rule.related_sections);
        } else if (rule.cross_references?.parent_act_sections) {
          relatedSections = JSON.stringify(rule.cross_references.parent_act_sections);
        }
        
        await client.query(
          `INSERT INTO law_sections (
            act_id, section_number, section_title, section_text, explanation, related_sections
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            actId,
            sectionNumber,
            sectionTitle,
            sectionText,
            explanation || null,
            relatedSections
          ]
        );
        
        insertedCount++;
        
        // Show progress
        if ((i + 1) % 2 === 0 || i === rules.length - 1) {
          console.log(`  Progress: ${i + 1}/${rules.length} rules inserted`);
        }
        
      } catch (error: any) {
        console.error(`  ❌ Error inserting rule ${rule.section_number}:`, error.message);
        skippedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MEDIATION RULES FIX COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total rules in file: ${rules.length}`);
    console.log(`   - Successfully inserted: ${insertedCount}`);
    console.log(`   - Skipped: ${skippedCount}`);
    
    // Verify the import
    const verifySections = await client.query(
      'SELECT section_number, section_title FROM law_sections WHERE act_id = $1 ORDER BY section_number',
      [actId]
    );
    
    console.log(`\n📝 Imported Mediation Rules sections:`);
    verifySections.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.section_number}: ${row.section_title}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing mediation rules:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  fixMediationRules()
    .then(() => {
      console.log('\n✨ Fix script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fix failed:', error);
      process.exit(1);
    });
}

export { fixMediationRules };