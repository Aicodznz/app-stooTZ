import React from 'react';
import { useApp } from '../contexts/AppContext';
import { AchievementBadge } from '../types';
import { 
  X, 
  Award, 
  Trophy, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Zap, 
  Share2,
  Flame,
  Star
} from 'lucide-react';

export const BadgesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { badges, unlockedBadges, pts, strk, lang, unlockBadge } = useApp();

  const getLevelColor = (level: AchievementBadge['badgeLevel']) => {
    switch (level) {
      case 'Bronze': return 'border-amber-700/40 bg-amber-900/10 text-amber-600 dark:text-amber-400';
      case 'Silver': return 'border-slate-400/40 bg-slate-500/10 text-slate-300';
      case 'Gold': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
      case 'Diamond': return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400';
      default: return 'border-theme bg-card2 text-text1';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 page-anim">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-card w-full max-w-xl max-h-[85vh] rounded-3xl border border-theme shadow-2xl overflow-hidden flex flex-col text-text1">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-theme flex items-center justify-between bg-card2/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {lang === 'en' ? 'Achievement Badges & Trophies' : 'Mabingwa & Beji za Mafanikio'}
              </h3>
              <p className="text-[11px] text-text3">
                {unlockedBadges.length} / {badges.length} {lang === 'en' ? 'Badges Unlocked' : 'Beji Zimefunguliwa'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text3 hover:text-text1 hover:bg-card2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* XP Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border-b border-theme flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-md">
              XP
            </div>
            <div>
              <div className="text-xs font-bold text-text1">{pts} Points (XP)</div>
              <div className="text-[10px] text-text3">{strk} Days Streak 🔥</div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            {lang === 'en' ? 'Keep Learning to Rank Up' : 'Endelea Kujifunza Kupanda Daraja'}
          </span>
        </div>

        {/* Badges Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map(badge => {
              const isUnlocked = unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isUnlocked 
                      ? `${getLevelColor(badge.badgeLevel)} shadow-sm` 
                      : 'border-theme bg-card2/50 opacity-75 grayscale'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${
                      isUnlocked ? 'bg-card' : 'bg-bg3 text-text3'
                    }`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-black text-xs text-text1 truncate">
                          {lang === 'en' ? badge.title : badge.titleSw}
                        </h4>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-card border border-theme">
                          {badge.badgeLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-text2 leading-tight mt-1">
                        {lang === 'en' ? badge.desc : badge.descSw}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-theme/40 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Zap size={12} className="fill-current" />
                      <span>+{badge.xpBonus} XP</span>
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-500 text-[10px]">
                        <CheckCircle2 size={12} />
                        <span>{lang === 'en' ? 'Unlocked' : 'Imefunguliwa'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => unlockBadge(badge.id)}
                        className="flex items-center gap-1 font-bold text-text3 hover:text-primary transition-colors text-[10px] bg-card px-2 py-0.5 rounded-lg border border-theme"
                      >
                        <Lock size={10} />
                        <span>{lang === 'en' ? 'Click to Unlock' : 'Fungua Sasa'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
