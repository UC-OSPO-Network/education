// src/lib/getSheetData.ts
import Papa from 'papaparse';

// Public Google Sheet CSV link
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

export async function getSheetData() {
  try {
    // Fetch CSV from Google Sheets
    const response = await fetch(CSV_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse CSV into JSON
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // Filter out completely empty rows
    const cleanedData = parsed.data.filter(
      (row) => Object.values(row).some((value) => value && value.trim() !== '')
    );

    return cleanedData;
  } catch (error) {
    console.error('Error fetching or parsing Google Sheet:', error);
    return [];
  }
}