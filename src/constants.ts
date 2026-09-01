import { 
  ContentItem, 
  Banner, 
  CodApp, 
  UserProfile, 
  Review, 
  Discussion, 
  AppNotification, 
  Order,
  DeveloperPackage,
  DeveloperApplication,
  LearningBundle,
  Coupon,
  AchievementBadge
} from './types';

export const SEED_COURSES: ContentItem[] = [
  {
    id: 'c1',
    title: 'JavaScript Fundamentals',
    desc: 'Master the basics of JS, ES6+, DOM manipulation and async coding.',
    category: 'courses',
    price: 15000,
    isFree: false,
    level: 'Beginner',
    duration: '10h',
    icon: '📜',
    pdfPath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'c2',
    title: 'Python for Data Science',
    desc: 'Analyze and visualize data with Python, Pandas, and NumPy.',
    category: 'courses',
    price: 25000,
    isFree: false,
    level: 'Intermediate',
    duration: '15h',
    icon: '🐍',
    pdfPath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'c3',
    title: 'HTML & CSS Basics',
    desc: 'The complete structural foundation for modern responsive websites.',
    category: 'courses',
    price: 0,
    isFree: true,
    level: 'Beginner',
    duration: '3h',
    icon: '🌐',
    pdfPath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'c4',
    title: 'Fullstack React & Node.js',
    desc: 'Build real-world production web applications from scratch.',
    category: 'courses',
    price: 35000,
    isFree: false,
    level: 'Advanced',
    duration: '22h',
    icon: '⚛️',
    pdfPath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: Date.now() - 86400000 * 2
  }
];

export const SEED_TESTS: ContentItem[] = [
  {
    id: 't1',
    title: 'HTML & CSS Certification Exam',
    desc: 'Test your frontend knowledge and earn your verified certificate.',
    category: 'tests',
    price: 5000,
    isFree: false,
    timeLimit: 10,
    icon: '📝',
    createdAt: Date.now() - 86400000 * 5,
    questions: [
      { 
        q: 'What does HTML stand for?', 
        a: 'Hyper Text Markup Language', 
        b: 'High Tech Modern Language', 
        c: 'Hyper Tool Multi Language', 
        d: 'Hyperlink Text Management Language', 
        correct: 'a',
        explanation: 'HTML (Hyper Text Markup Language) ni lugha ya kawaida inayotumika kuunda na kupanga kurasa zote za wavuti mtandaoni.'
      },
      { 
        q: 'Which CSS property is used to change text color?', 
        a: 'background-color', 
        b: 'color', 
        c: 'font-style', 
        d: 'text-align', 
        correct: 'b',
        explanation: 'Kwenye CSS, sifa ya "color" ndio inayotumika kubadili rangi ya herufi au maneno (mfano: color: #4318FF;).'
      },
      { 
        q: 'What does CSS stand for?', 
        a: 'Creative Style Sheets', 
        b: 'Cascading Style Sheets', 
        c: 'Computer Style Sheets', 
        d: 'Colorful Style Sheets', 
        correct: 'b',
        explanation: 'CSS inasimama badala ya Cascading Style Sheets, inayotumika kupamba na kupanga muonekano wa kurasa za HTML.'
      },
      {
        q: 'Which HTML tag is used to create a hyperlink?',
        a: '<link>',
        b: '<a>',
        c: '<href>',
        d: '<nav>',
        correct: 'b',
        explanation: 'Tag ya <a> (Anchor Tag) ikiwa na sifa ya href ndiyo inayotumika kuunda linki inayoelekeza ukurasa mwingine.'
      }
    ]
  },
  {
    id: 't2',
    title: 'JavaScript Quick Mastery Quiz',
    desc: 'Basic JS operators, ES6 variables, functions and syntax test.',
    category: 'tests',
    price: 0,
    isFree: true,
    timeLimit: 8,
    icon: '⚡',
    createdAt: Date.now() - 86400000 * 3,
    questions: [
      { 
        q: 'Inside which HTML element do we put JavaScript code?', 
        a: '<js>', 
        b: '<script>', 
        c: '<javascript>', 
        d: '<scripting>', 
        correct: 'b',
        explanation: 'Msimbo wowote wa JavaScript ndani ya faili la HTML lazima uwekwe ndani ya tag za <script> na </script>.'
      },
      { 
        q: 'How do you create a function in JavaScript?', 
        a: 'function:myFunction()', 
        b: 'function myFunction()', 
        c: 'function = myFunction()', 
        d: 'def myFunction()', 
        correct: 'b',
        explanation: 'Kwenye JavaScript, utangulizi wa "function" ukifuatiwa na jina na mabano () ndio mtindo sahihi wa kutangaza kazi.'
      },
      {
        q: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
        a: 'var',
        b: 'let',
        c: 'const',
        d: 'static',
        correct: 'c',
        explanation: '"const" inatumika kutangaza viwango visivyobadilika (constants) ambavyo haviwezi kupewa thamani mpya baada ya kutangazwa.'
      }
    ]
  }
];

