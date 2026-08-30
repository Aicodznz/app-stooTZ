import React from 'react';
import { useApp } from '../contexts/AppContext';
import { LearningBundle } from '../types';
import { formatPrice } from '../lib/utils';
import { Layers, CheckCircle2, ArrowRight, Clock, Sparkles } from 'lucide-react';

interface BundlesSectionProps {
  onSelectBundle: (bundle: LearningBundle) => void;
  onOpenContent: (id: string) => void;
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({ onSelectBundle, onOpenContent }) => {
  const { bundles, courses, tests, lectures, lang, lib } = useApp();

  const allItems = [...courses, ...tests, ...lectures];

  if (!bundles || bundles.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Layers size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text1">
              {lang === 'en' ? 'Learning Paths & Bundles' : 'Vifurushi vya Masomo (Bundles)'}
            </h3>
            <p className="text-[10px] text-text3">
              {lang === 'en' ? 'Combined packages at special discounted rates' : 'Unganisha masomo kadhaa kwa bei nafuu na upate vyeti vyote'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          DISCOUNT
        </span>
      </div>

      {/* Horizontal Scroll for Bundles */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x">
        {bundles.map(bundle => {
          const bundleCourses = allItems.filter(item => bundle.courseIds.includes(item.id));
          const isOwned = bundle.courseIds.every(id => lib[id]);

          return (
            <div 
              key={bundle.id}
              className="min-w-[280px] max-w-[300px] bg-card border border-theme rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all shrink-0 snap-start relative group"
            >
              {bundle.badge && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 shadow-xs">
                  {bundle.badge}
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-card2 border border-theme flex items-center justify-center text-xl shrink-0 shadow-inner">
                    {bundle.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h4 className="text-xs font-black text-text1 leading-tight group-hover:text-primary transition-colors truncate">
                      {bundle.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text3">
                      <span className="font-bold">{bundle.duration}</span>
                      <span>•</span>
                      <span>{bundleCourses.length} {lang === 'en' ? 'items' : 'masomo'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-text3 line-clamp-2 leading-relaxed">
                  {bundle.desc}
                </p>

                {/* Micro tags */}
                {bundle.skills && bundle.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {bundle.skills.slice(0, 3).map((skill, i) => (
                      <span 
                        key={i}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-card2 text-text2 border border-theme"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="pt-3 mt-3 border-t border-theme flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-primary font-mono">{formatPrice(bundle.price)}</span>
                    {bundle.originalPrice > bundle.price && (
                      <span className="text-[10px] text-text3 line-through">{formatPrice(bundle.originalPrice)}</span>
                    )}
                  </div>
                </div>

                {isOwned ? (
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Tayari unacho</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectBundle(bundle)}
                    className="h-8 px-3 bg-primary hover:bg-primary/90 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs flex items-center gap-1 transition-all"
                  >
                    <span>{lang === 'en' ? 'Get Bundle' : 'Pata Bundle'}</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

