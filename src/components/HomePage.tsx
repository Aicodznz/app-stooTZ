import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BannerSlider } from './BannerSlider';
import { HeroStats } from './HeroStats';
import { CategoryCards } from './CategoryCards';
import { AppCard } from './AppCard';
import { ContentCard } from './ContentCard';
import { Category } from '../types';
import { ChevronLeft, Sparkles, Smartphone } from 'lucide-react';

export const HomePage: React.FC<{ onOpenApp: (id: string) => void, onOpenLB: () => void, onOpenContent: (id: string) => void }> = ({ onOpenApp, onOpenLB, onOpenContent }) => {
  const { banners, apps, courses, tests, lectures, lang } = useApp();
  const [subView, setSubView] = useState<Category | null>(null);

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

  return (
    <div className="page-anim space-y-4">
      {!subView ? (
        <>
          {/* Banner Slider */}
          <BannerSlider banners={banners} />

          {/* Quick Metrics Bar */}
          <HeroStats />

          {/* Main Category Cards */}
          <CategoryCards onSelect={handleCategorySelect} />
          
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
    </div>
  );
};

