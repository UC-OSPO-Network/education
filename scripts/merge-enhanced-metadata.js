// Merge all enhanced metadata into a single CSV for Google Sheets upload
// Combines: slugs, languages, subtopics, time estimates, dependencies

import Papa from 'papaparse';
import fs from 'fs';

const OUTPUT_DIR = './scripts/output';
const FILES = {
  base: `${OUTPUT_DIR}/slugs-2026-01-18.csv`, // Use slugs as base (has all fields + slug)
  languages: `${OUTPUT_DIR}/languages-2026-01-18.csv`,
  subtopics: `${OUTPUT_DIR}/subtopic-assignments-2026-01-19.csv`,
  dependencies: `${OUTPUT_DIR}/dependencies-migrated-2026-01-20.csv`,
  timeEstimates: `${OUTPUT_DIR}/time-estimates-2026-01-18.csv`
};

function readCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = Papa.parse(content, { header: true, skipEmptyLines: true });
  return parsed.data;
}

function mergeEnhancements() {
  console.log('🔄 Merging enhanced metadata...\n');

  // Read all files
  const baseLessons = readCSV(FILES.base);
  const languageLessons = readCSV(FILES.languages);
  const subtopics = readCSV(FILES.subtopics);
  const dependencies = readCSV(FILES.dependencies);
  const timeEstimates = readCSV(FILES.timeEstimates);

  console.log(`📊 Base lessons: ${baseLessons.length}`);
  console.log(`📊 Language data: ${languageLessons.length}`);
  console.log(`📊 Subtopic assignments: ${subtopics.length}`);
  console.log(`📊 Dependencies: ${dependencies.length}`);
  console.log(`📊 Time estimates: ${timeEstimates.length}\n`);

  // Create lookup maps by lesson name
  const languageMap = new Map(languageLessons.map(l => [l.name, l.inLanguage]));
  const subtopicMap = new Map(subtopics.map(s => [s.name, s.subTopic]));
  const dependencyMap = new Map(dependencies.map(d => [d.name, d.dependsOn]));
  const timeMap = new Map(timeEstimates.map(t => [t.name, t.timeRequired]));

  // Merge all enhancements into base lessons
  const merged = baseLessons.map(lesson => {
    const enhanced = { ...lesson };

    // Update language codes (standardized format)
    if (languageMap.has(lesson.name)) {
      enhanced.inLanguage = languageMap.get(lesson.name);
    }

    // Update subtopic (curated assignments)
    if (subtopicMap.has(lesson.name)) {
      enhanced.subTopic = subtopicMap.get(lesson.name);
    }

    // Update dependencies (slug-based references)
    if (dependencyMap.has(lesson.name)) {
      enhanced.dependsOn = dependencyMap.get(lesson.name);
    }

    // Update time estimates
    if (timeMap.has(lesson.name)) {
      enhanced.timeRequired = timeMap.get(lesson.name);
    }

    return enhanced;
  });

  // Report what was merged
  const stats = {
    withSlug: merged.filter(l => l.slug).length,
    withLanguage: merged.filter(l => l.inLanguage && l.inLanguage.includes(',')).length,
    withSubtopic: merged.filter(l => l.subTopic && !l.subTopic.includes('TODO')).length,
    withDependencies: merged.filter(l => l.dependsOn && l.dependsOn !== '').length,
    withTimeEstimate: merged.filter(l => l.timeRequired && l.timeRequired !== '').length
  };

  console.log('✅ Merge complete!\n');
  console.log('📈 Enhancement Statistics:');
  console.log(`   Lessons with slugs: ${stats.withSlug}/${merged.length}`);
  console.log(`   Lessons with standardized languages: ${stats.withLanguage}/${merged.length}`);
  console.log(`   Lessons with curated subtopics: ${stats.withSubtopic}/${merged.length}`);
  console.log(`   Lessons with dependencies: ${stats.withDependencies}/${merged.length}`);
  console.log(`   Lessons with time estimates: ${stats.withTimeEstimate}/${merged.length}\n`);

  return merged;
}

function writeCSV(data, outputPath) {
  const csv = Papa.unparse(data, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\n'
  });

  fs.writeFileSync(outputPath, csv);
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`   File size: ${(csv.length / 1024).toFixed(1)} KB`);
}

function main() {
  console.log('🚀 Enhanced Metadata Merger\n');
  console.log('This script combines all enhanced metadata:');
  console.log('  - Slugs (generated from lesson names)');
  console.log('  - Language codes (standardized to ISO 639-1)');
  console.log('  - Subtopics (curated assignments)');
  console.log('  - Dependencies (slug-based references)');
  console.log('  - Time estimates (AI-generated)\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Merge all enhancements
    const merged = mergeEnhancements();

    // Write output
    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = `${OUTPUT_DIR}/MERGED-enhanced-metadata-${timestamp}.csv`;
    writeCSV(merged, outputPath);

    console.log('\n✅ SUCCESS!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Review the merged CSV file');
    console.log('   2. Upload to Google Sheets to replace existing data');
    console.log('   3. Verify the site still works with enhanced data');
    console.log('   4. Consider migrating to Keystatic for better data management\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
