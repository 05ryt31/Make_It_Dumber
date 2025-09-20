import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { GoogleGenAI, createPartFromUri } from '@google/genai';
import { v4 as uuid } from 'uuid';

const app = express();
app.use(express.json());

const uploadsDir = path.resolve('./uploads');
const outputsDir = path.resolve('./outputs');
await fs.mkdir(uploadsDir, { recursive: true });
await fs.mkdir(outputsDir, { recursive: true });

app.use('/outputs', express.static(outputsDir));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const upload = multer({ storage });

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.post('/api/captions', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const tone = (req.body.tone || 'default') as string;

    const file = await ai.files.upload({
      file: req.file.path,
      displayName: path.basename(req.file.originalname)
    });

    const parts = [
      `Return JSON with keys "top" and "bottom". Keep each under 50 characters in Japanese. Tone=${tone}. Do not include quotes in values.`,
      createPartFromUri(file.uri!, file.mimeType!)
    ];

    const resp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: { responseMimeType: 'application/json' }
    });

    const json = safeParseJSON(resp.text);
    res.json({ captions: json, fileUri: file.uri, mimeType: file.mimeType });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal_error' });
  }
});

app.post('/api/video/veo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const motion = (req.body.motion || 'subtle-zoom') as string;
    const aspect = (req.body.aspect || '16:9') as '16:9' | '9:16';
    const resolution = (req.body.resolution || '720p') as '720p' | '1080p';
    const model = (req.body.speed === 'fast') ? 'veo-3.0-fast-generate-001' : 'veo-3.0-generate-001';

    const imgBytes = await fs.readFile(req.file.path);
    const prompt = buildMotionPrompt(motion);

    let op = await ai.models.generateVideos({
      model,
      prompt,
      image: { imageBytes: imgBytes, mimeType: req.file.mimetype },
      aspectRatio: aspect,
      resolution
    });

    while (!op.done) {
      await wait(10000);
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const videoPart = op.response?.generatedVideos?.[0]?.video;
    if (!videoPart) return res.status(500).json({ error: 'generation_failed' });

    const outPath = path.join(outputsDir, `${uuid()}.mp4`);
    await ai.files.download({ file: videoPart, downloadPath: outPath });

    res.json({ url: `/outputs/${path.basename(outPath)}`, model, aspect, resolution });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal_error' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Listening on :${port}`));

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildMotionPrompt(motion: string) {
  const table: Record<string, string> = {
    'subtle-zoom': 'Create a short looping meme video with a gentle Ken Burns zoom and slight parallax, no text overlays.',
    'shake': 'Create a short looping meme video with light camera shake and micro-zoom beats, no text overlays.',
    'slide': 'Create a short looping meme video with a smooth horizontal pan and slight zoom, no text overlays.',
    'dramatic': 'Create a dramatic meme trailer style: quick push-in, cut to micro-zoom and slight tilt, no text overlays.'
  };
  return table[motion] || table['subtle-zoom'];
}

function safeParseJSON(s: string | undefined) {
  try { return JSON.parse(s || '{}'); } catch { return { top: '', bottom: '' }; }
}
