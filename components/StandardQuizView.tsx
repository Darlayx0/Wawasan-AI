import React, { useState } from 'react';
import { StandardQuizData, QuizResult } from '../types';
import { gradeStandardAssessment } from '../services/geminiService';
import { CheckCircle, ChevronRight, ChevronLeft, Brain, PenTool, Layout, CheckSquare, AlignLeft, AlertCircle, Check, X, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  data: StandardQuizData;
  articleContent: string;
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const StandardQuizView: React.FC<Props> = ({ data, articleContent, onClose, theme }) => {
  const [phase, setPhase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Answers State
  const [p1Answers, setP1Answers] = useState<number[]>(new Array(10).fill(-1));
  const [p2Answers, setP2Answers] = useState<(boolean|null)[]>(new Array(10).fill(null));
  const [p3Answers, setP3Answers] = useState<number[]>(new Array(5).fill(-1));
  const [p4Answers, setP4Answers] = useState<string[]>(new Array(5).fill(''));
  const [p5Answer, setP5Answer] = useState('');

  const getThemeClass = () => {
    if (theme === 'dark') return 'text-white bg-slate-800 border-slate-700';
    if (theme === 'sepia') return 'text-amber-950 bg-[#fffbeb] border-amber-200';
    return 'text-slate-900 bg-white border-slate-200';
  };

  const handleFinish = async () => {
      if (p1Answers.includes(-1) || p2Answers.includes(null) || p3Answers.includes(-1) || p4Answers.some(a => !a.trim()) || !p5Answer.trim()) {
          if (!confirm("Masih ada jawaban kosong. Yakin ingin mengumpulkan?")) return;
      }

      setIsSubmitting(true);

      let mcqScore = 0;
      data.phase1.forEach((q, i) => { if (p1Answers[i] === q.correctAnswerIndex) mcqScore++; });

      let tfScore = 0;
      data.phase2.forEach((q, i) => { if (p2Answers[i] === q.isTrue) tfScore++; });

      let critScore = 0;
      data.phase3.forEach((q, i) => { if (p3Answers[i] === q.correctAnswerIndex) critScore++; });

      const shortAnswersPayload = data.phase4.map((q, i) => ({ question: q.question, userAnswer: p4Answers[i] }));
      
      const aiGrade = await gradeStandardAssessment(articleContent, data.phase5.prompt, p5Answer, shortAnswersPayload);
      
      // Calculate total short answer score from granular results
      const shortAnswerTotal = aiGrade.shortAnswerResults.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
      const shortAnswerPercentage = (shortAnswerTotal / 5) * 100;

      const objScore = ((mcqScore + tfScore + critScore) / 25) * 100;
      const total = Math.round((objScore * 0.5) + (shortAnswerPercentage * 0.2) + (aiGrade.essayScore * 0.3));

      setResult({
          mcqScore,
          tfScore,
          criticalScore: critScore,
          shortAnswerResults: aiGrade.shortAnswerResults,
          essayScore: aiGrade.essayScore,
          essayFeedback: aiGrade.essayFeedback,
          totalScore: total
      });
      setIsSubmitting(false);
  };

  // --- Render Functions ---

  // ... (Phases 1-5 render logic is same as before, mostly. Adding result rendering) ...

  const renderPhase1 = () => (
      <div className="space-y-8">
          <div className="text-center mb-6">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2"><Layout /> Fase 1: Pilihan Ganda</h3>
          </div>
          {data.phase1.map((q, i) => (
              <div key={q.id} className={`p-6 rounded-2xl border ${getThemeClass()}`}>
                  <p className="font-bold mb-4">{i+1}. {q.question}</p>
                  <div className="space-y-2">
                      {q.options.map((opt, idx) => (
                          <button key={idx} onClick={() => {const n = [...p1Answers]; n[i] = idx; setP1Answers(n)}}
                              className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${p1Answers[i] === idx ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-black/5 border-transparent bg-black/5'}`}>
                              <span className="opacity-70 font-mono text-xs">{String.fromCharCode(65+idx)}</span>
                              {opt}
                          </button>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  const renderPhase2 = () => (
      <div className="space-y-8">
          <div className="text-center mb-6">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2"><CheckSquare /> Fase 2: Benar / Salah</h3>
          </div>
          {data.phase2.map((q, i) => (
              <div key={q.id} className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${getThemeClass()}`}>
                  <p className="font-medium flex-grow">{i+1}. {q.statement}</p>
                  <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => {const n = [...p2Answers]; n[i] = true; setP2Answers(n)}} className={`px-4 py-2 rounded-lg font-bold border transition-colors ${p2Answers[i] === true ? 'bg-green-600 text-white' : 'border-green-600 text-green-600'}`}>BENAR</button>
                      <button onClick={() => {const n = [...p2Answers]; n[i] = false; setP2Answers(n)}} className={`px-4 py-2 rounded-lg font-bold border transition-colors ${p2Answers[i] === false ? 'bg-red-500 text-white' : 'border-red-500 text-red-500'}`}>SALAH</button>
                  </div>
              </div>
          ))}
      </div>
  );

  const renderPhase3 = () => (
      <div className="space-y-8">
          <div className="text-center mb-6">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2"><Brain /> Fase 3: Critical Thinking</h3>
          </div>
          {data.phase3.map((q, i) => (
              <div key={q.id} className={`p-6 rounded-2xl border ${getThemeClass()}`}>
                  <p className="font-bold mb-4">{i+1}. {q.question}</p>
                  <div className="space-y-2">
                      {q.options.map((opt, idx) => (
                          <button key={idx} onClick={() => {const n = [...p3Answers]; n[i] = idx; setP3Answers(n)}}
                              className={`w-full text-left px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${p3Answers[i] === idx ? 'bg-purple-600 text-white border-purple-600' : 'hover:bg-black/5 border-transparent bg-black/5'}`}>
                              <span className="opacity-70 font-mono text-xs">{String.fromCharCode(65+idx)}</span>
                              {opt}
                          </button>
                      ))}
                  </div>
              </div>
          ))}
      </div>
  );

  const renderPhase4 = () => (
      <div className="space-y-8">
          <div className="text-center mb-6">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2"><AlignLeft /> Fase 4: Isian Singkat</h3>
          </div>
          {data.phase4.map((q, i) => (
              <div key={q.id} className={`p-6 rounded-2xl border ${getThemeClass()}`}>
                  <p className="font-bold mb-4">{i+1}. {q.question}</p>
                  <input type="text" placeholder="Jawaban Anda..." value={p4Answers[i]} onChange={(e) => {const n = [...p4Answers]; n[i] = e.target.value; setP4Answers(n)}} className="w-full p-3 rounded-xl bg-black/5 border border-transparent focus:border-blue-500 outline-none" />
              </div>
          ))}
      </div>
  );

  const renderPhase5 = () => (
      <div className={`p-8 rounded-3xl border shadow-xl ${getThemeClass()}`}>
          <div className="text-center mb-8">
              <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2"><PenTool /> Fase 5: Esai</h3>
          </div>
          <div className="mb-6 font-serif text-lg leading-relaxed font-medium">"{data.phase5.prompt}"</div>
          <textarea className="w-full h-64 p-6 rounded-2xl bg-black/5 border border-transparent focus:border-blue-500 outline-none resize-none text-lg" placeholder="Tulis esai..." value={p5Answer} onChange={(e) => setP5Answer(e.target.value)}></textarea>
      </div>
  );

  const renderReviewItem = (isCorrect: boolean, question: string, userAnswer: string, correctAnswer: string, explanation: string) => (
      <div className={`p-4 rounded-xl border-l-4 mb-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'}`}>
         <p className="font-bold mb-2">{question}</p>
         <div className="text-sm space-y-1">
             <div className="flex gap-2"><span className="opacity-60 min-w-[80px]">Jawabanmu:</span> <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-500 font-bold line-through'}>{userAnswer}</span></div>
             {!isCorrect && <div className="flex gap-2"><span className="opacity-60 min-w-[80px]">Kunci:</span> <span className="text-green-600 font-bold">{correctAnswer}</span></div>}
         </div>
         <div className="mt-3 text-sm italic opacity-80 bg-white/50 p-2 rounded dark:bg-black/20"><span className="font-bold">Pembahasan:</span> {explanation}</div>
      </div>
  );

  const renderResults = () => {
      if (!result) return null;
      return (
          <div className={`max-w-4xl mx-auto p-8 rounded-3xl shadow-2xl border animate-fade-in my-10 ${getThemeClass()}`}>
              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold mb-2">Evaluasi Lengkap</h2>
                <div className="text-6xl font-extrabold mb-8 text-blue-600">{result.totalScore}</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="bg-black/5 p-2 rounded">MCQ: {result.mcqScore}/10</div>
                    <div className="bg-black/5 p-2 rounded">T/F: {result.tfScore}/10</div>
                    <div className="bg-black/5 p-2 rounded">Crit: {result.criticalScore}/5</div>
                    <div className="bg-black/5 p-2 rounded">Isian: {result.shortAnswerResults.filter(r=>r.isCorrect).length}/5</div>
                    <div className="bg-black/5 p-2 rounded">Esai: {result.essayScore}%</div>
                </div>
              </div>

              <div className="space-y-12 text-left">
                  <section>
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Fase 1: MCQ</h3>
                      {data.phase1.map((q, i) => renderReviewItem(p1Answers[i] === q.correctAnswerIndex, `${i+1}. ${q.question}`, q.options[p1Answers[i]] || "Kosong", q.options[q.correctAnswerIndex], q.explanation))}
                  </section>
                  <section>
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Fase 2: Benar/Salah</h3>
                      {data.phase2.map((q, i) => renderReviewItem(p2Answers[i] === q.isTrue, `${i+1}. ${q.statement}`, p2Answers[i] === true ? "BENAR" : p2Answers[i] === false ? "SALAH" : "KOSONG", q.isTrue ? "BENAR" : "SALAH", q.explanation))}
                  </section>
                  <section>
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Fase 3: Critical Thinking</h3>
                      {data.phase3.map((q, i) => renderReviewItem(p3Answers[i] === q.correctAnswerIndex, `${i+1}. ${q.question}`, q.options[p3Answers[i]] || "Kosong", q.options[q.correctAnswerIndex], q.explanation))}
                  </section>
                  <section>
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Fase 4: Isian Singkat (AI Graded)</h3>
                      {result.shortAnswerResults.map((res, i) => (
                           <div key={i} className={`p-4 rounded-xl border-l-4 mb-4 ${res.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                                <p className="font-bold mb-2">{res.id+1}. {res.question}</p>
                                <div className="text-sm space-y-1">
                                    <div><span className="opacity-60">Jawabanmu:</span> <span className="font-bold">"{res.userAnswer}"</span></div>
                                    <div className="mt-2 text-sm italic opacity-80 bg-white/50 p-2 rounded dark:bg-black/20"><span className="font-bold">Feedback AI:</span> {res.feedback}</div>
                                </div>
                           </div>
                      ))}
                  </section>
                  <section>
                      <h3 className="text-xl font-bold mb-4 border-b pb-2">Review Fase 5: Esai</h3>
                      <div className="bg-black/5 p-4 rounded-xl">
                          <p className="italic opacity-80">{result.essayFeedback}</p>
                      </div>
                  </section>
              </div>

              <div className="mt-8 text-center">
                  <button onClick={onClose} className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-black flex items-center gap-2 mx-auto">
                      <ArrowLeft size={18}/> Kembali ke Artikel (Reset)
                  </button>
              </div>
          </div>
      )
  };

  if (isSubmitting) return <LoadingSpinner message="Menilai Ujian Standar..." subMessage="AI sedang menganalisis setiap jawaban secara mendalam..." />;
  if (result) return renderResults();

  return (
    <div className={`max-w-4xl mx-auto min-h-[80vh] flex flex-col pb-20`}>
        <div className="flex justify-between items-center py-6 px-4">
             <button onClick={() => { if(confirm("Keluar akan mereset ujian. Yakin?")) onClose() }} className="text-sm font-bold opacity-50 hover:opacity-100 flex items-center gap-1"><ArrowLeft size={16}/> Keluar</button>
             <h2 className="font-bold text-lg">Ujian Standar</h2>
             <div className="flex gap-2">
                 {[1,2,3,4,5].map(p => (
                     <div key={p} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${phase === p ? 'bg-blue-600 text-white scale-110' : phase > p ? 'bg-green-500 text-white' : 'bg-black/10'}`}>{p}</div>
                 ))}
             </div>
        </div>

        <div className="flex-grow px-4 animate-fade-in">
            {phase === 1 && renderPhase1()}
            {phase === 2 && renderPhase2()}
            {phase === 3 && renderPhase3()}
            {phase === 4 && renderPhase4()}
            {phase === 5 && renderPhase5()}
        </div>

        <div className={`fixed bottom-0 left-0 right-0 p-4 border-t backdrop-blur-xl flex justify-center gap-4 ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <button onClick={() => setPhase(Math.max(1, phase - 1))} disabled={phase === 1} className="px-6 py-3 rounded-full border font-bold disabled:opacity-30 hover:bg-black/5"><ChevronLeft /></button>
            {phase < 5 ? (
                <button onClick={() => setPhase(phase + 1)} className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-black flex items-center gap-2">Fase Selanjutnya <ChevronRight size={18} /></button>
            ) : (
                <button onClick={handleFinish} className="px-10 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"><CheckCircle size={20} /> Kumpulkan Ujian</button>
            )}
        </div>
    </div>
  );
};
