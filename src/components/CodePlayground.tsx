import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Download, 
  Save, 
  Check, 
  Terminal, 
  Code2, 
  FileCode, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  FolderOpen,
  Zap,
  HelpCircle,
  X,
  Share2,
  MessageSquarePlus,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PlaygroundSnippet, AIErrExplanation } from '../types';

const BUILT_IN_TEMPLATES = [
  {
    id: 'tmpl-card',
    title: 'Modern Responsive Card (HTML/CSS)',
    language: 'html' as const,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #090d16;
      color: #f1f5f9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .profile-card {
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 24px;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      border: 3px solid #312e81;
    }
    h3 { margin: 0 0 4px; font-size: 20px; }
    p.title { color: #818cf8; font-size: 13px; font-weight: bold; margin-bottom: 12px; }
    p.bio { color: #94a3b8; font-size: 13px; line-height: 1.5; margin-bottom: 20px; }
    .btn {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: bold;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
    }
    .btn:hover { background: #4f46e5; transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="profile-card">
    <div class="avatar">👨‍💻</div>
    <h3>Juma Nassor</h3>
    <p class="title">Full-Stack Web Developer</p>
    <p class="bio">Kujifunza uandishi wa kodi kwa vitendo na kujenga mifumo thabiti ya teknolojia Tanzania.</p>
    <button class="btn" onclick="alert('Habari Juma!')">Wasiliana Nami</button>
  </div>
</body>
</html>`
  },
  {
    id: 'tmpl-todo',
    title: 'Interactive Todo App (HTML/JS)',
    language: 'html' as const,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; padding: 20px; display: flex; justify-content: center; }
    .todo-box { background: #1e293b; padding: 24px; border-radius: 16px; width: 100%; max-width: 360px; border: 1px solid #334155; }
    input { width: 70%; padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; }
    button.add { padding: 10px 14px; background: #10b981; border: none; color: white; border-radius: 8px; font-weight: bold; cursor: pointer; }
    ul { list-style: none; padding: 0; margin-top: 16px; }
    li { background: #334155; padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    button.del { background: #ef4444; border: none; color: white; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="todo-box">
    <h3>Orodha ya Kazi 📝</h3>
    <div style="display:flex; gap:8px;">
      <input id="taskInput" placeholder="Kazi mpya..." />
      <button class="add" onclick="addTask()">Ongeza</button>
    </div>
    <ul id="taskList">
      <li><span>Jifunze Python</span> <button class="del" onclick="this.parentElement.remove()">Futa</button></li>
      <li><span>Tengeneza Tovuti</span> <button class="del" onclick="this.parentElement.remove()">Futa</button></li>
    </ul>
  </div>
  <script>
    function addTask() {
      const input = document.getElementById('taskInput');
      if (!input.value.trim()) return;
      const li = document.createElement('li');
      li.innerHTML = '<span>' + input.value + '</span> <button class="del" onclick="this.parentElement.remove()">Futa</button>';
      document.getElementById('taskList').appendChild(li);
      input.value = '';
    }
  </script>
</body>
</html>`
  },
  {
    id: 'tmpl-counter',
    title: 'Interactive Counter & State (JS)',
    language: 'html' as const,
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; background: #0b0f19; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .box { text-align: center; background: #1a2234; padding: 32px; border-radius: 20px; border: 1px solid #28354f; }
    .count { font-size: 54px; font-weight: 900; color: #38bdf8; margin: 16px 0; }
    .btn { padding: 12px 20px; border-radius: 10px; border: none; font-weight: bold; cursor: pointer; margin: 0 4px; font-size: 16px; }
    .btn-inc { background: #10b981; color: white; }
    .btn-dec { background: #f43f5e; color: white; }
    .btn-rst { background: #64748b; color: white; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Kaunta ya Kiswahili 🔢</h2>
    <div id="display" class="count">0</div>
    <div>
      <button class="btn btn-dec" onclick="update(-1)">- Punguza</button>
      <button class="btn btn-rst" onclick="reset()">Weka Upya</button>
      <button class="btn btn-inc" onclick="update(1)">+ Ongeza</button>
    </div>
  </div>
  <script>
    let c = 0;
    function update(v) {
      c += v;
      document.getElementById('display').innerText = c;
    }
    function reset() {
      c = 0;
      document.getElementById('display').innerText = 0;
    }
  </script>
</body>
</html>`
  },
  {
    id: 'tmpl-py-tax',
    title: 'Sales Tax & Currency Converter (Python)',
    language: 'python' as const,
    python: `# Kikokotoo cha Kodi na Pesa (Tanzania VAT & USD)
bei_bila_kodi = 50000 # TZS
vat_rate = 0.18 # 18% VAT ya Tanzania
usd_exchange_rate = 2650 # 1 USD = 2650 TZS

kodi_ya_vat = bei_bila_kodi * vat_rate
jumla_kamili = bei_bila_kodi + kodi_ya_vat
thamani_kwa_usd = jumla_kamili / usd_exchange_rate

print("=== RISITI YA BIDHAA YA TEKNOLOJIA ===")
print(f"Bei ya Asili: TZS {bei_bila_kodi:,.0f}")
print(f"Kodi ya Ongezeko la Thamani (VAT 18%): TZS {kodi_ya_vat:,.0f}")
print(f"Jumla ya Kulipwa: TZS {jumla_kamili:,.0f}")
print(f"Thamani kwa Dola ya Kimarekani: $ {thamani_kwa_usd:.2f} USD")
print("========================================")`
  },
  {
    id: 'tmpl-py-grades',
    title: 'Student Grade Evaluator (Python)',
    language: 'python' as const,
    python: `# Tathmini ya Matokeo ya Wanafunzi kwa Python
alama_za_mwanafunzi = [85, 92, 78, 64, 88, 95]
majina_ya_masomo = ["HTML/CSS", "JavaScript", "Python", "Databases", "Algorithms", "Git"]

print("Ripoti ya Masomo:")
jumla = sum(alama_za_mwanafunzi)
wastani = jumla / len(alama_za_mwanafunzi)

for somo, alama in zip(majina_ya_masomo, alama_za_mwanafunzi):
    if alama >= 80:
        daraja = "A (Bora Sana ⭐)"
    elif alama >= 70:
        daraja = "B (Nzuri Sana 👍)"
    elif alama >= 60:
        daraja = "C (Wastani Mwema)"
    else:
        daraja = "D (Inahitaji Mazoezi)"
    print(f"- {somo}: {alama}% -> {daraja}")

print("---------------------------------")
print(f"Wastani Mkuu: {wastani:.1f}%")
if wastani >= 75:
    print("Hongera! Mwanafunzi amehitimu kwa Ufaulu wa Juu! 🎓")`
  }
];

export const CodePlayground: React.FC<{ initialSnippet?: PlaygroundSnippet; onClose?: () => void }> = ({ initialSnippet, onClose }) => {
  const { lang, playgroundSnippets, savePlaygroundSnippet, explainCodeErrorWithAI, addQnAQuestion, siteSettings } = useApp();
  const appName = siteSettings?.siteName || 'Amourcodes';

  const [activeLang, setActiveLang] = useState<'html' | 'javascript' | 'python'>('html');
  const [code, setCode] = useState<string>(
    initialSnippet?.html || initialSnippet?.javascript || initialSnippet?.python || BUILT_IN_TEMPLATES[0].html
  );

  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [snippetTitle, setSnippetTitle] = useState(initialSnippet?.title || 'Programu Yangu Mpya');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // AI Error Explainer State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIErrExplanation | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Share to Q&A State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTitle, setShareTitle] = useState('');
  const [shareDetails, setShareDetails] = useState('');
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Run HTML/JS/CSS inside iframe
  const runWebCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);

    if (activeLang === 'python') {
      runPythonCode();
      return;
    }

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        // Intercept console.log inside the iframe
        const injectedScript = `
          <script>
            (function() {
              const oldLog = console.log;
              const oldErr = console.error;
              console.log = function(...args) {
                window.parent.postMessage({ type: 'CONSOLE_LOG', msg: args.join(' ') }, '*');
                oldLog.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'CONSOLE_ERR', msg: args.join(' ') }, '*');
                oldErr.apply(console, args);
              };
              window.onerror = function(msg, url, line) {
                window.parent.postMessage({ type: 'CONSOLE_ERR', msg: 'Error: ' + msg + ' (mstari ' + line + ')' }, '*');
              };
            })();
          </script>
        `;

        iframeDoc.open();
        iframeDoc.write(injectedScript + code);
        iframeDoc.close();
      }
    }
    setTimeout(() => setIsRunning(false), 300);
  };

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CONSOLE_LOG') {
        setConsoleOutput(prev => [...prev, `[LOG]: ${e.data.msg}`]);
      } else if (e.data?.type === 'CONSOLE_ERR') {
        setConsoleOutput(prev => [...prev, `[ERROR]: ${e.data.msg}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Run initial preview
  useEffect(() => {
    runWebCode();
  }, [activeLang]);

  // Client-Side Python Runner (Simulated + JS eval bridge)
  const runPythonCode = () => {
    setConsoleOutput([]);
    setConsoleOutput(prev => [...prev, '>>> Inatekeleza Python 3.12 Runtime...']);

    try {
      const lines = code.split('\n');
      const outputs: string[] = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) return;

        // Simulate Python print statements
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const content = trimmed.slice(6, -1);
          if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
            outputs.push(content.slice(1, -1));
          } else if (content.startsWith('f"') || content.startsWith("f'")) {
            outputs.push(content.slice(2, -1));
          } else {
            try {
              // Basic arithmetic evaluation
              const evalMath = Function(`return (${content})`)();
              outputs.push(String(evalMath));
            } catch {
              outputs.push(content);
            }
          }
        }
      });

      if (outputs.length === 0) {
        outputs.push('Msimbo umekamilika bila makosa (No output).');
      }

      setConsoleOutput(prev => [...prev, ...outputs.map(o => `>>> ${o}`)]);
    } catch (err: any) {
      setConsoleOutput(prev => [...prev, `[Python Error]: ${err.message}`]);
    }
    setIsRunning(false);
  };

  // AI Error Explainer & Bug Fixer
  const handleAskAIErrorFixer = async () => {
    setAiAnalyzing(true);
    setShowAiModal(true);
    const lastErr = consoleOutput.filter(c => c.includes('[ERROR]') || c.includes('[Python Error]')).join('\n') || 'Kagua uboreshaji na usahihi wa kodi hii';
    const explanation = await explainCodeErrorWithAI(code, lastErr, activeLang);
    setAiResult(explanation);
    setAiAnalyzing(false);
  };

  const handleApplyFix = () => {
    if (aiResult?.fixedCode) {
      setCode(aiResult.fixedCode);
      setShowAiModal(false);
      setTimeout(() => runWebCode(), 100);
    }
  };

  const handleSaveSnippet = () => {
    const newSnippet: PlaygroundSnippet = {
      id: initialSnippet?.id || 'snip-' + Date.now(),
      title: snippetTitle,
      language: activeLang,
      html: activeLang === 'html' ? code : '',
      javascript: activeLang === 'javascript' ? code : '',
      python: activeLang === 'python' ? code : '',
      updatedAt: Date.now()
    };
    savePlaygroundSnippet(newSnippet);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const ext = activeLang === 'python' ? 'py' : activeLang === 'javascript' ? 'js' : 'html';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippetTitle.replace(/\s+/g, '_')}.${ext}`;
    a.click();
  };

  const loadTemplate = (tmpl: any) => {
    setActiveLang(tmpl.language);
    if (tmpl.language === 'python') {
      setCode(tmpl.python || '');
    } else if (tmpl.language === 'javascript') {
      setCode(tmpl.javascript || tmpl.html || '');
    } else {
      setCode(tmpl.html || '');
    }
    setSnippetTitle(tmpl.title);
    setShowTemplates(false);
  };

  const handleShareToQnA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTitle.trim()) return;
    setShareSubmitting(true);
    await addQnAQuestion({
      title: shareTitle.trim(),
      details: shareDetails.trim() || 'Hapa kuna msimbo wangu kutoka Sandbox/Playground:',
      codeSnippet: code
    });
    setShareSubmitting(false);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShowShareModal(false);
      setShareTitle('');
      setShareDetails('');
    }, 2000);
  };

  const allTemplates = [...BUILT_IN_TEMPLATES, ...playgroundSnippets.filter(s => !BUILT_IN_TEMPLATES.some(b => b.id === s.id))];

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10 page-anim">
      {/* Top Action Bar */}
      <div className="bg-card border border-theme rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <Code2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={snippetTitle}
                onChange={e => setSnippetTitle(e.target.value)}
                className="font-black text-base sm:text-lg text-text1 bg-transparent border-b border-dashed border-theme hover:border-primary focus:border-primary outline-none px-1"
              />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-theme text-text2 uppercase">
                {activeLang}
              </span>
            </div>
            <p className="text-xs text-text3">
              {lang === 'en' ? 'Live Interactive Coding Sandbox & Real-time Compiler' : 'Mhariri wa moja kwa moja wa kodi na matokeo papo hapo'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Switcher */}
          <div className="flex items-center bg-card2 border border-theme rounded-xl p-1">
            <button
              onClick={() => { setActiveLang('html'); }}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all", activeLang === 'html' ? "bg-primary text-white" : "text-text3 hover:text-text1")}
            >
              HTML/CSS/JS
            </button>
            <button
              onClick={() => { 
                setActiveLang('python');
                if (!code.includes('print(')) {
                  setCode(`# Python 3 Mazoezi ya Swahili\ndef salamu(jina):\n    return f"Habari ya leo {jina}!"\n\nprint(salamu("Mwanafunzi"))\n\nfor i in range(1, 6):\n    print(f"Hatua {i}")`);
                }
              }}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-bold transition-all", activeLang === 'python' ? "bg-amber-600 text-white" : "text-text3 hover:text-text1")}
            >
              Python 🐍
            </button>
          </div>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-9 px-3 bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FolderOpen size={14} />
            <span>{lang === 'en' ? 'Templates' : 'Mifano'}</span>
          </button>

          <button
            onClick={handleAskAIErrorFixer}
            className="h-9 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>AI Bug Explainer</span>
          </button>

          <button
            onClick={runWebCode}
            disabled={isRunning}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
          >
            <Play size={14} className="fill-white" />
            <span>{isRunning ? '...' : (lang === 'en' ? 'Run Code' : 'Tekeleza')}</span>
          </button>

          <button
            onClick={handleSaveSnippet}
            className="h-9 px-3 bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            {savedSuccess ? <Check size={14} className="text-emerald-500" /> : <Save size={14} />}
            <span>{savedSuccess ? (lang === 'en' ? 'Saved!' : 'Imehifadhiwa!') : (lang === 'en' ? 'Save' : 'Hifadhi')}</span>
          </button>

          <button
            onClick={() => {
              setShareTitle(`Swali kuhusu: ${snippetTitle}`);
              setShowShareModal(true);
            }}
            className="h-9 px-3 bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Tuma swali au msimbo huu kwenye Jukwaa la Q&A"
          >
            <Share2 size={14} className="text-primary" />
            <span className="hidden sm:inline">{lang === 'en' ? 'Ask in Q&A' : 'Tuma Jukwaani'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="h-9 w-9 bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 rounded-xl flex items-center justify-center"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Templates Drawer */}
      {showTemplates && (
        <div className="p-4 bg-card border border-theme rounded-2xl animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-text1 uppercase tracking-wider">{lang === 'en' ? 'Pre-built Starters & Code Examples' : 'Mifano Iliyotengenezwa Tayari'}</h4>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-text3 hover:text-text1">Funga</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {allTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl)}
                className="p-3 bg-card2 hover:border-primary border border-theme rounded-xl cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text1">{tmpl.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-theme text-text3 uppercase">{tmpl.language}</span>
                </div>
                <p className="text-[11px] text-text3 line-clamp-2">{(tmpl as any).desc || 'Bonyeza kufungua msimbo huu kwenye mhariri.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Pane Switcher (visible on small screens) */}
      <div className="flex lg:hidden items-center p-1 bg-card2 border border-theme rounded-2xl">
        <button
          onClick={() => setMobilePane('editor')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            mobilePane === 'editor' ? "bg-primary text-white shadow-xs" : "text-text2 hover:text-text1"
          )}
        >
          <Code2 size={14} />
          <span>{lang === 'en' ? 'Code Editor' : 'Msimbo (Code)'}</span>
        </button>
        <button
          onClick={() => { setMobilePane('preview'); runWebCode(); }}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
            mobilePane === 'preview' ? "bg-primary text-white shadow-xs" : "text-text2 hover:text-text1"
          )}
        >
          <Play size={14} />
          <span>{lang === 'en' ? 'Live Preview' : 'Matokeo (Preview)'}</span>
        </button>
      </div>

      {/* Main Sandbox Grid (Editor + Live Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[480px]">
        {/* LEFT: Code Editor Pane */}
        <div className={cn(
          "bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-lg",
          mobilePane === 'preview' ? "hidden lg:flex" : "flex"
        )}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
            <div className="flex items-center gap-2">
              <FileCode size={16} className="text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-300">
                {activeLang === 'python' ? 'main.py' : 'index.html'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Download size={12} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="w-full flex-1 min-h-[360px] bg-transparent text-slate-100 font-mono text-xs sm:text-sm p-2 outline-none resize-none leading-relaxed selection:bg-indigo-600/40"
            placeholder={lang === 'en' ? 'Write your code here...' : 'Andika kodi yako hapa...'}
          />

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{code.split('\n').length} mistari | {code.length} herufi</span>
            <span>Ctrl + Enter kutekeleza</span>
          </div>
        </div>

        {/* RIGHT: Live Preview & Terminal Pane */}
        <div className={cn(
          "flex flex-col gap-4",
          mobilePane === 'editor' ? "hidden lg:flex" : "flex"
        )}>
          {/* Web Preview Frame */}
          <div className="bg-card border border-theme rounded-3xl overflow-hidden flex flex-col flex-1 shadow-sm min-h-[280px]">
            <div className="bg-card2 border-b border-theme px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-bold text-text3 ml-2">
                  {activeLang === 'python' ? 'Python Terminal Output' : 'Live Web Output (DOM)'}
                </span>
              </div>

              <button
                onClick={runWebCode}
                className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Reload</span>
              </button>
            </div>

            {activeLang !== 'python' ? (
              <iframe
                ref={iframeRef}
                title="Live Sandbox Output"
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full flex-1 min-h-[260px] bg-white border-0"
              />
            ) : (
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs flex-1 min-h-[260px] overflow-y-auto space-y-1">
                {consoleOutput.length > 0 ? (
                  consoleOutput.map((log, idx) => (
                    <div key={idx} className={cn(log.includes('Error') ? "text-rose-400" : "text-emerald-400")}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic">Bonyeza "Tekeleza" kuona matokeo ya Python...</div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Console Logs Box */}
          {activeLang !== 'python' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs font-mono max-h-[140px] overflow-y-auto">
              <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold mb-1 border-b border-slate-900 pb-1">
                <span className="flex items-center gap-1"><Terminal size={12} /> Console Output</span>
                {consoleOutput.length > 0 && (
                  <button onClick={() => setConsoleOutput([])} className="hover:text-slate-300">Clear</button>
                )}
              </div>
              {consoleOutput.length > 0 ? (
                <div className="space-y-1">
                  {consoleOutput.map((log, idx) => (
                    <div key={idx} className={cn(log.includes('ERROR') ? "text-rose-400 font-bold" : "text-slate-300")}>
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-600 italic">Logs za JavaScript zitaonekana hapa...</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Error Explainer & Bug Fixer Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 page-anim">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{appName} AI Code Error Explainer</h3>
                  <p className="text-[10px] text-slate-400">Utatuzi na maelezo ya kina ya Kiswahili</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center">
                <X size={15} />
              </button>
            </div>

            {aiAnalyzing ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-bold">AI inachambua syntax, errors na kurekebisha msimbo wako...</p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-purple-300 uppercase tracking-wider block">Muhtasari wa Tatizo</span>
                  <p className="text-slate-200 leading-relaxed">{aiResult.summary}</p>
                </div>

                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">Chanzo cha Hitilafu (Root Cause)</span>
                  <p className="text-slate-200 leading-relaxed">{aiResult.rootCause}</p>
                </div>

                {aiResult.fixedCode && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Msimbo Uliorekebishwa (Fixed Code)</span>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[160px]">
                      {aiResult.fixedCode}
                    </pre>
                  </div>
                )}

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block mb-0.5">Somo Muhimu (Takeaway)</span>
                  <p className="text-slate-300">{aiResult.keyTakeaway}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleApplyFix}
                    className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 size={16} />
                    <span>Weka Msimbo Uliorekebishwa (Apply Fix)</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Share to Q&A Forum Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-card border border-theme rounded-3xl p-6 shadow-2xl space-y-4 text-text1">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <MessageSquarePlus size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-text1">
                    {lang === 'en' ? 'Post Code to Q&A Forum' : 'Tuma Msimbo Kwenye Jukwaa la Q&A'}
                  </h4>
                  <p className="text-[11px] text-text3">
                    {lang === 'en' ? 'Ask the community or mentors for help or feedback' : 'Uliza wanafunzi wenzako na walimu wakusaidie'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl hover:bg-card2 text-text3 hover:text-text1"
              >
                <X size={16} />
              </button>
            </div>

            {shareSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-emerald-400">
                  {lang === 'en' ? 'Question posted successfully to Q&A forum!' : 'Swali lako limetumwa kikamilifu kwenye jukwaa!'}
                </div>
                <p className="text-xs text-text3">
                  {lang === 'en' ? 'Community members can now review your code and answer.' : 'Wajumbe wa jukwaa wanaweza kusoma msimbo na kukujibu sasa.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleShareToQnA} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text2">
                    {lang === 'en' ? 'Question Title' : 'Kichwa cha Swali'}
                  </label>
                  <input
                    type="text"
                    required
                    value={shareTitle}
                    onChange={e => setShareTitle(e.target.value)}
                    placeholder="mf. Kwa nini kaunta hii haiongezeki ninapobonyeza?"
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs text-text1 focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-text2">
                    {lang === 'en' ? 'Detailed Explanation' : 'Maelezo Zaidi / Nini Kinafanyika'}
                  </label>
                  <textarea
                    rows={3}
                    value={shareDetails}
                    onChange={e => setShareDetails(e.target.value)}
                    placeholder="Eleza kwa kifupi tatizo unalokumbana nalo au nini ungependa kurekebishwa..."
                    className="w-full p-3 bg-card2 border border-theme rounded-xl text-xs text-text1 focus:border-primary outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text3">Msimbo Utakaoambatanishwa ({activeLang}):</span>
                    <span className="font-mono text-[10px] text-text3">{code.length} characters</span>
                  </div>
                  <pre className="p-2.5 bg-slate-950 border border-theme/60 rounded-xl font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto">
                    {code.slice(0, 300)}...
                  </pre>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 h-11 bg-card2 hover:bg-theme border border-theme text-text2 font-bold rounded-xl text-xs"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    disabled={shareSubmitting || !shareTitle.trim()}
                    className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send size={14} />
                    <span>{shareSubmitting ? 'Inatuma...' : 'Tuma Jukwaani'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
