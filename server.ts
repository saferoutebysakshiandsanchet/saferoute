import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini AI client server-side
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI(apiKey ? { apiKey } : undefined);

  // Gemini Safety Copilot endpoint with live Google Search & Google Maps grounding
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, userLocation, groundingMode = 'search' } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Valid messages array is required' });
      }

      const locationContext = userLocation
        ? `Current User Coordinates: [Lat: ${userLocation.lat?.toFixed(4)}, Lng: ${userLocation.lng?.toFixed(4)}], City: ${userLocation.city || 'India'}.`
        : 'User is navigating in India.';

      const systemInstruction = `You are SafeRoute Copilot, an expert AI safety and navigation assistant for India.
You protect and empower citizens, night commuters, college students, and pedestrians walking or traveling across Indian cities (including Delhi-NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, etc.).
${locationContext}

Core Objectives:
1. Provide fast, actionable, calm safety advice for walking and transit.
2. Provide details about routes, transit stations, safe havens (police stations, 24/7 pharmacies, open metro stations, petrol pumps), lighting conditions, waterlogging risks, and fog safety.
3. Highlight emergency helplines whenever relevant:
   - 112: All-India Unified Emergency Helpline
   - 1091: Women Safety & Distress Helpline
   - 100: Police Control Room
   - 108: Emergency Ambulance & Disaster Relief
4. Be concise, well-structured, and realistic. Use bullet points for steps.`;

      // Select grounding tool based on mode (Note: Maps and Search cannot be combined in single request per SDK specs)
      const tools = groundingMode === 'maps'
        ? [{ googleMaps: {} }]
        : [{ googleSearch: {} }];

      // Convert messages to Gemini format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools,
        },
      });

      const replyText = response.text || 'I could not generate safety guidance at this moment. Stay alert and call 112 if in danger.';

      // Extract grounding metadata if available
      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;

      return res.json({
        reply: replyText,
        groundingMetadata: {
          webSearchQueries: groundingMetadata?.webSearchQueries || [],
          groundingChunks: groundingMetadata?.groundingChunks || [],
        },
      });
    } catch (err: any) {
      console.error('SafeRoute Gemini API error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate AI safety guidance',
        fallback: 'System advisory: For urgent safety issues or emergencies, immediately dial 112 or head towards the nearest well-lit public metro station or police beat.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'SafeRoute Fullstack Engine',
      hasGeminiKey: !!apiKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Frontend routing & dev middleware
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SafeRoute dev server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
