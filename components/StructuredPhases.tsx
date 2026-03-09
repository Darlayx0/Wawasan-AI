
import React, { useRef, useLayoutEffect, useState } from 'react';
import { StructuredAssessmentData, StructuredState } from '../types';
import { Cloud, Check, Layers, ArrowDown, X, AlignLeft, ArrowUp, GripVertical, Activity, ArrowRight, Sparkles, Eraser, MapPin, Scale, Eye, PenTool } from 'lucide-react';

// Common Props for all phases
interface PhaseProps {
    data: StructuredAssessmentData;
    state: StructuredState;
    dispatch: any;
    colors: any;
}

// --- PHASE 1 ---
export const Phase1Recognition: React.FC<PhaseProps> = ({ data, state, dispatch, colors }) => (
  <div className="animate-fade-in text-center pb-32">
      <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-sm"><Cloud size={40}/></div>
      <h3 className="text-3xl font-bold mb-2">Recognition</h3>
      <p className="opacity-70 mb-8 max-w-md mx-auto">Ketuk kata kunci yang VALID dari artikel.</p>
      <div className={`flex flex-wrap justify-center gap-4 p-8 rounded-3xl min-h-[300px] border-2 border-dashed ${colors.muted} ${colors.border}`}>
           {data.phase1.words.map((w) => {
               const isSelected = state.p1Selected.has(w.id);
               let btnClass = `transition-all duration-300 transform px-4 py-2 rounded-full font-bold text-sm border-2 `;
               if (state.isLocked) {
                   if (w.isValid) btnClass += isSelected ? "bg-emerald-500 text-white border-emerald-600 opacity-100" : "bg-transparent border-emerald-500 text-emerald-600 border-dashed";
                   else btnClass += isSelected ? "bg-red-500 text-white border-red-600 line-through opacity-80" : "bg-slate-200 text-slate-400 border-transparent opacity-30";
               } else {
                   btnClass += isSelected ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-110" : "bg-white dark:bg-slate-700 hover:bg-blue-50 border-transparent hover:border-blue-200 text-slate-700 dark:text-slate-200";
               }
               return (
                   <button key={w.id} disabled={state.isLocked} onClick={() => dispatch({ type: 'P1_TOGGLE', id: w.id })} className={btnClass}>
                       {w.text} {state.isLocked && w.isValid && isSelected && <Check size={14} className="inline ml-1"/>}
                   </button>
               )
           })}
      </div>
  </div>
);

// --- PHASE 2 ---
export const Phase2Organization: React.FC<PhaseProps> = ({ data, state, dispatch, colors }) => (
  <div className="animate-fade-in flex flex-col h-full pb-32">
       <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-orange-100 text-orange-600 mb-2 shadow-sm"><Layers size={32}/></div>
          <h3 className="text-2xl font-bold">Organization</h3>
          <p className="opacity-70">Pilih kategori, lalu klik item untuk memasukkannya.</p>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
           {data.phase2.categories.map(cat => {
               const isActive = state.p2ActiveCategory === cat.id;
               const itemsInBucket = data.phase2.items.filter(i => state.p2BucketMap[i.id] === cat.id);
               return (
               <div key={cat.id} onClick={() => !state.isLocked && dispatch({type: 'P2_SET_CATEGORY', id: cat.id})}
                 className={`p-4 rounded-2xl border-2 transition-all min-h-[150px] flex flex-col cursor-pointer ${isActive && !state.isLocked ? 'border-orange-500 ring-4 ring-orange-500/20 bg-orange-50' : `${colors.card} ${colors.border} opacity-80`}`}>
                   <h4 className={`font-black text-center mb-3 uppercase tracking-wider text-xs border-b pb-2 ${isActive ? 'text-orange-600' : 'opacity-50'}`}>{cat.name}</h4>
                   <div className="space-y-2 flex-grow">
                       {itemsInBucket.map(item => (
                           <div key={item.id} className={`p-2 rounded-lg text-xs font-bold shadow-sm flex justify-between items-center ${state.isLocked ? (item.correctCategoryId === cat.id ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800") : "bg-white dark:bg-slate-700"}`}>
                               <span>{item.text}</span>
                               {!state.isLocked && <button onClick={(e) => { e.stopPropagation(); dispatch({type: 'P2_REMOVE_ITEM', itemId: item.id}); }} className="text-red-400 hover:text-red-600"><X size={12}/></button>}
                           </div>
                       ))}
                   </div>
               </div>
           )})}
       </div>
       {!state.isLocked && (
           <div className={`p-5 rounded-2xl ${colors.muted} border ${colors.border}`}>
                <h5 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-2"><ArrowDown size={14}/> Item Pool</h5>
                <div className="flex flex-wrap gap-2">
                    {data.phase2.items.filter(i => !state.p2BucketMap[i.id]).map(item => (
                        <button key={item.id} onClick={() => state.p2ActiveCategory ? dispatch({type: 'P2_ADD_ITEM', itemId: item.id, categoryId: state.p2ActiveCategory}) : alert("Pilih kategori dulu!")}
                        className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 border shadow-sm hover:scale-105 active:scale-95 transition-all font-medium text-sm text-left">
                            {item.text}
                        </button>
                    ))}
                </div>
           </div>
       )}
  </div>
);

