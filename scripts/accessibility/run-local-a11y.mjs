import path from 'node:path';
import {
  baseUrl,
  cleanupPreview,
  closeServer,
  preparePreview,
  repoRoot,
  runCommand,
  startStaticServer,
  waitForServer,
} from './local-preview.mjs';

const pa11yBinary = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'pa11y-ci.cmd' : 'pa11y-ci',
);

let preview;
let server;

try {
  preview = await preparePreview();

  console.log(`Starting local preview server on ${baseUrl}/ ...`);
  server = await startStaticServer(preview.previewRoot);
  await waitForServer();

  console.log('Running pa11y-ci accessibility audit...');
  await runCommand(pa11yBinary, [
    '--sitemap',
    preview.sitemapUrl,
    '--sitemap-find',
    'http://127.0.0.1:[0-9]+',
    '--sitemap-replace',
    `http://127.0.0.1:${new URL(baseUrl).port}`,
  ]);

  console.log('Local accessibility audit complete.');
} finally {
  await closeServer(server);
  await cleanupPreview(preview?.previewRoot);
}
