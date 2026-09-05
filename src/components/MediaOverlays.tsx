import React, { useState } from 'react';
import { ContentItem, Episode, AILessonSummary, PlaygroundSnippet } from '../types';
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
  ExternalLink,
  Copy,
  Check,
  Type
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';
import { CodePlayground } from './CodePlayground';
import { AIAssistantModal } from './AIAssistantModal';
import { getOrCreateGuide } from '../data/courseGuides';

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
  const { lang, addPoints } = useApp();
  const guide = getOrCreateGuide(item);

  // States
  const [activeMode, setActiveMode] = useState<'reader' | 'pdf'>('reader');
  const [chapterIdx, setChapterIdx] = useState(0);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [zoom, setZoom] = useState(100);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [showXpToast, setShowXpToast] = useState(false);
  const [activeSnippetForPlayground, setActiveSnippetForPlayground] = useState<PlaygroundSnippet | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // Completed chapters stored locally per course
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`guide_done_${item.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const currentChapter = guide.chapters[chapterIdx] || guide.chapters[0];
  const completedCount = guide.chapters.filter((_, idx) => completedChapters[`${item.id}_${idx}`]).length;
  const progressPercent = Math.round((completedCount / guide.chapters.length) * 100);

  const toggleChapterComplete = (idx: number) => {
    const key = `${item.id}_${idx}`;
    const nextState = !completedChapters[key];
    const updated = { ...completedChapters, [key]: nextState };
    setCompletedChapters(updated);
    try {
      localStorage.setItem(`guide_done_${item.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (nextState) {
      addPoints(10);
      setShowXpToast(true);
      setTimeout(() => setShowXpToast(false), 2600);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleOpenInSandbox = (codeExample: { language: 'html' | 'css' | 'javascript' | 'python'; title: string; code: string }) => {
    const snippet: PlaygroundSnippet = {
      id: `guide-${Date.now()}`,
      title: codeExample.title,
      language: codeExample.language,
      html: codeExample.language === 'html' ? codeExample.code : undefined,
      css: codeExample.language === 'css' ? codeExample.code : undefined,
      javascript: codeExample.language === 'javascript' ? codeExample.code : undefined,
      python: codeExample.language === 'python' ? codeExample.code : undefined,
      desc: `Msimbo kutoka mwongozo wa ${item.title} - ${currentChapter.title}`
    };
    setActiveSnippetForPlayground(snippet);
  };

  // Reading Theme Styling
  const getThemeStyles = () => {
    if (readingTheme === 'dark') {
      return {
        bg: 'bg-[#080b14] text-slate-100',
        bar: 'bg-slate-950/95 border-slate-800/80 text-slate-200',
        subBar: 'bg-slate-900/90 border-slate-800/80 text-slate-300',
        card: 'bg-slate-900/80 border-slate-800 text-slate-200',
        codeBg: 'bg-slate-950 border-slate-800 text-slate-100',
        tip: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
        textMuted: 'text-slate-400',
        accent: 'text-indigo-400',
        activePill: 'bg-indigo-600 text-white shadow-xs'
      };
    }
    if (readingTheme === 'sepia') {
      return {
        bg: 'bg-[#f6efe1] text-[#3d312a]',
        bar: 'bg-[#ede3ce] border-[#d8cbb1] text-[#34271f]',
        subBar: 'bg-[#e7dcbf] border-[#d8cbb1] text-[#34271f]',
        card: 'bg-[#eee4cf] border-[#dacdb5] text-[#3d312a]',
        codeBg: 'bg-[#29221b] border-[#44382d] text-[#f2e9dc]',
        tip: 'bg-[#e2d5b6] border-[#cfbea0] text-[#423120]',
        textMuted: 'text-[#6e5d50]',
        accent: 'text-[#8b572a]',
        activePill: 'bg-[#8b572a] text-white shadow-xs'
      };
    }
    // light
    return {
      bg: 'bg-slate-50 text-slate-900',
      bar: 'bg-white border-slate-200 text-slate-800',
      subBar: 'bg-slate-100/90 border-slate-200 text-slate-700',
      card: 'bg-white border-slate-200 shadow-xs text-slate-800',
      codeBg: 'bg-slate-900 border-slate-800 text-slate-100',
      tip: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      textMuted: 'text-slate-500',
      accent: 'text-indigo-600',
      activePill: 'bg-indigo-600 text-white shadow-xs'
    };
  };

  const theme = getThemeStyles();
  const pdfUrl = item.pdfPath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const googleDocsEmbedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <div className={cn("fixed inset-0 z-[150] flex flex-col page-anim select-none", theme.bg)}>
      {/* XP Toast */}
      {showXpToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-bounce border border-amber-300/40">
          <Zap size={16} fill="currentColor" />
          <span>{lang === 'en' ? 'Chapter Finished! +10 XP 🔥' : 'Sura Imekamilika! +10 XP Umejipatia 🔥'}</span>
        </div>
      )}

      {/* Main Header */}
      <header className={cn("h-14 flex items-center px-3 sm:px-4 justify-between border-b shrink-0 transition-colors z-20 backdrop-blur-md", theme.bar)}>
        {/* Back Button */}
        <button 
          onClick={onClose} 
          className="p-2 -ml-1 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
          title="Funga / Rudi Nyuma"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Title and Badge */}
        <div className="text-center truncate px-2 min-w-0 flex-1">
          <h2 className="font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[320px] mx-auto">
            {item.title}
          </h2>
          <div className={cn("text-[10px] flex items-center justify-center gap-1.5 mt-0.5", theme.textMuted)}>
            <span className="font-semibold uppercase tracking-wider">{item.level || 'Beginner'}</span>
            <span>•</span>
            <span>{activeMode === 'reader' ? (lang === 'en' ? 'Interactive Guide' : 'Mwongozo wa Kitabu') : 'PDF Document'}</span>
          </div>
        </div>

        {/* Right Actions: Mode Switcher & Controls */}
        <div className="flex items-center gap-1.5">
          {/* Mode Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
            <button
              onClick={() => setActiveMode('reader')}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all",
                activeMode === 'reader' ? theme.activePill : "opacity-60 hover:opacity-100"
              )}
              title="Soma Mwongozo wa Kitabu Hapa"
            >
              <BookOpen size={12} />
              <span className="hidden sm:inline">Kitabu</span>
            </button>
            <button
              onClick={() => setActiveMode('pdf')}
              className={cn(
                "px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all",
                activeMode === 'pdf' ? theme.activePill : "opacity-60 hover:opacity-100"
              )}
              title="Tazama Faili Halisi la PDF"
            >
              <FileText size={12} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>

          {/* External Open / Download Link */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title="Fungua au Pakua PDF kwenye Kichupo Kipya"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </header>

      {/* Secondary Controls Toolbar (Theme, Font Size, Progress) */}
      <div className={cn("h-10 px-3 sm:px-4 border-b flex items-center justify-between text-xs shrink-0 transition-colors z-10", theme.subBar)}>
        {/* Left: Reading Theme Selectors */}
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider mr-1", theme.textMuted)}>
            Theme:
          </span>
          {(['light', 'sepia', 'dark'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setReadingTheme(t)}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-bold capitalize transition-all border",
                readingTheme === t 
                  ? "border-current font-black shadow-xs" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Right: Font Size Controls (Reader Mode) or Zoom (PDF Mode) */}
        {activeMode === 'reader' ? (
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider mr-0.5", theme.textMuted)}>
              Size:
            </span>
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFontSize(s)}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] transition-all border",
                  fontSize === s 
                    ? "border-current font-black" 
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                {s === 'sm' ? 'A-' : s === 'md' ? 'A' : 'A+'}
              </button>
            ))}

            {/* AI Assistant Button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="ml-1.5 h-6 px-2 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
              title="Uliza Mwalimu wa AI kuhusu sura hii"
            >
              <Sparkles size={11} className="text-amber-400" />
              <span className="hidden sm:inline">AI Help</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(z => Math.max(z - 15, 60))}
              className="p-1 rounded opacity-70 hover:opacity-100"
              title="Punguza Ukubwa"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] font-mono px-1">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(z + 15, 160))}
              className="p-1 rounded opacity-70 hover:opacity-100"
              title="Ongeza Ukubwa"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Mode 1: Interactive In-App Book / Guide Reader (The High-Craft Experience) */}
      {activeMode === 'reader' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chapter Selector & Progress Header Strip */}
          <div className={cn("px-3 sm:px-4 py-2 border-b shrink-0 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar", theme.subBar)}>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold font-mono">
                Sura {chapterIdx + 1}/{guide.chapters.length}
              </span>
              <span className={cn("text-[11px]", theme.textMuted)}>•</span>
              <span className="text-[11px] font-bold text-emerald-500 font-mono">
                {progressPercent}% Kamilifu
              </span>
            </div>

            {/* Chapter Pills Carousel */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {guide.chapters.map((ch, idx) => {
                const isCurrent = chapterIdx === idx;
                const isDone = !!completedChapters[`${item.id}_${idx}`];

                return (
                  <button
                    key={ch.id}
                    onClick={() => setChapterIdx(idx)}
                    className={cn(
                      "h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all border",
                      isCurrent 
                        ? theme.activePill 
                        : "bg-black/5 dark:bg-white/5 border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-black/10 dark:bg-white/10 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate max-w-[110px] sm:max-w-[160px]">
                      {ch.title.replace(/^\d+\.\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Reading Canvas */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Chapter Banner */}
              <div className={cn("p-4 sm:p-5 rounded-2xl border space-y-3", theme.card)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Sura ya {chapterIdx + 1}
                      </span>
                      <span className={cn("text-[11px] font-mono", theme.textMuted)}>
                        • Muda wa Kusoma: {currentChapter.duration}
                      </span>
                    </div>
                    <h1 className={cn(
                      "font-extrabold leading-snug tracking-tight",
                      fontSize === 'sm' ? 'text-lg sm:text-xl' : fontSize === 'md' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                    )}>
                      {currentChapter.title}
                    </h1>
                  </div>

                  {/* Complete Button */}
                  <button
                    onClick={() => toggleChapterComplete(chapterIdx)}
                    className={cn(
                      "h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 self-start sm:self-auto border",
                      completedChapters[`${item.id}_${chapterIdx}`]
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-black/5 dark:bg-white/10 hover:bg-black/10 opacity-80 hover:opacity-100 border-black/10 dark:border-white/10"
                    )}
                  >
                    {completedChapters[`${item.id}_${chapterIdx}`] ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>{lang === 'en' ? 'Chapter Done' : 'Imekamilika'}</span>
                      </>
                    ) : (
                      <>
                        <Circle size={15} />
                        <span>{lang === 'en' ? 'Mark Done (+10 XP)' : 'Weka Imekamilika (+10 XP)'}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className={cn("text-xs sm:text-sm leading-relaxed pt-2 border-t border-black/10 dark:border-white/10", theme.textMuted)}>
                  {currentChapter.summary}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {currentChapter.sections.map((section, sIdx) => (
                  <div key={sIdx} className={cn("p-4 sm:p-5 rounded-2xl border space-y-4 shadow-xs", theme.card)}>
                    <h3 className={cn(
                      "font-bold leading-snug flex items-center gap-2",
                      fontSize === 'sm' ? 'text-sm sm:text-base' : fontSize === 'md' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                    )}>
                      <span className={cn("text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10", theme.accent)}>
                        {sIdx + 1}
                      </span>
                      <span>{section.heading}</span>
                    </h3>

                    {/* Paragraph Content */}
                    <div className={cn(
                      "leading-relaxed whitespace-pre-line select-text",
                      fontSize === 'sm' ? 'text-xs sm:text-sm' : fontSize === 'md' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                    )}>
                      {section.content}
                    </div>

                    {/* Pro Tip Box */}
                    {section.tip && (
                      <div className={cn("p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed", theme.tip)}>
                        <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Dokezo la Kitaalamu (Pro-Tip):</span>
                          <span>{section.tip}</span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Code Example Box */}
                    {section.codeExample && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              {section.codeExample.language}
                            </span>
                            <span className={cn("text-xs font-bold truncate max-w-[200px] sm:max-w-none", theme.textMuted)}>
                              {section.codeExample.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyCode(`${chapterIdx}_${sIdx}`, section.codeExample!.code)}
                              className="h-7 px-2.5 rounded-lg text-xs font-semibold bg-black/10 dark:bg-white/10 hover:bg-black/20 text-current flex items-center gap-1 transition-all"
                              title="Nakili msimbo huu"
                            >
                              {copiedSnippetId === `${chapterIdx}_${sIdx}` ? (
                                <>
                                  <Check size={13} className="text-emerald-400" />
                                  <span className="text-[11px] text-emerald-400">Imenakiliwa!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  <span className="text-[11px] hidden sm:inline">Nakili</span>
                                </>
                              )}
                            </button>

                            {/* Try in Code Sandbox Button */}
                            <button
                              onClick={() => handleOpenInSandbox(section.codeExample!)}
                              className="h-7 px-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                              title="Jaribu na uendeshe msimbo huu kwenye Sandbox"
                            >
                              <Code2 size={13} />
                              <span className="text-[11px]">Jaribu Kwenye Sandbox</span>
                            </button>
                          </div>
                        </div>

                        {/* Code Display */}
                        <div className={cn("rounded-xl border p-3 font-mono text-xs overflow-x-auto select-text leading-normal", theme.codeBg)}>
                          <pre>
                            <code>{section.codeExample.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chapter Navigation Footer */}
              <div className={cn("p-4 rounded-2xl border flex items-center justify-between gap-2 shadow-xs", theme.card)}>
                <button
                  disabled={chapterIdx === 0}
                  onClick={() => setChapterIdx(c => Math.max(c - 1, 0))}
                  className="h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft size={16} />
                  <span>Sura Iliyopita</span>
                </button>

                <button
                  onClick={() => toggleChapterComplete(chapterIdx)}
                  className={cn(
                    "h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all",
                    completedChapters[`${item.id}_${chapterIdx}`]
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500"
                  )}
                >
                  <CheckCircle2 size={15} />
                  <span className="hidden sm:inline">
                    {completedChapters[`${item.id}_${chapterIdx}`] ? 'Imekamilika ✓' : 'Kamilisha Sura Hii (+10 XP)'}
                  </span>
                  <span className="sm:hidden">
                    {completedChapters[`${item.id}_${chapterIdx}`] ? 'Tayari ✓' : '+10 XP'}
                  </span>
                </button>

                {chapterIdx < guide.chapters.length - 1 ? (
                  <button
                    onClick={() => setChapterIdx(c => c + 1)}
                    className="h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs"
                  >
                    <span>Sura Inayofuata</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="h-9 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 transition-all shadow-xs"
                  >
                    <span>Kamilisha Mwongozo 🎉</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Original PDF Document (With Smart Fallback so user NEVER sees a broken icon) */}
      {activeMode === 'pdf' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Friendly Mobile/Iframe Helper Banner */}
          <div className="bg-indigo-950/80 border-b border-indigo-800/80 px-3 sm:px-4 py-2 text-xs text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>
                Kivinjari kinazuia kuonyesha PDF? Unaweza kusoma kitabu au kufungua nje:
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveMode('reader')}
                className="h-7 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all"
              >
                <BookOpen size={12} />
                <span>Soma Kitabu Hapa</span>
              </button>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all border border-slate-700"
              >
                <ExternalLink size={12} />
                <span>Tab Mpya</span>
              </a>
              <a
                href={pdfUrl}
                download={`${item.title}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="h-7 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-all border border-slate-700"
              >
                <Download size={12} />
                <span>Pakua</span>
              </a>
            </div>
          </div>

          {/* PDF Frame Container using Google Docs Viewer Embed */}
          <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-slate-950/80">
            <div 
              className="w-full h-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 transition-transform duration-200 relative flex flex-col"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <iframe 
                src={googleDocsEmbedUrl}
                className="w-full flex-1 min-h-[550px] border-none bg-white rounded-2xl"
                title={`${item.title} PDF`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Code Playground Modal if launched from a code snippet */}
      {activeSnippetForPlayground && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="absolute inset-0" onClick={() => setActiveSnippetForPlayground(null)} />
          <div className="relative w-full max-w-7xl bg-[#0f172a] border border-slate-800 rounded-3xl p-3 sm:p-6 shadow-2xl my-auto z-10 max-h-[96vh] overflow-y-auto">
            <CodePlayground 
              initialSnippet={activeSnippetForPlayground}
              onClose={() => setActiveSnippetForPlayground(null)} 
            />
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