// --- PHASE 3 ---
export const Phase3Articulation: React.FC<PhaseProps> = ({ data, state, dispatch, colors }) => (
  <div className="animate-fade-in pb-32">
      <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-purple-100 text-purple-600 mb-2 shadow-sm"><AlignLeft size={32}/></div>
          <h3 className="text-2xl font-bold">Articulation</h3>
          <p className="opacity-70">Urutkan kalimat berikut agar menjadi paragraf yang padu.</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
          {state.p3Order.map((id, index) => {
              const frag = data.phase3.fragments.find(f => f.id === id);
              const correctSequence = [...data.phase3.fragments].sort((a,b) => a.correctOrder - b.correctOrder).map(f => f.id);
              const isCorrectPos = correctSequence[index] === id;
              if (!frag) return null;
              return (
                  <div key={id} className={`p-4 rounded-xl border-2 flex items-start gap-4 transition-all ${state.isLocked ? (isCorrectPos ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50") : `${colors.card} ${colors.border}`}`}>
                      <div className="flex flex-col items-center justify-center gap-1 text-slate-400 mt-1">
                          <button onClick={() => dispatch({type: 'P3_MOVE', index, direction: 'up'})} disabled={index===0 || state.isLocked} className="hover:text-purple-600 disabled:opacity-20 p-1"><ArrowUp size={18}/></button>
                          <GripVertical size={16} />
                          <button onClick={() => dispatch({type: 'P3_MOVE', index, direction: 'down'})} disabled={index===state.p3Order.length-1 || state.isLocked} className="hover:text-purple-600 disabled:opacity-20 p-1"><ArrowDown size={18}/></button>
                      </div>
                      <div className="flex-grow font-medium text-sm md:text-base leading-relaxed">{frag.text}</div>
                  </div>
              );
          })}
      </div>
  </div>
);

