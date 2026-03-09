
import React from 'react';
import { X, Sparkles, BookOpen, Quote, ArrowRight, Zap, Languages } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

type ExplanationMode = 'EXPLAIN' | 'SIMPLIFY' | 'TRANSLATE';

interface ExplanationModalProps {
  term: string;
  explanation: string;
  isLoading: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
  mode?: ExplanationMode; // New prop
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ 
  term, 
  explanation, 
  isLoading, 
  onClose,
  theme,
  mode = 'EXPLAIN'
}) => {
  const { isMobile } = useResponsive();

  const getModalStyle = () => {
    if (theme === 'dark') return 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-900/50';
    if (theme === 'sepia') return 'bg-[#fffbeb]/95 border-amber-200 text-amber-950 shadow-amber-900/10';
    return 'bg-white/95 border-slate-200 text-slate-900 shadow-xl';
  };

  const getModeConfig = () => {
      switch(mode) {
          case 'SIMPLIFY':
              return { icon: <Zap size={20}/>, title: "Sederhanakan", sub: "ELI5 Mode", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" };
          case 'TRANSLATE':
              return { icon: <Languages size={20}/>, title: "Terjemahan", sub: "Smart Translate", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/30" };
          default:
              return { icon: <Sparkles size={20}/>, title: "Analisis Konteks", sub: "AI Explainer", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/30" };
      }
  }

  const config = getModeConfig();

  return (
    <div className={`fixed inset-0 z-[100] flex ${isMobile ? 'items-end' : 'items-center'} justify-center pointer-events-none`}>
      
      {/* Backdrop (Clickable to close) */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Main Panel */}
      <div 
        className={`relative pointer-events-auto flex flex-col shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-fade-in-up
            ${isMobile 
                ? 'w-full max-h-[85vh] rounded-t-[2.5rem] pb-safe-bottom' 
                : 'w-[480px] max-h-[80vh] rounded-[2rem] m-6'
            } 
            ${getModalStyle()}
        `}
      >
        
        {/* Handle for Mobile */}
        {isMobile && (
            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                <div className="w-12 h-1.5 bg-black/10 dark:bg-white/20 rounded-full"></div>
            </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b border-current/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${config.bg} ${theme === 'sepia' ? 'text-amber-700' : config.color} ${theme === 'dark' ? 'dark:text-white' : ''}`}>
                    <div className={isLoading ? 'animate-pulse' : ''}>{config.icon}</div>
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-none">{config.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">{config.sub}</p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X size={20} className="opacity-50"/>
            </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Selected Text Highlight */}
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20 rounded-full"></div>
                <div className="pl-4 py-1">
                    <div className="flex items-center gap-2 mb-2 opacity-50 text-xs font-bold uppercase tracking-widest">
                        <Quote size={12}/> Teks Terpilih
                    </div>
                    <p className="font-serif text-lg leading-relaxed italic opacity-80 transition-all cursor-pointer">
                        "{term}"
                    </p>
                </div>
            </div>

            {/* AI Response */}
            <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="flex items-center gap-2 mb-3 opacity-60 text-xs font-bold uppercase tracking-widest">
                    <BookOpen size={14}/> Hasil
                </div>
                
                {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-current opacity-10 rounded w-full"></div>
                        <div className="h-4 bg-current opacity-10 rounded w-[90%]"></div>
                        <div className="h-4 bg-current opacity-10 rounded w-[95%]"></div>
                        <div className="h-4 bg-current opacity-10 rounded w-[80%]"></div>
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert leading-relaxed opacity-90 font-medium">
                        {explanation}
                    </div>
                )}
            </div>

        </div>

        {/* Footer Action */}
        {!isLoading && (
            <div className="flex-shrink-0 p-5 pt-2">
                <button 
                    onClick={onClose} 
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2
                        ${theme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}
                    `}
                >
                    Selesai Membaca <ArrowRight size={16}/>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};
