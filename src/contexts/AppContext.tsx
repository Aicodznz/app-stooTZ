import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL } from '../services/firebase';
import { 
  UserProfile, 
  ContentItem, 
  CodApp, 
  Banner, 
  Order, 
  Review, 
  Discussion, 
  AppNotification, 
  SiteSettings, 
  UssdSettings,
  DeveloperPackage,
  DeveloperApplication,
  LearningBundle,
  Coupon,
  AchievementBadge,
  PlaygroundSnippet,
  QnAQuestion,
  PayoutRequest,
  StudyNote,
  CheatsheetItem,
  AIErrExplanation,
  AILessonSummary
} from '../types';
import { 
  SEED_COURSES, 
  SEED_TESTS, 
  SEED_LECTURES, 
  SEED_BANNERS, 
  SEED_APPS, 
  SEED_REVIEWS, 
  SEED_NOTIFICATIONS, 
  SEED_DISCUSSIONS,
  SEED_ORDERS,
  SEED_DEVELOPER_PACKAGES,
  SEED_DEVELOPER_APPLICATIONS,
  SEED_BUNDLES,
  SEED_COUPONS,
  SEED_ACHIEVEMENT_BADGES,
  SEED_PLAYGROUND_TEMPLATES,
  SEED_CHEATSHEETS,
  SEED_QNA_QUESTIONS,
  SEED_PAYOUT_REQUESTS,
  SEED_STUDY_NOTES
} from '../constants';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'CodZnz Pro',
  siteTagline: 'Tanzania #1 Coding Education Platform',
  logoUrl: '',
  logoEmoji: '⚡',
  primaryColor: '#4F46E5',
  accentColor: '#7C3AED',
  accent2Color: '#EC4899',
};

const DEFAULT_USSD_SETTINGS: UssdSettings = {
  enabled: true,
  apkName: 'CodZnz_USSD_Push_Gateway_v2.4.apk',
  apkVersion: '2.4.0',
  apkDownloadUrl: 'https://github.com/codznz/ussd-push-apk/releases/download/v2.4.0/CodZnz_USSD_Gateway.apk',
  ussdPrefix: '*150*',
  autoPushEnabled: true,
  webhookUrl: 'https://api.codznz.com/v1/ussd-callback',
  gatewayProvider: 'Vodacom / Tigo / Airtel SIM Push Gateway'
};

