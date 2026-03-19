import 'dotenv/config';
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

// Use local Ollama with Qwen 3.5 0.8B (free, no API costs)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:0.8b';

async function askLLM(prompt, context) {
  const systemPrompt = `Eres my'G, el asistente IA de MyGloven — la plataforma que conecta venues de música en vivo con artistas.
Respondes SIEMPRE en español, de forma breve, útil y con personalidad.
Usa SOLO la información proporcionada en los datos. NO inventes venues, artistas ni datos que no estén en el contexto.
Si no encuentras resultados relevantes, dilo honestamente y sugiere reformular la búsqueda.
Cuando recomiendes venues o artistas, menciona su nombre y ciudad.`;

  try {
    console.log(`[ollama] calling ${OLLAMA_MODEL}...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        keep_alive: -1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Datos disponibles:\n${context}\n\nPregunta del usuario: ${prompt}` }
        ],
        options: { num_predict: 300 },
        think: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Ollama error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    console.log('[ollama] response received');
    return data.message?.content || null;
  } catch (e) {
    console.error('[ollama] error:', e.message);
    return null;
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

  // Try local Qwen, fallback to structured response
  const aiAnswer = await askLLM(message, context);
  const answer = aiAnswer || buildFallback(results, message);

  res.json({ answer, sources });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', venues: venues.length, artists: artists.length });
});

const PORT = process.env.PORT || 8096;
app.listen(PORT, () => console.log(`MyGloven RAG API on :${PORT}`));
