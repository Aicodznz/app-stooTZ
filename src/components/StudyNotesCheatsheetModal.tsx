import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  BookOpen, 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  X, 
  Sparkles, 
  Bookmark, 
  Code, 
  Layers, 
  Download,
  Share2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StudyNote, CheatsheetItem } from '../types';

export const StudyNotesCheatsheetModal: React.FC<{ 
  courseId?: string; 
  courseTitle?: string; 
  onClose: () => void;
  defaultTab?: 'notes' | 'cheatsheets';
}> = ({ courseId, courseTitle, onClose, defaultTab = 'notes' }) => {
  const { lang, studyNotes, cheatsheets, saveStudyNote, deleteStudyNote } = useApp();

  const [activeTab, setActiveTab] = useState<'notes' | 'cheatsheets'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Note Form
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Filtered Notes
  const filteredNotes = studyNotes.filter(n => {
    return n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           n.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filtered Cheatsheets
  const cheatsheetCategories = ['All', ...Array.from(new Set(cheatsheets.map(c => c.category)))];
  const filteredCheatsheets = cheatsheets.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.sections || []).some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    saveStudyNote({
      courseId,
      courseTitle: courseTitle || 'General Notes',
      title: noteTitle.trim(),
      content: noteContent.trim()
    });

    setNoteTitle('');
    setNoteContent('');
    setShowAddNote(false);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-card border border-theme rounded-3xl p-5 sm:p-7 shadow-2xl my-auto z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text1">
                {lang === 'en' ? 'Study Notes & Quick Cheatsheets' : 'Daftari la Maelezo & Majedwali ya Kodi (Cheatsheets)'}
              </h3>
              <p className="text-xs text-text3">
                {lang === 'en' ? 'Save personal study notes and access instant syntax references' : 'Hifadhi maelezo yako ya masomo na tazama mihtasari ya syntax ya lugha mbalimbali'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-theme pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                activeTab === 'notes' ? "bg-primary text-white" : "text-text3 hover:text-text1"
              )}
            >
              <FileText size={14} />
              <span>{lang === 'en' ? 'My Notes' : 'Maelezo Yangu'} ({studyNotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cheatsheets')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                activeTab === 'cheatsheets' ? "bg-primary text-white" : "text-text3 hover:text-text1"
              )}
            >
              <Bookmark size={14} />
              <span>{lang === 'en' ? 'Cheatsheets' : 'Majedwali (Cheatsheets)'}</span>
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text3" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search topics...' : 'Tafuta mada...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 h-9 pl-9 pr-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* TAB 1: STUDY NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text3">
                {courseTitle ? `Notes kwa somo: ${courseTitle}` : 'Maelezo Yote Uliyohifadhi'}
              </span>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="h-9 px-3.5 bg-primary hover:opacity-90 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
              >
                <Plus size={14} />
                <span>{lang === 'en' ? 'Write Note' : 'Andika Note Mpya'}</span>
              </button>
            </div>

            {showAddNote && (
              <form onSubmit={handleSaveNewNote} className="p-4 bg-card2 border border-primary/40 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-primary uppercase">Andika Maelezo ya Somo</h4>
                  <button type="button" onClick={() => setShowAddNote(false)} className="text-xs text-text3 hover:text-text1">Ghairi</button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Kichwa cha Note (Mfano: Kanuni za JavaScript Promises & Async)"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
                />

                <textarea
                  rows={4}
                  required
                  placeholder="Andika dokezo, kodi, au ufafanuzi wako hapa..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-card border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none leading-relaxed"
                />

                <button
                  type="submit"
                  className="w-full h-10 bg-primary text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  <span>Hifadhi Note</span>
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1">
              {filteredNotes.length === 0 ? (
                <div className="sm:col-span-2 p-8 text-center bg-card2/50 border border-theme rounded-2xl text-xs text-text3 space-y-2">
                  <FileText size={32} className="mx-auto opacity-40" />
                  <p>Bado haujahifadhi notes zozote. Bonyeza "Andika Note Mpya" kuanza.</p>
                </div>
              ) : (
                filteredNotes.map(n => (
                  <div key={n.id} className="p-4 bg-card border border-theme rounded-2xl space-y-2 flex flex-col justify-between group">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-theme text-primary">
                          {n.courseTitle || 'Coding Note'}
                        </span>
                        <button
                          onClick={() => deleteStudyNote(n.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 transition-all p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <h4 className="text-xs font-black text-text1">{n.title}</h4>
                      <p className="text-[11px] text-text2 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                    </div>

                    <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-[10px] text-text3">
                      <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleCopyCode(n.content, n.id)}
                        className="flex items-center gap-1 hover:text-primary font-bold"
                      >
                        {copiedSnippetId === n.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>{copiedSnippetId === n.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CHEATSHEETS */}
        {activeTab === 'cheatsheets' && (
          <div className="space-y-4">
            {/* Category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {cheatsheetCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                    selectedCategory === cat ? "bg-primary text-white border-primary" : "bg-card2 border-theme text-text2 hover:text-text1"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Cheatsheets List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredCheatsheets.map(sheet => (
                <div key={sheet.id} className="bg-card border border-theme rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-theme pb-2">
                    <div className="flex items-center gap-2">
                      <Code size={16} className="text-primary" />
                      <h4 className="text-sm font-black text-text1">{sheet.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {sheet.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(sheet.sections || []).map((sec, idx) => (
                      <div key={idx} className="p-3 bg-card2 border border-theme/80 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-text1">{sec.title}</span>
                          <button
                            onClick={() => handleCopyCode(sec.code, `${sheet.id}-${idx}`)}
                            className="p-1 text-text3 hover:text-primary transition-all"
                            title="Copy code"
                          >
                            {copiedSnippetId === `${sheet.id}-${idx}` ? (
                              <Check size={13} className="text-emerald-500" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>

                        {sec.description && (
                          <p className="text-[11px] text-text3">{sec.description}</p>
                        )}

                        <pre className="p-2.5 bg-slate-950 text-indigo-300 rounded-lg font-mono text-[10px] overflow-x-auto border border-slate-800">
                          {sec.code}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