interface AppState {
  user: User | null;
  profile: UserProfile | null;
  isAdm: boolean;
  lang: 'en' | 'sw';
  courses: ContentItem[];
  tests: ContentItem[];
  lectures: ContentItem[];
  banners: Banner[];
  apps: CodApp[];
  orders: Order[];
  users: UserProfile[];
  reviews: Review[];
  notifications: AppNotification[];
  discussions: Discussion[];
  completedEpisodes: Record<string, boolean>;
  cart: string[];
  theme: 'dark' | 'light';
  loading: boolean;
  lib: Record<string, boolean>;
  pts: number;
  strk: number;
  siteSettings: SiteSettings;
  ussdSettings: UssdSettings;
  developerPackages: DeveloperPackage[];
  developerApplications: DeveloperApplication[];
  bundles: LearningBundle[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  badges: AchievementBadge[];
  unlockedBadges: string[];
  playgroundSnippets: PlaygroundSnippet[];
  qnaQuestions: QnAQuestion[];
  payoutRequests: PayoutRequest[];
  studyNotes: StudyNote[];
  cheatsheets: CheatsheetItem[];
}

interface AppContextType extends AppState {
  setLang: (lang: 'en' | 'sw') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  logout: () => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  addDiscussionQuestion: (itemId: string | undefined, question: string) => void;
  addDiscussionReply: (discussionId: string, text: string) => void;
  toggleEpisodeComplete: (itemId: string, epIdx: number) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  broadcastNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => Promise<boolean>;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  giveUserAccess: (userEmailOrUid: string, itemId: string) => void;
  revokeUserAccess: (userEmailOrUid: string, itemId: string) => void;
  addPoints: (amount: number) => void;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  updateUserByAdmin: (uid: string, data: Partial<UserProfile>) => Promise<boolean>;
  deleteUserByAdmin: (uid: string) => Promise<boolean>;
  updateCourses: (courses: ContentItem[]) => void;
  updateTests: (tests: ContentItem[]) => void;
  updateLectures: (lectures: ContentItem[]) => void;
  updateApps: (apps: CodApp[]) => void;
  updateBanners: (banners: Banner[]) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<boolean>;
  updateUssdSettings: (settings: Partial<UssdSettings>) => Promise<boolean>;
  // Developer Management & Packages
  applyForDeveloper: (data: { packageId: string; packageName: string; packagePrice: number; userPhone: string; devBio?: string; portfolioUrl?: string; paymentRef?: string }) => Promise<boolean>;
  approveDeveloperApplication: (appId: string) => Promise<boolean>;
  rejectDeveloperApplication: (appId: string, reason?: string) => Promise<boolean>;
  addDeveloperPackage: (pkg: Omit<DeveloperPackage, 'id'>) => void;
  updateDeveloperPackage: (id: string, pkg: Partial<DeveloperPackage>) => void;
  deleteDeveloperPackage: (id: string) => void;
  // Bundles & Learning Paths
  buyBundle: (bundleId: string, paymentMethod?: string, phone?: string) => Promise<string>;
  updateBundles: (bundles: LearningBundle[]) => void;
  // Coupons & Promo Codes
  addCoupon: (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => void;
  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  applyCouponCode: (code: string, currentTotal: number, itemIds: string[]) => { success: boolean; discountAmount: number; finalTotal: number; message: string; coupon?: Coupon };
  clearAppliedCoupon: () => void;
  // Referral System & Badges
  claimReferral: (code: string) => Promise<{ success: boolean; message: string }>;
  unlockBadge: (badgeId: string) => void;
  triggerDirectUssdPush: (phone: string, amount: number, providerName: string) => Promise<{ success: boolean; ref: string }>;
  // --- NEW CAPABILITIES ---
  // 1. Code Playground
  savePlaygroundSnippet: (snippet: PlaygroundSnippet) => void;
  deletePlaygroundSnippet: (id: string) => void;
  // 2. Q&A Community Forum
  addQnAQuestion: (q: { itemId?: string; itemTitle?: string; title: string; details: string; codeSnippet?: string }) => Promise<boolean>;
  addQnAReply: (questionId: string, content: string, codeSnippet?: string) => Promise<boolean>;
  upvoteQnA: (questionId: string) => void;
  // 3. Developer Payouts
  requestPayout: (data: { amount: number; provider: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'; accountName: string; phoneNumber: string; notes?: string }) => Promise<boolean>;
  updatePayoutStatus: (id: string, status: 'approved' | 'rejected' | 'paid', adminNote?: string, transactionRef?: string) => Promise<boolean>;
  // 4. Study Notes & Cheatsheets
  saveStudyNote: (note: { id?: string; courseId?: string; courseTitle?: string; title: string; content: string; tags?: string[] }) => void;
  deleteStudyNote: (id: string) => void;
  // 5. Server-Side AI Helpers
  explainCodeErrorWithAI: (code: string, errorMessage?: string, language?: string) => Promise<AIErrExplanation>;
  generateCourseWithAI: (topic: string, level?: string, category?: string) => Promise<any>;
  summarizeLessonWithAI: (title: string, content: string, level?: string) => Promise<AILessonSummary>;
  askAITutor: (question: string, lessonContext?: string, studentCode?: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null,
    profile: null,
    isAdm: false,
    lang: (localStorage.getItem('czp_lang') as 'en' | 'sw') || 'sw',
    theme: (localStorage.getItem('czp_theme') as 'dark' | 'light') || 'dark',
    courses: JSON.parse(localStorage.getItem('czp_courses') || 'null') || SEED_COURSES,
    tests: JSON.parse(localStorage.getItem('czp_tests') || 'null') || SEED_TESTS,
    lectures: JSON.parse(localStorage.getItem('czp_lectures') || 'null') || SEED_LECTURES,
    banners: JSON.parse(localStorage.getItem('czp_banners') || 'null') || SEED_BANNERS,
    apps: JSON.parse(localStorage.getItem('czp_apps') || 'null') || SEED_APPS,
    orders: JSON.parse(localStorage.getItem('czp_orders') || 'null') || SEED_ORDERS,
    users: [
      {
        uid: 'u-demo-1',
        name: 'Hamisi Omari',
        email: 'hamisi@example.com',
        points: 450,
        streak: 4,
        lastLogin: Date.now() - 86400000,
        library: { c1: true, t1: true },
        progress: { c1: 80 },
        status: 'Active',
        role: 'user'
      },
      {
        uid: 'u-demo-2',
        name: 'Amina Salum',
        email: 'amina@example.com',
        points: 820,
        streak: 7,
        lastLogin: Date.now() - 3600000 * 2,
        library: { l1: true },
        progress: { l1: 65 },
        status: 'Active',
        role: 'user'
      }
    ],
    reviews: JSON.parse(localStorage.getItem('czp_reviews') || 'null') || SEED_REVIEWS,
    notifications: JSON.parse(localStorage.getItem('czp_notifications') || 'null') || SEED_NOTIFICATIONS,
    discussions: JSON.parse(localStorage.getItem('czp_discussions') || 'null') || SEED_DISCUSSIONS,
    completedEpisodes: JSON.parse(localStorage.getItem('czp_completed_eps') || '{}'),
    cart: JSON.parse(localStorage.getItem('czp_c') || '[]'),
    loading: true,
    lib: JSON.parse(localStorage.getItem('czp_local_lib') || '{}'),
    pts: Number(localStorage.getItem('czp_pts') || '150'),
    strk: Number(localStorage.getItem('czp_strk') || '2'),
    siteSettings: JSON.parse(localStorage.getItem('czp_site_settings') || 'null') || DEFAULT_SITE_SETTINGS,
    ussdSettings: JSON.parse(localStorage.getItem('czp_ussd_settings') || 'null') || DEFAULT_USSD_SETTINGS,
    developerPackages: JSON.parse(localStorage.getItem('czp_dev_pkgs') || 'null') || SEED_DEVELOPER_PACKAGES,
    developerApplications: JSON.parse(localStorage.getItem('czp_dev_apps') || 'null') || SEED_DEVELOPER_APPLICATIONS,
    bundles: JSON.parse(localStorage.getItem('czp_bundles') || 'null') || SEED_BUNDLES,
    coupons: JSON.parse(localStorage.getItem('czp_coupons') || 'null') || SEED_COUPONS,
    appliedCoupon: null,
    badges: SEED_ACHIEVEMENT_BADGES,
    unlockedBadges: JSON.parse(localStorage.getItem('czp_unlocked_badges') || '["bdg-welcome"]'),
    playgroundSnippets: JSON.parse(localStorage.getItem('czp_snippets') || 'null') || SEED_PLAYGROUND_TEMPLATES,
    qnaQuestions: JSON.parse(localStorage.getItem('czp_qna') || 'null') || SEED_QNA_QUESTIONS,
    payoutRequests: JSON.parse(localStorage.getItem('czp_payouts') || 'null') || SEED_PAYOUT_REQUESTS,
    studyNotes: JSON.parse(localStorage.getItem('czp_notes') || 'null') || SEED_STUDY_NOTES,
    cheatsheets: SEED_CHEATSHEETS
  });

  // Dynamic CSS variables for primary and accent brand colors
  useEffect(() => {
    if (state.siteSettings.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', state.siteSettings.primaryColor);
      document.documentElement.style.setProperty('--p', state.siteSettings.primaryColor);
    }
    if (state.siteSettings.accentColor) {
      document.documentElement.style.setProperty('--color-accent', state.siteSettings.accentColor);
      document.documentElement.style.setProperty('--ac', state.siteSettings.accentColor);
    }
    if (state.siteSettings.accent2Color) {
      document.documentElement.style.setProperty('--color-accent-2', state.siteSettings.accent2Color);
      document.documentElement.style.setProperty('--ac2', state.siteSettings.accent2Color);
    }
  }, [state.siteSettings.primaryColor, state.siteSettings.accentColor, state.siteSettings.accent2Color]);

  useEffect(() => {
    localStorage.setItem('czp_site_settings', JSON.stringify(state.siteSettings));
    if (state.siteSettings?.siteName) {
      document.title = `${state.siteSettings.siteName} | ${state.siteSettings.siteTagline || 'Swahili Coding Education'}`;
    }
  }, [state.siteSettings]);

  // Realtime Firestore sync for siteSettings & ussdSettings
  useEffect(() => {
    let unsubSite = () => {};
    let unsubUssd = () => {};
    try {
      unsubSite = onSnapshot(doc(db, 'settings', 'site'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          setState(prev => {
            const merged = { ...prev.siteSettings, ...data };
            localStorage.setItem('czp_site_settings', JSON.stringify(merged));
            return { ...prev, siteSettings: merged };
          });
        }
      }, (err) => {
        console.log('Site settings snapshot offline notice:', err);
      });
    } catch (e) {
      console.warn('Site settings listener error:', e);
    }

    try {
      unsubUssd = onSnapshot(doc(db, 'settings', 'ussd'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<UssdSettings>;
          setState(prev => {
            const merged = { ...prev.ussdSettings, ...data };
            localStorage.setItem('czp_ussd_settings', JSON.stringify(merged));
            return { ...prev, ussdSettings: merged };
          });
        }
      }, (err) => {
        console.log('USSD settings snapshot offline notice:', err);
      });
    } catch (e) {
      console.warn('USSD settings listener error:', e);
    }

    return () => {
      unsubSite();
      unsubUssd();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('czp_ussd_settings', JSON.stringify(state.ussdSettings));
  }, [state.ussdSettings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('czp_theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem('czp_lang', state.lang);
  }, [state.lang]);

  useEffect(() => {
    localStorage.setItem('czp_c', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    localStorage.setItem('czp_reviews', JSON.stringify(state.reviews));
  }, [state.reviews]);

  useEffect(() => {
    localStorage.setItem('czp_discussions', JSON.stringify(state.discussions));
  }, [state.discussions]);

  useEffect(() => {
    localStorage.setItem('czp_notifications', JSON.stringify(state.notifications));
  }, [state.notifications]);

  useEffect(() => {
    localStorage.setItem('czp_orders', JSON.stringify(state.orders));
  }, [state.orders]);

  useEffect(() => {
    localStorage.setItem('czp_completed_eps', JSON.stringify(state.completedEpisodes));
  }, [state.completedEpisodes]);

  useEffect(() => {
    localStorage.setItem('czp_local_lib', JSON.stringify(state.lib));
  }, [state.lib]);

  useEffect(() => {
    localStorage.setItem('czp_pts', state.pts.toString());
  }, [state.pts]);

  useEffect(() => {
    localStorage.setItem('czp_courses', JSON.stringify(state.courses));
    localStorage.setItem('czp_tests', JSON.stringify(state.tests));
    localStorage.setItem('czp_lectures', JSON.stringify(state.lectures));
    localStorage.setItem('czp_apps', JSON.stringify(state.apps));
    localStorage.setItem('czp_banners', JSON.stringify(state.banners));
  }, [state.courses, state.tests, state.lectures, state.apps, state.banners]);

  useEffect(() => {
    localStorage.setItem('czp_snippets', JSON.stringify(state.playgroundSnippets));
  }, [state.playgroundSnippets]);

  useEffect(() => {
    localStorage.setItem('czp_qna', JSON.stringify(state.qnaQuestions));
  }, [state.qnaQuestions]);

  useEffect(() => {
    localStorage.setItem('czp_payouts', JSON.stringify(state.payoutRequests));
  }, [state.payoutRequests]);

  useEffect(() => {
    localStorage.setItem('czp_notes', JSON.stringify(state.studyNotes));
  }, [state.studyNotes]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let profile: UserProfile | null = null;
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          profile = userDoc.exists() ? (userDoc.data() as UserProfile) : null;
        } catch (e) {
          console.log('Firebase user fetch offline fallback:', e);
        }

        const isUserAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        setState(prev => ({
          ...prev,
          user,
          profile,
          isAdm: isUserAdmin,
          pts: profile?.points ?? prev.pts,
          strk: profile?.streak ?? prev.strk,
          lib: { ...prev.lib, ...(profile?.library || {}) },
          loading: false
        }));
      } else {
        setState(prev => ({ ...prev, user: null, profile: null, isAdm: false, loading: false }));
      }
    });

