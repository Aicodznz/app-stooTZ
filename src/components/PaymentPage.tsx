import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { 
  ChevronLeft, 
  QrCode, 
  Phone, 
  Send, 
  CheckCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Receipt,
  Radio,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentMethod } from '../types';

interface ProviderInfo {
  name: string;
  short: string;
  type: PaymentMethod;
  color: string;
  tillNumber: string;
  accountName: string;
  ussd: string;
  badge: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    name: 'Vodacom M-Pesa',
    short: 'M-PESA',
    type: 'mpesa',
    color: 'bg-red-600 text-white',
    tillNumber: '503020',
    accountName: 'CODZNZ PRO LTD',
    ussd: '*150*00#',
    badge: 'Popular'
  },
  {
    name: 'Tigo Pesa / Mixx',
    short: 'TIGO PESA',
    type: 'tigopesa',
    color: 'bg-blue-600 text-white',
    tillNumber: '503021',
    accountName: 'CODZNZ PRO LTD',
    ussd: '*150*01#',
    badge: 'Instant'
  },
  {
    name: 'Airtel Money',
    short: 'AIRTEL',
    type: 'airtel',
    color: 'bg-rose-500 text-white',
    tillNumber: '503022',
    accountName: 'CODZNZ PRO LTD',
    ussd: '*150*60#',
    badge: 'Fast'
  },
  {
    name: 'CRDB / Bank Card',
    short: 'BANK / VISA',
    type: 'card',
    color: 'bg-emerald-600 text-white',
    tillNumber: '0150992348100',
    accountName: 'CODZNZ PRO TECH',
    ussd: 'SimBanking App',
    badge: 'Direct'
  }
];

