import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { getInitials } from '../lib/utils';
import { 
  Flame, 
  Trophy, 
  BookOpen, 
  LogIn, 
  UserPlus, 
  Bolt, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  Play, 
  Share2, 
  Copy, 
  Check, 
  Award,
  ArrowRight,
  ShieldCheck,
  Code2,
  Edit3,
  X,
  Camera,
  Phone,
  Mail,
  User as UserIcon,
  Upload,
  Save,
  CheckCircle,
  Settings,
  MessageSquare,
  Wallet,
  Bot,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { CodePlayground } from './CodePlayground';
import { QnAForumModal } from './QnAForumModal';
import { StudyNotesCheatsheetModal } from './StudyNotesCheatsheetModal';
import { AIAssistantModal } from './AIAssistantModal';
import { DeveloperPayoutModal } from './DeveloperPayoutModal';

// Preset modern avatar badges
const PRESET_AVATARS = [
  { id: 'dev-boy', label: '👨‍💻 Coder', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'dev-girl', label: '👩‍💻 Developer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'robot', label: '🤖 AI Bot', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80' },
  { id: 'pro', label: '👑 Master', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'cyber', label: '⚡ Cyber', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80' },
  { id: 'scholar', label: '🎓 Scholar', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: 'hacker', label: '💻 Hacker', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80' },
  { id: 'designer', label: '🎨 Creator', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80' },
];

export const DashboardPage: React.FC<{ onNavigate: (page: any) => void; onOpenContent?: (id: string) => void }> = ({ onNavigate, onOpenContent }) => {
  const { user, profile, isAdm, lang, pts, strk, courses, tests, lectures, lib, notifications, markNotificationRead, completedEpisodes, updateUserProfile, siteSettings } = useApp();
  const [copiedRef, setCopiedRef] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(profile?.name || user?.displayName || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editPhotoURL, setEditPhotoURL] = useState(profile?.photoURL || profile?.avatarUrl || user?.photoURL || '');
  const [editRole, setEditRole] = useState<'student' | 'creator' | 'developer' | 'admin'>(profile?.accountType || 'student');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New interactive feature modals
  const [showPlayground, setShowPlayground] = useState(false);
  const [showQnA, setShowQnA] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center page-anim">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <BookOpen size={38} />
        </div>
        <h2 className="text-xl font-bold mb-2 font-poppins">
          {lang === 'en' ? `Welcome to ${siteSettings?.siteName || 'Amourcodes'}` : `Karibu ${siteSettings?.siteName || 'Amourcodes'}`}
        </h2>
        <p className="text-text3 text-xs sm:text-sm mb-8 max-w-[260px] leading-relaxed">
          {lang === 'en' ? 'Log in to track your learning journey, claim certificates, and earn XP.' : 'Ingia ili ufuatilie masomo yako, upate vyeti, na ujipatie pointi za XP.'}
        </p>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <button 
            onClick={() => onNavigate('login')}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
          >
            <LogIn size={18} />
            <span>{lang === 'en' ? 'Login' : 'Ingia'}</span>
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="w-full h-12 border border-theme hover:bg-card2 text-text1 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs uppercase tracking-wider"
          >
            <UserPlus size={18} />
            <span>{lang === 'en' ? 'Create Free Account' : 'Fungua Akaunti Bure'}</span>
          </button>
        </div>
      </div>
    );
  }

  const allItems = [...courses, ...tests, ...lectures];
  const ownedItems = allItems.filter(item => lib[item.id] || item.isFree || item.price === 0);

  const handleCopyReferral = () => {
    const code = `CODZNZ-${user.uid.slice(0, 5).toUpperCase()}`;
    navigator.clipboard.writeText(`https://codznz.pro/?ref=${code}`);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleOpenEdit = () => {
    setEditName(profile?.name || user.displayName || user.email?.split('@')[0] || '');
    setEditPhone(profile?.phone || '');
    setEditPhotoURL(profile?.photoURL || profile?.avatarUrl || user.photoURL || '');
    setEditRole(profile?.accountType || (isAdm ? 'creator' : 'student'));
    setSaveSuccess(false);
    setShowEditModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditPhotoURL(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await updateUserProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      photoURL: editPhotoURL.trim(),
      accountType: editRole
    });
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowEditModal(false);
      }, 900);
    }
  };

  const currentPhoto = profile?.photoURL || profile?.avatarUrl || user.photoURL;
  const isCreatorOrDev = profile?.accountType === 'creator' || profile?.accountType === 'developer' || isAdm;

  return (
    <div className="space-y-5 page-anim pb-12">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-primary p-5 sm:p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10 gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center text-2xl font-black border-2 border-white/30 shadow-inner">
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile?.name || user.displayName || user.email || 'User')
                )}
              </div>
              <button 
                onClick={handleOpenEdit}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-indigo-900/90 text-white flex items-center justify-center border border-white/40 shadow-sm hover:scale-110 transition-transform"
                title="Badilisha Picha"
              >
                <Camera size={12} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold truncate font-poppins">
                  {profile?.name || user.displayName || user.email?.split('@')[0]}
                </h2>
                {isAdm ? (
                  <span className="bg-rose-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={10} />
                    ADMIN
                  </span>
                ) : isCreatorOrDev ? (
                  <span className="bg-purple-400/30 text-purple-100 border border-purple-300/40 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Code2 size={10} />
                    DEV / CREATOR
                  </span>
                ) : (
                  <span className="bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    STUDENT
                  </span>
                )}
              </div>

              <div className="text-[11px] text-white/80 truncate mt-0.5 flex items-center gap-2">
                <span>{user.email}</span>
                {profile?.phone && (
                  <span className="text-white/60">• {profile.phone}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-white/90 text-xs mt-2 flex-wrap">
                <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Trophy size={11} className="text-gold" />
                  {pts || 0} XP
                </span>
                <span className="text-[10px] text-white/70">Level {Math.floor((pts || 0) / 200) + 1} Scholar</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="p-2 bg-white/15 hover:bg-white/25 rounded-xl text-white transition-all active:scale-95 flex items-center gap-1 text-xs font-bold border border-white/20 shrink-0"
            title="Hariri Wasifu"
          >
            <Edit3 size={14} />
            <span className="hidden xs:inline">{lang === 'en' ? 'Edit' : 'Hariri'}</span>
          </button>
        </div>

        <div className="absolute -bottom-4 -right-4 p-4 opacity-10 pointer-events-none">
          <Bolt size={140} />
        </div>
      </div>

      {/* Control Panels: ADMIN & DEVELOPER Access (Dedicated to Profile) */}
      {(isAdm || isCreatorOrDev) && (
        <div className="space-y-2.5">
          <div className="text-[10px] font-black text-text3 uppercase tracking-widest px-1">
            {lang === 'en' ? 'Management & Creation Hub' : 'Paneli za Usimamizi na Uumbaji'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Admin Panel Button */}
            {isAdm && (
              <div 
                onClick={() => onNavigate('adm')}
                className="bg-card border border-rose-500/30 hover:border-rose-500/70 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text1 flex items-center gap-1.5">
                      <span>{lang === 'en' ? 'Admin Control Panel' : 'Paneli ya Msimamizi (Admin)'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    </div>
                    <div className="text-[10px] text-text3 mt-0.5">
                      {lang === 'en' ? 'Approve orders, manage courses & users' : 'Thibitisha malipo, dhibiti kozi & watumiaji'}
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-text3 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
              </div>
            )}

            {/* Developer Studio Button */}
            <div 
              onClick={() => onNavigate('dev')}
              className="bg-card border border-indigo-500/30 hover:border-indigo-500/70 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Code2 size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-text1">
                    {lang === 'en' ? 'Developer & Creator Studio' : 'Developer & Creator Studio'}
                  </div>
                  <div className="text-[10px] text-text3 mt-0.5">
                    {lang === 'en' ? 'Publish apps, quizzes, courses & videos' : 'Chapisha Apps, Mitihani, Kozi na Video'}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} className="text-text3 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* If standard student, offer quick access to become creator */}
      {!isAdm && !isCreatorOrDev && (
        <div 
          onClick={() => onNavigate('dev')}
          className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-card border border-indigo-500/20 hover:border-indigo-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Code2 size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-text1">
                {lang === 'en' ? 'Want to publish an App or Course?' : 'Unataka kuchapisha App au Kozi yako?'}
              </div>
              <div className="text-[10px] text-text3">
                {lang === 'en' ? 'Open the Developer Publishing Studio' : 'Fungua Studio ya Wachapishaji (Developer Hub)'}
              </div>
            </div>
          </div>
          <ArrowRight size={15} className="text-text3 group-hover:text-primary transition-all" />
        </div>
      )}

      {/* Streak & Referral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 rounded-2xl text-white flex items-center gap-3.5 shadow-md">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Flame size={22} fill="currentColor" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold">{strk || 1} {lang === 'en' ? 'Day Streak 🔥' : 'Siku za Mfululizo 🔥'}</div>
            <div className="text-[10px] text-white/85">{lang === 'en' ? "Daily study goal active" : "Lengo la kila siku linaendelea"}</div>
          </div>
        </div>

        <div className="bg-card border border-theme p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-bold text-text1 flex items-center gap-1">
              <Award size={14} className="text-gold" />
              <span>{lang === 'en' ? 'Refer & Earn XP' : 'Alika Marafiki'}</span>
            </div>
            <div className="text-[10px] text-text3 mt-0.5">{lang === 'en' ? '+150 XP per joined friend' : '+150 XP kwa kila rafiki'}</div>
          </div>
          <button
            onClick={handleCopyReferral}
            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
          >
            {copiedRef ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
            <span>{copiedRef ? (lang === 'en' ? 'Copied' : 'Imenakiliwa') : (lang === 'en' ? 'Share' : 'Shiriki')}</span>
          </button>
        </div>
      </div>

      {/* Modern Coding Tools & AI Hub */}
      <div className="space-y-2.5">
        <div className="text-[10px] font-black text-text3 uppercase tracking-widest px-1">
          {lang === 'en' ? 'Interactive Coding Hub & AI' : 'Zana za Vitendo & Mwalimu wa AI'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setShowPlayground(true)}
            className="p-3 bg-card border border-theme hover:border-indigo-500/50 rounded-2xl flex flex-col items-start gap-2 text-left transition-all active:scale-95 shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-text1">{lang === 'en' ? 'Code Sandbox' : 'Playground'}</div>
              <div className="text-[10px] text-text3">HTML / JS / Python</div>
            </div>
          </button>

          <button
            onClick={() => setShowAIModal(true)}
            className="p-3 bg-card border border-theme hover:border-purple-500/50 rounded-2xl flex flex-col items-start gap-2 text-left transition-all active:scale-95 shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Bot size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-text1">AI Swahili Tutor</div>
              <div className="text-[10px] text-text3">Ask anything & debug</div>
            </div>
          </button>

          <button
            onClick={() => setShowQnA(true)}
            className="p-3 bg-card border border-theme hover:border-emerald-500/50 rounded-2xl flex flex-col items-start gap-2 text-left transition-all active:scale-95 shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-text1">Q&A Forum</div>
              <div className="text-[10px] text-text3">Maswali ya masomo</div>
            </div>
          </button>

          <button
            onClick={() => setShowNotes(true)}
            className="p-3 bg-card border border-theme hover:border-amber-500/50 rounded-2xl flex flex-col items-start gap-2 text-left transition-all active:scale-95 shadow-xs group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-text1">Cheatsheets</div>
              <div className="text-[10px] text-text3">Notes & Muhtasari</div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-primary">{ownedItems.length}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'Courses' : 'Kozi'}</div>
        </div>
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-gold">{pts}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'XP Points' : 'Pointi'}</div>
        </div>
        <div className="bg-card border border-theme p-3.5 rounded-2xl shadow-sm">
          <div className="text-lg sm:text-xl font-black text-ok">{strk || 1}</div>
          <div className="text-[10px] uppercase text-text3 font-bold mt-0.5">{lang === 'en' ? 'Streak' : 'Mpango'}</div>
        </div>
      </div>

      {/* Notifications / Announcements */}
      {notifications && notifications.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-widest text-text3 flex items-center gap-1.5">
              <Bell size={13} className="text-primary" />
              <span>{lang === 'en' ? 'Recent Updates' : 'Taarifa Mpya'}</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </h3>
            <button 
              onClick={() => onNavigate('notif')}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
            >
              <span>{lang === 'en' ? 'View All' : 'Ona Zote'}</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n) => (
              <div 
                key={n.id} 
                onClick={() => {
                  markNotificationRead(n.id);
                  onNavigate('notif');
                }}
                className={cn(
                  "bg-card border p-3.5 rounded-2xl flex items-start gap-3 shadow-sm cursor-pointer hover:border-primary/40 transition-colors relative",
                  n.read ? "border-theme" : "border-primary/40 bg-primary/[0.02]"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  n.read ? "bg-text3/40" : "bg-primary animate-pulse"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-text1 truncate">{n.title || '(Picha/Poster)'}</div>
                  <div className="text-[11px] text-text3 mt-0.5 line-clamp-2">{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress / My Active Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs uppercase tracking-widest text-text3">
            {lang === 'en' ? 'Active Courses' : 'Masomo Yangu'}
          </h3>
          <button 
            onClick={() => onNavigate('lib')}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
          >
            <span>{lang === 'en' ? 'View All' : 'Ona Yote'}</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {ownedItems.length === 0 ? (
          <div className="bg-card2 border border-theme border-dashed p-8 rounded-3xl text-center space-y-3">
            <p className="text-text3 text-xs">{lang === 'en' ? 'No active courses yet. Explore courses to start learning!' : 'Bado hujaanza somo lolote. Gundua masomo mapya uanze kujifunza!'}</p>
            <button
              onClick={() => onNavigate('home')}
              className="px-5 h-10 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
            >
              {lang === 'en' ? 'Explore Catalog' : 'Gundua Mafunzo'}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {ownedItems.slice(0, 3).map((item) => {
              const eps = item.episodes || [];
              const completedCount = eps.filter((_, idx) => completedEpisodes[`${item.id}_ep_${idx}`]).length;
              const percent = eps.length > 0 ? Math.round((completedCount / eps.length) * 100) : 75;

              return (
                <div 
                  key={item.id} 
                  onClick={() => onOpenContent ? onOpenContent(item.id) : onNavigate('lib')}
                  className="bg-card border border-theme p-4 rounded-2xl shadow-sm hover:border-primary/40 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xl">{item.icon || '📚'}</span>
                      <span className="text-xs font-bold text-text1 truncate">{item.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full shrink-0">
                      {percent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-card2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" 
                      style={{ width: `${percent}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-theme w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <h3 className="font-black text-base text-text1">
                    {lang === 'en' ? 'Edit User Profile' : 'Hariri Wasifu Wako'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 rounded-full bg-card2 text-text3 hover:text-text1 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Avatar Selection */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-text3 uppercase tracking-wider block">
                    {lang === 'en' ? 'Profile Picture (Avatar)' : 'Picha ya Wasifu (Avatar)'}
                  </label>

                  <div className="flex items-center gap-4 p-3 bg-card2 border border-theme rounded-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 overflow-hidden flex items-center justify-center text-xl font-bold border-2 border-primary shrink-0 shadow-inner">
                      {editPhotoURL ? (
                        <img src={editPhotoURL} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(editName || 'User')
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-9 bg-card hover:bg-theme border border-theme rounded-xl text-xs font-bold text-text1 flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Upload size={14} />
                        <span>{lang === 'en' ? 'Upload Photo' : 'Pakia Picha kutoka Kifaa'}</span>
                      </button>
                      <input 
                        type="text" 
                        placeholder={lang === 'en' ? 'Or paste Image URL...' : 'Au weka URL ya Picha...'}
                        value={editPhotoURL.startsWith('data:') ? '' : editPhotoURL}
                        onChange={e => setEditPhotoURL(e.target.value)}
                        className="w-full h-8 px-3 bg-card border border-theme rounded-lg text-[11px] text-text1 outline-none focus:border-primary placeholder:text-text3"
                      />
                    </div>
                  </div>

                  {/* Preset Avatars Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-text3 font-medium">
                      {lang === 'en' ? 'Or choose a preset coder avatar:' : 'Au chagua moja ya avatari hizi:'}
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_AVATARS.map((av) => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditPhotoURL(av.url)}
                          className={cn(
                            "p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all",
                            editPhotoURL === av.url 
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20" 
                              : "border-theme bg-card2 hover:border-text3"
                          )}
                        >
                          <img src={av.url} alt={av.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[9px] font-bold text-text2 truncate w-full text-center">{av.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text3 uppercase tracking-wider block">
                    {lang === 'en' ? 'Full Name' : 'Jina Kamili'}
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 text-text3" size={16} />
                    <input 
                      type="text" 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Jina lako"
                      className="w-full h-11 pl-10 pr-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text3 uppercase tracking-wider block">
                    {lang === 'en' ? 'Phone Number (M-Pesa / Tigo)' : 'Namba ya Simu (M-Pesa / Tigo)'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 text-text3" size={16} />
                    <input 
                      type="tel" 
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="0712345678"
                      className="w-full h-11 pl-10 pr-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text3 uppercase tracking-wider block">
                    {lang === 'en' ? 'Account Role' : 'Aina ya Akaunti'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditRole('student')}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-all text-left",
                        editRole === 'student'
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card2 border-theme text-text2 hover:text-text1"
                      )}
                    >
                      🎓 {lang === 'en' ? 'Student' : 'Mwanafunzi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRole('creator')}
                      className={cn(
                        "p-2.5 rounded-xl border text-xs font-bold transition-all text-left",
                        editRole === 'creator' || editRole === 'developer'
                          ? "bg-purple-500/10 border-purple-500 text-purple-400"
                          : "bg-card2 border-theme text-text2 hover:text-text1"
                      )}
                    >
                      👨‍💻 {lang === 'en' ? 'Creator / Dev' : 'Mwalimu / Dev'}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn(
                      "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md",
                      saveSuccess 
                        ? "bg-emerald-600 text-white shadow-emerald-500/30" 
                        : "bg-primary hover:bg-primary-hover text-white shadow-primary/30"
                    )}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle size={16} />
                        <span>{lang === 'en' ? 'Saved Successfully!' : 'Imehifadhiwa Kikamilifu!'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{lang === 'en' ? 'Save Changes' : 'Hifadhi Mabadiliko'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Code Playground Modal */}
      {showPlayground && (
        <div className="fixed inset-0 z-[250] bg-slate-950 sm:bg-black/85 sm:backdrop-blur-md flex items-center justify-center p-0 sm:p-4 overflow-hidden page-anim">
          <div className="absolute inset-0 hidden sm:block" onClick={() => setShowPlayground(false)} />
          <div className="relative w-full h-full sm:h-[94vh] max-w-7xl bg-slate-950 sm:border sm:border-theme sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden">
            <CodePlayground onClose={() => setShowPlayground(false)} />
          </div>
        </div>
      )}

      {/* Q&A Forum Modal */}
      {showQnA && (
        <QnAForumModal onClose={() => setShowQnA(false)} />
      )}

      {/* Study Notes & Cheatsheets Modal */}
      {showNotes && (
        <StudyNotesCheatsheetModal onClose={() => setShowNotes(false)} />
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}

      {/* Developer Payout Modal */}
      {showPayoutModal && (
        <DeveloperPayoutModal onClose={() => setShowPayoutModal(false)} />
      )}
    </div>
  );
};
