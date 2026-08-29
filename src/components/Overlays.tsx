import React, { useState, useEffect } from 'react';
import { CodApp, ContentItem, Question } from '../types';
import { 
  X, 
  Star, 
  Download, 
  Play, 
  Trophy, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  RotateCcw,
  Sparkles,
  Share2,
  Award,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { useApp } from '../contexts/AppContext';

// --- APP DETAIL OVERLAY ---
export const AppDetailOverlay: React.FC<{ app: CodApp; onClose: () => void }> = ({ app, onClose }) => {
  const { lang, reviews, addReview, user } = useApp();
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const appReviews = reviews.filter(r => r.itemId === app.id);
  const avgRating = appReviews.length > 0
    ? (appReviews.reduce((acc, curr) => acc + curr.rating, 0) / appReviews.length).toFixed(1)
    : app.rating || '4.9';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addReview({
      itemId: app.id,
      userId: user?.uid || 'guest',
      userName: user?.displayName || user?.email?.split('@')[0] || 'Mtumiaji',
      rating,
      comment: comment.trim()
    });

    setComment('');
    setShowReviewForm(false);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-theme overflow-y-auto page-anim text-text1">
      <header className="sticky top-0 bg-theme/90 backdrop-blur-xl h-14 flex items-center px-4 justify-between border-b border-theme z-10">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-card2 active:scale-95 transition-transform">
          <X size={22} />
        </button>
        <h2 className="font-bold truncate max-w-[200px] text-xs sm:text-sm">{app.name}</h2>
        <button 
          onClick={() => window.open(app.url, '_blank')}
          className="bg-primary hover:bg-primary-hover active:scale-95 transition-all text-white text-[10px] font-black px-4 h-8 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-primary/20"
        >
          <span>{lang === 'en' ? 'Get App' : 'Pakua'}</span>
          <ExternalLink size={12} />
        </button>
      </header>

      <div className="p-4 sm:p-6 pb-24 space-y-6 max-w-2xl mx-auto w-full">
        {/* App Hero */}
        <div className="flex items-start gap-4 sm:gap-6 bg-card p-5 sm:p-6 rounded-3xl border border-theme shadow-lg">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-card2 border border-theme flex items-center justify-center text-4xl sm:text-5xl shadow-md shrink-0 overflow-hidden">
            {app.iconB64 ? <img src={app.iconB64} className="w-full h-full object-cover" alt={app.name} /> : <span>{app.icon}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black font-poppins truncate">{app.name}</h1>
            <p className="text-text3 text-xs sm:text-sm font-medium mt-0.5">{app.developer}</p>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-ok/10 text-ok border border-ok/20">
                {app.price === 0 ? 'FREE' : formatPrice(app.price)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-card2 text-text2 border border-theme flex items-center gap-1">
                <ShieldCheck size={12} className="text-primary" /> Verified Safe
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 bg-card2 p-3.5 rounded-2xl border border-theme divide-x divide-theme text-center">
          <div>
            <div className="text-xs sm:text-sm font-black flex items-center justify-center gap-1">
              <Star size={14} className="text-gold" fill="currentColor" /> {avgRating}
            </div>
            <div className="text-[10px] text-text3 uppercase font-bold mt-0.5">{lang === 'en' ? 'Rating' : 'Ukadiriaji'}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase text-text2">{app.size || '35MB'}</div>
            <div className="text-[10px] text-text3 uppercase font-bold mt-0.5">{lang === 'en' ? 'Size' : 'Ukubwa'}</div>
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase text-text2">4+</div>
            <div className="text-[10px] text-text3 uppercase font-bold mt-0.5">{lang === 'en' ? 'Age' : 'Umri'}</div>
          </div>
        </div>

        {/* Screenshots Carousel */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold px-1 uppercase tracking-widest text-[10px] text-text3">
              {lang === 'en' ? 'Screenshots' : 'Picha za Programu'}
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {app.screenshots.map((s, i) => (
                <img 
                  key={i} 
                  src={s.data} 
                  onClick={() => setSelectedImg(s.data)}
                  className="h-56 sm:h-64 rounded-2xl shadow-md shrink-0 border border-theme cursor-pointer hover:scale-[1.02] transition-transform object-cover" 
                  alt={`Screenshot ${i + 1}`} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2 bg-card p-5 rounded-3xl border border-theme">
          <h3 className="font-bold uppercase tracking-widest text-[10px] text-text3">
            {lang === 'en' ? 'About this application' : 'Kuhusu Programu Hii'}
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-text2">
            {app.fullDesc || app.desc}
          </p>
        </div>

        {/* Changelog / What's New */}
        {app.changelog && (
          <div className="bg-card2 p-5 rounded-3xl border border-theme space-y-2">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{lang === 'en' ? "What's New" : 'Maboresho Mapya'}</span>
            </h3>
            <p className="text-xs leading-relaxed whitespace-pre-wrap text-text2">{app.changelog}</p>
          </div>
        )}

        {/* Reviews Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-text3">
              {lang === 'en' ? 'User Reviews' : 'Maoni ya Watumiaji'} ({appReviews.length})
            </h3>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs text-primary font-bold hover:underline"
            >
              {showReviewForm ? (lang === 'en' ? 'Cancel' : 'Ghairi') : (lang === 'en' ? '+ Write Review' : '+ Toa Maoni')}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-card p-4 rounded-2xl border border-theme space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text2">{lang === 'en' ? 'Rating:' : 'Nyota:'}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className={cn("p-1 transition-colors", s <= rating ? "text-gold" : "text-text3/30")}
                    >
                      <Star size={16} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                placeholder={lang === 'en' ? 'Write your feedback...' : 'Andika maoni yako kuhusu programu hii...'}
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-card2 border border-theme rounded-xl p-3 text-xs text-text1 placeholder:text-text3 outline-none focus:border-primary resize-none"
              />

              <button
                type="submit"
                className="w-full h-10 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
              >
                {lang === 'en' ? 'Post Review' : 'Tuma Maoni'}
              </button>
            </form>
          )}

          <div className="space-y-2">
            {appReviews.length === 0 ? (
              <div className="text-center py-6 text-xs text-text3 bg-card2 rounded-2xl border border-theme">
                {lang === 'en' ? 'No reviews yet. Be the first!' : 'Hakuna maoni bado. Kuwa wa kwanza kutoa maoni!'}
              </div>
            ) : (
              appReviews.map(r => (
                <div key={r.id} className="bg-card p-3.5 rounded-2xl border border-theme space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{r.userName}</span>
                    <div className="flex items-center text-gold">
                      {Array.from({ length: r.rating }).map((_, idx) => (
                        <Star key={idx} size={10} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-text2">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Install CTA Button */}
        <button 
          onClick={() => window.open(app.url, '_blank')}
          className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-95 text-white rounded-2xl font-black shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all"
        >
          <Download size={20} />
          <span>{lang === 'en' ? 'INSTALL & LAUNCH APP' : 'PAKUA NA FUNGUA PROGRAMU'}</span>
        </button>
      </div>

      {/* Lightbox for screenshots */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" alt="Enlarged screenshot" />
        </div>
      )}
    </div>
  );
};

// --- BUY MODAL ---
export const BuyModal: React.FC<{ item: ContentItem; onConfirm: () => void; onClose: () => void }> = ({ item, onConfirm, onClose }) => {
  const { lang } = useApp();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 page-anim">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-sm rounded-3xl border border-theme shadow-2xl p-6 text-center text-text1">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
          {item.icon || '📦'}
        </div>
        <h3 className="text-base sm:text-lg font-black mb-1">{item.title}</h3>
        <p className="text-xs text-text3 mb-4">{lang === 'en' ? 'Get lifetime access to this content' : 'Pata ufikiaji wa kudumu wa somo hili'}</p>
        
        <div className="bg-card2 border border-theme p-4 rounded-2xl mb-5">
          <div className="text-[10px] font-bold text-text3 uppercase tracking-wider mb-1">
            {lang === 'en' ? 'Total Investment' : 'Gharama ya Jumla'}
          </div>
          <div className="text-2xl font-black text-primary">{formatPrice(item.price)}</div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button 
            onClick={onConfirm}
            className="w-full h-12 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/25 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles size={16} className="text-gold" />
            <span>{lang === 'en' ? 'Add to Cart & Checkout' : 'Weka Kwenye Kikapu & Lipa'}</span>
          </button>
          <button 
            onClick={onClose}
            className="w-full h-11 text-text3 font-bold hover:bg-card2 rounded-2xl transition-colors text-xs"
          >
            {lang === 'en' ? 'Cancel' : 'Ghairi'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- QUIZ RUNNER ---
export const QuizOverlay: React.FC<{ 
  test: ContentItem; 
  onClose: (score?: number) => void;
  onOpenCertificate?: (score: number) => void;
}> = ({ test, onClose, onOpenCertificate }) => {
  const { lang, addPoints } = useApp();
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState((test.timeLimit || 10) * 60);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const questions = test.questions || [];
  const currQ = questions[qIdx];

  useEffect(() => {
    if (finished || reviewMode) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { 
          clearInterval(timer); 
          onFinish(); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, reviewMode, score, answers]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    setAnswers(prev => ({ ...prev, [qIdx]: opt }));
    if (opt === currQ.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1);
      setSelected(answers[qIdx + 1] || null);
    } else {
      onFinish();
    }
  };

  const onFinish = () => {
    setFinished(true);
    let finalScoreCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) finalScoreCount++;
    });
    const finalScore = questions.length > 0 ? Math.round((finalScoreCount / questions.length) * 100) : 0;
    addPoints(finalScore >= 60 ? 100 : 30);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  let correctCount = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correct) correctCount++;
  });
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const passed = scorePercent >= 60;

  return (
    <div className="fixed inset-0 z-[150] bg-theme flex flex-col page-anim text-text1 select-none overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-card flex items-center justify-between px-4 border-b border-theme shrink-0">
        <button onClick={() => onClose(finished ? scorePercent : undefined)} className="p-2 rounded-full hover:bg-card2">
          <X size={20} />
        </button>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] font-black uppercase text-text3 tracking-widest truncate max-w-[180px]">
            {test.title}
          </span>
          {!finished && (
            <span className="text-gold font-mono font-bold text-sm flex items-center gap-1">
              <Clock size={12} /> {formatTime(timeLeft)}
            </span>
          )}
        </div>
        <div className="w-10 text-right font-black text-xs text-text2">
          {!finished ? `${qIdx + 1}/${questions.length}` : ''}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl mx-auto w-full flex flex-col justify-center">
        {!finished ? (
          <div className="space-y-6 my-auto">
            {/* Progress line */}
            <div className="w-full h-2 bg-card2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Box */}
            <div className="min-h-[100px] flex flex-col justify-center bg-card border border-theme p-6 rounded-3xl shadow-lg">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">
                {lang === 'en' ? `Question ${qIdx + 1}` : `Swali la ${qIdx + 1}`}
              </span>
              <h2 className="text-base sm:text-lg font-bold font-poppins leading-relaxed">{currQ?.q}</h2>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {['a', 'b', 'c', 'd'].map(opt => {
                const val = currQ?.[opt as keyof Question] as string;
                if (!val) return null;
                const isSelected = selected === opt;
                const isCorrect = selected && opt === currQ.correct;
                const isWrong = selected === opt && opt !== currQ.correct;

                return (
                  <button
                    key={opt}
                    disabled={!!selected}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left text-xs sm:text-sm font-semibold",
                      !selected && "border-theme bg-card hover:border-primary active:scale-98",
                      isCorrect && "border-ok bg-ok/10 text-ok",
                      isWrong && "border-err bg-err/10 text-err",
                      selected && !isSelected && opt === currQ.correct && "border-ok bg-ok/10 text-ok",
                      selected && !isSelected && opt !== currQ.correct && "opacity-40 border-theme"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                      !selected && "bg-card2 text-text2",
                      isCorrect && "bg-ok text-white",
                      isWrong && "bg-err text-white",
                      selected && !isSelected && opt === currQ.correct && "bg-ok text-white"
                    )}>
                      {opt.toUpperCase()}
                    </div>
                    <span className="flex-1">{val}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box on answer */}
            {selected && currQ?.explanation && (
              <div className="bg-card2 border border-primary/20 rounded-2xl p-4 text-xs text-text2 space-y-1 page-anim">
                <div className="font-bold text-primary flex items-center gap-1 text-[11px]">
                  <Sparkles size={12} /> {lang === 'en' ? 'Explanation:' : 'Ufafanuzi:'}
                </div>
                <p className="leading-relaxed">{currQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {selected && (
              <div className="pt-2">
                <button 
                  onClick={handleNext}
                  className="w-full h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-95 text-white rounded-2xl font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all"
                >
                  <span>{qIdx === questions.length - 1 ? (lang === 'en' ? 'Finish Exam' : 'Kamilisha Mtihani') : (lang === 'en' ? 'Next Question' : 'Swali Linalofuata')}</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : !reviewMode ? (
          /* Results Card */
          <div className="space-y-6 my-auto text-center py-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 shadow-2xl",
              passed ? "border-ok bg-ok/10 text-ok" : "border-err bg-err/10 text-err"
            )}>
              {passed ? <Award size={48} /> : <AlertCircle size={48} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black">{passed ? (lang === 'en' ? 'Congratulations! 🎉' : 'Hongera Sana! 🎉') : (lang === 'en' ? 'Keep Learning! 📚' : 'Endelea Kujifunza! 📚')}</h3>
              <p className="text-xs sm:text-sm text-text3 max-w-sm mx-auto">
                {passed 
                  ? (lang === 'en' ? `You passed with ${scorePercent}% score! You have earned +100 XP.` : `Umefaulu kwa alama ${scorePercent}%! Umejipatia pointi +100 XP.`)
                  : (lang === 'en' ? `You scored ${scorePercent}%. Passing grade is 60%.` : `Umepata ${scorePercent}%. Alama ya kufaulu ni 60%.`)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <div className="bg-card border border-theme rounded-2xl p-3">
                <div className="text-[10px] text-text3 uppercase font-bold">{lang === 'en' ? 'Correct' : 'Sahihi'}</div>
                <div className="text-lg font-black text-ok">{correctCount} / {questions.length}</div>
              </div>
              <div className="bg-card border border-theme rounded-2xl p-3">
                <div className="text-[10px] text-text3 uppercase font-bold">{lang === 'en' ? 'Score' : 'Alama'}</div>
                <div className="text-lg font-black text-gold">{scorePercent}%</div>
              </div>
            </div>

            <div className="space-y-2.5 max-w-xs mx-auto pt-2">
              {passed && onOpenCertificate && (
                <button
                  onClick={() => onOpenCertificate(scorePercent)}
                  className="w-full h-12 bg-gradient-to-r from-gold to-amber-500 text-black font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold/20 active:scale-95 transition-all"
                >
                  <Award size={18} />
                  <span>{lang === 'en' ? 'Claim Certificate' : 'Tazama & Pakua Cheti'}</span>
                </button>
              )}

              <button
                onClick={() => setReviewMode(true)}
                className="w-full h-12 bg-card hover:bg-card2 text-text1 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-theme"
              >
                <HelpCircle size={16} />
                <span>{lang === 'en' ? 'Review All Explanations' : 'Kagua Majibu & Maelezo'}</span>
              </button>

              <button
                onClick={() => {
                  setAnswers({});
                  setFinished(false);
                  setQIdx(0);
                  setSelected(null);
                  setScore(0);
                  setTimeLeft((test.timeLimit || 10) * 60);
                }}
                className="w-full h-11 text-text3 hover:text-text1 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={14} />
                <span>{lang === 'en' ? 'Retake Exam' : 'Rudia Mtihani'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Comprehensive Review Mode */
          <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-text1 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-ok" />
                <span>{lang === 'en' ? 'Exam Review & Answer Keys' : 'Ukaguzi wa Majibu & Sababu'}</span>
              </h3>
              <button 
                onClick={() => setReviewMode(false)}
                className="text-xs text-primary font-bold hover:underline"
              >
                {lang === 'en' ? 'Back to Score' : 'Rudi'}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isRight = userAns === q.correct;

                return (
                  <div key={idx} className="bg-card border border-theme rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-text1">
                        {idx + 1}. {q.q}
                      </span>
                      {isRight ? (
                        <span className="px-2 py-0.5 rounded bg-ok/10 text-ok text-[10px] font-black shrink-0">✓ Sahihi</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-err/10 text-err text-[10px] font-black shrink-0">✗ Si Sahihi</span>
                      )}
                    </div>

                    <div className="text-xs space-y-1 pl-2">
                      <div className="text-text3">
                        {lang === 'en' ? 'Your answer:' : 'Jibu lako:'} <span className={isRight ? "text-ok font-bold" : "text-err font-bold"}>{userAns ? `${userAns.toUpperCase()}) ${q[userAns as keyof Question]}` : (lang === 'en' ? 'None' : 'Haukujibu')}</span>
                      </div>
                      {!isRight && (
                        <div className="text-ok">
                          {lang === 'en' ? 'Correct answer:' : 'Jibu sahihi:'} <span className="font-bold">{q.correct.toUpperCase()}) {q[q.correct as keyof Question]}</span>
                        </div>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="bg-card2 border border-primary/20 rounded-xl p-3 text-[11px] text-text2 space-y-1">
                        <div className="font-bold text-primary flex items-center gap-1">
                          <Sparkles size={12} /> {lang === 'en' ? 'Explanation:' : 'Maelezo:'}
                        </div>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