export const SEED_LECTURES: ContentItem[] = [
  {
    id: 'l1',
    title: 'Full Stack Web Development Masterclass',
    desc: 'Comprehensive step-by-step video lecture series covering frontend and backend.',
    category: 'lectures',
    price: 45000,
    isFree: false,
    icon: '💻',
    createdAt: Date.now() - 86400000 * 6,
    episodes: [
      { title: '1. Introduction to Web Architecture & Tools', url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', duration: '12:30', description: 'Jifunze jinsi seva, DNS, na browsers zinavyofanya kazi pamoja.' },
      { title: '2. Frontend Foundations (HTML5 & Tailwind CSS)', url: 'https://www.youtube.com/embed/zJSY8tJY_67', duration: '18:45', description: 'Kuunda muonekano maridadi na wa kisasa unaofaa simu na kompyuta.' },
      { title: '3. Backend API Development & Database Storage', url: 'https://www.youtube.com/embed/pWbMrx5rVBE', duration: '24:10', description: 'Kuunda REST APIs na kuhifadhi kumbukumbu kwenye database salama.' }
    ]
  },
  {
    id: 'l2',
    title: 'React 19 & TypeScript Complete Intro',
    desc: 'Learn modern React hooks, state management, and TypeScript in 15 mins.',
    category: 'lectures',
    price: 0,
    isFree: true,
    icon: '⚛️',
    createdAt: Date.now() - 86400000 * 4,
    episodes: [
      { title: '1. React Ecosystem & Project Setup', url: 'https://www.youtube.com/embed/N3AkSS5hXMA', duration: '10:00', description: 'Kuanzisha mradi kwa kutumia Vite na React kwa kasi kubwa.' },
      { title: '2. Hooks, Components & Props', url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', duration: '14:20', description: 'Kuelewa useState, useEffect na jinsi ya kupitisha data.' }
    ]
  }
];

export const SEED_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Anza Kujifunza Programu Leo',
    subtitle: 'Kozi na Mitihani ya Kiwango cha Kimataifa kwa Kiswahili & Kiingereza',
    linkUrl: '#courses',
    active: true,
    badge: 'NEW'
  },
  {
    id: 'b2',
    title: 'Maudhui ya Bure Yanapatikana!',
    subtitle: 'Anza bure na ujipatie cheti chako cha kwanza leo bila gharama',
    linkUrl: '#free',
    active: true,
    badge: 'HOT'
  },
  {
    id: 'b3',
    title: 'Malipo ya Papo Hapo M-Pesa & Tigo',
    subtitle: 'Uthibitisho wa haraka na ufikiaji wa masomo mara moja',
    linkUrl: '#pay',
    active: true,
    badge: 'OFFER'
  }
];

