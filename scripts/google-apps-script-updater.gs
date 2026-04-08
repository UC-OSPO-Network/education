/**
 * Google Apps Script for reviewing and applying enhanced metadata updates.
 *
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this code.
 * 4. Click Save and name the project "Inventory Updater".
 * 5. Refresh your Google Sheet. You will see a new menu: "Inventory Tools".
 */

const TARGET_SHEET_NAME = 'lessons_candidates';
const HEADER_ROW = 1;
const UPDATEABLE_COLUMNS = [
  'Topic',
  'learnerCategory',
  'Depends On',
  'Learning Objectives',
  'subTopic',
  'author',
  'license',
  'educationalLevel',
  'learningResourceType',
  'mentions',
  'timeRequired',
  'version',
  'prerequisiteNotes',
  'contributor',
  'dateCreated',
  'dateModified',
  'datePublished',
  'identifier',
  'slug',
  'about',
  'abstract',
  'accessibilitySummary'
];

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Inventory Tools')
      .addItem('Preview Enhanced Columns', 'showUpdateDialog')
      .addItem('Apply Enhanced Columns', 'showUpdateDialog')
      .addToUi();
}

function showUpdateDialog() {
  const html = HtmlService.createHtmlOutput(
    '<p>Paste the content of your <code>MERGED-enhanced-metadata</code> CSV below.</p>' +
    '<p style="margin-top: 0; color: #5f6368;">Updates target the configured sheet tab and match rows by <strong>slug</strong> first, then <strong>Sorting ID</strong> as a fallback. Empty sheet slugs are OK during the first backfill.</p>' +
    '<textarea id="csvData" style="width: 100%; height: 260px; font-family: monospace;"></textarea>' +
    '<div style="margin-top: 16px; display: flex; gap: 12px;">' +
    '  <button onclick="runPreview()" style="padding: 10px 20px; background: #f1f3f4; color: #202124; border: 1px solid #dadce0; border-radius: 4px; cursor: pointer;">Preview Changes</button>' +
    '  <button onclick="runApply()" style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">Apply Updates</button>' +
    '</div>' +
    '<pre id="result" style="margin-top: 16px; padding: 12px; background: #f8f9fa; border: 1px solid #dadce0; white-space: pre-wrap; min-height: 120px;"></pre>' +
    '<script>' +
    '  function getCsv() { return document.getElementById("csvData").value; }' +
    '  function showResult(text) { document.getElementById("result").textContent = text; }' +
    '  function runPreview() {' +
    '    google.script.run.withSuccessHandler(showResult).withFailureHandler(function(error) { showResult(error.message); }).previewCsv(getCsv());' +
    '  }' +
    '  function runApply() {' +
    '    google.script.run.withSuccessHandler(showResult).withFailureHandler(function(error) { showResult(error.message); }).processCsv(getCsv());' +
    '  }' +
    '</script>'
  ).setWidth(720).setHeight(520);

  SpreadsheetApp.getUi().showModalDialog(html, 'Review Enhanced Inventory Data');
}

function previewCsv(csvString) {
  const plan = buildUpdatePlan(csvString);
  return formatPlanSummary(plan, false);
}

function processCsv(csvString) {
  const plan = buildUpdatePlan(csvString);
  applyPlan(plan);
  return formatPlanSummary(plan, true);
}

function getTargetSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(TARGET_SHEET_NAME);

  if (!sheet) {
    throw new Error('Target sheet "' + TARGET_SHEET_NAME + '" not found. Update TARGET_SHEET_NAME in the script config.');
  }

  return sheet;
}

function normalizeValue(value) {
  return String(value == null ? '' : value).trim();
}

function rowsToObjects(headers, rows) {
  return rows.map(function(row) {
    const objectRow = {};
    headers.forEach(function(header, index) {
      objectRow[header] = row[index];
    });
    return objectRow;
  });
}

function buildLookup(rows, field) {
  const lookup = {};
  const duplicates = [];

  rows.forEach(function(row, index) {
    const key = normalizeValue(row[field]);
    if (!key) return;
    if (lookup[key] !== undefined) {
      duplicates.push(key);
      return;
    }
    lookup[key] = index;
  });

  return { lookup: lookup, duplicates: duplicates };
}

