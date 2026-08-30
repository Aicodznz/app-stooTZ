import React from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  Gift, 
  Award, 
  Zap, 
  Layers,
  PhoneCall
} from 'lucide-react';

interface PersuasiveHeroProps {
  onStartFree: () => void;
  onOpenReferral: () => void;
  onOpenBadges: () => void;
  onOpenBundles: () => void;
}

export const PersuasiveHero: React.FC<PersuasiveHeroProps> = ({
  onStartFree,
  onOpenReferral,
  onOpenBadges,
  onOpenBundles
}) => {
  const { lang, courses, tests, lectures, pts, strk, profile } = useApp();

  return (
    <div className="space-y-3.5">
      {/* Main Persuasive Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 sm:p-7 border border-indigo-500/20 shadow-xl">
        {/* Glow ambient background circles */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Live Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{lang === 'en' ? '🇹🇿 #1 Tech & Coding Academy' : '🇹🇿 Jukwaa #1 la Coding Tanzania & Zanzibar'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={onOpenReferral}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-bold text-amber-300 transition-all active:scale-95"
              >
                <Gift size={13} className="text-amber-400" />
                <span>{lang === 'en' ? 'Refer & Earn' : 'Alika Rafiki'} (+150 XP)</span>
              </button>
            </div>
          </div>

          {/* Main Headline & Tagline */}
          <div className="space-y-1.5 max-w-xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight font-heading leading-tight text-white">
              {lang === 'en' ? (
                <>Become a High-Paid <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-pink-300">Software Developer</span> in Swahili</>
              ) : (
                <>Jifunze Coding, Boresha Programu, na Pata <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-pink-300">Vyeti Rasmi vya TEHAMA</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'en'
                ? 'Master Web & Mobile Development with practical projects, real exams, direct USSD Push payments, and verified developer publishing.'
                : 'Masomo ya vitendo ya Web, Python na Mobile Apps. Fanya mitihani ya majaribio, lipia papo hapo kwa M-Pesa/Tigo USSD, na uweke Apps zako sokoni.'}
            </p>
          </div>

          {/* High-Conversion Primary CTA Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onStartFree}
              className="h-12 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all"
            >
              <Sparkles size={18} className="fill-current text-slate-950" />
              <span>{lang === 'en' ? 'Start Learning Free →' : 'Anza Bure Leo →'}</span>
            </button>

            <button
              onClick={onOpenBundles}
              className="h-12 px-4 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all backdrop-blur-sm"
            >
              <Layers size={16} className="text-indigo-300" />
              <span>{lang === 'en' ? 'Learning Paths' : 'Vifurushi vya Masomo'}</span>
            </button>

            <button
              onClick={onOpenBadges}
              className="h-12 px-4 bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all"
            >
              <Award size={16} className="text-amber-400" />
              <span>{lang === 'en' ? 'Badges' : 'Mabingwa'}</span>
            </button>
          </div>

          {/* Trust Strip */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Users size={16} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">14,200+</div>
                <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Active Students' : 'Wanafunzi Waliojiunga'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <Star size={16} className="fill-current" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">4.9 / 5.0 ★</div>
                <div className="text-[10px] text-slate-400">{lang === 'en' ? '3,800+ Reviews' : 'Maoni 3,800+'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">98% Pass Rate</div>
                <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Verified Certificates' : 'Vyeti vya Majaribio'}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <PhoneCall size={16} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white leading-tight">USSD Push</div>
                <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Instant Mobile Pay' : 'M-Pesa / Tigo / Airtel'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