export const SEED_APPS: CodApp[] = [
  {
    id: 'app1',
    name: 'CamScanner Pro',
    desc: 'Professional document scanning & OCR app',
    fullDesc: 'Geuza simu yako kuwa scanner yenye nguvu ya nyaraka na vitabu yenye uwezo wa kutambua maandishi (OCR) na kubadili kuwa PDF.',
    changelog: 'Toleo 2.1\n- UI iliyoboreshwa zaidi\n- Kasi kubwa ya kusoma nyaraka\n- Ulinzi wa nenosiri kwenye PDF',
    developer: 'INTSIG International',
    size: '45MB',
    rating: '4.8',
    icon: '📱',
    url: 'https://play.google.com/store/apps/details?id=com.intsig.camscanner',
    priceType: 'free',
    price: 0,
    createdAt: Date.now() - 86400000 * 7,
    screenshots: [
      { type: 'url', data: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'app2',
    name: 'Code Studio IDE',
    desc: 'Mobile code editor & Python/JS compiler',
    fullDesc: 'Andika na kimbiza msimbo wa JavaScript, Python, na HTML moja kwa moja kwenye simu yako bila kuhitaji kompyuta kubwa.',
    changelog: 'Toleo 1.4\n- Sintaksia yenye rangi (Syntax Highlighting)\n- AI Code Assistant imejumuishwa\n- Hali ya giza ya OLED',
    developer: 'App Studio Technologies',
    size: '28MB',
    rating: '4.9',
    icon: '💻',
    url: 'https://play.google.com',
    priceType: 'free',
    price: 0,
    createdAt: Date.now() - 86400000 * 4,
    screenshots: [
      { type: 'url', data: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80' }
    ]
  }
];

export const SEED_LEADERBOARD = [
  { name: 'Jordyn Kenter', points: 96239 },
  { name: 'Alena Bator', points: 84787 },
  { name: 'Carl Oliver', points: 82139 },
  { name: 'Davis Curtis', points: 80857 },
  { name: 'Isona Othid', points: 76128 },
  { name: 'Makenna George', points: 71667 },
  { name: 'Kianna Batista', points: 68439 }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: 'r1',
    itemId: 'c1',
    userId: 'u101',
    userName: 'Said Ally',
    rating: 5,
    comment: 'Kozi hii ya JavaScript imenielewesha vitu nilivyokuwa nashindwa kwa miezi miwili! Mwalimu anafundisha vizuri sana.',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'r2',
    itemId: 'c1',
    userId: 'u102',
    userName: 'Fatma Juma',
    rating: 5,
    comment: 'Mifano ni ya vitendo na unaweza kujaribu mwenyewe moja kwa moja. Cheti chake kiko vizuri sana.',
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 'r3',
    itemId: 'l1',
    userId: 'u103',
    userName: 'Emmanuel Mwamba',
    rating: 5,
    comment: 'Video ziko na ubora wa juu sana, na unaweza kualamisha masomo uliyomaliza kirahisi.',
    createdAt: Date.now() - 86400000 * 3
  }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: '🔥 Ofa Maalum: 50% Punguzo la Masomo!',
    message: 'Tumia kuponi CODZNZ50 kupata punguzo la 50% kwenye masomo yote ya Fullstack & Python mwezi huu.',
    type: 'offer',
    offerCode: 'CODZNZ50',
    offerDiscount: '50% OFF',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    actionText: 'Tumia Ofa Sasa',
    actionUrl: '#courses',
    createdAt: Date.now() - 3600000 * 1,
    read: false
  },
  {
    id: 'n2',
    title: 'Karibu Kwenye Jukwaa! 🎉',
    message: 'Gundua masomo mapya, mitihani, na programu za bure kuanza safari yako ya TEHAMA na kupata vyeti rasmi.',
    type: 'success',
    createdAt: Date.now() - 3600000 * 5,
    read: false
  },
  {
    id: 'n3',
    title: '🚀 Shindano la Developer & Coding XP',
    message: 'Weka App yako kwenye Developer Studio au kamilisha mitihani 3 ili kupata pointi 500 za bure na kuingia Top 10 Leaderboard!',
    type: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    actionText: 'Tazama Nafasi',
    actionUrl: '#lb',
    createdAt: Date.now() - 86400000,
    read: false
  },
  {
    id: 'n4',
    title: '⚡ Mfumo Mpya wa Malipo & USSD Push',
    message: 'Sasa unaweza kulipia kozi papo hapo kupitia Vodacom M-Pesa, Tigo Pesa na Airtel Money kwa njia rahisi.',
    type: 'info',
    createdAt: Date.now() - 86400000 * 2,
    read: true
  }
];

export const SEED_DISCUSSIONS: Discussion[] = [
  {
    id: 'd1',
    itemId: 'l1',
    userId: 'u104',
    userName: 'Baraka John',
    question: 'Kuna tofauti gani kubwa kati ya let na var kwenye JavaScript?',
    createdAt: Date.now() - 86400000 * 2,
    replies: [
      {
        id: 'rep1',
        author: 'Instructor',
        text: '"var" ina function scope na ina tabia ya hoisting, wakati "let" ina block scope ({}). Daima tumia "let" au "const" kuandika msimbo salama zaidi.',
        createdAt: Date.now() - 86400000 * 1,
        isInstructor: true
      }
    ]
  },
  {
    id: 'd2',
    itemId: 'c1',
    userId: 'u105',
    userName: 'Zuhura Bakari',
    question: 'Je, ninaweza kupakua cheti changu baada ya kumaliza mtihani wa HTML?',
    createdAt: Date.now() - 86400000,
    replies: [
      {
        id: 'rep2',
        author: 'Admin Support',
        text: 'Ndio kabisa! Ukipata alama kuanzia 60%, cheti chenye jina lako na nambari ya uthibitisho kinatengenezwa papo hapo na unaweza kukipakua kama PDF au picha.',
        createdAt: Date.now() - 3600000 * 4,
        isInstructor: true
      }
    ]
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    userId: 'u-demo-1',
    userName: 'Hamisi Omari',
    userEmail: 'hamisi@example.com',
    itemIds: ['c1', 't1'],
    ref: 'SKE8891JQA',
    amount: 20000,
    paymentMethod: 'mpesa',
    phoneNumber: '0754890123',
    status: 'confirmed',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'ord-1002',
    userId: 'u-demo-2',
    userName: 'Amina Salum',
    userEmail: 'amina@example.com',
    itemIds: ['l1'],
    ref: 'TGO9923KPP',
    amount: 45000,
    paymentMethod: 'tigopesa',
    phoneNumber: '0712345678',
    status: 'confirmed',
    createdAt: Date.now() - 86400000 * 1
  }
];

export const SEED_DEVELOPER_PACKAGES: DeveloperPackage[] = [
  {
    id: 'pkg-free',
    name: 'Starter Developer',
    description: 'Chaguo la kuanzia kwa wanafunzi na watengenezaji wanaoanza kujifunza kuweka app zao.',
    price: 0,
    durationDays: 30,
    features: [
      'Weka hadi App 2 bure',
      'Ufikiaji wa Developer Studio',
      'Dashibodi ya takwimu za msingi',
      'Msaada wa jamii'
    ],
    maxApps: 2,
    badge: 'FREE TRIAL',
    active: true,
    revenueSharePct: 70
  },
  {
    id: 'pkg-pro',
    name: 'Pro Developer Monthly',
    description: 'Ufikiaji kamili wa kuweka apps zisizo na kikomo, USSD Push integration na analytics za kina.',
    price: 15000,
    durationDays: 30,
    features: [
      'Weka hadi Apps 10',
      'Beji ya "Verified Developer"',
      '85% mgao wa mapato ya mauzo ya App',
      'Kuweka video za maelekezo ya App',
      'Msaada wa kipaumbele wa masaa 24'
    ],
    maxApps: 10,
    badge: 'POPULAR',
    active: true,
    revenueSharePct: 85
  },
  {
    id: 'pkg-studio',
    name: 'Studio Lifetime Access',
    description: 'Kwa studio za programu, kampuni, na watengenezaji waandamizi wanaotaka uhuru kamili wa kudumu.',
    price: 50000,
    durationDays: 3650,
    features: [
      'Apps zisizo na kikomo (Unlimited Apps)',
      '95% mgao wa mapato ya mauzo',
      'Bango la VIP kwenye ukurasa wa mwanzo',
      'Uwezo wa kuweka masomo ya kozi na mitihani',
      'Direct API Access & USSD Push Push Gateway'
    ],
    maxApps: 999,
    badge: 'LIFETIME VIP',
    active: true,
    revenueSharePct: 95
  }
];

export const SEED_DEVELOPER_APPLICATIONS: DeveloperApplication[] = [
  {
    id: 'dev-app-1',
    userId: 'u-demo-1',
    userName: 'Hamisi Omari',
    userEmail: 'hamisi@example.com',
    userPhone: '0754890123',
    packageId: 'pkg-pro',
    packageName: 'Pro Developer Monthly',
    packagePrice: 15000,
    paymentRef: 'SKE8891JQA',
    status: 'pending',
    portfolioUrl: 'https://github.com/hamisi-dev',
    devBio: 'Nimetengeneza app ya kusimamia hesabu za maduka (POS) na ninataka kuichapisha kwenye Store.',
    appliedAt: Date.now() - 3600000 * 3
  }
];

export const SEED_BUNDLES: LearningBundle[] = [
  {
    id: 'bnd-fullstack',
    title: 'Full Stack Web Developer Mastery Path',
    desc: 'Njia kamili ya kugeuka kuwa mhandisi wa programu kuanzia HTML/CSS, JavaScript, React, Node.js hadi MongoDB.',
    icon: '🌐',
    coverImg: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    level: 'All Levels',
    duration: '45+ Masomo (Vyeti 2)',
    courseIds: ['c1', 'c3', 'c4', 't1'],
    price: 35000,
    originalPrice: 55000,
    badge: '🔥 OKOA 36%',
    skills: ['HTML5 & Modern CSS', 'ES6+ JavaScript', 'React Component Architecture', 'Node.js REST API', 'Cheti Rasmi'],
    createdAt: Date.now() - 86400000 * 4
  },
  {
    id: 'bnd-python-ai',
    title: 'Python, Data Science & AI Specialist Path',
    desc: 'Jifunze lugha yenye soko kubwa duniani kwa uchambuzi wa data, uendeshaji wa mifumo na ujasusi mnemba (AI).',
    icon: '🐍',
    coverImg: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    level: 'All Levels',
    duration: '30+ Masomo (Vyeti Rasmi)',
    courseIds: ['c2', 't2', 'l1'],
    price: 30000,
    originalPrice: 50000,
    badge: '⚡ BESTSELLER',
    skills: ['Python Core', 'Pandas & NumPy', 'Data Visualization', 'Algorithmic Thinking'],
    createdAt: Date.now() - 86400000 * 2
  }
];

export const SEED_COUPONS: Coupon[] = [
  {
    id: 'cpn-1',
    code: 'CODZNZ50',
    discountType: 'percentage',
    discountValue: 50,
    targetType: 'all',
    expiresAt: Date.now() + 86400000 * 30,
    maxUses: 200,
    usedCount: 28,
    active: true,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'cpn-2',
    code: 'WELCOME10K',
    discountType: 'fixed',
    discountValue: 10000,
    targetType: 'all',
    expiresAt: Date.now() + 86400000 * 60,
    maxUses: 500,
    usedCount: 142,
    active: true,
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'cpn-3',
    code: 'REACTPRO',
    discountType: 'percentage',
    discountValue: 40,
    targetType: 'single_course',
    targetId: 'c4',
    expiresAt: Date.now() + 86400000 * 15,
    maxUses: 50,
    usedCount: 12,
    active: true,
    createdAt: Date.now() - 86400000 * 1
  }
];

export const SEED_ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'bdg-welcome',
    title: 'Mwanzo wa Safari',
    titleSw: 'Mwanzo wa Safari',
    desc: 'Karibu Kwenye Jukwaa! Ulisajili akaunti yako ya kwanza kwa mafanikio.',
    descSw: 'Ulisajili akaunti yako ya kwanza kwa mafanikio.',
    icon: '🚀',
    xpBonus: 50,
    category: 'community',
    requiredCount: 1,
    badgeLevel: 'Bronze'
  },
  {
    id: 'bdg-first-lesson',
    title: 'Msimbo Bingwa',
    titleSw: 'Msimbo Bingwa',
    desc: 'Kamilisha video au sura yako ya kwanza ya kozi yoyote.',
    descSw: 'Kamilisha video au sura yako ya kwanza ya kozi.',
    icon: '💻',
    xpBonus: 100,
    category: 'learning',
    requiredCount: 1,
    badgeLevel: 'Bronze'
  },
  {
    id: 'bdg-quiz-master',
    title: 'Mtihani Master',
    titleSw: 'Mtihani Master',
    desc: 'Pata alama 80%+ kwenye mtihani wowote wa majaribio na upate cheti.',
    descSw: 'Pata alama 80%+ kwenye mtihani wa majaribio.',
    icon: '🎯',
    xpBonus: 200,
    category: 'tests',
    requiredCount: 1,
    badgeLevel: 'Silver'
  },
  {
    id: 'bdg-referral-champion',
    title: 'Mwalishi Bora (Referral Star)',
    titleSw: 'Mwalishi Bora',
    desc: 'Alika marafiki 3 wajiunge na wajifunze coding kupitia kiungo chako.',
    descSw: 'Alika marafiki 3 kupitia kiungo chako.',
    icon: '🤝',
    xpBonus: 300,
    category: 'community',
    requiredCount: 3,
    badgeLevel: 'Gold'
  },
  {
    id: 'bdg-dev-creator',
    title: 'Developer Mchapishaji',
    titleSw: 'Developer Mchapishaji',
    desc: 'Tuma au chapisha App yako ya kwanza kwenye App Store.',
    descSw: 'Chapisha App yako ya kwanza kwenye jukwaa.',
    icon: '⚡',
    xpBonus: 500,
    category: 'developer',
    requiredCount: 1,
    badgeLevel: 'Gold'
  },
  {
    id: 'bdg-streak-7',
    title: 'Moto wa Kujifunza (7-Day Streak)',
    titleSw: 'Moto wa Kujifunza',
    desc: 'Ingia na ujifunze kwa siku 7 mfululizo bila kukosa hata siku moja.',
    descSw: 'Jifunze kwa siku 7 mfululizo.',
    icon: '🔥',
    xpBonus: 250,
    category: 'streak',
    requiredCount: 7,
    badgeLevel: 'Diamond'
  }
];

