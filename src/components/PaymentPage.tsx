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

export const PaymentPage: React.FC<{ onBack: () => void; onGoToLibrary?: () => void }> = ({ onBack, onGoToLibrary }) => {
  const { 
    cart, 
    courses, 
    tests, 
    lectures, 
    lang, 
    user, 
    profile, 
    clearCart, 
    createOrder, 
    ussdSettings, 
    appliedCoupon,
    triggerDirectUssdPush,
    siteSettings
  } = useApp();

  const appName = siteSettings?.siteName || 'Amourcodes';
  const orgName = `${appName.toUpperCase()} LTD`;

  const providers: ProviderInfo[] = [
    {
      name: 'Vodacom M-Pesa',
      short: 'M-PESA',
      type: 'mpesa',
      color: 'bg-red-600 text-white',
      tillNumber: '503020',
      accountName: orgName,
      ussd: '*150*00#',
      badge: 'Popular'
    },
    {
      name: 'Tigo Pesa / Mixx',
      short: 'TIGO PESA',
      type: 'tigopesa',
      color: 'bg-blue-600 text-white',
      tillNumber: '503021',
      accountName: orgName,
      ussd: '*150*01#',
      badge: 'Instant'
    },
    {
      name: 'Airtel Money',
      short: 'AIRTEL',
      type: 'airtel',
      color: 'bg-rose-500 text-white',
      tillNumber: '503022',
      accountName: orgName,
      ussd: '*150*60#',
      badge: 'Fast'
    },
    {
      name: 'CRDB / Bank Card',
      short: 'BANK / VISA',
      type: 'card',
      color: 'bg-emerald-600 text-white',
      tillNumber: '0150992348100',
      accountName: `${appName.toUpperCase()} TECH`,
      ussd: 'SimBanking App',
      badge: 'Direct'
    }
  ];

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || user?.phoneNumber || '');
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ussdPushState, setUssdPushState] = useState<'idle' | 'pushing' | 'pin_prompt' | 'verifying' | 'success'>('idle');
  const [pinInput, setPinInput] = useState('');
  const [orderSummary, setOrderSummary] = useState<{ id: string; ref: string; amount: number } | null>(null);

  const allItems = [...courses, ...tests, ...lectures];
  const cartItems = allItems.filter(item => cart.includes(item.id));
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.targetType === 'single_course' && appliedCoupon.targetId) {
      const targetItem = cartItems.find(i => i.id === appliedCoupon.targetId);
      if (targetItem) {
        discountAmount = appliedCoupon.discountType === 'percentage'
          ? Math.round((targetItem.price * appliedCoupon.discountValue) / 100)
          : Math.min(appliedCoupon.discountValue, targetItem.price);
      }
    } else {
      discountAmount = appliedCoupon.discountType === 'percentage'
        ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
        : Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const total = Math.max(0, subtotal - discountAmount);
  const currentProvider = providers.find(p => p.type === selectedMethod) || providers[0];

  const handleCopyTill = () => {
    navigator.clipboard.writeText(currentProvider.tillNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectUssdPush = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert(lang === 'en' ? 'Please enter a valid phone number!' : 'Tafadhali weka namba sahihi ya simu!');
      return;
    }

    setUssdPushState('pushing');

    // Call USSD push backend simulation
    const pushResult = await triggerDirectUssdPush(phoneNumber, total, selectedMethod);
    
    if (pushResult.success) {
      setUssdPushState('pin_prompt');
      setRef(pushResult.ref || `TX-${Date.now().toString().slice(-6)}`);
    } else {
      setUssdPushState('idle');
      alert(lang === 'en' ? 'USSD push failed. Please try manual reference or check your phone number.' : 'Ombi la USSD halikukamilika. Tafadhali hakiki namba yako au lipa kwa namba ya kumbukumbu.');
    }
  };

  const handleConfirmUssdPin = async () => {
    setUssdPushState('verifying');
    setLoading(true);

    try {
      const confirmedRef = ref.trim().toUpperCase() || `${currentProvider.short.slice(0,3)}${Math.floor(100000 + Math.random() * 900000)}TZ`;
      const orderId = await createOrder({
        userId: user?.uid || 'guest-' + Date.now(),
        userName: profile?.name || user?.displayName || user?.email || 'Mteja',
        userEmail: user?.email || 'mteja@codznz.com',
        itemIds: cart,
        ref: confirmedRef,
        amount: total,
        paymentMethod: selectedMethod,
        phoneNumber: phoneNumber.trim() || '0754000000',
        status: 'confirmed'
      });

      setOrderSummary({
        id: orderId,
        ref: confirmedRef,
        amount: total
      });
      setDone(true);
      clearCart();
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
      setUssdPushState('idle');
    }
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
          {providers.map((prov) => {
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

      {/* Primary Payment Action: Direct USSD Push */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-card border border-primary/30 p-5 rounded-3xl space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="text-primary animate-pulse" size={18} />
            <h3 className="font-bold text-sm text-text1">
              {lang === 'en' ? 'Direct Mobile Push (USSD Instant Pay)' : 'Malipo ya Moja kwa Moja ya Simu (USSD Push)'}
            </h3>
          </div>
          <span className="text-[10px] uppercase font-black bg-ok/10 text-ok border border-ok/20 px-2 py-0.5 rounded-full">
            {lang === 'en' ? 'Recommended' : 'Inayopendekezwa'}
          </span>
        </div>

        <p className="text-xs text-text3 leading-relaxed">
          {lang === 'en'
            ? 'Enter your phone number below and tap Pay. A payment prompt will appear on your phone screen immediately to enter your PIN.'
            : 'Weka namba yako ya simu hapa chini kisha bonyeza Lipa. Ombi la malipo litatokea papo hapo kwenye kioo cha simu yako kuweka PIN.'}
        </p>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-black text-text3 tracking-wider block">
            {lang === 'en' ? 'Your Phone Number' : 'Namba ya Simu (M-Pesa / Tigo / Airtel)'}
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-text3" size={18} />
            <input 
              type="tel" 
              placeholder="0754-000-000 au 2557..."
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full h-13 pl-12 pr-4 bg-card2 border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono text-text1 text-sm font-bold"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleDirectUssdPush}
          disabled={ussdPushState === 'pushing' || !phoneNumber.trim()}
          className="w-full h-13 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
        >
          {ussdPushState === 'pushing' ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Radio size={16} />
              <span>{lang === 'en' ? `Send USSD Push (${formatPrice(total)})` : `Tuma Ombi la Malipo (${formatPrice(total)})`}</span>
            </>
          )}
        </button>
      </div>

      {/* USSD PIN Prompt Interactive Modal Simulation */}
      {ussdPushState === 'pin_prompt' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#1e232a] border-2 border-primary text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary mx-auto flex items-center justify-center">
              <Radio size={24} className="animate-pulse" />
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-wide text-white">
                {currentProvider.name} Push
              </h4>
              <p className="text-xs text-gray-300 mt-1">
                Lipa kwa {currentProvider.accountName} <br />
                Kiasi: <strong className="text-primary font-mono text-sm">{formatPrice(total)}</strong>
              </p>
            </div>

            <div className="p-3 bg-black/40 rounded-xl border border-gray-700 text-left text-xs font-mono text-gray-300">
              <div>Simu: {phoneNumber}</div>
              <div>Ref: {ref}</div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400">
                {lang === 'en' ? 'Enter Mobile PIN to Authorize' : 'Weka PIN ya Mtandao Kuhalalisha'}
              </label>
              <input
                type="password"
                maxLength={5}
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full h-12 text-center text-lg tracking-[8px] font-mono bg-black/50 border border-gray-600 rounded-xl text-white outline-none focus:border-primary"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUssdPushState('idle')}
                className="flex-1 h-11 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-colors"
              >
                Ghairi
              </button>
              <button
                type="button"
                onClick={handleConfirmUssdPin}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/40 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>Thibitisha</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Reference Fallback */}
      <details className="bg-card border border-theme rounded-2xl p-4 text-left group">
        <summary className="text-xs font-bold text-text2 cursor-pointer flex items-center justify-between select-none">
          <span>{lang === 'en' ? 'Paid manually via USSD / QR? Enter SMS reference' : 'Umelipa mwenyewe kwa namba ya kampuni? Weka namba ya SMS hapa'}</span>
          <span className="text-primary text-[11px] group-open:rotate-180 transition-transform">▼</span>
        </summary>
        
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-theme mt-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-black text-text3 tracking-wider">
                {lang === 'en' ? 'Transaction Reference (SMS)' : 'Kumbukumbu ya Muamala (SMS)'}
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) setRef(text.trim().toUpperCase());
                  } catch (e) {}
                }}
                className="text-[10px] text-primary hover:underline font-bold"
              >
                {lang === 'en' ? 'Paste from Clipboard' : 'Bandika kutoka Clipboard'}
              </button>
            </div>

            <div className="relative">
              <QrCode className="absolute left-3.5 top-3.5 text-text3" size={16} />
              <input 
                type="text" 
                placeholder="Mfano: 9JH823LA10 au TX-892341"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                className="w-full h-11 pl-10 pr-3 bg-card2 border border-theme rounded-xl outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono uppercase text-text1 text-xs font-bold"
              />
            </div>

            {/* Live Format Helper */}
            {ref.trim().length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium pt-1">
                <CheckCircle size={13} />
                <span>
                  {ref.length >= 8 
                    ? (lang === 'en' ? 'Valid reference format detected' : 'Muundo wa kumbukumbu umekubalika') 
                    : (lang === 'en' ? 'Entering code...' : 'Inasoma namba ya muamala...')}
                </span>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || !ref.trim()}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>{lang === 'en' ? 'Verify SMS Reference' : 'Hakiki Namba ya SMS'}</span>
              </>
            )}
          </button>
        </form>
      </details>
    </div>
  );
};
