
// ... existing imports ...
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArticleData, PrePostTestData, TestMode, SmartToolType, FactualityMode } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExplanationModal } from './ExplanationModal';
import { explainBatch, simplifyText, translateText } from '../services/geminiService';
import { ExamSelectionModal } from './ExamSelectionModal';
import { ArticleChat } from './ArticleChat';
import { ArrowLeft, Sun, Moon, Coffee, Link as LinkIcon, ExternalLink, Menu, Target, CheckCircle, Layout, Clock, FileText, List, ChevronLeft, Book, BarChart, BookOpen, Globe, ShieldCheck, Feather, Sparkles, Zap, AlignLeft, X, Bot, Languages, MessageCircle } from 'lucide-react';

// ... (Keep PreTestOverlay and FactualityBadge components exactly as they are) ...
const PreTestOverlay: React.FC<{ topic: string; onStart: (mode: TestMode) => void; onSkip: () => void }> = ({ topic, onStart, onSkip }) => (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl w-full p-8 md:p-16 rounded-[3rem] shadow-2xl border border-white/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none transform rotate-12"><Target size={300}/></div>
            
            <div className="relative z-10 text-center mb-12">
                <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6"><Target size={48} strokeWidth={1.5} /></div>
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Kalibrasi Pengetahuan Awal</h2>
                <p className="text-xl opacity-60 max-w-xl mx-auto leading-relaxed">Sebelum mendalami materi <span className="font-bold text-blue-600">"{topic}"</span>, mari ukur pemahaman dasar Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 relative z-10">
                {/* Quick Mode */}
                <button onClick={() => onStart('QUICK')} className="group p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:shadow-xl bg-white dark:bg-slate-800 text-left transition-all duration-300">
                    <div className="bg-blue-100 text-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Clock size={28}/></div>
                    <span className="block font-bold text-2xl mb-2 group-hover:text-blue-600 transition-colors">Diagnostik Kilat</span>
                    <div className="h-1 w-12 bg-slate-100 dark:bg-slate-700 mb-4 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                    <ul className="text-sm opacity-60 space-y-2 font-medium">
                        <li>• 10 Pilihan Ganda</li>
                        <li>• ~2 Menit</li>
                        <li>• Fokus: Ingatan Cepat</li>
                    </ul>
                </button>

                 {/* Extended Mode */}
                 <button onClick={() => onStart('EXTENDED')} className="group p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xl bg-white dark:bg-slate-800 text-left transition-all duration-300">
                    <div className="bg-indigo-100 text-indigo-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><List size={28}/></div>
                    <span className="block font-bold text-2xl mb-2 group-hover:text-indigo-600 transition-colors">Komprehensif</span>
                    <div className="h-1 w-12 bg-slate-100 dark:bg-slate-700 mb-4 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                    <ul className="text-sm opacity-60 space-y-2 font-medium">
                        <li>• 20 Pilihan Ganda</li>
                        <li>• ~5 Menit</li>
                        <li>• Fokus: Cakupan Luas</li>
                    </ul>
                </button>

                {/* Detailed Mode */}
                <button onClick={() => onStart('DETAILED')} className="group p-8 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 hover:border-purple-500 hover:shadow-xl bg-white dark:bg-slate-800 text-left transition-all duration-300 relative">
                    <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">AI Graded</div>
                    <div className="bg-purple-100 text-purple-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><FileText size={28}/></div>
                    <span className="block font-bold text-2xl mb-2 group-hover:text-purple-600 transition-colors">Mendalam</span>
                    <div className="h-1 w-12 bg-slate-100 dark:bg-slate-700 mb-4 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                    <ul className="text-sm opacity-60 space-y-2 font-medium">
                        <li>• PG + Esai Singkat</li>
                        <li>• ~8 Menit</li>
                        <li>• <strong>Analisis Kognitif AI</strong></li>
                    </ul>
                </button>

                {/* Skip */}
                <button onClick={onSkip} className="group p-8 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all duration-300 flex flex-col justify-end">
                    <div className="mb-auto">
                        <div className="bg-slate-100 text-slate-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 opacity-50 group-hover:opacity-100"><BookOpen size={28}/></div>
                        <span className="block font-bold text-2xl mb-2 opacity-60 group-hover:opacity-100">Baca Langsung</span>
                        <p className="text-sm opacity-50">Mulai membaca tanpa kalibrasi skor awal.</p>
                    </div>
                    <div className="opacity-40 text-xs font-bold uppercase tracking-wider mt-4 flex items-center gap-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all">Lewati <ArrowLeft size={12} className="rotate-180"/></div>
                </button>
            </div>
        </div>
    </div>
);

