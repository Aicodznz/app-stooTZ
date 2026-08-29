import React from 'react';
import { useApp } from '../contexts/AppContext';
import { BookOpen, Award, Video, Zap } from 'lucide-react';

export const HeroStats: React.FC = () => {
  const { lang, courses, tests, lectures, pts } = useApp();

  const stats = [
    {
      count: courses.length,
      label: lang === 'en' ? 'Courses' : 'Kozi',
      icon: BookOpen,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      count: tests.length,
      label: lang === 'en' ? 'Tests' : 'Mazoezi',
      icon: Award,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10'
    },
    {
      count: lectures.length,
      label: lang === 'en' ? 'Lectures' : 'Vipindi',
      icon: Video,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
  ];

  return (
    <div className="bg-card border border-theme rounded-2xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-wider text-text2">
            {lang === 'en' ? 'Learning Catalog' : 'Katalogi ya Masomo'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <Zap size={12} className="fill-current" />
          <span>{pts || 0} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div 
              key={idx} 
              className="bg-card2 border border-theme rounded-xl p-2.5 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]"
            >
              <div className={`w-7 h-7 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-1`}>
                <Icon size={14} />
              </div>
              <div className="text-base font-black text-text1 leading-tight font-heading">
                {s.count}
              </div>
              <div className="text-[10px] font-bold text-text3 uppercase tracking-tight">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

