import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Bell, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Upload, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../lib/utils';
import { UserSubscriptionPlan } from '../../types';

interface Props {
  onClose: () => void;
  onActivated?: () => void;
  requiredFeature?: string;
}

export const SubscriptionPlansModal: React.FC<Props> = ({ 
  onClose, 
  onActivated,
  requiredFeature 
}) => {
  const { lang, profile } = useApp();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const [selectedPlan, setSelectedPlan] = useState<'gold' | 'platinum'>('platinum');
  const [currency, setCurrency] = useState<'TZS' | 'BDT' | 'USD'>('TZS');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'tigopesa' | 'bkash' | 'nagad' | 'wallet'>('wallet');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  // Local storage for persistent active plan
  const [activePlan, setActivePlan] = useState<UserSubscriptionPlan>(() => {
    try {
      const saved = localStorage.getItem('wevlo_subscription_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { planType: 'platinum', expiresAt: Date.now() + 89 * 86400000, isActive: true };
  });

  const prices = {
    gold: { TZS: '1,000', BDT: '100', USD: '1' },
    platinum: { TZS: '2,000', BDT: '200', USD: '2' }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    showToast(lang === 'en' ? 'Account number copied!' : 'Nambari imenakiliwa!');
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleActivate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newPlan: UserSubscriptionPlan = {
        planType: selectedPlan,
        expiresAt: Date.now() + (selectedPlan === 'platinum' ? 60 : 30) * 86400000,
        isActive: true
      };
      setActivePlan(newPlan);
      localStorage.setItem('wevlo_subscription_plan', JSON.stringify(newPlan));
      setIsProcessing(false);
      setIsActivated(true);
      showToast(lang === 'en' ? 'Plan successfully activated!' : 'Kifurushi kimewashwa kikamilifu!');
      if (onActivated) onActivated();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[320] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto page-anim">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Crown size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{lang === 'en' ? 'Wevlo Studio Pro Plans' : 'Vifurushi vya Wevlo Studio Pro'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO APK BUILDER
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' 
                  ? 'Unlock AES-256 asset encryption, FCM push notifications, and custom AdMob' 
                  : 'Fungua usimbaji fiche wa AES-256, arifa za FCM na matangazo ya AdMob'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Required feature banner if triggered by a locked feature */}
        {requiredFeature && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
            <Sparkles size={18} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              {lang === 'en' 
                ? `The feature "${requiredFeature}" requires an active Gold or Platinum plan to compile.`
                : `Kipengele cha "${requiredFeature}" kinahitaji kifurushi cha Gold au Platinum ili kukusanya app.`}
            </p>
          </div>
        )}

        {/* Active Plan Countdown Banner */}
        {activePlan.isActive && (
          <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                  {lang === 'en' ? 'Active Plan:' : 'Kifurushi Kilicho Hai:'} {activePlan.planType.toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                ✓ All Pro Features Unlocked
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <Clock size={13} className="text-emerald-400" />
              <span>
                {Math.max(1, Math.floor((activePlan.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))} {lang === 'en' ? 'Days remaining' : 'Siku zilizobaki'}
              </span>
            </div>
          </div>
        )}

        {/* Currency Switcher */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{lang === 'en' ? 'Select Currency:' : 'Chagua Sarafu:'}</span>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {(['TZS', 'BDT', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                  currency === c ? "bg-amber-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
                )}
              >
                {c === 'TZS' ? 'TSh (TZ)' : c === 'BDT' ? '৳ BDT' : '$ USD'}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Gold Plan */}
          <div 
            onClick={() => setSelectedPlan('gold')}
            className={cn(
              "p-5 rounded-2xl border transition-all cursor-pointer relative space-y-4",
              selectedPlan === 'gold' 
                ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10" 
                : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
            )}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">Gold</h4>
              <span className="text-[11px] text-slate-400 font-semibold">1 {lang === 'en' ? 'Month' : 'Mwezi'}</span>
            </div>

            <div>
              <div className="text-2xl font-black text-white">
                {currency === 'TZS' ? 'TSh ' : currency === 'BDT' ? '৳' : '$'}
                {prices.gold[currency]}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'en' ? 'Billed monthly' : 'Inalipwa kila mwezi'}
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-amber-400" />
                <span>Standard HTML/CSS/JS APK Build</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-amber-400" />
                <span>Custom Status Bar & Splash Screen</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-amber-400" />
                <span>V1 + V2 Signed APK</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <X size={14} />
                <span>AES-256 Asset Encryption</span>
              </li>
            </ul>

            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPlan('gold'); setShowPaymentModal(true); }}
              className={cn(
                "w-full py-2.5 rounded-xl font-black text-xs transition-all",
                selectedPlan === 'gold' 
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950" 
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              )}
            >
              {lang === 'en' ? 'Select Gold Plan' : 'Chagua Kifurushi cha Gold'}
            </button>
          </div>

          {/* Platinum Plan (Recommended) */}
          <div 
            onClick={() => setSelectedPlan('platinum')}
            className={cn(
              "p-5 rounded-2xl border transition-all cursor-pointer relative space-y-4",
              selectedPlan === 'platinum' 
                ? "bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20" 
                : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
            )}
          >
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-black uppercase text-white shadow-md">
              Most Popular
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown size={15} />
                <span>Platinum</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold">2 {lang === 'en' ? 'Months' : 'Miezi'}</span>
            </div>

            <div>
              <div className="text-2xl font-black text-white">
                {currency === 'TZS' ? 'TSh ' : currency === 'BDT' ? '৳' : '$'}
                {prices.platinum[currency]}
              </div>
              <p className="text-[11px] text-slate-400">
                {lang === 'en' ? 'Billed every 2 months' : 'Inalipwa kila miezi 2'}
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-indigo-400" />
                <span className="font-bold text-white">All Gold Features Included</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-400" />
                <span className="font-semibold text-indigo-200">AES-256 Code & Asset Encryption</span>
              </li>
              <li className="flex items-center gap-2">
                <Bell size={14} className="text-indigo-400" />
                <span className="font-semibold text-indigo-200">FCM Push Notifications & Dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap size={14} className="text-indigo-400" />
                <span className="font-semibold text-indigo-200">Google AdMob Ads (Banner & Interstitial)</span>
              </li>
            </ul>

            <button
              onClick={(e) => { e.stopPropagation(); setSelectedPlan('platinum'); setShowPaymentModal(true); }}
              className="w-full py-2.5 rounded-xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{lang === 'en' ? 'Activate Platinum Now' : 'Washa Platinum Sasa'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Payment / Activation Dialog */}
        {showPaymentModal && (
          <div className="p-5 bg-slate-950 border border-slate-700 rounded-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                {lang === 'en' ? `Payment for ${selectedPlan.toUpperCase()} Plan` : `Malipo ya Kifurushi cha ${selectedPlan.toUpperCase()}`}
              </h4>
              <button onClick={() => setShowPaymentModal(false)} className="text-xs text-slate-400 hover:text-white">
                Funga
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'wallet', name: 'Wallet', icon: '💳' },
                { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
                { id: 'tigopesa', name: 'TigoPesa', icon: '📲' },
                { id: 'bkash', name: 'bKash', icon: '🔴' },
                { id: 'nagad', name: 'Nagad', icon: '🟠' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={cn(
                    "p-2 rounded-xl border text-center transition-all",
                    paymentMethod === m.id 
                      ? "bg-indigo-600/20 border-indigo-500 text-white" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <div className="text-base">{m.icon}</div>
                  <div className="text-[10px] font-bold mt-1 truncate">{m.name}</div>
                </button>
              ))}
            </div>

            {/* Method Details */}
            {paymentMethod === 'wallet' ? (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Salio Lako la Wallet:</span>
                  <span className="font-bold text-emerald-400">TSh {(profile?.walletBalance || 15000).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Gharama ya Kifurushi:</span>
                  <span className="font-bold text-amber-300">
                    {currency === 'TZS' ? 'TSh ' : currency === 'BDT' ? '৳' : '$'}
                    {prices[selectedPlan][currency]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nambari ya Kutuma ({paymentMethod.toUpperCase()}):</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                    <span>+255 712 345 678</span>
                    <button 
                      onClick={() => handleCopyNumber('+255712345678')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                    >
                      {copiedNumber ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Ingiza Nambari ya Muamala (Transaction ID / TRXID):
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="mf. 9JH765TRX au BKT765432"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleActivate}
              disabled={isProcessing || (paymentMethod !== 'wallet' && !trxId.trim())}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:opacity-95 active:scale-95 text-white font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Inathibitisha na Kuwasha...</span>
                </>
              ) : isActivated ? (
                <>
                  <CheckCircle2 size={16} className="text-white" />
                  <span>Imewashwa Kikamilifu!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300" />
                  <span>
                    {paymentMethod === 'wallet' ? 'Thibitisha na Washa Papo Hapo' : 'Thibitisha Muamala na Washa'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
