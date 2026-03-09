
import React, { useState } from 'react';
import { McqExamData } from '../types';
import { Brain, ChevronRight, Trophy, RotateCcw, Check, X, ArrowLeft, CheckCircle } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

interface Props {
  data: McqExamData;
  onClose: (score?: number) => void;
  onRetake: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const McqExamView: React.FC<Props> = ({ data, onClose, onRetake, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(data.questions.length).fill(-1));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const { isMobile } = useResponsive();

  const getThemeClass = () => {
     if (theme === 'dark') return 'text-white bg-slate-900 border-slate-800';
     if (theme === 'sepia') return 'text-amber-950 bg-[#fffbeb] border-amber-200';
     return 'text-slate-900 bg-white border-slate-100';
  };

  const handleBack = () => {
      if (isFinished) {
          onClose(Math.round((score / 10) * 100));
      } else {
          if (confirm("Kembali ke artikel? Progres ujian ini akan hilang.")) {
              onClose();
          }
      }
  };

  const handleSelect = (idx: number) => {
      const newAns = [...answers];
      newAns[currentIndex] = idx;
      setAnswers(newAns);
  };

  const handleNext = () => {
      if (currentIndex < data.questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          window.scrollTo(0,0);
      } else {
          finishQuiz();
      }
  };

  const finishQuiz = () => {
      let correct = 0;
      data.questions.forEach((q, i) => {
          if (answers[i] === q.correctAnswerIndex) correct++;
      });
      setScore(correct);
      setIsFinished(true);
      window.scrollTo(0,0);
  };

  if (isFinished) {
      const percentage = Math.round((score / 10) * 100);
      return (
          <div className={`max-w-4xl mx-auto p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl border animate-fade-in my-4 md:my-10 ${getThemeClass()}`}>
              <div className="text-center mb-10 md:mb-16 relative">
                  <div className="inline-flex p-6 md:p-8 rounded-full bg-yellow-50 text-yellow-600 mb-6 md:mb-8 shadow-sm">
                    <Trophy size={60} className="md:w-20 md:h-20" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Hasil Ujian</h2>
                  <div className="flex flex-col items-center justify-center gap-2 mb-6">
                      <span className="text-7xl md:text-9xl font-black text-blue-600 tracking-tighter">{percentage}</span>
                      <span className="text-xs md:text-sm font-bold opacity-40 uppercase tracking-widest bg-black/5 px-3 py-1 rounded-full">Nilai Akhir</span>
                  </div>
                  <p className="text-lg md:text-xl opacity-70 font-medium">
                      {score >= 8 ? "Luar biasa! Pemahamanmu sangat mendalam." : score >= 5 ? "Cukup baik, tapi masih bisa ditingkatkan." : "Perlu belajar lagi. Jangan menyerah!"}
                  </p>
                  
                  <div className="flex flex-col md:flex-row justify-center gap-4 mt-10">
                      <button onClick={onRetake} className="flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 font-bold hover:bg-black/5 transition-all text-lg">
                          <RotateCcw size={20} /> Ulangi
                      </button>
                      <button onClick={() => onClose(percentage)} className="px-10 py-4 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl text-lg">
                          Selesai & Keluar
                      </button>
                  </div>
              </div>

              {/* Comprehensive Review */}
              <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-3 mb-8 opacity-50 font-bold uppercase tracking-widest text-xs border-b pb-4">
                      <Brain size={16}/> Detail Evaluasi per Soal
                  </div>
                  {data.questions.map((q, i) => {
                      const isCorrect = answers[i] === q.correctAnswerIndex;
                      return (
                          <div key={q.id} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-l-8 transition-all ${isCorrect ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10' : 'border-red-500 bg-red-50/30 dark:bg-red-900/10'}`}>
                              <div className="flex gap-4 md:gap-6">
                                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                      {isCorrect ? <Check size={16} className="md:w-5 md:h-5"/> : <X size={16} className="md:w-5 md:h-5"/>}
                                  </div>
                                  <div className="flex-grow">
                                      <p className="font-bold text-lg md:text-xl mb-3 md:mb-4 leading-snug">{q.question}</p>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 md:mb-6">
                                          <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-100/50 text-green-900' : 'border-red-200 bg-red-100/50 text-red-900'}`}>
                                              <span className="text-xs font-bold uppercase opacity-50 block mb-1">Jawabanmu</span>
                                              <span className="font-bold text-base md:text-lg">{q.options?.[answers[i]] ?? "Tidak Dijawab"}</span>
                                          </div>
                                          {!isCorrect && (
                                              <div className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-green-200 bg-green-100/50 text-green-900">
                                                  <span className="text-xs font-bold uppercase opacity-50 block mb-1">Kunci Jawaban</span>
                                                  <span className="font-bold text-base md:text-lg">{q.options?.[q.correctAnswerIndex] ?? "N/A"}</span>
                                              </div>
                                          )}
                                      </div>

                                      <div className="text-sm md:text-base leading-relaxed opacity-80 p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/60 dark:bg-black/20 border border-current/5">
                                          <span className="font-bold mr-2 text-blue-600">💡 Pembahasan:</span> {q.explanation}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      )
  }

  const question = data.questions[currentIndex];

  return (
      <div className={`max-w-4xl mx-auto min-h-screen md:min-h-[90vh] flex flex-col px-4 md:px-6 py-6 md:py-10 pb-32 md:pb-10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-6 md:mb-10">
              <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 text-xs md:text-sm font-bold opacity-60 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-4 py-2 md:px-5 md:py-2.5 rounded-full hover:bg-black/10"
              >
                  <ArrowLeft size={16}/> Kembali
              </button>
              
              <div className="flex items-center gap-2 md:gap-3 font-bold text-lg md:text-xl">
                  <div className="p-2 md:p-2.5 rounded-xl bg-yellow-100 text-yellow-600"><Brain size={20} className="md:w-6 md:h-6" /></div>
                  <span className="hidden md:inline opacity-80">Ujian Pilihan Ganda</span>
                  <span className="md:hidden opacity-80 text-sm">MCQ</span>
              </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 md:mb-10">
              <div className="flex justify-between items-end mb-2 md:mb-3">
                  <span className="font-bold text-xs uppercase tracking-widest opacity-40">Progress</span>
                  <div className="font-mono font-bold opacity-40 text-sm md:text-lg">
                      {currentIndex + 1} / 10
                  </div>
              </div>
              <div className="h-2 md:h-3 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
                  ></div>
              </div>
          </div>

          {/* Question Card */}
          <div className={`flex-grow flex flex-col justify-start md:justify-center animate-fade-in-up pb-24 md:pb-0`}>
              <div className={`p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl md:shadow-2xl border backdrop-blur-xl ${getThemeClass()}`}>
                  <h3 className="text-xl md:text-4xl font-bold leading-tight mb-6 md:mb-10">
                      {question.question}
                  </h3>

                  <div className="flex flex-col gap-3 md:gap-4">
                      {question.options && question.options.map((opt, idx) => {
                          const isSelected = answers[currentIndex] === idx;
                          return (
                              <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`w-full text-left p-4 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-4 md:gap-6 group relative overflow-hidden active:scale-95 ${
                                    isSelected 
                                    ? 'border-blue-500 bg-blue-600 text-white shadow-xl scale-[1.01]' 
                                    : 'border-transparent bg-black/5 hover:bg-black/10 hover:scale-[1.01]'
                                }`}
                              >
                                  {/* Selection Indicator */}
                                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                      isSelected ? 'border-white bg-white text-blue-600' : 'border-current opacity-30'
                                  }`}>
                                      {isSelected ? <Check size={14} className="md:w-4 md:h-4" strokeWidth={4}/> : <span className="text-[10px] md:text-xs font-bold">{String.fromCharCode(65+idx)}</span>}
                                  </div>
                                  
                                  <span className={`font-medium text-base md:text-xl ${isSelected ? 'font-bold' : ''}`}>{opt}</span>
                              </button>
                          )
                      })}
                  </div>
              </div>
          </div>

          {/* Footer Navigation - Fixed on Mobile */}
          <div className={`fixed bottom-0 left-0 right-0 p-4 md:static md:p-0 md:pt-8 md:pb-8 flex justify-end backdrop-blur-xl md:backdrop-blur-none border-t md:border-0 border-black/5 z-20 ${theme === 'dark' ? 'bg-slate-900/80 md:bg-transparent' : 'bg-white/80 md:bg-transparent'}`}>
              <button 
                onClick={handleNext}
                disabled={answers[currentIndex] === -1}
                className="w-full md:w-auto px-12 py-4 rounded-full bg-slate-900 text-white font-bold text-lg shadow-2xl hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                  {currentIndex === 9 ? 'Kumpulkan Jawaban' : 'Selanjutnya'} <ChevronRight size={20} strokeWidth={3} />
              </button>
          </div>
      </div>
  );
};
