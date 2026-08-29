import React, { useState } from 'react';
import { ContentItem, Episode } from '../types';
import { 
  X, 
  ChevronLeft, 
  MessageSquare, 
  Play, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Send, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Sun, 
  Moon, 
  Maximize2,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

export const VideoPlayerOverlay: React.FC<{ item: ContentItem; onClose: () => void }> = ({ item, onClose }) => {
  const { completedEpisodes, toggleEpisodeComplete, discussions, addDiscussionReply, addDiscussionQuestion, isAdm, user, lang } = useApp();
  const [currIdx, setCurrIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'playlist' | 'qa' | 'notes'>('playlist');
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [note, setNote] = useState(() => localStorage.getItem(`note_${item.id}_${currIdx}`) || '');
  const [noteSaved, setNoteSaved] = useState(false);

  const episodes = item.episodes || [];
  const currEp = episodes[currIdx];

  // Calculate completed count
  const completedCount = episodes.filter((_, idx) => completedEpisodes[`${item.id}_${idx}`]).length;
  const progress = episodes.length > 0 ? Math.round((completedCount / episodes.length) * 100) : 0;

  const itemDiscussions = discussions.filter(d => d.itemId === item.id || !d.itemId);

  const handleSaveNote = () => {
    localStorage.setItem(`note_${item.id}_${currIdx}`, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addDiscussionQuestion(item.id, newQuestion.trim());
    setNewQuestion('');
  };

  const handleSendReply = (discId: string) => {
    const text = replyText[discId];
    if (!text || !text.trim()) return;
    addDiscussionReply(discId, text.trim());
    setReplyText(p => ({ ...p, [discId]: '' }));
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#070710] flex flex-col page-anim text-white select-none">
      {/* Top Bar */}
      <header className="h-14 flex items-center px-4 justify-between bg-black/70 backdrop-blur-md border-b border-white/10 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center truncate px-2">
          <h2 className="font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[280px]">{item.title}</h2>
          <div className="text-[10px] text-white/50">{completedCount}/{episodes.length} {lang === 'en' ? 'Episodes Completed' : 'Masomo Yamekamilika'} ({progress}%)</div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab(activeTab === 'qa' ? 'playlist' : 'qa')}
            className={cn("p-2 rounded-full transition-colors relative", activeTab === 'qa' ? "bg-primary text-white" : "hover:bg-white/10 text-white/80")}
            title="Maswali & Majibu"
          >
            <MessageSquare size={18} />
            {itemDiscussions.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </header>

      {/* Video Container */}
      <div className="aspect-video w-full bg-black relative shrink-0 shadow-2xl border-b border-white/5">
        {currEp ? (
          <iframe 
            src={`${currEp.url}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title={currEp.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-sm">Hakuna URL ya Video</div>
        )}
      </div>

      {/* Progress Bar under video */}
      <div className="w-full h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/40 px-4 shrink-0">
        <button
          onClick={() => setActiveTab('playlist')}
          className={cn(
            "py-3 px-4 text-xs font-bold transition-all border-b-2",
            activeTab === 'playlist' ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"
          )}
        >
          {lang === 'en' ? 'Playlist' : 'Orodha ya Masomo'} ({episodes.length})
        </button>
        <button
          onClick={() => setActiveTab('qa')}
          className={cn(
            "py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === 'qa' ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"
          )}
        >
          <span>Q&A</span>
          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{itemDiscussions.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5",
            activeTab === 'notes' ? "border-primary text-white" : "border-transparent text-white/50 hover:text-white/80"
          )}
        >
          <FileText size={12} />
          <span>{lang === 'en' ? 'Notes' : 'Vidokezo'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {activeTab === 'playlist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{currEp?.title}</h3>
                {currEp?.description && <p className="text-xs text-white/60 mt-1">{currEp.description}</p>}
              </div>
              <button
                onClick={() => toggleEpisodeComplete(item.id, currIdx)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0",
                  completedEpisodes[`${item.id}_${currIdx}`] 
                    ? "bg-ok/20 text-ok border border-ok/30" 
                    : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                )}
              >
                {completedEpisodes[`${item.id}_${currIdx}`] ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{lang === 'en' ? 'Completed' : 'Imekamilika'}</span>
                  </>
                ) : (
                  <>
                    <Circle size={16} />
                    <span>{lang === 'en' ? 'Mark Done' : 'Weka Imekamilika'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2.5 pt-2">
              <h4 className="text-[10px] uppercase font-black text-white/40 tracking-[2px]">
                {lang === 'en' ? 'Course Outline' : 'Mfululizo wa Masomo'}
              </h4>
              {episodes.map((ep, i) => {
                const isCurrent = currIdx === i;
                const isDone = !!completedEpisodes[`${item.id}_${i}`];

                return (
                  <div
                    key={i}
                    className={cn(
                      "p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all",
                      isCurrent 
                        ? "border-primary bg-primary/15 shadow-lg shadow-primary/10" 
                        : "border-white/5 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div 
                      onClick={() => setCurrIdx(i)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                        isCurrent ? "bg-primary text-white shadow-md" : isDone ? "bg-ok/20 text-ok" : "bg-white/10 text-white/60"
                      )}>
                        {isDone ? <CheckCircle2 size={16} /> : i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-xs sm:text-sm font-bold truncate", isCurrent ? "text-primary" : "text-white/90")}>
                          {ep.title}
                        </div>
                        <div className="text-[10px] text-white/40 font-mono mt-0.5">{ep.duration}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEpisodeComplete(item.id, i);
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-colors text-xs shrink-0",
                        isDone ? "text-ok hover:bg-ok/10" : "text-white/30 hover:text-white/70"
                      )}
                      title={isDone ? "Imekamilika" : "Weka imekamilika"}
                    >
                      {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="space-y-4">
            <form onSubmit={handleSendQuestion} className="space-y-2 bg-white/5 p-3 rounded-2xl border border-white/10">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Sparkles size={14} className="text-gold" />
                <span>{lang === 'en' ? 'Ask a Question about this lesson' : 'Uliza Swali kuhusu somo hili'}</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder={lang === 'en' ? 'Type your question...' : 'Andika swali lako hapa...'}
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 h-11 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={!newQuestion.trim()}
                  className="h-11 px-4 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Send size={14} />
                  <span>{lang === 'en' ? 'Post' : 'Tuma'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {itemDiscussions.length === 0 ? (
                <div className="text-center py-8 text-white/40 text-xs">
                  Hakuna maswali bado. Kuwa wa kwanza kuuliza swali!
                </div>
              ) : (
                itemDiscussions.map((disc) => (
                  <div key={disc.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                          {disc.userName[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{disc.userName}</div>
                          <div className="text-[9px] text-white/40">{new Date(disc.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-white/90 font-medium pl-9 leading-relaxed">{disc.question}</p>

                    {/* Replies */}
                    {disc.replies.length > 0 && (
                      <div className="pl-6 pt-2 space-y-2 border-l-2 border-primary/30">
                        {disc.replies.map(rep => (
                          <div key={rep.id} className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              {rep.isInstructor ? (
                                <span className="bg-primary/30 text-primary px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                                  <UserCheck size={10} /> Mwalimu
                                </span>
                              ) : (
                                <span className="text-white/70">{rep.author}</span>
                              )}
                            </div>
                            <p className="text-white/80 leading-normal">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    <div className="flex gap-2 pt-1 pl-6">
                      <input 
                        type="text"
                        placeholder={lang === 'en' ? 'Reply to this...' : 'Jibu hapa...'}
                        value={replyText[disc.id] || ''}
                        onChange={e => setReplyText({ ...replyText, [disc.id]: e.target.value })}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 h-8 text-[11px] text-white outline-none focus:border-primary"
                      />
                      <button
                        onClick={() => handleSendReply(disc.id)}
                        className="h-8 px-3 bg-white/10 hover:bg-primary text-white rounded-lg text-[10px] font-bold transition-colors"
                      >
                        {lang === 'en' ? 'Reply' : 'Jibu'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80">
                {lang === 'en' ? `Notes for Episode ${currIdx + 1}` : `Vidokezo vya Somo la ${currIdx + 1}`}
              </label>
              {noteSaved && <span className="text-[11px] text-ok font-bold animate-pulse">Vimehifadhiwa! ✓</span>}
            </div>
            <textarea
              rows={8}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={lang === 'en' ? 'Write your personal study notes here...' : 'Andika maelezo na vidokezo vyako vya kujifunzia hapa...'}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs leading-relaxed text-white outline-none focus:border-primary resize-none"
            />
            <button
              onClick={handleSaveNote}
              className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <span>{lang === 'en' ? 'Save Notes Locally' : 'Hifadhi Vidokezo'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const PDFViewerOverlay: React.FC<{ item: ContentItem; onClose: () => void }> = ({ item, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  const getBgColor = () => {
    if (readingTheme === 'dark') return 'bg-[#12121e] text-white';
    if (readingTheme === 'sepia') return 'bg-[#f4ecd8] text-[#5b4636]';
    return 'bg-white text-black';
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#0d0d1a] flex flex-col page-anim">
      <header className="h-14 flex items-center px-4 justify-between bg-black/90 backdrop-blur-md text-white border-b border-white/10 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center truncate px-2">
          <h2 className="font-bold text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[260px]">{item.title}</h2>
          <div className="text-[10px] text-white/50">{item.level || 'Beginner'} • PDF Guide</div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setZoom(z => Math.max(z - 15, 60))} 
            className="p-2 rounded-lg hover:bg-white/10 text-white/80"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] font-mono text-white/60">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(z + 15, 160))} 
            className="p-2 rounded-lg hover:bg-white/10 text-white/80"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <a
            href={item.pdfPath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
            download={`${item.title}.pdf`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-white/10 text-white/80 ml-1"
            title="Download PDF"
          >
            <Download size={16} />
          </a>
        </div>
      </header>

      {/* Reading Theme controls */}
      <div className="h-9 bg-black/60 border-b border-white/5 px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 font-bold uppercase">Background:</span>
          <button 
            onClick={() => setReadingTheme('light')}
            className={cn("px-2 py-0.5 rounded text-[10px] font-bold", readingTheme === 'light' ? "bg-white text-black" : "text-white/60")}
          >
            Light
          </button>
          <button 
            onClick={() => setReadingTheme('sepia')}
            className={cn("px-2 py-0.5 rounded text-[10px] font-bold", readingTheme === 'sepia' ? "bg-[#f4ecd8] text-[#5b4636]" : "text-white/60")}
          >
            Sepia
          </button>
          <button 
            onClick={() => setReadingTheme('dark')}
            className={cn("px-2 py-0.5 rounded text-[10px] font-bold", readingTheme === 'dark' ? "bg-slate-700 text-white" : "text-white/60")}
          >
            Dark
          </button>
        </div>
        <div className="text-[10px] text-white/40">In-App PDF Reader</div>
      </div>

      <div className={cn("flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center transition-colors", getBgColor())}>
        <div 
          className="w-full h-full max-w-4xl shadow-2xl rounded-xl overflow-hidden transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <iframe 
            src={item.pdfPath || `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`}
            className="w-full h-full min-h-[600px] border-none rounded-xl bg-white"
            title="PDF Document"
          />
        </div>
      </div>
    </div>
  );
};
