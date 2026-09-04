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
  Send,
  Undo2,
  Redo2,
  FolderPlus,
  FilePlus,
  Smartphone,
  Crown,
  Bell,
  PanelLeft,
  ChevronRight,
  Folder,
  ArrowLeft,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PlaygroundSnippet, AIErrExplanation, ApkBuildConfig, UserSubscriptionPlan } from '../types';
import { BuildApkModal } from './sandbox/BuildApkModal';
import { BuildConsoleModal } from './sandbox/BuildConsoleModal';
import { AppSimulatorModal } from './sandbox/AppSimulatorModal';
import { PushNotificationDashboardModal } from './sandbox/PushNotificationDashboardModal';
import { SubscriptionPlansModal } from './sandbox/SubscriptionPlansModal';

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
    <div class="avatar">🌸</div>
    <h3>Flowers App Studio</h3>
    <p class="title">Mobile Ready Application</p>
    <p class="bio">Tengeneza tovuti yako na uibadilishe papo hapo kuwa Android APK App!</p>
    <button class="btn" onclick="alert('Hongera! App yako inafanya kazi kikamilifu!')">Gusa Hapa (Click Me)</button>
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
    input { width: 65%; padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; }
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
      <li><span>Tengeneza APK App</span> <button class="del" onclick="this.parentElement.remove()">Futa</button></li>
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
    .count { font-size: 64px; font-weight: 900; color: #60a5fa; margin: 16px 0; }
    .btn-group { display: flex; gap: 12px; justify-content: center; }
    button { padding: 12px 24px; font-size: 18px; font-weight: bold; border-radius: 12px; border: none; cursor: pointer; }
    .inc { background: #3b82f6; color: white; }
    .dec { background: #ef4444; color: white; }
    .res { background: #475569; color: white; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Kaunta ya Kisasa ⏱️</h2>
    <div id="val" class="count">0</div>
    <div class="btn-group">
      <button class="dec" onclick="update(-1)">- 1</button>
      <button class="res" onclick="update(0)">Sifuri</button>
      <button class="inc" onclick="update(1)">+ 1</button>
    </div>
  </div>
  <script>
    let c = 0;
    function update(d) {
      if (d === 0) c = 0;
      else c += d;
      document.getElementById('val').innerText = c;
    }
  </script>
</body>
</html>`
  },
  {
    id: 'tmpl-py-grade',
    title: 'Python: Mfumo wa Ripoti ya Matokeo',
    language: 'python' as const,
    python: `# Mfumo wa Kuhesabu Madaraja na Wastani wa Wanafunzi
majina_ya_masomo = ["Hisabati", "Sayansi", "Kiswahili", "Kiingereza", "TEHAMA"]
alama_za_mwanafunzi = [85, 78, 92, 64, 88]

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

const KEYBOARD_HELPERS = ['Tab', '<', '>', '/', '"', "'", '=', '{', '}', '(', ')', ';', ':', '!', '#', '$', '%'];

export const CodePlayground: React.FC<{ initialSnippet?: PlaygroundSnippet; onClose?: () => void }> = ({ initialSnippet, onClose }) => {
  const { lang, playgroundSnippets, savePlaygroundSnippet, explainCodeErrorWithAI, addQnAQuestion, siteSettings } = useApp();
  const appName = siteSettings?.siteName || 'Amourcodes';
  
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Project & Files State
  const [projectName, setProjectName] = useState('Flowers');
  const [snippetTitle, setSnippetTitle] = useState(initialSnippet?.title || 'Flowers');
  const [showExplorer, setShowExplorer] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileFilesDrawer, setShowMobileFilesDrawer] = useState(false);
  const [showConsoleDrawer, setShowConsoleDrawer] = useState(false);

  // Virtual Files inside Project
  const [files, setFiles] = useState<{ [filename: string]: string }>({
    'index.html': initialSnippet?.html || BUILT_IN_TEMPLATES[0].html,
    'style.css': `/* Custom App Styles */
body {
  margin: 0;
  padding: 0;
}`,
    'script.js': `// Custom App JavaScript
console.log("App loaded ready!");`,
    'main.py': `# Python script
def jambo(jina):
    return f"Habari, {jina}!"
print(jambo("Mtumiaji"))`
  });

  const [activeFile, setActiveFile] = useState<string>('index.html');
  const [activeLang, setActiveLang] = useState<'html' | 'javascript' | 'python'>('html');
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

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

  // App / APK Builder Modals
  const [showBuildApkModal, setShowBuildApkModal] = useState(false);
  const [showBuildConsole, setShowBuildConsole] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [requiredPlanFeature, setRequiredPlanFeature] = useState<string | undefined>(undefined);

  // Active Plan
  const [activePlan, setActivePlan] = useState<UserSubscriptionPlan>(() => {
    try {
      const saved = localStorage.getItem('wevlo_subscription_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { planType: 'platinum', expiresAt: Date.now() + 89 * 86400000, isActive: true };
  });

  // Current Build Config
  const [buildConfig, setBuildConfig] = useState<ApkBuildConfig>({
    appName: 'Flowers',
    packageName: 'com.flowers.app',
    versionName: '1.0',
    versionCode: 1,
    appSource: 'projects',
    selectedProject: 'Flowers',
    statusBarColor: '#2563eb',
    splashScreenColor: '#0f172a',
    appIconEmoji: '🌸',
    appIconBg: '#6366f1',
    hideTitleBar: false,
    loadingSpinner: true,
    fullscreen: false,
    exitConfirmation: true,
    pullToRefresh: true,
    pinchZoom: false,
    mediaAutoplay: true,
    pcMode: false,
    longPressMenu: false,
    cameraAccess: false,
    microphone: false,
    darkModeSupport: true,
    aes256Encryption: true,
    pushNotificationsFCM: true,
    pushNotificationPassword: 'password123',
    admobAds: false
  });

  // Simulated Live Push Notification Banner (Screenshot 45)
  const [livePushNotification, setLivePushNotification] = useState<{ title: string; message: string; icon?: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentCode = files[activeFile] || '';

  const handleCodeChange = (newCode: string) => {
    setUndoStack(prev => [...prev.slice(-30), currentCode]);
    setRedoStack([]);
    setFiles(prev => ({
      ...prev,
      [activeFile]: newCode
    }));
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [currentCode, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    setFiles(prev => ({
      ...prev,
      [activeFile]: previous
    }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setUndoStack(prev => [...prev, currentCode]);
    setRedoStack(prev => prev.slice(1));
    setFiles(prev => ({
      ...prev,
      [activeFile]: next
    }));
  };

  // Insert character from accessory keyboard helper
  const handleInsertHelper = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const toInsert = char === 'Tab' ? '  ' : char;
    const newText = currentCode.substring(0, start) + toInsert + currentCode.substring(end);
    
    handleCodeChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + toInsert.length, start + toInsert.length);
    }, 10);
  };

  // Switch active file
  const handleSelectFile = (fileKey: string) => {
    setActiveFile(fileKey);
    if (fileKey.endsWith('.py')) setActiveLang('python');
    else if (fileKey.endsWith('.js')) setActiveLang('javascript');
    else setActiveLang('html');
  };

  // Create new file
  const handleAddFile = () => {
    const name = prompt(lang === 'en' ? 'Enter new filename (e.g., app.js or view.html):' : 'Ingiza jina la faili jipya (mf. app.js au view.html):');
    if (!name) return;
    const cleanName = name.trim();
    if (files[cleanName]) {
      alert(lang === 'en' ? 'File already exists!' : 'Faili hili tayari lipo!');
      return;
    }
    setFiles(prev => ({
      ...prev,
      [cleanName]: `/* ${cleanName} */\n`
    }));
    setActiveFile(cleanName);
    showToast(`Faili "${cleanName}" limeundwa!`);
  };

  const handleDeleteFile = (fileName: string) => {
    if (fileName === 'index.html') {
      alert(lang === 'en' ? 'Cannot delete index.html!' : 'Huwezi kufuta faili kuu la index.html!');
      return;
    }
    if (confirm(lang === 'en' ? `Are you sure you want to delete "${fileName}"?` : `Una uhakika unataka kufuta "${fileName}"?`)) {
      setFiles(prev => {
        const copy = { ...prev };
        delete copy[fileName];
        return copy;
      });
      if (activeFile === fileName) {
        setActiveFile('index.html');
        setActiveLang('html');
      }
      showToast(lang === 'en' ? 'File deleted!' : 'Faili limefutwa!');
    }
  };

  // Build merged HTML from files
  const getCompiledHtml = () => {
    let baseHtml = files['index.html'] || '<!DOCTYPE html><html><body></body></html>';
    
    // Inject style.css if not already referenced
    if (files['style.css'] && !baseHtml.includes('style.css')) {
      baseHtml = baseHtml.replace('</head>', `<style>\n${files['style.css']}\n</style></head>`);
    }

    // Inject script.js if not already referenced
    if (files['script.js'] && !baseHtml.includes('script.js')) {
      baseHtml = baseHtml.replace('</body>', `<script>\n${files['script.js']}\n</script></body>`);
    }

    return baseHtml;
  };

  // Run HTML/JS/CSS inside iframe
  const runWebCode = () => {
    setIsRunning(true);
    setConsoleOutput([]);

    if (activeFile.endsWith('.py')) {
      runPythonCode();
      return;
    }

    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
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
        iframeDoc.write(injectedScript + getCompiledHtml());
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
    const timer = setTimeout(() => {
      runWebCode();
    }, 400);
    return () => clearTimeout(timer);
  }, [activeFile]);

  // Client-side Python runner
  const runPythonCode = () => {
    const pyCode = files['main.py'] || currentCode;
    const lines = pyCode.split('\n');
    const outputs: string[] = [];

    try {
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
          const content = trimmed.substring(6, trimmed.length - 1);
          if (content.startsWith('f"') || content.startsWith("f'")) {
            outputs.push(content.slice(2, -1));
          } else if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
            outputs.push(content.slice(1, -1));
          } else {
            try {
              const evaluated = Function(`"use strict"; return (${content})`)();
              outputs.push(String(evaluated));
            } catch (e) {
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
    const explanation = await explainCodeErrorWithAI(currentCode, lastErr, activeLang);
    setAiResult(explanation);
    setAiAnalyzing(false);
  };

  const handleApplyFix = () => {
    if (aiResult?.fixedCode) {
      handleCodeChange(aiResult.fixedCode);
      setShowAiModal(false);
      setTimeout(() => runWebCode(), 100);
    }
  };

  const handleSaveSnippet = () => {
    const newSnippet: PlaygroundSnippet = {
      id: initialSnippet?.id || 'snip-' + Date.now(),
      title: snippetTitle,
      language: activeLang,
      html: files['index.html'],
      javascript: files['script.js'],
      python: files['main.py'],
      updatedAt: Date.now()
    };
    savePlaygroundSnippet(newSnippet);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    showToast(lang === 'en' ? 'Project saved successfully!' : 'Mradi umehifadhiwa kikamilifu!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Msimbo umenakiliwa!');
  };

  const handleDownloadFile = () => {
    const ext = activeFile.split('.').pop() || 'html';
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (tmpl: any) => {
    setActiveLang(tmpl.language);
    if (tmpl.language === 'python') {
      setFiles(prev => ({ ...prev, 'main.py': tmpl.python || '' }));
      setActiveFile('main.py');
    } else {
      setFiles(prev => ({ ...prev, 'index.html': tmpl.html || '' }));
      setActiveFile('index.html');
    }
    setSnippetTitle(tmpl.title);
    setShowTemplates(false);
    setTimeout(() => runWebCode(), 100);
  };

  const handleShareToQnA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTitle.trim()) return;
    setShareSubmitting(true);
    await addQnAQuestion({
      title: shareTitle.trim(),
      details: shareDetails.trim() || 'Hapa kuna msimbo wangu kutoka Sandbox/Playground:',
      codeSnippet: currentCode
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

  // When user clicks Build APK button
  const handleOpenBuildApk = () => {
    setBuildConfig(prev => ({
      ...prev,
      appName: snippetTitle || 'Flowers',
      packageName: `com.${(snippetTitle || 'flowers').toLowerCase().replace(/[^a-z0-9]/g, '')}.app`,
      selectedProject: projectName
    }));
    setShowBuildApkModal(true);
  };

  // When user clicks Start Build in BuildApkModal
  const handleStartBuildFromModal = (config: ApkBuildConfig) => {
    setBuildConfig(config);
    setShowBuildApkModal(false);
    setShowBuildConsole(true);
  };

  // Push Notification dispatcher
  const handleTriggerLiveNotification = (payload: { title: string; message: string; icon?: string }) => {
    setLivePushNotification(payload);
    // Auto dismiss after 8 seconds
    setTimeout(() => {
      setLivePushNotification(null);
    }, 8000);
  };

  const allTemplates = [...BUILT_IN_TEMPLATES, ...playgroundSnippets.filter(s => !BUILT_IN_TEMPLATES.some(b => b.id === s.id))];

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative select-none">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-3">
          {toastMsg}
        </div>
      )}

      {/* Live Simulated Push Notification Banner */}
      {livePushNotification && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[400] w-[92%] max-w-md bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 rounded-2xl p-3 shadow-2xl animate-in slide-in-from-top-6 duration-300 text-white flex items-start gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 font-bold shadow-md"
            style={{ backgroundColor: buildConfig.statusBarColor || '#6366f1' }}
          >
            {livePushNotification.icon || buildConfig.appIconEmoji || '🌸'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white truncate">{livePushNotification.title}</span>
              <span className="text-[10px] text-indigo-400 font-mono">Arifa ya Simu</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-0.5">
              {livePushNotification.message}
            </p>
          </div>
          <button 
            onClick={() => setLivePushNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Action Bar (Compact, polished, edge-to-edge) */}
      <div className="h-13 sm:h-15 px-3 sm:px-5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20">
        
        {/* Left: Close/Back, App Icon, Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-all"
              title={lang === 'en' ? 'Close Playground' : 'Funga Mhariri'}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-600/20 shrink-0">
            {buildConfig.appIconEmoji || '🌸'}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={snippetTitle}
              onChange={e => {
                setSnippetTitle(e.target.value);
                setProjectName(e.target.value);
              }}
              className="font-bold text-xs sm:text-sm text-white bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:border-amber-400 outline-none px-1 truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]"
              title="Bonyeza kubadili jina la mradi"
            />
            <span className="hidden sm:inline text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-800 text-indigo-400 border border-slate-700/80 uppercase shrink-0">
              {activeFile}
            </span>
          </div>
        </div>

        {/* Right: Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop File Explorer toggle */}
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={cn(
              "hidden lg:flex h-8 px-2.5 rounded-lg border text-xs font-semibold items-center gap-1.5 transition-all",
              showExplorer ? "bg-slate-800 border-indigo-500/50 text-indigo-400" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400"
            )}
            title="Badili Sidebar ya Faili"
          >
            <PanelLeft size={14} />
            <span>Files</span>
          </button>

          {/* Desktop Undo / Redo */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md transition-colors"
              title="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded-md transition-colors"
              title="Redo"
            >
              <Redo2 size={13} />
            </button>
          </div>

          {/* Desktop Save Button */}
          <button
            onClick={handleSaveSnippet}
            className="hidden sm:flex h-8 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold items-center gap-1.5 transition-all"
            title="Hifadhi Mradi"
          >
            {savedSuccess ? <Check size={13} className="text-emerald-400" /> : <Save size={13} className="text-emerald-400" />}
            <span>{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>

          {/* Run / Tekeleza button */}
          <button
            onClick={() => {
              runWebCode();
              if (window.innerWidth < 1024) setMobilePane('preview');
            }}
            disabled={isRunning}
            className="h-8 px-2.5 sm:px-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition-all shrink-0"
            title="Tekeleza Msimbo"
          >
            <Play size={12} className="fill-white" />
            <span>{isRunning ? '...' : (lang === 'en' ? 'Run' : 'Tekeleza')}</span>
          </button>

          {/* ⚡ PROMINENT BUILD APK BUTTON */}
          <button
            onClick={handleOpenBuildApk}
            className="h-8 px-2.5 sm:px-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 uppercase tracking-wide transition-all shrink-0"
            title="Convert code to Android APK"
          >
            <Zap size={13} className="fill-slate-950 text-slate-950" />
            <span className="hidden xs:inline">{lang === 'en' ? 'Build APK' : 'Badili Kuwa App'}</span>
            <span className="xs:hidden">APK</span>
          </button>

          {/* Mobile & Desktop More Menu Button (⋮) */}
          <button
            onClick={() => setShowMobileMenu(true)}
            className="h-8 w-8 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0"
            title="Zana Zaidi"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Pane Switcher: Code vs Preview (Sleek 38px bar) */}
      <div className="flex lg:hidden items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full max-w-[260px]">
          <button
            onClick={() => setMobilePane('editor')}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              mobilePane === 'editor' 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Code2 size={13} />
            <span>{lang === 'en' ? 'Code' : 'Msimbo'}</span>
          </button>
          <button
            onClick={() => { setMobilePane('preview'); runWebCode(); }}
            className={cn(
              "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              mobilePane === 'preview' 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-400 hover:text-white"
            )}
          >
            <Play size={13} />
            <span>{lang === 'en' ? 'Preview' : 'Matokeo'}</span>
          </button>
        </div>

        {/* Mobile Quick Utility Icons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setShowMobileFilesDrawer(true)}
            className="h-8 px-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
            title="Files Manager"
          >
            <Folder size={13} className="text-amber-400" />
            <span className="text-[11px] font-mono">{Object.keys(files).length}</span>
          </button>
          <button
            onClick={handleSaveSnippet}
            className="h-8 w-8 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg flex items-center justify-center"
            title="Save Project"
          >
            {savedSuccess ? <Check size={13} className="text-emerald-400" /> : <Save size={13} />}
          </button>
        </div>
      </div>

      {/* Main Workspace: 3-column / 2-column on desktop, full-screen tabs on mobile */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        
        {/* DESKTOP SIDEBAR: File Explorer */}
        {showExplorer && (
          <div className="hidden lg:flex w-64 border-r border-slate-800 bg-slate-950 p-3.5 flex-col justify-between shrink-0 text-slate-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen size={12} className="text-indigo-400" />
                  EXPLORER
                </span>
                <button 
                  onClick={handleAddFile}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
                  title="New File"
                >
                  <FilePlus size={14} />
                </button>
              </div>

              {/* Project Folder */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-indigo-400">
                  <ChevronRight size={13} />
                  <Folder size={14} className="fill-indigo-500/20" />
                  <span className="truncate">{projectName}</span>
                </div>

                {/* File items */}
                <div className="pl-4 space-y-0.5">
                  {Object.keys(files).map(fileName => {
                    const isSelected = activeFile === fileName;
                    return (
                      <div
                        key={fileName}
                        onClick={() => handleSelectFile(fileName)}
                        className={cn(
                          "group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all",
                          isSelected 
                            ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30" 
                            : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode size={13} className={fileName.endsWith('.html') ? "text-orange-400" : fileName.endsWith('.css') ? "text-blue-400" : fileName.endsWith('.py') ? "text-amber-400" : "text-yellow-400"} />
                          <span className="truncate">{fileName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1" />}
                          {fileName !== 'index.html' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(fileName);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                              title="Delete file"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-900 text-[11px] text-slate-500">
              {Object.keys(files).length} files in project
            </div>
          </div>
        )}

        {/* CENTER PANE: Code Editor */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 bg-slate-950 border-r border-slate-800/80",
          mobilePane === 'preview' ? "hidden lg:flex" : "flex"
        )}>
          {/* File Tabs Horizontal Strip */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            
            {/* Scrollable file tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {Object.keys(files).map(fileName => {
                const isSelected = activeFile === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => handleSelectFile(fileName)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 transition-all shrink-0",
                      isSelected 
                        ? "bg-slate-800 text-white border border-slate-700 shadow-xs" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    )}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      fileName.endsWith('.html') ? "bg-orange-400" : fileName.endsWith('.css') ? "bg-blue-400" : fileName.endsWith('.py') ? "bg-emerald-400" : "bg-yellow-400"
                    )} />
                    <span className="truncate max-w-[110px]">{fileName}</span>
                  </button>
                );
              })}

              <button
                onClick={handleAddFile}
                className="h-7 w-7 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                title="Add New File"
              >
                <FilePlus size={13} />
              </button>
            </div>

            {/* Quick Editor Actions (Copy, Export) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyCode}
                className="h-7 px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-all"
                title="Copy code"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="h-7 px-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md text-[11px] font-medium flex items-center gap-1 transition-all"
                title="Export current file"
              >
                <Download size={11} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Main Textarea */}
          <div className="flex-1 min-h-0 relative flex flex-col bg-slate-950">
            <textarea
              ref={textareaRef}
              value={currentCode}
              onChange={e => handleCodeChange(e.target.value)}
              spellCheck={false}
              className="w-full flex-1 min-h-0 bg-transparent text-slate-100 font-mono text-xs sm:text-sm p-3 sm:p-4 outline-none resize-none leading-relaxed selection:bg-indigo-600/40"
              placeholder={lang === 'en' ? 'Write your code here...' : 'Weka na andika kodi yako hapa...'}
            />
          </div>

          {/* Mobile Accessory Keyboard Bar */}
          <div className="bg-slate-900/90 border-t border-slate-800/80 px-2 py-1 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
              {KEYBOARD_HELPERS.map(helper => (
                <button
                  key={helper}
                  type="button"
                  onClick={() => handleInsertHelper(helper)}
                  className="h-8 min-w-[32px] px-2 bg-slate-800/90 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 hover:text-white rounded-md font-mono text-xs font-bold transition-colors shrink-0 flex items-center justify-center shadow-xs"
                >
                  {helper}
                </button>
              ))}
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-1 px-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{currentCode.split('\n').length} lines • {currentCode.length} chars</span>
              <span>UTF-8 • {activeFile}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Live Preview & Terminal Pane */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 bg-slate-950",
          mobilePane === 'editor' ? "hidden lg:flex" : "flex"
        )}>
          {/* Mini Browser Bar */}
          <div className="h-10 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="bg-slate-950 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 border border-slate-800 truncate max-w-[170px] sm:max-w-[240px]">
                {activeFile.endsWith('.py') ? 'python://main.py' : `https://${(snippetTitle || 'app').toLowerCase().replace(/[^a-z0-9]/g, '')}.app/live`}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setShowSimulator(true)}
                className="h-7 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Test in Android Phone Simulator"
              >
                <Smartphone size={12} />
                <span className="hidden sm:inline">Simulator</span>
              </button>
              <button
                onClick={runWebCode}
                className="h-7 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Reload Preview"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reload</span>
              </button>
              <button
                onClick={() => setShowConsoleDrawer(!showConsoleDrawer)}
                className={cn(
                  "h-7 px-2 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors",
                  showConsoleDrawer || consoleOutput.some(c => c.includes('ERROR')) 
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                )}
                title="Toggle Console Logs"
              >
                <Terminal size={12} />
                <span>Logs ({consoleOutput.length})</span>
              </button>
            </div>
          </div>

          {/* Iframe or Python Terminal Container */}
          <div className="flex-1 min-h-0 flex flex-col bg-slate-950 relative">
            {!activeFile.endsWith('.py') ? (
              <iframe
                ref={iframeRef}
                title="Live Sandbox Output"
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="w-full flex-1 min-h-0 bg-white border-0"
              />
            ) : (
              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs flex-1 min-h-0 overflow-y-auto space-y-1">
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

            {/* Bottom Console Drawer if active */}
            {showConsoleDrawer && !activeFile.endsWith('.py') && (
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 max-h-48 flex flex-col z-10 shadow-2xl">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 pb-1 mb-1 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 font-bold"><Terminal size={12} /> Console Output</span>
                  <div className="flex items-center gap-2">
                    {consoleOutput.length > 0 && (
                      <button onClick={() => setConsoleOutput([])} className="hover:text-white">Clear</button>
                    )}
                    <button onClick={() => setShowConsoleDrawer(false)} className="hover:text-white"><X size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {consoleOutput.length > 0 ? (
                    consoleOutput.map((log, idx) => (
                      <div key={idx} className={cn(log.includes('ERROR') ? "text-rose-400 font-bold" : "text-slate-300")}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-600 italic">Hakuna output ya console bado...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile File Explorer Drawer / Bottom Sheet */}
      {showMobileFilesDrawer && (
        <div className="fixed inset-0 z-[280] bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowMobileFilesDrawer(false)} />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 max-h-[80vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-indigo-400" />
                <h3 className="font-bold text-sm text-white">{lang === 'en' ? 'Project Files' : 'Faili za Mradi'}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">{Object.keys(files).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowMobileFilesDrawer(false);
                    handleAddFile();
                  }}
                  className="h-8 px-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <FilePlus size={13} />
                  <span>{lang === 'en' ? 'New File' : 'Faili Jipya'}</span>
                </button>
                <button
                  onClick={() => setShowMobileFilesDrawer(false)}
                  className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Files List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[50vh] pr-1">
              {Object.keys(files).map(fileName => {
                const isSelected = activeFile === fileName;
                return (
                  <div
                    key={fileName}
                    onClick={() => {
                      handleSelectFile(fileName);
                      setShowMobileFilesDrawer(false);
                    }}
                    className={cn(
                      "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all",
                      isSelected 
                        ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40" 
                        : "bg-slate-950/70 hover:bg-slate-800 text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCode size={16} className={fileName.endsWith('.html') ? "text-orange-400" : fileName.endsWith('.css') ? "text-blue-400" : fileName.endsWith('.py') ? "text-amber-400" : "text-yellow-400"} />
                      <span className="font-mono text-xs">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">Inatumika</span>}
                      {fileName !== 'index.html' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(fileName);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Futa faili"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile More Options Menu Bottom Sheet */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[280] bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowMobileMenu(false)} />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center font-bold text-sm text-white">
                  ⚡
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{snippetTitle || 'Flowers Studio'}</h3>
                  <p className="text-[11px] text-slate-400">Zana na Mipangilio ya Studio</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Featured Action: Convert to App */}
            <div 
              onClick={() => {
                setShowMobileMenu(false);
                handleOpenBuildApk();
              }}
              className="p-3.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
                  <Zap size={20} className="fill-slate-950" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
                    {lang === 'en' ? 'Convert to Android APK' : 'Badili Kuwa App ya Android (APK)'}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Tengeneza APK yako halisi tayari kwa simu
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-amber-400" />
            </div>

            {/* Section 1: Studio Actions */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                Mradi & Faili
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowMobileFilesDrawer(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Folder size={16} className="text-indigo-400 shrink-0" />
                  <span>Faili Zote ({Object.keys(files).length})</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleSaveSnippet();
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Save size={16} className="text-emerald-400 shrink-0" />
                  <span>Hifadhi Mradi</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowTemplates(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <FolderOpen size={16} className="text-blue-400 shrink-0" />
                  <span>Mifano (Templates)</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowSimulator(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Smartphone size={16} className="text-purple-400 shrink-0" />
                  <span>Phone Simulator</span>
                </button>
              </div>
            </div>

            {/* Section 2: Pro & Mobile Tools */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                Zana za App & Pro
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShowPushModal(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Bell size={16} className="text-amber-400 shrink-0" />
                  <span>Push Notifications</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setRequiredPlanFeature(undefined);
                    setShowPlansModal(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-amber-300 hover:border-slate-700"
                >
                  <Crown size={16} className="text-amber-400 shrink-0" />
                  <span>Vifurushi vya Pro</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleAskAIErrorFixer();
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Sparkles size={16} className="text-purple-400 shrink-0" />
                  <span>Mwalimu AI (Fix)</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    setShareTitle(`Swali kuhusu: ${snippetTitle}`);
                    setShowShareModal(true);
                  }}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2.5 text-left text-xs font-semibold text-slate-200 hover:border-slate-700"
                >
                  <Share2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Uliza Jumuiya (Q&A)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Drawer */}
      {showTemplates && (
        <div className="fixed inset-0 z-[290] bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setShowTemplates(false)} />
          <div className="relative bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">{lang === 'en' ? 'Pre-built Starters & Code Examples' : 'Mifano Iliyotengenezwa Tayari'}</h4>
              <button onClick={() => setShowTemplates(false)} className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    loadTemplate(tmpl);
                    setShowTemplates(false);
                  }}
                  className="p-3.5 bg-slate-950 hover:border-indigo-500/50 border border-slate-800 rounded-xl cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{tmpl.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">{tmpl.language}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{(tmpl as any).desc || 'Bonyeza kufungua msimbo huu kwenye mhariri.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* 1. BUILD APK CONFIGURATION MODAL */}
      {showBuildApkModal && (
        <BuildApkModal
          initialAppName={snippetTitle}
          onClose={() => setShowBuildApkModal(false)}
          onStartBuild={handleStartBuildFromModal}
          onOpenPlans={(feature) => {
            setRequiredPlanFeature(feature);
            setShowPlansModal(true);
          }}
          activePlan={activePlan}
        />
      )}

      {/* 2. BUILD CONSOLE MODAL (Live Streaming Logs & APK Download) */}
      {showBuildConsole && (
        <BuildConsoleModal
          config={buildConfig}
          htmlContent={getCompiledHtml()}
          onClose={() => setShowBuildConsole(false)}
          onTestInSimulator={() => {
            setShowBuildConsole(false);
            setShowSimulator(true);
          }}
        />
      )}

      {/* 3. APP SIMULATOR MODAL (Phone frame runner) */}
      {showSimulator && (
        <AppSimulatorModal
          config={buildConfig}
          htmlContent={getCompiledHtml()}
          onClose={() => setShowSimulator(false)}
          activeNotification={livePushNotification}
          onDismissNotification={() => setLivePushNotification(null)}
        />
      )}

      {/* 4. PUSH NOTIFICATIONS CONSOLE MODAL */}
      {showPushModal && (
        <PushNotificationDashboardModal
          config={buildConfig}
          onClose={() => setShowPushModal(false)}
          onSendNotification={handleTriggerLiveNotification}
        />
      )}

      {/* 5. SUBSCRIPTION PLANS MODAL */}
      {showPlansModal && (
        <SubscriptionPlansModal
          onClose={() => setShowPlansModal(false)}
          requiredFeature={requiredPlanFeature}
          onActivated={() => {
            setActivePlan({
              planType: 'platinum',
              expiresAt: Date.now() + 60 * 86400000,
              isActive: true
            });
            setShowPlansModal(false);
          }}
        />
      )}

      {/* 6. AI Error Explainer & Bug Fixer Modal */}
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

      {/* 7. Share to Q&A Forum Modal */}
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
                    <span className="font-mono text-[10px] text-text3">{currentCode.length} characters</span>
                  </div>
                  <pre className="p-2.5 bg-slate-950 border border-theme/60 rounded-xl font-mono text-[10px] text-slate-300 max-h-24 overflow-y-auto">
                    {currentCode.slice(0, 300)}...
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
