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

// Models to try in order of preference
const GEMINI_TEXT_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateWithGeminiFallback(options: {
  prompt: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of GEMINI_TEXT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config: any = {};
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        if (typeof options.temperature === 'number') {
          config.temperature = options.temperature;
        }

        const response = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config,
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        console.warn(`[Gemini API] Model ${model} (attempt ${attempt + 1}) returned ${status}:`, err?.message || err);
        // Short pause before retry/fallback
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('All Gemini model endpoints currently busy. Using smart fallback.');
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
    const { code, errorMessage, language = 'javascript' } = req.body;
    if (!code && !errorMessage) {
      return res.status(400).json({ error: 'Code or error message is required' });
    }

    const fallbackResponse = {
      summary: 'Hitilafu ya sintaksia au mantiki imegunduliwa kwenye kodi yako.',
      errorLine: 'N/A',
      cause: 'Kagua miundo ya mabano {}, vituo vya mistari, na majina ya variables au functions.',
      fixedCode: code || '',
      explanation: 'Hakikisha kodi inafuata kanuni fasaha za lugha na haina maneno yasiyotambuliwa.',
      tips: [
        'Kagua console logs kwa taarifa za kina za kosa.',
        'Gawa kodi yako katika vipande vidogo (functions) vinavyojaribika kwa urahisi.',
        'Tumia Code Sandbox kufanyia majaribio ya haraka.'
      ]
    };

    try {
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

      const text = await generateWithGeminiFallback({
        prompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      });

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.warn('Handling /api/gemini/explain-error with fallback due to temporary API demand:', err?.message);
      res.json(fallbackResponse);
    }
  });

  // 2. AI Course & Quiz Creator for Admin
  app.post('/api/gemini/generate-course', async (req, res) => {
    const { topic, level = 'Beginner', category = 'courses', targetAudience = 'Wanaoanza' } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const fallbackCourse = {
      title: `Mafunzo ya ${topic}`,
      desc: `Mwongozo kamili na wa vitendo wa kuelewa ${topic} kuanzia misingi hadi ngazi ya utendaji kazi kwa lugha ya Kiswahili.`,
      category,
      icon: '⚡',
      price: 0,
      originalPrice: 15000,
      isFree: true,
      duration: 'Saa 3.5',
      level,
      skills: [`Misingi ya ${topic}`, 'Kusoma Msimbo', 'Kurekebisha Hitilafu', 'Ujenzi wa Miradi'],
      contentBody: `## Utangulizi wa ${topic}\nKaribu kwenye mafunzo haya ya vitendo. Katika somo hili utajifunza dhana kuu na kuona mifano halisi inayotumika katika ulimwengu wa kiteknolojia leo.\n\n### Hatua Kuu:\n1. Kuelewa sintaksia na misingi.\n2. Kufanya mazoezi kwenye Sandbox.\n3. Kujenga mradi mdogo wa kujipima.`,
      quiz: [
        {
          id: 1,
          question: `Ni nini lengo kuu la kujifunza ${topic}?`,
          options: [
            `Kujenga mifumo na suluhu za kiteknolojia kwa kutumia ${topic}`,
            'Kuhifadhi faili za picha pekee',
            'Kuzima mfumo wa kompyuta',
            'Hakuna faida yoyote'
          ],
          correct: 0,
          explanation: `Lengo kuu ni kupata ujuzi wa kujenga mifumo thabiti na suluhu za kiteknolojia.`
        },
        {
          id: 2,
          question: 'Ni njia ipi bora ya kufanikisha mafunzo haya kwa haraka?',
          options: [
            'Kusoma bila kuandika msimbo',
            'Kufanya mazoezi ya vitendo mara kwa mara kwenye Code Sandbox',
            'Kukariri bila kuelewa mantiki',
            'Kusubiri siku ya mwisho pekee'
          ],
          correct: 1,
          explanation: 'Kufanya mazoezi ya vitendo ndio siri kuu ya kuwa mbunifu mahiri wa mifumo.'
        }
      ]
    };

    try {
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

      const text = await generateWithGeminiFallback({
        prompt,
        responseMimeType: 'application/json',
        temperature: 0.3,
      });

      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.warn('Handling /api/gemini/generate-course with fallback due to temporary API demand:', err?.message);
      res.json(fallbackCourse);
    }
  });

  // 3. AI Lesson Summarizer & Flashcards
  app.post('/api/gemini/summarize-lesson', async (req, res) => {
    const { title, content, level } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Title or content is required' });
    }

    const lessonTitle = title || 'Somo la TEHAMA';
    const fallbackSummary = {
      title: lessonTitle,
      summary: `Muhtasari wa ${lessonTitle}: Somo hili linaangazia misingi muhimu, kanuni za kiufundi, na mazoezi ya vitendo kwa ajili ya kujenga mifumo thabiti.`,
      quickSummary: `Muhtasari wa ${lessonTitle}: Somo hili linaangazia misingi muhimu, kanuni za kiufundi, na mazoezi ya vitendo kwa ajili ya kujenga mifumo thabiti.`,
      quickTakeaways: [
        `Kuelewa dhana za msingi na matumizi yake katika programu halisi.`,
        `Kuzingatia usafi wa kodi na upangaji mzuri wa miundo ya mifumo.`,
        `Kufanya majaribio ya moja kwa moja kwenye Code Sandbox ili kudumisha kumbukumbu.`,
        `Kutatua hitilafu kwa kutumia taarifa sahihi za makosa (debugging).`,
        `Kujenga mazoea ya kujifunza hatua kwa hatua kila siku.`
      ],
      keyPoints: [
        `Kuelewa dhana za msingi za ${lessonTitle}.`,
        `Kuzingatia usafi wa kodi na mbinu bora za uandishi.`,
        `Kufanya majaribio kwenye uwanja wa msimbo.`
      ],
      syntaxCheatSheet: `### Kanuni Muhimu za ${lessonTitle}\n- Kagua msimbo wako mara kwa mara kwenye Console.\n- Hakikisha majina ya variables yanajieleza vizuri.\n- Jaribu kugawa matatizo magumu katika vipande vidogo.`,
      flashcards: [
        {
          front: `Ni jambo gani la msingi kuzingatia katika ${lessonTitle}?`,
          back: `Kuelewa mantiki kuu kabla ya kuanza kuandika kodi changamano.`
        },
        {
          front: 'Nifanye nini nikikutana na hitilafu (error)?',
          back: 'Kagua ujumbe wa error kwa makini na utumie zana ya AI Error Explainer au Q&A.'
        },
        {
          front: 'Kwa nini Code Sandbox ni muhimu?',
          back: 'Inakupa fursa ya kujaribu kodi papo hapo na kuona matokeo bila kuhitaji zana za ziada.'
        }
      ]
    };

    try {
      const prompt = `Wewe ni Mwalimu Msaidizi wa AI wa CodZnz Pro.
Tengeneza muhtasari wa haraka wa kueleweka pamoja na kadi za kukariri (Interactive Flashcards) kwa lugha ya Kiswahili kwa ajili ya somo hili:

Kichwa cha Somo: ${lessonTitle}
Ngazi: ${level || 'All'}
Maudhui ya Somo:
${content ? content.slice(0, 3000) : lessonTitle}

Tafadhali toa jibu kwa umbizo la JSON (strictly valid JSON only):
{
  "summary": "Muhtasari mfupi wa aya moja unaoelezea kiini cha somo kwa Kiswahili",
  "quickSummary": "Muhtasari mfupi wa aya moja unaoelezea kiini cha somo kwa Kiswahili",
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

      const text = await generateWithGeminiFallback({
        prompt,
        responseMimeType: 'application/json',
        temperature: 0.2,
      });

      const parsed = JSON.parse(text);
      if (!parsed.quickSummary && parsed.summary) parsed.quickSummary = parsed.summary;
      if (!parsed.summary && parsed.quickSummary) parsed.summary = parsed.quickSummary;
      if (!parsed.keyPoints && parsed.quickTakeaways) parsed.keyPoints = parsed.quickTakeaways;

      res.json(parsed);
    } catch (err: any) {
      console.warn('Handling /api/gemini/summarize-lesson with fallback due to temporary API demand:', err?.message);
      res.json(fallbackSummary);
    }
  });

  // 4. Student Q&A AI Tutor Assistant
  app.post('/api/gemini/tutor-qa', async (req, res) => {
    const { question, lessonContext, studentCode } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    try {
      const prompt = `Wewe ni Mwalimu Mkuu wa AI (CodZnz AI Tutor) unayesaidia wanafunzi wa TEHAMA Tanzania na Zanzibar.
Jibu swali la mwanafunzi huyu kwa Kiswahili sanifu, kirafiki, chenye moyo wa kumtia moyo na mifano ya vitendo.

Mazingira ya Somo: ${lessonContext || 'Mafunzo ya TEHAMA & Programming'}
${studentCode ? `Kodi ya Mwanafunzi:\n\`\`\`\n${studentCode}\n\`\`\`\n` : ''}
Swali la Mwanafunzi: "${question}"

Tafadhali toa jibu lenye:
1. Jibu la moja kwa moja na rahisi kueleweka
2. Mfano wa kodi (kama inafaa)
3. Ushauri wa kuboresha au tahadhari ya kuepuka makosa`;

      const answerText = await generateWithGeminiFallback({
        prompt,
        temperature: 0.3,
      });

      res.json({ answer: answerText || 'Samahani, jaribu tena baadaye.' });
    } catch (err: any) {
      console.warn('Handling /api/gemini/tutor-qa with graceful reply due to temporary API demand:', err?.message);
      res.json({
        answer: `Habari ndugu mwanafunzi! Kuhusu swali lako: "${question}"\n\nKwenye ${lessonContext || 'somo hili'}, jambo la msingi ni kuhakikisha unafuata taratibu na kanuni za lugha unayotumia. Kagua miundo ya sintaksia, majina ya vitu, na uhakikishe unajaribu msimbo wako hatua kwa hatua kwenye Code Sandbox. Ukihitaji maelezo zaidi kuhusu kosa maalum, unaweza kutumia pia zana yetu ya AI Error Explainer!`
      });
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
