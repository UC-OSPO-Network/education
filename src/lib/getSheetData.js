// src/lib/getSheetData.js
import Papa from 'papaparse';

const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

const FETCH_TIMEOUT = 8000; // 8 seconds

export async function getSheetData() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(CSV_URL, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV (status ${response.status})`);
    }

    const csvText = await response.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors?.length) {
      throw new Error('CSV parsing failed');
    }

    if (!parsed.data || parsed.data.length === 0) {
      return []; // valid but empty data
    }

    const cleanedData = parsed.data.filter((row) =>
        Object.values(row).some(
            (value) => value && value.toString().trim() !== ''
        )
    );

    return cleanedData;
  } catch (error) {
    console.error('Error loading lessons CSV:', error);

    if (error.name === 'AbortError') {
      throw new Error('Request timed out while loading lessons');
    }

    throw error; // IMPORTANT: propagate error
  } finally {
    clearTimeout(timeoutId);
  }
}
