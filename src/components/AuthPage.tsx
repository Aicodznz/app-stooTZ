import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Chrome, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Terminal,
  Code2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthPageProps {
  mode: 'login' | 'register';
  onSwitch: (mode: 'login' | 'register') => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode: initialMode, onSwitch, onSuccess }) => {
  const { lang } = useApp();
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'student' | 'creator'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentMode(initialMode);
  }, [initialMode]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: 1, label: lang === 'en' ? 'Weak' : 'Dhaifu', color: 'bg-rose-500 text-rose-500' };
    if (score <= 3) return { level: 2, label: lang === 'en' ? 'Good' : 'Nzuri', color: 'bg-amber-500 text-amber-500' };
    return { level: 3, label: lang === 'en' ? 'Strong' : 'Imara Sana', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSwitchTab = (newMode: 'login' | 'register') => {
    setCurrentMode(newMode);
    setError('');
    if (onSwitch) {
      onSwitch(newMode);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (currentMode === 'register' && !agreeTerms) {
      setError(lang === 'en' ? 'Please agree to the Terms of Service' : 'Tafadhali kubali Vigezo na Masharti');
      setLoading(false);
      return;
    }

    try {
      if (currentMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          name: name || email.split('@')[0],
          email: email,
          phone: phone || '',
          accountType: role,
          points: 150, // Welcome bonus points
          streak: 1,
          lastLogin: Date.now(),
          createdAt: Date.now(),
          library: {},
          progress: {},
          status: 'Active'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      let msg = err.message || '';
      if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        msg = lang === 'en' ? 'Incorrect email or password' : 'Barua pepe au nenosiri si sahihi';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = lang === 'en' ? 'This email is already registered. Please login.' : 'Barua pepe hii tayari imesajiliwa. Tafadhali ingia.';
      } else if (msg.includes('auth/weak-password')) {
        msg = lang === 'en' ? 'Password must be at least 6 characters' : 'Nenosiri linapaswa kuwa na angalau herufi 6';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const resUser = res.user;
      await setDoc(doc(db, 'users', resUser.uid), {
        uid: resUser.uid,
        name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
        email: resUser.email,
        points: 150,
        streak: 1,
        lastLogin: Date.now(),
        library: {},
        progress: {},
        status: 'Active'
      }, { merge: true });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-anim max-w-md mx-auto space-y-5 py-2">
      {/* Brand Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25 mb-1">
          <Code2 size={28} />
        </div>
        <h2 className="text-2xl font-black font-heading tracking-tight text-text1">
          CodZnz <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">PRO</span>
        </h2>
        <p className="text-xs text-text3 font-medium px-4">
          {currentMode === 'login' 
            ? (lang === 'en' ? 'Welcome back! Sign in to access your courses and apps.' : 'Karibu tena! Ingia ili ufikie masomo na zana zako.')
            : (lang === 'en' ? 'Create an account to start coding and publishing projects.' : 'Fungua akaunti ya bure uanze kujifunza na kuchapisha masomo au programu.')}
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        {/* Toggle Header Tabs */}
        <div className="grid grid-cols-2 p-1 bg-card2 border border-theme rounded-2xl">
          <button
            type="button"
            onClick={() => handleSwitchTab('login')}
            className={cn(
              "py-2.5 rounded-xl text-xs font-black transition-all",
              currentMode === 'login'
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-text3 hover:text-text1"
            )}
          >
            {lang === 'en' ? 'Sign In' : 'Ingia'}
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('register')}
            className={cn(
              "py-2.5 rounded-xl text-xs font-black transition-all",
              currentMode === 'register'
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-text3 hover:text-text1"
            )}
          >
            {lang === 'en' ? 'Create Account' : 'Fungua Akaunti'}
          </button>
        </div>

        {/* Value Props for Register */}
        {currentMode === 'register' && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles size={14} className="text-indigo-500 mx-auto mb-1" />
              <div className="text-[10px] font-black text-indigo-400">150 XP Bonus</div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Award size={14} className="text-emerald-500 mx-auto mb-1" />
              <div className="text-[10px] font-black text-emerald-400">{lang === 'en' ? 'Certificates' : 'Vyeti Halisi'}</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Terminal size={14} className="text-purple-500 mx-auto mb-1" />
              <div className="text-[10px] font-black text-purple-400">{lang === 'en' ? 'App Studio' : 'Dev Studio'}</div>
            </div>
          </div>
        )}

        {/* Google 1-Click Auth */}
        <button 
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full h-12 bg-card2 hover:bg-theme border border-theme rounded-2xl font-bold text-xs text-text1 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{currentMode === 'login' ? (lang === 'en' ? 'Continue with Google' : 'Ingia kwa Google') : (lang === 'en' ? 'Sign up with Google' : 'Jisajili kwa Google')}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-theme" />
          <span className="relative z-10 bg-card px-3 text-[10px] font-black text-text3 uppercase tracking-widest">
            {lang === 'en' ? 'Or with email' : 'Au kwa barua pepe'}
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          {currentMode === 'register' && (
            <>
              {/* Account Type Selection */}
              <div>
                <label className="text-[10px] font-black text-text3 uppercase tracking-wider block mb-1.5">
                  {lang === 'en' ? 'I want to join as' : 'Ninajiunga kama'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2",
                      role === 'student' 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-card2 border-theme text-text2 hover:text-text1"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", role === 'student' ? "bg-primary" : "bg-text3")} />
                    <span>{lang === 'en' ? 'Student / Learner' : 'Mwanafunzi'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('creator')}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2",
                      role === 'creator' 
                        ? "bg-purple-500/10 border-purple-500 text-purple-400" 
                        : "bg-card2 border-theme text-text2 hover:text-text1"
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", role === 'creator' ? "bg-purple-500" : "bg-text3")} />
                    <span>{lang === 'en' ? 'Developer / Creator' : 'Mwalimu / Dev'}</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 text-text3" size={17} />
                <input 
                  type="text" 
                  placeholder={lang === 'en' ? 'Full Name' : 'Jina Kamili (Mf. Juma Ally)'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary transition-all placeholder:text-text3"
                  required
                />
              </div>

              {/* Phone (Optional for M-Pesa notifications) */}
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 text-text3" size={17} />
                <input 
                  type="tel" 
                  placeholder={lang === 'en' ? 'Phone (e.g. 0712345678)' : 'Namba ya Simu ya M-Pesa / Tigo'}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full h-11 pl-10 pr-3.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary transition-all placeholder:text-text3"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 text-text3" size={17} />
            <input 
              type="email" 
              placeholder={lang === 'en' ? 'Email Address' : 'Barua Pepe (email@domain.com)'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary transition-all placeholder:text-text3"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-text3" size={17} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={lang === 'en' ? 'Password (Min. 6 chars)' : 'Nenosiri (Angalau herufi 6)'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary transition-all placeholder:text-text3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text3 hover:text-text1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Strength indicator on register */}
            {currentMode === 'register' && password && (
              <div className="flex items-center justify-between px-1">
                <div className="flex gap-1 w-24">
                  {[1, 2, 3].map(lvl => (
                    <div 
                      key={lvl} 
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all",
                        strength.level >= lvl ? strength.color.split(' ')[0] : "bg-theme"
                      )} 
                    />
                  ))}
                </div>
                <span className={cn("text-[10px] font-bold", strength.color.split(' ')[1])}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Terms checkbox on register */}
          {currentMode === 'register' && (
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-theme text-primary focus:ring-primary"
              />
              <span className="text-[11px] text-text3 leading-tight">
                {lang === 'en' ? 'I agree to the CodZnz terms, community guidelines & privacy policy.' : 'Ninakubali vigezo, miongozo na sera za faragha za CodZnz.'}
              </span>
            </label>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-xl flex items-center gap-2">
              <ShieldCheck size={15} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {currentMode === 'login' 
                    ? (lang === 'en' ? 'Sign In Now' : 'Ingia Kwenye Akaunti') 
                    : (lang === 'en' ? 'Complete Registration' : 'Kamilisha Usajili')}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Switcher */}
      <div className="text-center text-xs text-text3 pb-4">
        <p>
          {currentMode === 'login' 
            ? (lang === 'en' ? "Don't have an account yet?" : "Bado huna akaunti?") 
            : (lang === 'en' ? "Already have an account?" : "Tayari unayo akaunti?")}{' '}
          <button 
            type="button"
            onClick={() => handleSwitchTab(currentMode === 'login' ? 'register' : 'login')}
            className="text-primary font-black hover:underline"
          >
            {currentMode === 'login' ? (lang === 'en' ? 'Sign Up Free' : 'Jisajili Bure') : (lang === 'en' ? 'Sign In' : 'Ingia Hapa')}
          </button>
        </p>
      </div>
    </div>
  );
};
