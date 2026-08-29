import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { Order, UserProfile } from '../types';
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
  CreditCard
} from 'lucide-react';
import { cn, formatPrice, getInitials } from '../lib/utils';
import { ContentItem, CodApp, Banner, Category } from '../types';
import { addDoc, setDoc } from 'firebase/firestore';

export const ContentTab: React.FC = () => {
    const { courses, tests, lectures, updateCourses, updateTests, updateLectures } = useApp();
    const [subTab, setSubTab] = useState<Category>('courses');
    const [isEditing, setIsEditing] = useState<ContentItem | Partial<ContentItem> | null>(null);

    const items = subTab === 'courses' ? courses : subTab === 'tests' ? tests : lectures;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;
        
        const itemId = isEditing.id || ('item-' + Date.now());
        const data: ContentItem = { 
            ...(isEditing as ContentItem), 
            id: itemId,
            category: subTab, 
            updatedAt: Date.now(),
            createdAt: isEditing.createdAt || Date.now()
        };

        if (subTab === 'courses') {
            const exists = courses.some(c => c.id === itemId);
            updateCourses(exists ? courses.map(c => c.id === itemId ? data : c) : [data, ...courses]);
        } else if (subTab === 'tests') {
            const exists = tests.some(t => t.id === itemId);
            updateTests(exists ? tests.map(t => t.id === itemId ? data : t) : [data, ...tests]);
        } else {
            const exists = lectures.some(l => l.id === itemId);
            updateLectures(exists ? lectures.map(l => l.id === itemId ? data : l) : [data, ...lectures]);
        }

        try {
            if (!isEditing.id) {
                await addDoc(collection(db, subTab), data);
            } else {
                const { id, ...rest } = data as any;
                await setDoc(doc(db, subTab, id), rest, { merge: true });
            }
        } catch (err) {
            console.warn('Firestore write sync fallback:', err);
        }
        setIsEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this item?')) {
            if (subTab === 'courses') {
                updateCourses(courses.filter(c => c.id !== id));
            } else if (subTab === 'tests') {
                updateTests(tests.filter(t => t.id !== id));
            } else {
                updateLectures(lectures.filter(l => l.id !== id));
            }
            try {
                await deleteDoc(doc(db, subTab, id));
            } catch (err) {
                console.warn('Firestore delete sync fallback:', err);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 bg-card p-1 rounded-xl border border-theme">
                {(['courses', 'tests', 'lectures'] as Category[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t)}
                        className={cn(
                            "flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            subTab === t ? "bg-primary text-white" : "text-text3 hover:bg-card2"
                        )}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <button 
                onClick={() => setIsEditing({ title: '', price: 0, icon: '📚', isFree: false })}
                className="w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm"
            >
                <Plus size={18} /> Add New {subTab.slice(0, -1)}
            </button>

            {isEditing && (
                <form onSubmit={handleSave} className="bg-card border-2 border-primary/10 p-6 rounded-3xl space-y-5 animate-in fade-in zoom-in-95 duration-300 shadow-2xl shadow-primary/5">
                    <div className="flex items-center justify-between border-b border-theme pb-4 mb-4">
                        <h3 className="font-black text-xs uppercase tracking-widest text-primary">{isEditing.id ? 'Edit' : 'Create'} {subTab.slice(0, -1)}</h3>
                        <div className="text-[10px] text-text3 font-medium">Drafting...</div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text2 px-1">Title</label>
                        <input 
                            required
                            placeholder="Course title"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={isEditing.title || ''}
                            onChange={e => setIsEditing({...isEditing, title: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text2 px-1">Description</label>
                        <textarea 
                            placeholder="Description..."
                            className="w-full h-28 bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm focus:border-primary focus:bg-card outline-none transition-all resize-none"
                            value={isEditing.desc || ''}
                            onChange={e => setIsEditing({...isEditing, desc: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text2 px-1">Category</label>
                        <input 
                            placeholder="e.g. Programming, Web, Data Science"
                            className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                            value={(isEditing.category === subTab ? '' : isEditing.category) || ''}
                            onChange={e => setIsEditing({...isEditing, category: e.target.value as any})}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-medium text-text2 px-1">Icon (Emoji)</label>
                            <input 
                                placeholder="📚"
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                value={isEditing.icon || ''}
                                onChange={e => setIsEditing({...isEditing, icon: e.target.value})}
                            />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-medium text-text2 px-1">Price (TZS — enter 0 for Free)</label>
                            <input 
                                type="number"
                                placeholder="0"
                                className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary focus:bg-card outline-none transition-all"
                                value={isEditing.price ?? ''}
                                onChange={e => setIsEditing({...isEditing, price: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 group cursor-pointer">
                        <input 
                            type="checkbox"
                            id="isFree"
                            className="w-5 h-5 rounded border-theme text-primary focus:ring-primary cursor-pointer"
                            checked={isEditing.isFree || false}
                            onChange={e => setIsEditing({...isEditing, isFree: e.target.checked})}
                        />
                        <label htmlFor="isFree" className="text-xs font-bold text-text2 group-hover:text-primary transition-colors cursor-pointer select-none">
                            Mark as FREE (visible to all without purchase)
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase">Duration</label>
                            <input 
                                placeholder="e.g. 8 hours"
                                className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none"
                                value={isEditing.duration || ''}
                                onChange={e => setIsEditing({...isEditing, duration: e.target.value})}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase">Level</label>
                            <select 
                                className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none appearance-none"
                                value={isEditing.level || 'Beginner'}
                                onChange={e => setIsEditing({...isEditing, level: e.target.value as any})}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-medium text-text2">Cover Image</label>
                        <div className="relative group">
                            <input 
                                type="text"
                                placeholder="Paste Image URL here..."
                                className="w-full h-32 bg-bg3 border-2 border-dashed border-theme rounded-2xl px-4 text-sm focus:border-primary outline-none text-center pt-8"
                                value={isEditing.coverB64 || ''}
                                onChange={e => setIsEditing({...isEditing, coverB64: e.target.value})}
                            />
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2 opacity-60 group-focus-within:opacity-100 transition-opacity">
                                <Video size={24} className="text-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Tap to upload cover image</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase">PDF URL (Optional)</label>
                        <input 
                            placeholder="https://..."
                            className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none"
                            value={isEditing.pdfPath || ''}
                            onChange={e => setIsEditing({...isEditing, pdfPath: e.target.value})}
                        />
                    </div>

                    {subTab === 'tests' && (
                        <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-text2">Time Limit (minutes)</label>
                                <input 
                                    type="number"
                                    className="w-full h-12 bg-primary/5 border border-primary/10 rounded-xl px-4 text-sm focus:border-primary outline-none transition-all"
                                    placeholder="e.g. 10"
                                    value={isEditing.timeLimit ?? ''}
                                    onChange={e => setIsEditing({...isEditing, timeLimit: Number(e.target.value)})}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold font-poppins text-text tracking-tight uppercase">Questions</h4>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newQs = [...(isEditing.questions || [])];
                                        newQs.push({ q: '', a: '', b: '', c: '', d: '', correct: 'a' });
                                        setIsEditing({ ...isEditing, questions: newQs });
                                    }}
                                    className="px-4 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={16} /> + Question
                                </button>
                            </div>

                            <div className="space-y-5">
                                {(isEditing.questions || []).map((q, idx) => (
                                    <div key={idx} className="bg-primary/5 border border-primary/10 p-5 rounded-2xl relative space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black text-primary uppercase">Q{idx + 1}</span>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newQs = (isEditing.questions || []).filter((_, i) => i !== idx);
                                                    setIsEditing({ ...isEditing, questions: newQs });
                                                }}
                                                className="text-err text-[11px] font-bold hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <input 
                                            placeholder="Question text"
                                            className="w-full h-12 bg-card border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none"
                                            value={q.q || ''}
                                            onChange={e => {
                                                const newQs = [...(isEditing.questions || [])];
                                                newQs[idx].q = e.target.value;
                                                setIsEditing({ ...isEditing, questions: newQs });
                                            }}
                                        />
                                        <div className="grid grid-cols-1 gap-2">
                                            {(['a', 'b', 'c', 'd'] as const).map(opt => (
                                                <input 
                                                    key={opt}
                                                    placeholder={`${opt.toUpperCase()}. Option`}
                                                    className="w-full h-12 bg-card border border-theme rounded-xl px-4 text-sm focus:border-primary outline-none"
                                                    value={q[opt] || ''}
                                                    onChange={e => {
                                                        const newQs = [...(isEditing.questions || [])];
                                                        newQs[idx][opt] = e.target.value;
                                                        setIsEditing({ ...isEditing, questions: newQs });
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-primary uppercase">Correct Answer</label>
                                            <select 
                                                className="w-full h-12 bg-card border border-theme rounded-xl px-4 text-sm appearance-none"
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

                    {subTab === 'lectures' && (
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold font-poppins text-text tracking-tight">Episodes</h4>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newEps = [...(isEditing.episodes || [])];
                                        newEps.push({ title: '', url: '', duration: '' });
                                        setIsEditing({ ...isEditing, episodes: newEps });
                                    }}
                                    className="px-4 h-9 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-primary/20 transition-colors"
                                >
                                    <Plus size={16} /> + Episode
                                </button>
                            </div>

                            <div className="space-y-5">
                                {(isEditing.episodes || []).map((ep, idx) => (
                                    <div key={idx} className="bg-primary/5 border border-primary/10 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-primary">Episode {idx + 1}</span>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newEps = (isEditing.episodes || []).filter((_, i) => i !== idx);
                                                    setIsEditing({ ...isEditing, episodes: newEps });
                                                }}
                                                className="text-err hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <input 
                                            placeholder="Episode title"
                                            className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                                            value={ep.title || ''}
                                            onChange={e => {
                                                const newEps = [...(isEditing.episodes || [])];
                                                newEps[idx].title = e.target.value;
                                                setIsEditing({ ...isEditing, episodes: newEps });
                                            }}
                                        />
                                        <input 
                                            placeholder="YouTube embed URL (https://youtube.com/embed/ID)"
                                            className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                                            value={ep.url || ''}
                                            onChange={e => {
                                                const newEps = [...(isEditing.episodes || [])];
                                                newEps[idx].url = e.target.value;
                                                setIsEditing({ ...isEditing, episodes: newEps });
                                            }}
                                        />
                                        <input 
                                            placeholder="Duration (e.g. 12:30)"
                                            className="w-full h-12 bg-bg3 border border-theme rounded-xl px-4 text-sm outline-none focus:border-primary focus:bg-card transition-all"
                                            value={ep.duration || ''}
                                            onChange={e => {
                                                const newEps = [...(isEditing.episodes || [])];
                                                newEps[idx].duration = e.target.value;
                                                setIsEditing({ ...isEditing, episodes: newEps });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-all text-sm uppercase tracking-widest">
                            Publish Content
                        </button>
                        <button type="button" onClick={() => setIsEditing(null)} className="flex-1 h-14 bg-bg3 border border-theme rounded-2xl font-bold text-sm uppercase tracking-widest">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-3">
                {items.map(item => (
                    <div key={item.id} className="bg-card border border-theme p-4 rounded-2xl flex items-center gap-4">
                        <div className="text-2xl">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{item.title}</div>
                            <div className="text-[10px] text-primary font-bold">{formatPrice(item.price)}</div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => setIsEditing(item)} className="p-2 border border-theme rounded-lg text-text2"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 border border-theme rounded-lg text-err"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
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
    const { users: appUsers } = useApp();
    const [users, setUsers] = useState<UserProfile[]>(appUsers);
    
    useEffect(() => {
        setUsers(appUsers);
    }, [appUsers]);

    useEffect(() => {
        let unsub: (() => void) | undefined;
        try {
          unsub = onSnapshot(collection(db, 'users'), (snap) => {
              if (!snap.empty) {
                const docs = snap.docs.map(d => d.data() as UserProfile);
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
        try {
          await updateDoc(doc(db, 'users', uid), { status: nextStatus });
        } catch (err) {
          console.warn('Firebase user update status fallback:', err);
        }
    };

    const deleteUser = async (uid: string) => {
       if (confirm('Delete this user? This cannot be undone.')) {
           setUsers(prev => prev.filter(u => u.uid !== uid));
           try {
             await deleteDoc(doc(db, 'users', uid));
           } catch (err) {
             console.warn('Firebase user delete fallback:', err);
           }
       }
    };

    return (
        <div className="space-y-3">
            {users.map(u => (
                <div key={u.uid} className="bg-card border border-theme p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {getInitials(u.name)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{u.name}</div>
                      <div className="text-[10px] text-text3 truncate tracking-wide">{u.email}</div>
                   </div>
                   <div className="flex gap-1">
                      <button 
                        onClick={() => toggleBlock(u.uid, u.status)}
                        className={cn("p-2 rounded-lg border border-theme", u.status === 'Active' ? "text-warn" : "text-ok")}
                      >
                         {u.status === 'Active' ? <Ban size={16} /> : <Unlock size={16} />}
                      </button>
                      <button 
                        onClick={() => deleteUser(u.uid)}
                        className="p-2 border border-theme text-err rounded-lg"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
            ))}
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

export const AdminPage: React.FC = () => {
  const { orders } = useApp();
  const [tab, setTab] = useState<'analytics' | 'orders' | 'content' | 'apps' | 'banners' | 'users'>('analytics');
  const [pendingCount, setPendingCount] = useState(() => orders.filter(o => o.status === 'pending').length);

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
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'apps', label: 'Apps', icon: Bolt },
    { id: 'banners', label: 'Banners', icon: Trophy },
    { id: 'users', label: 'Users', icon: UserIcon },
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
        {tab === 'users' && <UsersTab />}
        {tab === 'content' && <ContentTab />}
        {tab === 'apps' && <AppsTab />}
        {tab === 'banners' && <BannersTab />}
      </div>
    </div>
  );
};
