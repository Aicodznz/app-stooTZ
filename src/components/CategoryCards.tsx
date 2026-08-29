import React from 'react';
import { Category } from '../types';
import { cn } from '../lib/utils';
import { BookOpen, Award, Video, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface CategoryCardsProps {
  onSelect: (cat: Category | 'lb') => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onSelect }) => {
  const { lang, courses, tests, lectures } = useApp();
  
  const items = [
    { 
      id: 'courses', 
      icon: BookOpen, 
      count: courses.length,
      label: { en: 'Courses', sw: 'Kozi za Kisasa' }, 
      desc: { en: 'Structured modules & docs', sw: 'Bobea kuanzia mwanzo' },
      gradient: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    { 
      id: 'tests', 
      icon: Award, 
      count: tests.length,
      label: { en: 'Practice Tests', sw: 'Majaribio & Mitihani' }, 
      desc: { en: 'Certifications & quizzes', sw: 'Pima uelewa & cheti' },
      gradient: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    { 
      id: 'lectures', 
      icon: Video, 
      count: lectures.length,
      label: { en: 'Video Lectures', sw: 'Vipindi vya Video' }, 
      desc: { en: 'Hands-on practicals', sw: 'Mafunzo ya vitendo' },
      gradient: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    { 
      id: 'lb', 
      icon: Trophy, 
      count: 'Top',
      label: { en: 'Rankings', sw: 'Vyeo & Ubao' }, 
      desc: { en: 'Leaderboard stars', sw: 'Wanafunzi bora' },
      gradient: 'from-purple-600 to-pink-600',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-text2 flex items-center gap-1.5">
          <span>{lang === 'en' ? 'Quick Access' : 'Vitengo Vikuu'}</span>
        </h3>
        <span className="text-[11px] text-text3 font-medium">
          {lang === 'en' ? 'Select category' : 'Chagua kitengo'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              onClick={() => onSelect(it.id as Category | 'lb')}
              className={cn(
                "group relative bg-card border border-theme rounded-2xl p-4 text-left",
                "shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all duration-200 flex flex-col justify-between"
              )}
            >
              <div className="flex items-start justify-between mb-3 w-full">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm bg-gradient-to-br transition-transform group-hover:scale-105",
                  it.gradient
                )}>
                  <Icon size={20} />
                </div>
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-md border",
                  it.badgeBg
                )}>
                  {it.count}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-text1 leading-tight group-hover:text-primary transition-colors font-heading">
                  {lang === 'en' ? it.label.en : it.label.sw}
                </h4>
                <p className="text-[11px] text-text3 mt-1 line-clamp-1 leading-normal">
                  {lang === 'en' ? it.desc.en : it.desc.sw}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-theme flex items-center justify-between text-[10px] font-bold text-primary">
                <span>{lang === 'en' ? 'Open' : 'Fungua'}</span>
                <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

