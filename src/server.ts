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
app.use('/uploads', express.static(uploadsDir));

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
      file: req.file.path
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

app.post('/api/video/local', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const motion = (req.body.motion || 'subtle-zoom') as string;

    // Simulate processing time for better UX
    await wait(2000);

    // Copy image to outputs directory (browsers can display images as "video")
    const outPath = path.join(outputsDir, `${uuid()}.jpg`);
    await fs.copyFile(req.file.path, outPath);

    res.json({ 
      url: `/outputs/${path.basename(outPath)}`, 
      model: 'local-css-effects',
      provider: 'local',
      motion: motion,
      isLocalMode: true
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'local_processing_error' });
  }
});

app.post('/api/video/kling', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const motion = (req.body.motion || 'subtle-zoom') as string;
    const duration = (req.body.duration || '5') as string;

    // Upload image to temporary storage and get URL
    const imageUrl = `http://localhost:3000/uploads/${path.basename(req.file.path)}`;
    const prompt = buildMotionPrompt(motion);

    // Step 1: Create generation task
    const requestBody = {
      model: 'kling-video/v1/standard/image-to-video', // より軽量なモデル
      image_url: imageUrl,
      prompt: prompt,
      duration: Math.min(parseInt(duration), 5), // 最大5秒に制限
      cfg_scale: 0.3 // より軽い設定
    };

    console.log('Kling API Request:', {
      url: 'https://api.aimlapi.com/v2/generate/video/kling/generation',
      apiKeyExists: !!process.env.AIML_API_KEY,
      apiKeyPrefix: process.env.AIML_API_KEY?.substring(0, 10) + '...',
      body: requestBody
    });

    const generationResponse = await fetch('https://api.aimlapi.com/v2/generate/video/kling/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Kling API Response Status:', generationResponse.status);

    if (!generationResponse.ok) {
      const errorData = await generationResponse.json();
      console.log('Kling API Error Response:', errorData);
      throw new Error(`Kling API error: ${JSON.stringify(errorData)}`);
    }

    const generationData = await generationResponse.json();
    const generationId = generationData.id;

    // Step 2: Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes timeout

    while (!completed && attempts < maxAttempts) {
      await wait(5000); // Wait 5 seconds between polls
      
      const statusResponse = await fetch(`https://api.aimlapi.com/v2/generate/video/kling/generation/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AIML_API_KEY}`,
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.status === 'completed' && statusData.video_url) {
          // Download and save the video
          const videoResponse = await fetch(statusData.video_url);
          const videoBuffer = await videoResponse.arrayBuffer();
          const outPath = path.join(outputsDir, `${uuid()}.mp4`);
          await fs.writeFile(outPath, Buffer.from(videoBuffer));

          return res.json({ 
            url: `/outputs/${path.basename(outPath)}`, 
            model: 'kling-v1.6-pro',
            provider: 'kling-ai'
          });
        } else if (statusData.status === 'failed') {
          throw new Error('Video generation failed');
        }
      }
      
      attempts++;
    }

    throw new Error('Video generation timeout');
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'internal_error' });
  }
});

app.post('/api/video/veo', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image is required' });
    const motion = (req.body.motion || 'subtle-zoom') as string;
    const aspect = (req.body.aspect || '16:9') as '16:9' | '9:16';
    // Use the most lightweight model by default
    const model = 'veo-3.0-fast-generate-001';

    const imgBytes = await fs.readFile(req.file.path);
    const base64Image = imgBytes.toString('base64');
    const prompt = buildMotionPrompt(motion);

    let op = await ai.models.generateVideos({
      model,
      prompt,
      image: { imageBytes: base64Image, mimeType: req.file.mimetype },
      config: {
        aspectRatio: aspect
      }
    });

    while (!op.done) {
      await wait(10000);
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const videoPart = op.response?.generatedVideos?.[0]?.video;
    if (!videoPart) return res.status(500).json({ error: 'generation_failed' });

    const outPath = path.join(outputsDir, `${uuid()}.mp4`);
    const response = await fetch(videoPart.uri || '');
    const buffer = await response.arrayBuffer();
    await fs.writeFile(outPath, Buffer.from(buffer));

    res.json({ url: `/outputs/${path.basename(outPath)}`, model, aspect });
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
