/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { 
  Compass, 
  Book, 
  Bolt, 
  Trophy, 
  Settings, 
  LogIn, 
  LogOut, 
  ShoppingCart, 
  Sun, 
  Moon, 
  Languages 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { HomePage } from './components/HomePage';
import { DashboardPage } from './components/DashboardPage';
import { LibraryPage } from './components/LibraryPage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { AdminPage } from './components/AdminPage';
import { CartPage } from './components/CartPage';
import { AuthPage } from './components/AuthPage';
import { PaymentPage } from './components/PaymentPage';
import { AppDetailOverlay, BuyModal, QuizOverlay } from './components/Overlays';
import { VideoPlayerOverlay, PDFViewerOverlay } from './components/MediaOverlays';
import { CertificateOverlay } from './components/CertificateOverlay';
import { ContentItem, CodApp } from './types';
import { db } from './services/firebase';
import { doc, setDoc } from 'firebase/firestore';

type PageID = 'home' | 'dash' | 'lib' | 'cart' | 'pay' | 'lb' | 'adm' | 'login' | 'reg';

function AppContent() {
  const { theme, setTheme, lang, setLang, cart, user, isAdm, logout, apps, courses, tests, lectures, addToCart, lib, profile, pts } = useApp();
  const [activePage, setActivePage] = useState<PageID>('home');
  const [selectedApp, setSelectedApp] = useState<CodApp | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [buyItem, setBuyItem] = useState<ContentItem | null>(null);
  const [quizItem, setQuizItem] = useState<ContentItem | null>(null);
  const [videoItem, setVideoItem] = useState<ContentItem | null>(null);
  const [pdfItem, setPdfItem] = useState<ContentItem | null>(null);
  const [certData, setCertData] = useState<{ title: string; score: number } | null>(null);

  const navItems = [
    { id: 'home', icon: Compass, label: { en: 'Explore', sw: 'Gundua' } },
    { id: 'lib', icon: Book, label: { en: 'Library', sw: 'Maktaba' } },
    { id: 'dash', icon: Bolt, label: { en: 'Dash', sw: 'Dash' }, isFab: true },
    { id: 'lb', icon: Trophy, label: { en: 'Rankings', sw: 'Vyeo' } },
    { id: 'adm', icon: Settings, label: { en: 'Admin', sw: 'Admin' }, adminOnly: true },
  ];

  const handleOpenApp = (id: string) => {
    const app = apps.find(a => a.id === id);
    if (app) setSelectedApp(app);
  };

  const handleOpenContent = (id: string) => {
    const all = [...courses, ...tests, ...lectures];
    const item = all.find(i => i.id === id);
    if (!item) return;

    const isOwned = lib[id] || item.isFree || item.price === 0;
    if (!isOwned) {
      if (!user) { setActivePage('login'); return; }
      setBuyItem(item);
      return;
    }

    if (item.category === 'courses') setPdfItem(item);
    else if (item.category === 'tests') setQuizItem(item);
    else setVideoItem(item);
  };

  const handleQuizFinish = async (score?: number) => {
    if (score !== undefined && quizItem) {
      if (score >= 60) {
        setCertData({ title: quizItem.title, score });
        if (user) {
          const newPts = (pts || 0) + (score * 10) + 50;
          await setDoc(doc(db, 'users', user.uid), { points: newPts }, { merge: true });
        }
      }
    }
    setQuizItem(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <HomePage onOpenApp={handleOpenApp} onOpenLB={() => setActivePage('lb')} onOpenContent={handleOpenContent} />;
      case 'dash': return <DashboardPage onNavigate={setActivePage} onOpenContent={handleOpenContent} />;
      case 'lib': return <LibraryPage onOpenContent={handleOpenContent} />;
      case 'lb': return <LeaderboardPage />;
      case 'adm': return isAdm ? <AdminPage /> : <HomePage onOpenApp={handleOpenApp} onOpenLB={() => setActivePage('lb')} onOpenContent={handleOpenContent} />;
      case 'cart': return <CartPage onCheckout={() => setActivePage(user ? 'pay' : 'login')} />;
      case 'pay': return <PaymentPage onBack={() => setActivePage('home')} />;
      case 'login': return <AuthPage mode="login" onSwitch={(m) => setActivePage(m as PageID)} onSuccess={() => setActivePage('dash')} />;
      case 'reg': return <AuthPage mode="register" onSwitch={(m) => setActivePage(m as PageID)} onSuccess={() => setActivePage('dash')} />;
      default: return <HomePage onOpenApp={handleOpenApp} onOpenLB={() => setActivePage('lb')} onOpenContent={handleOpenContent} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-theme text-theme selection:bg-primary selection:text-white">
      <header className="fixed top-0 inset-x-0 h-[58px] glass bg-topbg border-b border-theme z-50 flex items-center px-4 justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActivePage('home')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-glow-sm">
            <span className="text-white font-black text-sm">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black font-heading leading-tight tracking-tight text-text1">
              CodZnz <span className="text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.5 rounded-md ml-0.5">PRO</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="w-8 h-8 flex items-center justify-center hover:bg-card2 text-text2 hover:text-text1 rounded-xl transition-colors"
            title="Theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          
          <button 
            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} 
            className="h-8 px-2 flex items-center justify-center hover:bg-card2 text-text2 hover:text-text1 rounded-xl transition-colors text-xs font-bold gap-1 border border-theme"
            title="Language"
          >
            <Languages size={14} />
            <span className="uppercase text-[10px] font-black">{lang}</span>
          </button>

          <button 
            onClick={() => setActivePage('cart')} 
            className="w-8 h-8 flex items-center justify-center hover:bg-card2 text-text2 hover:text-text1 rounded-xl transition-colors relative"
            title="Cart"
          >
            <ShoppingCart size={17} />
            {cart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-err text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black border-2 border-theme">
                {cart.length}
              </span>
            )}
          </button>

          {user ? (
            <div 
              onClick={() => setActivePage('dash')}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xs text-white font-black cursor-pointer shadow-sm hover:scale-105 transition-transform"
              title="Dashboard"
            >
              {user.email?.[0].toUpperCase()}
            </div>
          ) : (
            <button 
              onClick={() => setActivePage('login')} 
              className="h-8 px-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
            >
              <LogIn size={13} />
              <span>{lang === 'en' ? 'Login' : 'Ingia'}</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto pt-[66px] pb-[86px] px-3.5 sm:px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 inset-x-0 h-[66px] glass bg-navbg border-t border-theme z-50 flex items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdm) return null;
          const Icon = item.icon;
          const isActive = activePage === item.id;
          if (item.isFab) {
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id as PageID)}
                className={cn(
                  "relative -top-3.5 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 duration-200",
                  isActive 
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-primary/30 ring-4 ring-primary/20 scale-105" 
                    : "bg-card text-text2 border border-theme hover:text-text1"
                )}
                title="Learning Dashboard"
              >
                <Icon size={22} />
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as PageID)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all py-1 px-2 rounded-xl",
                isActive ? "text-primary font-bold" : "text-text3 hover:text-text2"
              )}
            >
              <Icon size={18} className={cn("transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-bold tracking-tight uppercase whitespace-nowrap">
                {lang === 'en' ? item.label.en : item.label.sw}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => user ? logout() : setActivePage('login')}
          className="flex flex-col items-center justify-center gap-1 text-text3 hover:text-text2 transition-all py-1 px-2 rounded-xl"
        >
          {user ? <LogOut size={18} /> : <LogIn size={18} />}
          <span className="text-[10px] font-bold tracking-tight uppercase whitespace-nowrap">
            {user ? (lang === 'en' ? 'Logout' : 'Toka') : (lang === 'en' ? 'Login' : 'Ingia')}
          </span>
        </button>
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {selectedApp && (
          <AppDetailOverlay app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}
        {buyItem && (
          <BuyModal 
            item={buyItem} 
            onConfirm={() => { addToCart(buyItem.id); setBuyItem(null); setActivePage('cart'); }} 
            onClose={() => setBuyItem(null)} 
          />
        )}
        {quizItem && (
          <QuizOverlay test={quizItem} onClose={handleQuizFinish} />
        )}
        {certData && (
          <CertificateOverlay title={certData.title} score={certData.score} onClose={() => setCertData(null)} />
        )}
        {videoItem && (
           <VideoPlayerOverlay item={videoItem} onClose={() => setVideoItem(null)} />
        )}
        {pdfItem && (
           <PDFViewerOverlay item={pdfItem} onClose={() => setPdfItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
