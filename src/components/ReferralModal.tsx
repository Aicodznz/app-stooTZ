import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  X, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  MessageCircle, 
  Users, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ReferralModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, profile, lang, claimReferral, pts } = useApp();
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate clean personalized referral code
  const referralCode = profile?.referralCode || (
    user?.email 
      ? `CODZNZ-${user.email.split('@')[0].toUpperCase().slice(0, 8)}` 
      : `CODZNZ-${(profile?.name || 'STUDENT').toUpperCase().slice(0, 6)}77`
  );

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Habari! Jiunge nami kwenye CodZnz Pro ujifunze Coding, Programu na Web Development kwa Kiswahili na Kiingereza. Tumia msimbo wangu ${referralCode} kupata pointi 100 XP za bure! Bonyeza hapa: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setClaimLoading(true);
    setClaimMsg(null);

    const res = await claimReferral(inputCode.trim());
    setClaimLoading(false);

    if (res.success) {
      setClaimMsg({ type: 'success', text: res.message });
      setInputCode('');
    } else {
      setClaimMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 page-anim">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-card w-full max-w-md rounded-3xl border border-theme shadow-2xl overflow-hidden flex flex-col text-text1">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-theme flex items-center justify-between bg-card2/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              🎁
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {lang === 'en' ? 'Refer & Earn Points' : 'Mpango wa Mialiko (Referral)'}
              </h3>
              <p className="text-[11px] text-text3">
                {lang === 'en' ? 'Invite friends & earn free rewards together' : 'Alika marafiki na muongeze pointi za bure'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-text3 hover:text-text1 hover:bg-card2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Hero Explainer Box */}
          <div className="bg-gradient-to-br from-amber-500/10 via-primary/10 to-pink-500/10 border border-amber-500/20 rounded-2xl p-4 text-center space-y-2">
            <div className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
              <Sparkles size={12} />
              <span>{lang === 'en' ? 'DOUBLE REWARD PROGRAM' : 'ZAWADI YA MARA MBILI'}</span>
            </div>
            <h4 className="text-base font-black text-text1">
              {lang === 'en' ? 'You get +150 XP, Friend gets +100 XP' : 'Wewe unapata +150 XP, Rafiki anapata +100 XP'}
            </h4>
            <p className="text-xs text-text2 leading-relaxed">
              {lang === 'en'
                ? 'Share your referral code. Whenever someone signs up using your link or code, both of you get instant XP bonus for discounts & leaderboard rank!'
                : 'Shiriki kiungo chako cha mwaliko. Mtu akijiunga kwa msimbo wako, wote mnapata pointi za bure za kuongeza daraja na kupata punguzo la masomo!'}
            </p>
          </div>

          {/* Referral Code Box */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-text3 block">
              {lang === 'en' ? 'Your Referral Code & Link' : 'Msimbo & Kiungo Chako cha Mwaliko'}
            </label>
            <div className="flex items-center gap-2 bg-card2 border border-theme rounded-2xl p-2">
              <div className="flex-1 px-3 py-1 text-xs font-mono font-black text-primary truncate">
                {referralCode}
              </div>
              <button
                onClick={handleCopy}
                className="h-9 px-3.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? (lang === 'en' ? 'Copied!' : 'Imenakiliwa!') : (lang === 'en' ? 'Copy Link' : 'Nakili')}</span>
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-text3 block">
              {lang === 'en' ? 'Quick Social Share' : 'Shiriki Moja kwa Moja'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopy}
                className="h-10 bg-card2 hover:bg-card border border-theme text-text1 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Share2 size={16} className="text-primary" />
                <span>{lang === 'en' ? 'Copy Referral URL' : 'Nakili Kiungo'}</span>
              </button>
            </div>
          </div>

          {/* Enter Friend's Code Form */}
          <div className="pt-3 border-t border-theme space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-text3 block">
              {lang === 'en' ? 'Have a referral code from a friend?' : 'Umepewa msimbo wa mwaliko na rafiki?'}
            </label>
            
            {profile?.referredBy ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-500 flex items-center gap-2">
                <Check size={16} />
                <span>Umeshajiunga kwa msimbo wa: {profile.referredBy}</span>
              </div>
            ) : (
              <form onSubmit={handleClaim} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mfano: CODZNZ-BARAKA"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 h-11 px-3 bg-card2 border border-theme rounded-xl text-xs font-mono uppercase text-text1 placeholder:text-text3 outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={claimLoading || !inputCode.trim()}
                  className="h-11 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0"
                >
                  <span>{claimLoading ? '...' : (lang === 'en' ? 'Claim +100 XP' : 'Chukua XP')}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {claimMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-bold ${
                claimMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {claimMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
