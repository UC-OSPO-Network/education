/**
 * Google Apps Script: Safe Column Updater
 *
 * HOW TO USE:
 * 1. Open your canonical Google Sheet
 * 2. Extensions → Apps Script
 * 3. Delete any default code
 * 4. Paste this entire script
 * 5. Save (Ctrl+S or Cmd+S)
 * 6. Import your merged CSV to a new tab named "TEMP_ENHANCED"
 * 7. Run the updateEnhancedColumns() function
 * 8. Check the updates, then delete TEMP_ENHANCED tab
 *
 * This script:
 * - Matches rows by lesson name (column A)
 * - Updates ONLY the specified enhanced columns
 * - Preserves ALL formatting, colors, formulas in other columns
 * - Shows a summary of updates
 */

// Define which columns to update (adjust these to match your sheet)
const COLUMN_MAPPING = {
  'author': 'Q',          // Column letter in main sheet
  'license': 'X',
  'dateCreated': 'U',
  'dateModified': 'V',
  'datePublished': 'W',
  'inLanguage': 'AB',
  'timeRequired': 'AG',
  'identifier': 'Z',
  'contributor': 'R',
  'abstract': 'J',
  'about': 'I',
  'accessibilitySummary': 'L',
  'mentions': 'AE',
  'recordedAt': 'AF',
  'version': 'AH'
};

const MAIN_SHEET_NAME = 'Inventory - Lessons';  // Change if different
const TEMP_SHEET_NAME = 'TEMP_ENHANCED';

function updateEnhancedColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const mainSheet = ss.getSheetByName(MAIN_SHEET_NAME);
  const tempSheet = ss.getSheetByName(TEMP_SHEET_NAME);

  // Validation
  if (!mainSheet) {
    Browser.msgBox('Error', `Sheet "${MAIN_SHEET_NAME}" not found!`, Browser.Buttons.OK);
    return;
  }

  if (!tempSheet) {
    Browser.msgBox('Error', `Sheet "${TEMP_SHEET_NAME}" not found! Please import the enhanced CSV first.`, Browser.Buttons.OK);
    return;
  }

  // Confirm before proceeding
  const response = Browser.msgBox(
    'Confirm Update',
    `This will update ${Object.keys(COLUMN_MAPPING).length} columns in "${MAIN_SHEET_NAME}".\n\n` +
    `Enhanced data will be pulled from "${TEMP_SHEET_NAME}".\n\n` +
    `Your formatting will be preserved.\n\nContinue?`,
    Browser.Buttons.YES_NO
  );

  if (response !== 'yes') {
    Logger.log('Update cancelled by user');
    return;
  }

  // Get data
  const mainData = mainSheet.getDataRange().getValues();
  const tempData = tempSheet.getDataRange().getValues();

  const mainHeaders = mainData[0];
  const tempHeaders = tempData[0];

  // Create lookup map from temp data (lesson name → row data)
  const tempLookup = new Map();
  for (let i = 1; i < tempData.length; i++) {
    const lessonName = tempData[i][0]; // Column A = lesson name
    tempLookup.set(lessonName, tempData[i]);
  }

  // Track updates
  const updateLog = [];
  let totalUpdates = 0;

  // Process each field to update
  for (const [fieldName, columnLetter] of Object.entries(COLUMN_MAPPING)) {
    // Find column indices
    const tempColIndex = tempHeaders.indexOf(fieldName);
    const mainColIndex = mainHeaders.indexOf(fieldName);

    if (tempColIndex === -1) {
      updateLog.push(`⚠️  Field "${fieldName}" not found in ${TEMP_SHEET_NAME}`);
      continue;
    }

    if (mainColIndex === -1) {
      updateLog.push(`⚠️  Field "${fieldName}" not found in ${MAIN_SHEET_NAME}`);
      continue;
    }

    // Update cells
    let fieldUpdates = 0;

    for (let i = 1; i < mainData.length; i++) {
      const lessonName = mainData[i][0]; // Column A
      const tempRow = tempLookup.get(lessonName);

      if (tempRow && tempRow[tempColIndex]) {
        const newValue = tempRow[tempColIndex];
        const currentValue = mainData[i][mainColIndex];

        // Only update if different
        if (newValue !== currentValue) {
          const rowNum = i + 1; // Sheet rows are 1-indexed
          const colNum = mainColIndex + 1; // Columns are 1-indexed

          mainSheet.getRange(rowNum, colNum).setValue(newValue);
          fieldUpdates++;
          totalUpdates++;
        }
      }
    }

    updateLog.push(`✅ ${fieldName}: ${fieldUpdates} cells updated`);
  }

  // Show summary
  const summary = updateLog.join('\n') + `\n\n📊 Total: ${totalUpdates} cells updated`;

  Logger.log(summary);
  Browser.msgBox(
    'Update Complete!',
    summary + '\n\n✅ Your formatting has been preserved.\n\nYou can now delete the TEMP_ENHANCED tab.',
    Browser.Buttons.OK
  );
}

/**
 * Creates a custom menu when the spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 Enhanced Data')
      .addItem('Update Columns from TEMP_ENHANCED', 'updateEnhancedColumns')
      .addToUi();
}

/**
 * Helper: Show current column mappings
 */
function showColumnMappings() {
  let msg = 'Current column mappings:\n\n';

  for (const [field, col] of Object.entries(COLUMN_MAPPING)) {
    msg += `${field} → Column ${col}\n`;
  }

  Browser.msgBox('Column Mappings', msg, Browser.Buttons.OK);
}
