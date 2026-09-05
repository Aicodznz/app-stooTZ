export interface GuideChapter {
  id: string;
  title: string;
  duration: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    tip?: string;
    codeExample?: {
      language: 'html' | 'css' | 'javascript' | 'python';
      title: string;
      code: string;
    };
  }[];
}

export interface CourseGuide {
  courseId: string;
  title: string;
  desc: string;
  author: string;
  totalPages: number;
  chapters: GuideChapter[];
}

export const COURSE_GUIDES: Record<string, CourseGuide> = {
  // HTML & CSS Basics (c3)
  c3: {
    courseId: 'c3',
    title: 'HTML & CSS Basics',
    desc: 'Mwongozo kamili wa mwanzo kuelewa jinsi kurasa za tovuti zinavyoundwa na kupambwa kwa weledi.',
    author: 'Timu ya Wasomi COD',
    totalPages: 34,
    chapters: [
      {
        id: 'ch1',
        title: '1. Utangulizi wa HTML & Muundo wa Tovuti',
        duration: '15 min',
        summary: 'Kuelewa msingi mkuu wa wavuti: HTML ni nini na jinsi inavyofanya kazi kama mifupa ya tovuti.',
        sections: [
          {
            heading: 'HTML ni nini hasa?',
            content: 'HTML inasimama badala ya **HyperText Markup Language**. Ni lugha ya msingi kabisa inayotumika kutengeneza mifupa (skeleton) ya kila tovuti unayoiona mtandaoni. Bila HTML, hakuna kurasa za wavuti.\n\nKila kipengele kwenye ukurasa—kama kichwa cha habari, aya ya maelezo, picha, au kitufe—huwakilishwa na kile kinachoitwa **HTML Tag** (mfano `<h1>`, `<p>`, `<a>`, `<button>`).',
            tip: 'Kumbuka: HTML sio lugha ya kupanga mantiki (programming language) kama Python au JavaScript; ni lugha ya kupanga maudhui (markup language).'
          },
          {
            heading: 'Muundo wa Msingi wa Faili la HTML (Boilerplate)',
            content: 'Kila faili la HTML huanza na tangazo la `<!DOCTYPE html>`, likifuatiwa na lebo ya `<html>`. Ndani yake kuna sehemu mbili kuu:\n1. `<head>`: Taarifa za siri za ukurasa (metadata, jina la ukurasa, mafaili ya mitindo ya CSS).\n2. `<body>`: Sehemu yote inayoonekana kwa mtumiaji kwenye skrini ya simu au kompyuta.',
            codeExample: {
              language: 'html',
              title: 'Mfano wa Muundo wa Kwanza wa HTML',
              code: `<!DOCTYPE html>
<html lang="sw">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ukurasa Wangu wa Kwanza</title>
</head>
<body style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc;">
  <h1>Karibu kwenye Ulimwengu wa Web! 🚀</h1>
  <p>Huu ni ukurasa wangu wa kwanza nilioutengeneza kwa HTML.</p>
  <button style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
    Bofya Hapa
  </button>
</body>
</html>`
            }
          }
        ]
      },
      {
        id: 'ch2',
        title: '2. Lebo Kuu za HTML (Headings, Links, Images & Forms)',
        duration: '20 min',
        summary: 'Jifunze lebo muhimu za kuweka maandishi, viungo, picha na fomu za kuingiza taarifa.',
        sections: [
          {
            heading: 'Vichwa vya Habari na Aya za Maelezo',
            content: 'HTML ina viwango 6 vya vichwa vya habari: `<h1>` hadi `<h6>`. `<h1>` ndio kichwa kikuu chenye umuhimu mkubwa zaidi kwa watumiaji na mitambo ya Google (SEO). Aya za kawaida huandikwa kwa lebo ya `<p>`.',
            tip: 'Ushauri wa Kitaalamu: Tumia `<h1>` mara moja tu kwa ukurasa kwa ajili ya jina kuu la makala au ukurasa.'
          },
          {
            heading: 'Viungo (Links) na Picha (Images)',
            content: 'Viungo huundwa kwa lebo ya `<a>` yenye sifa ya `href`. Picha huwekwa kwa lebo ya `<img>` yenye `src` (chanzo cha picha) na `alt` (maelezo ya picha endapo haitafunguka).',
            codeExample: {
              language: 'html',
              title: 'Lebo za Picha, Viungo na Fomu',
              code: `<div style="max-width: 400px; padding: 20px; background: #1e293b; border-radius: 12px; color: white; font-family: sans-serif;">
  <h2 style="color: #38bdf8;">Profaili ya Mwanafunzi</h2>
  <img 
    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
    alt="Picha ya Profaili" 
    style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #38bdf8;"
  />
  <p style="font-size: 14px; color: #cbd5e1;">Jina: Amina Juma</p>
  <p style="font-size: 14px; color: #cbd5e1;">Taaluma: Frontend Developer</p>
  <a href="https://google.com" target="_blank" style="color: #60a5fa; text-decoration: none; font-size: 13px;">
    Tembelea Tovuti Yangu &rarr;
  </a>
</div>`
            }
          }
        ]
      },
      {
        id: 'ch3',
        title: '3. Utangulizi wa CSS na Mapambo (Styling & Colors)',
        duration: '25 min',
        summary: 'Badilisha ukurasa wako kutoka HTML tupu hadi kuwa wa kuvutia kwa kutumia CSS.',
        sections: [
          {
            heading: 'CSS ni nini na Inafanyaje Kazi?',
            content: 'CSS inasimama badala ya **Cascading Style Sheets**. Ikiwa HTML ni mifupa ya jengo, CSS ndio rangi ya kuta, vigae, vioo, samani na mapambo yote ya nje na ndani.\n\nCSS hutumia mfumo wa **Selector** (chagua kile unachotaka kupamba) na **Declarations** (taja rangi au ukubwa).',
            tip: 'Unaweza kuandika CSS ndani ya lebo ya `<style>` kwenye HTML au kwenye faili huru la `.css`.'
          },
          {
            heading: 'Mfano wa Kadi Yenye Mitindo ya Kisasa ya CSS',
            content: 'Angalia jinsi mistari michache ya CSS inavyoweza kugeuza kisanduku cha kawaida kuwa kadi ya kisasa yenye vivuli (shadows) na kona za duara (border-radius).',
            codeExample: {
              language: 'html',
              title: 'Kadi ya Kifahari Yenye CSS',
              code: `<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      background: linear-gradient(135deg, #1e1b4b, #312e81);
      color: #ffffff;
      padding: 24px;
      border-radius: 16px;
      max-width: 320px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.2s ease;
    }
    .card:hover {
      transform: translateY(-4px);
    }
    .badge {
      display: inline-block;
      background: #4ade80;
      color: #052e16;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 999px;
      text-transform: uppercase;
    }
    .btn {
      display: block;
      width: 100%;
      padding: 10px;
      background: #6366f1;
      color: white;
      text-align: center;
      border-radius: 8px;
      border: none;
      font-weight: bold;
      cursor: pointer;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Inaendelea</span>
    <h3 style="margin-top: 12px; margin-bottom: 6px;">Kozi ya CSS Pro</h3>
    <p style="font-size: 13px; color: #c7d2fe; line-height: 1.5;">Jifunze mitindo ya kisasa kama Flexbox na CSS Grid kwa vitendo.</p>
    <button class="btn">Anza Kujifunza Sasa</button>
  </div>
</body>
</html>`
            }
          }
        ]
      },
      {
        id: 'ch4',
        title: '4. CSS Box Model, Spacing & Flexbox',
        duration: '30 min',
        summary: 'Jifunze siri kuu ya upangaji wa vitu: Margin, Padding, Border na Flexbox.',
        sections: [
          {
            heading: 'Kuelewa CSS Box Model',
            content: 'Kila kitu kwenye ukurasa wa wavuti huchukuliwa kama kisanduku (box). Kisanduku hiki kimeundwa na tabaka 4:\n1. **Content**: Maudhui halisi (maneno au picha).\n2. **Padding**: Nafasi ya ndani kati ya maudhui na ukingo.\n3. **Border**: Ukingo unaozunguka.\n4. **Margin**: Nafasi ya nje inayotenganisha kisanduku kimoja na kingine.',
            tip: 'Daima tumia `box-sizing: border-box;` mwanzoni mwa CSS yako ili ukubwa wa padding usiongeze upana wa sanduku bila kutarajia.'
          },
          {
            heading: 'Nguvu ya CSS Flexbox kwa Skrini za Simu',
            content: 'Flexbox (`display: flex;`) ndio njia rahisi zaidi ya kupanga vitu viwe kwenye mstari mmoja (row) au safu wima (column), na kuviweka katikati au kusambaa sawia.',
            codeExample: {
              language: 'html',
              title: 'Upangaji wa Flexbox kwenye Simu na Desktop',
              code: `<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      display: flex;
      gap: 12px;
      background: #0f172a;
      padding: 16px;
      border-radius: 12px;
      font-family: sans-serif;
    }
    .box {
      flex: 1;
      background: #1e293b;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    .box h4 { margin: 0 0 6px 0; color: #38bdf8; }
    .box p { margin: 0; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">
      <h4>Ubunifu</h4>
      <p>UI Safi</p>
    </div>
    <div class="box">
      <h4>Utekelezaji</h4>
      <p>HTML & CSS</p>
    </div>
    <div class="box">
      <h4>Kasi</h4>
      <p>Inapakia Haraka</p>
    </div>
  </div>
</body>
</html>`
            }
          }
        ]
      },
      {
        id: 'ch5',
        title: '5. Mradi Kamili: Tovuti ya Ukurasa Mmoja (Portfolio)',
        duration: '40 min',
        summary: 'Unganisha kila ulichojifunza kutengeneza ukurasa halisi wa wasifu unaoweza kuendesha moja kwa moja.',
        sections: [
          {
            heading: 'Kujenga Ukurasa Kamili wa Wasifu Wako',
            content: 'Hongera kwa kufika sura ya mwisho ya HTML & CSS Basics! Sasa ni wakati wa kuunganisha ujuzi huu wote na kuunda ukurasa kamili wenye sehemu ya kichwa (Hero header), orodha ya ujuzi (Skills grid), na fomu ya mawasiliano.',
            tip: 'Bofya kitufe cha "Jaribu Kwenye Sandbox" hapo chini ili kuendesha na kurekebisha msimbo huu mara moja!'
          },
          {
            heading: 'Msimbo Kamili wa Mradi wa Portfolio',
            content: 'Msimbo huu uko tayari kufanya kazi popote. Unaweza kuubadilisha uwe na jina lako, picha yako, na ujuzi wako.',
            codeExample: {
              language: 'html',
              title: 'Mradi Kamili wa Tovuti ya Wasifu',
              code: `<!DOCTYPE html>
<html lang="sw">
<head>
  <meta charset="UTF-8">
  <title>Wasifu Wangu - Web Developer</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0b0f19; color: #e2e8f0; padding: 24px 16px; line-height: 1.6; }
    .hero { text-align: center; max-width: 600px; margin: 0 auto 32px auto; }
    .avatar { width: 90px; height: 90px; border-radius: 50%; border: 3px solid #6366f1; margin-bottom: 16px; }
    h1 { font-size: 24px; color: #ffffff; margin-bottom: 8px; }
    .subtitle { color: #818cf8; font-weight: 600; font-size: 14px; margin-bottom: 12px; }
    .bio { color: #94a3b8; font-size: 14px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; max-width: 600px; margin: 0 auto; }
    .skill { background: #131b2e; border: 1px solid #1e293b; padding: 14px; border-radius: 12px; text-align: center; }
    .skill h4 { color: #38bdf8; font-size: 14px; margin-bottom: 4px; }
    .skill p { font-size: 11px; color: #64748b; }
    .contact-btn { display: inline-block; margin-top: 24px; padding: 10px 24px; background: #4f46e5; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; }
  </style>
</head>
<body>
  <div class="hero">
    <img class="avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=180" alt="Avatar">
    <h1>Juma Said Baraka</h1>
    <div class="subtitle">Junior Frontend Developer</div>
    <p class="bio">Ninapenda kutengeneza mifumo ya wavuti inayofanya kazi kwa kasi na muonekano safi kwenye simu na kompyuta.</p>
    <div class="grid">
      <div class="skill"><h4>HTML5</h4><p>Semantics & Forms</p></div>
      <div class="skill"><h4>CSS3</h4><p>Flexbox & Grid</p></div>
      <div class="skill"><h4>Responsive</h4><p>Mobile-First</p></div>
    </div>
    <a href="mailto:juma@example.com" class="contact-btn">Wasiliana Nami</a>
  </div>
</body>
</html>`
            }
          }
        ]
      }
    ]
  },

  // JavaScript Fundamentals (c1)
  c1: {
    courseId: 'c1',
    title: 'JavaScript Fundamentals',
    desc: 'Mwongozo thabiti wa kuelewa lugha inayohuisha kila tovuti mtandaoni: Variables, Functions, DOM na Asynchronous JS.',
    author: 'Timu ya Wasomi COD',
    totalPages: 42,
    chapters: [
      {
        id: 'ch1',
        title: '1. Variables, Data Types & Console',
        duration: '20 min',
        summary: 'Misingi ya kutunza taarifa kwenye JavaScript kwa kutumia let, const na aina za data.',
        sections: [
          {
            heading: 'Kutunza Data kwa let na const',
            content: 'Kwenye JavaScript ya kisasa (ES6+), tunatumia `const` kwa vigeuzo (variables) ambavyo havibadiliki, na `let` kwa vile vinavyoweza kubadilishwa. Epuka kutumia `var` ya zamani.',
            tip: 'Kanuni ya dhahabu: Anza kila kigeuzo kwa `const`. Ikibidi ukibadilishe baadaye ndio ubadilishe kiwe `let`.'
          },
          {
            heading: 'Mfano wa Kwanza wa JavaScript',
            content: 'Tazama mfano huu unaoonyesha jinsi JavaScript inavyofanya hesabu na kuonyesha majibu:',
            codeExample: {
              language: 'javascript',
              title: 'Variables & Data Types',
              code: `// Variables
const jinaLaMwanafunzi = "Fatuma";
let alama = 85;

console.log("Mwanafunzi: " + jinaLaMwanafunzi);
console.log("Alama: " + alama);

if (alama >= 80) {
  console.log("Matokeo: Umefaulu kwa Daraja la Kwanza! 🌟");
} else {
  console.log("Matokeo: Bado unahitaji kujitahidi kidogo.");
}`
            }
          }
        ]
      },
      {
        id: 'ch2',
        title: '2. Functions & Arrow Functions',
        duration: '25 min',
        summary: 'Kutengeneza vitendaji vinavyoweza kurudiwa kutumika mahali pengi kwenye programu yako.',
        sections: [
          {
            heading: 'Functions ni nini?',
            content: 'Function ni kifungu cha msimbo kinachofanya kazi maalum na kurudisha jibu (`return`). Hii inakuepusha na kurudia kuandika msimbo uleule mara nyingi.',
            codeExample: {
              language: 'javascript',
              title: 'Kutengeneza Function',
              code: `// Arrow Function ya kuhesabu punguzo la bei
const pigaPunguzo = (beiHalisi, asilimiaPunguzo) => {
  const punguzo = beiHalisi * (asilimiaPunguzo / 100);
  return beiHalisi - punguzo;
};

const beiMpya = pigaPunguzo(50000, 20); // 20% punguzo
console.log("Bei ya Kulipia: TZS " + beiMpya);`
            }
          }
        ]
      },
      {
        id: 'ch3',
        title: '3. DOM Manipulation (Kubadili Ukurasa)',
        duration: '35 min',
        summary: 'Jinsi JavaScript inavyowasiliana na vitufe na maandishi ya HTML.',
        sections: [
          {
            heading: 'Kusoma na Kubadili Vipengele vya HTML',
            content: 'Kwa kutumia `document.querySelector` na `addEventListener`, unaweza kusikia mguso wa kitufe (click) na kubadili maandishi mara moja bila ukurasa kupakia upya.',
            codeExample: {
              language: 'html',
              title: 'Kaunta Rahisi ya Namba (Interactive Counter)',
              code: `<!DOCTYPE html>
<html>
<body style="background: #0f172a; color: white; text-align: center; font-family: sans-serif; padding: 40px;">
  <h2 id="number" style="font-size: 48px; color: #38bdf8; margin-bottom: 20px;">0</h2>
  <button id="addBtn" style="padding: 12px 24px; font-size: 16px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
    Ongeza Namba (+1)
  </button>

  <script>
    let count = 0;
    const numberDisplay = document.getElementById('number');
    const addBtn = document.getElementById('addBtn');

    addBtn.addEventListener('click', () => {
      count++;
      numberDisplay.textContent = count;
      numberDisplay.style.transform = 'scale(1.2)';
      setTimeout(() => numberDisplay.style.transform = 'scale(1.0)', 150);
    });
  </script>
</body>
</html>`
            }
          }
        ]
      }
    ]
  },

  // Python for Data Science (c2)
  c2: {
    courseId: 'c2',
    title: 'Python for Data Science',
    desc: 'Mwongozo wa kina wa Python kwa uchambuzi wa takwimu: Lists, Dictionaries, NumPy na Pandas.',
    author: 'Timu ya Wasomi COD',
    totalPages: 38,
    chapters: [
      {
        id: 'ch1',
        title: '1. Misingi ya Python na Miundo ya Data',
        duration: '25 min',
        summary: 'Kuelewa sintaksia safi ya Python na jinsi ya kutumia Lists na Dictionaries.',
        sections: [
          {
            heading: 'Kwa nini Python ndio Mfalme wa Data Science?',
            content: 'Python ni lugha rahisi sana kusoma na kuandika lakini ina maktaba imara zaidi za kimataifa kwa ajili ya hesabu za takwimu, akili mnemba (AI) na sayansi ya data kama Pandas na NumPy.',
            codeExample: {
              language: 'python',
              title: 'Mfano wa Python Lists & Dictionaries',
              code: `# Orodha ya mauzo ya wiki
mauzo = [120000, 150000, 95000, 210000, 180000]

jumla = sum(mauzo)
wastani = jumla / len(mauzo)

print(f"Jumla ya Mauzo: TZS {jumla:,}")
print(f"Wastani wa Siku: TZS {wastani:,.2f}")`
            }
          }
        ]
      },
      {
        id: 'ch2',
        title: '2. Uchambuzi wa Data na Pandas',
        duration: '35 min',
        summary: 'Kupakia majedwali ya Excel/CSV na kutoa taarifa za kibiashara mara moja.',
        sections: [
          {
            heading: 'DataFrames na Mchanganuo wa Takwimu',
            content: 'Pandas hukuruhusu kusafisha data zilizochafuka, kuunganisha data, na kufanya makundi (groupby) kwa sekunde chache.',
            codeExample: {
              language: 'python',
              title: 'Mchanganuo wa Wateja',
              code: `wateja = [
    {"jina": "Baraka", "manunuzi": 45000, "mkoa": "Dar es Salaam"},
    {"jina": "Subira", "manunuzi": 80000, "mkoa": "Arusha"},
    {"jina": "Daudi", "manunuzi": 120000, "mkoa": "Mwanza"},
]

# Chuja wateja waliotumia zaidi ya 50,000
vip_wateja = [w for w in wateja if w["manunuzi"] >= 50000]
print(f"Wateja wa Hadhi ya Juu (VIP): {len(vip_wateja)}")`
            }
          }
        ]
      }
    ]
  },

  // Fullstack React & Node.js (c4)
  c4: {
    courseId: 'c4',
    title: 'Fullstack React & Node.js',
    desc: 'Mwongozo wa kujenga programu kamili zenye muunganisho wa API ya Express na muonekano wa kisasa wa React.',
    author: 'Timu ya Wasomi COD',
    totalPages: 50,
    chapters: [
      {
        id: 'ch1',
        title: '1. Misingi ya React Components & JSX',
        duration: '30 min',
        summary: 'Jinsi ya kugawanya kiolesura chako katika vipande vinavyotumika tena (Components).',
        sections: [
          {
            heading: 'Nguvu ya React State & Props',
            content: 'React inafanya maendeleo ya programu za wavuti kuwa mepesi kwa kutumia State. State inapobadilika, React husasisha sehemu ile tu iliyoathirika bila kupakia upya ukurasa mzima.',
            codeExample: {
              language: 'html',
              title: 'Mfano wa React State',
              code: `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body style="background: #0b0f19; color: white; font-family: sans-serif; padding: 30px;">
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      const [likes, setLikes] = React.useState(0);
      return (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '16px', maxWidth: '300px' }}>
          <h3>React Post 👍</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Mafunzo ya kisasa ya React na Node.js</p>
          <button 
            onClick={() => setLikes(likes + 1)}
            style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Penda ({likes})
          </button>
        </div>
      );
    }
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`
            }
          }
        ]
      }
    ]
  }
};

