import React from 'react';
import { useApp } from '../contexts/AppContext';
import { SEED_LEADERBOARD } from '../constants';
import { Trophy, Crown, Gem, Sparkles, Medal } from 'lucide-react';
import { cn, getInitials } from '../lib/utils';

export const LeaderboardPage: React.FC = () => {
  const { lang, pts, profile, user } = useApp();
  
  // Combine seed with current user if possible
  const leaderboard = [...SEED_LEADERBOARD]
    .sort((a, b) => b.points - a.points);

  const podium = [leaderboard[1], leaderboard[0], leaderboard[2]];

  return (
    <div className="page-anim space-y-4">
      {/* Header card with podium */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-5 text-center text-white shadow-lg border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-5">
            <Trophy size={14} className="text-amber-400" />
            <span>{lang === 'en' ? 'Top Ranked Scholars' : 'Wanafunzi Bora wa Kitaifa'}</span>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-2.5 mt-2 h-36">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-slate-800 mb-1 overflow-hidden shadow-sm">
                <div className="w-full h-full flex items-center justify-center bg-slate-700 text-[10px] font-black text-slate-200">
                  {getInitials(podium[0].name)}
                </div>
              </div>
              <div className="w-14 bg-slate-700/90 h-[58px] rounded-t-xl flex flex-col items-center justify-center border-t border-slate-400/40 shadow-md">
                <span className="text-xs font-black text-slate-200">2nd</span>
                <span className="text-[9px] text-slate-300">{podium[0].points} XP</span>
              </div>
              <span className="text-[10px] font-bold mt-1.5 text-slate-200 line-clamp-1 w-14">{podium[0].name.split(' ')[0]}</span>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center relative -top-1">
              <div className="text-lg animate-bounce mb-0.5">👑</div>
              <div className="w-13 h-13 rounded-full border-2 border-amber-400 bg-amber-950 mb-1 overflow-hidden shadow-glow">
                <div className="w-full h-full flex items-center justify-center bg-amber-500/20 text-amber-300 text-xs font-black">
                  {getInitials(podium[1].name)}
                </div>
              </div>
              <div className="w-16 bg-gradient-to-t from-amber-600 to-amber-500 h-[76px] rounded-t-xl border-t border-amber-300 flex flex-col items-center justify-center text-white shadow-lg">
                <span className="text-sm font-black">1st</span>
                <span className="text-[9px] text-amber-100 font-bold">{podium[1].points} XP</span>
              </div>
              <span className="text-[11px] font-black mt-1.5 text-amber-200 line-clamp-1 w-16">{podium[1].name.split(' ')[0]}</span>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-amber-700 bg-slate-800 mb-1 overflow-hidden shadow-sm">
                <div className="w-full h-full flex items-center justify-center bg-amber-900/40 text-amber-400 text-[10px] font-black">
                  {getInitials(podium[2].name)}
                </div>
              </div>
              <div className="w-14 bg-amber-900/70 h-[48px] rounded-t-xl flex flex-col items-center justify-center border-t border-amber-600/40 shadow-md">
                <span className="text-xs font-black text-amber-200">3rd</span>
                <span className="text-[9px] text-amber-300">{podium[2].points} XP</span>
              </div>
              <span className="text-[10px] font-bold mt-1.5 text-slate-200 line-clamp-1 w-14">{podium[2].name.split(' ')[0]}</span>
            </div>
          </div>

          {/* User Stats bar */}
          {user && (
            <div className="mt-5 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shadow-sm">
                  {getInitials(profile?.name || user.email || '')}
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-white/70 uppercase font-bold">{lang === 'en' ? 'Your Ranking Score' : 'Alama Zako'}</div>
                  <div className="text-xs font-black text-white">{pts || 0} XP Points</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold">
                <Gem size={13} className="text-amber-400" />
                <span>Level {Math.floor((pts || 0) / 200) + 1}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-text2 px-1">
          {lang === 'en' ? 'All Participants' : 'Washiriki Wengine'}
        </h3>
        
        <div className="space-y-2">
          {leaderboard.slice(3).map((item, idx) => {
            return (
              <div 
                key={idx}
                className="flex items-center p-3 rounded-2xl border border-theme bg-card hover:bg-card2 transition-colors shadow-sm"
              >
                <div className="w-7 text-center font-black text-text3 text-xs">{idx + 4}</div>
                <div className="w-9 h-9 rounded-xl bg-card2 border border-theme flex items-center justify-center text-xs font-bold mr-3 text-text1">
                  {getInitials(item.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text1 truncate font-heading">{item.name}</div>
                  <div className="text-[10px] text-text3 font-medium">{item.points.toLocaleString()} XP</div>
                </div>
                <div className="flex items-center gap-1 text-primary font-black text-xs bg-primary/10 px-2 py-0.5 rounded-md">
                  <Sparkles size={11} />
                  <span>#{idx + 4}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