const FactualityBadge: React.FC<{ mode?: FactualityMode }> = ({ mode = 'AUTO' }) => {
    const configMap: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        AUTO: { label: 'OTOMATIS', icon: <Bot size={14}/>, color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' },
        STRICT: { label: 'FAKTA KETAT', icon: <ShieldCheck size={14}/>, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
        GROUNDED: { label: 'TERJANGKAR', icon: <BookOpen size={14}/>, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        CREATIVE: { label: 'KREATIF', icon: <Sparkles size={14}/>, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
        FICTION: { label: 'FIKSI MURNI', icon: <Feather size={14}/>, color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' },
    };

    const config = configMap[mode] || configMap.AUTO;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.icon} {config.label}
        </div>
    );
};

// --- MAIN COMPONENT ---
interface ReadingViewProps {
  article: ArticleData;
  onBack: () => void;
  hasTakenPreTest: boolean; 
  hasTakenPostTest: boolean; 
  preTestData: PrePostTestData | null;
  onStartPreTest: (mode: TestMode) => void; 
  onStartPostTest: () => void; 
  onSkipPreTest: () => void; 
  onShowComparison: () => void;
  onStartExam: (type: any) => void; 
  onExplore: () => void;
  scores: any; 
  theme: 'light' | 'dark' | 'sepia'; 
  onToggleTheme: () => void;
  onStartTool?: (type: SmartToolType) => void;
  onSelectTopic?: (topic: string) => void; 
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  article, onBack, hasTakenPreTest, hasTakenPostTest, preTestData, onStartPreTest, onStartPostTest, onSkipPreTest, onShowComparison, onStartExam, onExplore, scores, theme, onToggleTheme, onStartTool, onSelectTopic
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  
  // Explanation Mode: 'EXPLAIN' | 'SIMPLIFY' | 'TRANSLATE'
  const [explanationMode, setExplanationMode] = useState<'EXPLAIN'|'SIMPLIFY'|'TRANSLATE'>('EXPLAIN');

  const [showMenu, setShowMenu] = useState(false);
  const [showChat, setShowChat] = useState(false); // NEW STATE FOR CHAT
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- SELECTION STATE ---
  const [isAiMode, setIsAiMode] = useState(true);
  const [activeSelection, setActiveSelection] = useState<{text: string, rangeRect: DOMRect} | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // SCROLL FIX
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hasTakenPreTest, preTestData]); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setProgress((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      
      // Hide selection tooltip on scroll
      if (activeSelection) {
          setActiveSelection(null);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSelection]);

  // Click outside to close custom tooltip
  useEffect(() => {
      const handleClick = (e: MouseEvent) => {
          if (activeSelection && tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
              setActiveSelection(null);
          }
      };
      
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
      
      return () => {
          document.removeEventListener('mousedown', handleClick);
          document.removeEventListener('touchstart', handleClick);
      };
  }, [activeSelection]);

  const handleTextSelected = useCallback((text: string, rangeRect: DOMRect) => {
      setActiveSelection({ text, rangeRect });
  }, []);

  const triggerAction = async (mode: 'EXPLAIN'|'SIMPLIFY'|'TRANSLATE') => {
      if (!activeSelection) return;
      
      const snippet = activeSelection.text; 
      
      // Hide tooltip
      setActiveSelection(null);
      
      // Clear native selection
      if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
      }

      setSelectedText(snippet); 
      setExplanationMode(mode);
      setShowExplanationModal(true); 
      setIsExplaining(true); 
      setExplanation('');
      
      try {
          let res = "";
          if (mode === 'EXPLAIN') {
              res = await explainBatch([snippet], article.topic);
          } else if (mode === 'SIMPLIFY') {
              res = await simplifyText(snippet, article.topic);
          } else if (mode === 'TRANSLATE') {
              res = await translateText(snippet);
          }
          setExplanation(res);
      } catch {
          setExplanation("Gagal memproses permintaan.");
      } finally {
          setIsExplaining(false);
      }
  };

  const getGradientHeader = () => {
      if(theme === 'sepia') return 'from-amber-100 to-[#fcf6e5]';
      if(theme === 'dark') return 'from-slate-900 via-slate-900 to-slate-950';
      return 'from-blue-50 via-white to-slate-50';
  }

  if (!hasTakenPreTest && !preTestData) return <PreTestOverlay topic={article.topic} onStart={onStartPreTest} onSkip={onSkipPreTest} />;

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-700 cursor-default ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : theme === 'sepia' ? 'bg-[#fcf6e5] text-amber-950' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* TOP NAVIGATION BAR */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out border-b ${scrolled ? 'py-3 backdrop-blur-xl shadow-sm bg-opacity-90' : 'py-4 bg-transparent border-transparent'} ${theme === 'dark' ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
          <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
              <button onClick={onBack} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90" title="Kembali ke Menu">
                  <ArrowLeft size={22} strokeWidth={2.5}/>
              </button>
              <div className={`transition-all duration-500 font-bold text-sm md:text-base truncate max-w-[50%] md:max-w-md text-center ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>{article.topic}</div>
              <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        setIsAiMode(!isAiMode);
                        if(!isAiMode) setActiveSelection(null);
                    }}
                    className={`p-3 rounded-full transition-all active:scale-90 hidden sm:block ${isAiMode ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm ring-2 ring-indigo-500/20' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 opacity-60 hover:opacity-100'}`} 
                    title={isAiMode ? "Matikan Asisten Konteks" : "Aktifkan Asisten Konteks"}
                  >
                      <Sparkles size={20} strokeWidth={isAiMode ? 2.5 : 2} fill={isAiMode ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setShowChat(!showChat)} className={`p-3 rounded-full transition-all active:scale-90 ${showChat ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-black/5 dark:hover:bg-white/10'}`} title="Asisten Chat">
                      <MessageCircle size={20} strokeWidth={2.5} />
                  </button>
                  <button onClick={onToggleTheme} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 group hidden sm:block" title="Ubah Tema">
                      {theme === 'dark' ? <Moon size={20} className="group-hover:-rotate-12 transition-transform"/> : theme === 'sepia' ? <Coffee size={20}/> : <Sun size={20} className="group-hover:rotate-45 transition-transform"/>}
                  </button>
                  <button onClick={() => setShowMenu(true)} className={`p-3 rounded-full transition-all active:scale-90 ${theme === 'sepia' ? 'bg-amber-800 text-white shadow-md' : 'bg-slate-900 text-white shadow-lg'}`} title="Hub Pembelajaran">
                      <Menu size={20} strokeWidth={2.5} />
                  </button>
              </div>
          </div>
          <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100" style={{ width: `${progress}%`, opacity: scrolled ? 1 : 0 }}></div>
      </div>

      {/* Cinematic Header Section */}
      <div className={`relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden bg-gradient-to-b ${getGradientHeader()}`}>
          {!article.mainImage && (
              <>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              </>
          )}
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-current/20 text-xs font-bold uppercase tracking-widest opacity-60 mb-6">
                  <Book size={12}/> Artikel Wawasan
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-serif leading-[1.1] mb-8 tracking-tight text-balance">
                  {article.topic}
              </h1>
              <div className="flex justify-center items-center gap-6 opacity-80 text-sm font-medium">
                  <FactualityBadge mode={article.factualityMode} />
                  <div className="flex items-center gap-2"><BarChart size={16}/> Tingkat Lanjut</div>
              </div>
          </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-12 relative z-20 pb-16">
          <div className={`p-6 md:p-10 rounded-[2.5rem] shadow-xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              
              {article.mainImage && (
                  <div className="mb-12 rounded-[2rem] overflow-hidden shadow-lg border border-black/5 relative group">
                      <img src={article.mainImage} alt={article.topic} className="w-full h-auto block transform transition-transform duration-1000 group-hover:scale-105" />
                  </div>
              )}

              {/* Native Text Selection Area */}
              <div className={`prose-lg md:prose-xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-300 prose-invert' : theme === 'sepia' ? 'text-amber-900' : 'text-slate-800'}`}>
                  <MarkdownRenderer 
                    content={article.content} 
                    fontSize='lg' 
                    onTextSelected={isAiMode ? handleTextSelected : undefined}
                  />
              </div>

              {article.sources && article.sources.length > 0 && (
                  <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-6 opacity-60">
                          <LinkIcon size={16} className="text-slate-500 dark:text-slate-400"/>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              REFERENSI & SUMBER
                          </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {article.sources.map((s, i) => {
                              let hostname = "External Source";
                              try { hostname = new URL(s.uri).hostname.replace(/^www\./, ''); } catch (e) {}
                              return (
                                  <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md transition-all group">
                                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mr-4">
                                          <Globe size={20} strokeWidth={1.5} />
                                      </div>
                                      <div className="flex-grow min-w-0 flex flex-col justify-center">
                                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mb-0.5">{hostname}</span>
                                          <span className="text-[10px] text-slate-400 truncate">{s.title}</span>
                                      </div>
                                      <div className="flex-shrink-0 ml-3 text-slate-300 group-hover:text-blue-500 transition-colors">
                                          <ExternalLink size={16} />
                                      </div>
                                  </a>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>

          {/* Next Steps CTA */}
          {hasTakenPreTest && (
                <div className="mt-12 p-8 md:p-12 rounded-[3rem] bg-slate-900 text-white shadow-2xl text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900"></div>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12"><Target size={250} /></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Eksplorasi Selesai?</h3>
                        <p className="opacity-70 mb-10 text-lg font-light">Saatnya mengevaluasi sejauh mana wawasan Anda berkembang.</p>
                        {!hasTakenPostTest ? (
                            <button onClick={onStartPostTest} className="px-10 py-5 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-blue-50 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all inline-flex items-center gap-3">
                                <CheckCircle size={24}/> Mulai Evaluasi Akhir
                            </button>
                        ) : (
                            <button onClick={onShowComparison} className="px-10 py-5 rounded-full bg-green-500 text-white font-bold text-lg hover:bg-green-400 hover:scale-105 shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] transition-all inline-flex items-center gap-3">
                                <Layout size={24}/> Lihat Laporan Progres
                            </button>
                        )}
                    </div>
                </div>
            )}
      </div>

      {/* --- FIXED FLOATING BOTTOM BAR (REPLACES TOOLTIP) --- */}
      {/* Positioned higher (bottom-24) to avoid bottom screen interference */}
      {activeSelection && (
          <div ref={tooltipRef} className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up flex justify-center">
              <div className={`p-2 rounded-2xl md:rounded-full shadow-2xl flex flex-row items-center gap-2 border border-current/10 backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/90 text-white' : 'bg-white/90 text-slate-900'}`}>
                  
                  {/* Action 1: Explain */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerAction('EXPLAIN'); }}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl md:rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all font-bold text-sm shadow-lg"
                  >
                      <Sparkles size={16}/> <span className="hidden md:inline">Jelaskan</span>
                  </button>

                  {/* Action 2: Simplify (New) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerAction('SIMPLIFY'); }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl md:rounded-full font-bold text-sm transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  >
                      <Zap size={16} className="text-amber-500"/> <span className="hidden md:inline">Sederhanakan</span>
                  </button>

                  {/* Action 3: Translate (New) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerAction('TRANSLATE'); }}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl md:rounded-full font-bold text-sm transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                  >
                      <Languages size={16} className="text-green-500"/> <span className="hidden md:inline">Terjemahkan</span>
                  </button>

                  {/* Close Selection */}
                  <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveSelection(null); 
                        window.getSelection()?.removeAllRanges(); 
                    }}
                    className="p-3 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-all"
                  >
                      <X size={20}/>
                  </button>
              </div>
          </div>
      )}

      {showMenu && (
            <ExamSelectionModal 
                onClose={() => setShowMenu(false)} 
                onSelectMcq={() => { setShowMenu(false); onStartExam('MCQ'); }} 
                onSelectTf={() => { setShowMenu(false); onStartExam('TF'); }} 
                onSelectEssay={() => { setShowMenu(false); onStartExam('WRITTEN'); }} 
                onSelectFlashcards={() => { setShowMenu(false); onStartExam('FLASHCARDS'); }} 
                onSelectStructured={() => { setShowMenu(false); onStartExam('STRUCTURED'); }} 
                onSelectExplore={() => { setShowMenu(false); onExplore(); }} 
                onSelectTool={(t) => { setShowMenu(false); if(onStartTool) onStartTool(t); }}
                onSelectTopic={onSelectTopic}
                articleTopic={article.topic}
                articleContent={article.content}
                theme={theme} mcqScore={scores.mcq} tfScore={scores.tf} writtenScore={scores.written} structuredScore={scores.structured} flashcardsCompleted={scores.flashcards} 
            />
      )}
      {showExplanationModal && selectedText && (
          <ExplanationModal 
            term={selectedText} 
            explanation={explanation} 
            isLoading={isExplaining} 
            onClose={() => {setShowExplanationModal(false); setSelectedText(null)}} 
            theme={theme}
            mode={explanationMode} 
          />
      )}

      {/* Chat Component */}
      {showChat && (
          <ArticleChat 
            topic={article.topic}
            content={article.content}
            onClose={() => setShowChat(false)}
            theme={theme}
          />
      )}
    </div>
  );
};
