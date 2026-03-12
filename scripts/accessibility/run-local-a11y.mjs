import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, cp, mkdtemp, mkdir, rm, stat } from 'node:fs/promises';
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
const auditOutputPath = path.join(repoRoot, 'scripts', 'accessibility', 'audit-results.json');

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

let server;
try {
  console.log(`Starting local preview server on ${baseUrl}/ ...`);
  server = await startStaticServer();
  await waitForServer();

  console.log('Running accessibility audit...');
  await runCommand(process.execPath, ['scripts/accessibility/audit.cjs'], {
    A11Y_BASE_URL: baseUrl,
    A11Y_OUTPUT_FILE: auditOutputPath,
  });

  console.log(`Local accessibility audit complete. Results saved to ${auditOutputPath}`);
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
