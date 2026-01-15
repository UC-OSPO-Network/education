import { getSheetData } from './src/lib/getSheetData.ts';

(async () => {
  const data = await getSheetData();

  console.log('=== COLUMN HEADERS ===');
  const columns = Object.keys(data[0]);
  console.log(columns.join('\n'));

  console.log('\n=== SAMPLE LESSON (first record) ===');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\n=== DATA QUALITY STATS ===');
  console.log('Total lessons:', data.length);
  console.log('');

  columns.forEach(col => {
    const emptyCount = data.filter(row => {
      const val = row[col];
      return !val || val.trim() === '';
    }).length;
    const filledCount = data.length - emptyCount;
    const fillRate = (filledCount / data.length * 100).toFixed(1);
    console.log(col + ': ' + fillRate + '% filled (' + filledCount + '/' + data.length + ')');
  });
})();
