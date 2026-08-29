import React, { useState } from 'react';
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
import { Mail, Lock, User as UserIcon, ArrowRight, Chrome } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthPageProps {
  mode: 'login' | 'register';
  onSwitch: (mode: 'login' | 'register') => void;
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSwitch, onSuccess }) => {
  const { lang } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await setDoc(doc(db, 'users', res.user.uid), {
          uid: res.user.uid,
          name: name,
          email: email,
          points: 100,
          streak: 1,
          lastLogin: Date.now(),
          library: {},
          progress: {},
          status: 'Active'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
     setLoading(true);
     try {
       const provider = new GoogleAuthProvider();
       const res = await signInWithPopup(auth, provider);
       // Create profile if new
       const resUser = res.user;
       await setDoc(doc(db, 'users', resUser.uid), {
          uid: resUser.uid,
          name: resUser.displayName || resUser.email?.split('@')[0] || 'User',
          email: resUser.email,
          points: 100,
          streak: 1,
          lastLogin: Date.now(),
          library: {},
          progress: {},
          status: 'Active'
        }, { merge: true });
       onSuccess();
     } catch (err: any) {
        setError(err.message);
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="page-anim space-y-8 py-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold font-poppins mb-2">
          {mode === 'login' ? (lang === 'en' ? 'Welcome Back' : 'Karibu Tena') : (lang === 'en' ? 'Create Account' : 'Fungua Akaunti')}
        </h2>
        <p className="text-text3 text-sm">
          {mode === 'login' ? (lang === 'en' ? 'Log in to continue your journey' : 'Ingia ili uendelee na safari yako') : (lang === 'en' ? 'Join Tanzania\'s #1 coding platform' : 'Jiunge na jukwaa #1 la koding Tanzania')}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'register' && (
          <div className="relative">
            <UserIcon className="absolute left-4 top-4 text-text3" size={18} />
            <input 
              type="text" 
              placeholder={lang === 'en' ? 'Full Name' : 'Jina Kamili'}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-card border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-text3" size={18} />
          <input 
            type="email" 
            placeholder={lang === 'en' ? 'Email Address' : 'Barua Pepe'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-card border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-4 text-text3" size={18} />
          <input 
            type="password" 
            placeholder={lang === 'en' ? 'Password' : 'Nenosiri'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-card border border-theme rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            required
          />
        </div>
        
        {error && <p className="text-err text-xs font-bold text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === 'login' ? (lang === 'en' ? 'Login' : 'Ingia') : (lang === 'en' ? 'Sign Up' : 'Jisajili')}</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-theme" />
        <span className="relative z-10 bg-theme px-4 text-xs font-bold text-text3 uppercase tracking-widest">{lang === 'en' ? 'or' : 'au'}</span>
      </div>

      <button 
        onClick={signInWithGoogle}
        className="w-full h-14 bg-card border border-theme rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-card2 transition-colors active:scale-95"
      >
        <Chrome size={20} />
        <span>{lang === 'en' ? 'Continue with Google' : 'Endelea na Google'}</span>
      </button>

      <div className="text-center text-sm">
        <p className="text-text3">
          {mode === 'login' ? (lang === 'en' ? "Don't have an account?" : "Huna akaunti?") : (lang === 'en' ? "Already have an account?" : "Tayari unayo akaunti?")}{' '}
          <button 
            onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')}
            className="text-primary font-bold hover:underline"
          >
            {mode === 'login' ? (lang === 'en' ? 'Sign Up' : 'Jisajili') : (lang === 'en' ? 'Login' : 'Ingia')}
          </button>
        </p>
      </div>
    </div>
  );
};
