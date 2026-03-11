import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');

const CANONICAL_ROLES = new Set([
  'Contributor',
  'Maintainer',
  'Community Manager'
]);

const ROLE_MAPPING = {
  'Governance': 'Maintainer',
  'User/Consumer': null 
};

async function standardizeOSSRoles() {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    let updatedFilesCount = 0;
    
    // 1. EXPANDED TRACKING
    const flaggedFiles = {
      ip: [],
      userConsumer: [],
      missingRole: [], // Tracks files with no role
      invalidRole: []  // Tracks files with an unrecognized role
    };

    console.log('==================================================');
    console.log('STANDARDIZING & VALIDATING OSS ROLES');
    console.log('==================================================\n');

    for (const file of jsonFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      let data = JSON.parse(content);
      const originalRole = data.ossRole;
      
      // 2. CATCH MISSING ROLES
      if (!originalRole || typeof originalRole !== 'string' || originalRole.trim() === '') {
        flaggedFiles.missingRole.push(file);
        continue;
      }

      if (originalRole.includes('IP')) {
        flaggedFiles.ip.push(file);
        continue; 
      }

      if (originalRole.includes('User/Consumer')) {
        flaggedFiles.userConsumer.push(file);
      }

      const parts = originalRole.split(',').map(r => r.trim()).filter(Boolean);
      const newRolesSet = new Set();
      
      for (const part of parts) {
        if (CANONICAL_ROLES.has(part)) {
          newRolesSet.add(part);
        } else if (part in ROLE_MAPPING) {
          const mappedValue = ROLE_MAPPING[part];
          if (mappedValue !== null) newRolesSet.add(mappedValue);
        } else {
          // 3. CATCH INVALID ROLES
          flaggedFiles.invalidRole.push({ file, role: part });
          newRolesSet.add(part);
        }
      }

      const newRoleString = Array.from(newRolesSet).join(', ');

      if (originalRole !== newRoleString) {
        data.ossRole = newRoleString;
        await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        updatedFilesCount++;
      }
    }

    // 4. PRINT COMPREHENSIVE REPORT
    console.log('\n==================================================');
    console.log('SUMMARY');
    console.log(`Files successfully updated: ${updatedFilesCount}`);
    
    console.log('\n🚨 REQUIRES MANUAL REVIEW 🚨');
    
    if (flaggedFiles.missingRole.length > 0) {
      console.log(`\n❌ MISSING ROLES (${flaggedFiles.missingRole.length} files):`);
      flaggedFiles.missingRole.forEach(f => console.log(`  - ${f}`));
    }

    if (flaggedFiles.invalidRole.length > 0) {
      console.log(`\n❌ INVALID ROLES (Not canonical or mapped):`);
      flaggedFiles.invalidRole.forEach(item => console.log(`  - ${item.file}: "${item.role}"`));
    }

    if (flaggedFiles.ip.length > 0) {
      console.log(`\n⚠️ "IP" FOUND (Skipped auto-update):`);
      flaggedFiles.ip.forEach(f => console.log(`  - ${f}`));
    }

    // 5. EXIT WITH ERROR CODE IF BAD DATA EXISTS (Crucial for scaling/CI)
    const hasErrors = flaggedFiles.missingRole.length > 0 || flaggedFiles.invalidRole.length > 0 || flaggedFiles.ip.length > 0;
    
    if (hasErrors) {
      console.log('\n==================================================');
      console.error('Script finished with validation errors. Please fix the flagged files above.');
      process.exit(1); // Tells the terminal/CI pipeline that this script failed
    } else {
      console.log('\nAll roles are valid and standardized! 🎉');
      process.exit(0);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

standardizeOSSRoles();

standardizeOSSRoles();