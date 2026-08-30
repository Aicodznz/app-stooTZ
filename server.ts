import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 1. AI Code Error Explainer & Bug Fixer
  app.post('/api/gemini/explain-error', async (req, res) => {
    try {
      const { code, errorMessage, language = 'javascript' } = req.body;
      if (!code && !errorMessage) {
        return res.status(400).json({ error: 'Code or error message is required' });
      }

      const ai = getGenAI();
      const prompt = `Wewe ni Mkufunzi Mkuu wa Programu wa Kiswahili (Swahili Coding Tutor & Senior Debugger) wa jukwaa la CodZnz Pro.
Lugha ya Programu: ${language}
Kodi ya Mtumiaji:
\`\`\`${language}
${code || '(Hakuna kodi iliyoambatishwa)'}
\`\`\`

Ujumbe wa Error / Tatizo:
${errorMessage || '(Hakuna ujumbe maalum wa kosa, tafadhali kagua kodi na ueleze makosa)'}

Tafadhali chambua kodi hii na ujibu kwa muundo ufuatao wa JSON (strictly valid JSON only):
{
  "summary": "Maelezo mafupi ya tatizo kwa Kiswahili fasaha na kirafiki (sentensi 1-2)",
  "errorLine": "Namba ya mstari au eneo lenye kosa (au 'N/A')",
  "cause": "Kwa nini kosa hili limetokea (Detailed explanation in Swahili)",
  "fixedCode": "Kodi iliyorekebishwa kikamilifu tayari kutumika bila error",
  "explanation": "Mambo muhimu yaliyobadilishwa na jinsi ya kuepuka kosa hili siku zijazo kwa Kiswahili",
  "tips": ["Kidokezo cha 1", "Kidokezo cha 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/explain-error:', err);
      res.status(500).json({ 
        error: err.message || 'Hitilafu imetokea wakati wa kuchambua kodi.',
        fallback: {
          summary: 'Hitilafu ya sintaksia au mantiki imegunduliwa.',
          cause: 'Kagua mabano, alama za uakifishaji, au jina la variable.',
          fixedCode: req.body?.code || '',
          explanation: 'Tafadhali hakikisha kodi inafuata kanuni za lugha husika.',
          tips: ['Kagua console logs kwa maelezo zaidi', 'Jaribu kugawa kodi katika vipande vidogo']
        }
      });
    }
  });

  // 2. AI Course & Quiz Creator for Admin
  app.post('/api/gemini/generate-course', async (req, res) => {
    try {
      const { topic, level = 'Beginner', category = 'courses', targetAudience = 'Wanaoanza' } = req.body;
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }

      const ai = getGenAI();
      const prompt = `Wewe ni Mbunifu Mwandamizi wa Mitaala ya TEHAMA wa CodZnz Pro Tanzania.
Tengeneza somo kamili na mtihani wa maswali 5 ya kuchagua (Multiple Choice Quiz) kwa lugha ya Kiswahili fasaha na mifano halisi ya Afrika Mashariki.

Mada: ${topic}
Ngazi: ${level}
Kitengo: ${category}
Walengwa: ${targetAudience}

Tafadhali toa jibu kwa umbizo la JSON (strictly valid JSON only):
{
  "title": "Jina la Somo lenye kuvutia (Swahili)",
  "desc": "Maelezo ya kina ya somo (aya 2 za Kiswahili)",
  "category": "${category}",
  "icon": "⚡",
  "price": 0,
  "originalPrice": 15000,
  "isFree": true,
  "duration": "Saa 3.5",
  "level": "${level}",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "contentBody": "Nyaraka kamili ya somo yenye mafundisho ya hatua kwa hatua, mifano ya kodi, na maelekezo ya vitendo (Markdown format ya Kiswahili)",
  "quiz": [
    {
      "id": 1,
      "question": "Swali la 1 kwa Kiswahili",
      "options": ["Chaguo A", "Chaguo B", "Chaguo C", "Chaguo D"],
      "correct": 0,
      "explanation": "Maelezo mafupi kwa nini hili ndio jibu sahihi"
    },
    {
      "id": 2,
      "question": "Swali la 2 kwa Kiswahili",
      "options": ["Chaguo A", "Chaguo B", "Chaguo C", "Chaguo D"],
      "correct": 1,
      "explanation": "Maelezo mafupi kwa nini hili ndio jibu sahihi"
    },
    {
      "id": 3,
      "question": "Swali la 3 kwa Kiswahili",
      "options": ["Chaguo A", "Chaguo B", "Chaguo C", "Chaguo D"],
      "correct": 2,
      "explanation": "Maelezo mafupi kwa nini hili ndio jibu sahihi"
    },
    {
      "id": 4,
      "question": "Swali la 4 kwa Kiswahili",
      "options": ["Chaguo A", "Chaguo B", "Chaguo C", "Chaguo D"],
      "correct": 0,
      "explanation": "Maelezo mafupi kwa nini hili ndio jibu sahihi"
    },
    {
      "id": 5,
      "question": "Swali la 5 kwa Kiswahili",
      "options": ["Chaguo A", "Chaguo B", "Chaguo C", "Chaguo D"],
      "correct": 3,
      "explanation": "Maelezo mafupi kwa nini hili ndio jibu sahihi"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/generate-course:', err);
      res.status(500).json({ error: err.message || 'Hitilafu imetokea wakati wa kutengeneza somo kwa AI.' });
    }
  });

  // 3. AI Lesson Summarizer & Flashcards
  app.post('/api/gemini/summarize-lesson', async (req, res) => {
    try {
      const { title, content, level } = req.body;
      if (!title && !content) {
        return res.status(400).json({ error: 'Title or content is required' });
      }

      const ai = getGenAI();
      const prompt = `Wewe ni Mwalimu Msaidizi wa AI wa CodZnz Pro.
Tengeneza muhtasari wa haraka wa kueleweka pamoja na kadi za kukariri (Interactive Flashcards) kwa lugha ya Kiswahili kwa ajili ya somo hili:

Kichwa cha Somo: ${title}
Ngazi: ${level || 'All'}
Maudhui ya Somo:
${content ? content.slice(0, 3000) : title}

Tafadhali toa jibu kwa umbizo la JSON (strictly valid JSON only):
{
  "quickTakeaways": [
    "Jambo muhimu la 1 lililofundishwa",
    "Jambo muhimu la 2 lililofundishwa",
    "Jambo muhimu la 3 lililofundishwa",
    "Jambo muhimu la 4 lililofundishwa",
    "Jambo muhimu la 5 lililofundishwa"
  ],
  "syntaxCheatSheet": "Muhtasari wa kodi muhimu / kanuni za kufuata (Markdown format)",
  "flashcards": [
    {
      "front": "Swali au Dhana (Front of Card)",
      "back": "Jibu au Maelezo mafupi (Back of Card)"
    },
    {
      "front": "Swali au Dhana ya 2",
      "back": "Jibu au Maelezo mafupi ya 2"
    },
    {
      "front": "Swali au Dhana ya 3",
      "back": "Jibu au Maelezo mafupi ya 3"
    },
    {
      "front": "Swali au Dhana ya 4",
      "back": "Jibu au Maelezo mafupi ya 4"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/gemini/summarize-lesson:', err);
      res.status(500).json({ error: err.message || 'Hitilafu wakati wa kutengeneza muhtasari wa AI.' });
    }
  });

  // 4. Student Q&A AI Tutor Assistant
  app.post('/api/gemini/tutor-qa', async (req, res) => {
    try {
      const { question, lessonContext, studentCode } = req.body;
      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const ai = getGenAI();
      const prompt = `Wewe ni Mwalimu Mkuu wa AI (CodZnz AI Tutor) unayesaidia wanafunzi wa TEHAMA Tanzania na Zanzibar.
Jibu swali la mwanafunzi huyu kwa Kiswahili sanifu, kirafiki, chenye moyo wa kumtia moyo na mifano ya vitendo.

Mazingira ya Somo: ${lessonContext || 'Mafunzo ya TEHAMA & Programming'}
${studentCode ? `Kodi ya Mwanafunzi:\n\`\`\`\n${studentCode}\n\`\`\`\n` : ''}
Swali la Mwanafunzi: "${question}"

Tafadhali toa jibu lenye:
1. Jibu la moja kwa moja na rahisi kueleweka
2. Mfano wa kodi (kama inafaa)
3. Ushauri wa kuboresha au tahadhari ya kuepuka makosa`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });

      res.json({ answer: response.text || 'Samahani, jaribu tena baadaye.' });
    } catch (err: any) {
      console.error('Error in /api/gemini/tutor-qa:', err);
      res.status(500).json({ error: err.message || 'Hitilafu wakati wa kuwasiliana na Mwalimu wa AI.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
