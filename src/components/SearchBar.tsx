import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, X, BookOpen, Award, Video, Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface SearchBarProps {
  onSelectContent: (id: string) => void;
  onSelectApp: (id: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectContent, onSelectApp }) => {
  const { courses, tests, lectures, apps, lang } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'courses' | 'tests' | 'lectures' | 'apps' | 'free'>('all');
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const matchedCourses = courses.map(c => ({ ...c, iconB64: c.coverB64, typeLabel: lang === 'en' ? 'Course' : 'Kozi', itemType: 'course' as const }));
    const matchedTests = tests.map(t => ({ ...t, iconB64: t.coverB64, typeLabel: lang === 'en' ? 'Test' : 'Mtihani', itemType: 'test' as const }));
    const matchedLectures = lectures.map(l => ({ ...l, iconB64: l.coverB64, typeLabel: lang === 'en' ? 'Lecture' : 'Kipindi', itemType: 'lecture' as const }));
    const matchedApps = apps.map(a => ({ 
      id: a.id, 
      title: a.name, 
      desc: a.desc, 
      price: a.price, 
      isFree: a.price === 0, 
      icon: a.icon, 
      iconB64: a.iconB64,
      typeLabel: 'App', 
      itemType: 'app' as const 
    }));

    let combined = [...matchedCourses, ...matchedTests, ...matchedLectures, ...matchedApps];

    if (filterType === 'courses') combined = combined.filter(x => x.itemType === 'course');
    if (filterType === 'tests') combined = combined.filter(x => x.itemType === 'test');
    if (filterType === 'lectures') combined = combined.filter(x => x.itemType === 'lecture');
    if (filterType === 'apps') combined = combined.filter(x => x.itemType === 'app');
    if (filterType === 'free') combined = combined.filter(x => x.isFree || x.price === 0);

    return combined.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.desc.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, filterType, courses, tests, lectures, apps, lang]);

  return (
    <div className="relative z-30 w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-card border border-theme rounded-2xl p-1.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <div className="pl-3 pr-2 text-text3">
          <Search size={18} className="text-primary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={lang === 'en' ? 'Search courses, tests, lectures & apps...' : 'Tafuta kozi, mtihani, somo, au app...'}
          className="w-full bg-transparent text-xs sm:text-sm text-text1 placeholder:text-text3 outline-none py-1.5 pr-8"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="p-1.5 text-text3 hover:text-text1 hover:bg-card2 rounded-lg transition-colors absolute right-2"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && query.trim().length > 0 && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-theme rounded-2xl shadow-2xl z-30 overflow-hidden page-anim">
            {/* Quick Category Filter Chips */}
            <div className="flex items-center gap-1.5 p-2.5 bg-card2/60 border-b border-theme overflow-x-auto scrollbar-none text-[11px]">
              {(['all', 'courses', 'tests', 'lectures', 'apps', 'free'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    filterType === tab 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-card text-text3 hover:text-text1 border border-theme'
                  }`}
                >
                  {tab === 'all' ? (lang === 'en' ? 'All' : 'Zote') :
                   tab === 'courses' ? (lang === 'en' ? 'Courses' : 'Kozi') :
                   tab === 'tests' ? (lang === 'en' ? 'Tests' : 'Mitihani') :
                   tab === 'lectures' ? (lang === 'en' ? 'Videos' : 'Vipindi') :
                   tab === 'apps' ? 'Apps' : (lang === 'en' ? 'Free 🎁' : 'Bure 🎁')}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-theme p-1">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-text3 text-xs">
                  <p className="font-semibold">{lang === 'en' ? 'No results found for' : 'Hakuna matokeo ya'} "{query}"</p>
                  <p className="text-[10px] mt-1 text-text3/70">{lang === 'en' ? 'Try searching for HTML, Python, JavaScript or Test' : 'Jaribu kutafuta JavaScript, Python, HTML, au Mtihani'}</p>
                </div>
              ) : (
                searchResults.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                      if (item.itemType === 'app') {
                        onSelectApp(item.id);
                      } else {
                        onSelectContent(item.id);
                      }
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-card2 cursor-pointer transition-colors rounded-xl group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-bg3 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-theme">
                      {item.iconB64 ? (
                        <img src={item.iconB64} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span>{item.icon || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {item.typeLabel}
                        </span>
                        <h4 className="text-xs font-bold text-text1 truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-text3 truncate mt-0.5">{item.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black ${item.isFree || item.price === 0 ? 'text-ok' : 'text-primary'}`}>
                        {item.isFree || item.price === 0 ? 'FREE' : formatPrice(item.price)}
                      </span>
                      <div className="text-[10px] text-text3 flex items-center justify-end gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>{lang === 'en' ? 'Open' : 'Fungua'}</span>
                        <ArrowRight size={10} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
