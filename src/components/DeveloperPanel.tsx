import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db, auth, ADMIN_EMAIL } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  Terminal, 
  Database, 
  CreditCard, 
  UserCheck, 
  Cpu, 
  RefreshCw, 
  Play, 
  Trash2, 
  Download, 
  Upload, 
  Check, 
  Copy, 
  AlertTriangle, 
  Send, 
  Zap, 
  Shield, 
  Unlock, 
  Lock, 
  Code2, 
  HardDrive, 
  Radio, 
  Search,
  Plus,
  Eye,
  FileCode,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { 
  SEED_COURSES, 
  SEED_TESTS, 
  SEED_LECTURES, 
  SEED_APPS, 
  SEED_BANNERS, 
  SEED_ORDERS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS
} from '../constants';
import { ContentItem, CodApp, Banner, Order, AppNotification } from '../types';

type DevTab = 'simulator' | 'database' | 'payments' | 'console' | 'storage';

export const DeveloperPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { 
    user, 
    profile, 
    isAdm, 
    lang, 
    courses, 
    tests, 
    lectures, 
    apps, 
    banners, 
    orders, 
    users, 
    notifications,
    lib, 
    pts, 
    strk,
    updateCourses, 
    updateTests, 
    updateLectures, 
    updateApps, 
    updateBanners,
    addPoints,
    createOrder,
    approveOrder,
    giveUserAccess
  } = useApp();

  const [activeTab, setActiveTab] = useState<DevTab>('simulator');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Database Tab State
  const [selectedCollection, setSelectedCollection] = useState<'courses' | 'tests' | 'lectures' | 'apps' | 'banners' | 'orders' | 'users' | 'notifications'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [isEditingJson, setIsEditingJson] = useState(false);

  // Payment Simulator State
  const [simProvider, setSimProvider] = useState<'mpesa' | 'tigopesa' | 'airtel' | 'halopesa'>('mpesa');
  const [simPhone, setSimPhone] = useState('0712345678');
  const [simAmount, setSimAmount] = useState('15000');
  const [simSelectedItems, setSimSelectedItems] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState<string[]>([]);

  // Code Console State
  const [codeSnippet, setCodeSnippet] = useState(`// Dev Sandbox: Execute JavaScript / Context Inspector\nconst allItems = [...courses, ...tests, ...lectures];\nreturn {\n  totalCourses: courses.length,\n  totalTests: tests.length,\n  totalLectures: lectures.length,\n  currentUser: user ? user.email : 'Guest',\n  userPoints: pts,\n  libraryItemsCount: Object.keys(lib).length\n};`);
  const [consoleResult, setConsoleResult] = useState<string | null>(null);
  const [consoleError, setConsoleError] = useState<string | null>(null);

  // Quick Notification Dispatcher
  const [notifTitle, setNotifTitle] = useState('Mfumo wa Developer');
  const [notifMsg, setNotifMsg] = useState('Ujumbe wa majaribio kutoka kwa Developer Panel!');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'alert'>('success');

  // Storage Inspector State
  const [storageKeys, setStorageKeys] = useState<{ key: string; size: string; val: string }[]>([]);

  const showStatus = (text: string, type: 'ok' | 'err' = 'ok') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const refreshStorageKeys = () => {
    const keys: { key: string; size: string; val: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        keys.push({
          key,
          size: `${(new Blob([val]).size / 1024).toFixed(2)} KB`,
          val
        });
      }
    }
    setStorageKeys(keys);
  };

  useEffect(() => {
    refreshStorageKeys();
  }, []);

  // Quick Simulator Handlers
  const handleUnlockAll = () => {
    const all = [...courses, ...tests, ...lectures];
    const unlocked: Record<string, boolean> = {};
    all.forEach(item => {
      unlocked[item.id] = true;
    });
    localStorage.setItem('czp_local_lib', JSON.stringify(unlocked));
    window.location.reload();
  };

  const handleResetLibrary = () => {
    localStorage.setItem('czp_local_lib', JSON.stringify({}));
    window.location.reload();
  };

  const handleBoostXP = (amount: number) => {
    addPoints(amount);
    const newPts = (pts || 0) + amount;
    localStorage.setItem('czp_pts', newPts.toString());
    showStatus(`Umeongeza +${amount} XP pointi!`);
  };

  // Seed Data Handlers
  const handleSeedAllToLocalStorage = () => {
    localStorage.setItem('czp_courses', JSON.stringify(SEED_COURSES));
    localStorage.setItem('czp_tests', JSON.stringify(SEED_TESTS));
    localStorage.setItem('czp_lectures', JSON.stringify(SEED_LECTURES));
    localStorage.setItem('czp_apps', JSON.stringify(SEED_APPS));
    localStorage.setItem('czp_banners', JSON.stringify(SEED_BANNERS));
    localStorage.setItem('czp_orders', JSON.stringify(SEED_ORDERS));
    localStorage.setItem('czp_reviews', JSON.stringify(SEED_REVIEWS));
    localStorage.setItem('czp_notifications', JSON.stringify(SEED_NOTIFICATIONS));
    showStatus('Data zote za mfumo (Seed Data) zimehifadhiwa upya!');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleSeedToFirestore = async () => {
    try {
      showStatus('Inatuma seed data kwenda Firestore...');
      const batch = writeBatch(db);
      
      SEED_COURSES.forEach(c => {
        batch.set(doc(db, 'courses', c.id), c);
      });
      SEED_TESTS.forEach(t => {
        batch.set(doc(db, 'tests', t.id), t);
      });
      SEED_LECTURES.forEach(l => {
        batch.set(doc(db, 'lectures', l.id), l);
      });
      SEED_APPS.forEach(a => {
        batch.set(doc(db, 'apps', a.id), a);
      });
      SEED_BANNERS.forEach(b => {
        batch.set(doc(db, 'banners', b.id), b);
      });

      await batch.commit();
      showStatus('Seed data zimehifadhiwa Firestore kikamilifu!');
    } catch (err: any) {
      showStatus('Hitilafu ya Firestore: ' + err.message, 'err');
    }
  };

  // Payment Webhook Simulator
  const handleSimulatePayment = async () => {
    if (!simAmount || isSimulating) return;
    setIsSimulating(true);
    const ref = `SIM-${simProvider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setSimLog(prev => [
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating ${simProvider.toUpperCase()} STK Push to ${simPhone}...`,
      ...prev
    ]);

    setTimeout(async () => {
      setSimLog(prev => [
        `[${new Date().toLocaleTimeString()}] 📲 Customer PIN entered. Network confirmation received.`,
        ...prev
      ]);

      const itemsToBuy = simSelectedItems.length > 0 ? simSelectedItems : [courses[0]?.id || 'c1'];
      try {
        const orderId = await createOrder({
          userId: user?.uid || 'sim-user-99',
          userName: profile?.name || user?.email || 'Simulated Student',
          userEmail: user?.email || 'student@test.com',
          itemIds: itemsToBuy,
          ref,
          amount: Number(simAmount),
          status: 'confirmed',
          paymentMethod: simProvider,
          phoneNumber: simPhone
        });

        // Unlock items
        itemsToBuy.forEach(id => {
          giveUserAccess(user?.uid || 'sim-user-99', id);
        });

        setSimLog(prev => [
          `[${new Date().toLocaleTimeString()}] ✅ Payment VERIFIED! Order ID #${orderId} created & Auto-Approved.`,
          `[${new Date().toLocaleTimeString()}] 🔓 Content items [${itemsToBuy.join(', ')}] unlocked in student library!`,
          ...prev
        ]);
        showStatus('Malipo yamekamilika na oda imethibitishwa moja kwa moja!');
      } catch (e: any) {
        setSimLog(prev => [
          `[${new Date().toLocaleTimeString()}] ❌ Failed to create order: ${e.message}`,
          ...prev
        ]);
      } finally {
        setIsSimulating(false);
      }
    }, 1500);
  };

  // Run Custom Code Snippet in Sandbox
  const handleRunCode = () => {
    setConsoleError(null);
    setConsoleResult(null);
    try {
      // Build safe execution context
      const fn = new Function(
        'courses', 
        'tests', 
        'lectures', 
        'apps', 
        'banners', 
        'orders', 
        'users', 
        'user', 
        'profile', 
        'pts', 
        'lib', 
        'db',
        codeSnippet
      );
      const res = fn(courses, tests, lectures, apps, banners, orders, users, user, profile, pts, lib, db);
      setConsoleResult(typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res));
    } catch (err: any) {
      setConsoleError(err.message || 'Error executing script');
    }
  };

  // Dispatch Notification
  const handleDispatchNotification = () => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title: notifTitle,
      message: notifMsg,
      type: notifType,
      createdAt: Date.now(),
      read: false
    };
    const current = JSON.parse(localStorage.getItem('czp_notifications') || '[]');
    const updated = [newNotif, ...current];
    localStorage.setItem('czp_notifications', JSON.stringify(updated));
    showStatus('Taarifa (Notification) imetumwa kikamilifu!');
  };

  // Export / Download DB as JSON
  const handleExportJSON = () => {
    const fullDb = {
      timestamp: new Date().toISOString(),
      courses,
      tests,
      lectures,
      apps,
      banners,
      orders,
      users,
      localStorage: {
        pts,
        strk,
        lib
      }
    };
    const blob = new Blob([JSON.stringify(fullDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codznz_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('JSON Backup imepakuliwa!');
  };

  // Get active collection items for Database Inspector
  const getActiveCollectionItems = () => {
    let items: any[] = [];
    switch (selectedCollection) {
      case 'courses': items = courses; break;
      case 'tests': items = tests; break;
      case 'lectures': items = lectures; break;
      case 'apps': items = apps; break;
      case 'banners': items = banners; break;
      case 'orders': items = orders; break;
      case 'users': items = users; break;
      case 'notifications': items = notifications; break;
    }
    if (!searchTerm) return items;
    return items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSaveJsonDoc = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.id) throw new Error('Document must contain an "id" property');

      // Update state depending on collection
      if (selectedCollection === 'courses') {
        const updated = courses.map(c => c.id === parsed.id ? parsed : c);
        if (!courses.some(c => c.id === parsed.id)) updated.unshift(parsed);
        updateCourses(updated);
      } else if (selectedCollection === 'tests') {
        const updated = tests.map(t => t.id === parsed.id ? parsed : t);
        if (!tests.some(t => t.id === parsed.id)) updated.unshift(parsed);
        updateTests(updated);
      } else if (selectedCollection === 'lectures') {
        const updated = lectures.map(l => l.id === parsed.id ? parsed : l);
        if (!lectures.some(l => l.id === parsed.id)) updated.unshift(parsed);
        updateLectures(updated);
      } else if (selectedCollection === 'apps') {
        const updated = apps.map(a => a.id === parsed.id ? parsed : a);
        if (!apps.some(a => a.id === parsed.id)) updated.unshift(parsed);
        updateApps(updated);
      } else if (selectedCollection === 'banners') {
        const updated = banners.map(b => b.id === parsed.id ? parsed : b);
        if (!banners.some(b => b.id === parsed.id)) updated.unshift(parsed);
        updateBanners(updated);
      }

      // Try write to Firestore
      try {
        await setDoc(doc(db, selectedCollection, parsed.id), parsed, { merge: true });
      } catch (e) {
        console.warn('Firestore write sync fallback:', e);
      }

      setIsEditingJson(false);
      setSelectedDoc(parsed);
      showStatus(`Document #${parsed.id} imesasishwa kikamilifu!`);
    } catch (err: any) {
      showStatus('Invalid JSON: ' + err.message, 'err');
    }
  };

  const handleDeleteJsonDoc = async (id: string) => {
    if (!confirm(`Una uhakika unataka kufuta document #${id}?`)) return;
    
    if (selectedCollection === 'courses') updateCourses(courses.filter(c => c.id !== id));
    else if (selectedCollection === 'tests') updateTests(tests.filter(t => t.id !== id));
    else if (selectedCollection === 'lectures') updateLectures(lectures.filter(l => l.id !== id));
    else if (selectedCollection === 'apps') updateApps(apps.filter(a => a.id !== id));
    else if (selectedCollection === 'banners') updateBanners(banners.filter(b => b.id !== id));

    try {
      await deleteDoc(doc(db, selectedCollection, id));
    } catch (e) {
      console.warn('Firestore delete fallback:', e);
    }

    setSelectedDoc(null);
    setIsEditingJson(false);
    showStatus(`Document #${id} imefutwa!`);
  };

  return (
    <div className="page-anim space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Code2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-heading">Developer Console</h2>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Radio size={10} className="animate-pulse text-emerald-400" /> Live Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Zana za utengenezaji, majaribio ya mifumo, hifadhidata na malipo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
              title="Pakua JSON Backup ya data zote"
            >
              <Download size={14} /> Export DB
            </button>
          </div>
        </div>

        {/* Status Toast inside header */}
        {statusMsg && (
          <div className={cn(
            "mt-3 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 transition-all",
            statusMsg.type === 'ok' ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-rose-500/20 text-rose-200 border border-rose-500/30"
          )}>
            {statusMsg.type === 'ok' ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-theme">
        {[
          { id: 'simulator', label: 'Simulator & Role', icon: UserCheck },
          { id: 'database', label: 'Database Explorer', icon: Database },
          { id: 'payments', label: 'Payment Sandbox', icon: CreditCard },
          { id: 'console', label: 'JS Sandbox & Push', icon: Terminal },
          { id: 'storage', label: 'LocalStorage & Config', icon: HardDrive },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as DevTab);
                setSelectedDoc(null);
                setIsEditingJson(false);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/25" 
                  : "bg-card hover:bg-card2 text-text2 hover:text-text1 border border-theme"
              )}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SIMULATOR & ROLE TOOLS */}
      {activeTab === 'simulator' && (
        <div className="space-y-4">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-card border border-theme p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-text3 uppercase">Auth State</div>
              <div className="text-sm font-black text-text1 mt-0.5 truncate font-heading">
                {user ? user.email : 'Guest (Not Logged)'}
              </div>
              <div className="text-[10px] font-bold text-primary mt-1">
                Role: {isAdm ? 'Super Admin' : user ? 'Student' : 'Anonymous'}
              </div>
            </div>

            <div className="bg-card border border-theme p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-text3 uppercase">Active XP</div>
              <div className="text-sm font-black text-amber-500 mt-0.5 font-heading">
                {pts || 0} XP
              </div>
              <div className="text-[10px] font-bold text-text2 mt-1">
                Level {Math.floor((pts || 0) / 200) + 1}
              </div>
            </div>

            <div className="bg-card border border-theme p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-text3 uppercase">Library Access</div>
              <div className="text-sm font-black text-emerald-500 mt-0.5 font-heading">
                {Object.keys(lib).length} Items Owned
              </div>
              <div className="text-[10px] font-bold text-text2 mt-1">
                Streak: {strk || 0} Days
              </div>
            </div>

            <div className="bg-card border border-theme p-3 rounded-2xl">
              <div className="text-[10px] font-bold text-text3 uppercase">Firebase Config</div>
              <div className="text-sm font-black text-indigo-500 mt-0.5 font-heading">
                Connected
              </div>
              <div className="text-[10px] font-bold text-text3 mt-1 truncate">
                Admin: {ADMIN_EMAIL}
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Library Simulator */}
            <div className="bg-card border border-theme p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Unlock size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text1 font-heading">Majaribio ya Maktaba (Library Sandbox)</h4>
                  <p className="text-[11px] text-text3">Fungua au funga kozi zote kwa mteja wa sasa</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleUnlockAll}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Unlock size={14} /> Fungua Zote (Unlock All)
                </button>
                <button
                  onClick={handleResetLibrary}
                  className="px-3 py-2 bg-card2 hover:bg-theme text-text2 hover:text-text1 border border-theme rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Lock size={14} /> Futa Maktaba (Reset)
                </button>
              </div>
            </div>

            {/* XP Points Booster */}
            <div className="bg-card border border-theme p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text1 font-heading">Pointi & Gamification Tester</h4>
                  <p className="text-[11px] text-text3">Ongeza XP pointi mara moja ili kupima rank na vyeo</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleBoostXP(100)}
                  className="px-2.5 py-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl text-xs font-black transition-all"
                >
                  +100 XP
                </button>
                <button
                  onClick={() => handleBoostXP(500)}
                  className="px-2.5 py-2 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl text-xs font-black transition-all"
                >
                  +500 XP
                </button>
                <button
                  onClick={() => handleBoostXP(2000)}
                  className="px-2.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-black shadow-sm transition-all"
                >
                  +2000 XP
                </button>
              </div>
            </div>
          </div>

          {/* Seed Data Controls */}
          <div className="bg-card border border-theme p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <RefreshCw size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text1 font-heading">Factory Reset & Seed Data</h4>
                  <p className="text-[11px] text-text3">Rejesha data asili za masomo, mitihani, video, na programu</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleSeedAllToLocalStorage}
                className="px-3.5 py-2.5 bg-card2 hover:bg-primary/10 hover:text-primary text-text1 border border-theme rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw size={14} /> Rejesha Local Seed Data (Browser)
              </button>
              <button
                onClick={handleSeedToFirestore}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Upload size={14} /> Tuma Seed Data kwenda Cloud Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE EXPLORER & DIRECT JSON EDITOR */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between bg-card border border-theme p-3 rounded-2xl">
            {/* Collection Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {(['courses', 'tests', 'lectures', 'apps', 'banners', 'orders', 'users', 'notifications'] as const).map(col => (
                <button
                  key={col}
                  onClick={() => {
                    setSelectedCollection(col);
                    setSelectedDoc(null);
                    setIsEditingJson(false);
                  }}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors whitespace-nowrap",
                    selectedCollection === col 
                      ? "bg-primary text-white" 
                      : "bg-card2 text-text3 hover:text-text1 border border-theme"
                  )}
                >
                  {col}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text3" />
              <input
                type="text"
                placeholder="Tafuta ID / Jina..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Document List (Left 5 Cols) */}
            <div className="lg:col-span-5 bg-card border border-theme rounded-2xl p-3 space-y-2 max-h-[450px] overflow-y-auto">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-theme text-xs font-bold text-text2">
                <span>{selectedCollection.toUpperCase()} ({getActiveCollectionItems().length})</span>
                <button
                  onClick={() => {
                    const newTemplate = {
                      id: `${selectedCollection.slice(0, 1)}-${Date.now()}`,
                      title: 'New Item Template',
                      createdAt: Date.now()
                    };
                    setSelectedDoc(newTemplate);
                    setJsonInput(JSON.stringify(newTemplate, null, 2));
                    setIsEditingJson(true);
                  }}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <Plus size={13} /> Ongeza Mpya
                </button>
              </div>

              {getActiveCollectionItems().length === 0 ? (
                <div className="text-center py-8 text-xs text-text3">
                  Hakuna data zilizopatikana kwenye mkusanyiko huu.
                </div>
              ) : (
                getActiveCollectionItems().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedDoc(item);
                      setJsonInput(JSON.stringify(item, null, 2));
                      setIsEditingJson(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-xl border text-left cursor-pointer transition-all",
                      selectedDoc?.id === item.id 
                        ? "bg-primary/10 border-primary text-text1 shadow-sm" 
                        : "bg-card2 border-theme hover:border-primary/40 text-text2 hover:text-text1"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary truncate max-w-[150px]">
                        #{item.id}
                      </span>
                      <span className="text-[10px] text-text3 font-medium">
                        {item.price !== undefined ? formatPrice(item.price) : item.status || 'Active'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-text1 mt-1 truncate">
                      {item.title || item.name || item.userName || item.ref || item.id}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Document Viewer / Editor (Right 7 Cols) */}
            <div className="lg:col-span-7 bg-card border border-theme rounded-2xl p-4 flex flex-col justify-between min-h-[350px]">
              {selectedDoc ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-theme pb-2">
                    <div className="flex items-center gap-2">
                      <FileCode size={16} className="text-primary" />
                      <span className="font-mono text-xs font-bold text-text1">
                        Document: #{selectedDoc.id}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedDoc, null, 2), 'doc-json')}
                        className="p-1.5 bg-card2 hover:bg-theme border border-theme rounded-lg text-text2 hover:text-text1 text-xs"
                        title="Copy JSON"
                      >
                        {copiedKey === 'doc-json' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => setIsEditingJson(!isEditingJson)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-bold transition-colors",
                          isEditingJson ? "bg-amber-500 text-white" : "bg-card2 text-text2 hover:text-text1 border border-theme"
                        )}
                      >
                        {isEditingJson ? 'Preview Mode' : 'Edit Raw JSON'}
                      </button>
                      <button
                        onClick={() => handleDeleteJsonDoc(selectedDoc.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {isEditingJson ? (
                    <div className="space-y-2">
                      <textarea
                        value={jsonInput}
                        onChange={e => setJsonInput(e.target.value)}
                        rows={14}
                        className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:border-primary resize-y"
                        spellCheck={false}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setJsonInput(JSON.stringify(selectedDoc, null, 2));
                            setIsEditingJson(false);
                          }}
                          className="px-3 py-1.5 bg-card2 text-text2 hover:text-text1 rounded-xl text-xs font-bold"
                        >
                          Ghairi
                        </button>
                        <button
                          onClick={handleSaveJsonDoc}
                          className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-sm"
                        >
                          Hifadhi Mabadiliko (Save JSON)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="p-3 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto max-h-[360px] border border-slate-800">
                      {JSON.stringify(selectedDoc, null, 2)}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-16 text-text3 space-y-2">
                  <Database size={32} className="opacity-40" />
                  <p className="text-xs font-medium">Chagua document yoyote upande wa kushoto ili kuona na kuhariri data zake.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT & WEBHOOK SANDBOX */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Simulator Form (5 Cols) */}
            <div className="lg:col-span-5 bg-card border border-theme rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-theme">
                <CreditCard size={18} className="text-primary" />
                <h3 className="text-xs font-bold text-text1 font-heading uppercase">Tanzania Mobile Money Simulator</h3>
              </div>

              {/* Provider Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text2 uppercase">Mtandao wa Malipo</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mpesa', name: 'M-Pesa (Vodacom)', color: 'border-red-500/30 text-red-500' },
                    { id: 'tigopesa', name: 'Tigo Pesa / Mixx', color: 'border-blue-500/30 text-blue-500' },
                    { id: 'airtel', name: 'Airtel Money', color: 'border-rose-500/30 text-rose-500' },
                    { id: 'halopesa', name: 'HaloPesa', color: 'border-orange-500/30 text-orange-500' },
                  ].map(prov => (
                    <button
                      key={prov.id}
                      onClick={() => setSimProvider(prov.id as any)}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-all text-left",
                        simProvider === prov.id 
                          ? "bg-primary text-white shadow-sm" 
                          : "bg-card2 hover:bg-theme border-theme text-text2"
                      )}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone and Amount */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 uppercase">Namba ya Simu ya Jaribio</label>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={e => setSimPhone(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 uppercase">Kiasi cha Kulipa (TZS)</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={e => setSimAmount(e.target.value)}
                    className="w-full mt-1 p-2.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSimulating ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <Play size={15} />
                )}
                <span>{isSimulating ? 'Inatuma STK Push...' : 'Fanya Malipo ya Jaribio (Trigger Push)'}</span>
              </button>
            </div>

            {/* Live Webhook & Transaction Log (7 Cols) */}
            <div className="lg:col-span-7 bg-card border border-theme rounded-2xl p-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-theme pb-2">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-bold text-text1 font-heading uppercase">Live Transaction Stream</h4>
                  </div>
                  <button
                    onClick={() => setSimLog([])}
                    className="text-[10px] text-text3 hover:text-text1"
                  >
                    Futa Logs
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 space-y-1.5 min-h-[220px] max-h-[300px] overflow-y-auto">
                  {simLog.length === 0 ? (
                    <div className="text-slate-500 text-center py-12 text-xs">
                      Bofya "Fanya Malipo ya Jaribio" kuona mchakato wa mawasiliano ya API na STK push hapa moja kwa moja.
                    </div>
                  ) : (
                    simLog.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between text-xs text-text3">
                <span>Auto-Approve Orders: <strong className="text-emerald-500">Enabled</strong></span>
                <span>Webhook Latency: <strong className="text-text1">~120ms</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CODE CONSOLE & PUSH NOTIFICATIONS */}
      {activeTab === 'console' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Code Playground (7 Cols) */}
            <div className="lg:col-span-7 bg-card border border-theme rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-primary" />
                  <h4 className="text-xs font-bold text-text1 font-heading uppercase">JavaScript Context Executor</h4>
                </div>
                <button
                  onClick={handleRunCode}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play size={13} /> Run Script
                </button>
              </div>

              <textarea
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                rows={8}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-indigo-300 rounded-xl border border-slate-800 focus:outline-none focus:border-primary resize-y"
                spellCheck={false}
              />

              {consoleResult && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase text-emerald-500">Execution Output:</div>
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-emerald-500/20 max-h-[180px]">
                    {consoleResult}
                  </pre>
                </div>
              )}

              {consoleError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs rounded-xl">
                  {consoleError}
                </div>
              )}
            </div>

            {/* Notification Dispatcher (5 Cols) */}
            <div className="lg:col-span-5 bg-card border border-theme rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-theme pb-2">
                <Send size={16} className="text-primary" />
                <h4 className="text-xs font-bold text-text1 font-heading uppercase">Push Notification Dispatcher</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-text2 uppercase">Kichwa cha Taarifa (Title)</label>
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    className="w-full mt-1 p-2 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text2 uppercase">Maudhui ya Taarifa (Message)</label>
                  <textarea
                    rows={3}
                    value={notifMsg}
                    onChange={e => setNotifMsg(e.target.value)}
                    className="w-full mt-1 p-2 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-text2 uppercase">Aina ya Taarifa (Type)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {(['info', 'success', 'alert'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setNotifType(t)}
                        className={cn(
                          "py-1.5 rounded-lg text-xs font-bold capitalize border transition-all",
                          notifType === t 
                            ? "bg-primary text-white border-primary" 
                            : "bg-card2 border-theme text-text2"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDispatchNotification}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send size={13} /> Tuma Taarifa (Broadcast)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORAGE & APP CONFIG */}
      {activeTab === 'storage' && (
        <div className="space-y-4">
          <div className="bg-card border border-theme rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-theme pb-2">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-primary" />
                <h4 className="text-xs font-bold text-text1 font-heading uppercase">Browser LocalStorage Explorer</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshStorageKeys}
                  className="p-1.5 bg-card2 hover:bg-theme border border-theme rounded-lg text-text2 hover:text-text1 text-xs flex items-center gap-1"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
                <button
                  onClick={() => {
                    if (confirm('Futa storage zote za CodZnz? Hii itarejesha mfumo asilia.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-xs font-bold"
                >
                  Clear All Storage
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {storageKeys.map((item) => (
                <div 
                  key={item.key} 
                  className="p-3 bg-card2 border border-theme rounded-xl flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary truncate">{item.key}</span>
                      <span className="text-[10px] text-text3 bg-card px-1.5 py-0.5 rounded border border-theme">{item.size}</span>
                    </div>
                    <p className="font-mono text-[10px] text-text3 truncate mt-1">
                      {item.val}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => copyToClipboard(item.val, item.key)}
                      className="p-1.5 bg-card hover:bg-theme border border-theme rounded-lg text-text2 hover:text-text1"
                      title="Copy Value"
                    >
                      {copiedKey === item.key ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem(item.key);
                        refreshStorageKeys();
                        showStatus(`Key "${item.key}" imefutwa!`);
                      }}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg"
                      title="Delete Key"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
