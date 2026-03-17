import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8098;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({
  dest: '/tmp/floorplans/',
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo imágenes'));
  }
});

// Ensure upload dir exists
fs.mkdirSync('/tmp/floorplans/', { recursive: true });

/**
 * POST /analyze
 * Receives a floor plan image, sends to vision model, returns 3D geometry JSON
 */
app.post('/analyze', upload.single('floorplan'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Use OpenClaw proxy to call vision model
    const prompt = `Analyze this architectural floor plan image. Extract ALL rooms/spaces with their walls and dimensions.

Return a JSON object with this EXACT structure:
{
  "rooms": [
    {
      "name": "Room Name",
      "area_m2": 168.81,
      "vertices": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]],
      "height": 3.0,
      "type": "main|office|bathroom|kitchen|storage|corridor|terrace|other"
    }
  ],
  "scale": {
    "total_width_m": 40,
    "total_height_m": 25
  }
}

CRITICAL RULES:
- Coordinates must be in METERS, starting from (0,0) at top-left
- Each room's vertices define a CLOSED polygon (4+ points, clockwise)
- Use the m² labels in the image to calibrate dimensions (width × height ≈ area)
- Include ALL labeled rooms/spaces
- Walls are shared between adjacent rooms (vertices should align)
- "height" is ceiling height (default 3.0m unless specified)
- Estimate positions based on the visual layout — rooms that are side by side should have matching edges

Return ONLY the JSON, no explanation.`;

    const response = await fetch('http://localhost:18789/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-6',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }],
        max_tokens: 8000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Vision API error:', errText);
      return res.status(500).json({ error: 'Vision model error', details: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    let geometry;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        geometry = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseErr) {
      console.error('Parse error:', parseErr.message, '\nRaw:', content);
      return res.status(500).json({ error: 'Failed to parse geometry', raw: content });
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ success: true, geometry });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Space Studio API running on port ${PORT}`);
});
