import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, cp, mkdtemp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const port = Number.parseInt(process.env.A11Y_PORT || '4321', 10);
const baseUrl = `http://127.0.0.1:${port}/education`;
const previewRoot = await mkdtemp(path.join(tmpdir(), 'education-a11y-'));
const previewEducationRoot = path.join(previewRoot, 'education');
const sitemapPath = path.join(previewEducationRoot, 'sitemap.xml');
const pa11yBinary = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'pa11y-ci.cmd' : 'pa11y-ci',
);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function runCommand(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function findIndexPages(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await findIndexPages(entryPath, root)));
    } else if (entry.isFile() && entry.name === 'index.html') {
      const relativeDir = path.relative(root, dir).split(path.sep).join('/');
      const urlPath = relativeDir ? `/education/${relativeDir}/` : '/education/';
      pages.push(`${baseUrl.replace(/\/$/, '')}${urlPath.replace(/^\/education/, '')}`);
    }
  }

  return pages.sort();
}

async function writeSitemap() {
  const pageUrls = await findIndexPages(previewEducationRoot);
  if (pageUrls.length === 0) {
    throw new Error(`No built pages found under ${previewEducationRoot}`);
  }

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pageUrls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  await writeFile(sitemapPath, sitemap);
  console.log(`Generated accessibility sitemap with ${pageUrls.length} pages.`);
}

async function resolveFilePath(requestPath) {
  const normalizedPath = decodeURIComponent(new URL(requestPath, 'http://127.0.0.1').pathname);
  const candidatePaths = [];

  if (normalizedPath === '/' || normalizedPath === '') {
    candidatePaths.push(path.join(previewRoot, 'index.html'));
  }

  const absolutePath = path.resolve(previewRoot, `.${normalizedPath}`);
  if (!absolutePath.startsWith(previewRoot)) {
    return null;
  }

  candidatePaths.push(absolutePath);

  if (!path.extname(absolutePath)) {
    candidatePaths.push(path.join(absolutePath, 'index.html'));
    candidatePaths.push(`${absolutePath}.html`);
  }

  for (const candidate of candidatePaths) {
    try {
      const fileStats = await stat(candidate);
      if (fileStats.isFile()) {
        return candidate;
      }
    } catch {
      // Keep checking fallback candidates.
    }
  }

  return null;
}

async function startStaticServer() {
  const server = createServer(async (req, res) => {
    try {
      const filePath = await resolveFilePath(req.url || '/');
      if (!filePath) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': contentTypes[ext] || 'application/octet-stream',
      });
      await pipeline(createReadStream(filePath), res);
    } catch (error) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Server error: ${error.message}`);
        return;
      }

      res.destroy(error);
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  return server;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the server is listening.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for local preview server at ${baseUrl}/`);
}

console.log('Building site for local accessibility audit...');
await runCommand('npm', ['run', 'build']);

console.log('Preparing local preview under /education/ ...');
await mkdir(previewEducationRoot, { recursive: true });
await cp(path.join(repoRoot, 'dist'), previewEducationRoot, { recursive: true });
await access(path.join(previewEducationRoot, 'index.html'));
await writeSitemap();

let server;
try {
  console.log(`Starting local preview server on ${baseUrl}/ ...`);
  server = await startStaticServer();
  await waitForServer();

  console.log('Running pa11y-ci accessibility audit...');
  await runCommand(pa11yBinary, [
    '--sitemap',
    `${baseUrl}/sitemap.xml`,
    '--sitemap-find',
    'http://127.0.0.1:[0-9]+',
    '--sitemap-replace',
    `http://127.0.0.1:${port}`,
  ]);

  console.log('Local accessibility audit complete.');
} finally {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  await rm(previewRoot, { recursive: true, force: true });
}
