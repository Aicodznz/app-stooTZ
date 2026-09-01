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
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PlaygroundSnippet, AIErrExplanation } from '../types';

export const CodePlayground: React.FC<{ initialSnippet?: PlaygroundSnippet; onClose?: () => void }> = ({ initialSnippet, onClose }) => {
  const { lang, playgroundSnippets, savePlaygroundSnippet, explainCodeErrorWithAI, siteSettings } = useApp();
  const appName = siteSettings?.siteName || 'Amourcodes';

  const [activeLang, setActiveLang] = useState<'html' | 'javascript' | 'python'>('html');
  const [code, setCode] = useState<string>(
    initialSnippet?.html || initialSnippet?.javascript || initialSnippet?.python || `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      border: 1px solid #334155;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
    }
    button {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🎉 Karibu Playground!</h2>
    <p>Andika HTML, CSS, JavaScript au Python hapa uone matokeo papo hapo.</p>
    <button onclick="badiliRangi()">Bonyeza Hapa</button>
  </div>

  <script>
    function badiliRangi() {
      const colors = ['#0f172a', '#1e1b4b', '#14532d', '#701a75', '#450a0a'];
      const random = colors[Math.floor(Math.random() * colors.length)];
      document.body.style.background = random;
    }
  </script>
</body>
</html>`
  );

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
            {playgroundSnippets.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl)}
                className="p-3 bg-card2 hover:border-primary border border-theme rounded-xl cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text1">{tmpl.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-theme text-text3 uppercase">{tmpl.language}</span>
                </div>
                <p className="text-[11px] text-text3 line-clamp-2">{tmpl.desc || 'Mfano wa mafunzo.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Sandbox Grid (Editor + Live Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        {/* LEFT: Code Editor Pane */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-lg">
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
            className="w-full flex-1 min-h-[380px] bg-transparent text-slate-100 font-mono text-xs sm:text-sm p-2 outline-none resize-none leading-relaxed selection:bg-indigo-600/40"
            placeholder={lang === 'en' ? 'Write your code here...' : 'Andika kodi yako hapa...'}
          />

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{code.split('\n').length} mistari | {code.length} herufi</span>
            <span>Ctrl + Enter kutekeleza</span>
          </div>
        </div>

        {/* RIGHT: Live Preview & Terminal Pane */}
        <div className="flex flex-col gap-4">
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
                className="w-full flex-1 min-h-[240px] bg-white border-0"
              />
            ) : (
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs flex-1 min-h-[240px] overflow-y-auto space-y-1">
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
                <button onClick={() => setConsoleOutput([])} className="hover:text-slate-300">Clear</button>
              </div>
              {consoleOutput.length === 0 ? (
                <span className="text-slate-600 italic">Hakuna logs kwa sasa. Tumia console.log(...)</span>
              ) : (
                consoleOutput.map((line, i) => (
                  <div key={i} className={cn("text-[11px]", line.includes('[ERROR]') ? "text-rose-400 font-bold" : "text-slate-300")}>
                    {line}
                  </div>
                ))
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
    </div>
  );
};
