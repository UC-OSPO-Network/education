import Papa from 'papaparse';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

const FETCH_TIMEOUT = 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');
const BACKUP_DIR = path.resolve(OUTPUT_DIR, 'backups');

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

function isNonEmptyRow(row) {
  return Object.values(row).some((value) => normalizeString(value) !== '');
}

async function fetchSheetData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(CSV_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV (status ${response.status})`);
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parsing failed with ${parsed.errors.length} error(s)`);
    }

    return parsed.data.filter(isNonEmptyRow);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out while loading lessons from Google Sheets');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function loadLatestSheetBackup() {
  const files = await readdir(BACKUP_DIR);
  const backups = files
    .filter((file) => /^google-sheets-lessons-.*\.json$/.test(file))
    .sort();

  if (backups.length === 0) {
    throw new Error(`No Google Sheets backups found in ${BACKUP_DIR}`);
  }

  const latestBackup = backups[backups.length - 1];
  const backupPath = path.join(BACKUP_DIR, latestBackup);
  const rows = JSON.parse(await readFile(backupPath, 'utf8'));

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`Latest Google Sheets backup is empty or invalid: ${backupPath}`);
  }

  return { rows, backupPath };
}

export async function fetchSheetRows(options = {}) {
  const { useBackupOnly = false, allowBackupFallback = true } = options;

  if (useBackupOnly) {
    const { rows, backupPath } = await loadLatestSheetBackup();
    return { rows, source: 'backup', backupPath };
  }

  try {
    const rows = await fetchSheetData();
    return { rows, source: 'google-sheet' };
  } catch (error) {
    if (!allowBackupFallback) {
      throw error;
    }

    const { rows, backupPath } = await loadLatestSheetBackup();
    return {
      rows,
      source: 'backup',
      backupPath,
      fetchError: error instanceof Error ? error.message : String(error),
    };
  }
}