// --- SEED CODE PLAYGROUND TEMPLATES ---
export const SEED_PLAYGROUND_TEMPLATES = [
  {
    id: 'tmpl-counter',
    title: 'Counter App (HTML + CSS + JS)',
    language: 'javascript' as const,
    desc: 'Mfano rahisi wa kutumia JavaScript DOM kurekebisha namba kwa kubonyeza vitufe.',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2.5rem;
      border-radius: 1.5rem;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
      width: 280px;
    }
    .count {
      font-size: 4rem;
      font-weight: 900;
      color: #38bdf8;
      margin: 1rem 0;
      transition: transform 0.15s ease;
    }
    .btn-group {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    button {
      padding: 0.75rem 1.25rem;
      font-size: 1.2rem;
      font-weight: bold;
      border: none;
      border-radius: 0.75rem;
      cursor: pointer;
      background: #3b82f6;
      color: white;
      transition: all 0.1s;
    }
    button:active {
      transform: scale(0.92);
    }
    .btn-reset {
      background: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin:0; font-size:1.1rem; color:#94a3b8;">Counter App</h2>
    <div id="display" class="count">0</div>
    <div class="btn-group">
      <button onclick="changeCount(-1)">-</button>
      <button class="btn-reset" onclick="resetCount()">0</button>
      <button onclick="changeCount(1)">+</button>
    </div>
  </div>

  <script>
    let count = 0;
    const display = document.getElementById('display');

    function changeCount(amount) {
      count += amount;
      display.innerText = count;
      display.style.transform = 'scale(1.2)';
      setTimeout(() => display.style.transform = 'scale(1)', 150);
    }

    function resetCount() {
      count = 0;
      display.innerText = 0;
    }
  </script>
</body>
</html>`,
    css: '',
    javascript: '',
    python: `# Python Program ya Kuhesabu
def hesabu_jumla(a, b):
    return a + b

namba1 = 25
namba2 = 15
matokeo = hesabu_jumla(namba1, namba2)

print(f"Habari kutoka Python!")
print(f"Jumla ya {namba1} + {namba2} ni: {matokeo}")

# Mzunguko wa for
print("\\nOrodha ya namba 1 hadi 5:")
for i in range(1, 6):
    print(f"Mzunguko {i}: mraba ni {i**2}")`
  },
  {
    id: 'tmpl-card',
    title: 'Kadi ya Mtumiaji (Tailwind / CSS Glass)',
    language: 'html' as const,
    desc: 'Ubunifu wa kadi ya mwanafunzi yenye glassmorphism na gradient.',
    html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: radial-gradient(circle at top right, #312e81, #090d16);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      margin: 0;
    }
    .profile-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 24px;
      border-radius: 20px;
      width: 300px;
      text-align: center;
      color: #fff;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #6366f1;
      margin: 0 auto 12px;
      background: #4338ca;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .name { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .badge {
      display: inline-block;
      background: rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      margin-top: 6px;
    }
    .bio { font-size: 12px; color: #cbd5e1; margin: 16px 0; line-height: 1.5; }
    .btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: bold;
      width: 100%;
      cursor: pointer;
    }
    .btn:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="profile-card">
    <div class="avatar">👨‍💻</div>
    <h3 class="name">Juma Ali</h3>
    <span class="badge">Fullstack Coder (Zanzibar)</span>
    <p class="bio">Najifunza JavaScript na Python. Lengo langu ni kuunda mifumo ya kisasa ya Mtandaoni.</p>
    <button class="btn" onclick="alert('Ujumbe umetumwa!')">Tuma Ujumbe</button>
  </div>
</body>
</html>`
  },
  {
    id: 'tmpl-python-calc',
    title: 'Python Script: Kikokotoo na Orodha',
    language: 'python' as const,
    desc: 'Mfano wa Python wenye functions, loops na dictionaries kwa Kiswahili.',
    python: `# Kikokotoo cha Ushuru na Punguzo
def kodi_ya_mauzo(bei, kiwango_kodi=0.18):
    kodi = bei * kiwango_kodi
    jumla = bei + kodi
    return kodi, jumla

wanafunzi = [
    {"jina": "Fatma", "alama": 92, "lugha": "JavaScript"},
    {"jina": "Bakari", "alama": 85, "lugha": "Python"},
    {"jina": "Said", "alama": 78, "lugha": "HTML & CSS"}
]

print("=== MATOKEO YA WANAFUNZI ===")
for s in wanafunzi:
    hali = "AMEFAULU VIZURI 🌟" if s["alama"] >= 80 else "AMEFAULU ✅"
    print(f"Mwanafunzi: {s['jina']} | Somo: {s['lugha']} | Alama: {s['alama']}% -> {hali}")

bei_kozi = 25000
kodi, jumla_kuu = kodi_ya_mauzo(bei_kozi)
print(f"\\nBei ya Kozi: TZS {bei_kozi:,}")
print(f"VAT (18%): TZS {kodi:,.0f}")
print(f"Jumla Kuu: TZS {jumla_kuu:,.0f}")`
  }
];

// --- SEED CHEATSHEETS ---
export const SEED_CHEATSHEETS = [
  {
    id: 'cs-html5',
    title: 'HTML5 Semantic & Form Elements',
    category: 'HTML5' as const,
    icon: '🌐',
    description: 'Muhtasari wa tags zote kuu za HTML5, miundo ya ukurasa na sifa za fomu.',
    markdownContent: `### Tags Kuu za Muundo (Semantic HTML)
* \`<header>\` - Sehemu ya juu ya ukurasa au makala (Logo na Menyu).
* \`<nav>\` - Sehemu ya viungo vya kuongoza mtumiaji (Navigation links).
* \`<main>\` - Maudhui makuu ya ukurasa (Main content).
* \`<section>\` - Kugawa sehemu yenye mada moja maalum.
* \`<article>\` - Chapisho linalojitegemea (Blog post, habari).
* \`<aside>\` - Maudhui ya pembeni (Sidebar).
* \`<footer>\` - Sehemu ya chini kabisa (Hakimiliki, viungo vya ziada).

### Tags za Fomu (Form Inputs)
\`\`\`html
<form action="/api/submit" method="POST">
  <label for="email">Barua Pepe:</label>
  <input type="email" id="email" required placeholder="mwanafunzi@example.com" />
  
  <label for="pass">Nenosiri:</label>
  <input type="password" id="pass" minlength="6" />
  
  <button type="submit">Jisajili</button>
</form>
\`\`\``
  },
  {
    id: 'cs-css-tailwind',
    title: 'Tailwind CSS & Modern Styling',
    category: 'CSS & Tailwind' as const,
    icon: '🎨',
    description: 'Madarasa muhimu ya Flexbox, Grid, Rangi, Nafasi na Responsive Design.',
    markdownContent: `### Flexbox & Layout
* \`flex items-center justify-between\` - Panga vipengele katikati na tengeneza nafasi sawa.
* \`flex flex-col gap-4\` - Panga vipengele wima vyenye nafasi ya 16px.
* \`grid grid-cols-1 md:grid-cols-3 gap-6\` - Safu 1 kwenye simu, safu 3 kwenye kompyuta.

### Rangi & Typography
* \`text-xs\`, \`text-sm\`, \`text-base\`, \`text-xl\`, \`text-2xl\` - Ukubwa wa maandishi.
* \`font-bold\`, \`font-black\`, \`tracking-tight\` - Uzito na muonekano wa herufi.
* \`bg-primary text-white hover:bg-primary/90\` - Rangi ya msingi na mabadiliko ya hover.`
  },
  {
    id: 'cs-js-es6',
    title: 'JavaScript ES6+ & Async/Await',
    category: 'JavaScript' as const,
    icon: '📜',
    description: 'Arrow functions, Destructuring, Promises, Map, Filter, na Fetch API.',
    markdownContent: `### Arrays & Array Methods
\`\`\`javascript
const namba = [10, 20, 30, 40];

// Map - badilisha kila namba
const maradi = namba.map(n => n * 2); // [20, 40, 60, 80]

// Filter - chagua zilizokidhi kigezo
const kubwa = namba.filter(n => n > 25); // [30, 40]

// Reduce - hesabu jumla
const jumla = namba.reduce((acc, curr) => acc + curr, 0); // 100
\`\`\`

### Async / Await na Fetch API
\`\`\`javascript
async function pakuaData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Hitilafu ya seva");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Kosa:", error.message);
  }
}
\`\`\``
  },
  {
    id: 'cs-python',
    title: 'Python 3 Misingi na Data Structures',
    category: 'Python' as const,
    icon: '🐍',
    description: 'Lists, Dictionaries, Functions, Loops, na Utunzaji wa Makosa (Exceptions).',
    markdownContent: `### Dictionaries & Lists
\`\`\`python
mwanafunzi = {
    "jina": "Amina",
    "umri": 21,
    "kozi": ["Python", "React"],
    "ada_imelipwa": True
}

# Kuongeza kozi mpya
mwanafunzi["kozi"].append("Machine Learning")

# Kupitia orodha
for k in mwanafunzi["kozi"]:
    print(f"Somo: {k}")
\`\`\`

### Functions & Error Handling
\`\`\`python
def gawanya(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "Huwezi kugawanya kwa sifuri (0)!"

print(gawanya(100, 5)) # 20.0
print(gawanya(50, 0))  # Huwezi kugawanya kwa sifuri!
\`\`\``
  },
  {
    id: 'cs-git',
    title: 'Git Commands & GitHub Workflow',
    category: 'Git' as const,
    icon: '🚀',
    description: 'Amri zote muhimu za Git kwa ajili ya kutunza na kurusha kodi mtandaoni.',
    markdownContent: `### Amri za Kuanzia
* \`git init\` - Anzisha git repository mpya kwenye folda lako.
* \`git clone <url>\` - Pakua mradi kutoka GitHub kwenda kwenye kompyuta yako.
* \`git status\` - Angalia mafaili yaliyobadilika.
* \`git add .\` - Weka mafaili yote tayari kwa ku-commit.
* \`git commit -m "Ujumbe wa mabadiliko"\` - Hifadhi mabadiliko rasmi.
* \`git push origin main\` - Tuma kodi mtandaoni GitHub.`
  }
];

// --- SEED Q&A FORUM QUESTIONS ---
export const SEED_QNA_QUESTIONS = [
  {
    id: 'qna-1',
    itemId: 'c1',
    itemTitle: 'JavaScript Fundamentals',
    userId: 'u-user-1',
    userName: 'Kassim Omary',
    title: 'Tofauti kati ya "==" na "===" kwenye JavaScript ni ipi?',
    details: 'Habari walimu, ninaomba kueleweshwa lini ninatakiwa kutumia alama mbili za sawa (==) na lini ninatakiwa kutumia alama tatu (===) ninapolinganisha variables.',
    codeSnippet: `console.log(5 == "5");  // Inatoa true
console.log(5 === "5"); // Inatoa false`,
    createdAt: Date.now() - 3600000 * 5,
    upvotes: 4,
    isResolved: true,
    replies: [
      {
        id: 'rep-1',
        authorId: 'u-admin-1',
        authorName: 'Mwalimu wa Mafunzo',
        authorRole: 'instructor' as const,
        content: 'Habari Kassim! "==" (Loose equality) inalinganisha thamani pekee baada ya kubadili aina (type coercion), ndio maana 5 namba na "5" string zinakuwa sawa. Lakini "===" (Strict equality) inalinganisha thamani PAMOJA na data type. Inashauriwa kutumia "===" kila wakati ili kuepuka bugs.',
        createdAt: Date.now() - 3600000 * 3,
        upvotes: 6,
        isAccepted: true
      }
    ]
  },
  {
    id: 'qna-2',
    itemId: 'c2',
    itemTitle: 'Python for Data Science',
    userId: 'u-user-2',
    userName: 'Zuhura Bakari',
    title: 'TypeError: can only concatenate str (not "int") to str in Python',
    details: 'Ninapojaribu kuunganisha jina na namba ya umri ninapata error hii kwenye terminal. Naomba msaada wa kurekebisha.',
    codeSnippet: `jina = "Fatma"
umri = 22
print("Mwanafunzi: " + jina + " Umri: " + umri)`,
    createdAt: Date.now() - 3600000 * 12,
    upvotes: 2,
    isResolved: true,
    replies: [
      {
        id: 'rep-2',
        authorId: 'u-ai-tutor',
        authorName: 'AI Coding Tutor',
        authorRole: 'ai_tutor' as const,
        content: 'Tatizo hili linatokea kwa sababu Python hairuhusu kuunganisha maandishi (str) na namba (int) moja kwa moja kwa alama ya "+".\\n\\nIli kurekebisha, tumia f-string kama hivi:\\n\`print(f"Mwanafunzi: {jina} Umri: {umri}")\` au badili kuwa string: \`str(umri)\`.',
        codeSnippet: `print(f"Mwanafunzi: {jina} Umri: {umri}")`,
        createdAt: Date.now() - 3600000 * 10,
        upvotes: 5,
        isAccepted: true
      }
    ]
  }
];

// --- SEED DEVELOPER PAYOUT REQUESTS ---
export const SEED_PAYOUT_REQUESTS = [
  {
    id: 'pay-req-1',
    developerId: 'u-demo-1',
    developerName: 'Rashid Ali',
    developerEmail: 'rashid@example.com',
    amount: 120000,
    provider: 'M-Pesa' as const,
    accountName: 'Rashid Mussa Ali',
    phoneNumber: '0754123456',
    notes: 'Malipo ya mauzo ya App ya Python Studio ya mwezi huu.',
    status: 'paid' as const,
    createdAt: Date.now() - 86400000 * 3,
    processedAt: Date.now() - 86400000 * 1,
    transactionRef: 'MPESA-TX-8849102',
    adminNote: 'Imelipwa kikamilifu kupitia Vodacom M-Pesa B2C.'
  },
  {
    id: 'pay-req-2',
    developerId: 'u-demo-2',
    developerName: 'Amina Salum',
    developerEmail: 'amina@example.com',
    amount: 75000,
    provider: 'Tigo Pesa' as const,
    accountName: 'Amina Salum',
    phoneNumber: '0714987654',
    notes: 'Kutoa mapato ya kozi ya HTML & CSS.',
    status: 'pending' as const,
    createdAt: Date.now() - 3600000 * 4
  }
];

// --- SEED STUDY NOTES ---
export const SEED_STUDY_NOTES = [
  {
    id: 'note-1',
    userId: 'guest',
    courseId: 'c1',
    courseTitle: 'JavaScript Fundamentals',
    title: 'Vidokezo vya Mwanzo: Variables & Functions',
    content: '- `let` inaruhusu kubadili thamani ya variable.\n- `const` haibadiliki.\n- Tumia arrow functions `() => {}` kwa usafi wa kodi.\n- Kila mara kagua Console kwenye browser (F12) kuona makosa.',
    tags: ['JavaScript', 'Misingi'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1
  }
];

