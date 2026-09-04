import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BannerSlider } from './BannerSlider';
import { HeroStats } from './HeroStats';
import { CategoryCards } from './CategoryCards';
import { AppCard } from './AppCard';
import { ContentCard } from './ContentCard';
import { SearchBar } from './SearchBar';
import { BundlesSection } from './BundlesSection';
import { ReferralModal } from './ReferralModal';
import { BadgesModal } from './BadgesModal';
import { CodePlayground } from './CodePlayground';
import { QnAForumModal } from './QnAForumModal';
import { StudyNotesCheatsheetModal } from './StudyNotesCheatsheetModal';
import { AIAssistantModal } from './AIAssistantModal';
import { Category, LearningBundle } from '../types';
import { ChevronLeft, Sparkles, Smartphone, Gift, Award, Code2, MessageSquare, BookOpen, Bot, Flame, Zap, Trophy, ChevronRight } from 'lucide-react';
import { getXpLevelInfo } from '../lib/utils';

export const HomePage: React.FC<{ 
  onOpenApp: (id: string) => void; 
  onOpenLB: () => void; 
  onOpenContent: (id: string) => void;
  onOpenCart?: () => void;
}> = ({ onOpenApp, onOpenLB, onOpenContent, onOpenCart }) => {
  const { banners, apps, courses, tests, lectures, lang, addToCart, pts, strk } = useApp();
  const [subView, setSubView] = useState<Category | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [showQnA, setShowQnA] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  const xpInfo = getXpLevelInfo(pts || 0);

  const getSubContent = () => {
    switch (subView) {
      case 'courses': return courses;
      case 'tests': return tests;
      case 'lectures': return lectures;
      default: return [];
    }
  };

  const handleCategorySelect = (cat: Category | 'lb') => {
    if (cat === 'lb') onOpenLB();
    else setSubView(cat);
  };

  const handleSelectBundle = (bundle: LearningBundle) => {
    // Add all courses in bundle to cart
    bundle.courseIds.forEach(id => {
      addToCart(id);
    });
    if (onOpenCart) {
      onOpenCart();
    }
  };

  return (
    <div className="page-anim space-y-4">
      {/* Universal Search Bar */}
      <SearchBar onSelectContent={onOpenContent} onSelectApp={onOpenApp} />

      {!subView ? (
        <>
          {/* Top Banner Carousel */}
          <BannerSlider banners={banners} />

          {/* Daily Learning Streak & XP Level Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-card to-card border border-amber-500/25 rounded-2xl p-3.5 sm:p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Flame size={22} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-text1">
                      {strk || 1} {lang === 'en' ? 'Day Streak' : 'Siku Mfululizo'}
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded-full">
                      Level {xpInfo.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-text3 flex items-center gap-1 mt-0.5">
                    <Zap size={11} className="text-primary" />
                    <span className="font-semibold text-text2">{xpInfo.title}</span>
                    <span className="text-text3">• {pts || 0} XP</span>
                  </div>
                </div>
              </div>

              {/* Progress & Quick Links */}
              <div className="flex items-center gap-2 sm:max-w-[220px] w-full justify-between sm:justify-end">
                <div className="w-full sm:w-28 space-y-1">
                  <div className="flex justify-between text-[9px] text-text3 font-medium">
                    <span>Lvl {xpInfo.level}</span>
                    <span>{xpInfo.neededXp > 0 ? `${xpInfo.neededXp} XP to Lvl ${xpInfo.level + 1}` : 'Max Lvl'}</span>
                  </div>
                  <div className="h-1.5 w-full bg-theme rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500" 
                      style={{ width: `${xpInfo.progress}%` }} 
                    />
                  </div>
                </div>

                <button
                  onClick={onOpenLB}
                  className="h-8 px-2.5 bg-card2 hover:bg-theme border border-theme rounded-xl text-[10px] font-bold text-text2 hover:text-text1 flex items-center gap-1 shrink-0 transition-all active:scale-95"
                  title="Tazama Ubao wa Vinara"
                >
                  <Trophy size={12} className="text-amber-400" />
                  <span className="hidden xs:inline">{lang === 'en' ? 'Rank' : 'Nafasi'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Access Action Grid (Playground / Q&A / AI Tutor / Notes) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setShowPlayground(true)}
              className="h-11 px-3 bg-gradient-to-r from-indigo-950/40 via-card to-card border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl flex items-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Code2 size={15} />
              </div>
              <div className="text-left truncate">
                <div className="leading-tight truncate">{lang === 'en' ? 'Playground' : 'Sandbox'}</div>
                <div className="text-[9px] text-text3 font-normal truncate">HTML/JS/Py</div>
              </div>
            </button>

            <button
              onClick={() => setShowAIModal(true)}
              className="h-11 px-3 bg-gradient-to-r from-purple-950/40 via-card to-card border border-purple-500/30 hover:border-purple-500/60 rounded-2xl flex items-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="text-left truncate">
                <div className="leading-tight truncate">AI Tutor</div>
                <div className="text-[9px] text-text3 font-normal truncate">{lang === 'en' ? 'Smart Bot' : 'Mwalimu AI'}</div>
              </div>
            </button>

            <button
              onClick={() => setShowQnA(true)}
              className="h-11 px-3 bg-gradient-to-r from-emerald-950/40 via-card to-card border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl flex items-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare size={15} />
              </div>
              <div className="text-left truncate">
                <div className="leading-tight truncate">Q&A Forum</div>
                <div className="text-[9px] text-text3 font-normal truncate">{lang === 'en' ? 'Ask Community' : 'Maswali'}</div>
              </div>
            </button>

            <button
              onClick={() => setShowNotes(true)}
              className="h-11 px-3 bg-gradient-to-r from-amber-950/40 via-card to-card border border-amber-500/30 hover:border-amber-500/60 rounded-2xl flex items-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <BookOpen size={15} />
              </div>
              <div className="text-left truncate">
                <div className="leading-tight truncate">Cheatsheets</div>
                <div className="text-[9px] text-text3 font-normal truncate">{lang === 'en' ? 'Study Notes' : 'Daftari'}</div>
              </div>
            </button>
          </div>

          {/* Quick Access Action Pills (Refer & Earn / Badges) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowReferralModal(true)}
              className="h-10 px-3 bg-card border border-theme hover:border-amber-500/40 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <Gift size={14} className="text-amber-500" />
              <span>{lang === 'en' ? 'Refer & Earn XP' : 'Alika & Pata XP'}</span>
            </button>
            <button
              onClick={() => setShowBadgesModal(true)}
              className="h-10 px-3 bg-card border border-theme hover:border-primary/40 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-text1 transition-all active:scale-95 shadow-xs"
            >
              <Award size={14} className="text-primary" />
              <span>{lang === 'en' ? 'Achievements' : 'Beji & Mafanikio'}</span>
            </button>
          </div>

          {/* Main Category Cards */}
          <CategoryCards onSelect={handleCategorySelect} />

          {/* Quick Metrics Bar */}
          <HeroStats />

          {/* Featured Apps Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-text2 flex items-center gap-1.5">
                <Smartphone size={14} className="text-primary" />
                <span>{lang === 'en' ? 'Featured Tools & Apps' : 'Programu & Zana za Coding'}</span>
              </h3>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {apps.length} Apps
              </span>
            </div>
            
            <div className="space-y-2.5">
              {apps.map(app => (
                <AppCard key={app.id} app={app} onClick={onOpenApp} />
              ))}
            </div>
          </div>

          {/* Compact Learning Paths & Bundles Carousel at the Bottom */}
          <div className="pt-2">
            <BundlesSection onSelectBundle={handleSelectBundle} onOpenContent={onOpenContent} />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card border border-theme p-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSubView(null)} 
                className="p-1.5 bg-card2 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors border border-theme"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-base font-bold text-text1 capitalize font-heading">
                {subView === 'courses' ? (lang === 'en' ? 'All Courses' : 'Kozi Zote') :
                 subView === 'tests' ? (lang === 'en' ? 'Practice Tests' : 'Mazoezi & Mitihani') :
                 (lang === 'en' ? 'Video Lectures' : 'Vipindi vya Video')}
              </h3>
            </div>
            <span className="text-xs font-bold text-text3 bg-card2 px-2.5 py-1 rounded-lg border border-theme">
              {getSubContent().length} Items
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {getSubContent().map(item => (
              <ContentCard key={item.id} item={item} onClick={onOpenContent} />
            ))}
          </div>
        </div>
      )}

      {/* Code Playground Modal */}
      {showPlayground && (
        <div className="fixed inset-0 z-[250] bg-slate-950 sm:bg-black/85 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden page-anim">
          <div className="absolute inset-0 hidden sm:block" onClick={() => setShowPlayground(false)} />
          <div className="relative w-full h-full sm:h-[94vh] max-w-7xl bg-slate-950 sm:border sm:border-theme sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden">
            <CodePlayground onClose={() => setShowPlayground(false)} />
          </div>
        </div>
      )}

      {/* Q&A Forum Modal */}
      {showQnA && (
        <QnAForumModal onClose={() => setShowQnA(false)} />
      )}

      {/* Study Notes & Cheatsheets Modal */}
      {showNotes && (
        <StudyNotesCheatsheetModal onClose={() => setShowNotes(false)} />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}

      {/* Referral Program Modal */}
      {showReferralModal && (
        <ReferralModal onClose={() => setShowReferralModal(false)} />
      )}

      {/* Achievement Badges Modal */}
      {showBadgesModal && (
        <BadgesModal onClose={() => setShowBadgesModal(false)} />
      )}
    </div>
  );
};



