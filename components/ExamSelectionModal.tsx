
import React, { useState } from 'react';
import { Layers, Target, Zap, CheckSquare, PenTool, Compass, X, CheckCircle, Star, Book, Grid, Activity, Award, Calendar, HelpCircle, Scale, GitGraph, Key, Lightbulb, Briefcase, PieChart, FileText, Baby, ArrowRight, Sparkles, BookOpen, RefreshCw, Hash, UserCheck, Mic, Shuffle, Eraser, ShieldAlert, ListTodo, Swords, Library, MonitorPlay, BrainCircuit } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import { SmartToolType, ContextualIdea } from '../types';
import { generateContextualIdeas } from '../services/geminiService';

interface Props {
  onClose: () => void;
  onSelectMcq: () => void;
  onSelectTf: () => void;
  onSelectEssay: () => void;
  onSelectFlashcards: () => void;
  onSelectStructured: () => void;
  onSelectExplore: () => void;
  onSelectTool: (type: SmartToolType) => void;
  onSelectTopic?: (topic: string) => void; 
  articleTopic?: string;
  articleContent?: string;
  theme: 'light' | 'dark' | 'sepia';
  mcqScore?: number | null;
  tfScore?: number | null;
  writtenScore?: number | null;
  structuredScore?: number | null;
  flashcardsCompleted?: boolean;
}

