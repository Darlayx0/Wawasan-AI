
import React, { useState, useEffect } from 'react';
import { Sparkles, Search, PenTool, FileText, CheckCircle, Brain } from 'lucide-react';

interface Props {
  topic: string;
}

export const GenerationLoader: React.FC<Props> = ({ topic }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: <Search className="animate-pulse" />, text: "Melakukan riset mendalam..." },
    { icon: <Brain className="animate-bounce" />, text: "Menganalisis konteks & fakta..." },
    { icon: <PenTool className="animate-pulse" />, text: "Menyusun struktur konten..." },
    { icon: <FileText className="animate-pulse" />, text: "Finalisasi artikel..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Change step every 2.5s to match typical API latency
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        
        {/* Topic Preview */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles size={14} /> AI Working
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-2 text-balance">
                "{topic}"
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Sedang diproses oleh Gemini Pro...</p>
        </div>

        {/* Steps Visualization */}
        <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

            {steps.map((s, idx) => {
                const isActive = idx === step;
                const isCompleted = idx < step;
                const isPending = idx > step;

                return (
                    <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105 opacity-100' : isCompleted ? 'opacity-50' : 'opacity-30 blur-[1px]'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 z-10 ${
                            isActive ? 'bg-white border-blue-500 text-blue-600 shadow-lg shadow-blue-500/30' : 
                            isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 
                            'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                            {isCompleted ? <CheckCircle size={20} /> : s.icon}
                        </div>
                        <div>
                            <p className={`font-bold text-lg ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {s.text}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
