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
    name: 'CodZnz Code Studio',
    desc: 'Mobile code editor & Python/JS compiler',
    fullDesc: 'Andika na kimbiza msimbo wa JavaScript, Python, na HTML moja kwa moja kwenye simu yako bila kuhitaji kompyuta kubwa.',
    changelog: 'Toleo 1.4\n- Sintaksia yenye rangi (Syntax Highlighting)\n- AI Code Assistant imejumuishwa\n- Hali ya giza ya OLED',
    developer: 'CodZnz Technologies',
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
    title: 'Karibu CodZnz Pro! 🎉',
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
        author: 'CodZnz Instructor',
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
    devBio: 'Nimetengeneza app ya kusimamia hesabu za maduka (POS) na ninataka kuichapisha kwenye CodZnz Store.',
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
    desc: 'Karibu CodZnz Pro! Ulisajili akaunti yako ya kwanza kwa mafanikio.',
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
    desc: 'Tuma au chapisha App yako ya kwanza kwenye CodZnz Store.',
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
