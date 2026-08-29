import React from 'react';
import { ContentItem } from '../types';
import { cn, formatPrice } from '../lib/utils';
import { BookOpen, Award, Video, ChevronRight } from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  onClick: (id: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, onClick }) => {
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'courses': return <BookOpen size={12} />;
      case 'tests': return <Award size={12} />;
      case 'lectures': return <Video size={12} />;
      default: return null;
    }
  };

  return (
    <button
      onClick={() => onClick(item.id)}
      className="group bg-card border border-theme rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all text-left flex flex-col justify-between"
    >
      <div className="relative aspect-video w-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center text-3xl overflow-hidden">
        {item.coverB64 ? (
          <img src={item.coverB64} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="group-hover:scale-110 transition-transform duration-200">{item.icon || '📚'}</span>
        )}

        {(item.isFree || item.price === 0) ? (
          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow-sm">
            Free
          </span>
        ) : (
          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {formatPrice(item.price)}
          </span>
        )}
      </div>

      <div className="p-3 w-full">
        <h4 className="font-bold text-xs md:text-sm text-text1 line-clamp-2 group-hover:text-primary transition-colors font-heading leading-tight">
          {item.title}
        </h4>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-text3 uppercase tracking-wider">
            {getCategoryIcon()}
            {item.category}
          </span>
          <span className="text-xs font-black text-primary">
            {(item.isFree || item.price === 0) ? 'TZS 0' : formatPrice(item.price)}
          </span>
        </div>
      </div>
    </button>
  );
};

