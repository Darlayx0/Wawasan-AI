
import React, { useState, useEffect, useRef } from 'react';
import { SmartToolType, MindMapItem, CheatSheetData, Eli5Data, SocraticData, RoleplayData, PodcastData, CrossPollinatorData, ClozeData, ActionableChecklistData, DebateArenaData, RealWorldCuratorData } from '../types';
import { ArrowLeft, Book, HelpCircle, Calendar, Scale, ChevronDown, ChevronUp, Key, GitGraph, Lightbulb, Briefcase, PieChart, TrendingUp, TrendingDown, Minus, Hash, Zap, BookOpen, Brain, Map, FileText, Sigma, AlertTriangle, Baby, RefreshCw, Mic, UserCheck, Shuffle, Eraser, ShieldAlert, Play, Pause, RotateCcw, Check, X, Send, Target, ListTodo, Swords, Volume2, Bot, User, MessageSquare, FastForward, Rewind, Plus, Trophy, PartyPopper, ExternalLink, Library, GraduationCap, LinkIcon } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { evaluateFeynman, continueSocraticTurn, evaluateDebateTurn, continueRoleplay, generateCustomConnection } from '../services/geminiService';

interface Props {
  type: SmartToolType;
  data: any;
  onClose: () => void;
  onRegenerate: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

const ToolHeader: React.FC<{ type: SmartToolType, onClose: () => void, onRegenerate: () => void, theme: string }> = ({ type, onClose, onRegenerate, theme }) => {
    const titles: Record<SmartToolType, { title: string, icon: React.ReactNode, sub: string }> = {
        GLOSSARY: { title: "Glosarium", icon: <Book size={20}/>, sub: "Kamus Istilah & Konsep" },
        FAQ: { title: "Tanya Jawab", icon: <HelpCircle size={20}/>, sub: "Pendalaman Kritis" },
        TIMELINE: { title: "Kronologi", icon: <Calendar size={20}/>, sub: "Jejak Sejarah & Waktu" },
        PROS_CONS: { title: "Perspektif", icon: <Scale size={20}/>, sub: "Analisis Berimbang" },
        KEY_POINTS: { title: "Intisari Materi", icon: <Key size={20}/>, sub: "Poin-Poin Krusial" },
        MIND_MAP: { title: "Peta Konsep", icon: <GitGraph size={20}/>, sub: "Visualisasi Struktur Ide" },
        ANALOGY: { title: "Analogi", icon: <Lightbulb size={20}/>, sub: "Jembatan Pemahaman Kontekstual" },
        PRACTICAL: { title: "Implementasi", icon: <Briefcase size={20}/>, sub: "Aplikasi Dunia Nyata" },
        STATISTICS: { title: "Data & Fakta", icon: <PieChart size={20}/>, sub: "Angka & Tren Signifikan" },
        CHEAT_SHEET: { title: "Ringkasan Cerdas", icon: <FileText size={20}/>, sub: "Lembar Kilas Balik & Rumus" },
        ELI5: { title: "Simplifikasi", icon: <Baby size={20}/>, sub: "Penjelasan Sederhana & Intuitif" },
        // NEW 7 TOOLS
        SOCRATIC: { title: "Tutor Sokrates", icon: <UserCheck size={20}/>, sub: "Mentor Interaktif" },
        FEYNMAN: { title: "Uji Feynman", icon: <Brain size={20}/>, sub: "Validasi Pemahaman" },
        ROLEPLAY: { title: "Simulasi Peran", icon: <Briefcase size={20}/>, sub: "Petualangan Skenario" },
        PODCAST: { title: "Studio Podcast", icon: <Mic size={20}/>, sub: "Dialog Audio Imersif" },
        CROSS_POLLINATOR: { title: "Mixer Ide", icon: <Shuffle size={20}/>, sub: "Koneksi Lintas Disiplin" },
        CLOZE: { title: "Tantangan Ingatan", icon: <Eraser size={20}/>, sub: "Uji Rumpang Gamifikasi" },
        ACTIONABLE_CHECKLIST: { title: "Master Plan", icon: <ListTodo size={20}/>, sub: "Langkah Eksekusi Nyata" },
        DEBATE_ARENA: { title: "Arena Debat", icon: <Swords size={20}/>, sub: "Duel Logika Real-time" },
        REAL_WORLD_CURATOR: { title: "Pustakawan AI", icon: <Library size={20}/>, sub: "Rekomendasi Buku & Jurnal" },
    };
    
    const info = titles[type];

    return (
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-current/10">
            <div className="flex items-center gap-5">
                <button onClick={onClose} className="p-3 rounded-full hover:bg-black/5 transition-all opacity-60 hover:opacity-100"><ArrowLeft size={22}/></button>
                <div>
                    <h2 className="text-3xl font-black flex items-center gap-3 tracking-tight leading-none">
                        <span className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">{info.icon}</span>
                        {info.title}
                    </h2>
                    <p className="text-sm font-bold opacity-50 mt-2 uppercase tracking-widest">{info.sub}</p>
                </div>
            </div>
            <button onClick={onRegenerate} className="flex items-center gap-2 px-4 py-2 rounded-full border border-current/20 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 hover:bg-black/5 transition-all">
                <RefreshCw size={14}/> Reset
            </button>
        </div>
    );
};

// --- STANDARD TOOLS VIEWS ---

const GlossaryView = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
        {items.map((item, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md transition-all">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{item.category || "Terminologi"}</div>
                <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-2">{item.term}</h4>
                <p className="text-sm opacity-80 leading-relaxed">{item.definition}</p>
            </div>
        ))}
    </div>
);

