import {
  baseUrl,
  cleanupPreview,
  closeServer,
  preparePreview,
  startStaticServer,
  waitForServer,
} from './local-preview.mjs';

let preview;
let server;
let isShuttingDown = false;

async function shutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  await closeServer(server);
  await cleanupPreview(preview?.previewRoot);
  process.exit(exitCode);
}

process.on('SIGINT', () => {
  shutdown(0).catch((error) => {
    console.error(error);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  shutdown(0).catch((error) => {
    console.error(error);
    process.exit(1);
  });
});

try {
  preview = await preparePreview();
  console.log(`Starting local preview server on ${baseUrl}/ ...`);
  server = await startStaticServer(preview.previewRoot);
  await waitForServer();
  console.log(`Local accessibility preview ready at ${baseUrl}/`);
} catch (error) {
  console.error(error);
  await cleanupPreview(preview?.previewRoot);
  process.exit(1);
}
