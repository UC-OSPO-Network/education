// src/lib/getSheetData.js
import fetch from 'node-fetch';
import Papa from 'papaparse';

// Public CSV link
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

export async function getSheetData() {
  try {
    const res = await fetch(CSV_URL);
    const csvText = await res.text();
    const parsed = Papa.parse(csvText, { header: true });
    return parsed.data;
  } catch (err) {
    console.error('Error fetching CSV sheet:', err);
    return [];
  }
}