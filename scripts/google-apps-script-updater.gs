/**
 * Google Apps Script for updating inventory columns based on Lesson Name.
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this code.
 * 4. Click the Save icon and name it "Inventory Updater".
 * 5. Refresh your Google Sheet. You will see a new menu: "Inventory Tools".
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Inventory Tools')
      .addItem('Update Enhanced Columns', 'showUpdateDialog')
      .addToUi();
}

/**
 * Shows a dialog to paste CSV data.
 */
function showUpdateDialog() {
  const html = HtmlService.createHtmlOutput(
    '<p>Paste the content of your MERGED-enhanced-metadata CSV file below:</p>' +
    '<textarea id="csvData" style="width: 100%; height: 300px; font-family: monospace;"></textarea>' +
    '<br><br>' +
    '<button onclick="runUpdate()" style="padding: 10px 20px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Sheet</button>' +
    '<script>' +
    '  function runUpdate() {' +
    '    const data = document.getElementById("csvData").value;' +
    '    google.script.run.withSuccessHandler(closeDialog).processCsv(data);' +
    '  }' +
    '  function closeDialog() {' +
    '    google.script.host.close();' +
    '  }' +
    '</script>'
  ).setWidth(600).setHeight(450);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Update Inventory Data');
}

/**
 * Processes the CSV data and updates the sheet.
 */
function processCsv(csvString) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = Utilities.parseCsv(csvString);
  
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert('Invalid CSV data.');
    return;
  }
  
  const headers = data[0];
  const csvRows = data.slice(1);
  
  // Get sheet data
  const sheetData = sheet.getDataRange().getValues();
  const sheetHeaders = sheetData[0];
  const sheetRows = sheetData.slice(1);
  
  // Find column indices in CSV
  const colMap = {
    name: headers.indexOf('name'),
    author: headers.indexOf('author'),
    license: headers.indexOf('license'),
    contributor: headers.indexOf('contributor'),
    dateCreated: headers.indexOf('dateCreated'),
    dateModified: headers.indexOf('dateModified'),
    datePublished: headers.indexOf('datePublished'),
    inLanguage: headers.indexOf('inLanguage'),
    timeRequired: headers.indexOf('timeRequired'),
    identifier: headers.indexOf('identifier'),
    slug: headers.indexOf('slug'),
    '@id': headers.indexOf('@id'),
    Topic: headers.indexOf('Topic'),
    about: headers.indexOf('about'),
    abstract: headers.indexOf('abstract'),
    accessibilitySummary: headers.indexOf('accessibilitySummary')
  };
  
  // Find column indices in Sheet
  const sheetColMap = {};
  Object.keys(colMap).forEach(key => {
    sheetColMap[key] = sheetHeaders.indexOf(key);
  });
  
  if (sheetColMap.name === -1) {
    SpreadsheetApp.getUi().alert('Error: "name" column not found in Google Sheet.');
    return;
  }
  
  let updateCount = 0;
  let skipCount = 0;
  
  // Create a map for CSV data for fast lookup
  const csvDataMap = {};
  csvRows.forEach(row => {
    const name = row[colMap.name];
    if (name) csvDataMap[name] = row;
  });
  
  // Iterate through sheet rows and update
  for (let i = 0; i < sheetRows.length; i++) {
    const sheetName = sheetRows[i][sheetColMap.name];
    const csvRow = csvDataMap[sheetName];
    
    if (csvRow) {
      const rowNum = i + 2; // 1-indexed + header
      
      Object.keys(colMap).forEach(key => {
        if (key === 'name') return; // Don't update name
        
        const sheetCol = sheetColMap[key];
        const csvCol = colMap[key];
        
        if (sheetCol !== -1 && csvCol !== -1) {
          const newValue = csvRow[csvCol];
          const oldValue = sheetRows[i][sheetCol];
          
          if (newValue && newValue !== String(oldValue)) {
            sheet.getRange(rowNum, sheetCol + 1).setValue(newValue);
            updateCount++;
          }
        }
      });
    } else {
      skipCount++;
    }
  }
  
  SpreadsheetApp.getUi().alert('Update Complete!\nUpdated cells: ' + updateCount + '\nLessons not found in CSV: ' + skipCount);
}
