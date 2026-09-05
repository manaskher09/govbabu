#!/usr/bin/env node
// Local dev server: serves the static GovBabu site and mounts the /api
// handlers under the same origin (so fetch('/api/...') works without CORS),
// using the exact (req, res) contract Vercel Functions expect — these files
// deploy unchanged once you're ready to host for real.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8744;

// Tiny .env.local loader — avoids a dotenv dependency for a two-line need.
// Real secrets (Razorpay keys) should live in .env.local, which .gitignore
// already excludes from commits.
(function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const routes = {
  '/api/create-order': require('./api/create-order'),
  '/api/verify-payment': require('./api/verify-payment'),
  '/api/razorpay-webhook': require('./api/razorpay-webhook'),
};

// Static hosts like Cloudflare Pages/Netlify serve /exams/rrb-je/ by
// resolving it to exams/rrb-je/index.html automatically — this dev server
// didn't, so every clean exam-page URL (the canonical link every generated
// page actually uses) 404'd locally despite working in production. Mirror
// that resolution here: a path that's a directory (or has no extension and
// doesn't exist as a file — e.g. /exams/rrb-je with no trailing slash)
// falls back to its own index.html.
function serveFile(filePath, res) {
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      return serveFile(path.join(filePath, 'index.html'), res);
    }
    if (err && !path.extname(filePath)) {
      return serveFile(path.join(filePath, 'index.html'), res);
    }
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      res.end(data);
    });
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy(new Error('Request body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const pathname = req.url.split('?')[0];

  if (routes[pathname]) {
    try {
      const raw = await readRawBody(req);
      req.rawBody = raw;
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
    }
    return routes[pathname](req, res);
  }

  const safePath = path.normalize(pathname === '/' ? '/index.html' : pathname);
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  serveFile(filePath, res);
});

server.listen(PORT, () => {
  const razorpay = require('./api/_lib/razorpay');
  console.log(`GovBabu dev server: http://localhost:${PORT}`);
  console.log(razorpay.isConfigured()
    ? 'Razorpay: configured — real orders will be created.'
    : 'Razorpay: not configured — payments run in mock mode (see .env.example).');
});
