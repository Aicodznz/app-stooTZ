import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Building, 
  Smartphone, 
  X, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { cn, formatTZS } from '../lib/utils';
import { PayoutRequest } from '../types';

export const DeveloperPayoutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { 
    lang, 
    user, 
    profile, 
    isAdm, 
    payoutRequests, 
    requestPayout, 
    updatePayoutStatus 
  } = useApp();

  const [amount, setAmount] = useState<string>('50000');
  const [provider, setProvider] = useState<'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'>('M-Pesa');
  const [accountName, setAccountName] = useState(profile?.name || user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'admin'>('overview');

  // Stats calculation
  const myPayouts = isAdm 
    ? payoutRequests 
    : payoutRequests.filter(p => p.developerId === user?.uid || p.developerEmail === user?.email);

  const totalPaid = myPayouts
    .filter(p => p.status === 'paid' || p.status === 'approved')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = myPayouts
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  // Simulated total wallet balance for developer
  const estimatedTotalEarnings = 280000;
  const availableBalance = Math.max(0, estimatedTotalEarnings - totalPaid - totalPending);

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount < 10000) {
      alert('Kiwango cha chini cha kutoa ni TZS 10,000');
      return;
    }
    if (numAmount > availableBalance) {
      alert('Salio lako halitoshi kiwango ulichoomba');
      return;
    }
    if (!accountName.trim() || !phoneNumber.trim()) {
      alert('Tafadhali jaza jina kamili na nambari ya simu');
      return;
    }

    setIsSubmitting(true);
    await requestPayout({
      amount: numAmount,
      provider,
      accountName: accountName.trim(),
      phoneNumber: phoneNumber.trim(),
      notes: notes.trim() || undefined
    });

    setIsSubmitting(false);
    setShowRequestForm(false);
    setActiveTab('history');
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-card border border-theme rounded-3xl p-5 sm:p-7 shadow-2xl my-auto z-10 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <Wallet size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text1">
                {lang === 'en' ? 'Developer Wallet & Payouts' : 'Pochi ya Mtengenezaji na Kutoa Pesa (Payouts)'}
              </h3>
              <p className="text-xs text-text3">
                {lang === 'en' ? 'Manage developer earnings and request instant mobile money transfers' : 'Simamia mapato yako na toa pesa moja kwa moja kwenda M-Pesa, Tigo Pesa, Halopesa'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-card to-card border border-emerald-500/30 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Salio Linalopatikana</span>
            <div className="text-xl sm:text-2xl font-black text-text1">{formatTZS(availableBalance)}</div>
            <p className="text-[10px] text-text3">Tayari kutolewa kwenye simu yako</p>
          </div>

          <div className="p-4 bg-card border border-theme rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Inayosubiri Kaguzi</span>
            <div className="text-xl sm:text-2xl font-black text-text1">{formatTZS(totalPending)}</div>
            <p className="text-[10px] text-text3">Maombi yaliyo kwenye uchakataji</p>
          </div>

          <div className="p-4 bg-card border border-theme rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Jumla Iliyolipwa</span>
            <div className="text-xl sm:text-2xl font-black text-text1">{formatTZS(totalPaid)}</div>
            <p className="text-[10px] text-text3">Mapato yaliyokwishalipwa kikamilifu</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-theme pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all", activeTab === 'overview' ? "bg-primary text-white" : "text-text3 hover:text-text1")}
            >
              {lang === 'en' ? 'Request Transfer' : 'Omba Kutoa Pesa'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all", activeTab === 'history' ? "bg-primary text-white" : "text-text3 hover:text-text1")}
            >
              {lang === 'en' ? 'History' : 'Historia ya Malipo'} ({myPayouts.length})
            </button>
            {isAdm && (
              <button
                onClick={() => setActiveTab('admin')}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all", activeTab === 'admin' ? "bg-rose-600 text-white" : "text-text3 hover:text-rose-400")}
              >
                Admin Approvals ⚙️
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Request Payout Form */}
        {activeTab === 'overview' && (
          <form onSubmit={handleCreatePayout} className="space-y-4 bg-card2/50 border border-theme rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-text1 uppercase tracking-wider">
                {lang === 'en' ? 'Mobile Money Payout Details' : 'Taarifa za Kupokelea Pesa'}
              </h4>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <ShieldCheck size={12} /> Salama & Moja kwa Moja
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                  {lang === 'en' ? 'Amount to Withdraw (TZS)' : 'Kiwango cha Kutoa (TZS)'} *
                </label>
                <input
                  type="number"
                  min="10000"
                  max={availableBalance || 500000}
                  step="5000"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-sm font-bold text-text1 outline-none focus:border-primary"
                />
                <span className="text-[10px] text-text3 mt-1 block">Kiwango cha chini: TZS 10,000</span>
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                  {lang === 'en' ? 'Mobile Network Provider' : 'Mtandao wa Simu'} *
                </label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                >
                  <option value="M-Pesa">Vodacom M-Pesa</option>
                  <option value="Tigo Pesa">Tigo Pesa (Mixx)</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Halopesa">Halotel Halopesa</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                  {lang === 'en' ? 'Account Full Name' : 'Jina Kamili la Usajili wa Namba'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Juma Ali Hassan"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                  {lang === 'en' ? 'Phone Number' : 'Nambari ya Simu'} *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Mfano: 0777123456"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                {lang === 'en' ? 'Additional Notes / Instructions' : 'Maelezo ya Ziada (Si lazima)'}
              </label>
              <input
                type="text"
                placeholder="Mfano: Payout ya mauzo ya Course ya React ya mwezi huu"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || availableBalance < 10000}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <ArrowUpRight size={16} />
              <span>{isSubmitting ? 'Inatuma ombi...' : `Omba Kutoa TZS ${parseInt(amount || '0', 10).toLocaleString()} Sasa`}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Payout History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {myPayouts.length === 0 ? (
              <div className="p-8 text-center bg-card border border-theme rounded-2xl text-xs text-text3 space-y-2">
                <Wallet size={32} className="mx-auto opacity-40" />
                <p>Bado haujafanya maombi yoyote ya kutoa pesa.</p>
              </div>
            ) : (
              myPayouts.map(req => (
                <div key={req.id} className="p-4 bg-card border border-theme rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-text1">{formatTZS(req.amount)}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                        req.status === 'paid' ? "bg-emerald-500/15 text-emerald-500" :
                        req.status === 'approved' ? "bg-primary/15 text-primary" :
                        req.status === 'rejected' ? "bg-rose-500/15 text-rose-500" :
                        "bg-amber-500/15 text-amber-500"
                      )}>
                        {req.status === 'paid' ? 'Imelipwa' : req.status === 'approved' ? 'Imeidhinishwa' : req.status === 'rejected' ? 'Imekataliwa' : 'Inakaguliwa'}
                      </span>
                    </div>

                    <div className="text-xs text-text3 flex items-center gap-2">
                      <span>{req.provider}</span>
                      <span>•</span>
                      <span>{req.accountName} ({req.phoneNumber})</span>
                    </div>

                    {req.transactionRef && (
                      <div className="text-[10px] text-emerald-600 font-mono font-bold">
                        Ref: {req.transactionRef}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-[11px] text-text3 font-mono">
                    {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Admin Approval Controls */}
        {activeTab === 'admin' && isAdm && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-rose-500 uppercase tracking-wider">
              Usimamizi wa Maombi ya Malipo ya Wasanidi Programu
            </h4>
            <div className="space-y-3">
              {payoutRequests.map(req => (
                <div key={req.id} className="p-4 bg-card border border-theme rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-text1">{formatTZS(req.amount)}</div>
                      <div className="text-xs text-text3 font-bold">{req.developerName} ({req.developerEmail})</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-primary">{req.provider}</span>
                      <div className="text-[11px] text-text2 font-mono">{req.phoneNumber}</div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-theme">
                      <button
                        onClick={() => updatePayoutStatus(req.id, 'paid', 'Malipo yamekamilika', `MPESA${Math.floor(100000+Math.random()*900000)}TZ`)}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={14} />
                        <span>Idhinisha & Weka Kama Imelipwa</span>
                      </button>
                      <button
                        onClick={() => updatePayoutStatus(req.id, 'rejected', 'Salio au namba sio sahihi')}
                        className="px-3 h-9 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Kataa</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
