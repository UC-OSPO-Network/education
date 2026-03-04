import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input: where your JSON files live
const CONTENT_DIR = path.join(__dirname, '../src/content/lessons');
// Output: where the report will be saved (scripts/output/)
const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'metadata-report.md');

async function generateReport() {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.error(`No JSON files found in ${CONTENT_DIR}`);
      return;
    }

    const reportData = [];
    let keepCandidateCount = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      try {
        const data = JSON.parse(content);
        
        const missingFields = [];
        let score = 0;
        const totalScoreFields = 8;
        
        // 1. Description
        if (!data.description || data.description.trim().length < 50) {
          missingFields.push('description (missing or < 50 chars)');
        } else { score++; }

        // 2-7. Simple empty checks
        const simpleFields = [
          'learnerCategory', 'subTopic', 'learningObjectives', 
          'timeRequired', 'ossRole', 'audience' // Note: audience is not in config.ts schema but requested in prompt
        ];
        
        for (const field of simpleFields) {
          if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            missingFields.push(field);
          } else { score++; }
        }

        // 8. Educational Level
        if (!data.educationalLevel || data.educationalLevel === 'Unknown' || data.educationalLevel.trim() === '') {
          missingFields.push("educationalLevel (missing or 'Unknown')");
        } else { score++; }

        // Keep Status Check
        const isKeepCandidate = data.keepStatus === 'keepCandidate';
        if (isKeepCandidate) {
          keepCandidateCount++;
        }

        reportData.push({
          file,
          name: data.name || file,
          percentage: Math.round((score / totalScoreFields) * 100),
          missingFields,
          isKeepCandidate
        });

      } catch (parseErr) {
        console.warn(`⚠️ Warning: Could not parse JSON in ${file}`);
      }
    }

    // Sort: Lowest completeness first.
    reportData.sort((a, b) => {
      if (a.percentage !== b.percentage) {
        return a.percentage - b.percentage;
      }
      return a.file.localeCompare(b.file);
    });

    // --- Generate Markdown Output ---
    let md = `# Lesson Metadata Completeness Report\n\n`;
    md += `*Generated on: ${new Date().toLocaleDateString()}*\n\n`;
    
    md += `## 📊 Summary\n`;
    md += `- **Total Lessons Scanned:** ${jsonFiles.length}\n`;
    md += `- **Lessons Needing Committee Keep/Drop Decision:** ${keepCandidateCount}\n\n`;

    md += `## ⚠️ Action Required: \`keepCandidate\` Status\n`;
    md += `The following lessons still have \`keepStatus: "keepCandidate"\` and need a final keep/drop decision from the committee.\n\n`;
    
    const keepCandidates = reportData.filter(d => d.isKeepCandidate);
    if (keepCandidates.length > 0) {
      keepCandidates.forEach(d => {
        md += `- **${d.file}** (${d.name})\n`;
      });
    } else {
      md += `*All lessons have a finalized keepStatus! 🎉*\n`;
    }
    md += `\n---\n\n`;

    md += `## 📋 Completeness Rankings (Lowest to Highest)\n`;
    md += `Prioritize the lessons at the top of this list for metadata entry.\n\n`;

    reportData.forEach(d => {
      let health = '🔴';
      if (d.percentage >= 80) health = '🟢';
      else if (d.percentage >= 50) health = '🟡';

      md += `### ${health} ${d.file} (${d.percentage}% Complete)\n`;
      md += `**Name:** ${d.name}\n\n`;
      
      if (d.missingFields.length > 0) {
        md += `**Missing or Incomplete Fields:**\n`;
        d.missingFields.forEach(f => {
          md += `- ${f}\n`;
        });
      } else {
        md += `*All key metadata fields are complete!* ✨\n`;
      }
      md += `\n`;
    });

    // --- Save to File ---
    // 1. Create the output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    // 2. Write the file
    await fs.writeFile(OUTPUT_FILE, md, 'utf-8');
    
    console.log(`✅ Success! Report saved to: ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('❌ Error reading the content directory or writing the file:', err.message);
  }
}

generateReport();