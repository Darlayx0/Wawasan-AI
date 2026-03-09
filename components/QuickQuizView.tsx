
import React, { useState } from 'react';
import { QuickQuizData } from '../types';
import { Brain, CheckCircle, ChevronRight, Trophy, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  data: QuickQuizData;
  onClose: () => void;
  onRetake: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const QuickQuizView: React.FC<Props> = ({ data, onClose, onRetake, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(data.questions.length).fill(-1));
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const getThemeClass = () => {
     if (theme === 'dark') return 'text-white bg-slate-900 border-slate-700';
     if (theme === 'sepia') return 'text-amber-950 bg-[#fffbeb] border-amber-200';
     return 'text-slate-900 bg-white border-slate-200';
  };

  const handleSelect = (idx: number) => {
      const newAns = [...answers];
      newAns[currentIndex] = idx;
      setAnswers(newAns);
  };

  const handleNext = () => {
      if (currentIndex < data.questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
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
  };

  if (isFinished) {
      const percentage = (score / 5) * 100;
      return (
          <div className={`max-w-2xl mx-auto p-8 rounded-3xl shadow-xl border text-center animate-fade-in my-10 ${getThemeClass()}`}>
              <Trophy size={64} className="mx-auto mb-6 text-yellow-500" />
              <h2 className="text-3xl font-bold mb-2">Hasil Ujian Singkat</h2>
              <div className="text-6xl font-extrabold mb-6 text-blue-600">{percentage}</div>
              <p className="mb-8 opacity-70">Anda menjawab {score} dari 5 soal dengan benar.</p>
              
              <div className="flex justify-center gap-4">
                  <button onClick={onRetake} className="flex items-center gap-2 px-6 py-3 rounded-full border hover:bg-black/5">
                      <RotateCcw size={18} /> Ulangi
                  </button>
                  <button onClick={onClose} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700">
                      Selesai
                  </button>
              </div>
          </div>
      )
  }

  const question = data.questions[currentIndex];

  return (
      <div className={`max-w-3xl mx-auto min-h-[60vh] flex flex-col p-6 my-8 rounded-3xl shadow-xl border ${getThemeClass()}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 font-bold opacity-60">
                  <Brain size={20} /> Ujian Singkat
              </div>
              <div className="font-mono text-sm opacity-50">
                  {currentIndex + 1} / 5
              </div>
          </div>

          {/* Question */}
          <div className="flex-grow">
              <h3 className="text-xl md:text-2xl font-bold mb-8 leading-snug">
                  {question.question}
              </h3>

              <div className="space-y-3">
                  {question.options && question.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                            answers[currentIndex] === idx 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                            : 'border-transparent bg-black/5 hover:bg-black/10'
                        }`}
                      >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                              answers[currentIndex] === idx ? 'bg-blue-600 text-white' : 'bg-current opacity-20'
                          }`}>
                              {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="font-medium">{opt}</span>
                      </button>
                  ))}
              </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext}
                disabled={answers[currentIndex] === -1}
                className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                  {currentIndex === 4 ? 'Kumpulkan' : 'Selanjutnya'} <ChevronRight size={18} />
              </button>
          </div>
      </div>
  );
};
