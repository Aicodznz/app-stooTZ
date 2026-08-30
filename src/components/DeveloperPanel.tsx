import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { 
  Smartphone, 
  BookOpen, 
  GraduationCap, 
  Video, 
  Plus, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  DollarSign, 
  Code2, 
  Terminal, 
  Database, 
  CreditCard, 
  RefreshCw, 
  Tag, 
  Clock, 
  Award, 
  Eye, 
  AlertCircle, 
  Check, 
  Search,
  UploadCloud,
  Play,
  Lock,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck,
  Send,
  Wallet,
  Wand2
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { ContentItem, CodApp, Episode, Question, AppScreenshot, DeveloperPackage } from '../types';
import { DeveloperPayoutModal } from './DeveloperPayoutModal';
import { AIAssistantModal } from './AIAssistantModal';
import { 
  SEED_COURSES, 
  SEED_TESTS, 
  SEED_LECTURES, 
  SEED_APPS, 
  SEED_BANNERS, 
  SEED_ORDERS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS 
} from '../constants';

type CreatorTab = 'app' | 'course' | 'test' | 'lecture' | 'catalog' | 'devtools';

export const DeveloperPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { 
    user, 
    profile, 
    isAdm, 
    lang, 
    courses, 
    tests, 
    lectures, 
    apps, 
    updateCourses, 
    updateTests, 
    updateLectures, 
    updateApps,
    addPoints,
    orders,
    developerPackages,
    developerApplications,
    applyForDeveloper,
    triggerDirectUssdPush,
    siteSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<CreatorTab>('app');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showAICourseModal, setShowAICourseModal] = useState(false);

  // Application / Subscription Form State
  const [selectedPkg, setSelectedPkg] = useState<DeveloperPackage | null>(
    developerPackages.find(p => p.isPopular) || developerPackages[0] || null
  );
  const [devPhone, setDevPhone] = useState(profile?.phone || '0754000000');
  const [devBio, setDevBio] = useState('');
  const [devPortfolio, setDevPortfolio] = useState('https://github.com');
  const [devPaymentRef, setDevPaymentRef] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [ussdPushActive, setUssdPushActive] = useState(false);
  const [ussdPushSuccess, setUssdPushSuccess] = useState(false);

  // Check if current user is approved
  const isApprovedDev = isAdm || profile?.role === 'developer' || profile?.developerStatus === 'approved';
  
  // Find current user's latest application if any
  const userApp = developerApplications.find(
    a => a.userId === user?.uid || (user?.email && a.userEmail === user.email)
  );

  const handleApplyDeveloper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    setSubmittingApp(true);
    let finalRef = devPaymentRef;

    if (selectedPkg.price > 0 && !finalRef) {
      // Trigger USSD push
      setUssdPushActive(true);
      const ussdRes = await triggerDirectUssdPush(devPhone, selectedPkg.price, 'M-Pesa');
      finalRef = ussdRes.ref;
      setUssdPushActive(false);
      setUssdPushSuccess(true);
    }

    const success = await applyForDeveloper({
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      packagePrice: selectedPkg.price,
      userPhone: devPhone,
      devBio,
      portfolioUrl: devPortfolio,
      paymentRef: finalRef || 'FREE_STARTER'
    });

    setSubmittingApp(false);
    if (success) {
      showNotification(lang === 'en' ? 'Developer application submitted for Admin approval!' : 'Ombi la Developer limetumwa kwa Msimamizi!');
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // --- ACCESS GATE VIEW (FOR REGULAR USERS WHO HAVEN'T BEEN APPROVED BY ADMIN) ---
  if (!isApprovedDev) {
    return (
      <div className="page-anim space-y-6 max-w-4xl mx-auto pb-12">
        {/* Gate Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Lock size={14} className="text-amber-400" />
              <span>{lang === 'en' ? 'Admin Verified Developer Access' : 'Idhini ya Msimamizi ya Developer'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
              {lang === 'en' ? 'Unlock Developer Studio & Monetize Apps' : 'Fungua Developer Studio & Weka Apps Zako Sokoni'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === 'en'
                ? 'To ensure software security and quality, all developers must choose an access package and be approved by the Admin. Once approved, you can publish apps, courses, and receive 80% revenue share via M-Pesa USSD.'
                : 'Ili kudumisha ubora na usalama wa mifumo, wasanidi wote huchagua kifurushi cha kujiunga na kuidhinishwa na Msimamizi. Ukikubaliwa, unaweza kupakia programu, kozi na kupokea asilimia 80 ya mapato moja kwa moja.'}
            </p>
          </div>
        </div>

        {/* Existing Application Status Banner */}
        {userApp && userApp.status === 'pending' && (
          <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3.5 text-amber-200">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Clock size={20} className="animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-300">
                {lang === 'en' ? 'Application Under Review ⏳' : 'Ombi Lako Linakaguliwa na Msimamizi ⏳'}
              </h4>
              <p className="text-xs leading-relaxed text-amber-200/90">
                {lang === 'en'
                  ? `Your developer request for "${userApp.packageName}" is currently being verified by the administrator. You will receive an instant notification once approved.`
                  : `Ombi lako la kifurushi cha "${userApp.packageName}" linakaguliwa. Msimamizi akithibitisha, utapewa taarifa mara moja na dashibodi itafunguka.`}
              </p>
            </div>
          </div>
        )}

        {userApp && userApp.status === 'rejected' && (
          <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3.5 text-rose-200">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-rose-300">
                {lang === 'en' ? 'Application Status' : 'Taarifa ya Ombi'}
              </h4>
              <p className="text-xs leading-relaxed text-rose-200/90">
                {userApp.rejectionReason || 'Ombi lililopita halikukidhi vigezo. Unaweza kuchagua kifurushi na kuomba upya hapa chini.'}
              </p>
            </div>
          </div>
        )}

        {/* Developer Packages Selection Grid */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-black text-text1">
              {lang === 'en' ? '1. Select Developer Membership Package' : '1. Chagua Kifurushi cha Uanachama wa Developer'}
            </h3>
            <p className="text-xs text-text3">
              {lang === 'en' ? 'Admin-managed packages with dedicated publisher privileges' : 'Vifurushi vilivyowekwa na msimamizi vyenye ruhusa rasmi za kuchapisha'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {developerPackages.map(pkg => {
              const isSelected = selectedPkg?.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-card border-primary ring-2 ring-primary/30 shadow-xl scale-[1.02]' 
                      : 'bg-card2/60 border-theme hover:border-text3/40'
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md">
                      POPULAR
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-text1">{pkg.name}</h4>
                      <span className="text-[10px] font-bold text-text3 bg-card px-2 py-0.5 rounded-full border border-theme">
                        {pkg.billingCycle}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-primary">
                        {pkg.price === 0 ? 'FREE' : formatPrice(pkg.price)}
                      </span>
                    </div>

                    <p className="text-xs text-text2 leading-snug">
                      {pkg.desc}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-theme">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text2">
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-theme">
                    <button
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isSelected 
                          ? 'bg-primary text-white shadow-md' 
                          : 'bg-card border border-theme text-text2 hover:text-text1'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : null}
                      <span>{isSelected ? (lang === 'en' ? 'Selected' : 'Umechagua') : (lang === 'en' ? 'Select Package' : 'Chagua')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Form */}
        {selectedPkg && (
          <form onSubmit={handleApplyDeveloper} className="bg-card border border-theme rounded-3xl p-5 sm:p-7 shadow-lg space-y-4">
            <h3 className="text-base font-black text-text1 flex items-center gap-2">
              <UserCheck size={18} className="text-primary" />
              <span>{lang === 'en' ? '2. Submit Developer Application' : '2. Kamilisha Ombi Lako kwa Msimamizi'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">
                  {lang === 'en' ? 'M-Pesa / Tigo Pesa Phone Number' : 'Namba ya Simu (M-Pesa / Tigo / Airtel)'}
                </label>
                <input
                  type="text"
                  required
                  value={devPhone}
                  onChange={(e) => setDevPhone(e.target.value)}
                  placeholder="0754000000"
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text2">
                  {lang === 'en' ? 'Portfolio or GitHub URL' : 'Kiungo cha Portfolio au GitHub'}
                </label>
                <input
                  type="url"
                  value={devPortfolio}
                  onChange={(e) => setDevPortfolio(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text2">
                {lang === 'en' ? 'Developer Bio / Experience' : 'Maelezo Mafupi ya Uzoefu wako'}
              </label>
              <textarea
                rows={2}
                value={devBio}
                onChange={(e) => setDevBio(e.target.value)}
                placeholder="Mfano: Nina uzoefu wa miaka 2 katika React, Node.js na Flutter..."
                className="w-full p-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
              />
            </div>

            {/* USSD Direct Push Notice */}
            {selectedPkg.price > 0 && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <span className="font-bold text-text1">{lang === 'en' ? 'Direct USSD Push Payment' : 'Malipo ya Moja kwa Moja ya USSD Push'}</span>
                    <p className="text-[11px] text-text3">
                      {lang === 'en' ? `Auto prompt of ${formatPrice(selectedPkg.price)} will be sent to ${devPhone}` : `Utatumiwa ujumbe wa PIN wa ${formatPrice(selectedPkg.price)} kwenye simu yako ${devPhone}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-primary shrink-0">{formatPrice(selectedPkg.price)}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingApp || ussdPushActive}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-95 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all"
            >
              {submittingApp ? (
                <span>{lang === 'en' ? 'Processing Application...' : 'Inatuma ombi...'}</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>{lang === 'en' ? `Submit Application & Request Access (${formatPrice(selectedPkg.price)})` : `Tuma Ombi & Lipia Kifurushi (${formatPrice(selectedPkg.price)})`}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // --- FULL CREATOR STUDIO (FOR APPROVED DEVELOPERS & ADMIN) ---

  // -------------------------------------------------------------
  // 1. STATE: PUBLISH APP FORM
  // -------------------------------------------------------------
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appFullDesc, setAppFullDesc] = useState('');
  const [appCategory, setAppCategory] = useState('Coding & Developer Tools');
  const [appDeveloper, setAppDeveloper] = useState(profile?.name || user?.displayName || `${siteSettings?.siteName || 'Amourcodes'} Studio`);
  const [appPriceType, setAppPriceType] = useState<'free' | 'paid'>('free');
  const [appPrice, setAppPrice] = useState('5000');
  const [appSize, setAppSize] = useState('32MB');
  const [appUrl, setAppUrl] = useState('https://github.com');
  const [appIconPreset, setAppIconPreset] = useState('💻');
  const [appCustomIconUrl, setAppCustomIconUrl] = useState('');
  const [appChangelog, setAppChangelog] = useState('Toleo la kwanza: UI ya kisasa na uwezo wa kuandika kodi haraka.');
  const [appVideoUrl, setAppVideoUrl] = useState('');

  const handlePublishApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) return;

    const newAppId = 'app-' + Date.now();
    const finalIcon = appCustomIconUrl.trim() || appIconPreset;
    
    const newApp: CodApp = {
      id: newAppId,
      name: appName,
      desc: appDesc || 'Programu maalum ya kusaidia uandishi wa kodi na mafunzo.',
      fullDesc: appFullDesc || appDesc || 'Maelezo kamili ya programu hii.',
      changelog: appChangelog,
      developer: appDeveloper || `${siteSettings?.siteName || 'Amourcodes'} Creator`,
      size: appSize || '25MB',
      rating: '5.0',
      videoUrl: appVideoUrl.trim() || undefined,
      screenshots: [
        { type: 'url', data: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop' }
      ],
      icon: finalIcon,
      url: appUrl || 'https://codznz.com',
      priceType: appPriceType,
      price: appPriceType === 'free' ? 0 : parseInt(appPrice) || 0,
      createdAt: Date.now()
    };

    // Update Local State
    const updatedApps = [newApp, ...apps];
    updateApps(updatedApps);

    // Sync to Firestore if available
    try {
      await setDoc(doc(db, 'apps', newApp.id), newApp);
    } catch (err) {
      console.log('Firebase offline app sync:', err);
    }

    // Reset Form
    setAppName('');
    setAppDesc('');
    setAppFullDesc('');
    setAppUrl('https://github.com');
    setAppVideoUrl('');
    showNotification(lang === 'en' ? `App "${newApp.name}" published successfully! 🚀` : `Programu "${newApp.name}" imechapishwa kikamilifu! 🚀`);
  };

  // -------------------------------------------------------------
  // 2. STATE: PUBLISH COURSE FORM
  // -------------------------------------------------------------
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [coursePriceType, setCoursePriceType] = useState<'free' | 'paid'>('paid');
  const [coursePrice, setCoursePrice] = useState('15000');
  const [courseDuration, setCourseDuration] = useState('Masaa 8 (Vipindi 12)');
  const [courseIcon, setCourseIcon] = useState('⚡');
  const [coursePdfPath, setCoursePdfPath] = useState('');
  
  // Dynamic Course Episodes
  const [episodes, setEpisodes] = useState<Episode[]>([
    { title: 'Somo la 1: Utangulizi & Mazingira ya Kazi', duration: '15 min', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Kuweka tools na kuelewa misingi.' },
    { title: 'Somo la 2: Kuandika Logic ya Kwanza', duration: '25 min', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Mazoezi kwa vitendo na utatuzi wa errors.' }
  ]);

  const addEpisodeField = () => {
    setEpisodes(prev => [
      ...prev, 
      { title: `Somo la ${prev.length + 1}: Mada Mpya`, duration: '20 min', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Maelezo ya somo hili.' }
    ]);
  };

  const removeEpisodeField = (idx: number) => {
    setEpisodes(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePublishCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    const newCourseId = 'course-' + Date.now();
    const newCourse: ContentItem = {
      id: newCourseId,
      title: courseTitle,
      desc: courseDesc || 'Kozi kamili ya kukuwezesha kubobea katika teknolojia hii.',
      category: 'courses',
      price: coursePriceType === 'free' ? 0 : parseInt(coursePrice) || 0,
      isFree: coursePriceType === 'free',
      level: courseLevel,
      duration: courseDuration || `${episodes.length} Vipindi`,
      icon: courseIcon || '📚',
      pdfPath: coursePdfPath.trim() || undefined,
      episodes: episodes.length > 0 ? episodes : undefined,
      createdAt: Date.now()
    };

    // Update Local State
    const updatedCourses = [newCourse, ...courses];
    updateCourses(updatedCourses);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'courses', newCourse.id), newCourse);
    } catch (err) {
      console.log('Firebase offline course sync:', err);
    }

    // Reset Form
    setCourseTitle('');
    setCourseDesc('');
    showNotification(lang === 'en' ? `Course "${newCourse.title}" published with ${episodes.length} lessons! 📚` : `Kozi ya "${newCourse.title}" imechapishwa ikiwa na masomo ${episodes.length}! 📚`);
  };

  // -------------------------------------------------------------
  // 3. STATE: PUBLISH TEST / QUIZ FORM
  // -------------------------------------------------------------
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testDuration, setTestDuration] = useState('Dakika 15');
  const [testTimeLimit, setTestTimeLimit] = useState(15);
  const [testLevel, setTestLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [testPriceType, setTestPriceType] = useState<'free' | 'paid'>('free');
  const [testPrice, setTestPrice] = useState('5000');
  const [testIcon, setTestIcon] = useState('🏆');

  const [questions, setQuestions] = useState<Question[]>([
    {
      q: 'Je, tag ipi ya HTML inatumika kuweka kiungo (link)?',
      a: '<link>',
      b: '<a>',
      c: '<href>',
      d: '<url>',
      correct: 'b',
      explanation: 'Tag ya <a> (Anchor tag) ndiyo inayotumika kwa ajili ya hyperlinks kwenye HTML.'
    },
    {
      q: 'Neno gani la JS linatumika kutangaza variable isiyobadilika?',
      a: 'let',
      b: 'var',
      c: 'const',
      d: 'static',
      correct: 'c',
      explanation: 'Const hutumika kutangaza constant variable.'
    }
  ]);

  const addQuestionField = () => {
    setQuestions(prev => [
      ...prev,
      {
        q: `Swali la ${prev.length + 1}: Andika swali hapa...`,
        a: 'Chaguo A',
        b: 'Chaguo B',
        c: 'Chaguo C',
        d: 'Chaguo D',
        correct: 'a',
        explanation: 'Maelezo ya jibu sahihi.'
      }
    ]);
  };

  const removeQuestionField = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePublishTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    const newTestId = 'test-' + Date.now();
    const newTest: ContentItem = {
      id: newTestId,
      title: testTitle,
      desc: testDesc || 'Mtihani wa kupima maarifa na kupata cheti rasmi.',
      category: 'tests',
      price: testPriceType === 'free' ? 0 : parseInt(testPrice) || 0,
      isFree: testPriceType === 'free',
      level: testLevel,
      duration: testDuration,
      timeLimit: testTimeLimit,
      icon: testIcon || '🏆',
      questions: questions,
      createdAt: Date.now()
    };

    const updatedTests = [newTest, ...tests];
    updateTests(updatedTests);

    try {
      await setDoc(doc(db, 'tests', newTest.id), newTest);
    } catch (err) {
      console.log('Firebase offline test sync:', err);
    }

    setTestTitle('');
    setTestDesc('');
    showNotification(lang === 'en' ? `Test "${newTest.title}" published with ${questions.length} questions! 📝` : `Mtihani wa "${newTest.title}" umechapiswa ukiwa na maswali ${questions.length}! 📝`);
  };

  // -------------------------------------------------------------
  // 4. STATE: PUBLISH VIDEO LECTURE FORM
  // -------------------------------------------------------------
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDesc, setLectureDesc] = useState('');
  const [lectureUrl, setLectureUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lectureDuration, setLectureDuration] = useState('Dakika 35');
  const [lecturePriceType, setLecturePriceType] = useState<'free' | 'paid'>('free');
  const [lecturePrice, setLecturePrice] = useState('3000');
  const [lectureIcon, setLectureIcon] = useState('🎥');

  const handlePublishLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureTitle.trim()) return;

    const newLectureId = 'lecture-' + Date.now();
    const newLecture: ContentItem = {
      id: newLectureId,
      title: lectureTitle,
      desc: lectureDesc || 'Kipindi maalum cha mafunzo ya vitendo kwa video.',
      category: 'lectures',
      price: lecturePriceType === 'free' ? 0 : parseInt(lecturePrice) || 0,
      isFree: lecturePriceType === 'free',
      duration: lectureDuration,
      icon: lectureIcon || '🎥',
      pdfPath: lectureUrl,
      episodes: [
        {
          title: lectureTitle,
          url: lectureUrl,
          duration: lectureDuration,
          description: lectureDesc
        }
      ],
      createdAt: Date.now()
    };

    const updatedLectures = [newLecture, ...lectures];
    updateLectures(updatedLectures);

    try {
      await setDoc(doc(db, 'lectures', newLecture.id), newLecture);
    } catch (err) {
      console.log('Firebase offline lecture sync:', err);
    }

    setLectureTitle('');
    setLectureDesc('');
    showNotification(lang === 'en' ? `Lecture video published successfully! 🎥` : `Kipindi cha video kimechapishwa kikamilifu! 🎥`);
  };

  // Delete item handler
  const handleDeleteItem = async (type: 'app' | 'course' | 'test' | 'lecture', id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this item?' : 'Je, una uhakika unataka kufuta kipengele hiki?')) return;

    if (type === 'app') {
      const filtered = apps.filter(a => a.id !== id);
      updateApps(filtered);
      try { await deleteDoc(doc(db, 'apps', id)); } catch(e) {}
    } else if (type === 'course') {
      const filtered = courses.filter(c => c.id !== id);
      updateCourses(filtered);
      try { await deleteDoc(doc(db, 'courses', id)); } catch(e) {}
    } else if (type === 'test') {
      const filtered = tests.filter(t => t.id !== id);
      updateTests(filtered);
      try { await deleteDoc(doc(db, 'tests', id)); } catch(e) {}
    } else if (type === 'lecture') {
      const filtered = lectures.filter(l => l.id !== id);
      updateLectures(filtered);
      try { await deleteDoc(doc(db, 'lectures', id)); } catch(e) {}
    }

    showNotification(lang === 'en' ? 'Item deleted.' : 'Kipengele kimefutwa.');
  };

  // Seed / Reset all data helper
  const handleSeedAllToFirebase = async () => {
    if (!confirm('Hii itapakia data asili (Seed Data) zote kwenye Cloud Firestore. Unaendelea?')) return;
    try {
      const batch = writeBatch(db);
      SEED_COURSES.forEach(c => batch.set(doc(db, 'courses', c.id), c));
      SEED_TESTS.forEach(t => batch.set(doc(db, 'tests', t.id), t));
      SEED_LECTURES.forEach(l => batch.set(doc(db, 'lectures', l.id), l));
      SEED_APPS.forEach(a => batch.set(doc(db, 'apps', a.id), a));
      SEED_BANNERS.forEach(b => batch.set(doc(db, 'banners', b.id), b));
      await batch.commit();

      updateCourses(SEED_COURSES);
      updateTests(SEED_TESTS);
      updateLectures(SEED_LECTURES);
      updateApps(SEED_APPS);
      showNotification('Data zote zimepakiwa na kusawazishwa kikamilifu! ✅');
    } catch (err: any) {
      showNotification('Kuna hitilafu ya mtandao: ' + err.message);
    }
  };

  // Calculate Creator Stats
  const totalCreations = apps.length + courses.length + tests.length + lectures.length;
  const estimatedRevenue = orders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => sum + (o.amount * 0.8), 0); // 80% Creator share

  return (
    <div className="page-anim space-y-6 max-w-4xl mx-auto pb-10">
      {/* Creator Hub Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Code2 size={240} />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black tracking-wide uppercase text-indigo-200 border border-white/10">
              <Sparkles size={13} className="text-amber-300" />
              <span>{lang === 'en' ? 'Developer & Creator Studio' : 'Kituo cha Wasanidi na Wachapishaji'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              {lang === 'en' ? 'Publish Apps & Courses' : 'Chapisha Programu na Masomo Yako'}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
              {lang === 'en'
                ? `Upload software tools, code editors, online bootcamps, and quiz certifications directly to the ${siteSettings?.siteName || 'Amourcodes'} marketplace.`
                : `Pakia programu zako za koding, mifumo, kozi za video, na mitihani ya vyeti moja kwa moja kwenye soko la ${siteSettings?.siteName || 'Amourcodes'}.`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-2 shrink-0">
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[85px]">
              <div className="text-lg font-black text-white">{apps.length}</div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase">Apps</div>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[85px]">
              <div className="text-lg font-black text-amber-300">{courses.length}</div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase">Courses</div>
            </div>
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center min-w-[85px]">
              <div className="text-lg font-black text-emerald-400">80%</div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase">Share</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setShowPayoutModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-500/40 shadow-sm"
        >
          <Wallet size={15} />
          <span>{lang === 'en' ? '💰 Wallet & Payouts' : '💰 Toa Pesa (Payouts)'}</span>
        </button>

        <button
          onClick={() => setShowAICourseModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40 shadow-sm"
        >
          <Wand2 size={15} className="text-amber-300" />
          <span>{lang === 'en' ? '✨ AI Course Builder' : '✨ Unda Kozi na AI'}</span>
        </button>

        <button
          onClick={() => setActiveTab('app')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'app'
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-card2 text-text2 hover:text-text1 border-theme"
          )}
        >
          <Smartphone size={15} />
          <span>{lang === 'en' ? '+ Publish App' : '+ Chapisha App'}</span>
        </button>

        <button
          onClick={() => setActiveTab('course')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'course'
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-card2 text-text2 hover:text-text1 border-theme"
          )}
        >
          <BookOpen size={15} />
          <span>{lang === 'en' ? '+ Publish Course' : '+ Chapisha Kozi'}</span>
        </button>

        <button
          onClick={() => setActiveTab('test')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'test'
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-card2 text-text2 hover:text-text1 border-theme"
          )}
        >
          <GraduationCap size={15} />
          <span>{lang === 'en' ? '+ Create Quiz/Test' : '+ Unda Mtihani'}</span>
        </button>

        <button
          onClick={() => setActiveTab('lecture')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'lecture'
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-card2 text-text2 hover:text-text1 border-theme"
          )}
        >
          <Video size={15} />
          <span>{lang === 'en' ? '+ Add Video' : '+ Video ya Somo'}</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'catalog'
              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-card2 text-text2 hover:text-text1 border-theme"
          )}
        >
          <Layers size={15} />
          <span>{lang === 'en' ? 'My Catalog' : 'Katalogi Yangu'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-theme text-[10px] text-text1">{totalCreations}</span>
        </button>

        <button
          onClick={() => setActiveTab('devtools')}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            activeTab === 'devtools'
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
              : "bg-card hover:bg-card2 text-text3 hover:text-text1 border-theme"
          )}
        >
          <Terminal size={15} />
          <span>{lang === 'en' ? 'Diagnostics & DB' : 'Zana za Mfumo'}</span>
        </button>
      </div>

      {/* TAB 1: PUBLISH APP FORM */}
      {activeTab === 'app' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div>
                <h3 className="text-base font-black text-text1 flex items-center gap-2">
                  <Smartphone size={18} className="text-primary" />
                  <span>{lang === 'en' ? 'Publish a New Application or Tool' : 'Chapisha Programu au Zana Mpya'}</span>
                </h3>
                <p className="text-xs text-text3">
                  {lang === 'en' ? 'Make your tool available to thousands of Tanzanian coders' : 'Weka zana yako ifikiwe na maelfu ya wanafunzi na watengenezaji programu'}
                </p>
              </div>
            </div>

            <form onSubmit={handlePublishApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* App Name */}
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'App Name' : 'Jina la Programu / App'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'en' ? `e.g. ${siteSettings?.siteName || 'Amourcodes'} Python Studio` : `Mf. ${siteSettings?.siteName || 'Amourcodes'} Python Studio`}
                    value={appName}
                    onChange={e => setAppName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Developer Name */}
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'Developer / Studio Name' : 'Jina la Mtengenezaji / Studio'}
                  </label>
                  <input
                    type="text"
                    placeholder="Mf. Zanzibar Tech Labs"
                    value={appDeveloper}
                    onChange={e => setAppDeveloper(e.target.value)}
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Tagline / Short Summary' : 'Maelezo Mafupi (Tagline)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'Mobile code editor & Python/JS compiler with offline support' : 'Mhariri wa kodi kwenye simu & Python/JS compiler'}
                  value={appDesc}
                  onChange={e => setAppDesc(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'Category' : 'Kitengo'}
                  </label>
                  <select
                    value={appCategory}
                    onChange={e => setAppCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                  >
                    <option value="Coding & Developer Tools">Coding & Compilers</option>
                    <option value="AI & Productivity">AI & Productivity</option>
                    <option value="Web & Utilities">Web & Utilities</option>
                    <option value="Educational & Quizzes">Educational Tools</option>
                  </select>
                </div>

                {/* Pricing Type */}
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'Access Model' : 'Aina ya Bei'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-card2 border border-theme rounded-xl h-11 items-center">
                    <button
                      type="button"
                      onClick={() => setAppPriceType('free')}
                      className={cn(
                        "h-8 rounded-lg text-xs font-black transition-all",
                        appPriceType === 'free' ? "bg-emerald-600 text-white" : "text-text3 hover:text-text1"
                      )}
                    >
                      Bure (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppPriceType('paid')}
                      className={cn(
                        "h-8 rounded-lg text-xs font-black transition-all",
                        appPriceType === 'paid' ? "bg-primary text-white" : "text-text3 hover:text-text1"
                      )}
                    >
                      Lipia (Paid)
                    </button>
                  </div>
                </div>

                {/* Price (If Paid) */}
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'Price (TZS)' : 'Bei (TZS)'}
                  </label>
                  <input
                    type="number"
                    disabled={appPriceType === 'free'}
                    placeholder="5000"
                    value={appPriceType === 'free' ? '0' : appPrice}
                    onChange={e => setAppPrice(e.target.value)}
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary disabled:opacity-40"
                  />
                </div>
              </div>

              {/* URL & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'Download URL / Live Web Link' : 'Kiungo cha Kupakua (APK / Web Link)'} *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/my-app/release.apk"
                    value={appUrl}
                    onChange={e => setAppUrl(e.target.value)}
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-medium text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                    {lang === 'en' ? 'File Size' : 'Ukubwa wa Faili (Mf. 28MB)'}
                  </label>
                  <input
                    type="text"
                    placeholder="28MB"
                    value={appSize}
                    onChange={e => setAppSize(e.target.value)}
                    className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Icon Presets */}
              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1.5">
                  {lang === 'en' ? 'Choose App Icon' : 'Chagua Ikoni ya Programu'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {['💻', '📱', '⚡', '🚀', '🔥', '🤖', '🛠️', '🎯', '📦', '🧠', '🌐'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => { setAppIconPreset(icon); setAppCustomIconUrl(''); }}
                      className={cn(
                        "w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all",
                        appIconPreset === icon && !appCustomIconUrl 
                          ? "bg-primary/20 border-primary scale-110 shadow-sm" 
                          : "bg-card2 border-theme hover:border-primary/50"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                  <input
                    type="url"
                    placeholder="au Weka URL ya picha (.png / .jpg)"
                    value={appCustomIconUrl}
                    onChange={e => setAppCustomIconUrl(e.target.value)}
                    className="flex-1 min-w-[200px] h-10 px-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Full Description & Changelog */}
              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Full Description & Key Features' : 'Maelezo Kamili na Sifa Kuu'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Eleza sifa za programu yako, faida zake, na jinsi inavyowasaidia wanafunzi..."
                  value={appFullDesc}
                  onChange={e => setAppFullDesc(e.target.value)}
                  className="w-full p-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
              >
                <UploadCloud size={16} />
                <span>{lang === 'en' ? `Publish App to ${siteSettings?.siteName || 'Amourcodes'} Store` : `Chapisha Programu Kwenye ${siteSettings?.siteName || 'Amourcodes'} Store`}</span>
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-3">
            <div className="text-xs font-black text-text3 uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Eye size={14} className="text-primary" />
              <span>{lang === 'en' ? 'Live Store Preview' : 'Mwonekano wa Moja kwa Moja'}</span>
            </div>

            <div className="bg-card border border-theme rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-card2 border border-theme flex items-center justify-center text-2xl shadow-inner shrink-0 overflow-hidden">
                  {appCustomIconUrl ? (
                    <img src={appCustomIconUrl} alt="App" className="w-full h-full object-cover" />
                  ) : (
                    <span>{appIconPreset}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-black text-sm text-text1 truncate">
                      {appName || 'Jina la Programu'}
                    </h4>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-md shrink-0 uppercase",
                      appPriceType === 'free' ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-primary/15 text-primary border border-primary/20"
                    )}>
                      {appPriceType === 'free' ? 'Bure' : `${parseInt(appPrice || '0').toLocaleString()} TZS`}
                    </span>
                  </div>
                  <p className="text-[11px] text-text3 line-clamp-1 mt-0.5">
                    {appDesc || 'Maelezo mafupi ya programu yako yataonekana hapa.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-text3">
                    <span className="font-bold text-amber-400">★ 5.0</span>
                    <span>•</span>
                    <span>{appSize || '25MB'}</span>
                    <span>•</span>
                    <span className="truncate">{appDeveloper || 'Studio Name'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-theme flex items-center justify-between text-xs">
                <span className="text-[11px] text-text3 font-medium">{appCategory}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>{lang === 'en' ? 'Install' : 'Sakinisha'}</span>
                </button>
              </div>
            </div>

            {/* Creator Revenue Tip */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-xs space-y-1.5 text-indigo-300">
              <div className="font-black text-indigo-200 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                <span>{lang === 'en' ? 'Creator Payouts' : 'Mapato ya Mtengenezaji'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-200/80">
                Unapochapisha programu ya kulipia, unapata <strong>80%</strong> ya mauzo yote ya moja kwa moja kupitia namba yako ya M-Pesa au Tigo Pesa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISH COURSE FORM */}
      {activeTab === 'course' && (
        <div className="bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-theme pb-3">
            <h3 className="text-base font-black text-text1 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <span>{lang === 'en' ? 'Publish a Full Coding Bootcamp / Course' : 'Chapisha Kozi Kamili ya Koding'}</span>
            </h3>
            <p className="text-xs text-text3">
              {lang === 'en' ? 'Upload comprehensive video curriculum, code snippets, and certificates' : 'Panga masomo yako hatua kwa hatua, weka viungo vya video na maelezo ya kodi'}
            </p>
          </div>

          <form onSubmit={handlePublishCourse} className="space-y-5">
            {/* Title & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Course Title' : 'Kichwa cha Kozi'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'e.g. Master React & Next.js 14 from Scratch' : 'Mf. Bobea Kwenye Python & Data Science'}
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Difficulty Level' : 'Kiwango cha Uelewa'}
                </label>
                <select
                  value={courseLevel}
                  onChange={e => setCourseLevel(e.target.value as any)}
                  className="w-full h-11 px-3 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                >
                  <option value="Beginner">Mwanzo (Beginner)</option>
                  <option value="Intermediate">Kati (Intermediate)</option>
                  <option value="Advanced">Bingwa (Advanced)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                {lang === 'en' ? 'Course Overview & Syllabus Summary' : 'Muhtasari wa Kozi'} *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Eleza malengo makuu ya kozi hii, nani anayestahili kujifunza, na ujuzi atakaopata..."
                value={courseDesc}
                onChange={e => setCourseDesc(e.target.value)}
                className="w-full p-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Pricing & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Pricing Model' : 'Aina ya Ada'}
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-card2 border border-theme rounded-xl h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setCoursePriceType('free')}
                    className={cn("h-8 rounded-lg text-xs font-black transition-all", coursePriceType === 'free' ? "bg-emerald-600 text-white" : "text-text3")}
                  >
                    Bure
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoursePriceType('paid')}
                    className={cn("h-8 rounded-lg text-xs font-black transition-all", coursePriceType === 'paid' ? "bg-primary text-white" : "text-text3")}
                  >
                    Lipia
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Price (TZS)' : 'Bei ya Kozi (TZS)'}
                </label>
                <input
                  type="number"
                  disabled={coursePriceType === 'free'}
                  value={coursePriceType === 'free' ? '0' : coursePrice}
                  onChange={e => setCoursePrice(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary disabled:opacity-40"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Total Duration' : 'Muda wa Kozi (Mf. Masaa 12)'}
                </label>
                <input
                  type="text"
                  placeholder="Masaa 10 (Vipindi 15)"
                  value={courseDuration}
                  onChange={e => setCourseDuration(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* DYNAMIC LESSON / EPISODE BUILDER */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <span className="text-xs font-black text-text1 uppercase tracking-wider flex items-center gap-1.5">
                  <Play size={14} className="text-primary" />
                  <span>{lang === 'en' ? 'Curriculum Lessons' : 'Masomo na Vipindi vya Kozi'} ({episodes.length})</span>
                </span>
                <button
                  type="button"
                  onClick={addEpisodeField}
                  className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>{lang === 'en' ? 'Add Lesson' : 'Ongeza Somo'}</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {episodes.map((ep, idx) => (
                  <div key={idx} className="p-3.5 bg-card2 border border-theme rounded-2xl space-y-2 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-theme text-primary">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder="Kichwa cha Somo (Mf. Kuanzisha Database)"
                        value={ep.title}
                        onChange={e => {
                          const val = e.target.value;
                          setEpisodes(prev => prev.map((item, i) => i === idx ? { ...item, title: val } : item));
                        }}
                        className="flex-1 h-8 px-2.5 bg-theme border border-theme rounded-lg text-xs font-bold text-text1 outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Muda (Mf. 20 min)"
                        value={ep.duration}
                        onChange={e => {
                          const val = e.target.value;
                          setEpisodes(prev => prev.map((item, i) => i === idx ? { ...item, duration: val } : item));
                        }}
                        className="w-24 h-8 px-2 bg-theme border border-theme rounded-lg text-xs text-text2 outline-none focus:border-primary text-center"
                      />
                      {episodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEpisodeField(idx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Futa somo hili"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="URL ya Video (YouTube Embed Link, mf. https://www.youtube.com/watch?v=...)"
                      value={ep.url}
                      onChange={e => {
                        const val = e.target.value;
                        setEpisodes(prev => prev.map((item, i) => i === idx ? { ...item, url: val } : item));
                      }}
                      className="w-full h-8 px-2.5 bg-theme border border-theme rounded-lg text-[11px] text-text3 outline-none focus:border-primary font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <UploadCloud size={16} />
              <span>{lang === 'en' ? `Publish Course with ${episodes.length} Lessons` : `Chapisha Kozi Ikiwa na Masomo ${episodes.length}`}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PUBLISH TEST / QUIZ */}
      {activeTab === 'test' && (
        <div className="bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="border-b border-theme pb-3">
            <h3 className="text-base font-black text-text1 flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <span>{lang === 'en' ? 'Create Interactive Certification Quiz' : 'Tengeneza Mtihani wa Vyeti'}</span>
            </h3>
            <p className="text-xs text-text3">
              {lang === 'en' ? 'Test student comprehension with automatic grading, timers, and reward badges' : 'Weka maswali ya chaguzi nyingi (multiple choice) yanayosahihishwa moja kwa moja'}
            </p>
          </div>

          <form onSubmit={handlePublishTest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Quiz Title' : 'Kichwa cha Mtihani'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mf. Mtihani wa JavaScript ES6 & Web DOM"
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Time Limit (Mins)' : 'Muda wa Kufanya (Dakika)'}
                </label>
                <input
                  type="number"
                  value={testTimeLimit}
                  onChange={e => setTestTimeLimit(parseInt(e.target.value) || 15)}
                  className="w-full h-11 px-3 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary text-center"
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-theme pb-2">
                <span className="text-xs font-black text-text1 uppercase tracking-wider">
                  {lang === 'en' ? 'Questions List' : 'Orodha ya Maswali'} ({questions.length})
                </span>
                <button
                  type="button"
                  onClick={addQuestionField}
                  className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>{lang === 'en' ? 'Add Question' : 'Ongeza Swali'}</span>
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-card2 border border-theme rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-primary">Swali #{idx + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionField(idx)}
                          className="text-text3 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Andika swali lako hapa..."
                      value={q.q}
                      onChange={e => {
                        const val = e.target.value;
                        setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, q: val } : item));
                      }}
                      className="w-full h-9 px-3 bg-theme border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      {(['a', 'b', 'c', 'd'] as const).map(opt => (
                        <div key={opt} className="flex items-center gap-1.5 bg-theme p-1.5 rounded-xl border border-theme">
                          <button
                            type="button"
                            onClick={() => {
                              setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, correct: opt } : item));
                            }}
                            className={cn(
                              "w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center shrink-0 uppercase transition-all",
                              q.correct === opt ? "bg-emerald-500 text-white" : "bg-card2 text-text3"
                            )}
                          >
                            {opt}
                          </button>
                          <input
                            type="text"
                            value={q[opt]}
                            onChange={e => {
                              const val = e.target.value;
                              setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, [opt]: val } : item));
                            }}
                            className="flex-1 bg-transparent text-xs text-text1 outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <UploadCloud size={16} />
              <span>{lang === 'en' ? 'Publish Quiz / Test' : 'Chapisha Mtihani Huu'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PUBLISH VIDEO LECTURE */}
      {activeTab === 'lecture' && (
        <div className="bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="border-b border-theme pb-3">
            <h3 className="text-base font-black text-text1 flex items-center gap-2">
              <Video size={18} className="text-primary" />
              <span>{lang === 'en' ? 'Publish Masterclass Video' : 'Chapisha Video ya Somo / Masterclass'}</span>
            </h3>
            <p className="text-xs text-text3">
              {lang === 'en' ? 'Share focused practical tutorials and live coding sessions' : 'Weka video maalum za mafunzo ya vitendo kwa ajili ya wanafunzi'}
            </p>
          </div>

          <form onSubmit={handlePublishLecture} className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                {lang === 'en' ? 'Video Title' : 'Kichwa cha Video'} *
              </label>
              <input
                type="text"
                required
                placeholder="Mf. Jinsi ya Kujenga M-Pesa STK Push API kwa Node.js"
                value={lectureTitle}
                onChange={e => setLectureTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                {lang === 'en' ? 'YouTube / Video Stream URL' : 'Kiungo cha Video (YouTube Link au Direct MP4)'} *
              </label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={lectureUrl}
                onChange={e => setLectureUrl(e.target.value)}
                className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-mono text-text1 outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Duration' : 'Muda (Mf. Dakika 45)'}
                </label>
                <input
                  type="text"
                  placeholder="Dakika 45"
                  value={lectureDuration}
                  onChange={e => setLectureDuration(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
                  {lang === 'en' ? 'Pricing' : 'Bei'}
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-card2 border border-theme rounded-xl h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setLecturePriceType('free')}
                    className={cn("h-8 rounded-lg text-xs font-black transition-all", lecturePriceType === 'free' ? "bg-emerald-600 text-white" : "text-text3")}
                  >
                    Bure
                  </button>
                  <button
                    type="button"
                    onClick={() => setLecturePriceType('paid')}
                    className={cn("h-8 rounded-lg text-xs font-black transition-all", lecturePriceType === 'paid' ? "bg-primary text-white" : "text-text3")}
                  >
                    Lipia
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-[0.99] transition-all"
            >
              <UploadCloud size={16} />
              <span>{lang === 'en' ? 'Publish Video Lecture' : 'Chapisha Video ya Somo'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: MY CATALOG & MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* APPS LIST */}
          <div className="bg-card border border-theme rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                <h4 className="font-black text-sm text-text1">{lang === 'en' ? 'Published Apps & Tools' : 'Programu Zilizochapishwa'} ({apps.length})</h4>
              </div>
              <button
                onClick={() => setActiveTab('app')}
                className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Ongeza Mpya</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apps.map(app => (
                <div key={app.id} className="p-3.5 bg-card2 border border-theme rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-theme flex items-center justify-center text-xl shrink-0">
                      {app.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs text-text1 truncate">{app.name}</div>
                      <div className="text-[10px] text-text3 flex items-center gap-1.5 mt-0.5">
                        <span className="text-emerald-400 font-bold">{app.priceType === 'free' ? 'Bure' : formatPrice(app.price)}</span>
                        <span>•</span>
                        <span>{app.size}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('app', app.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-text3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Futa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* COURSES LIST */}
          <div className="bg-card border border-theme rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-primary" />
                <h4 className="font-black text-sm text-text1">{lang === 'en' ? 'Published Courses' : 'Kozi Zilizochapishwa'} ({courses.length})</h4>
              </div>
              <button
                onClick={() => setActiveTab('course')}
                className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Ongeza Mpya</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map(course => (
                <div key={course.id} className="p-3.5 bg-card2 border border-theme rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-theme flex items-center justify-center text-xl shrink-0">
                      {course.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs text-text1 truncate">{course.title}</div>
                      <div className="text-[10px] text-text3 flex items-center gap-1.5 mt-0.5">
                        <span className="text-primary font-bold">{course.isFree ? 'Bure' : formatPrice(course.price)}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.episodes?.length || 0} Masomo</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('course', course.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-text3 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Futa"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DIAGNOSTICS & DB TOOLS */}
      {activeTab === 'devtools' && (
        <div className="bg-card border border-theme rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-theme pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-text1 flex items-center gap-2">
                <Database size={18} className="text-indigo-400" />
                <span>{lang === 'en' ? 'Database Synchronization & Maintenance' : 'Usawazishaji wa Data & Mfumo'}</span>
              </h3>
              <p className="text-xs text-text3">
                {lang === 'en' ? 'Push default curriculum & apps to Firebase or export local cache' : 'Pakia data zote za awali kwenye Cloud Firestore au safisha kumbukumbu'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Push Seed Data to Firestore */}
            <div className="p-4 bg-card2 border border-theme rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-primary" />
                <h4 className="font-bold text-xs text-text1">Pakia Seed Data Kwenye Firebase</h4>
              </div>
              <p className="text-[11px] text-text3">
                Hii itaunda mikusanyiko yote ya <code>courses</code>, <code>apps</code>, <code>tests</code>, na <code>lectures</code> kwenye mradi wako mpya wa Firebase (<strong>kanzu2-5a6fe</strong>).
              </p>
              <button
                type="button"
                onClick={handleSeedAllToFirebase}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all"
              >
                Sync All to Cloud Firestore 🚀
              </button>
            </div>

            {/* Quick XP Booster */}
            <div className="p-4 bg-card2 border border-theme rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <h4 className="font-bold text-xs text-text1">XP Points Booster (Test Mode)</h4>
              </div>
              <p className="text-[11px] text-text3">
                Ongeza pointi za majaribio kwenye akaunti yako ili kufungua vyeo na ubao wa wanafunzi bora.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { addPoints(500); showNotification('+500 XP Added!'); }}
                  className="flex-1 h-10 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold"
                >
                  +500 XP
                </button>
                <button
                  type="button"
                  onClick={() => { addPoints(2000); showNotification('+2,000 XP Added!'); }}
                  className="flex-1 h-10 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold"
                >
                  +2,000 XP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Payout Modal */}
      {showPayoutModal && (
        <DeveloperPayoutModal onClose={() => setShowPayoutModal(false)} />
      )}

      {/* AI Assistant & Course Builder Modal */}
      {showAICourseModal && (
        <AIAssistantModal onClose={() => setShowAICourseModal(false)} defaultTab="generator" />
      )}
    </div>
  );
};
