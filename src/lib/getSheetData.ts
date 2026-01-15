import Papa from 'papaparse';


export interface SheetRow {
  [key: string]: string;
}

const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vR44d8F86WqIlDHOD2MNjj8b2RYB0_hlFwj8fK8UiXV0n1PjwpS6c-qzU-DhDQZMTk8jcI2n0fp9a_a/pub?output=csv&gid=565807714';

const FETCH_TIMEOUT = 8000;


export async function getSheetData(): Promise<SheetRow[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(CSV_URL, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV (status ${response.status})`);
    }

    const csvText: string = await response.text();

    const parsed = Papa.parse<SheetRow>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      throw new Error('CSV parsing failed');
    }

    if (!parsed.data || parsed.data.length === 0) {
      return [];
    }

    const cleanedData: SheetRow[] = parsed.data.filter((row:SheetRow) =>
        Object.values(row).some(
            (value) => value && value.toString().trim() !== ''
        )
    );

    return cleanedData;
  } catch (error) {
    console.error('Error loading lessons CSV:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out while loading lessons');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