const FAQView = ({ data }: { data: any }) => (
    <div className="space-y-8 animate-fade-in-up">
        {data.categories.map((cat: any, i: number) => (
            <div key={i}>
                <h3 className="font-bold text-lg mb-4 border-b pb-2 opacity-80">{cat.categoryName}</h3>
                <div className="space-y-4">
                    {cat.items.map((item: any, j: number) => (
                        <div key={j} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm">
                            <h4 className="font-bold text-base mb-2 flex items-start gap-2"><HelpCircle size={18} className="mt-1 text-purple-500 shrink-0"/> {item.question}</h4>
                            <p className="text-sm opacity-80 leading-relaxed pl-7">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const TimelineView = ({ items }: { items: any[] }) => (
    <div className="space-y-0 animate-fade-in-up relative before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
        {items.map((item, i) => (
            <div key={i} className={`relative flex items-center gap-8 mb-8 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-1/2"></div>
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-sm z-10"></div>
                <div className="flex-1 ml-16 md:ml-0">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm relative">
                        {/* Arrow */}
                        <div className={`absolute top-6 w-3 h-3 bg-white dark:bg-slate-800 border-l border-b border-slate-200 dark:border-slate-700 transform rotate-45 ${i%2===0 ? '-left-1.5 border-r-0 border-t-0 md:-right-1.5 md:border-l-0 md:border-b-0 md:border-r md:border-t' : '-left-1.5'}`}></div>
                        <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-black mb-2">{item.date}</div>
                        <h4 className="font-bold text-lg mb-2 leading-tight">{item.event}</h4>
                        <p className="text-sm opacity-70">{item.description}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const ProsConsView = ({ data }: { data: any }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
        <div className="p-6 rounded-3xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
            <h3 className="font-black text-xl text-green-700 mb-6 flex items-center gap-2"><TrendingUp/> Pro / Keuntungan</h3>
            <ul className="space-y-4">
                {data.pros.map((p: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-green-900 dark:text-green-100">
                        <Check size={18} className="shrink-0 mt-0.5"/> <span>{p}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
            <h3 className="font-black text-xl text-red-700 mb-6 flex items-center gap-2"><TrendingDown/> Kontra / Tantangan</h3>
            <ul className="space-y-4">
                {data.cons.map((c: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-red-900 dark:text-red-100">
                        <X size={18} className="shrink-0 mt-0.5"/> <span>{c}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const KeyPointsView = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-1 gap-4 animate-fade-in-up">
        {items.map((item, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm items-start">
                <div className="text-2xl shrink-0 bg-slate-50 dark:bg-slate-700 w-12 h-12 rounded-xl flex items-center justify-center">{item.icon || "🔑"}</div>
                <div>
                    <h4 className="font-bold text-lg mb-1">{item.point}</h4>
                    <p className="text-sm opacity-70 leading-relaxed">{item.description}</p>
                </div>
            </div>
        ))}
    </div>
);

const MindMapView = ({ data }: { data: any }) => (
    <div className="space-y-8 animate-fade-in-up">
        {data.maps.map((map: any, i: number) => (
            <div key={i}>
                <h3 className="text-xl font-bold mb-4">{map.title}</h3>
                <MarkdownRenderer content={`\`\`\`mermaid\n${map.code}\n\`\`\``} />
                <p className="mt-4 text-sm opacity-70 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl italic border-l-4 border-blue-500">"{map.summary}"</p>
            </div>
        ))}
    </div>
);

const AnalogyView = ({ data }: { data: any }) => (
    <div className="animate-fade-in-up p-8 rounded-[3rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl text-center">
        <div className="inline-block p-4 rounded-full bg-white/20 backdrop-blur-md mb-6"><Lightbulb size={48} fill="currentColor"/></div>
        <h3 className="text-3xl font-black mb-2">{data.concept}</h3>
        <div className="text-xl font-medium opacity-80 mb-8 font-serif italic">"Seperti {data.analogy}..."</div>
        
        <div className="bg-white text-slate-900 p-8 rounded-[2rem] text-left shadow-lg">
            <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3">Penjelasan</h4>
            <p className="text-lg leading-relaxed mb-6">{data.explanation}</p>
            
            <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3">Visualisasi</h4>
            <p className="text-sm italic opacity-70 bg-slate-100 p-4 rounded-xl border-l-4 border-indigo-500">{data.visualCue}</p>
        </div>
    </div>
);

const PracticalView = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
        {items.map((item, i) => (
            <div key={i} className="p-6 rounded-[2rem] border-2 bg-white dark:bg-slate-800 hover:border-blue-500 transition-all group">
                <div className="mb-4">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Skenario</div>
                    <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.scenario}</h4>
                </div>
                <div className="mb-4">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Aplikasi</div>
                    <p className="text-sm opacity-80">{item.application}</p>
                </div>
                <div className="pt-4 border-t border-dashed">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Dampak</div>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">{item.impact}</p>
                </div>
            </div>
        ))}
    </div>
);

const StatisticsView = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
        {items.map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm text-center">
                <div className="text-3xl font-black text-blue-600 mb-1 truncate">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3 truncate">{stat.label}</div>
                <p className="text-xs opacity-70 leading-tight">{stat.context}</p>
                {stat.trend && (
                    <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend === 'UP' ? 'bg-green-100 text-green-700' : stat.trend === 'DOWN' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                        {stat.trend === 'UP' ? <TrendingUp size={10}/> : stat.trend === 'DOWN' ? <TrendingDown size={10}/> : <Minus size={10}/>}
                        {stat.trend === 'UP' ? 'Meningkat' : stat.trend === 'DOWN' ? 'Menurun' : 'Stabil'}
                    </div>
                )}
            </div>
        ))}
    </div>
);

const CheatSheetView = ({ data }: { data: any }) => (
    <div className="animate-fade-in-up space-y-8">
        {/* Summary Card */}
        <div className="p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-center">
            <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 uppercase tracking-widest text-xs">Rangkuman Eksekutif</h4>
            <p className="text-lg font-medium leading-relaxed opacity-90">{data.summary}</p>
        </div>

        <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {/* Sections */}
            {data.sections.map((sec: any, i: number) => (
                <div key={i} className="break-inside-avoid p-6 rounded-2xl bg-white dark:bg-slate-800 border shadow-sm">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                        <Hash size={16} className="text-slate-400"/> {sec.title}
                    </h3>
                    <ul className="space-y-2">
                        {sec.items.map((item: string, j: number) => (
                            <li key={j} className="text-sm opacity-80 flex gap-2">
                                <span className="text-blue-500">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Formulas */}
            {data.formulas && data.formulas.length > 0 && (
                <div className="break-inside-avoid p-6 rounded-2xl bg-slate-900 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sigma size={18}/> Rumus Penting</h3>
                    <div className="space-y-4">
                        {data.formulas.map((f: any, i: number) => (
                            <div key={i}>
                                <div className="text-xs opacity-50 uppercase tracking-wider mb-1">{f.name}</div>
                                <div className="font-mono bg-white/10 p-2 rounded text-sm overflow-x-auto">{f.equation}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mnemonics */}
            {data.mnemonics && data.mnemonics.length > 0 && (
                <div className="break-inside-avoid p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400"><Zap size={18}/> Jembatan Keledai</h3>
                    {data.mnemonics.map((m: any, i: number) => (
                        <div key={i} className="mb-4 last:mb-0">
                            <div className="font-black text-lg text-yellow-800 dark:text-yellow-200 mb-1">{m.phrase}</div>
                            <div className="text-xs opacity-60 mb-1 uppercase font-bold">{m.label}</div>
                            <div className="text-sm opacity-80">{m.explanation}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pitfalls */}
            {data.commonPitfalls && data.commonPitfalls.length > 0 && (
                <div className="break-inside-avoid p-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-400"><AlertTriangle size={18}/> Kesalahan Umum</h3>
                    <ul className="space-y-2">
                        {data.commonPitfalls.map((p: string, i: number) => (
                            <li key={i} className="text-sm text-red-900 dark:text-red-200 flex gap-2">
                                <X size={14} className="shrink-0 mt-1"/> {p}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);

const Eli5View = ({ data }: { data: any }) => (
    <div className="animate-fade-in-up max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl border-4 border-yellow-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 bg-yellow-400 rounded-bl-[100%] opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-yellow-100 text-yellow-700 mb-4 shadow-sm"><Baby size={40}/></div>
                <h3 className="text-3xl font-black mb-2 tracking-tight">Versi Sederhana</h3>
                <p className="opacity-60 font-medium">"Jelaskan seolah saya berusia 5 tahun"</p>
            </div>

            <div className="space-y-8">
                <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2"><BookOpen size={16}/> Konsep Inti</h4>
                    <p className="text-2xl font-bold leading-snug">{data.keyConcept}</p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
                    <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2"><Lightbulb size={16}/> Analogi Dunia Nyata</h4>
                    <p className="text-lg leading-relaxed font-serif italic opacity-80">"{data.realWorldAnalogy}"</p>
                </div>

                <div>
                    <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2"><MessageSquare size={16}/> Penjelasan Simpel</h4>
                    <p className="text-lg leading-relaxed">{data.simpleExplanation}</p>
                </div>

                <div className="pt-6 border-t">
                    <h4 className="font-bold text-sm uppercase tracking-widest opacity-50 mb-2">Kenapa Penting?</h4>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{data.whyItMatters}</p>
                </div>
            </div>
        </div>
    </div>
);

// --- INTERACTIVE TOOLS ---

const SocraticView = ({ data }: { data: SocraticData }) => {
    const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
        { role: 'model', text: data.initialQuestion }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async () => {
        if(!input.trim() || isLoading) return;
        const userMsg = input.trim();
        setMessages(p => [...p, {role: 'user', text: userMsg}]);
        setInput('');
        setIsLoading(true);
        const reply = await continueSocraticTurn([...messages, {role: 'user', text: userMsg}]);
        setMessages(p => [...p, {role: 'model', text: reply}]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[70vh] max-w-3xl mx-auto rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-4 bg-indigo-600 text-white text-center text-sm font-bold shadow-md relative z-10">
                <UserCheck className="inline-block mr-2" size={16}/> Sesi Mentoring Sokrates
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-100/50 dark:bg-black/20">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-sm opacity-80 text-center italic mb-4">
                    Konteks: "{data.context}"
                </div>
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm ${m.role === 'model' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                            {m.role === 'model' ? <Bot size={20}/> : <User size={20}/>}
                        </div>
                        <div className={`p-5 rounded-2xl max-w-[80%] text-base leading-relaxed shadow-sm ${m.role === 'model' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="text-center opacity-50 text-xs animate-pulse">Sedang berpikir...</div>}
                <div ref={bottomRef}/>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t flex gap-2">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="flex-grow p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Jawab pertanyaan mentor..." />
                <button onClick={send} className="p-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"><Send size={20}/></button>
            </div>
        </div>
    );
};

const FeynmanView = ({ data }: { data: any }) => {
    const [explanation, setExplanation] = useState('');
    const [evalResult, setEvalResult] = useState<any>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const handleEvaluate = async () => {
        if(!explanation.trim()) return;
        setIsEvaluating(true);
        const res = await evaluateFeynman(data.conceptToExplain, explanation);
        setEvalResult(res);
        setIsEvaluating(false);
    };

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Tantangan</div>
                            <h3 className="text-3xl font-black mb-2">{data.conceptToExplain}</h3>
                            <p className="opacity-70 text-sm">Jelaskan konsep ini dengan bahasa paling sederhana.</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md"><Brain size={32}/></div>
                    </div>
                    <div className="space-y-2 mb-6">
                        {data.rules.map((r: string, i: number) => (
                            <div key={i} className="flex gap-2 text-sm opacity-80"><Check size={16} className="text-green-400 shrink-0"/> {r}</div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm italic opacity-70">
                        "Contoh: {data.exampleAnalogy}"
                    </div>
                </div>
            </div>

            {!evalResult ? (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border shadow-lg">
                    <textarea 
                        className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 resize-none outline-none focus:ring-2 ring-blue-500 transition-all text-lg mb-4"
                        placeholder="Tulis penjelasanmu di sini seolah sedang mengajar anak kecil..."
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                    />
                    <button 
                        onClick={handleEvaluate}
                        disabled={isEvaluating || !explanation.trim()}
                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                        {isEvaluating ? <RefreshCw className="animate-spin"/> : <Send/>} {isEvaluating ? 'Menganalisis...' : 'Evaluasi Penjelasan'}
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border shadow-lg animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b pb-6">
                        <h3 className="text-2xl font-bold">Hasil Evaluasi</h3>
                        <button onClick={() => {setEvalResult(null); setExplanation('');}} className="text-sm font-bold text-blue-600 hover:underline">Coba Lagi</button>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-900/20">
                            <div className="text-4xl font-black text-green-600 mb-1">{evalResult.simplicityScore}</div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-50">Kesederhanaan</div>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-4xl font-black text-blue-600 mb-1">{evalResult.accuracyScore}</div>
                            <div className="text-xs font-bold uppercase tracking-widest opacity-50">Akurasi</div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <h4 className="font-bold mb-2">Feedback AI</h4>
                        <p className="opacity-80 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">{evalResult.feedback}</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles size={16} className="text-purple-500"/> Versi Lebih Baik</h4>
                        <p className="text-lg font-serif italic opacity-80 leading-relaxed border-l-4 border-purple-500 pl-4 py-2">{evalResult.betterVersion}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const CrossPollinatorView = ({ data }: { data: any }) => (
    <div className="animate-fade-in-up space-y-6">
        {data.connections.map((conn: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border shadow-md hover:shadow-xl transition-all group">
                <div className="md:w-1/3 flex flex-col justify-center text-center md:text-left border-b md:border-b-0 md:border-r border-dashed border-slate-200 dark:border-slate-700 pb-6 md:pb-0 md:pr-6">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold uppercase tracking-widest mb-3 self-center md:self-start">{conn.field}</div>
                    <h3 className="text-2xl font-black group-hover:text-blue-600 transition-colors">{conn.concept}</h3>
                </div>
                <div className="md:w-2/3 flex items-center">
                    <p className="text-lg leading-relaxed opacity-80">{conn.explanation}</p>
                </div>
            </div>
        ))}
    </div>
);

const ActionableChecklistView = ({ data }: { data: any }) => (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h3 className="text-3xl font-black mb-3">{data.goal}</h3>
            <p className="opacity-60 max-w-2xl mx-auto">{data.description}</p>
        </div>
        <div className="space-y-4 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:-z-10">
            {data.steps.map((step: any, i: number) => (
                <div key={i} className="flex gap-6 items-start group">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xl shrink-0 shadow-sm group-hover:scale-110 group-hover:border-blue-500 transition-all z-10">
                        {i+1}
                    </div>
                    <div className="flex-grow p-6 rounded-[2rem] bg-white dark:bg-slate-800 border shadow-sm group-hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{step.task}</h4>
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${step.priority === 'High' ? 'bg-red-100 text-red-600' : step.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>{step.priority}</span>
                        </div>
                        <p className="text-sm opacity-70 leading-relaxed">{step.detail}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DebateArenaView = ({ data }: { data: any }) => {
    const [history, setHistory] = useState<{speaker: string, text: string}[]>([
        { speaker: 'AI', text: data.openingArgument }
    ]);
    const [input, setInput] = useState('');
    const [score, setScore] = useState({ ai: 50, user: 50 });
    const [loading, setLoading] = useState(false);
    const [commentary, setCommentary] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

    const send = async () => {
        if(!input.trim() || loading) return;
        const userText = input.trim();
        setHistory(p => [...p, { speaker: 'User', text: userText }]);
        setInput('');
        setLoading(true);
        
        const res = await evaluateDebateTurn(history, data.context);
        
        setHistory(p => [...p, { speaker: 'AI', text: res.reply }]);
        setScore(res.score);
        setCommentary(res.commentary);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[85vh] max-w-6xl mx-auto rounded-[3rem] bg-slate-100 dark:bg-slate-900 border-8 border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Arena Header & Scoreboard */}
            <div className="bg-slate-800 text-white p-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20"></div>
                <div className="relative z-10 flex items-center gap-4 w-1/3">
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center font-bold shadow-lg shadow-red-500/50"><Bot size={24}/></div>
                    <div>
                        <div className="font-bold text-lg leading-none">{data.aiPersona}</div>
                        <div className="text-xs opacity-60 uppercase font-bold mt-1">Lawan Debat</div>
                    </div>
                </div>
                <div className="relative z-10 text-center w-1/3">
                    <div className="text-4xl font-black font-mono tracking-tighter flex items-center justify-center gap-4">
                        <span className="text-red-400">{score.ai}</span>
                        <span className="text-xs opacity-30">VS</span>
                        <span className="text-blue-400">{score.user}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                        <div className="h-full bg-red-500 transition-all duration-500" style={{width: `${score.ai}%`}}></div>
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${score.user}%`}}></div>
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-4 w-1/3 justify-end">
                    <div className="text-right">
                        <div className="font-bold text-lg leading-none">{data.userPersona}</div>
                        <div className="text-xs opacity-60 uppercase font-bold mt-1">Anda</div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold shadow-lg shadow-blue-500/50"><User size={24}/></div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.speaker === 'AI' ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
                        <div className={`max-w-[70%] p-6 rounded-[2rem] text-base leading-relaxed shadow-sm ${h.speaker === 'AI' ? 'bg-white text-slate-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2">{h.speaker === 'AI' ? data.aiPersona : 'Anda'}</div>
                            {h.text}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-center opacity-40 text-xs font-bold uppercase tracking-widest animate-pulse">Menyiapkan argumen balasan...</div>}
                <div ref={bottomRef}/>
            </div>

            {/* Commentary Ticker */}
            {commentary && (
                <div className="bg-yellow-400 text-yellow-900 px-6 py-2 text-xs font-bold uppercase tracking-widest truncate">
                    <span className="mr-2">🎤 Komentator:</span> {commentary}
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t flex gap-2">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && send()}
                    disabled={loading}
                    className="flex-grow p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                    placeholder="Ketik argumen Anda..." 
                />
                <button onClick={send} disabled={loading} className="p-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"><Send size={24}/></button>
            </div>
        </div>
    );
};

// UPGRADED UTILITY VIEWS

// CLOZE 2.0: Contextual & Gamified
const ClozeView = ({ data }: { data: ClozeData }) => {
    const [inputs, setInputs] = useState<string[]>(new Array(data.hiddenWords.length).fill(''));
    const [status, setStatus] = useState<'playing'|'checked'>('playing');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [hintsUsed, setHintsUsed] = useState<boolean[]>(new Array(data.hiddenWords.length).fill(false));

    const parts = data.maskedText.split('[___]');

    const check = () => {
        let correct = 0;
        inputs.forEach((inp, i) => {
            if(inp.toLowerCase().trim() === data.hiddenWords[i].toLowerCase().trim()) correct++;
        });
        setScore(correct);
        if (correct < data.hiddenWords.length) setLives(l => Math.max(0, l - 1));
        setStatus('checked');
    };

    const useHint = (idx: number) => {
        if(lives > 0 && !hintsUsed[idx]) {
            const n = [...hintsUsed]; n[idx] = true; setHintsUsed(n);
            setLives(l => l - 1);
        }
    };

    const retry = () => {
        if(lives > 0) {
            setStatus('playing');
        } else {
            alert("Game Over! Resetting...");
            setInputs(new Array(data.hiddenWords.length).fill(''));
            setLives(3);
            setHintsUsed(new Array(data.hiddenWords.length).fill(false));
            setStatus('playing');
        }
    };

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8 p-6 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                    {[...Array(3)].map((_,i) => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-inner ${i < lives ? 'bg-red-100 text-red-500 scale-100' : 'bg-slate-100 text-slate-300 scale-90'}`}>
                            <Zap size={20} fill={i < lives ? "currentColor" : "none"}/>
                        </div>
                    ))}
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50">Skor Kamu</div>
                    <div className="font-black text-3xl">{score}/{data.hiddenWords.length}</div>
                </div>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-2xl leading-loose text-lg md:text-xl font-serif">
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        <span dangerouslySetInnerHTML={{__html: part}} />
                        {i < data.hiddenWords.length && (
                            <span className="inline-block mx-1 relative group align-baseline">
                                <input 
                                    type="text" 
                                    value={inputs[i]}
                                    onChange={(e) => { const n=[...inputs]; n[i]=e.target.value; setInputs(n); }}
                                    disabled={status === 'checked'}
                                    placeholder={hintsUsed[i] ? data.hiddenWords[i].substring(0, 2) + "..." : `(${i+1})`}
                                    className={`min-w-[100px] w-auto border-b-2 bg-transparent text-center font-sans font-bold outline-none transition-all px-2 py-1 ${
                                        status === 'checked'
                                        ? (inputs[i].toLowerCase().trim() === data.hiddenWords[i].toLowerCase().trim() ? 'border-green-500 text-green-600 bg-green-50/20' : 'border-red-500 text-red-500 bg-red-50/20')
                                        : 'border-indigo-300 focus:border-indigo-600 focus:bg-indigo-50/50 placeholder-indigo-200'
                                    }`}
                                />
                                {status === 'playing' && !hintsUsed[i] && (
                                    <button onClick={() => useHint(i)} className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110">
                                        Hint (-1 ❤️)
                                    </button>
                                )}
                                {status === 'checked' && inputs[i].toLowerCase().trim() !== data.hiddenWords[i].toLowerCase().trim() && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-red-600 text-white px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-10 animate-bounce">
                                        {data.hiddenWords[i]}
                                    </div>
                                )}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            <div className="mt-10 flex justify-center">
                {status === 'playing' ? (
                    <button onClick={check} className="px-12 py-4 rounded-full bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform flex items-center gap-3 text-lg">
                        <Check size={24}/> Cek Jawaban
                    </button>
                ) : (
                    <button onClick={retry} className="px-12 py-4 rounded-full bg-slate-900 text-white font-bold shadow-xl flex items-center gap-3 text-lg hover:bg-black transition-colors">
                        {lives > 0 ? <RotateCcw size={20}/> : <RefreshCw size={20}/>} {lives > 0 ? "Coba Lagi" : "Ulangi Game"}
                    </button>
                )}
            </div>
        </div>
    );
};

// PODCAST 2.0: Studio Visualizer & Dual Voice
const PodcastView = ({ data }: { data: PodcastData }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLine, setCurrentLine] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [autoScroll, setAutoScroll] = useState(true);
    const scriptRef = useRef<HTMLDivElement>(null);
    const visualizerRef = useRef<HTMLDivElement>(null);

    const stop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const play = (index: number = currentLine) => {
        stop(); 
        if (index >= data.script.length) { setCurrentLine(0); return; }
        
        setIsPlaying(true);
        setCurrentLine(index);
        
        const line = data.script[index];
        const u = new SpeechSynthesisUtterance(line.text);
        u.lang = 'id-ID';
        u.rate = speed;
        
        // Improved Voice Logic
        const voices = window.speechSynthesis.getVoices();
        const host = data.hosts.find(h => h.name === line.speaker);
        
        // Try to assign specific voices if available, or modify pitch
        if (host?.voiceGender === 'Female') {
            const femaleVoice = voices.find(v => v.name.includes('Google Bahasa Indonesia') || v.name.includes('Female'));
            if(femaleVoice) u.voice = femaleVoice;
            u.pitch = 1.2;
        } else {
            u.pitch = 0.9;
        }
        
        u.onend = () => {
            if(isPlaying) play(index + 1); 
        };
        
        window.speechSynthesis.speak(u);
    };

    useEffect(() => {
        if(autoScroll && isPlaying && scriptRef.current) {
            const el = scriptRef.current.children[currentLine] as HTMLElement;
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentLine, isPlaying, autoScroll]);

    useEffect(() => () => stop(), []);

    return (
        <div className="max-w-3xl mx-auto h-[85vh] flex flex-col rounded-[3rem] bg-slate-50 dark:bg-slate-900 border shadow-2xl overflow-hidden animate-fade-in-up relative">
            {/* Studio Header & Visualizer */}
            <div className="relative p-10 bg-slate-900 text-white text-center shadow-lg z-10 overflow-hidden">
                {/* Simulated Visualizer Background */}
                <div className="absolute inset-0 opacity-20 flex items-end justify-center gap-1" ref={visualizerRef}>
                    {[...Array(40)].map((_, i) => (
                        <div key={i} className={`w-2 bg-pink-500 rounded-t-full transition-all duration-100 ease-in-out`} style={{ height: isPlaying ? `${Math.random() * 80 + 10}%` : '10%' }}></div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="inline-block p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-4 border border-white/20 shadow-xl">
                        <Mic size={32} className="text-pink-400 drop-shadow-md"/>
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight">{data.title}</h3>
                    <p className="opacity-60 text-sm font-medium uppercase tracking-widest">{data.hosts.map(h => h.name).join(" feat. ")}</p>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <button onClick={() => play(Math.max(0, currentLine - 1))} className="p-3 hover:bg-white/10 rounded-full transition-all"><Rewind size={28}/></button>
                        <button onClick={() => isPlaying ? stop() : play()} className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all ring-4 ring-white/10">
                            {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                        </button>
                        <button onClick={() => play(Math.min(data.script.length-1, currentLine + 1))} className="p-3 hover:bg-white/10 rounded-full transition-all"><FastForward size={28}/></button>
                    </div>
                </div>
            </div>

            {/* Script Transcript */}
            <div ref={scriptRef} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white dark:bg-slate-900">
                {data.script.map((line, i) => {
                    const isHost1 = line.speaker === data.hosts[0].name;
                    return (
                        <div key={i} onClick={() => play(i)} className={`flex gap-4 cursor-pointer group transition-all duration-300 ${isHost1 ? 'flex-row' : 'flex-row-reverse'} ${currentLine === i ? 'opacity-100 scale-100' : 'opacity-50 hover:opacity-80'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-md ${isHost1 ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
                                {line.speaker[0]}
                            </div>
                            <div className={`p-5 rounded-3xl max-w-[85%] text-base leading-relaxed shadow-sm border transition-all ${isHost1 ? 'bg-slate-50 dark:bg-slate-800 rounded-tl-none border-slate-100 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800 rounded-tr-none border-slate-200 dark:border-slate-700'} ${currentLine === i ? 'ring-2 ring-pink-500 shadow-md bg-white dark:bg-slate-700' : ''}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-40 flex justify-between">
                                    <span>{line.speaker}</span>
                                    {line.emotion && <span className="text-pink-500">({line.emotion})</span>}
                                </div>
                                {line.text}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// ROLEPLAY 2.0: Chat Messaging Style
const RoleplayView = ({ data }: { data: RoleplayData }) => {
    const [history, setHistory] = useState<{text: string, type: 'narration'|'choice'}[]>([
        { text: data.initialSituation, type: 'narration' }
    ]);
    const [options, setOptions] = useState<string[]>(data.initialOptions);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

    const handleChoice = async (choice: string) => {
        setHistory(p => [...p, { text: choice, type: 'choice' }]);
        setLoading(true);
        const res = await continueRoleplay([...history, {text: choice, type:'choice'}], choice);
        setHistory(p => [...p, { text: res.narration, type: 'narration' }]);
        setOptions(res.options);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[80vh] max-w-3xl mx-auto rounded-[3rem] border-8 border-slate-900 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-2xl relative">
            {/* Dynamic Island Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full z-20 text-xs font-bold shadow-lg flex items-center gap-2">
                <Briefcase size={12}/> {data.role} @ {data.setting}
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-16 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                {history.map((h, i) => (
                    <div key={i} className={`flex ${h.type === 'choice' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${h.type === 'choice' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm'}`}>
                            {h.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef}/>
            </div>

            <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t">
                <div className="flex flex-col gap-2">
                    {options.map((opt, i) => (
                        <button key={i} disabled={loading} onClick={() => handleChoice(opt)} className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-transparent hover:border-blue-300 transition-all text-left font-medium text-sm text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-3 group">
                            <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-500 group-hover:scale-110 transition-transform">{i+1}</div>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// REAL WORLD CURATOR: Book & Journal Recommendations
const RealWorldCuratorView = ({ data }: { data: RealWorldCuratorData }) => {
    return (
        <div className="animate-fade-in-up max-w-5xl mx-auto space-y-12 pb-20">
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-700 mb-6 shadow-sm"><Library size={48} strokeWidth={1.5}/></div>
                <h3 className="text-3xl font-black mb-4 leading-tight">Kurasi Pustaka Nyata</h3>
                <p className="text-lg opacity-70 leading-relaxed">{data.intro}</p>
            </div>

            {/* Books Shelf */}
            <div>
                <h4 className="flex items-center gap-3 text-xl font-bold mb-6 px-4 border-b pb-4"><BookOpen className="text-amber-600"/> Buku Rekomendasi</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {data.books.map((book, i) => (
                        <div key={i} className="group relative perspective-1000">
                            <div className="relative transform transition-all duration-500 group-hover:rotate-y-12 preserve-3d">
                                {/* Simulated 3D Book Cover */}
                                <div className="aspect-[2/3] rounded-r-2xl rounded-l-md shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 flex flex-col justify-between relative overflow-hidden border-l-4 border-l-slate-700">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-50 mix-blend-overlay"></div>
                                    <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black/40 to-transparent"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{book.author}</div>
                                        <h3 className="text-2xl font-serif font-bold leading-tight">{book.title}</h3>
                                    </div>
                                    <div className="relative z-10 mt-auto">
                                        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center mb-4"><Book size={20}/></div>
                                        <div className="text-[10px] font-bold opacity-60 uppercase">{book.year} Edition</div>
                                    </div>
                                </div>
                                {/* Spine Effect */}
                                <div className="absolute top-1 bottom-1 left-0 w-4 bg-slate-800 transform -translate-x-full origin-right rotate-y-90 rounded-l-sm"></div>
                            </div>
                            
                            <div className="mt-6">
                                <p className="text-sm opacity-70 leading-relaxed mb-3">{book.reason}</p>
                                <a href={`https://www.google.com/search?q=${encodeURIComponent(book.title + " " + book.author)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                                    Cari di Google <ExternalLink size={12}/>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Journals Section */}
            <div>
                <h4 className="flex items-center gap-3 text-xl font-bold mb-6 px-4 border-b pb-4"><GraduationCap className="text-blue-600"/> Jurnal & Paper Akademis</h4>
                <div className="space-y-4 px-4">
                    {data.journals.map((journal, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-lg transition-all items-start">
                            <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xl font-serif">
                                {i+1}
                            </div>
                            <div className="flex-grow">
                                <h5 className="text-lg font-bold mb-1 leading-snug hover:text-blue-600 cursor-pointer">{journal.title}</h5>
                                <div className="flex flex-wrap gap-3 text-xs opacity-60 font-medium mb-3">
                                    <span className="flex items-center gap-1"><Library size={12}/> {journal.source}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12}/> {journal.year}</span>
                                </div>
                                <p className="text-sm opacity-80 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border-l-2 border-blue-400">
                                    <span className="font-bold mr-1">Fokus:</span> {journal.focus}
                                </p>
                            </div>
                            <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(journal.title)}`} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors flex-shrink-0">
                                <LinkIcon size={20}/>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const SmartToolsView: React.FC<Props> = ({ type, data, onClose, onRegenerate, theme }) => {
    const getPageBg = () => {
        if (theme === 'dark') return 'bg-slate-950 text-slate-100';
        if (theme === 'sepia') return 'bg-[#fcf6e5] text-amber-950';
        return 'bg-slate-50 text-slate-900';
    };

    return (
        <div className={`min-h-screen p-4 md:p-12 ${getPageBg()}`}>
            <div className="max-w-6xl mx-auto">
                <ToolHeader type={type} onClose={onClose} onRegenerate={onRegenerate} theme={theme} />
                
                {/* Standard Views */}
                {type === 'GLOSSARY' && <GlossaryView items={data} />}
                {type === 'FAQ' && <FAQView data={data} />}
                {type === 'TIMELINE' && <TimelineView items={data} />}
                {type === 'PROS_CONS' && <ProsConsView data={data} />}
                {type === 'KEY_POINTS' && <KeyPointsView items={data} />}
                {type === 'MIND_MAP' && <MindMapView data={data} />}
                {type === 'ANALOGY' && <AnalogyView data={data} />}
                {type === 'PRACTICAL' && <PracticalView items={data} />}
                {type === 'STATISTICS' && <StatisticsView items={data} />}
                {type === 'CHEAT_SHEET' && <CheatSheetView data={data} />}
                {type === 'ELI5' && <Eli5View data={data} />}
                
                {/* Upgraded Views */}
                {type === 'CLOZE' && <ClozeView data={data} />}
                {type === 'PODCAST' && <PodcastView data={data} />}
                {type === 'ROLEPLAY' && <RoleplayView data={data} />}
                {type === 'REAL_WORLD_CURATOR' && <RealWorldCuratorView data={data} />}
                
                {/* Other Interactive Views */}
                {type === 'SOCRATIC' && <SocraticView data={data} />}
                {type === 'FEYNMAN' && <FeynmanView data={data} />}
                {type === 'CROSS_POLLINATOR' && <CrossPollinatorView data={data} />}
                {type === 'ACTIONABLE_CHECKLIST' && <ActionableChecklistView data={data} />}
                {type === 'DEBATE_ARENA' && <DebateArenaView data={data} />}
                
                {!data || (Array.isArray(data) && data.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-32 opacity-50 text-center">
                        <Brain size={48} className="mb-4 opacity-50"/>
                        <p className="text-lg font-bold">Data tidak tersedia untuk instrumen ini.</p>
                        <p className="text-sm">Cobalah membuat ulang atau pilih instrumen lain.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
