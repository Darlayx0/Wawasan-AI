
import React, { useMemo, useState } from 'react';
import { Recommendations, FeedItem } from '../types';
import { RefreshCw, ArrowLeft, Clock, Zap, Scale, BookOpen, Globe, Newspaper, Lightbulb, Compass, GraduationCap, Infinity, Plus, Grid, TrendingUp, Monitor, Heart, Coffee, Anchor, Music, Video, User, Cpu, Briefcase, Hash, Book, Search, Filter, Leaf, DollarSign, Palette, Puzzle, Mountain, Gamepad2, X, Microscope, Landmark, Gavel, Stethoscope, Rocket, Trophy, Users, Radio, Sprout, Truck, Shield, School, Map, Film, Ghost, CloudLightning, Flame, Rss, Clapperboard, Binary, FlaskConical, Atom, Dna, Building2, Utensils, Shirt, Music2, Camera, Plane, Car, Gamepad, Smile, Home, Wrench, Database, Component, Factory, Ship, PenTool, Flag, Sigma, MessageSquare, Drama, Scissors, Palmtree, Dog, Flower, Gem, CloudRain, PlaneTakeoff, Tent, Wifi, BrainCircuit, Moon, HardDrive, Hammer, Feather, Bot, Shovel, ShieldAlert, Sparkles, Baby, Activity, Layers, PlayCircle, Box, Pill, Library, Ticket, Megaphone, BarChart2, Signal, Battery, Microscope as Scope, Users2, AlertTriangle, Globe2, Eye, Bitcoin, Smartphone, Headphones, Code, Plane as PlaneIcon, Tv, Coffee as CoffeeIcon, Map as MapIcon, CreditCard, HeartHandshake, SmilePlus, Dumbbell, Medal, Crown, Languages, HelpCircle, Sun, Moon as MoonIcon, Star, Umbrella, Key, Lock, Unlock, Speaker, Mic, Bell, Calendar, Watch, Image, FileText, Folder, Archive, Inbox, Send, HardDrive as Hdd, Server, Cloud as CloudIcon, Terminal, Command, Hash as HashIcon, GitBranch, GitCommit, GitMerge, GitPullRequest, Brain, Layout } from 'lucide-react';
import { DOMAIN_CATEGORIES } from '../data/domainDatabase'; // IMPORTED

interface TopicRecommendationsProps {
  recommendations: Recommendations | null; // If null, show Directory. If set, show Feed.
  topic: string;
  onTopicSelect: (topic: string) => void; // Final selection to read article
  onDomainSelect: (domain: string) => void; // Generating feed from directory
  onBack: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'sepia';
  returnToArticle?: boolean;
}

// --- ACTION CHOICE MODAL ---
const ActionModal: React.FC<{
    isOpen: boolean;
    topic: string;
    onDirect: () => void;
    onGenerate: () => void;
    onClose: () => void;
    theme: 'light' | 'dark' | 'sepia';
}> = ({ isOpen, topic, onDirect, onGenerate, onClose, theme }) => {
    if (!isOpen) return null;

    const modalBg = theme === 'dark' ? 'bg-slate-900 text-white' : theme === 'sepia' ? 'bg-[#fffbeb] text-amber-950' : 'bg-white text-slate-900';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
            <div onClick={e => e.stopPropagation()} className={`w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transform transition-all scale-100 ${modalBg}`}>
                <div className="p-6 text-center border-b border-current/10">
                    <h3 className="text-xl font-black mb-1 line-clamp-2">{topic}</h3>
                    <p className="text-xs opacity-60 font-bold uppercase tracking-widest">Tentukan Jalur Pendalaman</p>
                </div>
                <div className="p-4 space-y-3">
                    <button onClick={onDirect} className="w-full p-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        <BookOpen size={20}/>
                        <div className="text-left">
                            <div className="text-sm">Pelajari Artikel Utama</div>
                            <div className="text-[10px] opacity-80 font-normal">Bacaan fundamental tentang {topic}</div>
                        </div>
                    </button>
                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-current/10"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] font-bold opacity-40">ATAU</span>
                        <div className="flex-grow border-t border-current/10"></div>
                    </div>
                    <button onClick={onGenerate} className="w-full p-4 rounded-xl border-2 border-current/10 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <Compass size={20} className="text-purple-500"/>
                        <div className="text-left">
                            <div className="text-sm">Temukan 100 Wawasan Turunan</div>
                            <div className="text-[10px] opacity-60 font-normal">Eksplorasi cabang spesifik dari {topic}</div>
                        </div>
                    </button>
                </div>
                <button onClick={onClose} className="w-full py-4 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Batalkan</button>
            </div>
        </div>
    );
};

