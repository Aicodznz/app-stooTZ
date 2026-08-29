import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { cn } from '../lib/utils';
import { Sparkles, ArrowRight } from 'lucide-react';

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const itv = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 4500);
    return () => clearInterval(itv);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative w-full h-44 overflow-hidden rounded-2xl shadow-md border border-theme group">
      {banners.map((banner, idx) => (
        <div
          key={banner.id}
          onClick={() => banner.linkUrl && window.open(banner.linkUrl, '_blank')}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out flex flex-col justify-between p-5 cursor-pointer",
            idx === current ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
            !banner.imgUrl && !banner.imgB64 && "bg-gradient-to-tr from-indigo-900 via-indigo-700 to-purple-600 text-white"
          )}
          style={{
            backgroundImage: banner.imgUrl ? `url(${banner.imgUrl})` : banner.imgB64 ? `url(${banner.imgB64})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {(banner.imgUrl || banner.imgB64) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          )}

          {/* Top Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
              <Sparkles size={11} className="fill-current" />
              {banner.badge || 'PRO'}
            </span>
            <span className="text-[11px] font-bold text-white/80 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full">
              {idx + 1} / {banners.length}
            </span>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 space-y-1">
            <h3 className="text-white text-base md:text-lg font-black leading-tight drop-shadow-sm font-heading">
              {banner.title}
            </h3>
            <p className="text-white/85 text-xs line-clamp-1 leading-normal font-medium">
              {banner.subtitle}
            </p>
          </div>
        </div>
      ))}
      
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx === current ? "bg-white w-5 shadow-sm" : "bg-white/40 w-1.5 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

