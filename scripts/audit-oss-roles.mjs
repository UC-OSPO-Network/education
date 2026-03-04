import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust this path if your JSON files are stored elsewhere.
// Assuming script is in `scripts/` and JSON files are in `src/content/lessons/`
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

async function auditOSSRoles() {
  try {
    // Read all files in the directory
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log(`No JSON files found in ${CONTENT_DIR}`);
      return;
    }

    const rawRoles = new Set();
    const splitRoles = new Set();
    let filesWithNoRole = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      try {
        const data = JSON.parse(content);
        const role = data.ossRole;
        
        if (role && typeof role === 'string' && role.trim() !== '') {
          // 1. Exact raw string for mapping
          rawRoles.add(role.trim());
          
          // 2. Individual terms (comma-separated)
          const parts = role.split(',').map(r => r.trim()).filter(Boolean);
          parts.forEach(p => splitRoles.add(p));
        } else {
          filesWithNoRole++;
        }
      } catch (parseErr) {
        console.warn(`⚠️ Warning: Could not parse JSON in ${file}`);
      }
    }

    // Output the results
    console.log('==================================================');
    console.log('OSS ROLE AUDIT');
    console.log('==================================================');
    
    console.log('\n--- 1. Unique ossRole (raw string) ---');
    console.dir(Array.from(rawRoles).sort(), { maxArrayLength: null });
    
    console.log('\n--- 2. Individual ossRole (split by comma) ---');
    console.dir(Array.from(splitRoles).sort(), { maxArrayLength: null });
    
    console.log('\n==================================================');
    console.log('SUMMARY');
    console.log(`Total JSON files scanned: ${jsonFiles.length}`);
    console.log(`Files with missing/empty ossRole: ${filesWithNoRole}`);
    console.log(`Unique ossRole (raw string) found: ${rawRoles.size}`);
    console.log(`Unique individual ossRole found: ${splitRoles.size}`);
    console.log('==================================================');

  } catch (err) {
    console.error('❌ Error reading the content directory:', err.message);
    console.error(`Attempted path: ${CONTENT_DIR}`);
    console.error('Please ensure the CONTENT_DIR path accurately points to your JSON files.');
  }
}

auditOSSRoles();