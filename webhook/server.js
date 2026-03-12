import http from 'http';
import { execSync } from 'child_process';

const PORT = 8097;
const SECRET = process.env.SANITY_WEBHOOK_SECRET || 'mygloven-rebuild-2026';
const PROJECT_DIR = '/home/ubuntu/clawd/projects/mygloven';

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/rebuild') {
    const secret = req.headers['x-webhook-secret'] || new URL(`http://localhost${req.url}`).searchParams?.get('secret');
    
    // Accept if secret matches or if it comes from Sanity (has sanity headers)
    const isSanity = req.headers['user-agent']?.includes('Sanity') || req.headers['x-sanity-project-id'];
    
    if (!isSanity && secret !== SECRET) {
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    console.log(`[${new Date().toISOString()}] Rebuild triggered`);
    res.writeHead(200);
    res.end('Rebuild started');

    // Run in background so we don't block the response
    try {
      execSync(`cd ${PROJECT_DIR} && npx vercel --prod --yes > /tmp/mygloven-rebuild.log 2>&1 &`, {
        timeout: 5000,
      });
    } catch (e) {
      console.error('Rebuild spawn error:', e.message);
    }
  } else {
    res.writeHead(200);
    res.end('OK');
  }
});

server.listen(PORT, () => {
  console.log(`MyGloven webhook listener on port ${PORT}`);
});
