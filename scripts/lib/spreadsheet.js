// Google Sheets integration using the existing getSheetData function
import { getSheetData } from '../../src/lib/getSheetData.ts';

export async function getLessons() {
  console.log('Fetching lessons from Google Sheets...');
  const lessons = await getSheetData();
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
  // Generate CSV for manual upload to Google Sheets
  const headers = Object.keys(lessons[0]);
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
