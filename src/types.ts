export type Category = 'courses' | 'tests' | 'lectures';
export type UserRole = 'guest' | 'user' | 'developer' | 'admin';
export type OrderStatus = 'pending' | 'confirmed' | 'rejected';
export type PaymentMethod = 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa' | 'card';

export interface SiteSettings {
  siteName: string;
  siteTagline?: string;
  logoUrl?: string;
  logoEmoji?: string;
  primaryColor: string;
  accentColor: string;
  accent2Color?: string;
}

export interface UssdSettings {
  enabled: boolean;
  apkDownloadUrl?: string;
  apkVersion?: string;
  apkName?: string;
  ussdPrefix?: string;
  autoPushEnabled?: boolean;
  webhookUrl?: string;
  gatewayProvider?: string;
}

export interface AppScreenshot {
  type: 'base64' | 'url';
  data: string;
}

export interface CodApp {
  id: string;
  name: string;
  desc: string;
  fullDesc: string;
  changelog: string;
  developer: string;
  size: string;
  rating: string;
  videoUrl?: string;
  screenshots: AppScreenshot[];
  icon: string;
  iconB64?: string;
  url: string;
  priceType: 'free' | 'paid';
  price: number;
  createdAt: number;
  updatedAt?: number;
}

export interface Question {
  q: string;
  a: string;
  b: string;
  c: string;
  d: string;
  correct: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
}

export interface Episode {
  title: string;
  url: string;
  duration: string;
  description?: string;
}

export interface ContentItem {
  id: string;
  title: string;
  desc: string;
  category: Category;
  price: number;
  isFree: boolean;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  pdfPath?: string;
  coverB64?: string;
  icon: string;
  createdAt: number;
  updatedAt?: number;
  questions?: Question[]; // For tests
  timeLimit?: number; // For tests
  episodes?: Episode[]; // For lectures
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  itemIds: string[];
  ref: string;
  amount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  phoneNumber?: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  avatarUrl?: string;
  accountType?: 'student' | 'creator' | 'developer' | 'admin';
  points: number;
  streak: number;
  lastLogin: number;
  library: Record<string, boolean>;
  progress: Record<string, number>;
  completedEpisodes?: Record<string, boolean>;
  status: 'Active' | 'Blocked';
  role?: UserRole;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imgUrl?: string;
  imgB64?: string;
  linkUrl: string;
  active: boolean;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  ts: number;
  name: string;
  email: string;
  uid: string;
}

export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface DiscussionReply {
  id: string;
  author: string;
  text: string;
  createdAt: number;
  isInstructor?: boolean;
}

export interface Discussion {
  id: string;
  itemId?: string;
  userId: string;
  userName: string;
  question: string;
  replies: DiscussionReply[];
  createdAt: number;
}

export interface AppNotification {
  id: string;
  title?: string;
  message?: string;
  imageUrl?: string;
  type: 'info' | 'success' | 'alert' | 'offer' | 'update' | 'image';
  offerCode?: string;
  offerDiscount?: string;
  actionUrl?: string;
  actionText?: string;
  targetRole?: 'all' | 'user' | 'developer' | 'admin';
  createdAt: number;
  read?: boolean;
}
