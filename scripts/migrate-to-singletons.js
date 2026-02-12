import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSheetData } from '../src/lib/getSheetData.ts'; // Ensure this path is correct for your project

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');

// --- Helpers ---
function slugify(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-chars
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with dash
    .replace(/-+/g, '-');         // Remove duplicate dashes
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function normalizeList(value) {
  const str = normalizeString(value);
  if (!str) return [];
  return str.split(',').map((item) => item.trim()).filter(Boolean);
}

function toKeepStatus(keepValue) {
  const v = normalizeString(keepValue).toLowerCase();
  if (v.includes('keep candidate')) return 'keepCandidate';
  if (v.includes('keep')) return 'keep';
  return 'drop';
}

async function migrate() {
  console.log('Fetching data from Google Sheets...');
  const rawLessons = await getSheetData();
  
  if (!rawLessons.length) throw new Error('No data found!');

  await mkdir(OUT_DIR, { recursive: true });

  const idToSlugMap = new Map();
  const validLessons = [];
  const usedSlugs = new Set();

  console.log('Generating slugs and resolving dependencies...');

  for (const row of rawLessons) {
    // 1. Filter
    const keepStatus = toKeepStatus(row['Keep?']);
    if (keepStatus === 'drop') continue;

    const name = normalizeString(row.name);
    if (!name) continue;

    let baseSlug = slugify(row.slug || name);
    if (!baseSlug) baseSlug = 'lesson';
    
    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    // sorting ID --> slugs
    const sortId = normalizeString(row['Sorting ID']);
    if (sortId) {
      idToSlugMap.set(sortId, slug);
    }

    validLessons.push({ row, slug, keepStatus });
  }

  console.log(`Writing ${validLessons.length} JSON files...`);

  for (const { row, slug, keepStatus } of validLessons) {
    
    // "Depends On"
    const rawDepends = normalizeString(row['Depends On']);
    const resolvedDeps = [];
    
    if (rawDepends) {
      const parts = rawDepends.split(/\||,/).map(s => s.trim());
      
      parts.forEach(part => {
        const idMatch = part.match(/^(\d+)/);
        if (idMatch) {
          const targetId = idMatch[1];
          const targetSlug = idToSlugMap.get(targetId);
          if (targetSlug) {
            resolvedDeps.push(targetSlug);
          } else {
            console.warn(`   ⚠️ Warning [${slug}]: Dependency ID "${targetId}" not found (likely dropped).`);
          }
        } else if (part.startsWith('http')) {
           resolvedDeps.push(part);
        }
      });
    }

    const data = {
      name: normalizeString(row.name),
      slug: slug,
      keepStatus: keepStatus,
      description: normalizeString(row.description),
      url: normalizeString(row.url),
      
      // categories
      topic: normalizeString(row.Topic || ''),
      subTopic: normalizeString(row.subTopic),
      learnerCategory: normalizeString(row.learnerCategory),
      educationalLevel: normalizeString(row.educationalLevel) || 'Unknown',
      learningResourceType: normalizeString(row.learningResourceType),
      
      // people
      author: normalizeString(row.author),
      ossRole: normalizeString(row.ossRole || row.oss_role), // Handle variation
      
      // arrays
      inLanguage: normalizeList(row.inLanguage),
      keywords: normalizeList(row.keywords),
      
      // dependencies (joined as strings)
      dependsOn: resolvedDeps.join(', '),
      sortingId: normalizeString(row['Sorting ID']),

      // metadata
      dateCreated: normalizeString(row.dateCreated),
      dateModified: normalizeString(row.dateModified),
      license: normalizeString(row.license),
    };

    const filePath = path.join(OUT_DIR, `${slug}.json`);
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }

  console.log(`✅ Success! Created ${validLessons.length} files in src/content/lessons/`);
}

migrate().catch(console.error);