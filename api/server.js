import express from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import { readFileSync } from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

const venues = JSON.parse(readFileSync(new URL('../src/data/venues.json', import.meta.url)));
const artists = JSON.parse(readFileSync(new URL('../src/data/artists.json', import.meta.url)));
const allData = [
  ...venues.map(v => ({ ...v, type: 'venue' })),
  ...artists.map(a => ({ ...a, type: 'artist' }))
];

const fuse = new Fuse(allData, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 1.5 },
    { name: 'city', weight: 2 },
    { name: 'address', weight: 0.5 },
    { name: 'country', weight: 1 },
  ],
  threshold: 0.5,
  includeScore: true,
});

async function askQwen(prompt, context) {
  const systemPrompt = `Eres my'G, el asistente IA de MyGloven. Respondes SIEMPRE en español, breve y útil.
Usa SOLO la información proporcionada. NO inventes datos. Recomienda venues/artistas del contexto.`;

  const fullPrompt = `${systemPrompt}\n\nDatos:\n${context}\n\nUsuario: ${prompt}\n\nmy'G:`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3.5:0.8b',
        prompt: fullPrompt,
        stream: false,
        options: { num_predict: 250, temperature: 0.7 }
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    let response = data.response || '';
    // Strip thinking tags if present
    response = response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return response;
  } catch (e) {
    console.error('Ollama error:', e.message);
    return null; // Will use fallback
  }
}

function buildFallback(results, message) {
  if (results.length === 0) return 'No he encontrado resultados para tu búsqueda. Prueba con otra ciudad o tipo de espacio.';
  
  const types = { venue: 'espacios', artist: 'artistas' };
  const items = results.map(r => r.item);
  const venueResults = items.filter(i => i.type === 'venue');
  const artistResults = items.filter(i => i.type === 'artist');
  
  let text = '';
  if (venueResults.length > 0) {
    text += `He encontrado ${venueResults.length} espacios que podrían interesarte:\n\n`;
    venueResults.forEach(v => {
      text += `• **${v.name}**`;
      if (v.city) text += ` — ${v.city}`;
      text += '\n';
    });
  }
  if (artistResults.length > 0) {
    text += `\nY ${artistResults.length} artistas:\n\n`;
    artistResults.forEach(a => {
      text += `• **${a.name}**\n`;
    });
  }
  return text;
}

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  console.log(`[chat] "${message}"`);

  const results = fuse.search(message, { limit: 5 });
  
  const sources = results.map(r => ({
    name: r.item.name,
    type: r.item.type,
    slug: r.item.slug,
    city: r.item.city || '',
    image: r.item.image?.[0] || r.item.logo?.[0] || null,
  }));

  // Build context for LLM
  let context = results.map(r => {
    const i = r.item;
    let s = `${i.type === 'artist' ? 'Artista' : 'Venue'}: ${i.name}`;
    if (i.city) s += ` (${i.city})`;
    if (i.description) s += ` — ${i.description.slice(0, 150)}`;
    return s;
  }).join('\n');

  // Try Qwen, fallback to structured response
  const aiAnswer = await askQwen(message, context);
  const answer = aiAnswer || buildFallback(results, message);

  res.json({ answer, sources });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', venues: venues.length, artists: artists.length });
});

const PORT = process.env.PORT || 8096;
app.listen(PORT, () => console.log(`MyGloven RAG API on :${PORT}`));
