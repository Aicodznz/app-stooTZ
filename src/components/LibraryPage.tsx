import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ContentCard } from './ContentCard';
import { Category } from '../types';
import { BookMarked, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export const LibraryPage: React.FC<{ onOpenContent: (id: string) => void }> = ({ onOpenContent }) => {
  const { lang, lib, courses, tests, lectures, user } = useApp();
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all');

  const allItems = [...courses, ...tests, ...lectures];
  const myItems = allItems.filter(item => lib[item.id] || item.isFree || item.price === 0);
  
  const filteredItems = activeTab === 'all' 
    ? myItems 
    : myItems.filter(item => item.category === activeTab);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-text3">
        <BookMarked size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">{lang === 'en' ? 'Login to see your library' : 'Ingia kuona maktaba yako'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-anim">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text3">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder={lang === 'en' ? 'Search your library...' : 'Tafuta katika maktaba...'}
          className="w-full bg-card border border-theme h-12 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'courses', 'tests', 'lectures'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              activeTab === tab 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-card text-text2 border-theme hover:bg-card2"
            )}
          >
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-text3">
          <div className="w-16 h-16 bg-card2 border border-theme rounded-3xl flex items-center justify-center mb-4">
            <BookMarked size={32} className="opacity-50" />
          </div>
          <p className="text-sm font-bold">{lang === 'en' ? 'Your library is empty' : 'Maktaba yako haina kitu'}</p>
          <p className="text-xs mt-1 p-4">{lang === 'en' ? 'Purchase courses or discover free content to get started.' : 'Nunua kozi au gundua maudhui ya bure kuanza.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <ContentCard key={item.id} item={item} onClick={onOpenContent} />
          ))}
        </div>
      )}
    </div>
  );
};
