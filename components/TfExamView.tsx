
import React, { useState } from 'react';
import { TfExamData } from '../types';
import { CheckCircle, Trophy, RotateCcw, XCircle, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  data: TfExamData;
  onClose: (score?: number) => void;
  onRetake: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const TfExamView: React.FC<Props> = ({ data, onClose, onRetake, theme }) => {
  const [answers, setAnswers] = useState<(boolean|null)[]>(new Array(data.questions.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const getThemeClass = () => {
     if (theme === 'dark') return 'text-white bg-slate-900 border-slate-700';
     if (theme === 'sepia') return 'text-amber-950 bg-[#fffbeb] border-amber-200';
     return 'text-slate-900 bg-white border-slate-200';
  };

  const handleBack = () => {
      if (isFinished) {
          onClose(Math.round((score / 20) * 100));
      } else {
          if (confirm("Kembali ke artikel? Progres ujian ini akan hilang.")) {
              onClose();
          }
      }
  };

  const handleSubmit = () => {
      if (answers.some(a => a === null)) {
          if(!confirm("Masih ada jawaban kosong. Yakin kumpulkan?")) return;
      }
      
      let correct = 0;
      data.questions.forEach((q, i) => {
          if (answers[i] === q.isTrue) correct++;
      });
      setScore(correct);
      setIsFinished(true);
      window.scrollTo(0,0);
  };

  if (isFinished) {
      const percentage = Math.round((score / 20) * 100);
      return (
          <div className={`max-w-4xl mx-auto p-8 md:p-12 rounded-[2.5rem] shadow-2xl border animate-fade-in my-10 ${getThemeClass()}`}>
              <div className="text-center mb-12">
                  <div className="inline-flex p-6 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm">
                    <Trophy size={64} />
                  </div>
                  <h2 className="text-4xl font-extrabold mb-2">Hasil Benar/Salah</h2>
                  <div className="flex flex-col items-center justify-center gap-1 mb-4">
                      <span className="text-8xl font-black text-green-600">{percentage}</span>
                      <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Nilai Total</span>
                  </div>
                   <div className="text-lg font-bold mb-4 opacity-60">Benar {score} dari 20 Soal</div>
                  
                  <div className="flex justify-center gap-4 mt-8">
                      <button onClick={onRetake} className="flex items-center gap-2 px-8 py-3 rounded-full border-2 font-bold hover:bg-black/5 transition-all">
                          <RotateCcw size={18} /> Ulangi
                      </button>
                      <button onClick={() => onClose(percentage)} className="px-10 py-3 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-lg">
                          Selesai & Keluar
                      </button>
                  </div>
              </div>

              <div className="space-y-4">
                  {data.questions.map((q, i) => {
                      const isCorrect = answers[i] === q.isTrue;
                      return (
                          <div key={q.id} className={`p-5 rounded-2xl border-l-8 flex items-start gap-4 ${isCorrect ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-red-500 bg-red-50/50 dark:bg-red-900/10'}`}>
                              <div className={`mt-1 font-black text-sm opacity-30`}>#{i+1}</div>
                              <div className="flex-grow">
                                  <p className="font-bold text-lg leading-snug mb-2">{q.statement}</p>
                                  <div className="text-sm opacity-80 flex items-center gap-2">
                                      {isCorrect ? <CheckCircle size={16} className="text-green-600"/> : <XCircle size={16} className="text-red-600"/>}
                                      <span>{q.explanation}</span>
                                  </div>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${answers[i] ? 'bg-green-200 text-green-800' : answers[i] === false ? 'bg-red-200 text-red-800' : 'bg-gray-200'}`}>
                                  {answers[i] === true ? 'Benar' : answers[i] === false ? 'Salah' : '-'}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )
  }

  return (
      <div className={`max-w-4xl mx-auto min-h-[80vh] flex flex-col px-4 py-8 pb-32 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <div className="flex justify-between items-center mb-10">
              <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full"
              >
                  <ArrowLeft size={16}/> Kembali ke Artikel
              </button>
          </div>

          <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="text-green-500" size={32}/> Ujian Benar / Salah
              </h2>
              <p className="opacity-60 text-lg">Tentukan kebenaran 20 pernyataan di bawah ini.</p>
          </div>

          <div className="space-y-8">
              {data.questions.map((q, i) => (
                  <div key={q.id} className={`p-6 md:p-8 rounded-[2rem] border shadow-sm transition-all hover:shadow-md ${getThemeClass()}`}>
                      <div className="flex gap-4 mb-6">
                          <span className="font-black text-4xl opacity-10 font-serif italic">{(i+1).toString().padStart(2, '0')}</span>
                          <p className="font-medium text-xl md:text-2xl leading-relaxed pt-2">{q.statement}</p>
                      </div>
                      
                      <div className="flex gap-4">
                          <button onClick={() => {const n=[...answers]; n[i]=true; setAnswers(n)}}
                              className={`flex-1 py-4 rounded-2xl border-2 font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${answers[i] === true ? 'bg-green-600 text-white border-green-600 shadow-lg scale-[1.02]' : 'hover:bg-green-50 text-green-600 border-green-200'}`}>
                              <CheckCircle size={24}/> BENAR
                          </button>
                          <button onClick={() => {const n=[...answers]; n[i]=false; setAnswers(n)}}
                              className={`flex-1 py-4 rounded-2xl border-2 font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${answers[i] === false ? 'bg-red-500 text-white border-red-500 shadow-lg scale-[1.02]' : 'hover:bg-red-50 text-red-500 border-red-200'}`}>
                              <XCircle size={24}/> SALAH
                          </button>
                      </div>
                  </div>
              ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t z-20 flex justify-center">
              <button 
                onClick={handleSubmit}
                className="px-12 py-4 rounded-full bg-slate-900 text-white font-bold text-lg shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
              >
                  Kumpulkan Jawaban <ArrowRight/>
              </button>
          </div>
      </div>
  );
};
