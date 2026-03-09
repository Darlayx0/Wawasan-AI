
import React, { useState } from 'react';
import { PrePostTestData, PrePostTestResult, TestMode } from '../types';
import { CheckCircle, AlertCircle, BarChart2, Check, ArrowRight, PenTool, ClipboardList, Target } from 'lucide-react';
import { gradePrePostWriting } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  data: PrePostTestData;
  type: 'PRE' | 'POST' | 'COMPARISON';
  preTestResult?: PrePostTestResult | null; 
  postTestResult?: PrePostTestResult | null; 
  onComplete: (result: PrePostTestResult) => void;
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const PrePostTestView: React.FC<Props> = ({ 
  data, 
  type, 
  preTestResult,
  postTestResult,
  onComplete, 
  onClose, 
  theme 
}) => {
  // Safe Check
  if (!data || !data.mcq) {
      return (
          <div className="max-w-2xl mx-auto p-12 text-center mt-20 bg-red-50 rounded-3xl">
              <div className="mb-4 text-red-500"><AlertCircle size={48} className="mx-auto"/></div>
              <h2 className="text-2xl font-bold mb-2">Gagal Memuat Soal</h2>
              <p className="opacity-70 mb-6">Terjadi kesalahan saat membuat soal ujian. Silakan coba lagi.</p>
              <button onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-full font-bold">Kembali</button>
          </div>
      )
  }

  // MCQ State
  const [mcqAnswers, setMcqAnswers] = useState<number[]>(() => new Array(data.mcq.length).fill(-1));
  
  // Writing State
  const [shortAnswers, setShortAnswers] = useState<string[]>(new Array(3).fill(''));
  const [descAnswer, setDescAnswer] = useState('');
  const [essayAnswer, setEssayAnswer] = useState('');
  const [opinionAnswer, setOpinionAnswer] = useState('');

  const [isFinished, setIsFinished] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const isDetailed = data.mode === 'DETAILED';
  const totalMcq = data.mcq.length;

  const handleFinish = async () => {
    const mcqIncomplete = mcqAnswers.includes(-1);
    let writingIncomplete = false;
    
    if (isDetailed) {
        // Validation: Short Answer (if array exists and has content), Desc, Essay, Opinion
        const shortEmpty = data.writing?.short && data.writing.short.some((_, i) => !shortAnswers[i].trim());
        if (shortEmpty || !descAnswer.trim() || !essayAnswer.trim() || !opinionAnswer.trim()) {
            writingIncomplete = true;
        }
    }

    if ((mcqIncomplete || writingIncomplete) && !confirm("Masih ada jawaban kosong. Kumpulkan?")) return;

    let mcqScore = 0;
    data.mcq.forEach((q, i) => { if (mcqAnswers[i] === q.correctAnswerIndex) mcqScore++; });
    
    let result: PrePostTestResult = {
        mcqScore,
        totalScore: 0,
        userMcqAnswers: mcqAnswers
    };

    if (isDetailed && data.writing) {
        setIsGrading(true);
        try {
            const questionsPayload = {
               short: data.writing.short.map(q => q.question),
               desc: data.writing.desc.question,
               essay: data.writing.essay.question,
               opinion: data.writing.opinion.question
            };
            const answersPayload = {
               short: shortAnswers.slice(0, data.writing.short.length),
               desc: descAnswer,
               essay: essayAnswer,
               opinion: opinionAnswer
            };
            
             const grading = await gradePrePostWriting("", questionsPayload, answersPayload);

             const writingTotal = 
                grading.shortDetails.reduce((a:number, b:any) => a + b.score, 0) + 
                grading.descDetail.score + 
                grading.essayDetail.score + 
                grading.opinionDetail.score; 
             
             // Dynamic weighting based on component count
             const writingComponentsCount = grading.shortDetails.length + 3; // + Desc, Essay, Opinion
             const maxWritingScore = writingComponentsCount * 100;
             
             const weightedMcq = (mcqScore / totalMcq) * 40; // 40% MCQ
             const weightedWriting = (writingTotal / maxWritingScore) * 60; // 60% Writing
             
             result.writingScore = writingTotal;
             result.totalScore = Math.round(weightedMcq + weightedWriting);
             result.userWritingAnswers = answersPayload;
             result.writingGrading = grading;

        } catch (e) {
            console.error("Grading failed", e);
            result.totalScore = (mcqScore / totalMcq) * 100; 
        } finally {
            setIsGrading(false);
        }
    } else {
        result.totalScore = Math.round((mcqScore / totalMcq) * 100);
    }

    setIsFinished(true);
    onComplete(result); 
  };

  const getCardClass = () => {
    if (theme === 'dark') return 'bg-slate-900 border-slate-800 text-white';
    if (theme === 'sepia') return 'bg-[#fffbeb] border-amber-200 text-amber-950';
    return 'bg-white border-slate-100 text-slate-900';
  };

  if (isGrading) return <LoadingSpinner message="Menilai Jawaban..." subMessage="AI sedang menganalisis isian, uraian, esai, dan opinimu..." />;

  // --- COMPARISON VIEW (Results) ---
  if (type === 'COMPARISON') {
      if (!preTestResult || !postTestResult) return null;
      const improvement = postTestResult.totalScore - preTestResult.totalScore;
      
      return (
        <div className={`max-w-6xl mx-auto p-8 md:p-12 rounded-[3rem] shadow-2xl border my-10 animate-fade-in ${getCardClass()}`}>
            <div className="text-center mb-12">
                <div className="inline-flex p-5 rounded-full bg-blue-50 text-blue-600 mb-6 shadow-sm"><BarChart2 size={48}/></div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">Evaluasi Kemajuan</h2>
                <p className="opacity-60 text-lg">Seberapa jauh pemahaman Anda berkembang?</p>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="p-8 rounded-[2rem] bg-black/5 text-center flex flex-col justify-center">
                    <div className="text-xs font-bold uppercase opacity-50 mb-3 tracking-widest">Pre-Test</div>
                    <div className="text-5xl font-black opacity-40">{preTestResult.totalScore}</div>
                </div>
                
                <div className={`p-8 rounded-[2rem] text-center border-2 flex flex-col justify-center relative overflow-hidden ${improvement >= 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div className="relative z-10">
                        <div className="text-xs font-bold uppercase opacity-60 mb-3 tracking-widest">Peningkatan</div>
                        <div className="text-5xl font-black flex items-center justify-center gap-2">
                            {improvement > 0 ? '+' : ''}{improvement}
                        </div>
                    </div>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-slate-900 text-white text-center shadow-xl flex flex-col justify-center transform scale-105">
                    <div className="text-xs font-bold uppercase opacity-60 mb-3 tracking-widest text-blue-200">Post-Test (Final)</div>
                    <div className="text-7xl font-black">{postTestResult.totalScore}</div>
                </div>
            </div>

            {/* Content Review */}
            <div className="space-y-16">
                <section>
                    <div className="flex items-center gap-3 mb-8 border-b pb-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700"><CheckCircle size={24}/></div>
                        <h3 className="text-2xl font-bold">Review Pilihan Ganda</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        {data.mcq.map((q, i) => {
                            const isCorrect = postTestResult.userMcqAnswers[i] === q.correctAnswerIndex;
                            return (
                                <div key={i} className={`p-6 rounded-3xl border-l-8 transition-all ${isCorrect ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'}`}>
                                    <div className="flex gap-4">
                                        <div className="font-bold opacity-30 text-lg">{(i+1).toString().padStart(2, '0')}</div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg mb-3">{q.question}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className={`p-3 rounded-xl flex justify-between items-center ${isCorrect ? 'bg-green-100/50 text-green-900' : 'bg-red-100/50 text-red-900'}`}>
                                                    <span className="font-bold">{q.options?.[postTestResult.userMcqAnswers[i]] ?? "Kosong"}</span>
                                                    <span className="text-xs font-black uppercase opacity-60">Jawabanmu</span>
                                                </div>
                                                {!isCorrect && (
                                                    <div className="p-3 rounded-xl flex justify-between items-center bg-green-100/50 text-green-900">
                                                        <span className="font-bold">{q.options?.[q.correctAnswerIndex] ?? "N/A"}</span>
                                                        <span className="text-xs font-black uppercase opacity-60">Kunci</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {isDetailed && postTestResult.writingGrading && (
                     <section>
                        <div className="flex items-center gap-3 mb-8 border-b pb-4">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-700"><PenTool size={24}/></div>
                            <h3 className="text-2xl font-bold">Review Uraian (AI Analysis)</h3>
                        </div>
                        <div className="space-y-8">
                            {/* Short Answers */}
                            {postTestResult.writingGrading.shortDetails.map((item, i) => (
                                <div key={i} className="p-6 rounded-3xl bg-black/5">
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Isian Singkat</div>
                                    <p className="font-bold mb-4 text-lg">{item.question}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl">
                                            <div className="text-[10px] uppercase font-bold opacity-40 mb-2">Jawabanmu</div>
                                            <p className="italic">"{item.userAnswer}"</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-900 dark:text-blue-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="text-[10px] uppercase font-bold opacity-60">Feedback AI</div>
                                                <div className="font-black">{item.score}/100</div>
                                            </div>
                                            <p className="text-sm leading-relaxed">{item.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Render Essay, Desc, Opinion manually for better layout */}
                            {[postTestResult.writingGrading.descDetail, postTestResult.writingGrading.essayDetail, postTestResult.writingGrading.opinionDetail].map((item, idx) => (
                                item && item.question ? (
                                    <div key={idx + 10} className="p-6 rounded-3xl bg-black/5">
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">{idx === 0 ? 'Uraian Singkat' : idx === 1 ? 'Esai Singkat' : 'Opini Singkat'}</div>
                                        <p className="font-bold mb-4 text-lg">{item.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-2xl">
                                                <p className="italic">"{item.userAnswer}"</p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-900 dark:text-blue-100">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="font-black">{item.score}/100</div>
                                                </div>
                                                <p className="text-sm leading-relaxed">{item.feedback}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            ))}
                        </div>
                     </section>
                )}
            </div>

            <div className="mt-16 text-center">
                <button onClick={onClose} className="px-12 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:scale-105 transition-transform shadow-2xl">
                    Selesai & Tutup
                </button>
            </div>
        </div>
      );
  }

  // --- PRE-TEST SUCCESS ---
  if (isFinished && type === 'PRE') {
      return (
          <div className={`max-w-2xl mx-auto p-12 rounded-[3rem] shadow-2xl border text-center animate-fade-in my-10 ${getCardClass()}`}>
              <div className="inline-flex p-6 rounded-full bg-green-100 text-green-600 mb-8 shadow-sm">
                  <CheckCircle size={64} />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Pre-Test Selesai!</h2>
              <p className="text-xl opacity-60 mb-10 leading-relaxed">
                  Jawaban Anda telah diamankan. Pelajari materinya sekarang, dan kita akan bandingkan hasilnya nanti.
              </p>
              <button onClick={onClose} className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 hover:shadow-lg transition-all">
                  Mulai Belajar Materi
              </button>
          </div>
      )
  }

  // --- QUESTION FORM ---
  return (
    <div className={`max-w-5xl mx-auto my-8 pb-32 px-4 md:px-8 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                {type === 'PRE' ? 'Pre-Test' : 'Post-Test'} • {isDetailed ? 'Mode Lengkap (MCQ + Isian)' : totalMcq === 20 ? 'Mode Ekstensif' : 'Mode Singkat'}
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Uji Pemahaman</h2>
            <p className="opacity-60">Jawablah dengan jujur untuk hasil evaluasi yang akurat.</p>
        </div>

        {/* SECTION 1: MCQ */}
        <div className={`p-8 md:p-12 rounded-[3rem] border shadow-xl mb-12 ${getCardClass()}`}>
            <h3 className="font-bold text-2xl mb-8 flex items-center gap-3 border-b pb-4"><ClipboardList className="text-blue-500" size={28}/> Pilihan Ganda</h3>
            <div className="space-y-12">
                {data.mcq.map((q, i) => (
                    <div key={q.id || i} className="group">
                        <div className="flex gap-4 mb-4">
                            <span className="text-2xl font-black opacity-20 font-serif italic">{(i+1).toString().padStart(2, '0')}</span>
                            <p className="text-lg md:text-xl font-medium leading-relaxed pt-1">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 pl-0 md:pl-12">
                            {q.options && q.options.length > 0 ? q.options.map((opt, idx) => {
                                const isSelected = mcqAnswers[i] === idx;
                                return (
                                    <button key={idx} onClick={() => {const n=[...mcqAnswers]; n[i]=idx; setMcqAnswers(n)}}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 relative overflow-hidden ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.01]' : 'bg-transparent border-black/5 hover:border-blue-300 hover:bg-blue-50/50'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-colors ${isSelected ? 'bg-white text-blue-600 border-transparent' : 'border-current opacity-30'}`}>
                                            {String.fromCharCode(65+idx)}
                                        </div>
                                        <span className={`text-base md:text-lg ${isSelected ? 'font-bold' : 'font-medium opacity-80'}`}>{opt}</span>
                                        {isSelected && <div className="absolute right-4"><CheckCircle size={20}/></div>}
                                    </button>
                                )
                            }) : (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 italic">Error: Opsi tidak tersedia.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECTION 2: WRITING */}
        {isDetailed && data.writing && (
             <div className={`p-8 md:p-12 rounded-[3rem] border shadow-xl mb-12 ${getCardClass()}`}>
                <h3 className="font-bold text-2xl mb-8 flex items-center gap-3 border-b pb-4"><PenTool className="text-purple-500" size={28}/> Uraian & Analisis</h3>
                
                <div className="space-y-12">
                    {/* Short Answer (Isian) */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Isian Singkat</h4>
                        {data.writing.short.map((q, i) => (
                            <div key={q.id}>
                                <label className="block font-medium mb-3 text-lg">{q.question}</label>
                                <input type="text" placeholder="Jawaban singkat..." value={shortAnswers[i]} onChange={(e) => {const n=[...shortAnswers]; n[i]=e.target.value; setShortAnswers(n)}} className="w-full p-4 rounded-2xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all text-lg"/>
                            </div>
                        ))}
                    </div>

                    {/* Description (Uraian) */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Uraian Singkat</h4>
                        <label className="block font-medium mb-3 text-lg">{data.writing.desc.question}</label>
                        <textarea rows={3} value={descAnswer} onChange={(e) => setDescAnswer(e.target.value)} className="w-full p-5 rounded-2xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none text-lg leading-relaxed" placeholder="Jelaskan secara singkat..."></textarea>
                    </div>

                    {/* Essay */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Esai Singkat</h4>
                        <label className="block font-medium mb-3 text-lg">{data.writing.essay.question}</label>
                        <textarea rows={4} value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} className="w-full p-5 rounded-2xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none text-lg leading-relaxed" placeholder="Analisis singkat..."></textarea>
                    </div>

                    {/* Opinion */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Opini Singkat</h4>
                        <label className="block font-medium mb-3 text-lg">{data.writing.opinion.question}</label>
                        <textarea rows={3} value={opinionAnswer} onChange={(e) => setOpinionAnswer(e.target.value)} className="w-full p-5 rounded-2xl bg-black/5 border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none text-lg leading-relaxed" placeholder="Pendapat singkat..."></textarea>
                    </div>
                </div>
             </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t z-50 flex justify-center bg-white/80 dark:bg-black/80">
            <button onClick={handleFinish} className="px-10 py-4 rounded-full bg-slate-900 text-white font-bold text-lg shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
                {isDetailed ? 'Kumpulkan & Nilai AI' : 'Kumpulkan Jawaban'} <ArrowRight size={20}/>
            </button>
        </div>
    </div>
  );
};
