import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Plus, 
  X, 
  User, 
  ShieldCheck, 
  Code, 
  Clock, 
  Filter,
  Check,
  Bot
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QnAQuestion } from '../types';

export const QnAForumModal: React.FC<{ 
  itemId?: string; 
  itemTitle?: string; 
  onClose?: () => void;
  isEmbedded?: boolean;
}> = ({ itemId, itemTitle, onClose, isEmbedded = false }) => {
  const { 
    lang, 
    user, 
    profile, 
    isAdm, 
    qnaQuestions, 
    addQnAQuestion, 
    addQnAReply, 
    upvoteQnA,
    askAITutor
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unresolved' | 'lesson'>('all');
  const [showAskForm, setShowAskForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QnAQuestion | null>(null);

  // Form State
  const [qTitle, setQTitle] = useState('');
  const [qDetails, setQDetails] = useState('');
  const [qSnippet, setQSnippet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply State
  const [replyText, setReplyText] = useState('');
  const [replySnippet, setReplySnippet] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [aiGeneratingReply, setAiGeneratingReply] = useState(false);

  // Filter Questions
  const filteredQuestions = qnaQuestions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.itemTitle && q.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (selectedFilter === 'unresolved') return !q.isResolved;
    if (selectedFilter === 'lesson' && itemId) return q.itemId === itemId;
    return true;
  });

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim() || !qDetails.trim()) return;

    setIsSubmitting(true);
    await addQnAQuestion({
      itemId,
      itemTitle: itemTitle || 'General Coding',
      title: qTitle.trim(),
      details: qDetails.trim(),
      codeSnippet: qSnippet.trim() || undefined
    });

    setQTitle('');
    setQDetails('');
    setQSnippet('');
    setIsSubmitting(false);
    setShowAskForm(false);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !replyText.trim()) return;

    setIsReplying(true);
    await addQnAReply(selectedQuestion.id, replyText.trim(), replySnippet.trim() || undefined);
    setReplyText('');
    setReplySnippet('');
    setIsReplying(false);
  };

  // AI Instant Tutor Assistance
  const handleAskAITutorReply = async () => {
    if (!selectedQuestion) return;
    setAiGeneratingReply(true);

    const prompt = `Swali la mwanafunzi: "${selectedQuestion.title}"\nMaelezo: ${selectedQuestion.details}\nKodi:\n${selectedQuestion.codeSnippet || 'Hakuna'}`;
    const aiAnswer = await askAITutor(prompt, selectedQuestion.itemTitle, selectedQuestion.codeSnippet);

    await addQnAReply(
      selectedQuestion.id,
      `🤖 [AI Tutor]: ${aiAnswer}`,
      undefined
    );

    setAiGeneratingReply(false);
  };

  const content = (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-theme pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-text1">
              {lang === 'en' ? 'Student Q&A & Community Forum' : 'Sehemu ya Maswali na Majibu (Q&A Forum)'}
            </h3>
            <p className="text-xs text-text3">
              {itemTitle ? `Maswali yanayohusu: ${itemTitle}` : 'Uliza swali, jadili matatizo ya code, au pata msaada kutoka kwa walimu na AI.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAskForm(!showAskForm); setSelectedQuestion(null); }}
            className="h-10 px-4 bg-primary hover:opacity-90 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>{lang === 'en' ? 'Ask a Question' : 'Uliza Swali Jipya'}</span>
          </button>

          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 rounded-xl flex items-center justify-center"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Ask Question Form Drawer */}
      {showAskForm && (
        <form onSubmit={handleAskQuestion} className="bg-card border border-primary/40 rounded-3xl p-5 shadow-lg space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-theme pb-2">
            <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Plus size={14} />
              <span>{lang === 'en' ? 'Post a New Coding Question' : 'Tuma Swali Lako kwenye Jukwaa'}</span>
            </h4>
            <button type="button" onClick={() => setShowAskForm(false)} className="text-xs text-text3 hover:text-text1">Ghairi</button>
          </div>

          <div>
            <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
              {lang === 'en' ? 'Question Title / Error Headline' : 'Kichwa cha Swali / Error unayoipata'} *
            </label>
            <input
              type="text"
              required
              placeholder="Mfano: Kwa nini 'undefined is not a function' inatokea kwenye React?"
              value={qTitle}
              onChange={e => setQTitle(e.target.value)}
              className="w-full h-11 px-3.5 bg-card2 border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
              {lang === 'en' ? 'Detailed Explanation' : 'Maelezo ya Kina'} *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Eleza kile unachojaribu kufanya na wapi umekwama..."
              value={qDetails}
              onChange={e => setQDetails(e.target.value)}
              className="w-full p-3 bg-card2 border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-black text-text3 uppercase tracking-wider block mb-1">
              {lang === 'en' ? 'Code Snippet (Optional)' : 'Kodi Husika (Si lazima)'}
            </label>
            <textarea
              rows={2}
              placeholder="Weka msimbo unaoleta hitilafu hapa..."
              value={qSnippet}
              onChange={e => setQSnippet(e.target.value)}
              className="w-full p-3 bg-card2 border border-theme rounded-xl font-mono text-xs text-text1 outline-none focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-primary hover:opacity-90 active:scale-95 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Inatuma swali...' : (lang === 'en' ? 'Publish Question' : 'Chapisha Swali Lako')}</span>
          </button>
        </form>
      )}

      {/* Main Layout: List of Questions & Active Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Questions List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text3" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search questions...' : 'Tafuta maswali...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-card border border-theme rounded-xl text-xs text-text1 outline-none focus:border-primary"
              />
            </div>
            {itemId && (
              <button
                onClick={() => setSelectedFilter(selectedFilter === 'lesson' ? 'all' : 'lesson')}
                className={cn(
                  "h-10 px-3 rounded-xl text-xs font-bold border transition-all shrink-0",
                  selectedFilter === 'lesson' ? "bg-primary text-white border-primary" : "bg-card border-theme text-text2"
                )}
              >
                Somo Hili
              </button>
            )}
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-card border border-theme rounded-2xl text-xs text-text3 space-y-2">
                <MessageSquare size={28} className="mx-auto opacity-40" />
                <p>{lang === 'en' ? 'No questions found. Be the first to ask!' : 'Hakuna maswali yaliyopatikana. Kuwa wa kwanza kuuliza!'}</p>
              </div>
            ) : (
              filteredQuestions.map(q => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                      isSelected 
                        ? "bg-card border-primary ring-2 ring-primary/20 shadow-md" 
                        : "bg-card hover:bg-card2 border-theme"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] text-text3">
                      <span className="font-bold text-primary truncate max-w-[160px]">{q.itemTitle || 'General'}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-xs font-black text-text1 line-clamp-1">{q.title}</h4>
                    <p className="text-[11px] text-text3 line-clamp-2">{q.details}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-theme/60 text-[10px] text-text3">
                      <span className="font-bold">{q.userName}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <MessageSquare size={11} /> {q.replies.length} majibu
                        </span>
                        {q.isResolved && (
                          <span className="flex items-center gap-0.5 text-emerald-500 font-bold">
                            <CheckCircle2 size={11} /> Imetatuliwa
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Question Thread (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-theme rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[450px]">
          {selectedQuestion ? (
            <>
              {/* Question Header & Body */}
              <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1">
                <div className="space-y-2 border-b border-theme pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {selectedQuestion.itemTitle || 'Coding Topic'}
                    </span>
                    <button
                      onClick={() => upvoteQnA(selectedQuestion.id)}
                      className="px-2.5 py-1 bg-card2 hover:bg-card border border-theme rounded-lg text-xs font-bold text-text2 hover:text-text1 flex items-center gap-1.5"
                    >
                      <ThumbsUp size={12} className="text-primary" />
                      <span>{selectedQuestion.upvotes} Upvotes</span>
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-text1">{selectedQuestion.title}</h3>
                  <p className="text-xs text-text2 leading-relaxed whitespace-pre-wrap">{selectedQuestion.details}</p>

                  {selectedQuestion.codeSnippet && (
                    <pre className="p-3 bg-slate-950 text-indigo-300 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                      {selectedQuestion.codeSnippet}
                    </pre>
                  )}

                  <div className="text-[10px] text-text3 flex items-center gap-2 pt-1">
                    <span>Iliulizwa na: <strong className="text-text1">{selectedQuestion.userName}</strong></span>
                    <span>•</span>
                    <span>{new Date(selectedQuestion.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Replies Thread */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-text1 uppercase tracking-wider">
                      Majibu ({selectedQuestion.replies.length})
                    </h4>

                    {/* Ask AI Tutor for immediate assistance */}
                    <button
                      onClick={handleAskAITutorReply}
                      disabled={aiGeneratingReply}
                      className="text-[11px] px-2.5 py-1 bg-purple-600/15 border border-purple-500/30 text-purple-400 rounded-lg font-bold flex items-center gap-1 hover:bg-purple-600/25 transition-all"
                    >
                      <Sparkles size={12} className="text-amber-300" />
                      <span>{aiGeneratingReply ? 'AI Inaandika Jibu...' : 'Omba Jibu la Papo Hapo la AI'}</span>
                    </button>
                  </div>

                  {selectedQuestion.replies.length === 0 ? (
                    <p className="text-xs text-text3 italic py-4 text-center">
                      Bado hakuna jibu kwenye swali hili. Kuwa wa kwanza kumsaidia mwanafunzi huyu!
                    </p>
                  ) : (
                    selectedQuestion.replies.map(rep => (
                      <div
                        key={rep.id}
                        className={cn(
                          "p-3.5 rounded-2xl border text-xs space-y-1.5",
                          rep.authorRole === 'ai_tutor' || rep.content.includes('[AI Tutor]')
                            ? "bg-purple-500/10 border-purple-500/25"
                            : rep.authorRole === 'instructor' 
                            ? "bg-primary/10 border-primary/25" 
                            : "bg-card2 border-theme"
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-text1">{rep.authorName}</span>
                            {rep.authorRole === 'instructor' && (
                              <span className="px-1.5 py-0.2 rounded bg-primary text-white text-[9px]">Mkufunzi</span>
                            )}
                            {rep.authorRole === 'ai_tutor' && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px] flex items-center gap-0.5">
                                <Bot size={9} /> AI Tutor
                              </span>
                            )}
                          </div>
                          <span className="text-text3">{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <p className="text-text2 leading-relaxed whitespace-pre-wrap">{rep.content}</p>

                        {rep.codeSnippet && (
                          <pre className="p-2 bg-slate-950 text-emerald-300 rounded-lg font-mono text-[10px] overflow-x-auto border border-slate-800">
                            {rep.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-theme space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    placeholder={lang === 'en' ? 'Write a helpful reply or solution...' : 'Andika jibu au suluhisho la kusaidia...'}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="w-full p-3 pr-12 bg-card2 border border-theme rounded-2xl text-xs text-text1 outline-none focus:border-primary resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyText.trim()}
                    className="absolute right-2.5 bottom-3 w-8 h-8 rounded-xl bg-primary hover:opacity-90 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center shadow-md"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-text3">
              <MessageSquare size={40} className="text-primary/30" />
              <h4 className="text-sm font-bold text-text1">{lang === 'en' ? 'Select a Question' : 'Chagua Swali Kushoto'}</h4>
              <p className="text-xs max-w-xs">
                {lang === 'en' ? 'Click on any question from the list to view its full discussion thread and post replies.' : 'Bonyeza swali lolote kwenye orodha kusoma majibu na kutoa ufafanuzi wako.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return <div className="bg-card border border-theme rounded-3xl p-5 shadow-sm">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-card border border-theme rounded-3xl p-6 shadow-2xl my-auto z-10 max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
