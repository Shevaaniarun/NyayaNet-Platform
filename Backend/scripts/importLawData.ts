import fs from 'fs/promises';
import path from 'path';
import pool from '../src/config/database';

interface LawSection {
  section?: string | number;
  title?: string;
  description?: string;
}

// Valid law_category enum values from your database
const VALID_CATEGORIES = [
  'CONSUMER_LAW',
  'CRIMINAL_LAW',
  'CIVIL_LAW',
  'CORPORATE_LAW',
  'CONSTITUTIONAL_LAW',
  'FAMILY_LAW',
  'TAX_LAW',
  'LABOR_LAW',
  'INTELLECTUAL_PROPERTY',
  'CYBER_LAW',
  'ARBITRATION',
  'PROPERTY_LAW',
  'LEGAL_ETHICS',
  'INTERNATIONAL_LAW'
];

// Mapping file names to act information and valid categories
const LAW_ACTS_CONFIG: Record<string, { 
  name: string, 
  year: number, 
  shortTitle: string,
  category: string 
}> = {
  'ipc.json': {
    name: 'Indian Penal Code',
    year: 1860,
    shortTitle: 'IPC',
    category: 'CRIMINAL_LAW'
  },
  'crpc.json': {
    name: 'Code of Criminal Procedure',
    year: 1973,
    shortTitle: 'CrPC',
    category: 'CRIMINAL_LAW'
  },
  'cpc.json': {
    name: 'Code of Civil Procedure',
    year: 1908,
    shortTitle: 'CPC',
    category: 'CIVIL_LAW'
  },
  'iea.json': {
    name: 'Indian Evidence Act',
    year: 1872,
    shortTitle: 'IEA',
    category: 'CIVIL_LAW' // Changed from EVIDENCE_LAW to CIVIL_LAW
  },
  'ida.json': {
    name: 'Indian Divorce Act',
    year: 1869,
    shortTitle: 'IDA',
    category: 'FAMILY_LAW'
  },
  'nia.json': {
    name: 'Negotiable Instruments Act',
    year: 1881,
    shortTitle: 'NIA',
    category: 'CORPORATE_LAW'
  },
  'MVA.json': {
    name: 'Motor Vehicles Act',
    year: 1988,
    shortTitle: 'MVA',
    category: 'MOTOR_VEHICLE_LAW'
  }
};

// Validate category against enum
function validateCategory(category: string): string {
  if (VALID_CATEGORIES.includes(category)) {
    return category;
  }
  // Default to GENERAL if category not found
  console.warn(`Warning: Category "${category}" not in enum, using "CIVIL_LAW" as default`);
  return 'CIVIL_LAW';
}

async function importLawData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing law data...');
    await client.query('DELETE FROM law_sections');
    await client.query('DELETE FROM law_acts');
    
    const dataDir = path.join(__dirname, '../data/laws');
    
    // Check if directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.error(`Directory not found: ${dataDir}`);
      console.log('Please create the directory and place the JSON files there.');
      return;
    }
    
    const files = await fs.readdir(dataDir);
    console.log(`Found files: ${files.join(', ')}`);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const actConfig = LAW_ACTS_CONFIG[file];
      if (!actConfig) {
        console.log(`Skipping unknown file: ${file}`);
        continue;
      }
      
      console.log(`\nImporting ${file} (${actConfig.name})...`);
      const filePath = path.join(dataDir, file);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      let sections: LawSection[];
      try {
        sections = JSON.parse(fileContent);
      } catch (parseError) {
        console.error(`Error parsing ${file}:`, parseError);
        continue;
      }
      
      if (!Array.isArray(sections)) {
        console.error(`Invalid format in ${file}: expected array, got ${typeof sections}`);
        continue;
      }
      
      console.log(`Found ${sections.length} sections`);
      
      // Validate category
      const validCategory = validateCategory(actConfig.category);
      
      // Insert act
      const actResult = await client.query(
        `INSERT INTO law_acts (
          act_name, act_year, short_title, category, preamble, tags
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (act_name, act_year) 
        DO UPDATE SET 
          short_title = EXCLUDED.short_title,
          category = EXCLUDED.category,
          tags = EXCLUDED.tags
        RETURNING id`,
        [
          actConfig.name,
          actConfig.year,
          actConfig.shortTitle,
          validCategory,
          `The ${actConfig.name}, ${actConfig.year}`,
          [validCategory]
        ]
      );
      
      const actId = actResult.rows[0].id;
      console.log(`✓ Act inserted with ID: ${actId}`);
      
      // Insert sections
      let insertedCount = 0;
      let skippedCount = 0;
      
      for (const section of sections) {
        // Skip sections without required fields
        if (!section || typeof section !== 'object') {
          skippedCount++;
          continue;
        }
        
        // Handle missing section number
        if (section.section === undefined || section.section === null) {
          console.warn(`  Warning: Section with missing number in ${file}, skipping`);
          skippedCount++;
          continue;
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
              section.section.toString(),
              section.title || '',
              section.description || '',
              null // No explanation in the JSON
            ]
          );
          insertedCount++;
          
          // Log progress every 50 sections
          if (insertedCount % 50 === 0) {
            console.log(`  Progress: ${insertedCount}/${sections.length} sections (${skippedCount} skipped)`);
          }
        } catch (error) {
          console.error(`Error inserting section ${section.section}:`, error);
          skippedCount++;
        }
      }
      
      console.log(`✓ Imported ${insertedCount} sections from ${file} (${skippedCount} skipped)`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ All law data imported successfully!');
    
    // Verify the import
    const verifyActs = await client.query('SELECT COUNT(*) FROM law_acts');
    const verifySections = await client.query('SELECT COUNT(*) FROM law_sections');
    console.log(`\n📊 Database Stats:`);
    console.log(`   - Acts: ${verifyActs.rows[0].count}`);
    console.log(`   - Sections: ${verifySections.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing law data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  importLawData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

export { importLawData };