import { ContentItem, Banner, CodApp, UserProfile, Review, Discussion, AppNotification, Order } from './types';

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
    title: 'Karibu CodZnz Pro! 🎉',
    message: 'Gundua masomo mapya, mitihani, na programu za bure kuanza safari yako ya TEHAMA.',
    type: 'success',
    createdAt: Date.now() - 3600000 * 2,
    read: false
  },
  {
    id: 'n2',
    title: 'Mfumo Mpya wa Malipo ⚡',
    message: 'Sasa unaweza kulipia kozi kupitia Vodacom M-Pesa, Tigo Pesa na Airtel Money kwa njia rahisi.',
    type: 'info',
    createdAt: Date.now() - 86400000,
    read: false
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
