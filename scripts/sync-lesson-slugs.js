import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LESSON_DIR = path.resolve(__dirname, '..', 'src', 'content', 'lessons');

function slugFromFilename(fileName) {
  return fileName.replace(/\.json$/i, '').trim();
}

async function run() {
  const files = (await readdir(LESSON_DIR))
    .filter((file) => file.endsWith('.json'))
    .sort();

  let updated = 0;

  for (const file of files) {
    const filePath = path.join(LESSON_DIR, file);
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw);
    const expectedSlug = slugFromFilename(file);
    const currentSlug = typeof data.slug === 'string' ? data.slug.trim() : '';

    if (currentSlug === expectedSlug) {
      continue;
    }

    data.slug = expectedSlug;
    await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    updated += 1;
  }

  console.log(`✅ Synced lesson slugs. Updated ${updated} file(s).`);
}

run().catch((error) => {
  console.error('❌ Failed to sync lesson slugs');
  console.error(error);
  process.exit(1);
});
