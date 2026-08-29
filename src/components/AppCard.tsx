import React from 'react';
import { CodApp } from '../types';
import { Star, Download, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface AppCardProps {
  app: CodApp;
  onClick: (id: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, onClick }) => {
  return (
    <button
      onClick={() => onClick(app.id)}
      className="group bg-card border border-theme rounded-2xl p-3.5 flex items-center gap-3.5 active:scale-[0.98] hover:border-primary/30 transition-all text-left w-full shadow-sm hover:shadow-md"
    >
      <div className="w-13 h-13 rounded-xl bg-card2 border border-theme flex items-center justify-center text-2xl shadow-inner flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
        {app.iconB64 ? (
          <img src={app.iconB64} alt={app.name} className="w-full h-full object-cover" />
        ) : (
          <span>{app.icon || '📱'}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-sm text-text1 truncate group-hover:text-primary transition-colors font-heading">
            {app.name}
          </h4>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
            app.priceType === 'free' 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}>
            {app.priceType}
          </span>
        </div>

        <p className="text-xs text-text3 line-clamp-1 mt-0.5">{app.desc}</p>

        <div className="flex items-center gap-2.5 mt-1.5 text-[11px] font-semibold text-text2">
          <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded text-[10px] font-black">
            <Star size={11} className="fill-current" />
            <span>{app.rating || '4.8'}</span>
          </div>
          <span className="text-text3 text-[10px]">{app.size || '35MB'}</span>
          <span className="font-bold text-primary ml-auto text-xs">{formatPrice(app.price)}</span>
        </div>
      </div>

      <div className="w-8 h-8 rounded-xl bg-card2 border border-theme flex items-center justify-center text-text3 group-hover:text-primary group-hover:border-primary/30 transition-colors flex-shrink-0">
        <Download size={15} />
      </div>
    </button>
  );
};

