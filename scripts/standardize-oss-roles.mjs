import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

// The single source of truth for allowed roles
const CANONICAL_ROLES = new Set([
  'Contributor',
  'Maintainer',
  'Community Manager'
]);

// Mapping of known non-canonical values to canonical ones
const ROLE_MAPPING = {
  'Governance': 'Maintainer',
  'User/Consumer': null // null means drop the value
};

async function standardizeOSSRoles() {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log(`No JSON files found in ${CONTENT_DIR}`);
      return;
    }

    let updatedFilesCount = 0;
    const flaggedFiles = {
      ip: [],
      userConsumer: []
    };

    console.log('==================================================');
    console.log('STANDARDIZING OSS ROLES');
    console.log('==================================================\n');

    for (const file of jsonFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      let data;
      try {
        data = JSON.parse(content);
      } catch (parseErr) {
        console.warn(`⚠️ Warning: Could not parse JSON in ${file}`);
        continue;
      }

      const originalRole = data.ossRole;
      
      // Skip files without an ossRole
      if (!originalRole || typeof originalRole !== 'string' || originalRole.trim() === '') {
        continue;
      }

      // Check for flags BEFORE modifying
      if (originalRole.includes('IP')) {
        flaggedFiles.ip.push(file);
        // We skip modifying this file automatically so you can manually inspect it
        continue; 
      }

      if (originalRole.includes('User/Consumer')) {
        flaggedFiles.userConsumer.push(file);
      }

      // Split by comma, trim, map, and filter
      const parts = originalRole.split(',').map(r => r.trim()).filter(Boolean);
      
      const newRolesSet = new Set();
      
      for (const part of parts) {
        if (CANONICAL_ROLES.has(part)) {
          newRolesSet.add(part);
        } else if (part in ROLE_MAPPING) {
          const mappedValue = ROLE_MAPPING[part];
          if (mappedValue !== null) {
            newRolesSet.add(mappedValue);
          }
        } else {
          console.warn(`⚠️ Warning: Unrecognized role "${part}" found in ${file}. Leaving as is.`);
          newRolesSet.add(part);
        }
      }

      // Join back to a string
      const newRoleString = Array.from(newRolesSet).join(', ');

      // If changes were made, write to the file
      if (originalRole !== newRoleString) {
        data.ossRole = newRoleString;
        
        // Write the updated JSON back to the file with 2-space indentation
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        console.log(`✅ Updated: ${file} ("${originalRole}" -> "${newRoleString}")`);
        updatedFilesCount++;
      }
    }

    console.log('\n==================================================');
    console.log('SUMMARY');
    console.log(`Files successfully updated: ${updatedFilesCount}`);
    
    console.log('\n🚨 REQUIRES MANUAL REVIEW 🚨');
    if (flaggedFiles.ip.length > 0) {
      console.log(`\nFound "IP" in the following files (skipped auto-update):`);
      flaggedFiles.ip.forEach(f => console.log(`  - ${f}`));
    } else {
      console.log(`\nNo "IP" files found.`);
    }

    if (flaggedFiles.userConsumer.length > 0) {
      console.log(`\nFound and dropped "User/Consumer" from the following files:`);
      flaggedFiles.userConsumer.forEach(f => console.log(`  - ${f}`));
    }
    
    console.log('==================================================');

  } catch (err) {
    console.error('❌ Error processing the content directory:', err.message);
  }
}

standardizeOSSRoles();