export const ExamSelectionModal: React.FC<Props> = ({ 
    onClose, 
    onSelectMcq, onSelectTf, onSelectEssay, onSelectFlashcards, onSelectStructured, onSelectExplore, onSelectTool, onSelectTopic,
    articleTopic, articleContent, theme,
    mcqScore, tfScore, writtenScore, structuredScore, flashcardsCompleted
}) => {
    const { isMobile } = useResponsive();
    
    // Idea Lab State (Local)
    const [contextIdeas, setContextIdeas] = useState<ContextualIdea[] | null>(null);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

    const handleGenerateIdeas = async () => {
        if (!articleTopic || !articleContent) return;
        setIsLoadingIdeas(true);
        try {
            const ideas = await generateContextualIdeas(articleTopic, articleContent);
            setContextIdeas(ideas);
        } catch (e) { console.error(e); } finally { setIsLoadingIdeas(false); }
    };
    
    // --- THEME UTILS ---
    const getModalStyle = () => {
        if (theme === 'dark') return 'bg-slate-900 border-slate-800 text-slate-100';
        if (theme === 'sepia') return 'bg-[#fffbeb] border-amber-200 text-amber-950';
        return 'bg-slate-50 border-slate-200 text-slate-900';
    };

    const BentoCard = ({ title, sub, icon, onClick, colSpan = "col-span-1", bgClass, textClass, badge }: any) => (
        <button 
            onClick={onClick} 
            className={`${colSpan} relative overflow-hidden p-5 rounded-[1.5rem] border transition-all duration-300 hover:scale-[1.02] active:scale-95 text-left flex flex-col justify-between h-full group ${bgClass || 'bg-white dark:bg-slate-800'} ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}
        >
            <div className={`mb-3 w-10 h-10 rounded-xl flex items-center justify-center ${textClass ? 'bg-current/10 text-current' : 'bg-blue-100 text-blue-600 dark:bg-slate-700 dark:text-blue-300'} ${textClass}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-sm md:text-base leading-tight mb-1">{title}</h4>
                <p className="text-[10px] md:text-xs opacity-60 font-medium leading-relaxed">{sub}</p>
            </div>
            {/* Hover Decor */}
            <div className="absolute top-0 right-0 p-8 rounded-full bg-current opacity-0 group-hover:opacity-5 blur-2xl transform translate-x-1/2 -translate-y-1/2 transition-opacity"></div>
            {badge && <div className="absolute top-3 right-3">{badge}</div>}
        </button>
    );

    const SectionHeader = ({ title, icon }: {title:string, icon:React.ReactNode}) => (
        <div className="flex items-center gap-2 mb-4 opacity-50 px-1 mt-6 first:mt-0">
            {icon}
            <span className="text-xs font-black uppercase tracking-widest">{title}</span>
        </div>
    );

    const ScoreBadge = ({ score }: { score: number | null | undefined }) => {
        if (score === null || score === undefined) return null;
        let color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
        return (
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${color} shadow-sm flex items-center gap-1`}>
                <Star size={8} fill="currentColor"/> {score}
            </div>
        );
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in p-4`} onClick={onClose}>
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-5xl h-[90vh] shadow-2xl border rounded-[2.5rem] flex flex-col overflow-hidden transition-all ${getModalStyle()}`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 border-b border-current/5 bg-opacity-50 backdrop-blur-xl z-10">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight leading-none flex items-center gap-3">
                            <Grid size={24} className="text-blue-500"/> Pusat Kendali
                        </h2>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1.5">Hub Pembelajaran Terpadu</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        <X size={24} className="opacity-50"/>
                    </button>
                </div>

                {/* Scrollable Grid Content */}
                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8">
                    
                    {/* ZONE 1: PEMAHAMAN (Core) */}
                    <SectionHeader title="Analisis & Pemahaman" icon={<Layers size={14}/>} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <BentoCard 
                            title="Ringkasan Cerdas" sub="Esensi materi dalam format padat." 
                            icon={<FileText size={20}/>} 
                            onClick={() => {onSelectTool('CHEAT_SHEET'); onClose();}} 
                            colSpan="col-span-2 md:col-span-1"
                            bgClass="bg-blue-50 dark:bg-blue-900/20" textClass="text-blue-600"
                        />
                        <BentoCard 
                            title="Peta Konsep" sub="Visualisasi struktur ide." 
                            icon={<GitGraph size={20}/>} 
                            onClick={() => {onSelectTool('MIND_MAP'); onClose();}} 
                            colSpan="col-span-2 md:col-span-1"
                            bgClass="bg-indigo-50 dark:bg-indigo-900/20" textClass="text-indigo-600"
                        />
                        <BentoCard 
                            title="Simplifikasi (ELI5)" sub="Penjelasan ramah pemula." 
                            icon={<Baby size={20}/>} 
                            onClick={() => {onSelectTool('ELI5'); onClose();}}
                        />
                        <BentoCard 
                            title="Koneksi Silang" sub="Hubungkan dengan disiplin lain." 
                            icon={<Shuffle size={20}/>} 
                            onClick={() => {onSelectTool('CROSS_POLLINATOR'); onClose();}}
                        />
                        <BentoCard title="Glosarium" sub="Kamus istilah." icon={<Book size={20}/>} onClick={() => {onSelectTool('GLOSSARY'); onClose();}} />
                        <BentoCard title="Kronologi" sub="Garis waktu sejarah." icon={<Calendar size={20}/>} onClick={() => {onSelectTool('TIMELINE'); onClose();}} />
                        <BentoCard title="Perspektif" sub="Pro & Kontra." icon={<Scale size={20}/>} onClick={() => {onSelectTool('PROS_CONS'); onClose();}} />
                        <BentoCard title="Analogi" sub="Perumpamaan konsep." icon={<Lightbulb size={20}/>} onClick={() => {onSelectTool('ANALOGY'); onClose();}} />
                    </div>

                    {/* ZONE 2: LABORATORIUM AKTIF (Interactive) */}
                    <SectionHeader title="Laboratorium Aktif" icon={<Activity size={14}/>} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <BentoCard 
                            title="Tutor Sokrates" sub="Dialog pendalaman interaktif." 
                            icon={<UserCheck size={24}/>} 
                            onClick={() => {onSelectTool('SOCRATIC'); onClose();}} 
                            bgClass="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white"
                            textClass="text-white bg-white/20"
                            colSpan="col-span-2 md:col-span-1"
                        />
                        <BentoCard 
                            title="Studio Podcast" sub="Diskusi audio imersif." 
                            icon={<Mic size={24}/>} 
                            onClick={() => {onSelectTool('PODCAST'); onClose();}} 
                            bgClass="bg-gradient-to-br from-pink-500 to-rose-500 text-white"
                            textClass="text-white bg-white/20"
                        />
                        <BentoCard 
                            title="Arena Debat" sub="Tantang argumen AI." 
                            icon={<Swords size={24}/>} 
                            onClick={() => {onSelectTool('DEBATE_ARENA'); onClose();}} 
                            bgClass="bg-gradient-to-br from-red-500 to-orange-500 text-white"
                            textClass="text-white bg-white/20"
                        />
                        
                        <BentoCard title="Simulasi Peran" sub="Skenario keputusan." icon={<Briefcase size={20}/>} onClick={() => {onSelectTool('ROLEPLAY'); onClose();}} />
                        <BentoCard title="Uji Feynman" sub="Jelaskan kembali." icon={<BrainCircuit size={20}/>} onClick={() => {onSelectTool('FEYNMAN'); onClose();}} />
                        <BentoCard title="Rencana Aksi" sub="Langkah konkret." icon={<ListTodo size={20}/>} onClick={() => {onSelectTool('ACTIONABLE_CHECKLIST'); onClose();}} />
                    </div>

                    {/* ZONE 3: EVALUASI & PENGETAHUAN (Tests & Library) */}
                    <SectionHeader title="Evaluasi & Pustaka" icon={<Target size={14}/>} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        
                        {/* New Feature: Curator */}
                        <BentoCard 
                            title="Pustakawan AI" sub="Rekomendasi buku & jurnal." 
                            icon={<Library size={24}/>} 
                            onClick={() => {onSelectTool('REAL_WORLD_CURATOR'); onClose();}} 
                            colSpan="col-span-2 md:col-span-2"
                            bgClass="bg-amber-100 dark:bg-amber-900/40 border-amber-200"
                            textClass="text-amber-800 dark:text-amber-100"
                        />

                        <BentoCard 
                            title="Uji Rumpang" sub="Tantangan ingatan." 
                            icon={<Eraser size={20}/>} 
                            onClick={() => {onSelectTool('CLOZE'); onClose();}} 
                        />
                        <BentoCard 
                            title="Flashcards" sub="Hafalan cepat." 
                            icon={<BookOpen size={20}/>} 
                            onClick={() => {onSelectFlashcards(); onClose();}} 
                            badge={flashcardsCompleted && <CheckCircle size={16} className="text-green-500"/>}
                        />

                        {/* Exams */}
                        <BentoCard title="Pilihan Ganda" sub="Cek pemahaman." icon={<Zap size={20}/>} onClick={() => {onSelectMcq(); onClose();}} badge={<ScoreBadge score={mcqScore}/>} />
                        <BentoCard title="Benar/Salah" sub="Cek fakta." icon={<CheckSquare size={20}/>} onClick={() => {onSelectTf(); onClose();}} badge={<ScoreBadge score={tfScore}/>} />
                        <BentoCard title="Ujian Tulis" sub="Esai & Opini." icon={<PenTool size={20}/>} onClick={() => {onSelectEssay(); onClose();}} badge={<ScoreBadge score={writtenScore}/>} />
                        <BentoCard title="Asesmen Total" sub="7 Fase Bloom." icon={<Target size={20}/>} onClick={() => {onSelectStructured(); onClose();}} badge={<ScoreBadge score={structuredScore}/>} />
                    </div>

                    {/* ZONE 4: EKSPLORASI LANJUT (Context Lab) */}
                    <SectionHeader title="Ekspansi Wawasan" icon={<Compass size={14}/>} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button onClick={() => {onSelectExplore(); onClose();}} className="relative group overflow-hidden p-6 rounded-[2rem] bg-slate-900 text-white text-left flex flex-col justify-end min-h-[140px]">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Compass size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Discovery Feed</div>
                                <h3 className="text-2xl font-black leading-none mb-1">Jelajahi 100 Topik</h3>
                                <p className="text-sm opacity-60">Temukan fakta unik, debat, dan tutorial terkait.</p>
                            </div>
                        </button>

                        <div className={`p-6 rounded-[2rem] border flex flex-col justify-between ${getModalStyle()}`}>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-60">Idea Lab</div>
                                    {isLoadingIdeas && <RefreshCw size={14} className="animate-spin opacity-50"/>}
                                </div>
                                <h3 className="text-xl font-bold leading-tight mb-4">Spin-off & Skenario</h3>
                                
                                {!contextIdeas ? (
                                    <button onClick={handleGenerateIdeas} className="w-full py-3 rounded-xl bg-current/5 hover:bg-current/10 font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                        <Sparkles size={16}/> Hasilkan Ide Baru
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        {contextIdeas.slice(0, 2).map((idea, i) => (
                                            <button key={i} onClick={() => {if(onSelectTopic){onSelectTopic(idea.title); onClose();}}} className="w-full text-left p-3 rounded-xl bg-current/5 hover:bg-current/10 transition-colors text-sm font-medium truncate">
                                                {idea.title}
                                            </button>
                                        ))}
                                        <button onClick={handleGenerateIdeas} className="w-full text-center text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 mt-2">Muat Ulang</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
