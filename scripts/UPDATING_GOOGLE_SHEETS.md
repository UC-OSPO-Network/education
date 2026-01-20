# Safely Updating Google Sheets with Enhanced Metadata

This guide explains how to update your canonical Google Sheets inventory with enhanced metadata **without losing any formatting, colors, or conditional formatting**.

## 🎯 Goal

Update specific columns (author, license, timeRequired, etc.) in your Google Sheet while preserving:
- ✅ All cell formatting and colors
- ✅ Conditional formatting rules
- ✅ Data validation
- ✅ Comments and notes
- ✅ Formulas in other columns

## 📁 Files Generated

After running `node scripts/merge-enhanced-data.js`, you'll have:
```
scripts/output/merged-enhanced-data-YYYY-MM-DD.csv
```

This CSV contains all your lessons with enhanced metadata from:
- Scraped metadata (author, license, dates)
- Standardized language codes (inLanguage)
- Estimated durations (timeRequired)
- Generated slugs (identifier)

## 🚀 Two Update Methods

### Method 1: Google Apps Script (Recommended - Easiest!)

**Advantages:**
- ✅ One-click update
- ✅ Automatic column matching
- ✅ Shows update summary
- ✅ 100% preserves formatting

**Steps:**

1. **Open your canonical Google Sheet**

2. **Import the merged CSV to a temporary tab**
   - Click `+` at the bottom to add a new sheet
   - Name it exactly: `TEMP_ENHANCED`
   - File → Import → Upload
   - Select `merged-enhanced-data-YYYY-MM-DD.csv`
   - Import location: "Append to current sheet"
   - Separator: Comma
   - **IMPORTANT:** Uncheck "Convert text to numbers"

3. **Add the Apps Script**
   - Extensions → Apps Script
   - Delete any default code
   - Copy/paste entire contents of `scripts/google-apps-script-updater.gs`
   - Click Save (💾 icon)
   - Close the Apps Script tab

4. **Run the updater**
   - Back in your spreadsheet, refresh the page
   - You'll see a new menu: `🔄 Enhanced Data`
   - Click: `🔄 Enhanced Data` → `Update Columns from TEMP_ENHANCED`
   - Click "Yes" to confirm
   - Wait for the "Update Complete!" message

5. **Verify and cleanup**
   - Spot-check a few updated cells
   - Verify formatting is intact
   - Delete the `TEMP_ENHANCED` tab

**Done!** ✨

---

### Method 2: Manual VLOOKUP (More control, more work)

**Advantages:**
- ✅ Full control over each column
- ✅ Can test one column at a time
- ✅ No scripting required

**Steps:**

1. **Import enhanced data to temporary tab**
   - Same as Method 1, steps 1-2

2. **For each column you want to update:**

   Let's say you want to update the `author` column (column Q):

   a. **Find the column letter in TEMP_ENHANCED**
      - Open TEMP_ENHANCED tab
      - Find the `author` column (let's say it's column Q there too)

   b. **Create a helper column in your main sheet**
      - Insert a column next to the one you're updating
      - In row 2, paste this formula:
        ```
        =IFERROR(VLOOKUP($A2,TEMP_ENHANCED!$A:$Q,17,FALSE),Q2)
        ```
      - Adjust:
        - `$A:$Q` = range in TEMP_ENHANCED (A to last column)
        - `17` = column number of author in TEMP_ENHANCED (A=1, B=2, ..., Q=17)
        - `Q2` = current value (fallback if no match)

   c. **Copy formula down**
      - Select the cell with formula
      - Drag the blue square down to last row
      - Or double-click the blue square to auto-fill

   d. **Convert to values**
      - Select all cells in helper column
      - Copy (Ctrl+C / Cmd+C)
      - Select the original column
      - Right-click → Paste Special → Values only

   e. **Delete helper column**

3. **Repeat step 2 for each column:**
   - author (column Q)
   - license (column X)
   - inLanguage (column AB)
   - timeRequired (column AG)
   - etc.

4. **Delete TEMP_ENHANCED tab**

---

## 📊 Columns That Get Updated

The following columns will be updated with enhanced data:

### Scraped Metadata
- `author` - Original author/organization
- `license` - License type (e.g., CC-BY-4.0)
- `dateCreated` - Original creation date
- `dateModified` - Last modified date
- `datePublished` - Publication date
- `contributor` - Contributors
- `abstract` - Short abstract/summary
- `about` - Subject matter description
- `accessibilitySummary` - Accessibility notes
- `mentions` - Referenced concepts/technologies
- `recordedAt` - Recording location/event
- `version` - Version number

### Automated Enhancements
- `inLanguage` - IETF language codes (e.g., "en", "es", "fr")
- `timeRequired` - Estimated duration (e.g., "PT2H30M")
- `identifier` - URL-safe slug (e.g., "building-community")

## ⚠️ Important Notes

### Column Letters May Vary
The Apps Script has column mappings at the top:
```javascript
const COLUMN_MAPPING = {
  'author': 'Q',
  'license': 'X',
  // ... etc
};
```

If your columns are in different positions:
1. Open the script
2. Update the column letters to match your sheet
3. Save

### Empty Values
- Empty values in enhanced data won't overwrite existing data
- Only non-empty enhanced values will update

### Backup First!
Before updating:
1. File → Make a copy
2. Name it: "Inventory - Lessons (Backup YYYY-MM-DD)"

This way you can always revert if needed.

## 🐛 Troubleshooting

### "Sheet not found" error
- Make sure tab names match exactly
- Default main sheet name: `Inventory - Lessons`
- Temp sheet must be named: `TEMP_ENHANCED`

### Some fields not updating
- Check if field names match exactly (case-sensitive)
- Verify the CSV has data for those fields
- Check the update log for warnings

### Formatting got messed up
- This shouldn't happen with either method!
- If it does, restore from your backup
- Report the issue

## 🎓 Understanding the Data

### ISO 8601 Duration Format (timeRequired)
- `PT2H30M` = 2 hours 30 minutes
- `PT45M` = 45 minutes
- `PT1H` = 1 hour

### IETF Language Tags (inLanguage)
- `en` = English
- `es` = Spanish
- `fr` = French
- `zh` = Chinese
- Multiple languages separated by commas

## 📝 Next Steps

After updating:
1. Review the data in Google Sheets
2. The live website will auto-update from the Google Sheets CSV export
3. No deployment needed - changes appear within ~5 minutes

## 🆘 Need Help?

Questions or issues?
- Open a GitHub issue
- Tag @jt14den
