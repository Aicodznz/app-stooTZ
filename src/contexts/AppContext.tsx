import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL } from '../services/firebase';
import { UserProfile, ContentItem, CodApp, Banner, Order, Review, Discussion, AppNotification } from '../types';
import { 
  SEED_COURSES, 
  SEED_TESTS, 
  SEED_LECTURES, 
  SEED_BANNERS, 
  SEED_APPS, 
  SEED_REVIEWS, 
  SEED_NOTIFICATIONS, 
  SEED_DISCUSSIONS,
  SEED_ORDERS
} from '../constants';

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
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  giveUserAccess: (userEmailOrUid: string, itemId: string) => void;
  revokeUserAccess: (userEmailOrUid: string, itemId: string) => void;
  addPoints: (amount: number) => void;
  updateCourses: (courses: ContentItem[]) => void;
  updateTests: (tests: ContentItem[]) => void;
  updateLectures: (lectures: ContentItem[]) => void;
  updateApps: (apps: CodApp[]) => void;
  updateBanners: (banners: Banner[]) => void;
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
  });

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

  const updateCourses = (courses: ContentItem[]) => setState(p => ({ ...p, courses }));
  const updateTests = (tests: ContentItem[]) => setState(p => ({ ...p, tests }));
  const updateLectures = (lectures: ContentItem[]) => setState(p => ({ ...p, lectures }));
  const updateApps = (apps: CodApp[]) => setState(p => ({ ...p, apps }));
  const updateBanners = (banners: Banner[]) => setState(p => ({ ...p, banners }));

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
        createOrder,
        approveOrder,
        rejectOrder,
        giveUserAccess,
        revokeUserAccess,
        addPoints,
        updateCourses,
        updateTests,
        updateLectures,
        updateApps,
        updateBanners
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