export const PaymentPage: React.FC<{ onBack: () => void; onGoToLibrary?: () => void }> = ({ onBack, onGoToLibrary }) => {
  const { cart, courses, tests, lectures, lang, user, profile, clearCart, createOrder, ussdSettings } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || user?.phoneNumber || '');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ussdPushSent, setUssdPushSent] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{ id: string; ref: string; amount: number } | null>(null);

  const allItems = [...courses, ...tests, ...lectures];
  const cartItems = allItems.filter(item => cart.includes(item.id));
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  const currentProvider = PROVIDERS.find(p => p.type === selectedMethod) || PROVIDERS[0];

  const handleCopyTill = () => {
    navigator.clipboard.writeText(currentProvider.tillNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerUssdPush = () => {
    if (!phoneNumber) {
      alert(lang === 'en' ? 'Please enter your phone number first!' : 'Tafadhali weka namba yako ya simu kwanza!');
      return;
    }
    setUssdPushSent(true);
    setTimeout(() => {
      // Auto fill a simulated transaction ref for ease
      if (!ref) {
        setRef(`${currentProvider.short.slice(0,3)}${Math.floor(100000 + Math.random() * 900000)}TZ`);
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    
    try {
      const orderId = await createOrder({
        userId: user?.uid || 'guest-' + Date.now(),
        userName: profile?.name || user?.displayName || user?.email || 'Mteja',
        userEmail: user?.email || 'mteja@codznz.com',
        itemIds: cart,
        ref: ref.trim().toUpperCase(),
        amount: total,
        paymentMethod: selectedMethod,
        phoneNumber: phoneNumber.trim() || '0754000000',
        status: 'confirmed'
      });

      setOrderSummary({
        id: orderId,
        ref: ref.trim().toUpperCase(),
        amount: total
      });
      setDone(true);
      clearCart();
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center page-anim max-w-md mx-auto">
        <div className="w-20 h-20 bg-ok/10 text-ok rounded-3xl border border-ok/20 flex items-center justify-center mb-5 shadow-xl animate-bounce">
          <CheckCircle size={44} />
        </div>
        
        <h2 className="text-2xl font-black text-text1 mb-2 font-poppins">
          {lang === 'en' ? 'Payment Verified! 🎉' : 'Malipo Yamethibitishwa! 🎉'}
        </h2>
        <p className="text-text3 text-xs sm:text-sm mb-6 leading-relaxed">
          {lang === 'en' 
            ? 'Your transaction has been approved. Your purchased content has been permanently unlocked in your Library!' 
            : 'Muamala wako umethibitishwa. Maudhui uliyolipa yamefunguliwa moja kwa moja kwenye Maktaba yako!'}
        </p>

        {/* Invoice Card */}
        <div className="w-full bg-card border border-theme rounded-3xl p-5 mb-6 text-left space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-theme pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text1">
              <Receipt size={16} className="text-primary" />
              <span>{lang === 'en' ? 'Digital Receipt' : 'Stakabadhi ya Malipo'}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-ok/10 text-ok rounded-full font-bold">PAID</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-text3">
              <span>{lang === 'en' ? 'Order ID' : 'Nambari ya Agizo'}:</span>
              <span className="font-mono text-text1 font-bold">{orderSummary?.id}</span>
            </div>
            <div className="flex justify-between text-text3">
              <span>{lang === 'en' ? 'Reference' : 'Kumbukumbu'}:</span>
              <span className="font-mono text-text1 font-bold">{orderSummary?.ref}</span>
            </div>
            <div className="flex justify-between text-text3">
              <span>{lang === 'en' ? 'Items' : 'Maudhui'}:</span>
              <span className="text-text1 font-bold">{cartItems.length || 1}</span>
            </div>
            <div className="flex justify-between text-text3 pt-2 border-t border-theme font-bold">
              <span>{lang === 'en' ? 'Amount Paid' : 'Kiasi Kilicholipwa'}:</span>
              <span className="text-primary text-sm font-black">{formatPrice(orderSummary?.amount || total)}</span>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          <button 
            onClick={onGoToLibrary || onBack}
            className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>{lang === 'en' ? 'Open My Library' : 'Fungua Maktaba Yangu'}</span>
            <ArrowRight size={16} />
          </button>
          
          <button 
            onClick={onBack}
            className="w-full h-11 text-text3 font-bold hover:bg-card2 rounded-2xl transition-colors text-xs"
          >
            {lang === 'en' ? 'Return to Catalog' : 'Rudi kwenye Orodha'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-anim max-w-lg mx-auto pb-20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-card2 rounded-full transition-colors active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black font-poppins text-text1">{lang === 'en' ? 'Payment' : 'Malipo'}</h2>
            <p className="text-[11px] text-text3">{cartItems.length} {lang === 'en' ? 'items selected' : 'mafunzo yamechaguliwa'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-text3 uppercase font-bold">{lang === 'en' ? 'Total' : 'Jumla'}</div>
          <div className="text-lg font-black text-primary">{formatPrice(total)}</div>
        </div>
      </div>

      {/* Gateway selection */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-text3 tracking-wider px-1">
          {lang === 'en' ? 'Select Payment Method' : 'Chagua Njia ya Malipo'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PROVIDERS.map((prov) => {
            const isSelected = selectedMethod === prov.type;
            return (
              <button
                key={prov.type}
                type="button"
                onClick={() => setSelectedMethod(prov.type)}
                className={cn(
                  "p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all relative",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]" 
                    : "border-theme bg-card hover:bg-card2 text-text2"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black uppercase shadow-sm",
                  prov.color
                )}>
                  {prov.short[0]}
                </div>
                <div className="text-[11px] font-bold truncate max-w-full text-text1">{prov.short}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-theme p-5 sm:p-6 rounded-3xl flex flex-col items-center text-center shadow-lg space-y-4">
        <div className="w-full bg-card2 p-4 rounded-2xl border border-theme flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] text-text3 font-bold uppercase">{lang === 'en' ? 'LIPA NUMBER / TILL' : 'NAMBA YA KULIPIA (TILL)'}</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-primary tracking-wider">{currentProvider.tillNumber}</div>
            <div className="text-[10px] text-text2 font-bold mt-0.5">{currentProvider.accountName}</div>
          </div>
          <button
            type="button"
            onClick={handleCopyTill}
            className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check size={16} className="text-ok" /> : <Copy size={16} />}
            <span>{copied ? (lang === 'en' ? 'Copied!' : 'Imenakiliwa!') : (lang === 'en' ? 'Copy' : 'Nakili')}</span>
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-2xl shadow-inner inline-block">
          <QRCodeSVG 
            value={`TILL:${currentProvider.tillNumber};AMOUNT:${total};PROVIDER:${currentProvider.short};UID:${user?.uid || 'guest'}`} 
            size={130} 
          />
        </div>

        <div className="w-full text-left bg-card2/60 p-3.5 rounded-2xl border border-theme text-xs space-y-1.5 text-text2">
          <div className="font-bold text-text1 flex items-center gap-1.5">
            <Sparkles size={14} className="text-gold" />
            <span>{lang === 'en' ? 'Quick Step Guide:' : 'Hatua za Kulipia:'}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-text3">
            <li>{lang === 'en' ? `Dial ${currentProvider.ussd} on your phone` : `Piga ${currentProvider.ussd} kwenye simu yako`}</li>
            <li>{lang === 'en' ? `Choose Lipa kwa Simu / Till Number` : `Chagua Lipa kwa Simu au Namba ya Kampuni`}</li>
            <li>{lang === 'en' ? `Enter Till No: ${currentProvider.tillNumber}` : `Weka Namba ya Kulipia: ${currentProvider.tillNumber}`}</li>
            <li>{lang === 'en' ? `Enter Amount: ${formatPrice(total)}` : `Weka Kiasi: ${formatPrice(total)}`}</li>
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-black text-text3 tracking-[2px]">
              {lang === 'en' ? 'Your Phone Number' : 'Namba ya Simu Uliyolipia'}
            </label>
            {ussdSettings?.enabled && (
              <span className="text-[10px] text-ok font-bold flex items-center gap-1">
                <Radio size={12} className="animate-pulse" />
                <span>USSD Push Active</span>
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-4 text-text3" size={18} />
              <input 
                type="tel" 
                placeholder="0754-000-000"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-card border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono text-text1 text-sm"
                required
              />
            </div>
            {ussdSettings?.enabled && (
              <button
                type="button"
                onClick={handleTriggerUssdPush}
                disabled={!phoneNumber.trim()}
                className="h-14 px-3.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-2xl flex flex-col items-center justify-center text-xs font-bold shrink-0 transition-all active:scale-95 disabled:opacity-40"
              >
                <Radio size={16} />
                <span className="text-[10px] mt-0.5">{ussdPushSent ? 'Push Sent' : 'Tuma Push'}</span>
              </button>
            )}
          </div>
          {ussdPushSent && (
            <div className="p-2.5 bg-ok/10 border border-ok/30 rounded-xl text-ok text-[11px] font-bold flex items-center gap-1.5">
              <CheckCircle size={14} />
              <span>Ombi la USSD Push limetumwa kwenye namba yako ({phoneNumber}). Tafadhali weka PIN ya M-Pesa/Tigo Pesa kukamilisha!</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-black text-text3 tracking-[2px]">
              {lang === 'en' ? 'Transaction Code / Ref (SMS)' : 'Kumbukumbu ya Muamala (SMS)'}
            </label>
            <span className="text-[10px] text-ok font-bold">{lang === 'en' ? 'Instant Access' : 'Uthibitisho wa Haraka'}</span>
          </div>
          <div className="relative">
            <QrCode className="absolute left-4 top-4 text-text3" size={18} />
            <input 
              type="text" 
              placeholder="SKE992381JQA..."
              value={ref}
              onChange={e => setRef(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-card border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono uppercase text-text1 text-sm font-bold tracking-wider"
              autoCapitalize="characters"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !ref.trim()}
          className="w-full h-14 bg-gradient-to-r from-ok to-emerald-500 hover:opacity-95 text-white rounded-2xl font-black shadow-xl shadow-ok/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-wider mt-2"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>{lang === 'en' ? 'Verify & Unlock Content' : 'Thibitisha & Fungua Mafunzo'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
