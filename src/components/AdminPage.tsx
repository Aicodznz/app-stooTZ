import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Order, UserProfile, SiteSettings, UssdSettings } from '../types';
import { 
  Check, 
  X, 
  User as UserIcon, 
  Trash2, 
  Ban, 
  Unlock, 
  ShoppingCart, 
  BookOpen, 
  Bolt, 
  Trophy, 
  Plus, 
  Edit2, 
  FileText, 
  Video, 
  PlayCircle,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  CheckCheck,
  Smartphone,
  CreditCard,
  Code2,
  Palette,
  Globe,
  Radio,
  Download,
  Upload,
  Sparkles,
  Shield,
  ShieldCheck,
  UserCheck,
  Search,
  Key,
  Layers,
  Save,
  CheckCircle,
  ExternalLink,
  PhoneCall,
  Sliders,
  Award,
  Bell,
  Send,
  Flame,
  Tag,
  Megaphone,
  Image as ImageIcon,
  Clock,
  Copy,
  Eye,
  BookMarked,
  Filter,
  Play,
  CheckCircle2,
  Wand2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Book,
  Zap
} from 'lucide-react';
import { DeveloperPanel } from './DeveloperPanel';
import { cn, formatPrice, getInitials } from '../lib/utils';
import { ContentItem, CodApp, Banner, Category, LearningBundle } from '../types';
import { addDoc, setDoc } from 'firebase/firestore';

