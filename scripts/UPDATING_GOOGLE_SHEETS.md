# Updating Google Sheets Inventory with Enhanced Metadata

This is the canonical workflow for preparing and reviewing metadata updates in Google Sheets.

Google Sheets is a **review hub**, not the long-term source of truth for site content. The repo and Keystatic remain the authoritative source for website behavior and published data.

## Step 1: Prepare the Review Artifact

Run the canonical prep command:

```bash
npm run sheets:prepare-update
```

This command:
- generates stable `slug` and `@id` values
- standardizes `inLanguage`
- estimates `timeRequired`
- scrapes `author`, `license`, and date metadata
- merges all enhancement outputs into one review CSV
- overlays the current repo lesson JSON content onto the merged CSV so the review artifact reflects the website's current canonical content for fields like `Learning Objectives`, `Depends On`, `prerequisiteNotes`, and taxonomy values

Current operational note:
- `inLanguage` is still generated into the merged CSV
- the Apps Script currently does **not** apply `inLanguage` to Google Sheets because many sheets still enforce a dropdown of human-readable language names instead of IETF language codes
- once the sheet validation is migrated to codes, `inLanguage` can be re-enabled in `UPDATEABLE_COLUMNS`

The handoff file is written to:

`scripts/output/MERGED-enhanced-metadata-[YYYY-MM-DD].csv`

The merged CSV is expected to contain these identifiers:
- `slug`
- `name`
- `Sorting ID` when available

---

## Step 2: Review And Apply In Google Sheets

The recommended update path uses the Apps Script helper. It preserves formatting and only updates approved metadata columns on the configured inventory tab.

### Initial Setup (One-time only)
1. Open the [Google Sheets Inventory](https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/).
2. Go to **Extensions > Apps Script**.
3. In the script editor, paste the contents of `scripts/google-apps-script-updater.gs`.
4. Click the **Save** icon (diskette) and name the project "Inventory Updater".
5. Close the tab and refresh your Google Sheet.

Script assumptions:
- target tab name defaults to `lessons_candidates`
- row matching uses `slug` first
- `Sorting ID` is used only as a fallback
- empty `slug` cells in the sheet are OK during the first backfill
- empty CSV values do not overwrite non-empty sheet values

### Running The Preview And Update
1. Open the **Inventory Tools** menu in Google Sheets.
2. Choose either **Preview Enhanced Columns** or **Apply Enhanced Columns**.
3. Open your generated CSV file (`MERGED-enhanced-metadata-...csv`) in a text editor (for example, VS Code).
4. Copy the full contents of the CSV.
5. Paste it into the dialog.
6. Click **Preview Changes** first and confirm:
   - target sheet is `lessons_candidates`
   - matched row count looks correct
   - unmatched rows are understood
   - missing slug or Sorting ID rows are reviewed
   - changed cell count is reasonable
7. Click **Apply Updates** only after the preview looks correct.

---

## Alternate Review Flow: Import Tab

If the pasted CSV workflow is inconvenient, use a temporary import tab in the same spreadsheet.

1. Import the merged CSV into a temporary tab such as `Updates`.
2. Review the imported rows there.
3. If you still need a formula-based review, match rows by `slug` first and `Sorting ID` second.
4. Copy approved values into the canonical `Inventory` tab as values only.

---

## Updating `Depends On` and `prerequisiteNotes` (Issue #48)

Use this flow when converting dependency references from mixed text/numeric IDs to slug/URL references.

1. Generate migration artifacts:
   ```bash
   npm run migrate:depends-on
   ```
2. Open the newest files in `scripts/output/`:
   - `dependencies-migrated-YYYY-MM-DD.csv`
   - `dependencies-migration-report-YYYY-MM-DD.md`
3. In Google Sheets, confirm these columns exist (create if missing):
   - `Depends On` (slug/URL refs, comma-separated)
   - `prerequisiteNotes` (free-text notes only)
4. Import `dependencies-migrated-*.csv` into a temporary tab (for example `DependsUpdate`).
5. Match by `name` (or `Sorting ID`) and copy these values into the main tab:
   - `dependsOn` -> `Depends On`
   - `prerequisiteNotes` -> `prerequisiteNotes`
6. Do not copy rows where the CSV `issues` column is non-empty until reviewed.
7. Run this local validation after updating:
   ```bash
   npm run sync:lesson-slugs
   npm run validate:lessons
   ```

Verification checklist:
- No numeric IDs remain in `Depends On`.
- Each internal dependency token is a lesson slug.
- External dependencies are full `http(s)` URLs.
- Prose text appears only in `prerequisiteNotes`.
- For each lesson JSON file, `slug` matches its filename (for example `building-community.json` => `slug: "building-community"`).
- In Keystatic, keep `Entry Slug (filename)` aligned to filename slug; keep JSON `slug` mirrored to the same value.

---

## Troubleshooting

### "Slug not found" or unmatched rows
The updater does not match by lesson name. It uses:
1. `slug`
2. `Sorting ID` as fallback

If rows do not match:
- confirm the `slug` column exists in the inventory tab
- confirm the merged CSV includes `slug`
- review rows reported as missing slug/Sorting ID in the preview output

### Updated columns
The Apps Script currently updates these metadata/enhancement columns:
- `Topic`
- `learnerCategory`
- `Depends On`
- `Learning Objectives`
- `subTopic`
- `author`
- `license`
- `educationalLevel`
- `learningResourceType`
- `mentions`
- `timeRequired`
- `version`
- `prerequisiteNotes`
- `contributor`
- `dateCreated`
- `dateModified`
- `datePublished`
- `identifier`
- `slug`
- `about`
- `abstract`
- `accessibilitySummary`

`inLanguage` is intentionally excluded for now because the current Google Sheet uses dropdown validation with human-readable language names. The generated CSV still includes standardized IETF language codes for later adoption.

If you need to update other columns, change the `UPDATEABLE_COLUMNS` config in `google-apps-script-updater.gs`.
