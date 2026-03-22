import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const RAG_BACKEND = process.env.RAG_BACKEND || 'http://100.104.9.33:8096';
const INPAINT_BACKEND = process.env.INPAINT_BACKEND || 'http://100.104.9.33:8097';

// Inpainting proxy — BEFORE express.json() so body stream is intact
app.post('/api/inpaint', async (req, res) => {
  try {
    console.log('[inpaint] forwarding to', INPAINT_BACKEND);
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const r = await fetch(`${INPAINT_BACKEND}/api/inpaint`, {
      method: 'POST',
      headers: { 'content-type': req.headers['content-type'] },
      body,
      signal: AbortSignal.timeout(120000),
    });
    res.set('X-Elapsed', r.headers.get('x-elapsed') || '');
    res.set('Content-Type', r.headers.get('content-type') || 'image/png');
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (err) {
    console.error('[inpaint] backend error:', err.message);
    res.status(502).json({ error: 'Inpainting backend unavailable' });
  }
});

app.get('/api/inpaint/health', async (req, res) => {
  try {
    const r = await fetch(`${INPAINT_BACKEND}/api/inpaint/health`, { signal: AbortSignal.timeout(5000) });
    res.json(await r.json());
  } catch {
    res.json({ status: 'backend_unreachable' });
  }
});

// JSON body parser for remaining routes
app.use(express.json());

// Chat proxy
app.post('/api/chat', async (req, res) => {
  try {
    console.log(`[chat] "${req.body.message}" → forwarding to ${RAG_BACKEND}`);
    const r = await fetch(`${RAG_BACKEND}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(60000),
    });
    res.json(await r.json());
  } catch (err) {
    console.error('[chat] backend error:', err.message);
    res.json({ answer: 'Lo siento, el asistente no está disponible. Prueba de nuevo.', sources: [] });
  }
});

// Semantic search proxy
app.post('/api/search', async (req, res) => {
  try {
    console.log(`[search] "${req.body.query}" → forwarding to ${RAG_BACKEND}`);
    const r = await fetch(`${RAG_BACKEND}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(10000),
    });
    res.json(await r.json());
  } catch (err) {
    console.error('[search] backend error:', err.message);
    res.json({ results: [], total: 0 });
  }
});

// Health proxy
app.get('/api/health', async (req, res) => {
  try {
    const r = await fetch(`${RAG_BACKEND}/api/health`, { signal: AbortSignal.timeout(5000) });
    res.json(await r.json());
  } catch {
    res.json({ status: 'backend_unreachable' });
  }
});

// Reindex proxy
app.post('/api/reindex', async (req, res) => {
  try {
    const r = await fetch(`${RAG_BACKEND}/api/reindex`, { method: 'POST', signal: AbortSignal.timeout(30000) });
    res.json(await r.json());
  } catch (err) {
    res.json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8096;
app.listen(PORT, () => console.log(`MyGloven Proxy on :${PORT} → RAG: ${RAG_BACKEND} | Inpaint: ${INPAINT_BACKEND}`));
