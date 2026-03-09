
import React, { useState } from 'react';
import { ArticleConfig, DifficultyLevel, FactualityMode } from '../types';
import { Settings, X, Sliders, Save, GraduationCap, Play, Zap, MessageSquare, Type, Layout, FileText, Image as ImageIcon, Users, Sigma, AlertTriangle, Edit3, ShieldCheck, Bot, BookOpen, Sparkles, Feather } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

// --- SUB-COMPONENTS ---

const DifficultySelector: React.FC<{ value: DifficultyLevel, onChange: (v: DifficultyLevel) => void, colors: string }> = ({ value, onChange, colors }) => {
    const levels: DifficultyLevel[] = ['Umum', 'SD', 'SMP', 'SMA', 'Kuliah', 'Profesional', 'Ahli'];
    return (
        <div className="mb-8 p-6 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 mb-4"><GraduationCap size={16}/> Tingkat Kesulitan</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {levels.map(l => (
                    <button key={l} onClick={() => onChange(l)} className={`py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all border shadow-sm ${value === l ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 border-transparent hover:bg-white/50 opacity-70 hover:opacity-100'}`}>{l}</button>
                ))}
            </div>
        </div>
    )
};

const FactualitySelector: React.FC<{ value: FactualityMode, onChange: (v: FactualityMode) => void }> = ({ value, onChange }) => {
    const modes: { id: FactualityMode, label: string, desc: string, icon: React.ReactNode, color: string }[] = [
        { id: 'AUTO', label: 'Otomatis', desc: 'Sesuai Topik', icon: <Bot size={18}/>, color: 'bg-indigo-500 border-indigo-500' },
        { id: 'STRICT', label: 'Ketat', desc: 'Fakta Keras', icon: <ShieldCheck size={18}/>, color: 'bg-emerald-500 border-emerald-500' },
        { id: 'GROUNDED', label: 'Terjangkar', desc: 'Fakta + Narasi', icon: <BookOpen size={18}/>, color: 'bg-blue-500 border-blue-500' },
        { id: 'CREATIVE', label: 'Kreatif', desc: 'Spekulatif', icon: <Sparkles size={18}/>, color: 'bg-purple-500 border-purple-500' },
        { id: 'FICTION', label: 'Fiksi', desc: 'Imajinasi', icon: <Feather size={18}/>, color: 'bg-pink-500 border-pink-500' },
    ];

    return (
        <div className="mb-8 p-6 rounded-[2rem] border-2 border-dashed border-current/10">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60 mb-4"><Zap size={16}/> Mode Kebenaran & Kreativitas</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {modes.map(m => {
                    const isActive = value === m.id;
                    return (
                        <button 
                            key={m.id} 
                            onClick={() => onChange(m.id)} 
                            className={`p-3 md:p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${isActive ? 'bg-white dark:bg-slate-800 shadow-xl scale-[1.02] border-transparent' : 'bg-transparent border-current/10 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            {isActive && <div className={`absolute top-0 left-0 w-full h-1.5 ${m.color}`}></div>}
                            <div className={`mb-3 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? m.color + ' text-white' : 'bg-black/10 dark:bg-white/10 text-current'}`}>
                                {m.icon}
                            </div>
                            <div className="font-bold text-sm mb-0.5">{m.label}</div>
                            <div className="text-[10px] opacity-60 font-medium leading-tight">{m.desc}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const CustomInputSelector: React.FC<{ 
    label: string, 
    icon: React.ReactNode, 
    value: string, 
    onChange: (v: string) => void, 
    presets: string[] 
}> = ({ label, icon, value, onChange, presets }) => {
    return (
        <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3 flex items-center gap-2">{icon} {label}</label>
            
            <div className="relative mb-3 group">
                <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={`Kustomisasi ${label.toLowerCase()}...`}
                    className="w-full p-4 pl-12 rounded-2xl border-2 border-black/5 dark:border-white/10 focus:border-blue-500 bg-white dark:bg-slate-800 outline-none transition-all font-medium text-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-blue-500 transition-all">
                    <Edit3 size={18} />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {presets.map(opt => (
                    <button 
                        key={opt} 
                        onClick={() => onChange(opt)} 
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${value === opt ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900' : 'bg-transparent border-current/10 hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const UnifiedConfigForm: React.FC<{ config: ArticleConfig, onChange: (k: keyof ArticleConfig, v: any) => void, inputClass: string }> = ({ config, onChange, inputClass }) => {
    
    const renderLengthOptions = () => {
        const lengths = [
            "Micro (<300 Kata)", "Kilat (300-500 Kata)", "Ringkas (500-800 Kata)", "Standar (800-1500 Kata)",
            "Detail (1500-2500 Kata)", "Mendalam (2500-4000 Kata)", "Jurnal (4000-6000 Kata)", "Monograf (6000+ Kata)"
        ];
        
        return (
            <div className="mb-10">
                <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2"><FileText size={14}/> Panjang Artikel</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {lengths.map(l => (
                        <button key={l} onClick={() => onChange('length', l)} className={`p-3 rounded-xl border-2 text-[11px] font-bold text-center transition-all ${config.length === l ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10'}`}>
                            {l.split(' (')[0]} <span className="block text-[9px] opacity-60 font-normal mt-0.5">{l.split(' (')[1]?.replace(')', '')}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderIllustrationOptions = () => (
        <div className="mb-8 md:mb-10">
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-3 md:mb-4 flex items-center gap-2"><ImageIcon size={14}/> Ilustrasi & Gambar</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { val: 'NONE', label: 'Tidak Ada', desc: 'Hanya Teks' },
                    { val: 'SEARCH', label: 'Cari Web (URL)', desc: 'Gambar dari Google Search' },
                    { val: 'IMAGEN', label: 'Imagen 4 Ultra', desc: 'Generasi Ilustrasi AI' }
                ].map((opt) => (
                    <button key={opt.val} onClick={() => onChange('illustrationType', opt.val)} className={`p-5 rounded-2xl border-2 text-left transition-all ${config.illustrationType === opt.val ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 shadow-lg' : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10'}`}>
                        <div className="font-bold text-sm">{opt.label}</div>
                        <div className="text-xs opacity-60 mt-1">{opt.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="animate-fade-in pb-20">
            {/* Section 1: Core Identity */}
            <div className="mb-12">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-current/10 pb-2 flex items-center gap-2 opacity-80"><Users size={16}/> Identitas Artikel</h4>
                <DifficultySelector value={config.difficulty} onChange={(v) => onChange('difficulty', v)} colors={inputClass} />
                <FactualitySelector value={config.factualityMode} onChange={(v) => onChange('factualityMode', v)} />
                {renderLengthOptions()}
            </div>

            {/* Section 2: Visuals & Tone - CUSTOMIZABLE */}
            <div className="mb-12">
                <h4 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-current/10 pb-2 flex items-center gap-2 opacity-80"><MessageSquare size={16}/> Gaya & Kustomisasi</h4>
                {renderIllustrationOptions()}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CustomInputSelector 
                        label="Suasana (Tone)" icon={<Zap size={14}/>} value={config.tone} onChange={(v) => onChange('tone', v)}
                        presets={["Formal & Akademis", "Santai & Ringan", "Storytelling", "Inspiratif", "Kritis & Tajam", "Humoris & Jenaka", "Sarkastik / Satir", "Melankolis / Puitis"]}
                    />
                    <CustomInputSelector 
                        label="Gaya Bahasa" icon={<Type size={14}/>} value={config.languageStyle} onChange={(v) => onChange('languageStyle', v)}
                        presets={["Baku (EYD)", "Santai & Gaul", "Puitis / Sastra", "To-the-point", "Jurnalistik", "Copywriting / Iklan", "Akademis Berat", "Tutorial"]}
                    />
                </div>

                <CustomInputSelector 
                    label="Format Tulisan" icon={<Layout size={14}/>} value={config.format} onChange={(v) => onChange('format', v)}
                    presets={["Artikel Standar", "Listicle (Poin)", "Tutorial (Steps)", "Studi Kasus", "Naskah Pidato", "Dialog / Wawancara", "Email / Memo", "Thread Medsos"]}
                />
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface Props {
  config: ArticleConfig | null; topic: string; onSave: (config: ArticleConfig) => void; onClose: () => void; theme: 'light' | 'dark' | 'sepia'; isStartMode?: boolean;
}

export const ArticleConfigModal: React.FC<Props> = ({ config, topic, onSave, onClose, theme, isStartMode = false }) => {
  const { isMobile } = useResponsive();
  
  const defaultConfig: ArticleConfig = {
      difficulty: 'Umum', illustrationType: 'NONE', factualityMode: 'AUTO', useTables: true,
      tone: "Formal & Akademis", languageStyle: "Baku (EYD)", format: "Artikel Standar", length: "Standar (800-1500 Kata)",
      perspective: "Objektif (Netral)", engagement: "Standar (Informatif)", depth: "Mendalam", analogies: "Perlu",
      citationStyle: "Wajar", exclusions: "", keywords: "", customInstruction: "", rawPrompt: "",
      structure: "Logis", exampleDensity: "Cukup", paragraphLength: "Bervariasi", emotionalArc: "Stabil"
  };

  const [localConfig, setLocalConfig] = useState<ArticleConfig>(config || defaultConfig);

  const getThemeClass = () => (theme === 'dark' ? 'bg-slate-900 text-white border-slate-700' : theme === 'sepia' ? 'bg-[#fffbeb] text-amber-950 border-amber-200' : 'bg-white text-slate-900 border-slate-200');
  const getInputClass = () => (theme === 'dark' ? 'bg-slate-800 border-slate-600 focus:border-blue-400 text-slate-200' : 'bg-slate-50 border-slate-200 focus:border-blue-400 text-slate-800');

  const handleChange = (field: keyof ArticleConfig, value: any) => setLocalConfig(prev => ({ ...prev, [field]: value }));

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in ${isMobile ? 'p-0' : 'p-6'}`}>
      <div className={`relative w-full max-w-4xl flex flex-col shadow-2xl border overflow-hidden transition-all ${isMobile ? 'h-full w-full rounded-none' : 'h-[90vh] rounded-[2.5rem]'} ${getThemeClass()}`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-5 border-b border-current/10 bg-black/5 dark:bg-white/5 flex-shrink-0 ${isMobile ? 'pt-safe-top' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isStartMode ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'} shadow-lg shadow-blue-500/20`}>
                    <Sliders size={24}/>
                </div>
                <div>
                    <h3 className="font-bold text-xl leading-tight tracking-tight">{isStartMode ? 'Konfigurasi Artikel' : 'Pengaturan'}</h3>
                    <p className="text-xs opacity-60 font-medium uppercase tracking-wider">Personalisasi Konten AI</p>
                </div>
            </div>
            {!isMobile && <button onClick={onClose} className="p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all"><X size={24}/></button>}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto px-6 py-8 custom-scrollbar bg-black/[0.02] dark:bg-white/[0.02]">
            <UnifiedConfigForm config={localConfig} onChange={handleChange} inputClass={getInputClass()} />
        </div>

        {/* Footer Actions */}
        <div className={`p-5 border-t border-current/10 bg-white dark:bg-slate-900 flex justify-between items-center gap-4 flex-shrink-0 ${isMobile ? 'pb-safe-bottom' : ''}`}>
            <button onClick={onClose} className="px-8 py-4 rounded-full font-bold opacity-60 text-sm hover:bg-black/5 dark:hover:bg-white/5 hover:opacity-100 transition-all">Batal</button>
            <button onClick={() => onSave(localConfig)} className={`flex-1 md:flex-initial px-8 py-4 rounded-full text-white font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm ${isStartMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isStartMode ? <Play size={20} fill="currentColor"/> : <Save size={20}/>} 
                {isStartMode ? "Mulai Generate" : "Simpan Pengaturan"}
            </button>
        </div>
      </div>
    </div>
  );
};
