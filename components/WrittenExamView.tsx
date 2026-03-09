
import React, { useState } from 'react';
import { WrittenExamData, WrittenGradingResult } from '../types';
import { gradeWrittenExam } from '../services/geminiService';
import { PenTool, CheckCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  data: WrittenExamData;
  articleContent: string;
  onClose: (score?: number) => void;
  onRetake: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const WrittenExamView: React.FC<Props> = ({ data, articleContent, onClose, onRetake, theme }) => {
  const [shortAnswers, setShortAnswers] = useState<string[]>(new Array(5).fill(''));
  const [descAnswer, setDescAnswer] = useState('');
  const [essayAnswer, setEssayAnswer] = useState('');
  const [opinionAnswer, setOpinionAnswer] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<WrittenGradingResult | null>(null);

  const getThemeClass = () => {
     if (theme === 'dark') return 'text-white bg-slate-900 border-slate-700';
     if (theme === 'sepia') return 'text-amber-950 bg-[#fffbeb] border-amber-200';
     return 'text-slate-900 bg-white border-slate-200';
  };

  const handleBack = () => {
      if (result) {
          onClose(result.score);
      } else {
          if (confirm("Kembali ke artikel? Jawaban Anda akan hilang.")) {
              onClose();
          }
      }
  };

  const handleSubmit = async () => {
      if (shortAnswers.some(s => !s.trim()) || !descAnswer.trim() || !essayAnswer.trim() || !opinionAnswer.trim()) {
          if(!confirm("Ada jawaban kosong. Yakin kumpulkan?")) return;
      }

      setIsSubmitting(true);
      
      const payload = [
          ...data.shortAnswers.map((q, i) => ({ id: q.id, question: q.question, userAnswer: shortAnswers[i], type: q.type })),
          { id: data.description.id, question: data.description.question, userAnswer: descAnswer, type: data.description.type },
          { id: data.essay.id, question: data.essay.question, userAnswer: essayAnswer, type: data.essay.type },
          { id: data.opinion.id, question: data.opinion.question, userAnswer: opinionAnswer, type: data.opinion.type }
      ];

      try {
          const grading = await gradeWrittenExam(articleContent, payload);
          setResult(grading);
      } catch (e) {
          alert("Gagal menilai ujian. Coba lagi.");
      } finally {
          setIsSubmitting(false);
          window.scrollTo(0,0);
      }
  };

  if (isSubmitting) return <LoadingSpinner message="AI Sedang Mengoreksi..." subMessage="Menilai isian singkat, esai, dan argumen Anda." />;

  if (result) {
      return (
          <div className={`max-w-4xl mx-auto p-8 rounded-3xl shadow-xl border animate-fade-in my-10 ${getThemeClass()}`}>
              <div className="text-center mb-10">
                  <PenTool size={64} className="mx-auto mb-6 text-purple-500" />
                  <h2 className="text-3xl font-bold mb-2">Hasil Ujian Tertulis</h2>
                  <div className="flex flex-col items-center justify-center gap-1 mb-6">
                      <span className="text-8xl font-black text-blue-600">{result.score}</span>
                      <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Nilai Total</span>
                  </div>
                  <div className="bg-black/5 p-4 rounded-xl text-lg italic opacity-80 mb-8 max-w-2xl mx-auto">
                      "{result.feedbackGeneral}"
                  </div>
                  
                  <div className="flex justify-center gap-4">
                      <button onClick={onRetake} className="flex items-center gap-2 px-6 py-3 rounded-full border hover:bg-black/5">
                          <RotateCcw size={18} /> Ulangi
                      </button>
                      <button onClick={() => onClose(result.score)} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700">
                          Selesai & Keluar
                      </button>
                  </div>
              </div>

              <div className="space-y-6">
                  {result.details.map((item, i) => (
                      <div key={i} className={`p-6 rounded-2xl border-l-4 ${item.score > 70 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : item.score > 40 ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                          <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-lg flex-grow">{item.question}</p>
                              <div className="font-black text-xl opacity-50 ml-4">{item.score}pts</div>
                          </div>
                          <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg mb-3">
                              <span className="text-xs font-bold uppercase opacity-50 block mb-1">Jawaban Anda:</span>
                              {item.userAnswer}
                          </div>
                          <div className="text-sm italic opacity-90 text-blue-800 dark:text-blue-300">
                              <span className="font-bold">Feedback AI:</span> {item.feedback}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )
  }

  return (
      <div className={`max-w-3xl mx-auto min-h-[60vh] flex flex-col p-8 my-8 rounded-3xl shadow-xl border ${getThemeClass()}`}>
          <div className="flex justify-between items-center mb-10">
              <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full"
              >
                  <ArrowLeft size={16}/> Kembali ke Artikel
              </button>
          </div>

          <div className="text-center mb-10">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2 text-purple-600">
                  <PenTool /> Ujian Tertulis
              </h2>
              <p className="opacity-60">Isian Singkat, Uraian, Esai, dan Opini.</p>
          </div>

          <div className="space-y-10 mb-10">
              {/* Short Answers */}
              <section>
                  <h3 className="text-lg font-bold uppercase tracking-wider opacity-50 mb-4 border-b pb-2">1. Isian Singkat</h3>
                  <div className="space-y-4">
                      {data.shortAnswers.map((q, i) => (
                          <div key={q.id}>
                              <label className="font-bold block mb-2">{i+1}. {q.question} <span className="text-xs font-normal opacity-50">({q.maxLengthsHint})</span></label>
                              <input 
                                type="text" 
                                className="w-full p-3 rounded-xl bg-black/5 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all"
                                placeholder="Jawab singkat..."
                                value={shortAnswers[i]}
                                onChange={(e) => { const n=[...shortAnswers]; n[i]=e.target.value; setShortAnswers(n); }}
                              />
                          </div>
                      ))}
                  </div>
              </section>

              {/* Description */}
              <section>
                  <h3 className="text-lg font-bold uppercase tracking-wider opacity-50 mb-4 border-b pb-2">2. Uraian</h3>
                  <label className="font-bold block mb-2">{data.description.question} <span className="text-xs font-normal opacity-50">({data.description.maxLengthsHint})</span></label>
                  <textarea 
                    className="w-full p-4 h-24 rounded-xl bg-black/5 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none"
                    placeholder="Jelaskan..."
                    value={descAnswer}
                    onChange={(e) => setDescAnswer(e.target.value)}
                  />
              </section>

              {/* Essay */}
              <section>
                  <h3 className="text-lg font-bold uppercase tracking-wider opacity-50 mb-4 border-b pb-2">3. Esai</h3>
                  <label className="font-bold block mb-2">{data.essay.question} <span className="text-xs font-normal opacity-50">({data.essay.maxLengthsHint})</span></label>
                  <textarea 
                    className="w-full p-4 h-32 rounded-xl bg-black/5 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none"
                    placeholder="Analisis..."
                    value={essayAnswer}
                    onChange={(e) => setEssayAnswer(e.target.value)}
                  />
              </section>

              {/* Opinion */}
              <section>
                  <h3 className="text-lg font-bold uppercase tracking-wider opacity-50 mb-4 border-b pb-2">4. Opini</h3>
                  <label className="font-bold block mb-2">{data.opinion.question} <span className="text-xs font-normal opacity-50">({data.opinion.maxLengthsHint})</span></label>
                  <textarea 
                    className="w-full p-4 h-24 rounded-xl bg-black/5 border border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none"
                    placeholder="Pendapat Anda..."
                    value={opinionAnswer}
                    onChange={(e) => setOpinionAnswer(e.target.value)}
                  />
              </section>
          </div>

          <div className="flex justify-center pt-6 border-t border-dashed">
              <button 
                onClick={handleSubmit}
                className="px-12 py-4 rounded-full bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 hover:scale-105 transition-transform flex items-center gap-2"
              >
                  <CheckCircle size={20} /> Kumpulkan Ujian Tertulis
              </button>
          </div>
      </div>
  );
};