function buildUpdatePlan(csvString) {
  const data = Utilities.parseCsv(csvString);
  if (data.length < 2) {
    throw new Error('Invalid CSV data. Paste the full MERGED-enhanced-metadata CSV including headers.');
  }

  const headers = data[0];
  const csvRows = data.slice(1);
  const csvObjects = rowsToObjects(headers, csvRows);
  const sheet = getTargetSheet();
  const sheetData = sheet.getDataRange().getValues();
  const sheetHeaders = sheetData[HEADER_ROW - 1];
  const sheetRows = sheetData.slice(HEADER_ROW);

  const csvHeaderSet = {};
  headers.forEach(function(header) { csvHeaderSet[header] = true; });
  const sheetHeaderSet = {};
  sheetHeaders.forEach(function(header) { sheetHeaderSet[header] = true; });

  const missingCsvHeaders = [];
  ['name', 'slug'].forEach(function(header) {
    if (!csvHeaderSet[header]) missingCsvHeaders.push(header);
  });
  if (missingCsvHeaders.length > 0) {
    throw new Error('CSV is missing required columns: ' + missingCsvHeaders.join(', '));
  }

  const missingSheetHeaders = [];
  if (!sheetHeaderSet['name']) {
    throw new Error('Target sheet must include a "name" column.');
  }
  if (!sheetHeaderSet['slug'] && !sheetHeaderSet['Sorting ID']) {
    throw new Error('Target sheet must include either a "slug" column or a "Sorting ID" column for matching.');
  }

  const csvSlugLookup = buildLookup(csvObjects, 'slug');
  const csvSortingLookup = buildLookup(csvObjects, 'Sorting ID');
  const sheetObjects = rowsToObjects(sheetHeaders, sheetRows);
  const sheetSlugLookup = buildLookup(sheetObjects, 'slug');
  const sheetSortingLookup = buildLookup(sheetObjects, 'Sorting ID');

  const changes = [];
  const unmatchedRows = [];
  const rowsMissingIdentifiers = [];
  const matchedRowIndexes = {};
  const missingUpdateColumns = UPDATEABLE_COLUMNS.filter(function(column) {
    return !csvHeaderSet[column] || !sheetHeaderSet[column];
  });

  csvObjects.forEach(function(csvRow) {
    const slug = normalizeValue(csvRow.slug);
    const sortingId = normalizeValue(csvRow['Sorting ID']);

    if (!slug && !sortingId) {
      rowsMissingIdentifiers.push(csvRow.name || '(unnamed row)');
      return;
    }

    let sheetRowIndex = slug ? sheetSlugLookup.lookup[slug] : undefined;
    let matchedBy = 'slug';

    if (sheetRowIndex === undefined && sortingId) {
      sheetRowIndex = sheetSortingLookup.lookup[sortingId];
      matchedBy = 'Sorting ID';
    }

    if (sheetRowIndex === undefined) {
      unmatchedRows.push(csvRow.name || slug || sortingId);
      return;
    }

    matchedRowIndexes[sheetRowIndex] = true;
    const currentSheetRow = sheetRows[sheetRowIndex];

    UPDATEABLE_COLUMNS.forEach(function(column) {
      const csvValue = normalizeValue(csvRow[column]);
      if (!csvHeaderSet[column] || !sheetHeaderSet[column] || !csvValue) return;

      const sheetColumnIndex = sheetHeaders.indexOf(column);
      const currentValue = normalizeValue(currentSheetRow[sheetColumnIndex]);
      if (csvValue === currentValue) return;

      changes.push({
        rowIndex: sheetRowIndex,
        column: column,
        columnIndex: sheetColumnIndex,
        oldValue: currentValue,
        newValue: csvValue,
        matchedBy: matchedBy,
        name: normalizeValue(csvRow.name)
      });
    });
  });

  return {
    sheet: sheet,
    sheetHeaders: sheetHeaders,
    sheetRows: sheetRows,
    sheetRowOffset: HEADER_ROW + 1,
    csvRowCount: csvObjects.length,
    matchedRows: Object.keys(matchedRowIndexes).length,
    unmatchedRows: unmatchedRows,
    rowsMissingIdentifiers: rowsMissingIdentifiers,
    changes: changes,
    missingUpdateColumns: missingUpdateColumns,
    csvDuplicateSlugs: csvSlugLookup.duplicates,
    sheetDuplicateSlugs: sheetSlugLookup.duplicates,
    csvDuplicateSortingIds: csvSortingLookup.duplicates,
    sheetDuplicateSortingIds: sheetSortingLookup.duplicates
  };
}

