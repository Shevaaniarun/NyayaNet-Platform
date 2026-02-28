import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database';

// Define interfaces for different JSON structures
interface CPASection {
  law_id: string;
  law_type: string;
  act_name: string;
  act_abbreviation: string;
  act_type: string;
  category: string;
  chapter_number: string;
  chapter_name: string;
  section_number: string;
  section_title: string;
  section_text: string;
  sub_sections?: Array<{ clause_id: string; text: string }>;
  explanations?: Array<{ clause_id: string; text: string }>;
  related_keywords?: string[];
}

interface RuleSection {
  rule_id: string;
  rule_set_name: string;
  rule_type: string;
  chapter_number?: string | null;
  chapter_name?: string | null;
  rule_number: string;
  rule_title: string;
  rule_text: string;
  sub_rules?: Array<{ sub_rule_id: string; text: string }>;
  explanations?: Array<{ clause_id: string; text: string }>;
  related_keywords?: string[];
  cross_references?: {
    parent_act_sections?: string[];
    related_acts?: string[];
  };
}

// Configuration for each law file
const LAW_CONFIGS: Record<string, {
  act_name: string;
  act_year: number;
  short_title: string;
  category: string;
  type: 'act' | 'rule';
  preamble?: string;
}> = {
  'CPA2019.json': {
    act_name: 'Consumer Protection Act, 2019',
    act_year: 2019,
    short_title: 'CPA 2019',
    category: 'CONSUMER_LAW',
    type: 'act',
    preamble: 'An Act to provide for protection of the interests of consumers and for the said purpose, to establish authorities for timely and effective administration and settlement of consumers disputes and for matters connected therewith or incidental thereto.'
  },
  'CDRC2020.json': {
    act_name: 'Consumer Protection (Consumer Disputes Redressal Commissions) Rules, 2020',
    act_year: 2020,
    short_title: 'CDRC Rules 2020',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'Rules regarding the functioning of Consumer Disputes Redressal Commissions.'
  },
  'CPDS2021.json': {
    act_name: 'Consumer Protection (Direct Selling) Rules, 2021',
    act_year: 2021,
    short_title: 'Direct Selling Rules 2021',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'Rules to regulate direct selling businesses and protect consumers in direct selling transactions.'
  },
  'CPDS2023_AMEND.json': {
    act_name: 'Consumer Protection (Direct Selling) (Amendment) Rules, 2023',
    act_year: 2023,
    short_title: 'Direct Selling Amendment 2023',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'Amendment to the Consumer Protection (Direct Selling) Rules, 2021.'
  },
  'CPGR2020.json': {
    act_name: 'Consumer Protection (General) Rules, 2020',
    act_year: 2020,
    short_title: 'General Rules 2020',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'General rules for implementation of the Consumer Protection Act, 2019.'
  },
  'CPJC2021.json': {
    act_name: 'Consumer Protection (Jurisdiction of the District Commission, the State Commission and the National Commission) Rules, 2021',
    act_year: 2021,
    short_title: 'Jurisdiction Rules 2021',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'Rules specifying the monetary jurisdiction of consumer commissions.'
  },
  'CPMR2020.json': {
    act_name: 'Consumer Protection (Mediation) Rules, 2020',
    act_year: 2020,
    short_title: 'Mediation Rules 2020',
    category: 'CONSUMER_LAW',
    type: 'rule',
    preamble: 'Rules governing mediation proceedings under the Consumer Protection Act, 2019.'
  }
};

