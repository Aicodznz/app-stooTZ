import React, { useState } from 'react';
import { ContentItem, Episode, AILessonSummary } from '../types';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  SkipForward,
  SkipBack,
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
  UserCheck,
  Star,
  Code2,
  Bot,
  Award,
  Zap,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { CodePlayground } from './CodePlayground';
import { AIAssistantModal } from './AIAssistantModal';

// Helper to reliably parse YouTube video ID and provide embed, direct URL & thumbnail
function parseYouTubeVideo(url: string) {
  if (!url) return { embedUrl: '', directUrl: '', videoId: '', thumbUrl: '' };
  let videoId = '';
  if (url.includes('embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || '';
  } else if (url.includes('v=')) {
    videoId = url.split('v=')[1]?.split('&')[0] || '';
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }

  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
    : url;
  const directUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : url;
  const thumbUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : '';

  return { embedUrl, directUrl, videoId, thumbUrl };
}

export const VideoPlayerOverlay: React.FC<{ item: ContentItem; onClose: () => void }> = ({ item, onClose }) => {
  const { completedEpisodes, toggleEpisodeComplete, discussions, addDiscussionReply, addDiscussionQuestion, isAdm, user, lang, reviews, addReview, summarizeLessonWithAI, addPoints } = useApp();
  const [currIdx, setCurrIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'playlist' | 'qa' | 'notes' | 'reviews'>('playlist');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [showXpAlert, setShowXpAlert] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [note, setNote] = useState(() => localStorage.getItem(`note_${item.id}_${currIdx}`) || '');
  const [noteSaved, setNoteSaved] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<AILessonSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const episodes = item.episodes || [];
  const currEp = episodes[currIdx];
  const videoInfo = parseYouTubeVideo(currEp?.url || '');

  // Calculate completed count
  const completedCount = episodes.filter((_, idx) => completedEpisodes[`${item.id}_${idx}`]).length;
  const progress = episodes.length > 0 ? Math.round((completedCount / episodes.length) * 100) : 0;

  const itemDiscussions = discussions.filter(d => d.itemId === item.id || !d.itemId);
  const itemReviews = reviews.filter(r => r.itemId === item.id);
  const avgRating = itemReviews.length > 0
    ? (itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length).toFixed(1)
    : (item.rating || '4.9');

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

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      itemId: item.id,
      userId: user?.uid || 'guest',
      userName: user?.displayName || user?.email?.split('@')[0] || 'Mwanafunzi',
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    setReviewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleNextEpisode = () => {
    if (currIdx < episodes.length - 1) {
      // Auto-mark current as completed and award XP if not already done
      if (!completedEpisodes[`${item.id}_${currIdx}`]) {
        toggleEpisodeComplete(item.id, currIdx);
        addPoints(15);
        setShowXpAlert(true);
        setTimeout(() => setShowXpAlert(false), 2500);
      }
      setCurrIdx(currIdx + 1);
    } else {
      // Finished all episodes!
      if (!completedEpisodes[`${item.id}_${currIdx}`]) {
        toggleEpisodeComplete(item.id, currIdx);
        addPoints(50);
        setShowXpAlert(true);
        setTimeout(() => setShowXpAlert(false), 3000);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (currIdx > 0) {
      setCurrIdx(currIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#080b14] flex flex-col page-anim text-slate-100 select-none">
      {/* XP Bonus Toast */}
      {showXpAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-bounce border border-amber-300/40">
          <Zap size={16} fill="currentColor" />
          <span>{lang === 'en' ? 'Lesson Completed! +15 XP Earned 🔥' : 'Somo Limekamilika! +15 XP Umejipatia 🔥'}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="h-14 flex items-center px-3 sm:px-4 justify-between bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shrink-0">
        <button 
          onClick={onClose} 
          className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          title="Funga / Rudi"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="text-center truncate px-2 min-w-0 flex-1">
          <h2 className="font-bold text-xs sm:text-sm text-white truncate max-w-[220px] sm:max-w-[340px] mx-auto">
            {item.title}
          </h2>
          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 mt-0.5">
            <span className="font-mono text-indigo-400 font-semibold">{completedCount}/{episodes.length}</span>
            <span>{lang === 'en' ? 'Lessons Done' : 'Masomo Yamekamilika'}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-emerald-400 font-semibold">{progress}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab(activeTab === 'qa' ? 'playlist' : 'qa')}
            className={cn(
              "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border",
              activeTab === 'qa' 
                ? "bg-indigo-600 text-white border-indigo-500" 
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
            )}
            title="Maswali & Majibu"
          >
            <MessageSquare size={14} />
            <span className="hidden sm:inline">Q&A</span>
            {itemDiscussions.length > 0 && (
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 font-mono">
                {itemDiscussions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Video Container */}
      <div className="aspect-video w-full bg-slate-950 relative shrink-0 shadow-2xl border-b border-slate-800/80 group">
        {currEp ? (
          <>
            <iframe 
              key={currEp.url}
              src={`${videoInfo.embedUrl}${videoInfo.embedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1&enablejsapi=1`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title={currEp.title}
            />

            {/* Direct Open in YouTube Quick-Action in corner if iframe blocked */}
            {videoInfo.directUrl && (
              <a
                href={videoInfo.directUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2.5 right-2.5 z-20 bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-all shadow-lg"
                title="Fungua video moja kwa moja kwenye YouTube"
              >
                <ExternalLink size={12} className="text-indigo-400" />
                <span>YouTube</span>
              </a>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
            <Play size={28} className="text-slate-600" />
            <span>Hakuna URL ya Video</span>
          </div>
        )}
      </div>

      {/* Course Progress Indicator Bar */}
      <div className="w-full h-1 bg-slate-900 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Sleek, Single-Row Player Control Strip (Clean & Uncluttered) */}
      <div className="bg-slate-950/95 border-b border-slate-800/80 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Previous & Next Lesson navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevEpisode}
            disabled={currIdx === 0}
            className="h-8 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-800 transition-colors"
            title="Somo Lililopita"
          >
            <SkipBack size={13} />
            <span className="hidden sm:inline">{lang === 'en' ? 'Prev' : 'Nyuma'}</span>
          </button>

          <button
            onClick={handleNextEpisode}
            className={cn(
              "h-8 px-3 sm:px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs",
              currIdx === episodes.length - 1
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            )}
            title="Somo Linalofuata"
          >
            <span>
              {currIdx === episodes.length - 1 
                ? (lang === 'en' ? 'Finish Course 🎉' : 'Kamilisha Kozi 🎉') 
                : (lang === 'en' ? 'Next Lesson' : 'Somo Linalofuata')}
            </span>
            <SkipForward size={13} />
          </button>
        </div>

        {/* Right: Playback Speed & Auto-Advance */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Segmented Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={cn(
                  "px-1.5 sm:px-2 py-0.5 rounded text-[11px] font-semibold transition-all",
                  playbackSpeed === speed 
                    ? "bg-slate-800 text-white font-bold shadow-xs" 
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Auto-Advance Toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={cn(
              "h-7 px-2 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all",
              autoAdvance 
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            )}
            title="Endesha somo linalofuata kiotomatiki"
          >
            <Zap size={11} className={autoAdvance ? "fill-emerald-400 text-emerald-400" : ""} />
            <span className="hidden sm:inline">Auto</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar: Clean, Un-truncated labels & consistent badge styling */}
      <div className="flex border-b border-slate-800/80 bg-slate-950 px-3 sm:px-4 shrink-0 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab('playlist')}
          className={cn(
            "py-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === 'playlist' 
              ? "border-indigo-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <span>{lang === 'en' ? 'Playlist' : 'Masomo'}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {episodes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('qa')}
          className={cn(
            "py-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === 'qa' 
              ? "border-indigo-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <span>Q&A</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
            {itemDiscussions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={cn(
            "py-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === 'reviews' 
              ? "border-amber-400 text-amber-300" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Star size={12} className="text-amber-400" fill="currentColor" />
          <span>{lang === 'en' ? 'Reviews' : 'Maoni'}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
            {avgRating} ★
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "py-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap",
            activeTab === 'notes' 
              ? "border-indigo-500 text-white" 
              : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText size={12} />
          <span>{lang === 'en' ? 'Notes' : 'Vidokezo'}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
        {activeTab === 'playlist' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Current Lesson Hero Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Somo {currIdx + 1} la {episodes.length}
                    </span>
                    {currEp?.duration && (
                      <span className="text-[11px] font-mono text-slate-400">
                        • {currEp.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {currEp?.title ? currEp.title.replace(/^\d+\.\s*/, '') : item.title}
                  </h3>
                </div>

                {/* Lesson Completion Action Button */}
                <button
                  onClick={() => toggleEpisodeComplete(item.id, currIdx)}
                  className={cn(
                    "h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto border",
                    completedEpisodes[`${item.id}_${currIdx}`] 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  )}
                >
                  {completedEpisodes[`${item.id}_${currIdx}`] ? (
                    <>
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>{lang === 'en' ? 'Completed' : 'Imekamilika'}</span>
                    </>
                  ) : (
                    <>
                      <Circle size={15} className="text-slate-400" />
                      <span>{lang === 'en' ? 'Mark Done' : 'Weka Imekamilika'}</span>
                    </>
                  )}
                </button>
              </div>

              {currEp?.description && (
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                  {currEp.description}
                </p>
              )}

              {/* Clean Quick Interactive Tools (AI Summarizer & Live Code Playground) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={async () => {
                    if (aiSummary) {
                      setAiSummary(null);
                      return;
                    }
                    setSummarizing(true);
                    const res = await summarizeLessonWithAI(
                      currEp?.title || item.title,
                      currEp?.description || item.desc,
                      item.title
                    );
                    setAiSummary(res);
                    setSummarizing(false);
                  }}
                  disabled={summarizing}
                  className={cn(
                    "h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all active:scale-98",
                    aiSummary 
                      ? "bg-purple-600 text-white border-purple-500" 
                      : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-purple-300"
                  )}
                >
                  <Sparkles size={14} className="text-amber-400 shrink-0" />
                  <span className="truncate">{summarizing ? 'Inatengeneza...' : aiSummary ? 'Funga Muhtasari' : 'Muhtasari wa AI'}</span>
                </button>

                <button
                  onClick={() => setShowPlayground(true)}
                  className="h-10 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Code2 size={14} className="text-indigo-400 shrink-0" />
                  <span className="truncate">Code Sandbox</span>
                </button>
              </div>
            </div>

            {/* AI Summary Card */}
            {aiSummary && (
              <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-2.5 text-xs text-purple-100 animate-in fade-in">
                <div className="flex items-center justify-between text-purple-300 font-black">
                  <div className="flex items-center gap-1.5">
                    <Bot size={15} />
                    <span>Muhtasari wa AI (Key Takeaways)</span>
                  </div>
                  <button onClick={() => setAiSummary(null)} className="text-white/60 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                {aiSummary.quickSummary && (
                  <p className="leading-relaxed text-[11px] text-white/90 font-medium">
                    {aiSummary.quickSummary}
                  </p>
                )}
                {aiSummary.summary && !aiSummary.quickSummary && (
                  <p className="leading-relaxed text-[11px] text-white/90 font-medium">
                    {aiSummary.summary}
                  </p>
                )}
                {((aiSummary.keyPoints && aiSummary.keyPoints.length > 0) || (aiSummary.quickTakeaways && aiSummary.quickTakeaways.length > 0)) && (
                  <ul className="space-y-1 pl-4 list-disc text-[11px] text-purple-200">
                    {(aiSummary.keyPoints || aiSummary.quickTakeaways || []).map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Course Lessons List with High Contrast & Clean Card Layout */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>{lang === 'en' ? 'Course Outline' : 'Mfululizo wa Masomo'}</span>
                <span className="text-[11px] font-mono text-slate-500">{episodes.length} {lang === 'en' ? 'lessons' : 'masomo'}</span>
              </div>

              <div className="space-y-2">
                {episodes.map((ep, i) => {
                  const isCurrent = currIdx === i;
                  const isDone = !!completedEpisodes[`${item.id}_${i}`];
                  const displayTitle = ep.title.replace(/^\d+\.\s*/, '');

                  return (
                    <div
                      key={i}
                      onClick={() => setCurrIdx(i)}
                      className={cn(
                        "p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all",
                        isCurrent 
                          ? "bg-slate-900 border-indigo-500/60 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20" 
                          : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                          isCurrent 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : isDone 
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                              : "bg-slate-800 text-slate-400"
                        )}>
                          {isDone ? <CheckCircle2 size={15} /> : i + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs sm:text-sm font-semibold truncate",
                              isCurrent ? "text-white font-bold" : "text-slate-300"
                            )}>
                              {displayTitle}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                                Sasa
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {ep.duration}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEpisodeComplete(item.id, i);
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors text-xs shrink-0",
                          isDone 
                            ? "text-emerald-400 hover:bg-emerald-500/10" 
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
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
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Average Rating Banner */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-xl">
                  <span>{avgRating}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} size={14} fill={idx < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {itemReviews.length} {lang === 'en' ? 'verified student reviews' : 'maoni ya wanafunzi'}
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
                {lang === 'en' ? 'Verified Course' : 'Kozi Iliyohakikiwa'}
              </span>
            </div>

            {/* Post Review Form */}
            <form onSubmit={handlePostReview} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400" />
                  <span>{lang === 'en' ? 'Write a Review for this Course' : 'Toa Maoni & Nyota kwa Kozi Hii'}</span>
                </label>
                {reviewSubmitted && (
                  <span className="text-[10px] text-ok font-bold">Maoni yametumwa! ✓</span>
                )}
              </div>

              {/* Star Picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star size={20} fill={s <= reviewRating ? "currentColor" : "none"} />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-300 ml-2">{reviewRating} / 5 Nyota</span>
              </div>

              <textarea
                rows={3}
                placeholder={lang === 'en' ? 'Share what you learned and how the teacher explained...' : 'Eleza ulichojifunza na jinsi mwalimu alivyofundisha somo hili...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 outline-none focus:border-amber-400 resize-none"
                required
              />

              <button
                type="submit"
                disabled={!reviewComment.trim()}
                className="h-10 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-40"
              >
                <span>{lang === 'en' ? 'Submit Student Review' : 'Tuma Maoni Yangu'}</span>
                <Send size={13} />
              </button>
            </form>

            {/* List of Reviews */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-black text-white/40 tracking-[2px]">
                {lang === 'en' ? 'Recent Reviews' : 'Maoni ya Hivi Karibuni'}
              </h4>
              {itemReviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40 bg-white/5 rounded-2xl border border-white/10">
                  {lang === 'en' ? 'No reviews yet for this course. Be the first to leave feedback!' : 'Hakuna maoni bado kwa kozi hii. Kuwa wa kwanza kutoa nyota na maoni!'}
                </div>
              ) : (
                itemReviews.map((r) => (
                  <div key={r.id} className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] flex items-center justify-center">
                          {r.userName[0]?.toUpperCase() || 'M'}
                        </div>
                        <span className="text-xs font-bold text-white">{r.userName}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: r.rating }).map((_, idx) => (
                          <Star key={idx} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed pl-8">{r.comment}</p>
                    <div className="text-[9px] text-white/30 text-right font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
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

      {/* Code Playground Modal */}
      {showPlayground && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setShowPlayground(false)} />
          <div className="relative w-full max-w-7xl bg-[#0f172a] border border-slate-800 rounded-3xl p-3 sm:p-6 shadow-2xl my-auto z-10 max-h-[96vh] overflow-y-auto">
            <CodePlayground onClose={() => setShowPlayground(false)} />
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal onClose={() => setShowAIModal(false)} />
      )}
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