    return () => unsub();
  }, []);

  const setLang = (lang: 'en' | 'sw') => setState(p => ({ ...p, lang }));
  const setTheme = (theme: 'dark' | 'light') => setState(p => ({ ...p, theme }));
  const addToCart = (id: string) => setState(p => ({ ...p, cart: [...new Set([...p.cart, id])] }));
  const removeFromCart = (id: string) => setState(p => ({ ...p, cart: p.cart.filter(item => item !== id) }));
  const clearCart = () => setState(p => ({ ...p, cart: [] }));
  const logout = () => auth.signOut();

  const addReview = (rev: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...rev,
      id: 'rev-' + Date.now(),
      createdAt: Date.now()
    };
    setState(p => ({
      ...p,
      reviews: [newRev, ...p.reviews]
    }));
  };

  const addDiscussionQuestion = (itemId: string | undefined, question: string) => {
    const newDisc: Discussion = {
      id: 'disc-' + Date.now(),
      itemId,
      userId: state.user?.uid || 'guest-' + Date.now(),
      userName: state.profile?.name || state.user?.displayName || state.user?.email?.split('@')[0] || 'Mwanafunzi',
      question,
      replies: [],
      createdAt: Date.now()
    };
    setState(p => ({
      ...p,
      discussions: [newDisc, ...p.discussions]
    }));
  };

  const addDiscussionReply = (discussionId: string, text: string) => {
    setState(p => ({
      ...p,
      discussions: p.discussions.map(d => {
        if (d.id === discussionId) {
          const newReply = {
            id: 'rep-' + Date.now(),
            author: state.isAdm ? 'CodZnz Mwalimu Mkuu' : (state.profile?.name || state.user?.displayName || state.user?.email?.split('@')[0] || 'Mwanafunzi'),
            text,
            createdAt: Date.now(),
            isInstructor: state.isAdm
          };
          return { ...d, replies: [...d.replies, newReply] };
        }
        return d;
      })
    }));
  };

  const toggleEpisodeComplete = (itemId: string, epIdx: number) => {
    const key = `${itemId}_${epIdx}`;
    setState(p => {
      const nextVal = !p.completedEpisodes[key];
      const newPts = nextVal ? p.pts + 25 : p.pts;
      return {
        ...p,
        completedEpisodes: {
          ...p.completedEpisodes,
          [key]: nextVal
        },
        pts: newPts
      };
    });
  };

  const markNotificationRead = (id: string) => {
    setState(p => ({
      ...p,
      notifications: p.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const markAllNotificationsRead = () => {
    setState(p => ({
      ...p,
      notifications: p.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const deleteNotification = (id: string) => {
    setState(p => ({
      ...p,
      notifications: p.notifications.filter(n => n.id !== id)
    }));
  };

  const deleteAllNotifications = () => {
    setState(p => ({
      ...p,
      notifications: []
    }));
  };

  const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
      read: false
    };
    setState(p => ({
      ...p,
      notifications: [newNotif, ...p.notifications]
    }));
  };

  const broadcastNotification = async (notification: Omit<AppNotification, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newNotif: AppNotification = {
        ...notification,
        id: 'broadcast-' + Date.now(),
        createdAt: Date.now(),
        read: false
      };

      setState(p => ({
        ...p,
        notifications: [newNotif, ...p.notifications]
      }));

      try {
        await setDoc(doc(db, 'broadcasts', newNotif.id), newNotif);
      } catch (err) {
        console.warn('Firestore broadcast notice:', err);
      }

      return true;
    } catch (err) {
      console.error('Error broadcasting notification:', err);
      return false;
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
    const orderId = 'ord-' + Date.now();
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: Date.now()
    };

    setState(p => {
      // If payment is auto-confirmed or user is buying free items, grant instant library access
      const updatedLib = { ...p.lib };
      if (newOrder.status === 'confirmed') {
        orderData.itemIds.forEach(id => {
          updatedLib[id] = true;
        });
      }

      return {
        ...p,
        orders: [newOrder, ...p.orders],
        lib: updatedLib,
        notifications: [
          {
            id: 'notif-' + Date.now(),
            title: newOrder.status === 'confirmed' ? 'Malipo Yamekamilika! 🎉' : 'Agizo Limepokelewa ⏳',
            message: newOrder.status === 'confirmed' 
              ? `Umekamilisha ununuzi wa shilingi ${newOrder.amount.toLocaleString()} TZS. Masomo yako yapo tayari kwenye Maktaba.`
              : `Agizo lako (Ref: ${newOrder.ref}) limepokelewa na linakaguliwa. Utapata ufikiaji punde.`,
            type: newOrder.status === 'confirmed' ? 'success' : 'info',
            createdAt: Date.now(),
            read: false
          },
          ...p.notifications
        ]
      };
    });

    return orderId;
  };

  const approveOrder = (orderId: string) => {
    setState(p => {
      const order = p.orders.find(o => o.id === orderId);
      const newOrders = p.orders.map(o => o.id === orderId ? { ...o, status: 'confirmed' as const } : o);
      
      const newLib = { ...p.lib };
      if (order && (order.userId === p.user?.uid || !p.user)) {
        order.itemIds.forEach(id => {
          newLib[id] = true;
        });
      }

      // Also update matching users list
      const newUsers = p.users.map(u => {
        if (order && (u.uid === order.userId || u.email === order.userEmail)) {
          const userLib = { ...u.library };
          order.itemIds.forEach(id => { userLib[id] = true; });
          return { ...u, library: userLib };
        }
        return u;
      });

      return {
        ...p,
        orders: newOrders,
        users: newUsers,
        lib: newLib,
        notifications: [
          {
            id: 'notif-appr-' + Date.now(),
            title: 'Agizo Limethibitishwa ✅',
            message: `Agizo #${orderId} limethibitishwa na msimamizi. Ufikiaji umewashwa.`,
            type: 'success',
            createdAt: Date.now(),
            read: false
          },
          ...p.notifications
        ]
      };
    });
  };

  const rejectOrder = (orderId: string) => {
    setState(p => ({
      ...p,
      orders: p.orders.map(o => o.id === orderId ? { ...o, status: 'rejected' as const } : o)
    }));
  };

  const giveUserAccess = (userEmailOrUid: string, itemId: string) => {
    setState(p => {
      const newUsers = p.users.map(u => {
        if (u.uid === userEmailOrUid || u.email === userEmailOrUid) {
          return { ...u, library: { ...u.library, [itemId]: true } };
        }
        return u;
      });
      const newLib = { ...p.lib, [itemId]: true };
      return { ...p, users: newUsers, lib: newLib };
    });
  };

  const revokeUserAccess = (userEmailOrUid: string, itemId: string) => {
    setState(p => {
      const newUsers = p.users.map(u => {
        if (u.uid === userEmailOrUid || u.email === userEmailOrUid) {
          const userLib = { ...u.library };
          delete userLib[itemId];
          return { ...u, library: userLib };
        }
        return u;
      });
      const newLib = { ...p.lib };
      delete newLib[itemId];
      return { ...p, users: newUsers, lib: newLib };
    });
  };

  const addPoints = (amount: number) => {
    setState(p => ({ ...p, pts: p.pts + amount }));
  };

  const updateUserProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!state.user) return false;
    try {
      const updatedProfile: UserProfile = {
        uid: state.user.uid,
        name: data.name !== undefined ? data.name : (state.profile?.name || state.user.displayName || state.user.email?.split('@')[0] || 'User'),
        email: state.profile?.email || state.user.email || '',
        phone: data.phone !== undefined ? data.phone : (state.profile?.phone || ''),
        photoURL: data.photoURL !== undefined ? data.photoURL : (state.profile?.photoURL || state.user.photoURL || ''),
        avatarUrl: data.photoURL !== undefined ? data.photoURL : (state.profile?.avatarUrl || state.user.photoURL || ''),
        accountType: data.accountType || state.profile?.accountType || 'student',
        points: state.profile?.points ?? state.pts,
        streak: state.profile?.streak ?? state.strk,
        lastLogin: state.profile?.lastLogin ?? Date.now(),
        library: state.profile?.library ?? state.lib,
        progress: state.profile?.progress ?? {},
        status: state.profile?.status ?? 'Active',
        role: state.profile?.role ?? (state.isAdm ? 'admin' : 'user')
      };

      // 1. Update Firebase Auth Profile (displayName and photoURL)
      try {
        await updateProfile(state.user, {
          displayName: updatedProfile.name,
          photoURL: updatedProfile.photoURL
        });
      } catch (e) {
        console.warn('Firebase Auth updateProfile notice:', e);
      }

      // 2. Update Firestore document
      try {
        await setDoc(doc(db, 'users', state.user.uid), updatedProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc notice:', e);
      }

      // 3. Update local state and stored users list
      setState(prev => {
        const updatedUsers = prev.users.some(u => u.uid === state.user?.uid)
          ? prev.users.map(u => u.uid === state.user?.uid ? { ...u, ...updatedProfile } : u)
          : [...prev.users, updatedProfile];
        localStorage.setItem('czp_profile', JSON.stringify(updatedProfile));
        localStorage.setItem('czp_users', JSON.stringify(updatedUsers));
        return {
          ...prev,
          profile: updatedProfile,
          users: updatedUsers
        };
      });

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  const updateUserByAdmin = async (uid: string, data: Partial<UserProfile>): Promise<boolean> => {
    try {
      setState(prev => {
        const updatedUsers = prev.users.map(u => u.uid === uid ? { ...u, ...data } : u);
        localStorage.setItem('czp_users', JSON.stringify(updatedUsers));
        
        let newProfile = prev.profile;
        if (prev.profile?.uid === uid) {
          newProfile = { ...prev.profile, ...data };
          localStorage.setItem('czp_profile', JSON.stringify(newProfile));
        }

        return {
          ...prev,
          users: updatedUsers,
          profile: newProfile
        };
      });

      try {
        await setDoc(doc(db, 'users', uid), data, { merge: true });
      } catch (e) {
        console.warn('Firestore admin update notice:', e);
      }
      return true;
    } catch (err) {
      console.error('Error admin updating user:', err);
      return false;
    }
  };

  const deleteUserByAdmin = async (uid: string): Promise<boolean> => {
    try {
      setState(prev => {
        const updatedUsers = prev.users.filter(u => u.uid !== uid);
        localStorage.setItem('czp_users', JSON.stringify(updatedUsers));
        return {
          ...prev,
          users: updatedUsers
        };
      });

      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.warn('Firestore admin delete notice:', e);
      }
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  };

  const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      setState(prev => {
        const updated = { ...prev.siteSettings, ...settings };
        localStorage.setItem('czp_site_settings', JSON.stringify(updated));
        return { ...prev, siteSettings: updated };
      });

      try {
        await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
      } catch (e) {
        console.warn('Firestore site settings notice:', e);
      }
      return true;
    } catch (err) {
      console.error('Error updating site settings:', err);
      return false;
    }
  };

  const updateUssdSettings = async (settings: Partial<UssdSettings>): Promise<boolean> => {
    try {
      setState(prev => {
        const updated = { ...prev.ussdSettings, ...settings };
        localStorage.setItem('czp_ussd_settings', JSON.stringify(updated));
        return { ...prev, ussdSettings: updated };
      });

      try {
        await setDoc(doc(db, 'settings', 'ussd'), settings, { merge: true });
      } catch (e) {
        console.warn('Firestore ussd settings notice:', e);
      }
      return true;
    } catch (err) {
      console.error('Error updating ussd settings:', err);
      return false;
    }
  };

  const updateCourses = (courses: ContentItem[]) => setState(p => ({ ...p, courses }));
  const updateTests = (tests: ContentItem[]) => setState(p => ({ ...p, tests }));
  const updateLectures = (lectures: ContentItem[]) => setState(p => ({ ...p, lectures }));
  const updateApps = (apps: CodApp[]) => setState(p => ({ ...p, apps }));
  const updateBanners = (banners: Banner[]) => setState(p => ({ ...p, banners }));

  // --- 1. DEVELOPER MANAGEMENT & PACKAGES ---
  const applyForDeveloper = async (data: { 
    packageId: string; 
    packageName: string; 
    packagePrice: number; 
    userPhone: string; 
    devBio?: string; 
    portfolioUrl?: string; 
    paymentRef?: string 
  }): Promise<boolean> => {
    try {
      const newAppId = 'dev-app-' + Date.now();
      const currentUid = state.user?.uid || 'guest-' + Date.now();
      const currentName = state.profile?.name || state.user?.displayName || state.user?.email?.split('@')[0] || 'Developer';
      const currentEmail = state.profile?.email || state.user?.email || 'dev@codznz.com';

      const newApplication: DeveloperApplication = {
        id: newAppId,
        userId: currentUid,
        userName: currentName,
        userEmail: currentEmail,
        userPhone: data.userPhone,
        packageId: data.packageId,
        packageName: data.packageName,
        packagePrice: data.packagePrice,
        paymentRef: data.paymentRef,
        status: 'pending',
        portfolioUrl: data.portfolioUrl,
        devBio: data.devBio,
        appliedAt: Date.now()
      };

      setState(prev => {
        const updatedApps = [newApplication, ...prev.developerApplications];
        localStorage.setItem('czp_dev_apps', JSON.stringify(updatedApps));
        
        let newProfile = prev.profile;
        if (newProfile) {
          newProfile = {
            ...newProfile,
            developerStatus: 'pending',
            developerPackageId: data.packageId,
            phone: data.userPhone || newProfile.phone
          };
          localStorage.setItem('czp_profile', JSON.stringify(newProfile));
        }

        return {
          ...prev,
          developerApplications: updatedApps,
          profile: newProfile,
          notifications: [
            {
              id: 'notif-dev-' + Date.now(),
              title: 'Ombi la Developer Limetumwa! 💻',
              message: `Ombi lako la kifurushi cha "${data.packageName}" limepokelewa na linakaguliwa na msimamizi.`,
              type: 'info',
              createdAt: Date.now(),
              read: false
            },
            ...prev.notifications
          ]
        };
      });

      return true;
    } catch (err) {
      console.error('Error applying for developer:', err);
      return false;
    }
  };

  const approveDeveloperApplication = async (appId: string): Promise<boolean> => {
    try {
      setState(prev => {
        const targetApp = prev.developerApplications.find(a => a.id === appId);
        if (!targetApp) return prev;

        const updatedDevApps = prev.developerApplications.map(a => 
          a.id === appId ? { ...a, status: 'approved' as const, reviewedAt: Date.now() } : a
        );
        localStorage.setItem('czp_dev_apps', JSON.stringify(updatedDevApps));

        // Update target user's role and developer status
        const updatedUsers = prev.users.map(u => {
          if (u.uid === targetApp.userId || u.email === targetApp.userEmail) {
            return {
              ...u,
              role: 'developer' as const,
              developerStatus: 'approved' as const,
              developerPackageId: targetApp.packageId,
              developerExpiresAt: Date.now() + 86400000 * 365
            };
          }
          return u;
        });
        localStorage.setItem('czp_users', JSON.stringify(updatedUsers));

        let newProfile = prev.profile;
        if (newProfile && (newProfile.uid === targetApp.userId || newProfile.email === targetApp.userEmail)) {
          newProfile = {
            ...newProfile,
            role: 'developer',
            developerStatus: 'approved',
            developerPackageId: targetApp.packageId,
            developerExpiresAt: Date.now() + 86400000 * 365
          };
          localStorage.setItem('czp_profile', JSON.stringify(newProfile));
        }

        return {
          ...prev,
          developerApplications: updatedDevApps,
          users: updatedUsers,
          profile: newProfile,
          notifications: [
            {
              id: 'notif-appr-dev-' + Date.now(),
              title: 'Ombi la Developer Limekubaliwa! 🎉',
              message: `Hongera ${targetApp.userName}! Umewezeshwa kuwa Developer Rasmi kwenye CodZnz Studio.`,
              type: 'success',
              actionText: 'Fungua Developer Studio',
              actionUrl: '#dev',
              createdAt: Date.now(),
              read: false
            },
            ...prev.notifications
          ]
        };
      });
      return true;
    } catch (err) {
      console.error('Error approving dev application:', err);
      return false;
    }
  };

  const rejectDeveloperApplication = async (appId: string, reason?: string): Promise<boolean> => {
    try {
      setState(prev => {
        const targetApp = prev.developerApplications.find(a => a.id === appId);
        const updatedDevApps = prev.developerApplications.map(a => 
          a.id === appId ? { ...a, status: 'rejected' as const, rejectionReason: reason || 'Ombi halijakidhi vigezo kwa sasa.', reviewedAt: Date.now() } : a
        );
        localStorage.setItem('czp_dev_apps', JSON.stringify(updatedDevApps));

        let newProfile = prev.profile;
        if (newProfile && targetApp && (newProfile.uid === targetApp.userId || newProfile.email === targetApp.userEmail)) {
          newProfile = {
            ...newProfile,
            developerStatus: 'rejected'
          };
          localStorage.setItem('czp_profile', JSON.stringify(newProfile));
        }

        return {
          ...prev,
          developerApplications: updatedDevApps,
          profile: newProfile,
          notifications: [
            {
              id: 'notif-rej-dev-' + Date.now(),
              title: 'Taarifa Kuhusu Ombi la Developer',
              message: `Ombi lako la developer halikuidhinishwa: ${reason || 'Wasiliana na msimamizi kwa maelezo zaidi.'}`,
              type: 'alert',
              createdAt: Date.now(),
              read: false
            },
            ...prev.notifications
          ]
        };
      });
      return true;
    } catch (err) {
      console.error('Error rejecting dev app:', err);
      return false;
    }
  };

  const addDeveloperPackage = (pkg: Omit<DeveloperPackage, 'id'>) => {
    const newPkg: DeveloperPackage = {
      ...pkg,
      id: 'pkg-' + Date.now()
    };
    setState(p => {
      const updated = [...p.developerPackages, newPkg];
      localStorage.setItem('czp_dev_pkgs', JSON.stringify(updated));
      return { ...p, developerPackages: updated };
    });
  };

  const updateDeveloperPackage = (id: string, pkg: Partial<DeveloperPackage>) => {
    setState(p => {
      const updated = p.developerPackages.map(x => x.id === id ? { ...x, ...pkg } : x);
      localStorage.setItem('czp_dev_pkgs', JSON.stringify(updated));
      return { ...p, developerPackages: updated };
    });
  };

  const deleteDeveloperPackage = (id: string) => {
    setState(p => {
      const updated = p.developerPackages.filter(x => x.id !== id);
      localStorage.setItem('czp_dev_pkgs', JSON.stringify(updated));
      return { ...p, developerPackages: updated };
    });
  };

  // --- 2. BUNDLES & LEARNING PATHS ---
  const buyBundle = async (bundleId: string, paymentMethod: string = 'mpesa', phone: string = ''): Promise<string> => {
    const targetBundle = state.bundles.find(b => b.id === bundleId);
    if (!targetBundle) throw new Error('Bundle not found');

    const orderId = 'ord-bnd-' + Date.now();
    const orderData: Order = {
      id: orderId,
      userId: state.user?.uid || 'guest-' + Date.now(),
      userName: state.profile?.name || state.user?.displayName || 'Mwanafunzi',
      userEmail: state.profile?.email || state.user?.email || 'mwanafunzi@codznz.com',
      itemIds: targetBundle.courseIds,
      ref: `BND${Math.floor(100000 + Math.random() * 900000)}TZ`,
      amount: targetBundle.price,
      status: 'confirmed',
      paymentMethod: paymentMethod as any,
      phoneNumber: phone || state.profile?.phone || '0754000000',
      createdAt: Date.now()
    };

    setState(prev => {
      const newOrders = [orderData, ...prev.orders];
      const newLib = { ...prev.lib };
      targetBundle.courseIds.forEach(id => { newLib[id] = true; });
      localStorage.setItem('czp_orders', JSON.stringify(newOrders));
      localStorage.setItem('czp_local_lib', JSON.stringify(newLib));

      return {
        ...prev,
        orders: newOrders,
        lib: newLib,
        pts: prev.pts + 300,
        notifications: [
          {
            id: 'notif-bnd-' + Date.now(),
            title: `Hongera! Umenunua "${targetBundle.title}" 🎉`,
            message: `Masomo yote ${targetBundle.courseIds.length} ya mkusanyiko huu yamefunguliwa kwenye Library yako papo hapo.`,
            type: 'success',
            createdAt: Date.now(),
            read: false
          },
          ...prev.notifications
        ]
      };
    });

    return orderId;
  };

  const updateBundles = (bundles: LearningBundle[]) => {
    setState(p => {
      localStorage.setItem('czp_bundles', JSON.stringify(bundles));
      return { ...p, bundles };
    });
  };

  // --- 3. COUPONS & PROMOS ---
  const addCoupon = (coupon: Omit<Coupon, 'id' | 'createdAt' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: 'cpn-' + Date.now(),
      usedCount: 0,
      createdAt: Date.now()
    };
    setState(p => {
      const updated = [newCoupon, ...p.coupons];
      localStorage.setItem('czp_coupons', JSON.stringify(updated));
      return { ...p, coupons: updated };
    });
  };

  const updateCoupon = (id: string, data: Partial<Coupon>) => {
    setState(p => {
      const updated = p.coupons.map(c => c.id === id ? { ...c, ...data } : c);
      localStorage.setItem('czp_coupons', JSON.stringify(updated));
      return { ...p, coupons: updated };
    });
  };

  const deleteCoupon = (id: string) => {
    setState(p => {
      const updated = p.coupons.filter(c => c.id !== id);
      localStorage.setItem('czp_coupons', JSON.stringify(updated));
      return { ...p, coupons: updated };
    });
  };

  const applyCouponCode = (
    code: string, 
    currentTotal: number, 
    itemIds: string[]
  ): { success: boolean; discountAmount: number; finalTotal: number; message: string; coupon?: Coupon } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = state.coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);

    if (!coupon) {
      return {
        success: false,
        discountAmount: 0,
        finalTotal: currentTotal,
        message: state.lang === 'en' ? 'Invalid or inactive coupon code.' : 'Msimbo wa kuponi si sahihi au umezimwa.'
      };
    }

    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
      return {
        success: false,
        discountAmount: 0,
        finalTotal: currentTotal,
        message: state.lang === 'en' ? 'This coupon has expired.' : 'Kuponi hii imekwisha muda wake.'
      };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return {
        success: false,
        discountAmount: 0,
        finalTotal: currentTotal,
        message: state.lang === 'en' ? 'Coupon usage limit reached.' : 'Kuponi hii imemaliza idadi ya matumizi.'
      };
    }

    // Check target restriction if any
    if (coupon.targetType === 'single_course' && coupon.targetId && !itemIds.includes(coupon.targetId)) {
      return {
        success: false,
        discountAmount: 0,
        finalTotal: currentTotal,
        message: state.lang === 'en' ? 'Coupon is only valid for a specific course.' : 'Kuponi hii inatumika kwenye somo maalum tu.'
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((currentTotal * coupon.discountValue) / 100);
    } else {
      discount = Math.min(currentTotal, coupon.discountValue);
    }

    const finalTotal = Math.max(0, currentTotal - discount);

    setState(prev => ({
      ...prev,
      appliedCoupon: coupon
    }));

    return {
      success: true,
      discountAmount: discount,
      finalTotal,
      message: state.lang === 'en' 
        ? `Coupon applied! You saved TSh ${discount.toLocaleString()}` 
        : `Kuponi imekubaliwa! Umeokoa TSh ${discount.toLocaleString()}`,
      coupon
    };
  };

  const clearAppliedCoupon = () => {
    setState(p => ({ ...p, appliedCoupon: null }));
  };

  // --- 4. REFERRALS & BADGES ---
  const claimReferral = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Weka msimbo sahihi wa mwaliko.' };
    }

    // Check if user already claimed
    if (state.profile?.referredBy) {
      return { success: false, message: 'Umeshawahi kutumia msimbo wa mwaliko hapo awali.' };
    }

    // User gets 100 XP, and referrer gets 150 XP
    setState(prev => {
      const bonusUserPts = 100;
      const newPts = prev.pts + bonusUserPts;
      localStorage.setItem('czp_pts', newPts.toString());

      let newProfile = prev.profile;
      if (newProfile) {
        newProfile = {
          ...newProfile,
          referredBy: cleanCode,
          points: (newProfile.points || 0) + bonusUserPts
        };
        localStorage.setItem('czp_profile', JSON.stringify(newProfile));
      }

      return {
        ...prev,
        pts: newPts,
        profile: newProfile,
        notifications: [
          {
            id: 'notif-ref-' + Date.now(),
            title: 'Pointi za Mwaliko Zimeongezwa! 🎁',
            message: `Hongera! Umepata pointi +${bonusUserPts} XP kwa kutumia msimbo wa mwaliko ${cleanCode}.`,
            type: 'success',
            createdAt: Date.now(),
            read: false
          },
          ...prev.notifications
        ]
      };
    });

    return {
      success: true,
      message: 'Hongera! Umepata +100 XP pointi za bure za mwaliko.'
    };
  };

  const unlockBadge = (badgeId: string) => {
    if (state.unlockedBadges.includes(badgeId)) return;
    const badge = state.badges.find(b => b.id === badgeId);

    setState(prev => {
      const updatedUnlocked = [...prev.unlockedBadges, badgeId];
      localStorage.setItem('czp_unlocked_badges', JSON.stringify(updatedUnlocked));
      const bonusXp = badge?.xpBonus || 100;
      const newPts = prev.pts + bonusXp;
      localStorage.setItem('czp_pts', newPts.toString());

      return {
        ...prev,
        unlockedBadges: updatedUnlocked,
        pts: newPts,
        notifications: [
          {
            id: 'notif-bdg-' + Date.now(),
            title: `Beji Mpya Imefunguliwa! 🏆 ${badge?.title || 'Bingwa'}`,
            message: `Hongera! Umepata beji mpya na pointi +${bonusXp} XP za zawadi.`,
            type: 'success',
            createdAt: Date.now(),
            read: false
          },
          ...prev.notifications
        ]
      };
    });
  };

  // --- 5. DIRECT USSD PUSH ---
  const triggerDirectUssdPush = async (phone: string, amount: number, providerName: string): Promise<{ success: boolean; ref: string }> => {
    // Generates simulated live USSD push prompt
    const generatedRef = `${providerName.slice(0, 3).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}TZ`;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          ref: generatedRef
        });
      }, 1500);
    });
  };

  // --- 6. CODE PLAYGROUND METHODS ---
  const savePlaygroundSnippet = (snippet: PlaygroundSnippet) => {
    setState(prev => {
      const exists = prev.playgroundSnippets.some(s => s.id === snippet.id);
      const updated = exists 
        ? prev.playgroundSnippets.map(s => s.id === snippet.id ? { ...snippet, updatedAt: Date.now() } : s)
        : [{ ...snippet, createdAt: Date.now(), updatedAt: Date.now() }, ...prev.playgroundSnippets];
      return { ...prev, playgroundSnippets: updated };
    });
  };

  const deletePlaygroundSnippet = (id: string) => {
    setState(prev => ({
      ...prev,
      playgroundSnippets: prev.playgroundSnippets.filter(s => s.id !== id)
    }));
  };

  // --- 7. Q&A COMMUNITY FORUM METHODS ---
  const addQnAQuestion = async (q: { itemId?: string; itemTitle?: string; title: string; details: string; codeSnippet?: string }): Promise<boolean> => {
    const newQ: QnAQuestion = {
      id: 'qna-' + Date.now(),
      itemId: q.itemId,
      itemTitle: q.itemTitle,
      userId: state.user?.uid || 'guest',
      userName: state.profile?.name || state.user?.displayName || 'Mwanafunzi CodZnz',
      userAvatar: state.profile?.photoURL,
      title: q.title,
      details: q.details,
      codeSnippet: q.codeSnippet,
      createdAt: Date.now(),
      upvotes: 0,
      isResolved: false,
      replies: []
    };

    setState(prev => ({
      ...prev,
      qnaQuestions: [newQ, ...prev.qnaQuestions]
    }));

    try {
      await setDoc(doc(db, 'qna_questions', newQ.id), newQ);
    } catch (e) {
      console.log('Firebase QnA offline fallback:', e);
    }
    return true;
  };

  const addQnAReply = async (questionId: string, content: string, codeSnippet?: string): Promise<boolean> => {
    const isInstructor = state.isAdm || state.profile?.role === 'developer';
    const newReply = {
      id: 'rep-' + Date.now(),
      authorId: state.user?.uid || 'guest',
      authorName: state.profile?.name || state.user?.displayName || 'CodZnz Member',
      authorAvatar: state.profile?.photoURL,
      authorRole: (isInstructor ? 'instructor' : 'student') as 'instructor' | 'student',
      content,
      codeSnippet,
      createdAt: Date.now(),
      upvotes: 0,
      isAccepted: false
    };

    setState(prev => ({
      ...prev,
      qnaQuestions: prev.qnaQuestions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            replies: [...q.replies, newReply]
          };
        }
        return q;
      })
    }));

    try {
      const qDoc = doc(db, 'qna_questions', questionId);
      const targetQ = state.qnaQuestions.find(q => q.id === questionId);
      if (targetQ) {
        await setDoc(qDoc, {
          ...targetQ,
          replies: [...targetQ.replies, newReply]
        }, { merge: true });
      }
    } catch (e) {
      console.log('Firebase QnA reply sync fallback:', e);
    }
    return true;
  };

  const upvoteQnA = (questionId: string) => {
    setState(prev => ({
      ...prev,
      qnaQuestions: prev.qnaQuestions.map(q => {
        if (q.id === questionId) {
          return { ...q, upvotes: q.upvotes + 1 };
        }
        return q;
      })
    }));
  };

  // --- 8. DEVELOPER PAYOUT REQUESTS ---
  const requestPayout = async (data: { amount: number; provider: 'M-Pesa' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa'; accountName: string; phoneNumber: string; notes?: string }): Promise<boolean> => {
    const newReq: PayoutRequest = {
      id: 'payout-' + Date.now(),
      developerId: state.user?.uid || 'dev-' + Date.now(),
      developerName: state.profile?.name || state.user?.displayName || 'Developer',
      developerEmail: state.profile?.email || state.user?.email || 'dev@example.com',
      amount: data.amount,
      provider: data.provider,
      accountName: data.accountName,
      phoneNumber: data.phoneNumber,
      notes: data.notes,
      status: 'pending',
      createdAt: Date.now()
    };

    setState(prev => ({
      ...prev,
      payoutRequests: [newReq, ...prev.payoutRequests],
      notifications: [
        {
          id: 'notif-payout-' + Date.now(),
          title: 'Ombi la Kutoa Pesa Limetumwa! 💰',
          message: `Ombi lako la kutoa TZS ${data.amount.toLocaleString()} kupitia ${data.provider} limepokelewa na linakaguliwa.`,
          type: 'info',
          createdAt: Date.now(),
          read: false
        },
        ...prev.notifications
      ]
    }));

    try {
      await setDoc(doc(db, 'payout_requests', newReq.id), newReq);
    } catch (e) {
      console.log('Firebase payout request offline fallback:', e);
    }
    return true;
  };

  const updatePayoutStatus = async (id: string, status: 'approved' | 'rejected' | 'paid', adminNote?: string, transactionRef?: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      payoutRequests: prev.payoutRequests.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status,
            adminNote: adminNote || p.adminNote,
            transactionRef: transactionRef || p.transactionRef,
            processedAt: Date.now()
          };
        }
        return p;
      })
    }));

    try {
      await setDoc(doc(db, 'payout_requests', id), {
        status,
        adminNote: adminNote || null,
        transactionRef: transactionRef || null,
        processedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.log('Firebase payout update offline fallback:', e);
    }
    return true;
  };

  // --- 9. STUDY NOTES METHODS ---
  const saveStudyNote = (note: { id?: string; courseId?: string; courseTitle?: string; title: string; content: string; tags?: string[] }) => {
    setState(prev => {
      const existingIdx = prev.studyNotes.findIndex(n => n.id === note.id);
      if (existingIdx >= 0) {
        const updated = [...prev.studyNotes];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...note,
          updatedAt: Date.now()
        };
        return { ...prev, studyNotes: updated };
      } else {
        const newNote: StudyNote = {
          id: 'note-' + Date.now(),
          userId: state.user?.uid || 'guest',
          courseId: note.courseId,
          courseTitle: note.courseTitle,
          title: note.title,
          content: note.content,
          tags: note.tags || ['Coding'],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        return { ...prev, studyNotes: [newNote, ...prev.studyNotes] };
      }
    });
  };

  const deleteStudyNote = (id: string) => {
    setState(prev => ({
      ...prev,
      studyNotes: prev.studyNotes.filter(n => n.id !== id)
    }));
  };

  // --- 10. SERVER-SIDE AI INTEGRATIONS ---
  const explainCodeErrorWithAI = async (code: string, errorMessage?: string, language?: string): Promise<AIErrExplanation> => {
    try {
      const res = await fetch('/api/gemini/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, errorMessage, language: language || 'javascript' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI service error');
      return data;
    } catch (err: any) {
      return {
        summary: 'Hitilafu imetokea wakati wa kuchambua error.',
        rootCause: err.message || 'Mtandao au seva haipatikani kwa sasa.',
        fixedCode: code,
        keyTakeaway: 'Kagua sintaksia ya kodi yako au jaribu tena baada ya muda mfupi.'
      };
    }
  };

  const generateCourseWithAI = async (topic: string, level?: string, category?: string): Promise<any> => {
    try {
      const res = await fetch('/api/gemini/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level: level || 'Beginner', category: category || 'courses' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation error');
      return data;
    } catch (err: any) {
      throw new Error(err.message || 'Imeshindwa kuunda kozi kupitia AI');
    }
  };

  const summarizeLessonWithAI = async (title: string, content: string, level?: string): Promise<AILessonSummary> => {
    try {
      const res = await fetch('/api/gemini/summarize-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, level: level || 'All levels' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI summary error');
      return data;
    } catch (err: any) {
      return {
        title,
        keyPoints: ['Jifunze misingi ya somo hili kwa makini.', 'Fanya mazoezi kwa vitendo kwenye Code Playground.', 'Uliza maswali kwenye jukwaa la Q&A ukikwama.'],
        quickSummary: `Muhtasari wa ${title}: Somo hili linaangazia uelewa na mifano halisi ya kuandika mifumo.`
      };
    }
  };

  const askAITutor = async (question: string, lessonContext?: string, studentCode?: string): Promise<string> => {
    try {
      const res = await fetch('/api/gemini/tutor-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lessonContext, studentCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Tutor error');
      return data.answer || 'Samahani, sijapata jibu kwa sasa.';
    } catch (err: any) {
      return 'Kuna hitilafu ya mtandao kufikia AI Tutor. Tafadhali jaribu tena baada ya sekunde chache.';
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        ...state, 
        lib: state.lib, 
        pts: state.pts, 
        strk: state.strk, 
        setLang, 
        setTheme, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        logout,
        addReview,
        addDiscussionQuestion,
        addDiscussionReply,
        toggleEpisodeComplete,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        deleteAllNotifications,
        addNotification,
        broadcastNotification,
        createOrder,
        approveOrder,
        rejectOrder,
        giveUserAccess,
        revokeUserAccess,
        addPoints,
        updateUserProfile,
        updateUserByAdmin,
        deleteUserByAdmin,
        updateCourses,
        updateTests,
        updateLectures,
        updateApps,
        updateBanners,
        updateSiteSettings,
        updateUssdSettings,
        applyForDeveloper,
        approveDeveloperApplication,
        rejectDeveloperApplication,
        addDeveloperPackage,
        updateDeveloperPackage,
        deleteDeveloperPackage,
        buyBundle,
        updateBundles,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        applyCouponCode,
        clearAppliedCoupon,
        claimReferral,
        unlockBadge,
        triggerDirectUssdPush,
        // --- NEW IMPLEMENTATIONS ---
        savePlaygroundSnippet,
        deletePlaygroundSnippet,
        addQnAQuestion,
        addQnAReply,
        upvoteQnA,
        requestPayout,
        updatePayoutStatus,
        saveStudyNote,
        deleteStudyNote,
        explainCodeErrorWithAI,
        generateCourseWithAI,
        summarizeLessonWithAI,
        askAITutor
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