// Fallback generator for custom courses
export function getOrCreateGuide(course: { id: string; title: string; desc?: string; level?: string }): CourseGuide {
  if (COURSE_GUIDES[course.id]) {
    return COURSE_GUIDES[course.id];
  }

  // Generate a high quality fallback guide dynamically
  const isHtml = course.title.toLowerCase().includes('html') || course.title.toLowerCase().includes('web');
  const isPython = course.title.toLowerCase().includes('python');
  const isJs = course.title.toLowerCase().includes('javascript') || course.title.toLowerCase().includes('react');

  return {
    courseId: course.id,
    title: course.title,
    desc: course.desc || 'Mwongozo kamili wa kujifunzia na kuelewa mada hii kwa vitendo.',
    author: 'Wasomi COD Academy',
    totalPages: 24,
    chapters: [
      {
        id: 'ch1',
        title: `1. Utangulizi wa ${course.title}`,
        duration: '15 min',
        summary: `Muhtasari wa msingi na malengo makuu ya kujifunza ${course.title}.`,
        sections: [
          {
            heading: `Msingi Mkuu wa ${course.title}`,
            content: `Karibu kwenye mwongozo huu wa vitendo wa **${course.title}**.\n\nMwongozo huu umeandaliwa ili kukuwezesha kujifunza hatua kwa hatua kuanzia mwanzo bila kuhitaji ujuzi mgumu wa awali.\n\nKila sura inajumuisha mifano halisi unayoweza kuijaribu moja kwa moja kwenye Sandbox yetu ya msimbo (Code Sandbox).`,
            tip: 'Kumbuka kufanya mazoezi kwa mikono yako; kuandika msimbo mwenyewe ndio siri kuu ya kuwa mahiri haraka.'
          },
          {
            heading: 'Mfano wa Kwanza wa Vitendo',
            content: 'Jaribu mfano huu rahisi kuanza safari yako:',
            codeExample: {
              language: isPython ? 'python' : isJs ? 'javascript' : 'html',
              title: `Msimbo wa Kwanza wa ${course.title}`,
              code: isPython 
                ? `print("Karibu kwenye ${course.title}! 🚀")\nprint("Niko tayari kujifunza na kufanikiwa!")`
                : `<!DOCTYPE html>\n<html>\n<body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;padding:24px;">\n  <h2>Karibu kwenye ${course.title} 🚀</h2>\n  <p>Huu ni mwanzo wa mafunzo yako ya vitendo.</p>\n</body>\n</html>`
            }
          }
        ]
      },
      {
        id: 'ch2',
        title: '2. Mbinu na Kanuni Muhimu za Kuzingatia',
        duration: '20 min',
        summary: 'Kanuni za kitaalamu za kufanikisha kazi kwa weledi na viwango vya kimataifa.',
        sections: [
          {
            heading: 'Kuepuka Makosa ya Kawaida ya Wanaoanza',
            content: 'Wanafunzi wengi hufanya makosa ya kusoma tu bila kufanya mazoezi. Kwenye uandishi wa mifumo ya kompyuta, 90% ya maarifa hupatikana kwa kutatua changamoto halisi unapoandika msimbo.',
            tip: 'Ukipata hitilafu (error), soma ujumbe wa hitilafu kwa makini; karibu kila mara inakuelekeza mstari ulio na shida.'
          }
        ]
      }
    ]
  };
}