// --- PHASE 4 ---
export const Phase4Mechanics: React.FC<PhaseProps> = ({ data, state, dispatch, colors, theme }) => (
  <div className="animate-fade-in pb-32">
      <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-100 text-indigo-600 mb-2 shadow-sm"><Activity size={32}/></div>
          <h3 className="text-2xl font-bold">Mechanics</h3>
          <p className="opacity-70">Lengkapi diagram proses "{data.phase4.processName}".</p>
      </div>
      <div className="overflow-x-auto pb-6 mb-8">
          <div className="flex items-center gap-4 min-w-max px-4 mx-auto justify-center">
              {data.phase4.nodes.map((node, i) => {
                  const userSelection = state.p4Selections[node.id];
                  const selectedOptionText = data.phase4.options.find(o => o.id === userSelection)?.text;
                  const isWrong = state.isLocked && node.isMissing && userSelection !== node.correctOptionId;
                  return (
                      <React.Fragment key={node.id}>
                          <div onClick={() => !state.isLocked && node.isMissing && (state.p4ActiveOption ? dispatch({type: 'P4_SELECT_NODE', nodeId: node.id, optionId: state.p4ActiveOption}) : userSelection ? dispatch({type: 'P4_SELECT_NODE', nodeId: node.id, optionId: null}) : alert("Pilih opsi dulu!"))}
                            className={`relative w-48 h-32 p-4 rounded-xl border-2 flex items-center justify-center text-center text-sm font-bold shadow-sm transition-all
                                ${!node.isMissing ? `${colors.card} ${colors.border} text-slate-500` : state.isLocked ? (userSelection === node.correctOptionId ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800') : (userSelection ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-dashed border-slate-300 hover:border-indigo-400 cursor-pointer')}`}>
                              {node.isMissing ? (userSelection ? selectedOptionText : <span className="opacity-30 flex flex-col items-center gap-1"><ArrowUp size={16}/> Isi Disini</span>) : node.text}
                              {isWrong && <div className="absolute -bottom-10 left-0 right-0 text-[10px] bg-green-600 text-white py-1 px-2 rounded">Jwb: {data.phase4.options.find(o => o.id === node.correctOptionId)?.text}</div>}
                          </div>
                          {i < data.phase4.nodes.length - 1 && <ArrowRight size={32} className="text-slate-300"/>}
                      </React.Fragment>
                  )
              })}
          </div>
      </div>
      {!state.isLocked && (
        <div className={`sticky bottom-20 mx-4 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/90 border-indigo-500/50' : 'bg-white/90 border-indigo-200'}`}>
            <h5 className="text-xs font-bold uppercase opacity-50 mb-3 flex items-center gap-2 text-indigo-500"><Sparkles size={14}/> Bank Opsi</h5>
            <div className="flex flex-wrap gap-3 justify-center">
                {data.phase4.options.map(opt => {
                    const isUsed = Object.values(state.p4Selections).includes(opt.id);
                    return <button key={opt.id} disabled={isUsed} onClick={() => dispatch({type: 'P4_SET_ACTIVE_OPT', id: state.p4ActiveOption === opt.id ? null : opt.id})}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${isUsed ? 'opacity-30 bg-slate-100 border-transparent' : state.p4ActiveOption === opt.id ? 'bg-indigo-600 text-white border-indigo-600 scale-105' : 'bg-white dark:bg-slate-700 border-indigo-100'}`}>{opt.text}</button>
                })}
            </div>
        </div>
      )}
  </div>
);

// --- PHASE 5 ---
export const Phase5Validation: React.FC<PhaseProps> = ({ data, state, dispatch, colors }) => (
  <div className="animate-fade-in pb-32">
      <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-pink-100 text-pink-600 mb-2 shadow-sm"><Eraser size={32}/></div>
          <h3 className="text-2xl font-bold">Validation</h3>
          <p className="opacity-70">Ketuk kalimat yang mengandung kesalahan fakta (halusinasi AI).</p>
      </div>
      <div className={`p-8 rounded-3xl border shadow-sm text-lg leading-loose ${colors.card} ${colors.border}`}>
          {data.phase5.segments.map(seg => {
              const isErased = state.p5Erased.has(seg.id);
              let className = "transition-all cursor-pointer rounded px-1 mx-0.5 border-b-2 border-transparent ";
              if (state.isLocked) {
                  if (seg.isError && isErased) className += "bg-green-100 text-green-800 line-through decoration-wavy decoration-green-500 opacity-60";
                  else if (seg.isError && !isErased) className += "bg-red-100 text-red-800 border-red-400 font-bold";
                  else if (!seg.isError && isErased) className += "bg-yellow-100 text-yellow-800 line-through decoration-slate-400";
              } else {
                  className += isErased ? "bg-pink-100 text-pink-400 line-through decoration-pink-500 opacity-70" : "hover:bg-pink-50 hover:border-pink-200";
              }
              return <span key={seg.id} onClick={() => !state.isLocked && dispatch({type: 'P5_TOGGLE', id: seg.id})} className={className}>{seg.text}</span>
          })}
      </div>
  </div>
);

// --- PHASE 6 ---
export const Phase6Transformation: React.FC<PhaseProps & { theme: string }> = ({ data, state, dispatch, colors, theme }) => {
  const p6ContainerRef = useRef<HTMLDivElement>(null);
  const p6LeftRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const p6RightRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
  const [svgLines, setSvgLines] = useState<{x1:number, y1:number, x2:number, y2:number, color: string}[]>([]);

  useLayoutEffect(() => {
      const calculateLines = () => {
          if (!p6ContainerRef.current) return;
          const containerRect = p6ContainerRef.current.getBoundingClientRect();
          const newLines: any[] = [];
          Object.keys(state.p6Connections).forEach(pid => {
              const sid = state.p6Connections[pid];
              const leftEl = p6LeftRefs.current[pid];
              const rightEl = p6RightRefs.current[sid];
              if (leftEl && rightEl) {
                  const leftRect = leftEl.getBoundingClientRect();
                  const rightRect = rightEl.getBoundingClientRect();
                  let color = state.isLocked ? (data.phase6.scenarios.find(s=>s.id===sid)?.matchingPrincipleId === pid ? 'stroke-green-500' : 'stroke-red-500') : 'stroke-emerald-500';
                  newLines.push({ 
                      x1: leftRect.right - containerRect.left, y1: (leftRect.top + leftRect.height / 2) - containerRect.top,
                      x2: rightRect.left - containerRect.left, y2: (rightRect.top + rightRect.height / 2) - containerRect.top, color 
                  });
              }
          });
          setSvgLines(newLines);
      };
      calculateLines();
      window.addEventListener('resize', calculateLines);
      return () => window.removeEventListener('resize', calculateLines);
  }, [state.p6Connections, state.isLocked, theme, data]);

  return (
      <div className="animate-fade-in pb-32">
          <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 mb-2 shadow-sm"><MapPin size={32}/></div>
              <h3 className="text-2xl font-bold">Transformation</h3>
          </div>
          <div className="relative" ref={p6ContainerRef}>
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">{svgLines.map((l, i) => <path key={i} d={`M ${l.x1} ${l.y1} C ${l.x1 + 50} ${l.y1}, ${l.x2 - 50} ${l.y2}, ${l.x2} ${l.y2}`} fill="none" strokeWidth="3" className={`${l.color} transition-all duration-500`} strokeDasharray="5"/>)}</svg>
              <div className="flex flex-col md:flex-row gap-8 md:gap-24 relative z-20">
                   <div className="w-full md:w-1/2 space-y-6">
                       {data.phase6.principles.map(p => (
                           <button key={p.id} ref={el => {p6LeftRefs.current[p.id]=el}} disabled={state.isLocked || !!state.p6Connections[p.id]} onClick={() => dispatch({type: 'P6_SET_ACTIVE_PRINCIPLE', id: p.id})}
                             className={`w-full text-left p-5 rounded-2xl border-2 transition-all text-sm relative shadow-sm ${state.p6ActivePrinciple === p.id ? 'border-emerald-500 bg-emerald-50 ring-4' : !!state.p6Connections[p.id] ? 'border-emerald-200 opacity-50' : `${colors.card} ${colors.border}`}`}>
                               {p.text}
                           </button>
                       ))}
                   </div>
                   <div className="w-full md:w-1/2 space-y-6">
                        {data.phase6.scenarios.map(s => {
                            const connectedPid = Object.keys(state.p6Connections).find(pid => state.p6Connections[pid] === s.id);
                            return (
                                <button key={s.id} ref={el => {p6RightRefs.current[s.id]=el}} disabled={state.isLocked || !!connectedPid || !state.p6ActivePrinciple} onClick={() => state.p6ActivePrinciple && dispatch({type: 'P6_CONNECT', principleId: state.p6ActivePrinciple, scenarioId: s.id})}
                                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all text-sm relative shadow-sm ${connectedPid ? 'border-emerald-200 bg-emerald-50' : `${colors.card} ${colors.border}`}`}>
                                    {s.text}
                                </button>
                            )
                        })}
                   </div>
              </div>
          </div>
      </div>
  )
};