export const TopicRecommendations: React.FC<TopicRecommendationsProps> = ({ 
  recommendations, 
  topic,
  onTopicSelect, 
  onDomainSelect,
  onBack,
  onRefresh,
  isLoading,
  theme,
  returnToArticle
}) => {
  
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalTopic, setModalTopic] = useState<string | null>(null);

  // MODE DETECTION: If recommendations exist, we are in FEED mode. Else DIRECTORY mode.
  const isFeedMode = recommendations !== null && recommendations.feed.length > 0;

  // Flatten to objects containing both category and item name
  const allDomains = useMemo(() => {
      return DOMAIN_CATEGORIES.flatMap(cat => 
          cat.items.map(item => ({ category: cat.title, item }))
      );
  }, []);

  // --- FILTERING FOR DIRECTORY ---
  const filteredDirectory = useMemo(() => {
      if (isFeedMode) return [];
      
      if (!searchQuery.trim()) {
          // If not searching, return items for active tab, but mapped to object structure
          return DOMAIN_CATEGORIES[activeTab].items.map(item => ({
              category: DOMAIN_CATEGORIES[activeTab].title,
              item
          }));
      }
      
      const q = searchQuery.toLowerCase();
      // Search across ALL categories when searching
      return allDomains.filter(obj => obj.item.toLowerCase().includes(q)).slice(0, 100);
  }, [activeTab, searchQuery, isFeedMode, allDomains]);

  // --- HANDLERS ---
  
  const handleDomainClick = (topicString: string) => {
      setModalTopic(topicString);
  };

  const handleCategoryAsTopic = () => {
      const catTitle = DOMAIN_CATEGORIES[activeTab].title;
      onTopicSelect(catTitle);
  };

  // --- THEME ---
  const getPageBg = () => {
    if (theme === 'dark') return 'bg-slate-950 text-white';
    if (theme === 'sepia') return 'bg-[#fcf6e5] text-amber-950';
    return 'bg-slate-50 text-slate-900';
  };

  const getCardBase = () => {
     if (theme === 'dark') return 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg shadow-black/20';
     if (theme === 'sepia') return 'bg-[#fffbeb] border-amber-100 hover:border-amber-200 shadow-sm';
     return 'bg-white border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:-translate-y-1';
  };

  const DifficultyBar = ({ level }: { level: number }) => {
      const colors = ['bg-green-400', 'bg-teal-400', 'bg-yellow-400', 'bg-orange-500', 'bg-purple-600'];
      return (
          <div className="flex gap-0.5 h-1.5 w-12">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 rounded-full ${i <= level ? colors[level-1] : 'bg-current opacity-10'}`}></div>
              ))}
          </div>
      );
  };

  // --- VIEW: DIRECTORY (4000+ ITEMS) ---
  if (!isFeedMode && !isLoading) {
      return (
          <div className={`min-h-screen animate-fade-in ${getPageBg()} pb-24`}>
              
              {/* ACTION MODAL */}
              <ActionModal 
                  isOpen={!!modalTopic} 
                  topic={modalTopic || ''} 
                  onClose={() => setModalTopic(null)}
                  onDirect={() => { if(modalTopic) onTopicSelect(modalTopic); setModalTopic(null); }}
                  onGenerate={() => { if(modalTopic) onDomainSelect(modalTopic); setModalTopic(null); }}
                  theme={theme}
              />

              {/* STICKY HEADER */}
              <div className={`sticky top-0 z-40 px-4 md:px-8 pt-6 pb-2 backdrop-blur-xl bg-opacity-95 transition-all border-b border-current/5 ${theme === 'dark' ? 'bg-slate-950/80' : theme === 'sepia' ? 'bg-[#fcf6e5]/90' : 'bg-slate-50/90'}`}>
                  <div className="max-w-7xl mx-auto">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                          <div>
                              <button onClick={onBack} className="flex items-center gap-2 font-bold opacity-50 hover:opacity-100 text-xs uppercase tracking-widest mb-2 hover:bg-black/5 rounded-lg px-2 py-1 -ml-2 transition-all">
                                  <ArrowLeft size={14}/> {returnToArticle ? "Kembali ke Artikel" : "Kembali ke Menu"}
                              </button>
                              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
                                  <Grid size={32} className="text-blue-600"/> Pustaka Pengetahuan Universal
                              </h1>
                              <p className="opacity-60 text-sm mt-1">Jelajahi 100 kategori dan 5.000+ domain keilmuan.</p>
                          </div>
                          
                          {/* Search Input */}
                          <div className={`relative w-full md:w-80 group transition-all focus-within:w-full md:focus-within:w-96`}>
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-blue-500 transition-colors" size={18}/>
                              <input 
                                type="text" 
                                placeholder="Cari dari 5.000+ domain..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-12 pr-10 py-3 rounded-2xl outline-none border font-bold text-sm transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 focus:border-blue-500 placeholder-slate-500' : theme === 'sepia' ? 'bg-[#fffbeb] border-amber-200 focus:border-amber-500 placeholder-amber-900/30' : 'bg-white border-slate-200 focus:border-blue-500 placeholder-slate-400'}`}
                              />
                              {searchQuery && (
                                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-all opacity-50 hover:opacity-100"><X size={14}/></button>
                              )}
                          </div>
                      </div>
                      
                      {/* Scrollable Categories (Hidden if searching) */}
                      {!searchQuery && (
                          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mask-linear-fade">
                              {DOMAIN_CATEGORIES.map((cat, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-wider transition-all border ${activeTab === idx ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg scale-105' : 'bg-current/5 border-transparent hover:bg-current/10 opacity-60 hover:opacity-100'}`}
                                  >
                                      {cat.icon} {cat.title}
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {/* GRID CONTENT */}
              <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in-up">
                  
                  {/* Category Header Action (Only when not searching) */}
                  {!searchQuery && (
                      <div className="mb-8 p-6 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex justify-between items-center relative overflow-hidden group cursor-pointer" onClick={handleCategoryAsTopic}>
                          <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform">
                              <Box size={120} />
                          </div>
                          <div className="relative z-10">
                              <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Kategori Terpilih</div>
                              <h2 className="text-3xl font-black">{DOMAIN_CATEGORIES[activeTab].title}</h2>
                          </div>
                          <button className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                              <PlayCircle size={18}/> Buka Topik Ini
                          </button>
                      </div>
                  )}

                  {searchQuery && (
                      <div className="mb-6 opacity-60 text-sm font-bold uppercase tracking-widest">
                          Hasil Pencarian: {filteredDirectory.length} Domain Ditemukan
                      </div>
                  )}
                  
                  {filteredDirectory.length === 0 ? (
                      <div className="py-20 text-center opacity-50 flex flex-col items-center">
                          <Search size={48} className="mb-4 opacity-20"/>
                          <p>Tidak ada domain yang cocok dengan "{searchQuery}"</p>
                          <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-500 font-bold hover:underline">Hapus Pencarian</button>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredDirectory.map((obj, i) => (
                              <button 
                                key={i} 
                                // UPDATE: Pass constructed string "Category - Domain"
                                onClick={() => handleDomainClick(`${obj.category} - ${obj.item}`)} 
                                className={`group relative p-6 rounded-[1.5rem] border text-left transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between h-36 overflow-hidden ${getCardBase()}`}
                              >
                                  <div className="absolute top-0 right-0 p-12 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/20 transition-all -translate-y-1/2 translate-x-1/2"></div>
                                  <div>
                                      {/* Show Category Label specifically when searching, or generally to give context */}
                                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-1 line-clamp-1">{obj.category}</div>
                                      <h3 className="font-bold text-base md:text-lg leading-tight relative z-10 line-clamp-3">{obj.item}</h3>
                                  </div>
                                  <div className="flex justify-between items-end relative z-10 w-full mt-auto">
                                      <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">Pilih Aksi</span>
                                      <div className="w-8 h-8 rounded-full bg-current/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                          <Plus size={14}/>
                                      </div>
                                  </div>
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      );
  }

  // --- VIEW: FEED LOADING ---
  if (isLoading) {
      return (
        <div className={`min-h-screen ${getPageBg()} flex flex-col items-center justify-center`}>
            {/* Custom Loader for 100 Ideas */}
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-current opacity-10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black mb-2 animate-pulse">Mengkurasi 100 Wawasan...</h2>
            <p className="opacity-60 max-w-sm text-center">AI sedang memetakan struktur pengetahuan untuk topik {topic}.</p>
        </div>
      );
  }

  // --- VIEW: FEED RESULTS (100 ITEMS) ---
  const feedItems = recommendations?.feed || [];

  return (
    <div className={`min-h-screen animate-fade-in ${getPageBg()} pb-24`}>
      {/* Sticky Header for Feed */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-xl bg-opacity-95 transition-all duration-300 ${theme === 'dark' ? 'border-slate-800 bg-slate-950/90' : theme === 'sepia' ? 'border-amber-200 bg-[#fcf6e5]/90' : 'border-slate-200 bg-white/90'}`}>
          <div className="max-w-[95rem] mx-auto px-4 md:px-8 py-4">
              <div className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                      {/* Back button logic: if query matches current topic, go to home. else go back to directory (by clearing recs) */}
                      <button onClick={onBack} className="p-2.5 rounded-full hover:bg-black/5 transition-colors border border-transparent hover:border-current/10"><ArrowLeft size={20}/></button>
                      <div className="flex flex-col">
                          <h2 className="text-lg font-black tracking-tight leading-none flex items-center gap-2 truncate max-w-[200px] sm:max-w-md">
                              <Compass className="text-blue-500" size={18}/>
                              {topic}
                          </h2>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">100 Topik Terkurasi</span>
                      </div>
                  </div>

                  <button onClick={onRefresh} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs border transition-all hover:bg-black/5 border-current/20 hover:shadow-sm`}>
                      <RefreshCw size={14}/>
                      <span className="hidden sm:inline">Kurasi Ulang</span>
                  </button>
              </div>
          </div>
      </div>

      <div className="max-w-[95rem] mx-auto px-4 md:px-8 py-8">
          <div className="columns-1 md:columns-2 xl:columns-4 gap-6 space-y-6 pb-20">
              {feedItems.map((item, idx) => (
                  <div key={item.id || idx} className="break-inside-avoid animate-fade-in-up" style={{animationDelay: `${(idx % 20) * 0.05}s`}}>
                      <div className={`group relative flex flex-col rounded-[2rem] overflow-hidden border transition-all duration-300 ${getCardBase()} ${item.difficultyLevel === 5 ? 'ring-1 ring-purple-500/30' : ''}`}>
                          <div className="p-6 flex flex-col h-full">
                               <div className="flex justify-between items-start mb-4">
                                   <span className="px-2.5 py-1 rounded-md bg-current/5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 opacity-70">
                                      <BookOpen size={10}/> {item.category || "Analisis"}
                                   </span>
                                   <DifficultyBar level={item.difficultyLevel} />
                               </div>
                               <h3 className="font-bold text-lg leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">{item.title}</h3>
                               <p className="text-sm opacity-60 leading-relaxed mb-6 line-clamp-3 font-serif flex-grow">{item.description}</p>
                               <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-current/10">
                                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> {item.readingTime || "5 min"}</span>
                                  <button onClick={() => onTopicSelect(item.title)} className="text-xs font-bold flex items-center gap-1 hover:text-blue-600 transition-colors bg-current/5 px-3 py-1.5 rounded-lg hover:bg-current/10">Pelajari <ArrowLeft className="rotate-180" size={12}/></button>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
