import { fetchSheetRows } from './sheet-data.js';

export async function getLessons() {
  console.log('Fetching lessons from Google Sheets...');
  const { rows, source, backupPath, fetchError } = await fetchSheetRows({
    allowBackupFallback: true
  });

  if (source === 'backup') {
    console.warn('⚠️  Falling back to the latest Google Sheets backup.');
    if (fetchError) {
      console.warn(`    Sheet fetch error: ${fetchError}`);
    }
    console.warn(`    Backup file: ${backupPath}`);
  }

  const lessons = rows;
  console.log(`Loaded ${lessons.length} lessons`);
  return lessons;
}

export function shouldProcess(lesson, field) {
  // Check if field is empty or needs updating
  const value = lesson[field];

  if (!value || value.trim() === '') {
    return true;
  }

  // Already has value
  return false;
}

export function createUpdateReport(original, enhanced, fields) {
  const updates = [];

  for (const field of fields) {
    const oldValue = original[field] || '';
    const newValue = enhanced[field] || '';

    if (oldValue !== newValue) {
      updates.push({
        field,
        old: oldValue,
        new: newValue
      });
    }
  }

  return updates;
}

export async function generateCSVUpdate(lessons, filename) {
  // Generate CSV for manual upload to Google Sheets.
  // Use the union of all row keys so newly added fields are not dropped just
  // because they are missing from the first row object.
  const headers = [];
  const seenHeaders = new Set();

  for (const lesson of lessons) {
    for (const key of Object.keys(lesson)) {
      if (seenHeaders.has(key)) continue;
      seenHeaders.add(key);
      headers.push(key);
    }
  }

  const rows = lessons.map(lesson =>
    headers.map(h => {
      const value = String(lesson[h] || '');
      // Escape quotes and wrap in quotes if contains comma/newline
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');

  // Write to file
  const fs = await import('fs');
  const path = await import('path');
  const dirname = path.dirname(filename);

  // Ensure directory exists
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(filename, csv, 'utf8');
  console.log(`✅ CSV exported to: ${filename}`);
}
