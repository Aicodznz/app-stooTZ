import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getInitials } from '../lib/utils';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  LogIn, 
  UserPlus, 
  Bolt, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Play, 
  Share2, 
  Copy, 
  Check, 
  Award,
  ArrowRight
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (page: any) => void; onOpenContent?: (id: string) => void }> = ({ onNavigate, onOpenContent }) => {
  const { user, profile, lang, pts, strk, courses, tests, lectures, lib, notifications, markNotificationRead, completedEpisodes } = useApp();
  const [copiedRef, setCopiedRef] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center page-anim">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <BookOpen size={38} />
        </div>
        <h2 className="text-xl font-bold mb-2 font-poppins">
          {lang === 'en' ? 'Welcome to CodZnz Pro' : 'Karibu CodZnz Pro'}
        </h2>
        <p className="text-text3 text-xs sm:text-sm mb-8 max-w-[260px] leading-relaxed">
          {lang === 'en' ? 'Log in to track your learning journey, claim certificates, and earn XP.' : 'Ingia ili ufuatilie masomo yako, upate vyeti, na ujipatie pointi za XP.'}
        </p>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <button 
            onClick={() => onNavigate('login')}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
          >
            <LogIn size={18} />
            <span>{lang === 'en' ? 'Login' : 'Ingia'}</span>
          </button>
          <button 
            onClick={() => onNavigate('reg')}
            className="w-full h-12 border border-theme hover:bg-card2 text-text1 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs uppercase tracking-wider"
          >
            <UserPlus size={18} />
            <span>{lang === 'en' ? 'Create Free Account' : 'Fungua Akaunti Bure'}</span>
          </button>
        </div>
      </div>
    );
  }

  const allItems = [...courses, ...tests, ...lectures];
  const ownedItems = allItems.filter(item => lib[item.id] || item.isFree || item.price === 0);

  const handleCopyReferral = () => {
    const code = `CODZNZ-${user.uid.slice(0, 5).toUpperCase()}`;
    navigator.clipboard.writeText(`https://codznz.pro/?ref=${code}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="space-y-6 page-anim pb-12">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary via-indigo-600 to-accent p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/30 shadow-inner">
            {getInitials(profile?.name || user.displayName || user.email || 'User')}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate font-poppins">{profile?.name || user.displayName || user.email?.split('@')[0]}</h2>
            <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Trophy size={12} className="text-gold" />
                {pts || 0} XP
              </span>
              <span className="text-[10px] text-white/70">Level {Math.floor((pts || 0) / 200) + 1} Scholar</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 p-4 opacity-10 pointer-events-none">
          <Bolt size={140} />
        </div>
      </div>

      {/* Streak & Weekly Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-2xl text-white flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Flame size={22} fill="currentColor" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold">{strk || 1} {lang === 'en' ? 'Day Streak 🔥' : 'Siku za Mfululizo 🔥'}</div>
            <div className="text-[10px] text-white/85">{lang === 'en' ? "Daily study goal active" : "Lengo la kila siku linaendelea"}</div>
          </div>
        </div>

        <div className="bg-card border border-theme p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-bold text-text1 flex items-center gap-1">
              <Award size={14} className="text-gold" />
              <span>{lang === 'en' ? 'Refer & Earn XP' : 'Alika Marafiki'}</span>
            </div>
            <div className="text-[10px] text-text3 mt-0.5">{lang === 'en' ? '+150 XP per joined friend' : '+150 XP kwa kila rafiki'}</div>
          </div>
          <button
            onClick={handleCopyReferral}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
          >
            {copiedRef ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
            <span>{copiedRef ? (lang === 'en' ? 'Copied' : 'Imenakiliwa') : (lang === 'en' ? 'Share' : 'Shiriki')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-primary">{ownedItems.length}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'Courses' : 'Kozi'}</div>
        </div>
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-gold">{pts}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'XP Points' : 'Pointi'}</div>
        </div>
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-ok">{strk || 1}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'Streak' : 'Mpango'}</div>
        </div>
      </div>

      {/* Notifications / Announcements */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold px-1 text-xs uppercase tracking-widest text-text3 flex items-center gap-1.5">
            <Bell size={13} className="text-primary" />
            <span>{lang === 'en' ? 'Recent Updates' : 'Taarifa Mpya'}</span>
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div 
                key={n.id} 
                onClick={() => markNotificationRead(n.id)}
                className="bg-card border border-theme p-3.5 rounded-2xl flex items-start gap-3 shadow-sm cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text1">{n.title}</div>
                  <div className="text-[11px] text-text3 mt-0.5 line-clamp-2">{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress / My Active Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs uppercase tracking-widest text-text3">
            {lang === 'en' ? 'Active Courses' : 'Masomo Yangu'}
          </h3>
          <button 
            onClick={() => onNavigate('lib')}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span>{lang === 'en' ? 'View All' : 'Ona Yote'}</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {ownedItems.length === 0 ? (
          <div className="bg-card2 border border-theme border-dashed p-8 rounded-3xl text-center space-y-3">
            <p className="text-text3 text-xs">{lang === 'en' ? 'No active courses yet. Explore courses to start learning!' : 'Bado hujaanza somo lolote. Gundua masomo mapya uanze kujifunza!'}</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-5 h-10 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
            >
              {lang === 'en' ? 'Explore Catalog' : 'Gundua Mafunzo'}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ownedItems.slice(0, 3).map((item) => {
              const eps = item.episodes || [];
              const completedCount = eps.filter((_, idx) => completedEpisodes[`${item.id}_ep_${idx}`]).length;
              const percent = eps.length > 0 ? Math.round((completedCount / eps.length) * 100) : 75;

              return (
                <div 
                  key={item.id}
                  onClick={() => onOpenContent ? onOpenContent(item.id) : onNavigate('lib')}
                  className="bg-card border border-theme p-4 rounded-2xl shadow-sm hover:border-primary/40 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl">{item.icon || '📚'}</span>
                      <span className="text-xs font-bold text-text1 truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-card2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
