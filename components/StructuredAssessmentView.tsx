
import React from 'react';
import { StructuredAssessmentData } from '../types';
import { useStructuredAssessment } from '../hooks/useStructuredAssessment';
import { Phase1Recognition, Phase2Organization, Phase3Articulation, Phase4Mechanics, Phase5Validation, Phase6Transformation, Phase7Synthesis } from './StructuredPhases';
import { Trophy, ArrowRight, ArrowLeft, Lock, Cloud, Layers, AlignLeft, Activity, Eraser, MapPin, Scale, Eye } from 'lucide-react';

interface Props {
  data: StructuredAssessmentData;
  onClose: (score?: number) => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const StructuredAssessmentView: React.FC<Props> = ({ data, onClose, theme }) => {
  const { state, dispatch, calculateScore } = useStructuredAssessment(data);

  const getThemeColors = () => {
    if (theme === 'dark') return { bg: 'bg-slate-900', card: 'bg-slate-800', text: 'text-slate-100', border: 'border-slate-700', muted: 'bg-slate-800/50' };
    if (theme === 'sepia') return { bg: 'bg-[#fef3c7]', card: 'bg-[#fffbeb]', text: 'text-[#451a03]', border: 'border-amber-200', muted: 'bg-amber-100' };
    return { bg: 'bg-slate-50', card: 'bg-white', text: 'text-slate-900', border: 'border-slate-200', muted: 'bg-slate-50' };
  };
  const colors = getThemeColors();

  const handleNextPhase = () => {
      if (state.currentPhase < 7) dispatch({ type: 'NEXT_PHASE' });
      else dispatch({ type: 'SET_VIEW_MODE', payload: 'RESULTS' });
  };

  const renderDashboard = () => {
    const finalScore = Math.round(state.scores.reduce((a,b) => a+b, 0) / 7);
    const getGrade = (s: number) => s >= 95 ? 'S' : s >= 85 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : 'D';
    
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
            <div className={`p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-center mb-12 relative overflow-hidden ${colors.card} ${colors.border} border`}>
                <h2 className="text-3xl font-bold mb-2">Evaluasi Performa</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mt-8">
                    <div className="text-center"><div className={`text-8xl font-black text-blue-600 leading-none`}>{getGrade(finalScore)}</div><div className="font-bold opacity-50 mt-2">Grade</div></div>
                    <div className="text-center"><div className="text-6xl font-black opacity-80 leading-none">{finalScore}</div><div className="font-bold opacity-50 mt-2">Rata-rata</div></div>
                </div>
                <button onClick={() => onClose(finalScore)} className="mt-10 px-10 py-3 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl">Selesai</button>
            </div>
            <h3 className="text-xl font-bold mb-6 px-4">Detail Per Fase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                {[
                    { title: "Recognition", icon: <Cloud/> }, { title: "Organization", icon: <Layers/> },
                    { title: "Articulation", icon: <AlignLeft/> }, { title: "Mechanics", icon: <Activity/> },
                    { title: "Validation", icon: <Eraser/> }, { title: "Transformation", icon: <MapPin/> },
                    { title: "Synthesis", icon: <Scale/> }
                ].map((p, i) => (
                    <div key={i} className={`p-5 rounded-3xl border transition-all ${colors.card} ${colors.border} flex justify-between items-center`}>
                        <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-black/5">{p.icon}</div><span className="font-bold">{p.title}</span></div>
                        <div className="text-2xl font-black text-blue-600">{state.scores[i]}</div>
                        <button onClick={() => dispatch({type: 'SET_PHASE', payload: i+1})} className="text-xs font-bold underline opacity-50 hover:opacity-100">Review</button>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (state.viewMode === 'RESULTS') return renderDashboard();

  return (
    <div className={`min-h-[90vh] max-w-4xl mx-auto flex flex-col ${colors.text}`}>
      <div className="mb-6 pt-6 px-4 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md transition-all">
          <div className="flex justify-between items-center mb-4">
              <button onClick={() => state.viewMode === 'REVIEW' ? dispatch({type: 'SET_VIEW_MODE', payload: 'RESULTS'}) : onClose()} className="opacity-50 hover:opacity-100 font-bold flex items-center gap-1 text-sm"><ArrowLeft size={16}/> {state.viewMode==='REVIEW' ? 'Kembali' : 'Keluar'}</button>
              <div className="font-black opacity-30 uppercase tracking-widest text-xs">FASE {state.currentPhase} / 7</div>
          </div>
          <div className="flex gap-1 h-1.5">{[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < state.currentPhase ? 'bg-emerald-500' : i === state.currentPhase ? 'bg-blue-600' : 'bg-current opacity-10'}`} />)}</div>
      </div>

      <div className="flex-grow px-4 overflow-y-auto">
          {state.currentPhase === 1 && <Phase1Recognition data={data} state={state} dispatch={dispatch} colors={colors} />}
          {state.currentPhase === 2 && <Phase2Organization data={data} state={state} dispatch={dispatch} colors={colors} />}
          {state.currentPhase === 3 && <Phase3Articulation data={data} state={state} dispatch={dispatch} colors={colors} />}
          {state.currentPhase === 4 && <Phase4Mechanics data={data} state={state} dispatch={dispatch} colors={colors} theme={theme} />}
          {state.currentPhase === 5 && <Phase5Validation data={data} state={state} dispatch={dispatch} colors={colors} />}
          {state.currentPhase === 6 && <Phase6Transformation data={data} state={state} dispatch={dispatch} colors={colors} theme={theme} />}
          {state.currentPhase === 7 && <Phase7Synthesis data={data} state={state} dispatch={dispatch} colors={colors} />}
      </div>

      {state.viewMode === 'ASSESSMENT' && (
        <div className={`fixed bottom-0 left-0 right-0 p-6 border-t backdrop-blur-xl z-20 flex justify-center ${theme === 'dark' ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
            <div className="w-full max-w-4xl flex items-center justify-between">
                <div className="font-bold text-lg text-emerald-600 animate-fade-in">{state.feedbackMsg}</div>
                {!state.isLocked ? (
                     <button onClick={calculateScore} className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Lock size={18}/> Kunci Jawaban</button>
                ) : (
                    <button onClick={handleNextPhase} className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold shadow-lg flex items-center gap-2 hover:bg-black transition-transform"><ArrowRight size={18}/> {state.currentPhase === 7 ? 'Selesai' : 'Lanjut'}</button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
