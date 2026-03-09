
import React, { useState, useMemo } from 'react';
import { Search, Zap, Cpu, Compass, Sparkles, Sliders, Play, FlaskConical, Shuffle, ArrowRight, Plus, Minus, Layers, Eye, Swords, HelpCircle, X, RefreshCw, Hash, Atom, Grid, List, Rocket, TrendingUp, Sun, Moon, BookOpen, Lightbulb, Database, Coffee, RotateCcw, Clock, Microscope, Wand2, Map } from 'lucide-react';
import { ArticleConfig, ModelType, IdeaMode, StarterTopic, PromptSuggestion } from '../types';
import { ArticleConfigModal } from './ArticleConfigModal';
import { generateStarterTopics, refineTopic } from '../services/geminiService';
import { DOMAIN_CATEGORIES } from '../data/domainDatabase'; // Import massive database

interface HomeViewProps {
  topic: string;
  setTopic: (t: string) => void;
  selectedModel: ModelType;
  setSelectedModel: (m: ModelType) => void;
  config: ArticleConfig | null;
  setConfig: (c: ArticleConfig) => void;
  onStart: (topic: string, config: ArticleConfig) => void;
  onExplore: (topic: string) => void; 
  theme: 'light' | 'dark' | 'sepia';
  onToggleTheme?: () => void; 
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  topic, setTopic, selectedModel, setSelectedModel, config, setConfig, onStart, onExplore, theme, onToggleTheme 
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // --- PROMPT IMPROVER STATE ---
  const [suggestedPrompts, setSuggestedPrompts] = useState<PromptSuggestion[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // --- IDEA LAB STATE ---
  const [showIdeaLab, setShowIdeaLab] = useState(false); 
  const [isMixing, setIsMixing] = useState(false);
  const [labResults, setLabResults] = useState<StarterTopic[] | null>(null);
  const [activeMode, setActiveMode] = useState<IdeaMode>('FUSION');
  const [labInputs, setLabInputs] = useState<string[]>(['', '']);

  // --- SEEDS DATABASE ---
  const seedDatabase = useMemo(() => {
      return DOMAIN_CATEGORIES.flatMap(category => category.items);
  }, []);

  const defaultConfig: ArticleConfig = {
      difficulty: 'Umum', illustrationType: 'NONE', factualityMode: 'AUTO', useTables: true,
      tone: "Formal & Akademis", languageStyle: "Baku (EYD)", format: "Artikel Standar",
      length: "Standar (800-1500 Kata)", perspective: "Objektif (Netral)", engagement: "Standar (Informatif)",
      depth: "Mendalam", analogies: "Perlu", citationStyle: "Wajar", exclusions: "", keywords: "",
      customInstruction: "", rawPrompt: "", structure: "Logis", exampleDensity: "Cukup",
      paragraphLength: "Bervariasi", emotionalArc: "Stabil"
  };

  const handleStartClick = () => {
      if (!topic.trim()) return;
      onStart(topic, config || defaultConfig);
  };

  const handleConfigSave = (newConfig: ArticleConfig) => {
      setConfig(newConfig);
      setShowConfig(false);
  };

  // --- PROMPT IMPROVER LOGIC ---
  const handleEnhancePrompt = async () => {
      if (!topic.trim()) return;
      setIsEnhancing(true);
      setSuggestedPrompts([]);
      try {
          const suggestions = await refineTopic(topic);
          setSuggestedPrompts(suggestions);
      } catch (e) {
          console.error("Failed to enhance prompt", e);
      } finally {
          setIsEnhancing(false);
      }
  };

  const handleSelectSuggestion = (suggestion: string) => {
      setTopic(suggestion);
      setSuggestedPrompts([]); // Clear suggestions after selection
  };

  // --- IDEA LAB LOGIC ---
  const handleModeChange = (mode: IdeaMode) => {
      setActiveMode(mode);
      setLabResults(null);
      if (mode === 'WHAT_IF') setLabInputs(['']);
      else if (mode === 'FUSION') setLabInputs(['', '']);
      else if (mode === 'LEVEL_UP') setLabInputs(['', '']);
      else if (mode === 'SCIFI') setLabInputs(['', '']);
      else if (mode === 'INVERSION') setLabInputs(['']);
      else if (mode === 'CHRONO') setLabInputs(['']);
      else setLabInputs(['', '']);
  };

  const addInput = () => { if (labInputs.length < 4) setLabInputs([...labInputs, '']); };
  const removeInput = (idx: number) => { if (labInputs.length > 2) { const n = [...labInputs]; n.splice(idx, 1); setLabInputs(n); } };
  const updateInput = (idx: number, val: string) => { const n = [...labInputs]; n[idx] = val; setLabInputs(n); };
  const fillRandom = (idx: number) => { const r = seedDatabase[Math.floor(Math.random() * seedDatabase.length)]; updateInput(idx, r); };

  const handleMix = async () => {
      const filledInputs = labInputs.map(i => i.trim() || seedDatabase[Math.floor(Math.random() * seedDatabase.length)]);
      setLabInputs(filledInputs);
      setIsMixing(true);
      setLabResults(null);
      try {
          const res = await generateStarterTopics(filledInputs, activeMode);
          setShowIdeaLab(false);
          setLabResults(res);
      } catch (e) { console.error(e); } finally { setIsMixing(false); }
  };

  const selectTopic = (t: string) => { setTopic(t); setLabResults(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // --- THEME & STYLES ---
  const getThemeColors = () => {
      if (theme === 'dark') return { text: 'text-white', subText: 'text-slate-400', glass: 'bg-white/5 border-white/10 shadow-2xl shadow-black/50', input: 'bg-slate-900/80 border-slate-700 focus:border-blue-500/50 text-white placeholder-slate-500', accent: 'bg-blue-600 text-white', pill: 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' };
      if (theme === 'sepia') return { text: 'text-amber-950', subText: 'text-amber-900/60', glass: 'bg-[#fffbeb]/80 border-amber-900/10 shadow-xl shadow-amber-900/10', input: 'bg-[#fffbeb] border-amber-200 focus:border-amber-600/30 text-amber-950 placeholder-amber-900/30', accent: 'bg-amber-700 text-white', pill: 'bg-white border-amber-200 hover:bg-amber-50 text-amber-900' };
      return { text: 'text-slate-900', subText: 'text-slate-500', glass: 'bg-white/70 border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl', input: 'bg-white border-slate-200 focus:border-blue-400 text-slate-900 placeholder-slate-400', accent: 'bg-slate-900 text-white', pill: 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' };
  }
  const colors = getThemeColors();

  const getTagStyle = (tag: string = "tag") => {
      const styles = [
          'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
          'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
          'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
          'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
          'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
      ];
      let hash = 0; for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
      return styles[Math.abs(hash) % styles.length];
  };

  const modeInfo: Record<IdeaMode, { icon: React.ReactNode, label: string, desc: string, placeholder: string[] }> = {
      FUSION: { icon: <Layers size={14}/>, label: "Fusi Konsep", desc: "Sintesis dua atau lebih domain menjadi wawasan baru.", placeholder: ["Konsep A (mis: Biologi)", "Konsep B (mis: Arsitektur)", "Konsep 3", "Konsep 4"] },
      LENS: { icon: <Eye size={14}/>, label: "Perspektif", desc: "Analisis satu topik melalui kacamata disiplin ilmu lain.", placeholder: ["Topik Utama", "Lensa (mis: Ekonomi Makro)"] },
      VERSUS: { icon: <Swords size={14}/>, label: "Dialektika", desc: "Komparasi mendalam antara dua pemikiran atau entitas.", placeholder: ["Tesis", "Antitesis"] },
      WHAT_IF: { icon: <HelpCircle size={14}/>, label: "Skenario", desc: "Eksplorasi probabilitas dari premis hipotetis.", placeholder: ["Premis Dasar (mis: Jika manusia bisa fotosintesis)"] },
      LEVEL_UP: { icon: <TrendingUp size={14}/>, label: "Eskalasi", desc: "Transformasi teori menjadi kerangka aksi praktis.", placeholder: ["Wawasan Teoretis", "Target Kompetensi"] },
      SCIFI: { icon: <Rocket size={14}/>, label: "Futurisme", desc: "Proyeksi spekulatif berdasarkan tren masa kini.", placeholder: ["Teknologi Saat Ini", "Era Target (mis: Tahun 2150)"] },
      INVERSION: { icon: <RotateCcw size={14}/>, label: "Inversi", desc: "Studi kontradiksi: Pelajari kegagalan untuk memahami kesuksesan.", placeholder: ["Konsep untuk Dibalik (mis: Kepemimpinan Efektif)"] },
      CHRONO: { icon: <Clock size={14}/>, label: "Kronologi", desc: "Eksplorasi lintas waktu: Perspektif masa lalu purba vs masa depan jauh.", placeholder: ["Topik Evolusioner (mis: Komunikasi)"] },
  };

  const isTopicFilled = topic && topic.trim().length > 0;

  return (
    <div className="flex flex-col min-h-screen w-full relative transition-colors duration-700 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Animated Background */}
      <div className={`absolute inset-0 z-0 transition-colors duration-700 pointer-events-none ${theme === 'dark' ? 'bg-slate-950' : theme === 'sepia' ? 'bg-[#fcf6e5]' : 'bg-[#FAFAFA]'}`}>
          <div className={`absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[150px] animate-blob ${theme === 'dark' ? 'bg-indigo-900/20' : theme === 'sepia' ? 'bg-amber-300/10' : 'bg-indigo-200/20'}`}></div>
          <div className={`absolute top-[20%] right-[-20%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-blue-900/20' : theme === 'sepia' ? 'bg-orange-300/10' : 'bg-blue-200/20'}`}></div>
          <div className={`absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[150px] animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-purple-900/20' : theme === 'sepia' ? 'bg-yellow-300/10' : 'bg-purple-200/20'}`}></div>
      </div>
      
      {/* Top Bar (Fixed & High Z-Index) */}
      <div className="fixed top-0 right-0 left-0 z-50 p-6 flex justify-end items-center pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
              {onToggleTheme && (
                  <button 
                    onClick={onToggleTheme} 
                    className={`p-3 rounded-full backdrop-blur-xl border transition-all hover:scale-105 active:scale-95 shadow-sm group ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : theme === 'sepia' ? 'bg-amber-900/10 border-amber-900/10 text-amber-950 hover:bg-amber-900/20' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`}
                    title={`Ubah Tema (Sekarang: ${theme === 'dark' ? 'Gelap' : theme === 'sepia' ? 'Sepia' : 'Terang'})`}
                  >
                      {theme === 'dark' ? <Moon size={20} className="group-hover:-rotate-12 transition-transform"/> : theme === 'sepia' ? <Coffee size={20}/> : <Sun size={20} className="group-hover:rotate-45 transition-transform"/>}
                  </button>
              )}
              <button 
                onClick={() => setShowConfig(true)} 
                className={`p-3 rounded-full backdrop-blur-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : theme === 'sepia' ? 'bg-amber-900/10 border-amber-900/10 text-amber-950 hover:bg-amber-900/20' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`}
                title="Personalisasi Artikel"
              >
                  <Sliders size={20}/>
              </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 w-full max-w-3xl mx-auto">
        
        {/* Brand Hero */}
        <div className="text-center w-full mb-12 animate-fade-in-up">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md border ${theme === 'sepia' ? 'bg-amber-900/5 border-amber-900/10 text-amber-900' : theme === 'dark' ? 'bg-white/5 border-white/10 text-blue-300' : 'bg-white/60 border-slate-200 text-slate-600'} shadow-sm`}>
                <Database size={12} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Akses 4.000+ Disiplin Ilmu</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-current to-current/60 select-none">
                <span className={colors.text}>Wawasan</span>
                <span className={theme === 'sepia' ? 'text-amber-600' : 'text-blue-600'}>AI</span>
            </h1>
            
            <p className={`text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed opacity-60 ${colors.text}`}>
                Perluas cakrawala berpikir Anda melalui kurikulum AI yang adaptif, mendalam, dan terstruktur.
            </p>
        </div>

        {/* Input & Actions Container */}
        <div className="w-full max-w-2xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            
            {/* Model Selector (Subtle) */}
            <div className="flex justify-center mb-6">
                 <div className={`inline-flex p-1 rounded-full border backdrop-blur-sm ${colors.pill}`}>
                    <button onClick={() => setSelectedModel('gemini-3-flash-preview')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${selectedModel === 'gemini-3-flash-preview' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}>
                        <Zap size={12} className={selectedModel === 'gemini-3-flash-preview' ? 'fill-current' : ''}/> Responsif
                    </button>
                    <button onClick={() => setSelectedModel('gemini-3-pro-preview')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-2 ${selectedModel === 'gemini-3-pro-preview' ? 'bg-slate-900 dark:bg-slate-500 text-white shadow-sm' : 'opacity-50 hover:opacity-100'}`}>
                        <Cpu size={12} className={selectedModel === 'gemini-3-pro-preview' ? 'fill-current' : ''}/> Analitis
                    </button>
                </div>
            </div>

            {/* Input Capsule */}
            <div className={`relative group mb-6 transition-all duration-300 transform ${isInputFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-[2rem] opacity-0 transition-opacity duration-500 ${isInputFocused ? 'opacity-30 blur-lg' : 'group-hover:opacity-20 blur-md'}`}></div>
                <div className={`relative flex items-center p-3 pl-6 pr-3 rounded-[2rem] border-2 transition-all duration-300 ${colors.input} ${isInputFocused ? 'border-blue-500 shadow-xl' : 'hover:border-blue-300 dark:hover:border-slate-600 border-transparent'}`}>
                    <div className={`mr-4 transition-colors ${isInputFocused ? 'text-blue-500' : theme === 'sepia' ? 'text-amber-700 opacity-60' : 'text-slate-400'}`}>
                        <Search size={24} strokeWidth={2.5}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Apa yang ingin Anda pelajari hari ini?" 
                        className={`flex-grow h-14 bg-transparent outline-none text-xl font-bold ${colors.text}`}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        autoFocus
                    />
                    
                    <div className="flex items-center gap-2">
                        {topic && (
                            <>
                                <button 
                                    onClick={handleEnhancePrompt} 
                                    className={`p-2.5 rounded-full transition-all flex items-center justify-center ${isEnhancing ? 'animate-pulse text-purple-500 bg-purple-100 dark:bg-purple-900/30' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                    title="Sempurnakan Topik (Magic Wand)"
                                >
                                    <Sparkles size={20} strokeWidth={2.5} className={isEnhancing ? "animate-spin-slow" : ""} />
                                </button>
                                <button onClick={() => setTopic('')} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-50 hover:opacity-100">
                                    <X size={20}/>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Suggested Prompts (Magic Wand Result) */}
            {suggestedPrompts.length > 0 && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3 px-4">
                        <Sparkles size={12} className="text-purple-500"/> 
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">Saran Topik Lebih Spesifik</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        {suggestedPrompts.map((s, i) => {
                            let icon = <Sparkles size={14}/>;
                            let colorClass = "text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
                            let label = "Saran";

                            if (s.type === 'FIX') {
                                icon = <Wand2 size={14} className="text-emerald-500"/>;
                                colorClass = "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20";
                                label = "Perbaikan Prompt";
                            } else if (s.type === 'BROAD') {
                                icon = <Map size={14} className="text-blue-500"/>;
                                colorClass = "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20";
                                label = "Topik Umum (Luas)";
                            } else if (s.type === 'DEEP') {
                                icon = <Microscope size={14} className="text-indigo-500"/>;
                                colorClass = "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20";
                                label = "Topik Mendalam";
                            } else if (s.type === 'CREATIVE') {
                                icon = <Lightbulb size={14} className="text-purple-500"/>;
                                colorClass = "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20";
                                label = "Sudut Pandang Unik";
                            }

                            return (
                                <button 
                                    key={i}
                                    onClick={() => handleSelectSuggestion(s.text)}
                                    className={`text-left p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 flex flex-col gap-1 ${colorClass} hover:shadow-md`}
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
                                        {icon} {label}
                                    </div>
                                    <div className="font-bold text-sm leading-tight">{s.text}</div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Primary Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {/* Main Action: Learn */}
                <button 
                    onClick={handleStartClick} 
                    disabled={!topic.trim()} 
                    className={`relative overflow-hidden w-full py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-3 group ${colors.accent}`}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                        <Play size={20} fill="currentColor" strokeWidth={0}/> Mulai Pembelajaran
                    </span>
                </button>

                {/* Secondary Action: Explore / Directory */}
                {isTopicFilled ? (
                    <button 
                        onClick={() => onExplore(topic)} 
                        className={`w-full py-4 rounded-2xl font-bold text-sm border-2 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group ${theme === 'dark' ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' : theme === 'sepia' ? 'border-amber-700/20 text-amber-800 hover:bg-amber-100' : 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                    >
                        <Compass size={18} className="group-hover:rotate-45 transition-transform"/>
                        Kurasi 100 Topik Turunan
                    </button>
                ) : (
                    <button 
                        onClick={() => onExplore(topic)} 
                        className={`w-full py-4 rounded-2xl font-bold text-sm border-2 border-dashed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group ${theme === 'dark' ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200' : theme === 'sepia' ? 'border-amber-900/20 text-amber-900/60 hover:border-amber-900/40 hover:text-amber-900' : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700'}`}
                    >
                        <BookOpen size={18}/>
                        Jelajahi Direktori Semesta
                    </button>
                )}
            </div>

            {/* Idea Lab Feature Card */}
            <div 
                onClick={() => setShowIdeaLab(true)}
                className={`group cursor-pointer relative p-6 rounded-[2rem] border transition-all duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : theme === 'sepia' ? 'bg-[#fffbeb] border-amber-200 hover:border-amber-300' : 'bg-white border-slate-100 hover:border-slate-200'}`}
            >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <FlaskConical size={28} />
                        </div>
                        <div className="text-left">
                            <h3 className={`font-bold text-lg leading-tight mb-1 ${colors.text}`}>Laboratorium Ide</h3>
                            <p className="text-xs opacity-60 font-medium max-w-[220px] leading-relaxed">Racik topik baru dengan mode Fusi, Dialektika, Inversi, atau Futurisme.</p>
                        </div>
                    </div>
                    <div className={`p-3 rounded-full border border-current/10 opacity-30 group-hover:opacity-100 transition-all ${colors.text} transform group-hover:translate-x-1`}>
                        <ArrowRight size={20}/>
                    </div>
                </div>
            </div>

        </div>

      </div>

      {/* --- WINDOWED IDEA LAB MODAL --- */}
      {showIdeaLab && (
          <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowIdeaLab(false)}>
              <div 
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col transition-all duration-300 transform scale-100 ${theme === 'sepia' ? 'bg-[#fffbeb] border-amber-200' : ''}`}
              >
                  {/* Window Header */}
                  <div className="p-8 pb-4 flex justify-between items-start bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30">
                                  <FlaskConical size={24} />
                              </div>
                              <div>
                                  <h2 className="text-2xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">Idea Lab</h2>
                                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Zona Eksperimen Kognitif</span>
                              </div>
                          </div>
                      </div>
                      <button onClick={() => setShowIdeaLab(false)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all opacity-50 hover:opacity-100">
                          <X size={24}/>
                      </button>
                  </div>

                  {/* Lab Content */}
                  <div className="p-8 pt-4">
                      
                      {/* Mode Switcher (Pill Style) */}
                      <div className="flex p-1.5 bg-black/5 dark:bg-white/5 rounded-2xl mb-8 overflow-x-auto custom-scrollbar snap-x">
                          {(Object.keys(modeInfo) as IdeaMode[]).map(mode => (
                              <button
                                  key={mode}
                                  onClick={() => handleModeChange(mode)}
                                  className={`flex-shrink-0 snap-start min-w-[100px] py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeMode === mode ? 'bg-white dark:bg-slate-800 shadow-md text-violet-600 dark:text-violet-300 scale-100' : 'opacity-60 hover:opacity-100 scale-95'}`}
                              >
                                  {modeInfo[mode].icon} {modeInfo[mode].label}
                              </button>
                          ))}
                      </div>

                      <div className="mb-8">
                          <p className="text-center text-sm font-medium opacity-60 mb-6 font-serif italic max-w-sm mx-auto">
                              "{modeInfo[activeMode].desc}"
                          </p>

                          <div className="space-y-3">
                              {labInputs.map((val, idx) => (
                                  <div key={idx} className="flex gap-2 items-center animate-fade-in-up" style={{animationDelay: `${idx * 0.05}s`}}>
                                      <div className="flex-1 relative group">
                                          <div className={`absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity`}></div>
                                          <input 
                                              type="text"
                                              value={val}
                                              onChange={(e) => updateInput(idx, e.target.value)}
                                              placeholder={modeInfo[activeMode].placeholder[idx] || `Parameter ${idx + 1}`}
                                              className={`relative w-full h-14 pl-5 pr-12 rounded-2xl text-sm font-bold outline-none border-2 transition-all ${theme === 'dark' ? 'bg-slate-950 border-slate-800 focus:border-violet-500 text-white' : theme === 'sepia' ? 'bg-white border-amber-200 focus:border-violet-500 text-amber-950' : 'bg-white border-slate-200 focus:border-violet-500 text-slate-900'}`}
                                          />
                                          <button onClick={() => fillRandom(idx)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg opacity-30 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all z-10" title="Isi Acak">
                                              <Shuffle size={16}/>
                                          </button>
                                      </div>
                                      {activeMode === 'FUSION' && labInputs.length > 2 && (
                                          <button onClick={() => removeInput(idx)} className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-200"><Minus size={18}/></button>
                                      )}
                                  </div>
                              ))}
                          </div>

                          {activeMode === 'FUSION' && labInputs.length < 4 && (
                              <button onClick={addInput} className="w-full py-3 mt-4 rounded-xl border border-dashed border-current/20 hover:border-violet-400 hover:text-violet-600 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 opacity-60 hover:opacity-100">
                                  <Plus size={14}/> Tambah Variabel
                              </button>
                          )}
                      </div>

                      <button 
                          onClick={handleMix}
                          disabled={isMixing}
                          className="w-full py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                          {isMixing ? <Atom size={20} className="animate-spin"/> : <Sparkles size={20}/>}
                          {isMixing ? "Sedang Meracik..." : "Hasilkan 5 Variasi Unik"}
                      </button>

                  </div>
              </div>
          </div>
      )}

      {/* RESULTS MODAL (OVERLAY) */}
      {labResults && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
              <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl border overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-white/20'}`}>
                  
                  {/* Modal Header */}
                  <div className="p-6 md:p-8 border-b border-current/5 flex justify-between items-start bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg z-10">
                      <div>
                          <h2 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
                              <FlaskConical size={28}/> Hasil Eksperimen
                          </h2>
                          <p className="opacity-80 text-sm font-medium">Berikut 5 variasi topik dengan sudut pandang unik untuk Anda.</p>
                      </div>
                      <button onClick={() => setLabResults(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"><X size={24}/></button>
                  </div>

                  {/* Results List */}
                  <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50 dark:bg-black/20">
                      <div className="grid grid-cols-1 gap-4">
                          {labResults.map((item, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => selectTopic(item.topic)}
                                className={`group text-left p-6 md:p-7 rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-center ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700 hover:border-violet-500 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-violet-500 hover:shadow-xl'}`}
                                style={{animationDelay: `${idx * 0.1}s`}} 
                              >
                                  {/* Hover Effect */}
                                  <div className="absolute top-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                      <div className="bg-violet-600 text-white p-3 rounded-full shadow-lg"><ArrowRight size={20}/></div>
                                  </div>
                                  
                                  {/* Dynamic Tag with Color Hash */}
                                  <div className="flex items-center gap-3 mb-3">
                                      <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${getTagStyle(item.tag)}`}>
                                          <span className="flex items-center gap-1"><Hash size={10} strokeWidth={3}/> {item.tag || `Variasi ${idx + 1}`}</span>
                                      </span>
                                  </div>
                                  
                                  <h3 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors pr-10">{item.topic}</h3>
                                  <p className="text-sm opacity-60 font-medium font-serif italic pr-8">"{item.teaser}"</p>
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-5 border-t border-current/5 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
                      <button onClick={() => setLabResults(null)} className="text-sm font-bold opacity-50 hover:opacity-100 px-4 py-2 transition-opacity">Tutup</button>
                      <button onClick={() => { setLabResults(null); setShowIdeaLab(true); }} className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                          <RefreshCw size={18}/>
                          Racik Ulang
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CONFIG MODAL */}
      {showConfig && (
          <ArticleConfigModal 
            config={config} 
            topic={topic} 
            onSave={handleConfigSave} 
            onClose={() => setShowConfig(false)}
            theme={theme}
            isStartMode={false} 
          />
      )}
    </div>
  );
};