function applyPlan(plan) {
  if (plan.changes.length === 0) return;

  const changesByColumn = {};

  plan.changes.forEach(function(change) {
    if (!changesByColumn[change.columnIndex]) {
      changesByColumn[change.columnIndex] = [];
    }
    changesByColumn[change.columnIndex].push(change);
  });

  Object.keys(changesByColumn).forEach(function(columnIndexKey) {
    const columnIndex = Number(columnIndexKey);
    const columnValues = plan.sheetRows.map(function(row) {
      return [row[columnIndex]];
    });

    changesByColumn[columnIndex].forEach(function(change) {
      columnValues[change.rowIndex][0] = change.newValue;
    });

    plan.sheet
      .getRange(HEADER_ROW + 1, columnIndex + 1, columnValues.length, 1)
      .setValues(columnValues);
  });
}

function formatPlanSummary(plan, applied) {
  const lines = [];
  lines.push('Target sheet: ' + TARGET_SHEET_NAME);
  lines.push('CSV rows: ' + plan.csvRowCount);
  lines.push('Matched rows: ' + plan.matchedRows);
  lines.push('Unmatched rows: ' + plan.unmatchedRows.length);
  lines.push('Rows missing slug/Sorting ID: ' + plan.rowsMissingIdentifiers.length);
  lines.push('Cells to update: ' + plan.changes.length);

  if (plan.missingUpdateColumns.length > 0) {
    lines.push('');
    lines.push('Missing update columns on one side:');
    plan.missingUpdateColumns.forEach(function(column) {
      lines.push('- ' + column);
    });
  }

  const duplicateGroups = [
    ['Duplicate CSV slugs', plan.csvDuplicateSlugs],
    ['Duplicate sheet slugs', plan.sheetDuplicateSlugs],
    ['Duplicate CSV Sorting IDs', plan.csvDuplicateSortingIds],
    ['Duplicate sheet Sorting IDs', plan.sheetDuplicateSortingIds]
  ];
  duplicateGroups.forEach(function(group) {
    if (group[1].length > 0) {
      lines.push('');
      lines.push(group[0] + ': ' + group[1].join(', '));
    }
  });

  if (plan.unmatchedRows.length > 0) {
    lines.push('');
    lines.push('Unmatched rows:');
    plan.unmatchedRows.slice(0, 10).forEach(function(name) {
      lines.push('- ' + name);
    });
    if (plan.unmatchedRows.length > 10) {
      lines.push('- ...and ' + (plan.unmatchedRows.length - 10) + ' more');
    }
  }

  if (plan.rowsMissingIdentifiers.length > 0) {
    lines.push('');
    lines.push('Rows missing slug/Sorting ID:');
    plan.rowsMissingIdentifiers.slice(0, 10).forEach(function(name) {
      lines.push('- ' + name);
    });
    if (plan.rowsMissingIdentifiers.length > 10) {
      lines.push('- ...and ' + (plan.rowsMissingIdentifiers.length - 10) + ' more');
    }
  }

  if (plan.changes.length > 0) {
    lines.push('');
    lines.push(applied ? 'Applied update preview:' : 'Preview of first updates:');
    plan.changes.slice(0, 12).forEach(function(change) {
      lines.push('- [' + change.matchedBy + '] ' + change.name + ' → ' + change.column);
    });
    if (plan.changes.length > 12) {
      lines.push('- ...and ' + (plan.changes.length - 12) + ' more');
    }
  }

  if (applied) {
    lines.push('');
    lines.push('Updates applied successfully. Empty CSV cells were ignored and non-target tabs were not modified.');
  } else {
    lines.push('');
    lines.push('Review the preview summary, then click Apply Updates if the counts look correct.');
  }

  return lines.join('\n');
}
