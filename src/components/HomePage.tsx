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
import { Category, LearningBundle } from '../types';
import { ChevronLeft, Sparkles, Smartphone, Gift, Award } from 'lucide-react';

export const HomePage: React.FC<{ 
  onOpenApp: (id: string) => void; 
  onOpenLB: () => void; 
  onOpenContent: (id: string) => void;
  onOpenCart?: () => void;
}> = ({ onOpenApp, onOpenLB, onOpenContent, onOpenCart }) => {
  const { banners, apps, courses, tests, lectures, lang, addToCart } = useApp();
  const [subView, setSubView] = useState<Category | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

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