async function importConsumerLaws() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📚 Importing Consumer Protection Laws...');
    
    const dataDir = path.join(__dirname, '../data/laws');
    
    // Check if directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.error(`❌ Directory not found: ${dataDir}`);
      console.log('Please create the directory and place the JSON files there.');
      return;
    }
    
    const files = await fs.readdir(dataDir);
    console.log(`📁 Found files: ${files.join(', ')}`);
    
    let totalActs = 0;
    let totalSections = 0;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const config = LAW_CONFIGS[file];
      if (!config) {
        console.log(`⏭️ Skipping unknown file: ${file}`);
        continue;
      }
      
      console.log(`\n📄 Importing ${file} (${config.act_name})...`);
      
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      if (!Array.isArray(data)) {
        console.error(`❌ Invalid format in ${file}: expected array`);
        continue;
      }
      
      console.log(`📊 Found ${data.length} sections/rules`);
      
      // Insert the act/rule set
      const actResult = await client.query(
        `INSERT INTO law_acts (
          act_name, act_year, short_title, category, preamble, tags, full_text
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (act_name, act_year) 
        DO UPDATE SET 
          short_title = EXCLUDED.short_title,
          preamble = EXCLUDED.preamble,
          tags = EXCLUDED.tags
        RETURNING id`,
        [
          config.act_name,
          config.act_year,
          config.short_title,
          config.category,
          config.preamble || null,
          [config.category, config.type === 'act' ? 'ACT' : 'RULE'],
          null // full_text will be built from sections
        ]
      );
      
      const actId = actResult.rows[0].id;
      console.log(`✅ Act/Rule set inserted with ID: ${actId}`);
      
      // Insert sections/rules
      let insertedCount = 0;
      let skippedCount = 0;
      
      for (const item of data) {
        try {
          let sectionNumber: string;
          let sectionTitle: string;
          let sectionText: string;
          let explanation: string | null = null;
          let relatedSections: string[] = [];
          let amendments: any[] = [];
          
          if (config.type === 'act') {
            // Handle CPA2019.json format (act sections)
            const actItem = item as CPASection;
            sectionNumber = `Section ${actItem.section_number}`;
            sectionTitle = actItem.section_title || '';
            sectionText = actItem.section_text;
            
            // Build explanation from sub-sections if available
            if (actItem.sub_sections && actItem.sub_sections.length > 0) {
              explanation = actItem.sub_sections.map(ss => ss.text).join('\n\n');
            }
            
            // Extract related sections from references if available
            if ((item as any).related_sections) {
              relatedSections = (item as any).related_sections;
            }
            
          } else {
            // Handle rule JSON format
            const ruleItem = item as RuleSection;
            
            // Handle different rule number formats
            if (ruleItem.rule_number) {
              sectionNumber = `Rule ${ruleItem.rule_number}`;
            } else if (ruleItem.rule_number === 'Amendment Rules') {
              sectionNumber = 'Amendment Rules';
            } else {
              sectionNumber = `Rule ${ruleItem.rule_id?.split('_')[1] || 'Unknown'}`;
            }
            
            sectionTitle = ruleItem.rule_title || '';
            sectionText = ruleItem.rule_text || '';
            
            // Build explanation from sub_rules if available
            if (ruleItem.sub_rules && ruleItem.sub_rules.length > 0) {
              explanation = ruleItem.sub_rules.map(sr => sr.text).join('\n\n');
            }
            
            // Handle cross-references
            if (ruleItem.cross_references?.parent_act_sections) {
              relatedSections = ruleItem.cross_references.parent_act_sections;
            }
          }
          
          // Skip if no section text
          if (!sectionText) {
            skippedCount++;
            continue;
          }
          
          // Prepare amendments JSON if any
          const amendmentsJson = (item as any).amendments?.length > 0 
            ? JSON.stringify((item as any).amendments) 
            : null;
          
          // Prepare related sections JSON
          const relatedSectionsJson = relatedSections.length > 0 
            ? JSON.stringify(relatedSections) 
            : null;
          
          await client.query(
            `INSERT INTO law_sections (
              act_id, section_number, section_title, section_text, explanation, related_sections, amendments
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (act_id, section_number) 
            DO UPDATE SET
              section_title = EXCLUDED.section_title,
              section_text = EXCLUDED.section_text,
              explanation = EXCLUDED.explanation,
              related_sections = EXCLUDED.related_sections,
              amendments = EXCLUDED.amendments`,
            [
              actId,
              sectionNumber,
              sectionTitle,
              sectionText,
              explanation,
              relatedSectionsJson,
              amendmentsJson
            ]
          );
          
          insertedCount++;
          
          // Show progress every 10 items
          if (insertedCount % 10 === 0) {
            console.log(`  Progress: ${insertedCount}/${data.length} sections (${skippedCount} skipped)`);
          }
          
        } catch (error: any) {
          console.error(`  ❌ Error inserting item:`, error.message);
          skippedCount++;
        }
      }
      
      console.log(`  ✅ Imported ${insertedCount} sections from ${file} (${skippedCount} skipped)`);
      totalActs++;
      totalSections += insertedCount;
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONSUMER LAWS IMPORT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total Acts/Rules: ${totalActs}`);
    console.log(`   - Total Sections: ${totalSections}`);
    
    // Verify the import
    const verifyActs = await client.query(`
      SELECT id, act_name, act_year, 
             (SELECT COUNT(*) FROM law_sections WHERE act_id = law_acts.id) as section_count 
      FROM law_acts 
      WHERE category = 'CONSUMER_LAW'
      ORDER BY act_year DESC, act_name
    `);
    
    console.log(`\n🔍 Verification (${verifyActs.rows.length} Consumer Laws in DB):`);
    verifyActs.rows.forEach(act => {
      console.log(`   - ${act.act_name} (${act.act_year}): ${act.section_count} sections`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error importing consumer laws:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  importConsumerLaws()
    .then(() => {
      console.log('\n✨ Import script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error);
      process.exit(1);
    });
}

export { importConsumerLaws };