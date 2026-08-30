import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ContentItem, Category } from '../types';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Code2, 
  BookOpen, 
  Check, 
  Copy, 
  Zap, 
  X, 
  Plus, 
  CheckCircle2, 
  HelpCircle,
  Brain,
  Wand2,
  FileCode
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AIAssistantModal: React.FC<{ 
  onClose: () => void;
  defaultTab?: 'tutor' | 'generator' | 'explainer';
}> = ({ onClose, defaultTab = 'tutor' }) => {
  const { 
    lang, 
    isAdm, 
    askAITutor, 
    generateCourseWithAI, 
    explainCodeErrorWithAI,
    updateCourses,
    courses
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tutor' | 'generator' | 'explainer'>(defaultTab);

  // --- TAB 1: AI TUTOR CHAT ---
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; code?: string }>>([
    {
      role: 'assistant',
      text: 'Habari! Mimi ni CodZnz AI Tutor wako wa Kiswahili. Una swali gani kuhusu HTML, CSS, JavaScript, React, Python au API za Tanzania leo?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // --- TAB 2: AI COURSE GENERATOR (ADMIN) ---
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [category, setCategory] = useState('courses');
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<any | null>(null);
  const [courseSaved, setCourseSaved] = useState(false);

  // --- TAB 3: AI CODE EXPLAINER ---
  const [codeToExplain, setCodeToExplain] = useState(`const sum = (a, b) => a + b;\nconsole.log(sum(5, '10'));`);
  const [explaining, setExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<any | null>(null);

  // Tutor submit
  const handleSendTutorMessage = async (textToSend?: string) => {
    const q = textToSend || inputPrompt;
    if (!q.trim() || isAsking) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInputPrompt('');
    setIsAsking(true);

    const answer = await askAITutor(q);
    setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    setIsAsking(false);
  };

  // Course generation submit
  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGeneratingCourse) return;

    setIsGeneratingCourse(true);
    setGeneratedCourse(null);
    setCourseSaved(false);

    try {
      const result = await generateCourseWithAI(topic, level, category);
      setGeneratedCourse(result);
    } catch (err: any) {
      alert(err.message || 'Hitilafu wakati wa kutengeneza kozi');
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const handleSaveCourseToPlatform = () => {
    if (!generatedCourse) return;
    const newCourseObj: ContentItem = {
      id: 'crs-' + Date.now(),
      title: generatedCourse.title,
      desc: generatedCourse.description,
      category: (category as Category) || 'lectures',
      price: 25000,
      isFree: false,
      level: (level as any) || 'Beginner',
      duration: '4 Weeks',
      icon: 'sparkles',
      rating: 5.0,
      createdAt: Date.now(),
      coverB64: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      episodes: (generatedCourse.lessons || []).map((l: any, i: number) => ({
        title: l.title,
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration: '15 min',
        description: l.summary
      }))
    };

    updateCourses([newCourseObj, ...courses]);
    setCourseSaved(true);
  };

  // Code Explainer submit
  const handleExplainCode = async () => {
    if (!codeToExplain.trim() || explaining) return;
    setExplaining(true);
    const result = await explainCodeErrorWithAI(codeToExplain, 'Kagua msimbo huu na unipe maelezo ya kina ya Kiswahili');
    setExplanationResult(result);
    setExplaining(false);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto page-anim">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-card border border-theme rounded-3xl p-5 sm:p-7 shadow-2xl my-auto z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25">
              <Sparkles size={22} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-text1">
                CodZnz AI Smart Learning Assistant
              </h3>
              <p className="text-xs text-text3">
                {lang === 'en' ? 'Swahili AI Coding Tutor, Curriculum Generator & Bug Explainer' : 'Mwalimu wa AI wa Kiswahili, Mfumo wa Kuunda Kozi na Kutatua Makosa'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card2 hover:bg-card border border-theme text-text2 hover:text-text1 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-theme pb-2">
          <button
            onClick={() => setActiveTab('tutor')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
              activeTab === 'tutor' ? "bg-primary text-white" : "text-text3 hover:text-text1"
            )}
          >
            <Bot size={14} />
            <span>AI Swahili Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('explainer')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
              activeTab === 'explainer' ? "bg-primary text-white" : "text-text3 hover:text-text1"
            )}
          >
            <Code2 size={14} />
            <span>AI Bug Explainer</span>
          </button>

          {isAdm && (
            <button
              onClick={() => setActiveTab('generator')}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5",
                activeTab === 'generator' ? "bg-purple-600 text-white" : "text-text3 hover:text-purple-400"
              )}
            >
              <Wand2 size={14} />
              <span>AI Course Generator ✨</span>
            </button>
          )}
        </div>

        {/* TAB 1: AI TUTOR */}
        {activeTab === 'tutor' && (
          <div className="space-y-4">
            {/* Quick chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                'Nifafanulie Async/Await kwa Kiswahili',
                'Tofauti ya SQL na NoSQL',
                'Jinsi ya kutumia M-Pesa Daraja API',
                'Misingi ya React useEffect'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendTutorMessage(chip)}
                  className="px-2.5 py-1 bg-card2 hover:border-primary border border-theme rounded-lg text-[11px] font-bold text-text2 hover:text-text1 whitespace-nowrap transition-all"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto p-3 bg-card2/40 border border-theme rounded-2xl">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3.5 rounded-2xl text-xs space-y-1.5 max-w-[88%]",
                    m.role === 'user'
                      ? "ml-auto bg-primary text-white font-bold"
                      : "mr-auto bg-card border border-theme text-text1 leading-relaxed shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-black opacity-75">
                    {m.role === 'assistant' && <Sparkles size={11} className="text-amber-400" />}
                    <span>{m.role === 'user' ? 'Wewe' : 'CodZnz AI Tutor'}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              ))}
              {isAsking && (
                <div className="p-3 bg-card border border-theme rounded-2xl text-xs text-text3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>AI Inaandika ufafanuzi wa Kiswahili...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={lang === 'en' ? 'Ask any coding question in Swahili or English...' : 'Uliza swali lolote la kodi kwa Kiswahili...'}
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendTutorMessage()}
                className="flex-1 h-11 px-4 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-primary"
              />
              <button
                onClick={() => handleSendTutorMessage()}
                disabled={isAsking || !inputPrompt.trim()}
                className="h-11 px-4 bg-primary hover:opacity-90 active:scale-95 disabled:opacity-40 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send size={15} />
                <span>Tuma</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AI COURSE GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-4">
            <form onSubmit={handleGenerateCourse} className="p-4 bg-card2 border border-theme rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 size={14} />
                  <span>AI Smart Course Builder</span>
                </h4>
                <span className="text-[10px] text-text3">Tengeneza mtaala kamili ndani ya sekunde chache</span>
              </div>

              <div>
                <label className="text-[11px] font-black text-text3 uppercase block mb-1">Mada / Lugha ya Kozi *</label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Kujenga REST APIs na Node.js & Express kwa Kiswahili"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full h-11 px-3.5 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase block mb-1">Kiwango (Level)</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full h-10 px-3 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none"
                  >
                    <option value="Beginner">Mwanzo (Beginner)</option>
                    <option value="Intermediate">Kati (Intermediate)</option>
                    <option value="Advanced">Bobezi (Advanced)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-black text-text3 uppercase block mb-1">Aina ya Maudhui</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-card border border-theme rounded-xl text-xs font-bold text-text1 outline-none"
                  >
                    <option value="courses">Kozi Kamili</option>
                    <option value="tests">Mtihani & Mazoezi</option>
                    <option value="lectures">Video / Mihadhara</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingCourse}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={15} className="text-amber-300" />
                <span>{isGeneratingCourse ? 'AI Inatengeneza Kozi...' : 'Tengeneza Mtaala na Mitihani (Generate)'}</span>
              </button>
            </form>

            {generatedCourse && (
              <div className="p-5 bg-card border border-purple-500/30 rounded-2xl space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-theme pb-3">
                  <div>
                    <h4 className="text-base font-black text-text1">{generatedCourse.title}</h4>
                    <p className="text-xs text-text3">{generatedCourse.description}</p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 uppercase">
                    {generatedCourse.level || level}
                  </span>
                </div>

                {/* Lessons Outline */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-text1 uppercase tracking-wider block">Masomo Yaliyoundwa ({generatedCourse.lessons?.length || 0})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {generatedCourse.lessons?.map((l: any, i: number) => (
                      <div key={i} className="p-2.5 bg-card2 border border-theme rounded-xl text-xs space-y-1">
                        <div className="font-bold text-primary">Somo {i + 1}: {l.title}</div>
                        <p className="text-[11px] text-text3">{l.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveCourseToPlatform}
                  disabled={courseSaved}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  {courseSaved ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  <span>{courseSaved ? 'Kozi Imechapishwa kwenye Jukwaa!' : 'Weka Kozi Hii Kwenye CodZnz Pro'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI CODE EXPLAINER */}
        {activeTab === 'explainer' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-text3 uppercase block mb-1">
                Weka Msimbo / Kodi Unayotaka Kufafanuliwa
              </label>
              <textarea
                rows={4}
                value={codeToExplain}
                onChange={e => setCodeToExplain(e.target.value)}
                className="w-full p-3 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl border border-slate-800 outline-none focus:border-primary resize-none"
              />
            </div>

            <button
              onClick={handleExplainCode}
              disabled={explaining}
              className="w-full h-11 bg-primary hover:opacity-90 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles size={15} />
              <span>{explaining ? 'AI Inachambua kodi...' : 'Chambua na Fafanua kwa Kiswahili'}</span>
            </button>

            {explanationResult && (
              <div className="p-4 bg-card2 border border-theme rounded-2xl space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-black text-primary uppercase block">Muhtasari</span>
                  <p className="text-text1">{explanationResult.summary}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-500 uppercase block">Uchambuzi wa Hitilafu / Mantiki</span>
                  <p className="text-text2">{explanationResult.rootCause}</p>
                </div>
                {explanationResult.keyTakeaway && (
                  <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold">
                    💡 Somo Kuu: {explanationResult.keyTakeaway}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