// --- PHASE 7 ---
export const Phase7Synthesis: React.FC<PhaseProps> = ({ data, state, dispatch, colors }) => (
  <div className="animate-fade-in pb-32">
      <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-2 shadow-sm"><Scale size={32}/></div>
          <h3 className="text-2xl font-bold">Synthesis</h3>
      </div>
      <div className={`p-6 rounded-3xl border mb-8 text-center shadow-sm ${colors.card} ${colors.border}`}>
          <p className="text-2xl font-serif font-bold leading-tight">"{data.phase7.statement}"</p>
      </div>
      <div className="mb-10 px-4">
          <input type="range" min="0" max="100" value={state.p7SliderVal} disabled={state.isLocked} onChange={(e) => dispatch({type:'P7_UPDATE', field:'slider', value: parseInt(e.target.value)})} className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/>
          <div className="text-center mt-2 font-black text-xl text-blue-600">{state.p7SliderVal}%</div>
      </div>
      <h4 className="font-bold mb-4 flex items-center gap-2"><Eye size={18}/> Pilih Bukti Pendukung:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {data.phase7.evidences.map(ev => (
              <div key={ev.id} onClick={() => !state.isLocked && dispatch({type:'P7_TOGGLE_EVIDENCE', id: ev.id})} className={`p-4 rounded-xl border-2 text-sm cursor-pointer transition-all text-left ${state.isLocked ? (state.p7SelectedEvidence.has(ev.id) ? "bg-slate-100 border-slate-400" : "opacity-40") : state.p7SelectedEvidence.has(ev.id) ? "bg-blue-50 border-blue-500 text-blue-800" : `${colors.card} ${colors.border}`}`}>
                  <div className="flex justify-between mb-1"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${ev.bias === 'SUPPORT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ev.bias}</span></div>
                  {ev.text}
              </div>
          ))}
      </div>
      <h4 className="font-bold mb-4 flex items-center gap-2"><PenTool size={18}/> Argumen Penutup:</h4>
      <textarea className={`w-full p-4 rounded-xl border-2 outline-none h-32 resize-none ${state.isLocked ? 'bg-slate-50 opacity-80' : 'bg-white/50 focus:bg-white focus:border-blue-500'}`} value={state.p7UserText} disabled={state.isLocked} onChange={(e) => dispatch({type:'P7_UPDATE', field:'text', value: e.target.value})}/>
      {state.isLocked && (
          <div className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
              <h4 className="font-bold text-lg mb-2">Analisis AI</h4>
              {state.isEvaluatingP7 ? <div className="animate-pulse h-4 bg-white/20 rounded w-1/2"></div> : <p>"{state.p7AiFeedback}"</p>}
          </div>
      )}
  </div>
);