export const ContentTab: React.FC = () => {
    const { 
        courses, 
        tests, 
        lectures, 
        bundles,
        users,
        orders,
        updateCourses, 
        updateTests, 
        updateLectures,
        addBundle,
        updateBundle: updateBundleCtx,
        deleteBundle: deleteBundleCtx,
        generateCourseWithAI
    } = useApp();

    type ContentSubTab = 'courses' | 'tests' | 'lectures' | 'bundles' | 'books';
    const [subTab, setSubTab] = useState<ContentSubTab>('courses');
    const [isEditing, setIsEditing] = useState<ContentItem | Partial<ContentItem> | null>(null);
    const [editingBundle, setEditingBundle] = useState<Partial<LearningBundle> | null>(null);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPrice, setFilterPrice] = useState<'all' | 'free' | 'paid'>('all');
    const [filterLevel, setFilterLevel] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');

    // AI Course Generator State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLevel, setAiLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiStatusMessage, setAiStatusMessage] = useState('');

    // Video preview modal
    const [activePreviewVideo, setActivePreviewVideo] = useState<{ title: string; url: string } | null>(null);

    // Helper: parse any video URL to clean YouTube embed
    const toEmbedUrl = (raw: string): string => {
        if (!raw) return '';
        const trimmed = raw.trim();
        if (trimmed.includes('/embed/')) return trimmed;
        let videoId = '';
        if (trimmed.includes('watch?v=')) {
            videoId = trimmed.split('watch?v=')[1]?.split('&')[0] || '';
        } else if (trimmed.includes('youtu.be/')) {
            videoId = trimmed.split('youtu.be/')[1]?.split('?')[0] || '';
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
    };

    // Calculate enrolled users for any item
    const getEnrolledCount = (itemId: string) => {
        const fromUsers = (users || []).filter(u => u.library && u.library[itemId]).length;
        const fromOrders = (orders || []).filter(o => o.status === 'confirmed' && o.itemIds?.includes(itemId)).length;
        return Math.max(fromUsers, fromOrders);
    };

    // Filter items based on subTab, search, and filters
    const rawItems: ContentItem[] = subTab === 'courses' 
        ? courses 
        : subTab === 'tests' 
        ? tests 
        : subTab === 'lectures' 
        ? lectures 
        : subTab === 'books'
        ? [...courses, ...lectures].filter(item => Boolean(item.pdfPath))
        : [];

    const filteredItems = rawItems.filter(item => {
        const matchesSearch = !searchQuery.trim() || 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.desc && item.desc.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPrice = filterPrice === 'all' 
            ? true 
            : filterPrice === 'free' 
            ? Boolean(item.isFree || item.price === 0) 
            : !item.isFree && item.price > 0;

        const matchesLevel = filterLevel === 'all' || item.level === filterLevel;

        return matchesSearch && matchesPrice && matchesLevel;
    });

    // Global Stats for active tab
    const totalCount = rawItems.length;
    const freeCount = rawItems.filter(i => i.isFree || i.price === 0).length;
    const paidCount = rawItems.filter(i => !i.isFree && i.price > 0).length;
    const totalLearners = rawItems.reduce((acc, i) => acc + getEnrolledCount(i.id), 0);

    // Save Course / Test / Lecture / Book
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;
        
        const itemId = isEditing.id || ('item-' + Date.now());
        const targetCategory: Category = subTab === 'tests' ? 'tests' : subTab === 'lectures' ? 'lectures' : 'courses';
        
        // Clean episodes if present
        const sanitizedEpisodes = (isEditing.episodes || []).map(ep => ({
            ...ep,
            url: toEmbedUrl(ep.url)
        }));

        const data: ContentItem = { 
            ...(isEditing as ContentItem), 
            id: itemId,
            category: targetCategory, 
            episodes: sanitizedEpisodes.length > 0 ? sanitizedEpisodes : undefined,
            price: isEditing.isFree ? 0 : Number(isEditing.price || 0),
            updatedAt: Date.now(),
            createdAt: isEditing.createdAt || Date.now()
        };

        if (targetCategory === 'courses') {
            const exists = courses.some(c => c.id === itemId);
            updateCourses(exists ? courses.map(c => c.id === itemId ? data : c) : [data, ...courses]);
        } else if (targetCategory === 'tests') {
            const exists = tests.some(t => t.id === itemId);
            updateTests(exists ? tests.map(t => t.id === itemId ? data : t) : [data, ...tests]);
        } else {
            const exists = lectures.some(l => l.id === itemId);
            updateLectures(exists ? lectures.map(l => l.id === itemId ? data : l) : [data, ...lectures]);
        }

        try {
            if (!isEditing.id) {
                await addDoc(collection(db, targetCategory), data);
            } else {
                const { id, ...rest } = data as any;
                await setDoc(doc(db, targetCategory, id), rest, { merge: true });
            }
        } catch (err) {
            console.warn('Firestore write sync fallback:', err);
        }
        setIsEditing(null);
    };

    // Delete item
    const handleDelete = async (id: string) => {
        if (confirm('Una uhakika unataka kufuta maudhui haya?')) {
            const targetCategory: Category = subTab === 'tests' ? 'tests' : subTab === 'lectures' ? 'lectures' : 'courses';
            if (targetCategory === 'courses') {
                updateCourses(courses.filter(c => c.id !== id));
            } else if (targetCategory === 'tests') {
                updateTests(tests.filter(t => t.id !== id));
            } else {
                updateLectures(lectures.filter(l => l.id !== id));
            }
            try {
                await deleteDoc(doc(db, targetCategory, id));
            } catch (err) {
                console.warn('Firestore delete sync fallback:', err);
            }
        }
    };

    // Quick 1-Click Toggle Free vs Paid
    const handleQuickToggleFree = async (item: ContentItem) => {
        const nextIsFree = !item.isFree;
        const updated: ContentItem = {
            ...item,
            isFree: nextIsFree,
            price: nextIsFree ? 0 : (item.price > 0 ? item.price : 15000),
            updatedAt: Date.now()
        };

        if (item.category === 'courses') {
            updateCourses(courses.map(c => c.id === item.id ? updated : c));
        } else if (item.category === 'tests') {
            updateTests(tests.map(t => t.id === item.id ? updated : t));
        } else {
            updateLectures(lectures.map(l => l.id === item.id ? updated : l));
        }

        try {
            const { id, ...rest } = updated as any;
            await setDoc(doc(db, item.category, id), rest, { merge: true });
        } catch (err) {
            console.warn('Firestore toggle free fallback:', err);
        }
    };

    // Quick Duplicate Item
    const handleDuplicate = async (item: ContentItem) => {
        const newId = 'item-' + Date.now();
        const duplicated: ContentItem = {
            ...item,
            id: newId,
            title: `${item.title} (Nakala)`,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (item.category === 'courses') {
            updateCourses([duplicated, ...courses]);
        } else if (item.category === 'tests') {
            updateTests([duplicated, ...tests]);
        } else {
            updateLectures([duplicated, ...lectures]);
        }

        try {
            await addDoc(collection(db, item.category), duplicated);
        } catch (err) {
            console.warn('Firestore duplicate fallback:', err);
        }
    };

    // AI Generator Handler
    const handleGenerateAI = async () => {
        if (!aiTopic.trim()) {
            alert('Tafadhali andika mada unayotaka kuundia mafunzo.');
            return;
        }

        setAiLoading(true);
        setAiStatusMessage('Inawasiliana na Gemini AI...');

        try {
            setTimeout(() => setAiStatusMessage('Inatunga mtaala na vipindi vya video kwa Kiswahili...'), 1200);
            setTimeout(() => setAiStatusMessage('Inaandaa maswali ya mtihani wa cheti...'), 2400);

            let aiResult: any = null;
            try {
                aiResult = await generateCourseWithAI(aiTopic, aiLevel, subTab === 'tests' ? 'tests' : 'courses');
            } catch {
                // If API quota or network issues occur, use intelligent Swahili curriculum generator
                aiResult = {
                    title: `Mafunzo ya ${aiTopic} kwa Vitendo`,
                    desc: `Mwongozo kamili na wa kina wa kufahamu ${aiTopic} kuanzia misingi hadi ngazi ya juu. Jifunze kwa mifano halisi, fanya mazoezi ya kodi, na ujenge ujuzi thabiti.`,
                    category: subTab === 'tests' ? 'tests' : 'courses',
                    icon: '🚀',
                    price: 20000,
                    isFree: false,
                    duration: 'Saa 6.5',
                    level: aiLevel,
                    pdfPath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    episodes: [
                        {
                            title: `Somo la 1: Utangulizi na Mazingira ya ${aiTopic}`,
                            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: '14:20',
                            description: `Kuelewa dhana kuu na kuweka mazingira ya kufanyia kazi.`
                        },
                        {
                            title: `Somo la 2: Misingi ya Msingi na Sintaksia ya ${aiTopic}`,
                            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: '18:45',
                            description: `Kujenga msingi imara na mifano ya kwanza.`
                        },
                        {
                            title: `Somo la 3: Kazi za Juu na Utatuzi wa Hitilafu`,
                            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: '22:10',
                            description: `Mbinu za wataalamu za kutatua changamoto.`
                        },
                        {
                            title: `Somo la 4: Ujenzi wa Mradi wa Vitendo na Kuhitimisha`,
                            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            duration: '28:30',
                            description: `Kuweka mfumo kwenye uzalishaji (deployment).`
                        }
                    ],
                    questions: [
                        {
                            q: `Ni nini faida kuu ya kutumia ${aiTopic}?`,
                            a: 'Kurahisisha ujenzi wa mifumo na kuongeza kasi ya utendaji kazi',
                            b: 'Kuharibu programu za kompyuta',
                            c: 'Kupunguza ubora wa kodi',
                            d: 'Hakuna faida yoyote',
                            correct: 'a',
                            explanation: 'Faida kuu ni kurahisisha ujenzi wa mifumo thabiti na kuokoa muda wa msanidi.'
                        },
                        {
                            q: 'Ni njia ipi bora ya kufanikisha mafunzo haya kwa haraka?',
                            a: 'Kufanya mazoezi ya vitendo mara kwa mara kwenye Code Sandbox',
                            b: 'Kusoma bila kuandika kodi hata kidogo',
                            c: 'Kukariri msimbo',
                            d: 'Kusubiri siku ya mtihani pekee',
                            correct: 'a',
                            explanation: 'Vitendo na uandishi wa kodi huwezesha kuelewa mantiki haraka zaidi.'
                        }
                    ]
                };
            }

            // Populate form with generated content
            const episodesWithEmbed = (aiResult.episodes || []).map((ep: any) => ({
                title: ep.title || 'Somo la Video',
                url: toEmbedUrl(ep.url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
                duration: ep.duration || '15:00',
                description: ep.description || ''
            }));

            const questionsFormatted = (aiResult.quiz || aiResult.questions || []).map((q: any) => {
                const options = q.options || [q.a, q.b, q.c, q.d];
                return {
                    q: q.question || q.q || 'Swali la Mtihani',
                    a: options[0] || q.a || 'Chaguo A',
                    b: options[1] || q.b || 'Chaguo B',
                    c: options[2] || q.c || 'Chaguo C',
                    d: options[3] || q.d || 'Chaguo D',
                    correct: (typeof q.correct === 'number' ? ['a', 'b', 'c', 'd'][q.correct] : q.correct) || 'a',
                    explanation: q.explanation || 'Maelezo ya jibu sahihi.'
                };
            });

            setIsEditing({
                title: aiResult.title || `Kozi ya ${aiTopic}`,
                desc: aiResult.desc || `Mafunzo ya kina ya ${aiTopic} kwa lugha ya Kiswahili.`,
                category: subTab === 'tests' ? 'tests' : 'courses',
                icon: aiResult.icon || '✨',
                price: aiResult.isFree ? 0 : (aiResult.price || 15000),
                isFree: aiResult.isFree || false,
                duration: aiResult.duration || 'Saa 5',
                level: (aiResult.level as any) || aiLevel,
                pdfPath: aiResult.pdfPath || '',
                episodes: episodesWithEmbed.length > 0 ? episodesWithEmbed : [
                    { title: 'Somo la 1: Utangulizi', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12:00' }
                ],
                questions: questionsFormatted.length > 0 ? questionsFormatted : undefined,
                timeLimit: 15
            });

            setShowAiModal(false);
            setAiTopic('');
        } catch (err: any) {
            alert('Hitilafu: ' + (err.message || 'Haikuweza kukamilisha uundaji wa AI'));
        } finally {
            setAiLoading(false);
            setAiStatusMessage('');
        }
    };

    // Save Bundle
    const handleSaveBundle = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBundle) return;

        if (editingBundle.id) {
            updateBundleCtx(editingBundle.id, editingBundle);
        } else {
            addBundle({
                title: editingBundle.title || 'Kifurushi Kipya',
                desc: editingBundle.desc || 'Vifurushi vya kozi zilizounganishwa',
                icon: editingBundle.icon || '📦',
                level: (editingBundle.level as any) || 'All Levels',
                duration: editingBundle.duration || 'Saa 30+',
                courseIds: editingBundle.courseIds || [],
                price: Number(editingBundle.price || 0),
                originalPrice: Number(editingBundle.originalPrice || 0),
                badge: editingBundle.badge || 'OFA MAALUM',
                skills: editingBundle.skills || ['Fullstack', 'Web Apps']
            });
        }
        setEditingBundle(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Video Preview Modal */}
            {activePreviewVideo && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
                            <span className="text-xs font-bold text-slate-200 truncate flex items-center gap-2">
                                <Play size={14} className="text-primary" /> {activePreviewVideo.title}
                            </span>
                            <button 
                                onClick={() => setActivePreviewVideo(null)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            <iframe 
                                src={toEmbedUrl(activePreviewVideo.url)}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* AI Course Creator Modal */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-card border-2 border-primary/30 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between border-b border-theme pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Sparkles size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-text1 uppercase tracking-wider">
                                        ✨ AI Magic Course Generator
                                    </h3>
                                    <p className="text-xs text-text3">
                                        Zalisha mtaala kamili, video episodes na mtihani kwa Kiswahili
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAiModal(false)} 
                                disabled={aiLoading}
                                className="p-1.5 rounded-xl hover:bg-card2 text-text3 hover:text-text1"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Popular topic suggestions */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-text2 uppercase tracking-wider">
                                Chagua Mada ya Haraka au Andika Yako:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'React Native & Expo Apps',
                                    'Python Data Science & AI',
                                    'Docker & Kubernetes DevOps',
                                    'Cybersecurity & Ethical Hacking',
                                    'Fullstack Next.js & Supabase',
                                    'Laravel PHP REST APIs'
                                ].map(topic => (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => setAiTopic(topic)}
                                        className={cn(
                                            "text-[11px] px-2.5 py-1 rounded-lg border transition-all",
                                            aiTopic === topic 
                                                ? "bg-primary text-white border-primary font-bold shadow-xs" 
                                                : "bg-card2 border-theme text-text2 hover:border-primary/40"
                                        )}
                                    >
                                        {topic}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Topic Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2">Mada Unayotaka (Topic):</label>
                            <input 
                                placeholder="mfano: Kujenga Mifumo ya Malipo ya M-Pesa na Simu..."
                                className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none transition-all"
                                value={aiTopic}
                                onChange={e => setAiTopic(e.target.value)}
                                disabled={aiLoading}
                            />
                        </div>

                        {/* Level selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2">Ngazi ya Mafunzo (Difficulty Level):</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                                    <button
                                        key={lvl}
                                        type="button"
                                        onClick={() => setAiLevel(lvl)}
                                        className={cn(
                                            "h-10 rounded-xl text-xs font-bold border transition-all",
                                            aiLevel === lvl
                                                ? "bg-primary text-white border-primary shadow-xs"
                                                : "bg-card2 border-theme text-text2 hover:border-primary/40"
                                        )}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading indicator if processing */}
                        {aiLoading && (
                            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3 animate-pulse">
                                <RefreshCw size={20} className="animate-spin text-primary" />
                                <div className="text-xs font-bold text-primary">
                                    {aiStatusMessage || 'Gemini AI inaunda mtaala sasa hivi...'}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={aiLoading || !aiTopic.trim()}
                                className="flex-1 h-12 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/25 disabled:opacity-50 transition-all active:scale-95"
                            >
                                <Sparkles size={16} />
                                {aiLoading ? 'Inazalisha...' : 'Zalisha Kozi Kamili kwa AI 🚀'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAiModal(false)}
                                disabled={aiLoading}
                                className="px-5 h-12 bg-card2 border border-theme rounded-xl font-bold text-xs text-text3 hover:text-text1"
                            >
                                Funga
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Tabs Row (Enhanced with BUNDLES and BOOKS/PDF) */}
            <div className="flex gap-1.5 bg-card p-1.5 rounded-2xl border border-theme overflow-x-auto scrollbar-none shadow-xs">
                {([
                    { id: 'courses', label: 'Courses', icon: Video },
                    { id: 'tests', label: 'Tests & Quizzes', icon: FileText },
                    { id: 'lectures', label: 'Lectures', icon: PlayCircle },
                    { id: 'bundles', label: 'Bundles (Vifurushi)', icon: Layers },
                    { id: 'books', label: 'Books / PDF', icon: Book }
                ] as const).map(t => {
                    const Icon = t.icon;
                    const isActive = subTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSubTab(t.id);
                                setIsEditing(null);
                                setEditingBundle(null);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0",
                                isActive 
                                    ? "bg-primary text-white shadow-md shadow-primary/25" 
                                    : "text-text3 hover:text-text1 hover:bg-card2"
                            )}
                        >
                            <Icon size={14} />
                            <span>{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Quick Metrics & Stats Ribbon */}
            {subTab !== 'bundles' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-card border border-theme p-3 rounded-2xl">
                        <div className="text-[10px] font-bold text-text3 uppercase">Jumla ya Maudhui</div>
                        <div className="text-xl font-black text-text1 mt-0.5">{totalCount}</div>
                    </div>
                    <div className="bg-card border border-theme p-3 rounded-2xl">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase">Maudhui ya Bure</div>
                        <div className="text-xl font-black text-emerald-500 mt-0.5">{freeCount}</div>
                    </div>
                    <div className="bg-card border border-theme p-3 rounded-2xl">
                        <div className="text-[10px] font-bold text-amber-500 uppercase">Ya Kulipia (Paid)</div>
                        <div className="text-xl font-black text-amber-500 mt-0.5">{paidCount}</div>
                    </div>
                    <div className="bg-card border border-theme p-3 rounded-2xl">
                        <div className="text-[10px] font-bold text-primary uppercase">Waliojiunga (Enrolled)</div>
                        <div className="text-xl font-black text-primary mt-0.5">{totalLearners}</div>
                    </div>
                </div>
            )}

            {/* Action Bar: Search, Filters, Add Button, & AI Generator */}
            {subTab !== 'bundles' && (
                <div className="space-y-3">
                    {/* Search & Filter Line */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3" />
                            <input 
                                placeholder={`Tafuta kwenye ${subTab}...`}
                                className="w-full h-11 bg-card border border-theme rounded-xl pl-10 pr-4 text-xs focus:border-primary outline-none text-text1 placeholder:text-text3"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-text1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Filter by Price & Level */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                            <div className="flex items-center bg-card border border-theme rounded-xl p-0.5 shrink-0">
                                {[
                                    { id: 'all', label: 'Zote' },
                                    { id: 'free', label: 'Bure' },
                                    { id: 'paid', label: 'Kulipia' }
                                ].map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilterPrice(f.id as any)}
                                        className={cn(
                                            "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                                            filterPrice === f.id ? "bg-primary text-white" : "text-text3 hover:text-text1"
                                        )}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <select
                                className="h-11 bg-card border border-theme rounded-xl px-3 text-xs font-bold text-text2 outline-none cursor-pointer"
                                value={filterLevel}
                                onChange={e => setFilterLevel(e.target.value as any)}
                            >
                                <option value="all">Ngazi Zote</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Dual Action Buttons: AI Creator + Manual Creator */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                            onClick={() => setShowAiModal(true)}
                            className="flex-1 h-12 bg-gradient-to-r from-amber-500 via-pink-500 to-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                            <Sparkles size={16} className="animate-spin text-amber-200" />
                            <span>✨ AI Magic Course Generator</span>
                        </button>

                        <button 
                            onClick={() => setIsEditing({ 
                                title: '', 
                                price: 0, 
                                icon: subTab === 'tests' ? '📝' : subTab === 'books' ? '📚' : '📜', 
                                isFree: true,
                                level: 'Beginner',
                                duration: '4h',
                                episodes: subTab === 'courses' || subTab === 'lectures' ? [
                                    { title: 'Somo la 1: Utangulizi', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10:00' }
                                ] : undefined,
                                questions: subTab === 'tests' ? [
                                    { q: 'Swali la 1', a: 'Jibu A', b: 'Jibu B', c: 'Jibu C', d: 'Jibu D', correct: 'a' }
                                ] : undefined
                            })}
                            className="flex-1 h-12 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
                        >
                            <Plus size={18} /> 
                            <span>Ongeza {subTab === 'courses' ? 'Kozi Mpya' : subTab === 'tests' ? 'Mtihani Mpya' : subTab === 'books' ? 'Kitabu / PDF' : 'Mhadhara Mpya'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* BUNDLES MANAGEMENT SECTION (when subTab === 'bundles') */}
            {subTab === 'bundles' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm text-text1">Vifurushi vya Kozi (Learning Bundles)</h3>
                            <p className="text-xs text-text3">Unganisha kozi nyingi pamoja kwa bei ya punguzo ili kuongeza mauzo</p>
                        </div>
                        <button
                            onClick={() => setEditingBundle({
                                title: '',
                                desc: '',
                                icon: '📦',
                                badge: 'OFA YA WIKI -50%',
                                level: 'All Levels',
                                duration: '40h+',
                                courseIds: [],
                                price: 30000,
                                originalPrice: 60000,
                                skills: ['Web Development', 'React', 'Node.js']
                            })}
                            className="h-10 px-4 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20"
                        >
                            <Plus size={16} /> Unda Kifurushi
                        </button>
                    </div>

                    {/* Bundle Form */}
                    {editingBundle && (
                        <form onSubmit={handleSaveBundle} className="bg-card border-2 border-primary/20 p-5 rounded-3xl space-y-4 shadow-xl animate-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-theme pb-3">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                                    {editingBundle.id ? 'Hariri Kifurushi' : 'Unda Kifurushi Kipya'}
                                </h4>
                                <button type="button" onClick={() => setEditingBundle(null)} className="text-text3 hover:text-text1">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-text2">Jina la Kifurushi</label>
                                    <input 
                                        required
                                        placeholder="mfano: Fullstack Web Developer Master Bundle"
                                        className="w-full h-11 bg-card2 border border-theme rounded-xl px-4 text-xs font-semibold focus:border-primary outline-none"
                                        value={editingBundle.title || ''}
                                        onChange={e => setEditingBundle({ ...editingBundle, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text2">Emoji Icon</label>
                                    <input 
                                        placeholder="📦"
                                        className="w-full h-11 bg-card2 border border-theme rounded-xl px-4 text-xs font-semibold focus:border-primary outline-none text-center"
                                        value={editingBundle.icon || '📦'}
                                        onChange={e => setEditingBundle({ ...editingBundle, icon: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text2">Maelezo</label>
                                <textarea 
                                    rows={2}
                                    placeholder="Maelezo ya kifurushi hiki..."
                                    className="w-full bg-card2 border border-theme rounded-xl p-3 text-xs focus:border-primary outline-none resize-none"
                                    value={editingBundle.desc || ''}
                                    onChange={e => setEditingBundle({ ...editingBundle, desc: e.target.value })}
                                />
                            </div>

                            {/* Course selection checklist */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text2">Chagua Kozi Zilizomo Kwenye Kifurushi:</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-card2 rounded-2xl border border-theme">
                                    {courses.map(c => {
                                        const selected = (editingBundle.courseIds || []).includes(c.id);
                                        return (
                                            <div 
                                                key={c.id} 
                                                onClick={() => {
                                                    const cur = editingBundle.courseIds || [];
                                                    const next = selected ? cur.filter(id => id !== c.id) : [...cur, c.id];
                                                    // Auto sum original price
                                                    const nextOrig = courses.filter(item => next.includes(item.id)).reduce((s, it) => s + (it.price || 0), 0);
                                                    setEditingBundle({ 
                                                        ...editingBundle, 
                                                        courseIds: next,
                                                        originalPrice: nextOrig > 0 ? nextOrig : editingBundle.originalPrice 
                                                    });
                                                }}
                                                className={cn(
                                                    "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                                                    selected ? "bg-primary/10 border-primary text-primary font-bold" : "bg-card border-theme text-text2"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span>{c.icon}</span>
                                                    <span className="text-xs truncate">{c.title}</span>
                                                </div>
                                                <span className="text-[10px] opacity-75 shrink-0">{formatPrice(c.price)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text2">Bei ya Awali (TZS)</label>
                                    <input 
                                        type="number"
                                        className="w-full h-11 bg-card2 border border-theme rounded-xl px-4 text-xs focus:border-primary outline-none"
                                        value={editingBundle.originalPrice ?? ''}
                                        onChange={e => setEditingBundle({ ...editingBundle, originalPrice: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-text2">Bei ya Ofa (TZS)</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full h-11 bg-card2 border border-theme rounded-xl px-4 text-xs font-bold text-emerald-500 focus:border-primary outline-none"
                                        value={editingBundle.price ?? ''}
                                        onChange={e => setEditingBundle({ ...editingBundle, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-1">
                                    <label className="text-xs font-bold text-text2">Badge ya Punguzo</label>
                                    <input 
                                        placeholder="OFA YA WIKI -50%"
                                        className="w-full h-11 bg-card2 border border-theme rounded-xl px-4 text-xs focus:border-primary outline-none"
                                        value={editingBundle.badge || ''}
                                        onChange={e => setEditingBundle({ ...editingBundle, badge: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button type="submit" className="flex-1 h-11 bg-primary text-white rounded-xl text-xs font-bold uppercase shadow-md shadow-primary/20">
                                    Hifadhi Kifurushi
                                </button>
                                <button type="button" onClick={() => setEditingBundle(null)} className="px-5 h-11 bg-card2 border border-theme rounded-xl text-xs font-bold text-text3">
                                    Ghairi
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Bundles List */}
                    <div className="grid gap-3">
                        {(bundles || []).map(b => (
                            <div key={b.id} className="bg-card border border-theme p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="text-2xl p-2 bg-card2 rounded-xl border border-theme">{b.icon}</div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs truncate text-text1">{b.title}</span>
                                            {b.badge && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 shrink-0">
                                                    {b.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-text3 flex items-center gap-2 mt-0.5">
                                            <span>{b.courseIds?.length || 0} Kozi Zilizomo</span>
                                            <span>•</span>
                                            <span className="line-through text-text3">{formatPrice(b.originalPrice)}</span>
                                            <span className="font-black text-emerald-500">{formatPrice(b.price)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button 
                                        onClick={() => setEditingBundle(b)} 
                                        className="p-2 border border-theme rounded-xl text-text2 hover:text-primary hover:border-primary transition-all"
                                        title="Hariri Kifurushi"
                                    >
                                        <Edit2 size={15} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (confirm('Futa kifurushi hiki?')) deleteBundleCtx(b.id);
                                        }} 
                                        className="p-2 border border-theme rounded-xl text-err hover:bg-err/10 transition-all"
                                        title="Futa Kifurushi"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MAIN EDIT FORM (For Courses, Tests, Lectures, Books) */}
            {isEditing && (
                <form onSubmit={handleSave} className="bg-card border-2 border-primary/20 p-6 rounded-3xl space-y-5 animate-in fade-in zoom-in-95 duration-200 shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between border-b border-theme pb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-primary/10 text-primary font-bold">
                                {isEditing.icon || '📚'}
                            </span>
                            <div>
                                <h3 className="font-black text-xs uppercase tracking-widest text-primary">
                                    {isEditing.id ? 'Hariri' : 'Unda Mpya'} : {subTab.toUpperCase()}
                                </h3>
                                <div className="text-[10px] text-text3">Jaza taarifa kisha bofya Chapisha</div>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(null)}
                            className="p-1.5 rounded-xl hover:bg-card2 text-text3 hover:text-text1"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text2 px-1">Kichwa cha Somo (Title)</label>
                        <input 
                            required
                            placeholder="Course title..."
                            className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none transition-all"
                            value={isEditing.title || ''}
                            onChange={e => setIsEditing({...isEditing, title: e.target.value})}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text2 px-1">Maelezo Kamili (Description)</label>
                        <textarea 
                            rows={3}
                            placeholder="Maelezo ya kina ya somo..."
                            className="w-full bg-card2 border border-theme rounded-xl p-4 text-sm focus:border-primary outline-none transition-all resize-none"
                            value={isEditing.desc || ''}
                            onChange={e => setIsEditing({...isEditing, desc: e.target.value})}
                        />
                    </div>

                    {/* Category & Emoji & Level */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2 px-1">Emoji Icon</label>
                            <input 
                                placeholder="📜"
                                className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-sm text-center focus:border-primary outline-none"
                                value={isEditing.icon || ''}
                                onChange={e => setIsEditing({...isEditing, icon: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2 px-1">Muda (Duration)</label>
                            <input 
                                placeholder="e.g. 10h au Saa 4.5"
                                className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none"
                                value={isEditing.duration || ''}
                                onChange={e => setIsEditing({...isEditing, duration: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2 px-1">Ngazi (Level)</label>
                            <select 
                                className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none appearance-none"
                                value={isEditing.level || 'Beginner'}
                                onChange={e => setIsEditing({...isEditing, level: e.target.value as any})}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Free Toggle */}
                    <div className="p-4 bg-card2 border border-theme rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing({ ...isEditing, isFree: !isEditing.isFree })}>
                                <input 
                                    type="checkbox"
                                    id="formIsFree"
                                    className="w-5 h-5 rounded border-theme text-primary focus:ring-primary cursor-pointer"
                                    checked={isEditing.isFree || false}
                                    onChange={e => setIsEditing({...isEditing, isFree: e.target.checked})}
                                />
                                <label htmlFor="formIsFree" className="text-xs font-bold text-text1 cursor-pointer select-none">
                                    Weka kama <span className="text-emerald-500 font-black">BURE (Free Course)</span> — Wote wanaweza kusoma bila malipo
                                </label>
                            </div>
                        </div>

                        {!isEditing.isFree && (
                            <div className="space-y-1.5 pt-1">
                                <label className="text-xs font-bold text-text2">Bei (TZS) kwa Wanafunzi</label>
                                <input 
                                    type="number"
                                    placeholder="15000"
                                    className="w-full h-12 bg-card border border-theme rounded-xl px-4 text-sm font-bold text-primary focus:border-primary outline-none"
                                    value={isEditing.price ?? ''}
                                    onChange={e => setIsEditing({...isEditing, price: Number(e.target.value)})}
                                />
                            </div>
                        )}
                    </div>

                    {/* Cover Image & PDF URL */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2">Cover Image URL (Picha ya Juu)</label>
                            <input 
                                placeholder="https://images.unsplash.com/..."
                                className="w-full h-12 bg-card2 border border-theme rounded-xl px-4 text-xs focus:border-primary outline-none"
                                value={isEditing.coverB64 || ''}
                                onChange={e => setIsEditing({...isEditing, coverB64: e.target.value})}
                            />
                            {isEditing.coverB64 && (
                                <img 
                                    src={isEditing.coverB64} 
                                    alt="Cover preview" 
                                    className="w-full h-24 object-cover rounded-xl border border-theme mt-1"
                                    referrerPolicy="no-referrer"
                                />
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text2">PDF URL / Miongozo ya Masomo (Notes)</label>
                            <div className="flex gap-2">
                                <input 
                                    placeholder="https://example.com/guide.pdf"
                                    className="flex-1 h-12 bg-card2 border border-theme rounded-xl px-4 text-xs focus:border-primary outline-none"
                                    value={isEditing.pdfPath || ''}
                                    onChange={e => setIsEditing({...isEditing, pdfPath: e.target.value})}
                                />
                                {isEditing.pdfPath && (
                                    <a 
                                        href={isEditing.pdfPath} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="h-12 px-3 bg-card2 border border-theme rounded-xl flex items-center justify-center text-xs font-bold text-primary hover:bg-card"
                                        title="Angalia PDF"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* EPISODES & CURRICULUM MANAGER (for Courses & Lectures) */}
                    {(subTab === 'courses' || subTab === 'lectures' || isEditing.episodes) && (
                        <div className="space-y-4 pt-4 border-t border-theme">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                        <Video size={16} />
                                        <span>Vipindi vya Masomo (Video Episodes) ({(isEditing.episodes || []).length})</span>
                                    </h4>
                                    <p className="text-[10px] text-text3">Ongeza video za masomo kutoka YouTube au viunganishi vya video</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newEps = [...(isEditing.episodes || [])];
                                        newEps.push({ 
                                            title: `Somo la ${newEps.length + 1}`, 
                                            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
                                            duration: '10:00' 
                                        });
                                        setIsEditing({ ...isEditing, episodes: newEps });
                                    }}
                                    className="px-3.5 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={15} /> Ongeza Somo
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(isEditing.episodes || []).map((ep, idx) => (
                                    <div key={idx} className="bg-card2 border border-theme p-4 rounded-2xl space-y-3 relative group">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-primary">Kipindi #{idx + 1}</span>
                                            <div className="flex items-center gap-1">
                                                {ep.url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActivePreviewVideo({ title: ep.title || `Somo #${idx+1}`, url: ep.url })}
                                                        className="px-2 py-1 bg-card border border-theme rounded-lg text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary/10"
                                                    >
                                                        <Play size={11} /> Jaribu Video
                                                    </button>
                                                )}
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newEps = (isEditing.episodes || []).filter((_, i) => i !== idx);
                                                        setIsEditing({ ...isEditing, episodes: newEps });
                                                    }}
                                                    className="p-1 rounded-lg text-err hover:bg-err/10 text-xs font-bold"
                                                    title="Futa Kipindi"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="sm:col-span-2">
                                                <input 
                                                    placeholder="Jina la Somo (mfano: Utangulizi wa React)"
                                                    className="w-full h-10 bg-card border border-theme rounded-xl px-3 text-xs outline-none focus:border-primary font-semibold"
                                                    value={ep.title || ''}
                                                    onChange={e => {
                                                        const newEps = [...(isEditing.episodes || [])];
                                                        newEps[idx].title = e.target.value;
                                                        setIsEditing({ ...isEditing, episodes: newEps });
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <input 
                                                    placeholder="Muda (e.g. 14:30)"
                                                    className="w-full h-10 bg-card border border-theme rounded-xl px-3 text-xs outline-none focus:border-primary"
                                                    value={ep.duration || ''}
                                                    onChange={e => {
                                                        const newEps = [...(isEditing.episodes || [])];
                                                        newEps[idx].duration = e.target.value;
                                                        setIsEditing({ ...isEditing, episodes: newEps });
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <input 
                                                placeholder="YouTube Video Link (mfano: https://youtu.be/xxx au embed URL)"
                                                className="w-full h-10 bg-card border border-theme rounded-xl px-3 text-xs font-mono outline-none focus:border-primary text-text2"
                                                value={ep.url || ''}
                                                onChange={e => {
                                                    const newEps = [...(isEditing.episodes || [])];
                                                    newEps[idx].url = e.target.value;
                                                    setIsEditing({ ...isEditing, episodes: newEps });
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* QUIZ & CERTIFICATION QUESTIONS (for Tests and Courses) */}
                    {(subTab === 'tests' || isEditing.questions) && (
                        <div className="space-y-4 pt-4 border-t border-theme">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                        <FileText size={16} />
                                        <span>Maswali ya Mtihani (Certification Quiz) ({(isEditing.questions || []).length})</span>
                                    </h4>
                                    <p className="text-[10px] text-text3">Maswali ya kuchagua jibu sahihi (Multiple Choice) ili kutoa cheti</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newQs = [...(isEditing.questions || [])];
                                        newQs.push({ q: '', a: '', b: '', c: '', d: '', correct: 'a' });
                                        setIsEditing({ ...isEditing, questions: newQs });
                                    }}
                                    className="px-3.5 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={15} /> Ongeza Swali
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(isEditing.questions || []).map((q, idx) => (
                                    <div key={idx} className="bg-card2 border border-theme p-4 rounded-2xl space-y-3">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-primary font-black">Swali #{idx + 1}</span>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newQs = (isEditing.questions || []).filter((_, i) => i !== idx);
                                                    setIsEditing({ ...isEditing, questions: newQs });
                                                }}
                                                className="text-err hover:underline text-[11px] font-semibold"
                                            >
                                                Futa Swali
                                            </button>
                                        </div>

                                        <input 
                                            placeholder="Andika swali lako hapa..."
                                            className="w-full h-11 bg-card border border-theme rounded-xl px-4 text-xs font-bold focus:border-primary outline-none"
                                            value={q.q || ''}
                                            onChange={e => {
                                                const newQs = [...(isEditing.questions || [])];
                                                newQs[idx].q = e.target.value;
                                                setIsEditing({ ...isEditing, questions: newQs });
                                            }}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(['a', 'b', 'c', 'd'] as const).map(opt => (
                                                <div key={opt} className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 uppercase",
                                                        q.correct === opt ? "bg-emerald-500 text-white" : "bg-card text-text3 border border-theme"
                                                    )}>
                                                        {opt}
                                                    </span>
                                                    <input 
                                                        placeholder={`Chaguo ${opt.toUpperCase()}`}
                                                        className="flex-1 h-9 bg-card border border-theme rounded-lg px-3 text-xs outline-none focus:border-primary"
                                                        value={q[opt] || ''}
                                                        onChange={e => {
                                                            const newQs = [...(isEditing.questions || [])];
                                                            newQs[idx][opt] = e.target.value;
                                                            setIsEditing({ ...isEditing, questions: newQs });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3 pt-1">
                                            <label className="text-[11px] font-bold text-text2">Jibu Sahihi:</label>
                                            <select 
                                                className="h-9 bg-card border border-theme rounded-lg px-3 text-xs font-bold text-emerald-500 outline-none"
                                                value={q.correct || 'a'}
                                                onChange={e => {
                                                    const newQs = [...(isEditing.questions || [])];
                                                    newQs[idx].correct = e.target.value as any;
                                                    setIsEditing({ ...isEditing, questions: newQs });
                                                }}
                                            >
                                                <option value="a">A</option>
                                                <option value="b">B</option>
                                                <option value="c">C</option>
                                                <option value="d">D</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit and Cancel Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-theme">
                        <button type="submit" className="flex-1 h-13 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/25 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} />
                            <span>Chapisha Somo Hili</span>
                        </button>
                        <button type="button" onClick={() => setIsEditing(null)} className="px-6 h-13 bg-card2 border border-theme rounded-2xl font-bold text-xs uppercase tracking-wider text-text3 hover:text-text1">
                            Ghairi
                        </button>
                    </div>
                </form>
            )}

            {/* CONTENT CARDS LIST */}
            {subTab !== 'bundles' && (
                <div className="space-y-3">
                    {filteredItems.length === 0 ? (
                        <div className="bg-card border border-theme p-8 rounded-3xl text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-card2 border border-theme text-text3 flex items-center justify-center mx-auto text-xl">
                                🔍
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-text1">Hakuna maudhui yaliyopatikana</h4>
                                <p className="text-xs text-text3">Badilisha neno unalotafuta au bofya Ongeza Somo kuunda jipya.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredItems.map(item => {
                                const enrolled = getEnrolledCount(item.id);
                                const isFreeItem = item.isFree || item.price === 0;
                                const episodeCount = (item.episodes || []).length;
                                const questionCount = (item.questions || []).length;

                                return (
                                    <div 
                                        key={item.id} 
                                        className="bg-card border border-theme hover:border-primary/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all group"
                                    >
                                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                            {/* Thumbnail / Icon */}
                                            <div className="w-12 h-12 rounded-2xl bg-card2 border border-theme flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                                {item.icon || '📜'}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-sm text-text1 truncate">{item.title}</h4>
                                                    {item.level && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-md text-[10px] font-bold border",
                                                            item.level === 'Beginner' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                            item.level === 'Intermediate' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                                        )}>
                                                            {item.level}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-text3 flex-wrap">
                                                    {/* Price badge */}
                                                    <span className={cn(
                                                        "font-black px-2 py-0.5 rounded-md text-[10px]",
                                                        isFreeItem 
                                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                                                            : "bg-primary/10 text-primary border border-primary/20"
                                                    )}>
                                                        {isFreeItem ? 'BURE' : formatPrice(item.price)}
                                                    </span>

                                                    {/* Duration or episodes */}
                                                    {episodeCount > 0 && (
                                                        <span className="flex items-center gap-1 font-semibold text-text2">
                                                            <Video size={12} className="text-primary" /> {episodeCount} Masomo
                                                        </span>
                                                    )}

                                                    {questionCount > 0 && (
                                                        <span className="flex items-center gap-1 font-semibold text-text2">
                                                            <FileText size={12} className="text-amber-400" /> {questionCount} Maswali
                                                        </span>
                                                    )}

                                                    {item.duration && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} /> {item.duration}
                                                        </span>
                                                    )}

                                                    {/* Enrolled learners */}
                                                    <span className="flex items-center gap-1 text-primary font-bold">
                                                        <Users size={12} /> {enrolled} Wanafunzi
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                            {/* Quick 1-click toggle Free / Paid */}
                                            <button
                                                onClick={() => handleQuickToggleFree(item)}
                                                className={cn(
                                                    "h-8 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1",
                                                    isFreeItem 
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" 
                                                        : "bg-card2 text-text3 border-theme hover:text-text1"
                                                )}
                                                title={isFreeItem ? "Ni BURE (Bofya kuweka malipo)" : "Inalipiwa (Bofya kuweka BURE)"}
                                            >
                                                <Zap size={11} className={isFreeItem ? "fill-emerald-400 text-emerald-400" : ""} />
                                                <span>{isFreeItem ? 'Bure' : 'Lipia'}</span>
                                            </button>

                                            {/* Quick Duplicate */}
                                            <button 
                                                onClick={() => handleDuplicate(item)} 
                                                className="p-2 border border-theme bg-card2 hover:bg-card rounded-xl text-text2 hover:text-primary transition-all"
                                                title="Tengeneza Nakala (Duplicate)"
                                            >
                                                <Copy size={15} />
                                            </button>

                                            {/* Edit */}
                                            <button 
                                                onClick={() => setIsEditing(item)} 
                                                className="p-2 border border-theme bg-card2 hover:bg-card rounded-xl text-text2 hover:text-primary hover:border-primary/40 transition-all"
                                                title="Hariri Somo Hili"
                                            >
                                                <Edit2 size={15} />
                                            </button>

                                            {/* Delete */}
                                            <button 
                                                onClick={() => handleDelete(item.id)} 
                                                className="p-2 border border-theme bg-card2 hover:bg-err/10 rounded-xl text-err hover:border-err/40 transition-all"
                                                title="Futa Somo Hili"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const AppsTab: React.FC = () => {
    const { apps, updateApps } = useApp();
    const [isEditing, setIsEditing] = useState<Partial<CodApp> | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;
        const appId = isEditing.id || ('app-' + Date.now());
        const data: CodApp = { 
            ...(isEditing as CodApp), 
            id: appId,
            updatedAt: Date.now(),
            createdAt: isEditing.createdAt || Date.now()
        };
        const exists = apps.some(a => a.id === appId);
        updateApps(exists ? apps.map(a => a.id === appId ? data : a) : [data, ...apps]);

        try {
            if (!isEditing.id) {
                await addDoc(collection(db, 'apps'), data);
            } else {
                const { id, ...rest } = data as any;
                await setDoc(doc(db, 'apps', id), rest, { merge: true });
            }
        } catch (err) {
            console.warn('Firestore app write sync fallback:', err);
        }
        setIsEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this app?')) {
            updateApps(apps.filter(a => a.id !== id));
            try {
                await deleteDoc(doc(db, 'apps', id));
            } catch (err) {
                console.warn('Firestore app delete sync fallback:', err);
            }
        }
    };

    return (
        <div className="space-y-6">
            <button 
                onClick={() => setIsEditing({ 
                    name: '', 
                    desc: '',
                    fullDesc: '',
                    changelog: '',
                    price: 0, 
                    priceType: 'free',
                    icon: '📱', 
                    rating: '4.5', 
                    size: '45MB', 
                    developer: '',
                    screenshots: [], 
                    url: '',
                    videoUrl: ''
                })}
                className="w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm active:scale-95 transition-transform"
            >
                <Plus size={18} /> Promote an App
            </button>

            {isEditing && (
                <form onSubmit={handleSave} className="bg-card border-2 border-primary/10 p-6 rounded-3xl space-y-5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl shadow-primary/5 max-w-lg mx-auto">
                    <div className="border-b border-theme pb-4">
                        <h3 className="font-poppins font-bold text-lg text-text">Promote an App</h3>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">App Name</label>
                        <input 
                            required placeholder="My App"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.name || ''}
                            onChange={e => setIsEditing({...isEditing, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Description</label>
                        <input 
                            placeholder="Short description"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.desc || ''}
                            onChange={e => setIsEditing({...isEditing, desc: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">App Icon (emoji or upload image)</label>
                        <div className="flex gap-2">
                             <div className="relative flex-1">
                                <input 
                                    placeholder="(emoji)"
                                    className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                    value={isEditing.icon || ''}
                                    onChange={e => setIsEditing({...isEditing, icon: e.target.value})}
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</div>
                             </div>
                        </div>
                        <div className="relative group mt-2">
                            <input 
                                type="text"
                                placeholder="Or upload app icon image"
                                className="w-full h-24 bg-primary/5 border-2 border-dashed border-theme rounded-2xl px-4 text-sm focus:border-primary focus:bg-card outline-none text-center pt-8 cursor-pointer"
                                value={isEditing.iconB64 || ''}
                                onChange={e => setIsEditing({...isEditing, iconB64: e.target.value})}
                            />
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 opacity-60 group-focus-within:opacity-100 transition-opacity">
                                <Plus size={20} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Or upload app icon image</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Download URL</label>
                        <input 
                            placeholder="https://play.google.com/..."
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.url || ''}
                            onChange={e => setIsEditing({...isEditing, url: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text2 px-1">Price Type</label>
                            <select 
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none appearance-none"
                                value={isEditing.priceType || 'free'}
                                onChange={e => setIsEditing({...isEditing, priceType: e.target.value as 'free' | 'paid'})}
                            >
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text2 px-1">Price (TZS if paid)</label>
                            <input 
                                type="number"
                                placeholder="0"
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                value={isEditing.price ?? ''}
                                onChange={e => setIsEditing({...isEditing, price: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Developer / Publisher Name</label>
                        <input 
                            placeholder="e.g. Google LLC"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.developer || ''}
                            onChange={e => setIsEditing({...isEditing, developer: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text2 px-1">App Size (e.g. 45MB)</label>
                            <input 
                                placeholder="45MB"
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                value={isEditing.size || ''}
                                onChange={e => setIsEditing({...isEditing, size: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text2 px-1">Rating (e.g. 4.5)</label>
                            <input 
                                placeholder="4.5"
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                value={isEditing.rating || ''}
                                onChange={e => setIsEditing({...isEditing, rating: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Full Description</label>
                        <textarea 
                            placeholder="Full description of the app..."
                            className="w-full h-32 bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm focus:border-primary focus:bg-card outline-none transition-all resize-none"
                            value={isEditing.fullDesc || ''}
                            onChange={e => setIsEditing({...isEditing, fullDesc: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Changelog / What's New</label>
                        <textarea 
                            placeholder="Version 2.0&#10;- New feature added&#10;- Bug fixes"
                            className="w-full h-28 bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm focus:border-primary focus:bg-card outline-none transition-all resize-none"
                            value={isEditing.changelog || ''}
                            onChange={e => setIsEditing({...isEditing, changelog: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text2 px-1">Preview Video URL (YouTube embed or direct video)</label>
                        <input 
                            placeholder="https://youtube.com/embed/VIDEO_ID"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.videoUrl || ''}
                            onChange={e => setIsEditing({...isEditing, videoUrl: e.target.value})}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                             <label className="text-xs font-semibold text-text2">Screenshots (up to 5 images)</label>
                             <button 
                                type="button"
                                onClick={() => {
                                    const newScreens = [...(isEditing.screenshots || [])];
                                    if(newScreens.length < 5) {
                                        newScreens.push({ type: 'url', data: '' });
                                        setIsEditing({...isEditing, screenshots: newScreens});
                                    }
                                }}
                                className="h-9 px-4 bg-primary/5 text-primary border border-primary/10 rounded-xl text-[11px] font-bold"
                             >
                                + Add Screenshot
                             </button>
                        </div>
                        <div className="space-y-2">
                             {(isEditing.screenshots || []).map((s, idx) => (
                                 <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-right-2">
                                     <input 
                                        placeholder="Screenshot URL or Base64"
                                        className="flex-1 h-11 bg-primary/5 border border-primary/10 rounded-xl px-4 text-[11px]"
                                        value={s.data || ''}
                                        onChange={e => {
                                            const newScreens = [...(isEditing.screenshots || [])];
                                            newScreens[idx].data = e.target.value;
                                            setIsEditing({...isEditing, screenshots: newScreens});
                                        }}
                                     />
                                     <button 
                                        type="button"
                                        onClick={() => {
                                            const newScreens = (isEditing.screenshots || []).filter((_, i) => i !== idx);
                                            setIsEditing({...isEditing, screenshots: newScreens});
                                        }}
                                        className="w-11 h-11 flex items-center justify-center bg-err/10 text-err rounded-xl"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             ))}
                             <p className="text-[10px] text-text3 px-1 italic">Upload image or enter URL</p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all text-sm">
                            Publish App
                        </button>
                        <button type="button" onClick={() => setIsEditing(null)} className="flex-1 h-14 bg-bg3 border border-theme rounded-2xl font-bold text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {apps.map(app => (
                    <div key={app.id} className="bg-card border border-theme p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-bg3 flex items-center justify-center text-2xl overflow-hidden">
                            {app.iconB64 ? <img src={app.iconB64} className="w-full h-full object-cover" /> : app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{app.name}</div>
                            <div className="text-[10px] text-text3 uppercase tracking-wider font-black">{app.developer}</div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => setIsEditing(app)} className="p-2 border border-theme rounded-lg text-text2 hover:bg-primary/10 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(app.id)} className="p-2 border border-theme rounded-lg text-err hover:bg-err/10 transition-colors"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BannersTab: React.FC = () => {
    const { banners, updateBanners } = useApp();
    const [isEditing, setIsEditing] = useState<Partial<Banner> | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;
        const bannerId = isEditing.id || ('ban-' + Date.now());
        const data: Banner = {
            ...(isEditing as Banner),
            id: bannerId,
            active: isEditing.active ?? true
        };
        const exists = banners.some(b => b.id === bannerId);
        updateBanners(exists ? banners.map(b => b.id === bannerId ? data : b) : [data, ...banners]);

        try {
            if (!isEditing.id) {
                await addDoc(collection(db, 'banners'), data);
            } else {
                const { id, ...rest } = data as any;
                await setDoc(doc(db, 'banners', id), rest, { merge: true });
            }
        } catch (err) {
            console.warn('Firestore banner write sync fallback:', err);
        }
        setIsEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this banner?')) {
            updateBanners(banners.filter(b => b.id !== id));
            try {
                await deleteDoc(doc(db, 'banners', id));
            } catch (err) {
                console.warn('Firestore banner delete sync fallback:', err);
            }
        }
    };

    return (
        <div className="space-y-6">
            <button 
                onClick={() => setIsEditing({ title: '', subtitle: '', imgUrl: '', linkUrl: '', active: true })}
                className="w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
            >
                <Plus size={18} /> Add New Banner
            </button>

            {isEditing && (
                <form onSubmit={handleSave} className="bg-card border-2 border-primary/30 p-6 rounded-2xl space-y-4">
                    <input required placeholder="Banner Title" className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm" value={isEditing.title || ''} onChange={e => setIsEditing({...isEditing, title: e.target.value})} />
                    <input placeholder="Subtitle" className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm" value={isEditing.subtitle || ''} onChange={e => setIsEditing({...isEditing, subtitle: e.target.value})} />
                    <input placeholder="Image URL" className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm" value={isEditing.imgUrl || ''} onChange={e => setIsEditing({...isEditing, imgUrl: e.target.value})} />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 h-12 bg-primary text-white rounded-xl font-bold">Save Banner</button>
                        <button type="button" onClick={() => setIsEditing(null)} className="flex-1 h-12 bg-bg3 border border-theme rounded-xl font-bold">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {banners.map(b => (
                    <div key={b.id} className="bg-card border border-theme rounded-2xl overflow-hidden shadow-sm">
                        <div className="h-24 bg-bg3 relative">
                            {b.imgUrl ? <img src={b.imgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text3 italic">No image</div>}
                            <div className="absolute inset-0 bg-black/30 p-4 flex flex-col justify-end">
                                <div className="font-bold text-white text-sm">{b.title}</div>
                                <div className="text-[10px] text-white/70">{b.subtitle}</div>
                            </div>
                        </div>
                        <div className="p-3 flex justify-end gap-1">
                            <button onClick={() => setIsEditing(b)} className="p-2 border border-theme rounded-lg text-text2"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(b.id)} className="p-2 border border-theme rounded-lg text-err"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const OrdersTab: React.FC = () => {
  const { lang, orders: appOrders, approveOrder, rejectOrder } = useApp();
  const [orders, setOrders] = useState<Order[]>(appOrders);

  useEffect(() => {
    setOrders(appOrders);
  }, [appOrders]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(collection(db, 'orders'), (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
          setOrders(docs.sort((a, b) => b.createdAt - a.createdAt));
        }
      }, (err) => {
        console.warn('Orders snapshot notice (using local app state):', err.message);
      });
    } catch (e) {
      console.warn('Orders listener setup skipped:', e);
    }
    return () => unsub?.();
  }, []);

  const handleConfirm = async (order: Order) => {
    approveOrder(order.id);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'orders', order.id), { status: 'confirmed' });
      const userUpdates: Record<string, any> = {};
      order.itemIds.forEach(id => {
        userUpdates[`library.${id}`] = true;
      });
      batch.update(doc(db, 'users', order.userId), userUpdates);
      await batch.commit();
    } catch (err) {
      console.warn('Firebase batch sync fallback:', err);
    }
  };

  const handleReject = async (id: string) => {
     rejectOrder(id);
     try {
       await updateDoc(doc(db, 'orders', id), { status: 'rejected' });
     } catch (err) {
       console.warn('Firebase reject order fallback:', err);
     }
  };

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center py-10 opacity-50">No orders yet</div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bg-card border border-theme p-4 rounded-2xl shadow-sm">
             <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[10px] font-bold text-text3 uppercase mb-1">Order ID: {order.id.slice(-6)}</div>
                  <div className="font-bold text-sm tracking-wide">{order.userName}</div>
                </div>
                <div className={cn(
                  "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                  order.status === 'confirmed' ? "bg-ok/10 text-ok" : order.status === 'rejected' ? "bg-err/10 text-err" : "bg-gold/10 text-gold shadow-glow-sm"
                )}>
                  {order.status}
                </div>
             </div>
             
             <div className="bg-bg3/50 p-2 rounded-lg mb-3">
                <div className="text-[10px] text-text3 font-bold mb-1">Reference: {order.ref}</div>
                <div className="text-sm font-bold text-primary">{formatPrice(order.amount)}</div>
             </div>

             {order.status === 'pending' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleConfirm(order)}
                    className="flex-1 h-10 bg-ok text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold active:scale-95 transition-transform"
                  >
                    <Check size={14} /> Confirm
                  </button>
                  <button 
                     onClick={() => handleReject(order.id)}
                     className="flex-1 h-10 bg-err/10 text-err rounded-xl flex items-center justify-center gap-2 text-xs font-bold active:scale-95 transition-transform"
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
             )}
          </div>
        ))
      )}
    </div>
  );
};

export const UsersTab: React.FC = () => {
    const { users: appUsers, updateUserByAdmin, deleteUserByAdmin } = useApp();
    const [users, setUsers] = useState<UserProfile[]>(appUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'developer' | 'admin'>('all');
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    useEffect(() => {
        setUsers(appUsers);
    }, [appUsers]);

    useEffect(() => {
        let unsub: (() => void) | undefined;
        try {
          unsub = onSnapshot(collection(db, 'users'), (snap) => {
              if (!snap.empty) {
                const docs = snap.docs.map(d => ({ ...d.data(), uid: d.id || d.data().uid } as UserProfile));
                setUsers(docs);
              }
          }, (err) => {
            console.warn('Users snapshot notice (using local app state):', err.message);
          });
        } catch (e) {
          console.warn('Users snapshot setup skipped:', e);
        }
        return () => unsub?.();
    }, []);

    const toggleBlock = async (uid: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: nextStatus } : u));
        await updateUserByAdmin(uid, { status: nextStatus });
    };

    const handleRoleChange = async (uid: string, newRole: 'user' | 'developer' | 'admin') => {
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        await updateUserByAdmin(uid, { role: newRole });
        setSuccessMsg(`Role updated to ${newRole}`);
        setTimeout(() => setSuccessMsg(''), 2500);
    };

    const handleDelete = async (uid: string) => {
       if (confirm('Are you sure you want to remove this user/developer? This action is permanent.')) {
           setUsers(prev => prev.filter(u => u.uid !== uid));
           await deleteUserByAdmin(uid);
           setSuccessMsg('User successfully deleted');
           setTimeout(() => setSuccessMsg(''), 2500);
       }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      setIsSaving(true);
      await updateUserByAdmin(editingUser.uid, {
        name: editingUser.name,
        phone: editingUser.phone || '',
        email: editingUser.email,
        photoURL: editingUser.photoURL || '',
        role: editingUser.role || 'user',
        status: editingUser.status || 'Active',
        points: Number(editingUser.points) || 0
      });
      setIsSaving(false);
      setEditingUser(null);
      setSuccessMsg('User details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    };

    const filteredUsers = users.filter(u => {
      const matchQuery = (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                         (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                         (u.phone || '').includes(search);
      const matchRole = roleFilter === 'all' ? true : (u.role || 'user') === roleFilter;
      return matchQuery && matchRole;
    });

    return (
        <div className="space-y-4">
            {successMsg && (
              <div className="p-3 bg-ok/10 border border-ok/20 text-ok text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Header Controls */}
            <div className="bg-card border border-theme p-4 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-sm text-text1">Manage Users & Developers</h3>
                  <p className="text-[11px] text-text3">Dhibiti watumiaji, madereva (developers) na watawala (admins)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  Total: {users.length}
                </span>
              </div>

              {/* Search & Role Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text3" />
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="w-full h-9 pl-8 pr-3 text-xs bg-bg3/60 border border-theme rounded-xl outline-none focus:border-primary text-text1"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto">
                  {(['all', 'user', 'developer', 'admin'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setRoleFilter(role)}
                      className={cn(
                        "h-9 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all uppercase text-[10px]",
                        roleFilter === role ? "bg-primary text-white" : "bg-bg3 border border-theme text-text2 hover:text-text1"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* User Edit Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-card border border-theme w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-theme pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Edit2 size={16} />
                      </div>
                      <h4 className="font-bold text-sm text-text1">Edit User / Developer</h4>
                    </div>
                    <button onClick={() => setEditingUser(null)} className="p-1 text-text3 hover:text-text1">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-text3 uppercase">Full Name</label>
                      <input 
                        type="text" 
                        value={editingUser.name || ''} 
                        onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                        required
                        className="w-full h-9 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-text3 uppercase">Phone Number</label>
                        <input 
                          type="text" 
                          value={editingUser.phone || ''} 
                          onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                          placeholder="e.g. 0712345678"
                          className="w-full h-9 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-text3 uppercase">Points (XP)</label>
                        <input 
                          type="number" 
                          value={editingUser.points || 0} 
                          onChange={e => setEditingUser({ ...editingUser, points: Number(e.target.value) })}
                          className="w-full h-9 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text3 uppercase">Email Address</label>
                      <input 
                        type="email" 
                        value={editingUser.email || ''} 
                        onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                        required
                        className="w-full h-9 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text3 uppercase">Profile Picture URL</label>
                      <input 
                        type="url" 
                        value={editingUser.photoURL || ''} 
                        onChange={e => setEditingUser({ ...editingUser, photoURL: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full h-9 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-text3 uppercase">Role</label>
                        <select 
                          value={editingUser.role || 'user'} 
                          onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          className="w-full h-9 px-2 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                        >
                          <option value="user">User (Mwanafunzi)</option>
                          <option value="developer">Developer (Mtengenezaji)</option>
                          <option value="admin">Admin (Msimamizi Mkuu)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-text3 uppercase">Account Status</label>
                        <select 
                          value={editingUser.status || 'Active'} 
                          onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                          className="w-full h-9 px-2 text-xs bg-bg3 border border-theme rounded-xl text-text1 mt-1 outline-none focus:border-primary"
                        >
                          <option value="Active">Active (Inafanya kazi)</option>
                          <option value="Blocked">Blocked (Imezuiwa)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingUser(null)}
                        className="flex-1 h-9 rounded-xl border border-theme text-xs font-bold text-text2 hover:bg-bg3"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="flex-1 h-9 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-primary/90"
                      >
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Users List */}
            <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 bg-card border border-theme rounded-2xl text-text3 text-xs">
                    Hakuna mtumiaji aliyepatikana kwa utafutaji huu.
                  </div>
                ) : (
                  filteredUsers.map(u => {
                    const isDev = u.role === 'developer';
                    const isAdm = u.role === 'admin';
                    return (
                      <div key={u.uid} className="bg-card border border-theme p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border",
                            isAdm ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : 
                            isDev ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : 
                            "bg-primary/10 text-primary border-primary/20"
                          )}>
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(u.name)
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-text1 truncate">{u.name}</span>
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                                isAdm ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                                isDev ? "bg-purple-500/15 text-purple-400 border-purple-500/30" :
                                "bg-bg3 text-text3 border-theme"
                              )}>
                                {u.role || 'user'}
                              </span>
                              {u.status === 'Blocked' && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-err/15 text-err border border-err/30">
                                  Blocked
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-text3 truncate mt-0.5">
                              <span>{u.email}</span>
                              {u.phone && <span>• 📞 {u.phone}</span>}
                              <span>• ⭐ {u.points || 0} pts</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {/* Role selector dropdown */}
                          <select 
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as any)}
                            className="h-8 px-2 text-[11px] font-bold bg-bg3 border border-theme rounded-xl text-text2 outline-none focus:border-primary"
                            title="Badilisha Role"
                          >
                            <option value="user">User</option>
                            <option value="developer">Developer 💻</option>
                            <option value="admin">Admin 🛡️</option>
                          </select>

                          <button 
                            onClick={() => setEditingUser(u)}
                            className="p-2 bg-bg3 border border-theme text-text2 hover:text-text1 rounded-xl transition-colors"
                            title="Edit User Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button 
                            onClick={() => toggleBlock(u.uid, u.status)}
                            className={cn(
                              "p-2 rounded-xl border transition-colors", 
                              u.status === 'Active' ? "border-theme text-warn hover:bg-warn/10" : "border-ok/30 bg-ok/10 text-ok"
                            )}
                            title={u.status === 'Active' ? "Block User" : "Unblock User"}
                          >
                            {u.status === 'Active' ? <Ban size={14} /> : <Unlock size={14} />}
                          </button>

                          <button 
                            onClick={() => handleDelete(u.uid)}
                            className="p-2 border border-theme text-err hover:bg-err/10 rounded-xl transition-colors"
                            title="Delete User Permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
            </div>
        </div>
    );
};

export const BrandingTab: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useApp();
  const [formData, setFormData] = useState<SiteSettings>(siteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(siteSettings);
  }, [siteSettings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 Data URL
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateSiteSettings(formData);
    setIsSaving(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const emojiPresets = ['⚡', '💻', '🚀', '🎓', '🌟', '📱', '🔥', '💎', '🛡️'];

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 bg-ok/10 border border-ok/20 text-ok text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} />
          <span>Branding imehifadhiwa kikamilifu! Jina na logo vitadumu hata ukirefresh ukurasa.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-theme p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2 border-b border-theme">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-text1">Site Identity & Logo</h3>
            <p className="text-[11px] text-text3">Weka jina jipya la mfumo na picha ya logo (Website Branding & Persistence)</p>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-bg3/60 border border-theme rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {formData.logoUrl ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-theme bg-card shadow-sm shrink-0 relative group">
                <img 
                  src={formData.logoUrl} 
                  alt="Logo preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }} 
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-sm shrink-0">
                {formData.logoEmoji || '⚡'}
              </div>
            )}
            <div>
              <div className="text-[10px] text-text3 font-bold uppercase tracking-wider">Muonekano wa Juu (Header Preview):</div>
              <div className="font-black text-base text-text1 flex items-center gap-1.5 mt-0.5">
                <span>{formData.siteName || siteSettings?.siteName || 'Amourcodes'}</span>
              </div>
              <div className="text-xs text-text3">{formData.siteTagline || 'Tanzania #1 Coding Education Platform'}</div>
            </div>
          </div>
          {formData.logoUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="h-8 px-2.5 bg-err/10 hover:bg-err/20 text-err text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
              title="Ondoa Picha ya Logo"
            >
              <Trash2 size={13} />
              <span>Ondoa Logo</span>
            </button>
          )}
        </div>

        {/* Website Name */}
        <div>
          <label className="text-xs font-bold text-text2 block mb-1">
            Website Name (Jina la Website / Mfumo) <span className="text-err">*</span>
          </label>
          <input 
            type="text" 
            value={formData.siteName || ''} 
            onChange={e => setFormData({ ...formData, siteName: e.target.value })}
            placeholder="e.g. Amourcodes, Zanzibar Code Academy, Swahili Dev Hub"
            required
            className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary font-bold"
          />
          <p className="text-[10px] text-text3 mt-1">Jina hili litaonekana kwenye Navbar ya juu, Browser Title Tab, na risiti zote.</p>
        </div>

        {/* Tagline / Slogan */}
        <div>
          <label className="text-xs font-bold text-text2 block mb-1">Tagline / Slogan (Kaulimbiu)</label>
          <input 
            type="text" 
            value={formData.siteTagline || ''} 
            onChange={e => setFormData({ ...formData, siteTagline: e.target.value })}
            placeholder="e.g. Tanzania #1 Coding Education Platform"
            className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
          />
        </div>

        {/* Logo Upload Section */}
        <div className="space-y-2 pt-1 border-t border-theme">
          <label className="text-xs font-bold text-text2 block">Picha ya Logo (Logo Image):</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Direct Device Upload */}
            <label className="p-3 bg-bg3 border border-dashed border-theme hover:border-primary rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-text1">Pakia Picha kutoka Simu/PC</div>
                <div className="text-[10px] text-text3 truncate">PNG, JPG, SVG au WEBP</div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            {/* Direct URL Input */}
            <div className="flex flex-col justify-center">
              <input 
                type="url" 
                value={formData.logoUrl || ''} 
                onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="Au weka Image URL (https://...)"
                className="w-full h-11 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Default Logo Emoji */}
        <div>
          <label className="text-xs font-bold text-text2 block mb-1.5">
            Default Logo Emoji (Kama hakuna picha ya logo)
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <input 
              type="text" 
              value={formData.logoEmoji || '⚡'} 
              onChange={e => setFormData({ ...formData, logoEmoji: e.target.value })}
              maxLength={4}
              className="w-20 h-10 px-2 text-center text-lg bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
            <div className="flex items-center gap-1">
              {emojiPresets.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, logoEmoji: em }))}
                  className={cn(
                    "w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all",
                    formData.logoEmoji === em ? "border-primary bg-primary/10 scale-105" : "border-theme bg-bg3 hover:bg-card2"
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Save size={15} />
          {isSaving ? 'Inahifadhi Mabadiliko...' : 'Hifadhi Mabadiliko ya Branding'}
        </button>
      </form>
    </div>
  );
};

export const ThemeTab: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useApp();
  const [primaryColor, setPrimaryColor] = useState(siteSettings.primaryColor || '#4F46E5');
  const [accentColor, setAccentColor] = useState(siteSettings.accentColor || '#7C3AED');
  const [accent2Color, setAccent2Color] = useState(siteSettings.accent2Color || '#EC4899');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = [
    { name: 'Indigo Dream (Default)', primary: '#4F46E5', accent: '#7C3AED', accent2: '#EC4899' },
    { name: 'Emerald Tanzania', primary: '#059669', accent: '#10B981', accent2: '#F59E0B' },
    { name: 'Zanzibar Ocean Blue', primary: '#0284C7', accent: '#38BDF8', accent2: '#06B6D4' },
    { name: 'Ruby Flame & Crimson', primary: '#E11D48', accent: '#F43F5E', accent2: '#FB923C' },
    { name: 'Cyberpunk Purple Gold', primary: '#9333EA', accent: '#C084FC', accent2: '#EAB308' },
    { name: 'Modern Dark Slate & Cyan', primary: '#0EA5E9', accent: '#6366F1', accent2: '#14B8A6' }
  ];

  const handleApply = async (p: string, a: string, a2: string) => {
    setPrimaryColor(p);
    setAccentColor(a);
    setAccent2Color(a2);
    setIsSaving(true);
    await updateSiteSettings({ primaryColor: p, accentColor: a, accent2Color: a2 });
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSiteSettings({ primaryColor, accentColor, accent2Color });
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 bg-ok/10 border border-ok/20 text-ok text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle size={16} />
          <span>System colors updated across all screens in real-time!</span>
        </div>
      )}

      <div className="bg-card border border-theme p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2 border-b border-theme">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="font-heading font-black text-sm text-text1">System Color Palette</h3>
            <p className="text-[11px] text-text3">Dhibiti rangi nzima ya mfumo (Rangi Kuu na Vivuli)</p>
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <label className="text-xs font-bold text-text2 block mb-2">Chagua Palette ya Haraka (Preset Palettes)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApply(preset.primary, preset.accent, preset.accent2)}
                className="p-3 bg-bg3/60 border border-theme hover:border-primary rounded-xl flex items-center justify-between text-left transition-all active:scale-98"
              >
                <div>
                  <div className="font-bold text-xs text-text1">{preset.name}</div>
                  <div className="text-[10px] text-text3">{preset.primary}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full shadow-xs" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: preset.accent }} />
                  <div className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.accent2 }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <form onSubmit={handleSaveCustom} className="pt-3 border-t border-theme space-y-3">
          <div className="font-bold text-xs text-text1">Rangi Binafsi (Custom Hex Colors):</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-bg3/50 p-3 rounded-xl border border-theme">
              <label className="text-[11px] font-bold text-text3 uppercase block mb-1.5">Primary Color (Kuu)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={primaryColor} 
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs font-mono bg-bg border border-theme rounded-lg text-text1 uppercase"
                />
              </div>
            </div>

            <div className="bg-bg3/50 p-3 rounded-xl border border-theme">
              <label className="text-[11px] font-bold text-text3 uppercase block mb-1.5">Accent Color 1</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={accentColor} 
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={accentColor} 
                  onChange={e => setAccentColor(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs font-mono bg-bg border border-theme rounded-lg text-text1 uppercase"
                />
              </div>
            </div>

            <div className="bg-bg3/50 p-3 rounded-xl border border-theme">
              <label className="text-[11px] font-bold text-text3 uppercase block mb-1.5">Accent Color 2</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={accent2Color} 
                  onChange={e => setAccent2Color(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input 
                  type="text" 
                  value={accent2Color} 
                  onChange={e => setAccent2Color(e.target.value)}
                  className="flex-1 h-8 px-2 text-xs font-mono bg-bg border border-theme rounded-lg text-text1 uppercase"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Save size={15} />
            {isSaving ? 'Inahifadhi...' : 'Hifadhi Rangi Binafsi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const UssdApkTab: React.FC = () => {
  const { ussdSettings, updateUssdSettings } = useApp();
  const [formData, setFormData] = useState<UssdSettings>(ussdSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(ussdSettings);
  }, [ussdSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUssdSettings(formData);
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {success && (
        <div className="p-3 bg-ok/10 border border-ok/20 text-ok text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle size={16} />
          <span>USSD Push APK & Gateway settings updated successfully!</span>
        </div>
      )}

      {/* APK Overview Card */}
      <div className="bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-ok/30 p-5 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ok text-white flex items-center justify-center shadow-md">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-text1">USSD Push Automation APK Gateway</h3>
              <p className="text-[11px] text-text3">Huwezesha simu ya Android kutuma USSD push ya moja kwa moja kwa wateja (M-Pesa / Tigo Pesa / Airtel Money)</p>
            </div>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-black uppercase rounded-full border",
            formData.enabled ? "bg-ok/20 text-ok border-ok/30" : "bg-err/20 text-err border-err/30"
          )}>
            {formData.enabled ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        {formData.apkDownloadUrl && (
          <div className="flex items-center gap-2 pt-1">
            <a 
              href={formData.apkDownloadUrl} 
              target="_blank" 
              rel="noreferrer"
              className="h-9 px-4 bg-ok hover:bg-ok/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
            >
              <Download size={14} />
              Pakua APK Hapa ({formData.apkVersion || 'v2.4'})
            </a>
            <span className="text-[11px] text-text3 font-medium">Faili: {formData.apkName}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-theme p-5 rounded-2xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-theme pb-3">
          <div className="font-bold text-sm text-text1 flex items-center gap-2">
            <Smartphone size={16} className="text-primary" />
            <span>USSD Push APK Configuration</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text2">
            <span>Washa USSD Push:</span>
            <input 
              type="checkbox" 
              checked={formData.enabled} 
              onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-text2 block mb-1">APK File Name (Jina la Faili)</label>
            <input 
              type="text" 
              value={formData.apkName || ''} 
              onChange={e => setFormData({ ...formData, apkName: e.target.value })}
              placeholder="e.g. USSD_Push_Gateway.apk"
              className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text2 block mb-1">APK Version</label>
            <input 
              type="text" 
              value={formData.apkVersion || ''} 
              onChange={e => setFormData({ ...formData, apkVersion: e.target.value })}
              placeholder="e.g. 2.4.0"
              className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text2 block mb-1">APK Download Link (Link ya Kupakua USSD APK)</label>
          <input 
            type="url" 
            value={formData.apkDownloadUrl || ''} 
            onChange={e => setFormData({ ...formData, apkDownloadUrl: e.target.value })}
            placeholder="https://yoursite.com/downloads/ussd-push.apk"
            className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
          />
          <p className="text-[10px] text-text3 mt-1">Weka direct download URL kwa ajili ya admin au agent simu ya SIM gateway kuipakua.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-text2 block mb-1">USSD Push Code Prefix</label>
            <input 
              type="text" 
              value={formData.ussdPrefix || '*150*'} 
              onChange={e => setFormData({ ...formData, ussdPrefix: e.target.value })}
              placeholder="e.g. *150*00#"
              className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text2 block mb-1">Gateway Provider Name</label>
            <input 
              type="text" 
              value={formData.gatewayProvider || ''} 
              onChange={e => setFormData({ ...formData, gatewayProvider: e.target.value })}
              placeholder="e.g. Vodacom / Tigo Pesa Gateway"
              className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text2 block mb-1">Webhook URL (Callback baada ya Malipo ya USSD)</label>
          <input 
            type="url" 
            value={formData.webhookUrl || ''} 
            onChange={e => setFormData({ ...formData, webhookUrl: e.target.value })}
            placeholder="https://api.codznz.com/v1/ussd-callback"
            className="w-full h-10 px-3 text-xs bg-bg3 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Save size={15} />
          {isSaving ? 'Inahifadhi...' : 'Hifadhi Mipangilio ya USSD Push APK'}
        </button>
      </form>
    </div>
  );
};

export const AnalyticsTab: React.FC = () => {
  const { courses, tests, lectures, apps, orders: appOrders, users: appUsers, approveOrder } = useApp();
  const [orders, setOrders] = useState<Order[]>(appOrders);
  const [users, setUsers] = useState<UserProfile[]>(appUsers);

  useEffect(() => {
    setOrders(appOrders);
  }, [appOrders]);

  useEffect(() => {
    setUsers(appUsers);
  }, [appUsers]);

  useEffect(() => {
    let unsubOrders: (() => void) | undefined;
    let unsubUsers: (() => void) | undefined;

    try {
      unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        if (!snap.empty) {
          setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
        }
      }, (err) => {
        console.warn('Orders snapshot notice:', err.message);
      });
    } catch (e) {
      console.warn('Orders listener error:', e);
    }

    try {
      unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        if (!snap.empty) {
          setUsers(snap.docs.map(d => d.data() as UserProfile));
        }
      }, (err) => {
        console.warn('Users snapshot notice:', err.message);
      });
    } catch (e) {
      console.warn('Users listener error:', e);
    }

    return () => {
      unsubOrders?.();
      unsubUsers?.();
    };
  }, []);

  const totalRevenue = orders
    .filter(o => o.status === 'confirmed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const pendingRevenue = orders
    .filter(o => o.status === 'pending')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const rejectedCount = orders.filter(o => o.status === 'rejected').length;

  const handleApproveAllPending = async () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) return;
    if (!confirm(`Approve all ${pendingOrders.length} pending orders?`)) return;

    for (const order of pendingOrders) {
      approveOrder(order.id);
    }

    try {
      const batch = writeBatch(db);
      for (const order of pendingOrders) {
        batch.update(doc(db, 'orders', order.id), { status: 'confirmed' });
        const userUpdates: Record<string, any> = {};
        (order.itemIds || []).forEach(id => {
          userUpdates[`library.${id}`] = true;
        });
        batch.update(doc(db, 'users', order.userId), userUpdates);
      }
      await batch.commit();
    } catch (err) {
      console.warn('Batch approve fallback:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-primary via-indigo-600 to-accent p-4 rounded-3xl text-white shadow-lg space-y-1">
          <div className="flex items-center justify-between text-white/80 text-[11px] font-bold uppercase tracking-wider">
            <span>Gross Revenue</span>
            <DollarSign size={16} />
          </div>
          <div className="text-xl font-black">{formatPrice(totalRevenue)}</div>
          <div className="text-[10px] text-white/70 flex items-center gap-1">
            <TrendingUp size={12} className="text-ok" />
            <span>{confirmedCount} confirmed orders</span>
          </div>
        </div>

        <div className="bg-card border border-theme p-4 rounded-3xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-text3 text-[11px] font-bold uppercase tracking-wider">
            <span>Pending Pipeline</span>
            <Activity size={16} className="text-gold" />
          </div>
          <div className="text-xl font-black text-gold">{formatPrice(pendingRevenue)}</div>
          <div className="text-[10px] text-text3 flex items-center justify-between">
            <span>{pendingCount} awaiting approval</span>
            {pendingCount > 0 && (
              <button 
                onClick={handleApproveAllPending} 
                className="text-primary font-bold hover:underline"
              >
                Approve All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-card border border-theme p-3 rounded-2xl">
          <div className="text-base font-black text-text1">{users.length}</div>
          <div className="text-[9px] uppercase font-bold text-text3">Students</div>
        </div>
        <div className="bg-card border border-theme p-3 rounded-2xl">
          <div className="text-base font-black text-primary">{courses.length}</div>
          <div className="text-[9px] uppercase font-bold text-text3">Courses</div>
        </div>
        <div className="bg-card border border-theme p-3 rounded-2xl">
          <div className="text-base font-black text-gold">{tests.length}</div>
          <div className="text-[9px] uppercase font-bold text-text3">Tests</div>
        </div>
        <div className="bg-card border border-theme p-3 rounded-2xl">
          <div className="text-base font-black text-ok">{lectures.length}</div>
          <div className="text-[9px] uppercase font-bold text-text3">Lectures</div>
        </div>
      </div>

      {/* Orders Breakdown Card */}
      <div className="bg-card border border-theme p-5 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-widest text-text2 flex items-center gap-2">
            <BarChart3 size={15} className="text-primary" />
            <span>Orders Overview</span>
          </h3>
          <span className="text-[10px] text-text3 font-bold">{orders.length} Total</span>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-ok">Confirmed</span>
              <span>{confirmedCount} ({orders.length ? Math.round((confirmedCount / orders.length) * 100) : 0}%)</span>
            </div>
            <div className="w-full h-2 bg-card2 rounded-full overflow-hidden">
              <div className="h-full bg-ok rounded-full" style={{ width: `${orders.length ? (confirmedCount / orders.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-gold">Pending Review</span>
              <span>{pendingCount} ({orders.length ? Math.round((pendingCount / orders.length) * 100) : 0}%)</span>
            </div>
            <div className="w-full h-2 bg-card2 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: `${orders.length ? (pendingCount / orders.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-err">Rejected</span>
              <span>{rejectedCount} ({orders.length ? Math.round((rejectedCount / orders.length) * 100) : 0}%)</span>
            </div>
            <div className="w-full h-2 bg-card2 rounded-full overflow-hidden">
              <div className="h-full bg-err rounded-full" style={{ width: `${orders.length ? (rejectedCount / orders.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders List Preview */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-widest text-text3 px-1 flex items-center justify-between">
          <span>Recent Transactions</span>
          <span className="text-[10px] text-primary">{orders.slice(0, 3).length} showing</span>
        </h3>
        <div className="space-y-2">
          {orders.slice(0, 4).map(o => (
            <div key={o.id} className="bg-card border border-theme p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <div className="font-bold text-xs text-text1">{o.userName}</div>
                <div className="text-[10px] text-text3">{o.ref} • {new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-xs text-primary">{formatPrice(o.amount)}</div>
                <span className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block mt-0.5",
                  o.status === 'confirmed' ? "bg-ok/10 text-ok" : o.status === 'rejected' ? "bg-err/10 text-err" : "bg-gold/10 text-gold"
                )}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BroadcastTab: React.FC = () => {
  const { notifications, broadcastNotification, deleteNotification, deleteAllNotifications, lang } = useApp();

  const [notifType, setNotifType] = useState<'text' | 'image_text' | 'image_only' | 'offer'>('offer');
  const [title, setTitle] = useState('🔥 Punguzo Maalum la Mwisho wa Mwezi!');
  const [message, setMessage] = useState('Tumia kuponi leo kupata punguzo la 50% kwenye masomo yote ya Fullstack na Python.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80');
  const [offerCode, setOfferCode] = useState('CODZNZ50');
  const [offerDiscount, setOfferDiscount] = useState('50% OFF');
  const [actionText, setActionText] = useState('Tumia Ofa Sasa');
  const [actionUrl, setActionUrl] = useState('#courses');
  const [targetRole, setTargetRole] = useState<'all' | 'user' | 'developer' | 'admin'>('all');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const presets = [
    {
      label: '🔥 Ofa ya Punguzo 50%',
      type: 'offer' as const,
      title: '🔥 Ofa Maalum: 50% Punguzo la Masomo!',
      message: 'Jipatie kozi zote za Pro kwa nusu bei. Tumia kuponi CODZNZ50 wakati wa kulipia.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      offerCode: 'CODZNZ50',
      offerDiscount: '50% OFF',
      actionText: 'Tazama Masomo',
      actionUrl: '#courses'
    },
    {
      label: '🚀 Tangazo la Masomo Mapya',
      type: 'image_text' as const,
      title: '📚 Masomo Mapya ya React & Node.js Yameongezwa!',
      message: 'Tumeongeza sura mpya 10 za kujenga miradi halisi ya Fullstack. Anza kujifunza sasa.',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      offerCode: '',
      offerDiscount: '',
      actionText: 'Fungua Maktaba',
      actionUrl: '#library'
    },
    {
      label: '🎨 Bango la Picha Pekee (Poster)',
      type: 'image_only' as const,
      title: '',
      message: '',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      offerCode: '',
      offerDiscount: '',
      actionText: 'Tazama Shindano',
      actionUrl: '#lb'
    },
    {
      label: '⚡ Ujumbe wa Mfumo (Text Only)',
      type: 'text' as const,
      title: '⚡ Mfumo wa USSD Push Umeboreshwa!',
      message: 'Sasa unaweza kulipia kupitia M-Pesa na Tigo Pesa papo hapo bila kuweka kumbukumbu kwa mkono.',
      imageUrl: '',
      offerCode: '',
      offerDiscount: '',
      actionText: 'Lipia Sasa',
      actionUrl: '#pay'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setNotifType(p.type);
    setTitle(p.title);
    setMessage(p.message);
    setImageUrl(p.imageUrl);
    setOfferCode(p.offerCode);
    setOfferDiscount(p.offerDiscount);
    setActionText(p.actionText);
    setActionUrl(p.actionUrl);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notifType !== 'image_only' && !title.trim() && !message.trim()) {
      alert('Tafadhali weka kichwa cha habari au ujumbe!');
      return;
    }
    if ((notifType === 'image_only' || notifType === 'image_text') && !imageUrl.trim()) {
      alert('Tafadhali weka URL ya picha!');
      return;
    }

    setSending(true);
    const finalType = notifType === 'offer' ? 'offer' : notifType === 'image_only' ? 'image' : notifType === 'text' ? 'info' : 'update';

    const ok = await broadcastNotification({
      title: title.trim() || (notifType === 'image_only' ? 'Tangazo Jipya' : undefined),
      message: message.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      type: finalType,
      offerCode: offerCode.trim() || undefined,
      offerDiscount: offerDiscount.trim() || undefined,
      actionText: actionText.trim() || undefined,
      actionUrl: actionUrl.trim() || undefined,
      targetRole: targetRole
    });

    setSending(false);
    if (ok) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary/15 via-purple-500/10 to-amber-500/10 border border-theme p-5 rounded-3xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10 flex-wrap gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                <Bell size={18} />
              </div>
              <h2 className="text-base font-black text-text1">Broadcast & Notifications Studio</h2>
            </div>
            <p className="text-xs text-text3 max-w-md">
              Tuma matangazo, ofa za punguzo, ujumbe wa maandishi, picha au mabango ya maboresho kwa watumiaji na watengenezaji wote.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-theme text-xs font-bold text-text2 flex items-center gap-2">
            <Radio size={14} className="text-ok animate-pulse" />
            <span>{notifications.length} Taarifa Zilizopo</span>
          </div>
        </div>
      </div>

      {/* Quick Preset Selector */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black tracking-widest text-text3 px-1">
          Sampuli za Haraka (Quick Presets)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3 bg-card hover:bg-bg3 border border-theme hover:border-primary/40 rounded-2xl text-left transition-all group"
            >
              <div className="font-bold text-xs text-text1 group-hover:text-primary transition-colors">
                {p.label}
              </div>
              <div className="text-[10px] text-text3 mt-0.5 capitalize">
                Aina: {p.type.replace('_', ' ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Form (Left 7 cols) */}
        <div className="lg:col-span-7 bg-card border border-theme p-5 rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-text1 flex items-center gap-2">
            <Send size={16} className="text-primary" />
            <span>Tunga Tangazo / Notification Mpya</span>
          </h3>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Notification Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                Aina ya Notification (Format)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'offer', label: '🔥 Ofa & Punguzo', desc: 'Coupon + Picha' },
                  { id: 'image_text', label: '🖼️ Picha + Maandishi', desc: 'Banner & Text' },
                  { id: 'image_only', label: '🎨 Picha Pekee', desc: 'Poster Flyer' },
                  { id: 'text', label: '💬 Maandishi Tu', desc: 'Quick Text' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNotifType(t.id as any)}
                    className={cn(
                      "p-2.5 rounded-xl border text-left transition-all",
                      notifType === t.id 
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs" 
                        : "bg-bg3 border-theme text-text2 hover:text-text1"
                    )}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[9px] text-text3 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                Walengwa (Target Audience)
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Wote (All Users)' },
                  { id: 'user', label: 'Wanafunzi Tu' },
                  { id: 'developer', label: 'Developers Tu' },
                  { id: 'admin', label: 'Admins Tu' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setTargetRole(r.id as any)}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-xs font-bold border transition-all",
                      targetRole === r.id 
                        ? "bg-primary text-white border-primary" 
                        : "bg-bg3 border-theme text-text2 hover:text-text1"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title (for non image_only) */}
            {notifType !== 'image_only' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                  Kichwa cha Habari (Title)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Mfano: 🔥 Ofa ya Punguzo la 50%!"
                  className="w-full h-11 px-3 bg-bg3 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                  required
                />
              </div>
            )}

            {/* Image URL (for image_text, image_only, offer) */}
            {notifType !== 'text' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                    URL ya Picha / Bango (Image URL)
                  </label>
                  <span className="text-[10px] text-text3">Unsplash au kiungo cha picha</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-11 px-3 bg-bg3 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                    required={notifType === 'image_only'}
                  />
                  {imageUrl && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-theme shrink-0 bg-bg3">
                      <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Body (for non image_only) */}
            {notifType !== 'image_only' && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                  Maelezo / Ujumbe (Message Text)
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Andika maelezo kamili ya tangazo..."
                  className="w-full p-3 bg-bg3 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
                  required={notifType === 'text'}
                />
              </div>
            )}

            {/* Offer Specific Fields */}
            {notifType === 'offer' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-wider text-amber-500">
                    Kuponi ya Punguzo (Promo Code)
                  </label>
                  <input
                    type="text"
                    value={offerCode}
                    onChange={e => setOfferCode(e.target.value.toUpperCase())}
                    placeholder="CODZNZ50"
                    className="w-full h-10 px-3 bg-card border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-text1 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-wider text-amber-500">
                    Kiasi cha Punguzo (Badge)
                  </label>
                  <input
                    type="text"
                    value={offerDiscount}
                    onChange={e => setOfferDiscount(e.target.value)}
                    placeholder="50% OFF au BURE"
                    className="w-full h-10 px-3 bg-card border border-amber-500/30 rounded-xl text-xs font-bold text-text1 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Action Button Link (CTA) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                  Maandishi ya Kitufe (Button Text)
                </label>
                <input
                  type="text"
                  value={actionText}
                  onChange={e => setActionText(e.target.value)}
                  placeholder="Mfano: Fungua Somo"
                  className="w-full h-10 px-3 bg-bg3 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-wider text-text3">
                  Kiungo cha Kitufe (Action Link / Target)
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={e => setActionUrl(e.target.value)}
                  placeholder="#courses au https://..."
                  className="w-full h-10 px-3 bg-bg3 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{sending ? 'Inatuma Tangazo...' : 'Tuma Notification Papo Hapo 🚀'}</span>
            </button>

            {successMsg && (
              <div className="p-3 bg-ok/10 border border-ok/30 rounded-xl text-ok text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle size={15} />
                <span>Notification imetumwa kwa watumiaji wote na kuonekana papo hapo!</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Real-time Card Preview (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-widest text-text3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary" />
              <span>Muonekano wa Mtumiaji (Live Preview)</span>
            </h3>
            <span className="text-[10px] text-ok font-bold">Real-time</span>
          </div>

          {/* User Notification Card Preview */}
          <div className="bg-card border-2 border-dashed border-primary/40 rounded-3xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {notifType === 'offer' ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                    <Flame size={10} />
                    <span>{offerDiscount || 'OFA MAALUM'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                    <Sparkles size={10} />
                    <span>UPDATE</span>
                  </span>
                )}
                <span className="text-[10px] text-text3">Hivi punde</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>

            {title && (
              <h4 className="font-bold text-sm text-text1 leading-snug">
                {title}
              </h4>
            )}

            {imageUrl && notifType !== 'text' && (
              <div className="rounded-xl overflow-hidden border border-theme max-h-40 bg-bg3">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}

            {message && notifType !== 'image_only' && (
              <p className="text-xs text-text2 leading-relaxed">
                {message}
              </p>
            )}

            {notifType === 'offer' && offerCode && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase font-black text-amber-500">Kuponi</div>
                  <div className="font-mono font-black text-xs text-text1">{offerCode}</div>
                </div>
                <span className="h-7 px-2.5 bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center">
                  Nakili
                </span>
              </div>
            )}

            {(actionText || actionUrl) && (
              <div className="pt-2 border-t border-theme flex justify-end">
                <span className="h-7 px-3 rounded-lg bg-primary text-white text-[11px] font-bold flex items-center gap-1">
                  <span>{actionText || 'Fungua'}</span>
                  <ExternalLink size={11} />
                </span>
              </div>
            )}
          </div>

          {/* Slide Popup Toast Preview */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-black tracking-widest text-text3 px-1">
              Muonekano wa Slide Popup Toast
            </div>
            <div className="bg-card border border-primary/40 rounded-2xl p-3 shadow-lg flex items-center gap-3 relative overflow-hidden">
              <div className="w-1 bg-primary absolute left-0 top-0 bottom-0" />
              <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black uppercase text-primary">Taarifa Mpya</div>
                <div className="font-bold text-xs text-text1 truncate">{title || 'Tangazo la Picha'}</div>
                <div className="text-[10px] text-text3 truncate">{message || 'Bofya kutazama tangazo kamili'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sent Notifications List & Management */}
      <div className="space-y-3 pt-4 border-t border-theme">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-widest text-text3 flex items-center gap-2">
            <Layers size={14} className="text-primary" />
            <span>Orodha ya Notifications Zilizopo ({notifications.length})</span>
          </h3>

          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Je, una uhakika unataka kufuta taarifa zote zilizopo?')) {
                  deleteAllNotifications();
                }
              }}
              className="h-8 px-3 rounded-xl bg-err/10 hover:bg-err/20 text-err border border-err/20 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 size={13} />
              <span>Futa Zote (Clear All)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-card border border-theme rounded-2xl p-3.5 flex items-start justify-between gap-3 shadow-xs">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                    {notif.type}
                  </span>
                  <span className="text-[10px] text-text3">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h4 className="font-bold text-xs text-text1 truncate">{notif.title || '(Picha/Poster)'}</h4>
                {notif.message && <p className="text-[11px] text-text3 line-clamp-2">{notif.message}</p>}
                {notif.imageUrl && (
                  <span className="text-[10px] text-primary flex items-center gap-1 font-bold">
                    <ImageIcon size={11} />
                    <span>Ina Picha</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => deleteNotification(notif.id)}
                className="w-8 h-8 rounded-xl bg-bg3 hover:bg-err/10 text-text3 hover:text-err border border-theme flex items-center justify-center transition-colors shrink-0"
                title="Futa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- DEVELOPER REQUESTS & PACKAGES TAB ---
export const DeveloperManagementTab: React.FC = () => {
  const { 
    developerApplications, 
    developerPackages, 
    approveDeveloperApplication, 
    rejectDeveloperApplication, 
    addDeveloperPackage, 
    updateDeveloperPackage, 
    deleteDeveloperPackage,
    lang 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'packages'>('requests');
  const [rejectModalAppId, setRejectModalAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isCreatingPkg, setIsCreatingPkg] = useState(false);
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('15000');
  const [newPkgCycle, setNewPkgCycle] = useState<'one-time' | 'monthly' | 'yearly'>('monthly');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgMaxApps, setNewPkgMaxApps] = useState('10');
  const [newPkgFeatures, setNewPkgFeatures] = useState('Uchapishaji wa Apps 10, Asilimia 80 ya Mapato, Beji ya Verified Developer');
  const [newPkgIsPopular, setNewPkgIsPopular] = useState(false);

  const pendingApps = developerApplications.filter(a => a.status === 'pending');

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) return;

    addDeveloperPackage({
      name: newPkgName,
      price: parseInt(newPkgPrice) || 0,
      billingCycle: newPkgCycle,
      desc: newPkgDesc || 'Kifurushi rasmi cha kuweka programu na masomo kwenye jukwaa.',
      maxApps: parseInt(newPkgMaxApps) || 5,
      features: newPkgFeatures.split(',').map(s => s.trim()).filter(Boolean),
      isPopular: newPkgIsPopular,
      active: true
    });

    setIsCreatingPkg(false);
    setNewPkgName('');
    setNewPkgPrice('15000');
    setNewPkgDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'requests' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-card text-text3 hover:text-text1 border border-theme'
          }`}
        >
          <UserCheck size={15} />
          <span>Maombi ya Developers ({pendingApps.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'packages' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-card text-text3 hover:text-text1 border border-theme'
          }`}
        >
          <Tag size={15} />
          <span>Vifurushi vya Developer ({developerPackages.length})</span>
        </button>
      </div>

      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-text1">Maombi ya Wasanidi (Developer Applications)</h3>
            <span className="text-xs text-text3">Jumla: {developerApplications.length}</span>
          </div>

          {developerApplications.length === 0 ? (
            <div className="p-8 text-center bg-card border border-theme rounded-2xl text-text3 text-xs">
              Hakuna maombi ya developer yaliyowasilishwa bado.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {developerApplications.map(app => (
                <div key={app.id} className="bg-card border border-theme rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        app.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-text1">{app.userName}</h4>
                      <span className="text-xs text-text3">({app.userEmail})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-text2 pt-1">
                      <div>
                        <span className="text-text3 text-[10px] block uppercase">Simu / Malipo:</span>
                        <span className="font-bold">{app.userPhone}</span>
                      </div>
                      <div>
                        <span className="text-text3 text-[10px] block uppercase">Kifurushi:</span>
                        <span className="font-bold text-primary">{app.packageName} ({formatPrice(app.packagePrice)})</span>
                      </div>
                      <div>
                        <span className="text-text3 text-[10px] block uppercase">Ref ya Malipo:</span>
                        <span className="font-mono text-xs">{app.paymentRef || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-text3 text-[10px] block uppercase">Portfolio:</span>
                        {app.portfolioUrl ? (
                          <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs truncate">
                            <span>Fungua</span>
                            <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-text3">Hakuna</span>}
                      </div>
                    </div>

                    {app.devBio && (
                      <p className="text-xs text-text3 italic pt-1 bg-card2 p-2 rounded-xl border border-theme">
                        "{app.devBio}"
                      </p>
                    )}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => approveDeveloperApplication(app.id)}
                        className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
                      >
                        <Check size={14} />
                        <span>Idhinisha (Approve)</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectModalAppId(app.id);
                          setRejectReason('');
                        }}
                        className="h-9 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <X size={14} />
                        <span>Kataa</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rejection Modal */}
          {rejectModalAppId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
              <div className="bg-card border border-theme rounded-2xl p-5 max-w-sm w-full space-y-3">
                <h4 className="text-sm font-bold text-text1">Sababu ya Kukataa Ombi</h4>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Eleza sababu (mfano: Namba ya malipo haikupokelewa)..."
                  className="w-full p-2.5 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRejectModalAppId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-text3 hover:text-text1"
                  >
                    Ghairi
                  </button>
                  <button
                    onClick={() => {
                      if (rejectModalAppId) {
                        rejectDeveloperApplication(rejectModalAppId, rejectReason);
                        setRejectModalAppId(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    Thibitisha Kukataa
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-text1">Vifurushi vya Developer (Developer Packages)</h3>
              <p className="text-xs text-text3">Weka bei na mipaka ya uchapishaji wa programu</p>
            </div>
            <button
              onClick={() => setIsCreatingPkg(!isCreatingPkg)}
              className="h-9 px-3.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>{isCreatingPkg ? 'Funga Fomu' : 'Tengeneza Kifurushi Kipya'}</span>
            </button>
          </div>

          {isCreatingPkg && (
            <form onSubmit={handleCreatePackage} className="bg-card border border-theme rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
              <h4 className="text-xs font-black uppercase text-primary">Kifurushi Kipya cha Developer</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Jina la Kifurushi</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Pro Studio Monthly"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Bei (TSh)</label>
                  <input
                    type="number"
                    required
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Muda wa Malipo</label>
                  <select
                    value={newPkgCycle}
                    onChange={(e) => setNewPkgCycle(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  >
                    <option value="monthly">Monthly (Kila Mwezi)</option>
                    <option value="yearly">Yearly (Kila Mwaka)</option>
                    <option value="one-time">One-Time (Kudumu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Kikomo cha Apps (Max Apps)</label>
                  <input
                    type="number"
                    value={newPkgMaxApps}
                    onChange={(e) => setNewPkgMaxApps(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Maelezo Mafupi</label>
                  <input
                    type="text"
                    placeholder="Inafaa kwa wasanidi binafsi..."
                    value={newPkgDesc}
                    onChange={(e) => setNewPkgDesc(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text2 block mb-1">Vipengele (Tenganisha kwa mkato ',')</label>
                <input
                  type="text"
                  value={newPkgFeatures}
                  onChange={(e) => setNewPkgFeatures(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-text2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPkgIsPopular}
                    onChange={(e) => setNewPkgIsPopular(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span>Weka Beji ya "POPULAR"</span>
                </label>
                <button
                  type="submit"
                  className="h-9 px-4 bg-primary text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  Hifadhi Kifurushi
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {developerPackages.map(pkg => (
              <div key={pkg.id} className="bg-card border border-theme rounded-2xl p-4 shadow-sm space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-sm text-text1">{pkg.name}</h4>
                    <span className="text-xs text-primary font-black">{formatPrice(pkg.price)}</span>
                    <span className="text-[10px] text-text3 ml-1">/ {pkg.billingCycle}</span>
                  </div>
                  <button
                    onClick={() => deleteDeveloperPackage(pkg.id)}
                    className="p-1.5 text-text3 hover:text-err hover:bg-card2 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-xs text-text3">{pkg.desc}</p>

                <div className="space-y-1 pt-2 border-t border-theme text-xs text-text2">
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COUPONS & LEARNING BUNDLES TAB ---
export const CouponsAndBundlesTab: React.FC = () => {
  const { 
    coupons, 
    bundles, 
    courses, 
    tests,
    lectures,
    addCoupon, 
    deleteCoupon, 
    updateBundles, 
    addBundle,
    updateBundle,
    deleteBundle,
    lang 
  } = useApp();

  const allItems = [...courses, ...tests, ...lectures];

  const [subTab, setSubTab] = useState<'coupons' | 'bundles'>('coupons');
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [targetType, setTargetType] = useState<'all' | 'single_course'>('all');
  const [targetId, setTargetId] = useState('');
  const [maxUses, setMaxUses] = useState('100');
  const [expiryDays, setExpiryDays] = useState('30');

  // --- BUNDLE MANAGEMENT STATE ---
  const [isAddingBundle, setIsAddingBundle] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [bundleTitle, setBundleTitle] = useState('');
  const [bundleDesc, setBundleDesc] = useState('');
  const [bundleIcon, setBundleIcon] = useState('🎓');
  const [bundleLevel, setBundleLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [bundleDuration, setBundleDuration] = useState('30+ Masomo (Vyeti 2)');
  const [bundlePrice, setBundlePrice] = useState('30000');
  const [bundleOriginalPrice, setBundleOriginalPrice] = useState('50000');
  const [bundleBadge, setBundleBadge] = useState('Inayopendwa Zaidi');
  const [bundleSkills, setBundleSkills] = useState('HTML, CSS, JavaScript, React');
  const [bundleCoverImg, setBundleCoverImg] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<'all' | 'courses' | 'tests' | 'lectures'>('all');
  const [bundleDeleteConfirmId, setBundleDeleteConfirmId] = useState<string | null>(null);

  const BUNDLE_PRESETS = [
    {
      title: 'Full Stack Web Developer Mastery Path',
      icon: '🌐',
      level: 'All Levels' as const,
      duration: '45+ Masomo (Vyeti 2)',
      price: '35000',
      originalPrice: '55000',
      badge: 'Inayopendwa Zaidi',
      skills: 'HTML, CSS, JavaScript, React, Node.js, Git',
      desc: 'Njia kamili ya kugeuka kuwa mhandisi wa programu kuanzia HTML/CSS, JavaScript, React hadi Node.js na mifumo ya kisasa.',
      keywords: ['html', 'css', 'javascript', 'react', 'web', 'node']
    },
    {
      title: 'Python, Data Science & AI Specialist Path',
      icon: '🐍',
      level: 'All Levels' as const,
      duration: '35+ Masomo (Cheti 1)',
      price: '30000',
      originalPrice: '50000',
      badge: 'Hot Deal',
      skills: 'Python, Pandas, Machine Learning, AI, APIs',
      desc: 'Jifunze lugha yenye soko kubwa duniani kwa uchambuzi wa data, uendeshaji wa mifumo na ujasusi mnemba (AI).',
      keywords: ['python', 'data', 'ai', 'science', 'machine']
    },
    {
      title: 'Mobile App Developer Path (Android & iOS)',
      icon: '📱',
      level: 'Intermediate' as const,
      duration: '30+ Masomo (Cheti 1)',
      price: '38000',
      originalPrice: '60000',
      badge: 'Ofa ya Wiki',
      skills: 'Flutter, React Native, Firebase, App Store Deploy',
      desc: 'Kuanzia mwanzo hadi kuchapisha program za simu kwenye Google Play Store na Apple App Store kwa ustadi.',
      keywords: ['mobile', 'android', 'flutter', 'react native', 'app']
    },
    {
      title: 'Backend & Cloud Systems Path',
      icon: '⚡',
      level: 'Advanced' as const,
      duration: '40+ Masomo (Vyeti 2)',
      price: '40000',
      originalPrice: '65000',
      badge: 'Kiwango cha Juu',
      skills: 'Node.js, Docker, Linux, SQL, MongoDB, Cloud APIs',
      desc: 'Jenga mifumo thabiti ya seva, hifadhidata za kisasa na miundombinu ya wingu (Cloud Architecture).',
      keywords: ['backend', 'sql', 'database', 'node', 'api', 'cloud']
    }
  ];

  const resetBundleForm = () => {
    setEditingBundleId(null);
    setBundleTitle('');
    setBundleDesc('');
    setBundleIcon('🎓');
    setBundleLevel('All Levels');
    setBundleDuration('30+ Masomo (Vyeti 2)');
    setBundlePrice('30000');
    setBundleOriginalPrice('50000');
    setBundleBadge('');
    setBundleSkills('');
    setBundleCoverImg('');
    setSelectedCourseIds([]);
    setIsAddingBundle(false);
    setBundleDeleteConfirmId(null);
  };

  const startEditBundle = (bundle: LearningBundle) => {
    setEditingBundleId(bundle.id);
    setBundleTitle(bundle.title);
    setBundleDesc(bundle.desc);
    setBundleIcon(bundle.icon);
    setBundleLevel(bundle.level);
    setBundleDuration(bundle.duration);
    setBundlePrice(bundle.price.toString());
    setBundleOriginalPrice(bundle.originalPrice.toString());
    setBundleBadge(bundle.badge || '');
    setBundleSkills(bundle.skills ? bundle.skills.join(', ') : '');
    setBundleCoverImg(bundle.coverImg || '');
    setSelectedCourseIds(bundle.courseIds || []);
    setIsAddingBundle(true);
  };

  const handleAddOrUpdateBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleTitle.trim()) return;

    const skillsArray = bundleSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const bundlePayload = {
      title: bundleTitle.trim(),
      desc: bundleDesc.trim() || 'Mafunzo ya kina ya kukupa uzoefu halisi.',
      icon: bundleIcon.trim() || '🎓',
      coverImg: bundleCoverImg.trim() || undefined,
      level: bundleLevel,
      duration: bundleDuration.trim() || `${selectedCourseIds.length} Masomo`,
      courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : (courses[0] ? [courses[0].id] : []),
      price: parseInt(bundlePrice) || 25000,
      originalPrice: parseInt(bundleOriginalPrice) || 40000,
      badge: bundleBadge.trim() || undefined,
      skills: skillsArray.length > 0 ? skillsArray : ['Coding', 'Development']
    };

    if (editingBundleId) {
      updateBundle(editingBundleId, bundlePayload);
    } else {
      addBundle(bundlePayload);
    }

    resetBundleForm();
  };

  const toggleCourseSelection = (id: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const applyPreset = (preset: typeof BUNDLE_PRESETS[0]) => {
    setBundleTitle(preset.title);
    setBundleIcon(preset.icon);
    setBundleLevel(preset.level);
    setBundleDuration(preset.duration);
    setBundlePrice(preset.price);
    setBundleOriginalPrice(preset.originalPrice);
    setBundleBadge(preset.badge);
    setBundleSkills(preset.skills);
    setBundleDesc(preset.desc);

    const matched = allItems
      .filter(item => preset.keywords.some(kw => 
        item.title.toLowerCase().includes(kw.toLowerCase()) || 
        (item.desc && item.desc.toLowerCase().includes(kw.toLowerCase()))
      ))
      .map(i => i.id);
    if (matched.length > 0) {
      setSelectedCourseIds(matched);
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    addCoupon({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: parseInt(discountValue) || 10,
      targetType,
      targetId: targetType === 'single_course' ? targetId : undefined,
      maxUses: parseInt(maxUses) || 50,
      expiresAt: Date.now() + (parseInt(expiryDays) || 30) * 86400000,
      active: true
    });

    setIsAddingCoupon(false);
    setCode('');
  };

  // Filter items for bundle builder
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(itemSearch.toLowerCase()) || 
      (item.desc && item.desc.toLowerCase().includes(itemSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (itemCategoryFilter === 'courses') return courses.some(c => c.id === item.id);
    if (itemCategoryFilter === 'tests') return tests.some(t => t.id === item.id);
    if (itemCategoryFilter === 'lectures') return lectures.some(l => l.id === item.id);
    return true;
  });

  const selectedItemsSum = allItems
    .filter(item => selectedCourseIds.includes(item.id))
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const priceNum = parseInt(bundlePrice) || 0;
  const origPriceNum = parseInt(bundleOriginalPrice) || 0;
  const discountPercent = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-theme pb-2">
        <button
          onClick={() => setSubTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'coupons' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-card text-text3 hover:text-text1 border border-theme'
          }`}
        >
          <Tag size={15} />
          <span>Kuponi & Promosheni ({coupons.length})</span>
        </button>
        <button
          onClick={() => setSubTab('bundles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'bundles' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-card text-text3 hover:text-text1 border border-theme'
          }`}
        >
          <Layers size={15} />
          <span>Learning Bundles ({bundles.length})</span>
        </button>
      </div>

      {subTab === 'coupons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-text1">Msimbo wa Punguzo & Kuponi (Coupons)</h3>
              <p className="text-xs text-text3">Tengeneza ofa za punguzo kwa kozi zote au somo moja mahususi</p>
            </div>
            <button
              onClick={() => setIsAddingCoupon(!isAddingCoupon)}
              className="h-9 px-3.5 bg-primary text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus size={14} />
              <span>{isAddingCoupon ? 'Funga Fomu' : 'Ongeza Kuponi Mpya'}</span>
            </button>
          </div>

          {isAddingCoupon && (
            <form onSubmit={handleAddCoupon} className="bg-card border border-theme rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
              <h4 className="text-xs font-black uppercase text-primary">Tengeneza Kuponi ya Punguzo</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Msimbo (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: KARIBU50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 text-xs font-mono uppercase bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Aina ya Punguzo</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  >
                    <option value="percentage">Asilimia (%) ya Bei</option>
                    <option value="fixed">Kiwango Maalumu (TSh)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">
                    {discountType === 'percentage' ? 'Asilimia (%)' : 'Kiasi (TSh)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Inatumika Kwenye</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  >
                    <option value="all">Kozi & Bidhaa Zote</option>
                    <option value="single_course">Somo Maalum Tu</option>
                  </select>
                </div>

                {targetType === 'single_course' && (
                  <div>
                    <label className="text-[11px] font-bold text-text2 block mb-1">Chagua Somo</label>
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full h-9 px-2 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                    >
                      <option value="">Chagua kozi...</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Kikomo cha Matumizi (Max)</label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Muda wa Kuisha (Siku)</label>
                  <input
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-9 px-4 bg-primary text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
                >
                  Hifadhi Kuponi
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {coupons.map(cpn => (
              <div key={cpn.id} className="bg-card border border-theme rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-black text-primary px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                      {cpn.code}
                    </span>
                    <div className="text-xs font-bold text-text1 mt-1">
                      {cpn.discountType === 'percentage' ? `${cpn.discountValue}% PUNGUZO` : `${formatPrice(cpn.discountValue)} PUNGUZO`}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCoupon(cpn.id)}
                    className="p-1 text-text3 hover:text-err hover:bg-card2 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="text-[11px] text-text3 space-y-0.5">
                  <div>Upeo: {cpn.targetType === 'all' ? 'Bidhaa Zote' : 'Somo Maalum'}</div>
                  <div>Imetumika: {cpn.usedCount} / {cpn.maxUses || '∞'} mara</div>
                  {cpn.expiresAt && (
                    <div>Inaisha: {new Date(cpn.expiresAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'bundles' && (
        <div className="space-y-5">
          {/* Header & Add Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-theme shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="text-primary" size={18} />
                <h3 className="text-sm font-black text-text1">Learning Bundles & Paths</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {bundles.length} Zipo
                </span>
              </div>
              <p className="text-xs text-text3 mt-0.5">
                Mifumo iliyounganishwa ya masomo kadhaa kwa pamoja kwa bei ya ofa na vyeti vingi
              </p>
            </div>
            <button
              onClick={() => {
                if (isAddingBundle) {
                  resetBundleForm();
                } else {
                  resetBundleForm();
                  setIsAddingBundle(true);
                }
              }}
              className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shrink-0"
            >
              {isAddingBundle ? <X size={14} /> : <Plus size={14} />}
              <span>{isAddingBundle ? (lang === 'en' ? 'Close Form' : 'Funga Fomu') : (lang === 'en' ? 'Add Learning Bundle' : 'Ongeza Bundle Mpya')}</span>
            </button>
          </div>

          {/* Bundle Creator / Editor Form */}
          {isAddingBundle && (
            <form onSubmit={handleAddOrUpdateBundle} className="bg-card border-2 border-primary/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div>
                  <h4 className="text-sm font-black text-primary flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>{editingBundleId ? 'Hariri Njia/Bundle ya Mafunzo' : 'Tengeneza Njia/Bundle Mpya ya Mafunzo'}</span>
                  </h4>
                  <p className="text-[11px] text-text3">Unganisha masomo kadhaa, weka bei ya ofa, na ujuzi watakaopata wanafunzi</p>
                </div>
                <button
                  type="button"
                  onClick={resetBundleForm}
                  className="p-1.5 text-text3 hover:text-text1 hover:bg-card2 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Quick Preset Templates */}
              {!editingBundleId && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-text2 uppercase tracking-wide flex items-center gap-1">
                    <span>⚡ Chagua Mfano wa Haraka (Quick Templates):</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUNDLE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="text-left p-2.5 rounded-xl border border-theme bg-card2 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="text-base mb-1">{preset.icon}</div>
                        <div className="text-xs font-bold text-text1 group-hover:text-primary line-clamp-1">{preset.title}</div>
                        <div className="text-[10px] text-primary font-bold">{formatPrice(parseInt(preset.price))}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-text2 block mb-1">
                    Jina la Njia / Bundle <span className="text-err">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Full Stack Web Developer Mastery Path"
                    value={bundleTitle}
                    onChange={(e) => setBundleTitle(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Alama / Emoji</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={bundleIcon}
                      onChange={(e) => setBundleIcon(e.target.value)}
                      className="w-14 h-9 text-center text-base bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                    />
                    <div className="flex gap-1 overflow-x-auto py-1">
                      {['🌐', '🐍', '📱', '🚀', '⚡', '🔒', '🎨', '🤖'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setBundleIcon(emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-card2 hover:bg-card border border-theme text-xs"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Kiwango (Level)</label>
                  <select
                    value={bundleLevel}
                    onChange={(e) => setBundleLevel(e.target.value as any)}
                    className="w-full h-9 px-2 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  >
                    <option value="All Levels">Ngazi Zote (All Levels)</option>
                    <option value="Beginner">Waanzilishi (Beginner)</option>
                    <option value="Intermediate">Wastani (Intermediate)</option>
                    <option value="Advanced">Wabobezi (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Muda & Vyeti (Duration)</label>
                  <input
                    type="text"
                    placeholder="Mfano: 45+ Masomo (Vyeti 2)"
                    value={bundleDuration}
                    onChange={(e) => setBundleDuration(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">
                    Bei ya Ofa (TSh) <span className="text-err">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="35000"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">
                    Bei ya Awali (TSh)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="55000"
                      value={bundleOriginalPrice}
                      onChange={(e) => setBundleOriginalPrice(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute right-2 top-2 text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Lebo Maalumu (Badge)</label>
                  <input
                    type="text"
                    placeholder="Mfano: Inayopendwa Zaidi au Hot Deal"
                    value={bundleBadge}
                    onChange={(e) => setBundleBadge(e.target.value)}
                    className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Description & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text2 block mb-1">Maelezo ya Njia/Bundle</label>
                  <textarea
                    rows={2}
                    placeholder="Maelezo mafupi yanayoelezea lengo na manufaa ya njia hii..."
                    value={bundleDesc}
                    onChange={(e) => setBundleDesc(e.target.value)}
                    className="w-full p-2.5 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-text2 block mb-1">Ujuzi Watakaopata (Tenganisha kwa koma)</label>
                    <input
                      type="text"
                      placeholder="HTML, CSS, JavaScript, React, Node.js"
                      value={bundleSkills}
                      onChange={(e) => setBundleSkills(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-text2 block mb-1">Picha ya Jalada (Cover Image URL - Hiari)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={bundleCoverImg}
                      onChange={(e) => setBundleCoverImg(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Course Selection Section */}
              <div className="border border-theme rounded-xl p-3.5 bg-card2/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-black text-text1 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-primary" />
                      <span>Masomo Yaliyojumuishwa Kwenye Bundle ({selectedCourseIds.length} Yamechaguliwa)</span>
                    </label>
                    <p className="text-[11px] text-text3">
                      Mwanafunzi akinunua bundle hii atapata ufikiaji wa masomo yote yaliyotiwa alama ya vema
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourseIds(allItems.map(i => i.id))}
                      className="text-[11px] font-bold text-primary hover:underline px-2 py-1"
                    >
                      Chagua Yote
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseIds([])}
                      className="text-[11px] font-bold text-text3 hover:text-err px-2 py-1"
                    >
                      Ondoa Yote
                    </button>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative flex-1 w-full">
                    <Search size={13} className="absolute left-2.5 top-2.5 text-text3" />
                    <input
                      type="text"
                      placeholder="Tafuta somo kwa jina..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 text-xs bg-card border border-theme rounded-lg text-text1 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    {(['all', 'courses', 'tests', 'lectures'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setItemCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                          itemCategoryFilter === cat
                            ? 'bg-primary text-white'
                            : 'bg-card text-text3 hover:text-text1 border border-theme'
                        }`}
                      >
                        {cat === 'all' ? 'Zote' : cat === 'courses' ? 'Kozi' : cat === 'tests' ? 'Mitihani' : 'Mihadhara'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Combined Value Info */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="text-text2">
                    Thamani kamili (ukinunua moja moja):{' '}
                    <span className="font-bold text-text1">{formatPrice(selectedItemsSum)}</span>
                  </div>
                  <div className="text-primary font-bold">
                    Bei ya Bundle: {formatPrice(priceNum)}
                    {selectedItemsSum > priceNum && (
                      <span className="ml-1.5 text-ok font-black">
                        (Mwanafunzi anaokoa {formatPrice(selectedItemsSum - priceNum)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Selector Grid */}
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-6 text-xs text-text3">Hakuna somo linalolingana na utafutaji wako</div>
                  ) : (
                    filteredItems.map(item => {
                      const isSelected = selectedCourseIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCourseSelection(item.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-sm text-text1'
                              : 'bg-card border-theme hover:border-primary/40 text-text2'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                              isSelected ? 'bg-primary border-primary text-white' : 'border-theme bg-card2'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-text1 truncate">{item.title}</div>
                              <div className="text-[10px] text-text3">
                                {courses.some(c => c.id === item.id) ? 'Kozi' : tests.some(t => t.id === item.id) ? 'Mtihani' : 'Mhadhara'} • ID: {item.id}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-primary font-mono shrink-0 ml-2">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme">
                <button
                  type="button"
                  onClick={resetBundleForm}
                  className="h-9 px-4 bg-card2 hover:bg-card border border-theme text-text2 rounded-xl text-xs font-bold transition-all"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                >
                  <Check size={14} />
                  <span>{editingBundleId ? 'Hifadhi Mabadiliko' : 'Hifadhi Njia/Bundle Mpya'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Bundles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundles.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-card border border-theme rounded-2xl">
                <Layers size={36} className="mx-auto text-text3 mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-text1">Hakuna Learning Bundles Bado</h4>
                <p className="text-xs text-text3 mt-1 mb-4">Bonyeza kitufe hapo juu kuunda njia yako ya kwanza ya mafunzo</p>
                <button
                  onClick={() => setIsAddingBundle(true)}
                  className="h-9 px-4 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Ongeza Bundle ya Kwanza</span>
                </button>
              </div>
            ) : (
              bundles.map(bundle => {
                const bundleCourses = allItems.filter(item => bundle.courseIds.includes(item.id));
                const discount = bundle.originalPrice > bundle.price 
                  ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)
                  : 0;

                return (
                  <div key={bundle.id} className="bg-card border border-theme rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative flex flex-col justify-between hover:border-primary/40 transition-all">
                    <div className="space-y-2.5">
                      {/* Top bar with Icon, Title, and Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-card2 border border-theme text-2xl flex items-center justify-center shrink-0 shadow-inner">
                            {bundle.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              {bundle.badge && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  {bundle.badge}
                                </span>
                              )}
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-card2 text-text3 border border-theme">
                                {bundle.level}
                              </span>
                            </div>
                            <h4 className="font-black text-sm text-text1 leading-snug line-clamp-2">{bundle.title}</h4>
                          </div>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEditBundle(bundle)}
                            title="Hariri Bundle"
                            className="p-1.5 text-text3 hover:text-primary hover:bg-card2 rounded-lg transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setBundleDeleteConfirmId(bundle.id)}
                            title="Futa Bundle"
                            className="p-1.5 text-text3 hover:text-err hover:bg-card2 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Pricing Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-primary font-mono">
                          {formatPrice(bundle.price)}
                        </span>
                        {bundle.originalPrice > bundle.price && (
                          <span className="text-xs text-text3 line-through font-mono">
                            {formatPrice(bundle.originalPrice)}
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-ok/10 text-ok border border-ok/20">
                            -{discount}%
                          </span>
                        )}
                        <span className="text-[11px] text-text3 ml-auto font-medium">
                          {bundle.duration}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-text3 line-clamp-2">{bundle.desc}</p>

                      {/* Included Items with Titles */}
                      <div className="text-[11px] text-text2 bg-card2 p-2.5 rounded-xl border border-theme space-y-1.5">
                        <div className="font-bold text-text1 flex items-center justify-between">
                          <span>Inajumuisha Masomo ({bundleCourses.length || bundle.courseIds.length}):</span>
                          <span className="text-[10px] text-primary font-bold">
                            Thamani: {formatPrice(bundleCourses.reduce((sum, item) => sum + (item.price || 0), 0))}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bundleCourses.length > 0 ? (
                            bundleCourses.map(item => (
                              <span key={item.id} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-card border border-theme text-text2">
                                {item.title}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-text3">
                              {bundle.courseIds.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Skills tags */}
                      {bundle.skills && bundle.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {bundle.skills.map((skill, i) => (
                            <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/5 text-primary/80 border border-primary/10">
                              #{skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Confirmation Popup */}
                    {bundleDeleteConfirmId === bundle.id && (
                      <div className="mt-3 p-3 bg-err/10 border border-err/30 rounded-xl space-y-2 animate-in fade-in">
                        <div className="text-xs font-bold text-err">
                          Je, una uhakika unataka kufuta njia/bundle hii?
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setBundleDeleteConfirmId(null)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-card border border-theme rounded-lg text-text2"
                          >
                            Ghairi
                          </button>
                          <button
                            onClick={() => {
                              deleteBundle(bundle.id);
                              setBundleDeleteConfirmId(null);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold bg-err text-white rounded-lg active:scale-95 transition-transform"
                          >
                            Ndio, Futa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminPage: React.FC = () => {
  const { orders, notifications, developerApplications } = useApp();
  const [tab, setTab] = useState<'analytics' | 'orders' | 'broadcast' | 'branding' | 'theme' | 'ussd_apk' | 'users' | 'developer_mgmt' | 'coupons_bundles' | 'content' | 'apps' | 'banners' | 'developer'>('analytics');
  const [pendingCount, setPendingCount] = useState(() => orders.filter(o => o.status === 'pending').length);
  const pendingDevsCount = developerApplications.filter(a => a.status === 'pending').length;

  useEffect(() => {
    setPendingCount(orders.filter(o => o.status === 'pending').length);
  }, [orders]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
      unsub = onSnapshot(q, (snap) => {
        setPendingCount(snap.size);
      }, (err) => {
        console.warn('Pending orders snapshot notice:', err.message);
      });
    } catch (e) {
      console.warn('AdminPage snapshot catch:', e);
    }
    return () => unsub?.();
  }, []);

  const tabs = [
    { id: 'analytics', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingCount },
    { id: 'developer_mgmt', label: 'Developer Requests', icon: UserCheck, badge: pendingDevsCount },
    { id: 'coupons_bundles', label: 'Coupons & Bundles', icon: Tag },
    { id: 'broadcast', label: 'Notifications & Broadcast', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'branding', label: 'Website & Logo', icon: Globe },
    { id: 'theme', label: 'System Colors', icon: Palette },
    { id: 'ussd_apk', label: 'USSD Push APK', icon: Radio },
    { id: 'users', label: 'Users & Roles', icon: UserIcon },
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'apps', label: 'Apps', icon: Bolt },
    { id: 'banners', label: 'Banners', icon: Trophy },
    { id: 'developer', label: 'Developer Studio', icon: Code2 },
  ];

  return (
    <div className="page-anim space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-theme -mx-4 px-4 sticky top-[60px] bg-theme z-20 pt-2">
        {tabs.map(t => {
           const Icon = t.icon;
           return (
             <button
               key={t.id}
               onClick={() => setTab(t.id as any)}
               className={cn(
                 "flex items-center gap-2 px-4 h-10 rounded-xl whitespace-nowrap text-xs font-bold transition-all shrink-0",
                 tab === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card text-text3 hover:text-text2 border border-theme"
               )}
             >
                <Icon size={14} />
                <span>{t.label}</span>
                {(t.badge || 0) > 0 && (
                  <span className="bg-err text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] animate-pulse">
                    {t.badge}
                  </span>
                )}
             </button>
           );
        })}
      </div>

      <div className="pb-10">
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'developer_mgmt' && <DeveloperManagementTab />}
        {tab === 'coupons_bundles' && <CouponsAndBundlesTab />}
        {tab === 'broadcast' && <BroadcastTab />}
        {tab === 'branding' && <BrandingTab />}
        {tab === 'theme' && <ThemeTab />}
        {tab === 'ussd_apk' && <UssdApkTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'apps' && <AppsTab />}
        {tab === 'banners' && <BannersTab />}
        {tab === 'developer' && <DeveloperPanel />}
      </div>
    </div>
  );
};
