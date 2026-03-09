
import { useReducer, useEffect, useCallback } from 'react';
import { StructuredAssessmentData, StructuredState } from '../types';
import { evaluatePhase7 } from '../services/geminiService';

// --- ACTION TYPES ---
type Action = 
  | { type: 'NEXT_PHASE' }
  | { type: 'SET_VIEW_MODE'; payload: 'RESULTS' | 'ASSESSMENT' | 'REVIEW' }
  | { type: 'SET_PHASE'; payload: number } // For review mode
  | { type: 'LOCK_PHASE'; score: number; feedback: string }
  | { type: 'P1_TOGGLE'; id: string }
  | { type: 'P2_SET_CATEGORY'; id: string }
  | { type: 'P2_ADD_ITEM'; itemId: string; categoryId: string }
  | { type: 'P2_REMOVE_ITEM'; itemId: string }
  | { type: 'P3_SET_ORDER'; order: string[] }
  | { type: 'P3_MOVE'; index: number; direction: 'up' | 'down' }
  | { type: 'P4_SET_ACTIVE_OPT'; id: string | null }
  | { type: 'P4_SELECT_NODE'; nodeId: string; optionId: string | null }
  | { type: 'P5_TOGGLE'; id: string }
  | { type: 'P6_SET_ACTIVE_PRINCIPLE'; id: string | null }
  | { type: 'P6_CONNECT'; principleId: string; scenarioId: string }
  | { type: 'P7_UPDATE'; field: 'slider' | 'text' | 'feedback' | 'evaluating'; value: any }
  | { type: 'P7_TOGGLE_EVIDENCE'; id: string }
  | { type: 'INIT_DATA'; data: StructuredAssessmentData };

// --- REDUCER ---
const initialState: StructuredState = {
  currentPhase: 1,
  scores: [0, 0, 0, 0, 0, 0, 0],
  isLocked: false,
  viewMode: 'ASSESSMENT',
  feedbackMsg: '',
  p1Selected: new Set(),
  p2BucketMap: {},
  p2ActiveCategory: null,
  p3Order: [],
  p4Selections: {},
  p4ActiveOption: null,
  p5Erased: new Set(),
  p6Connections: {},
  p6ActivePrinciple: null,
  p7SliderVal: 50,
  p7SelectedEvidence: new Set(),
  p7UserText: '',
  p7AiFeedback: '',
  isEvaluatingP7: false,
};

function reducer(state: StructuredState, action: Action): StructuredState {
  switch (action.type) {
    case 'INIT_DATA':
        return {
            ...initialState,
            p3Order: [...action.data.phase3.fragments].sort(() => Math.random() - 0.5).map(f => f.id),
            p2ActiveCategory: action.data.phase2.categories[0]?.id || null
        };
    case 'NEXT_PHASE':
        return { 
            ...state, 
            currentPhase: state.currentPhase + 1, 
            isLocked: false, 
            feedbackMsg: '',
            p4ActiveOption: null,
            p6ActivePrinciple: null
        };
    case 'SET_VIEW_MODE':
        return { ...state, viewMode: action.payload };
    case 'SET_PHASE':
        return { ...state, currentPhase: action.payload, isLocked: true, viewMode: 'REVIEW' };
    case 'LOCK_PHASE':
        const newScores = [...state.scores];
        newScores[state.currentPhase - 1] = action.score;
        return { ...state, isLocked: true, scores: newScores, feedbackMsg: action.feedback };
    
    // PHASE SPECIFIC
    case 'P1_TOGGLE':
        const p1New = new Set(state.p1Selected);
        if (p1New.has(action.id)) p1New.delete(action.id); else p1New.add(action.id);
        return { ...state, p1Selected: p1New };
    
    case 'P2_SET_CATEGORY':
        return { ...state, p2ActiveCategory: action.id };
    case 'P2_ADD_ITEM':
        return { ...state, p2BucketMap: { ...state.p2BucketMap, [action.itemId]: action.categoryId } };
    case 'P2_REMOVE_ITEM':
        const p2Rem = { ...state.p2BucketMap };
        delete p2Rem[action.itemId];
        return { ...state, p2BucketMap: p2Rem };

    case 'P3_SET_ORDER':
        return { ...state, p3Order: action.order };
    case 'P3_MOVE':
        const newOrder = [...state.p3Order];
        const idx = action.index;
        if (action.direction === 'up' && idx > 0) {
            [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]];
        } else if (action.direction === 'down' && idx < newOrder.length - 1) {
            [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]];
        }
        return { ...state, p3Order: newOrder };

    case 'P4_SET_ACTIVE_OPT':
        return { ...state, p4ActiveOption: action.id };
    case 'P4_SELECT_NODE':
        const p4Sel = { ...state.p4Selections };
        if (action.optionId === null) delete p4Sel[action.nodeId];
        else p4Sel[action.nodeId] = action.optionId;
        return { ...state, p4Selections: p4Sel, p4ActiveOption: null }; // Auto clear active option

    case 'P5_TOGGLE':
        const p5New = new Set(state.p5Erased);
        if (p5New.has(action.id)) p5New.delete(action.id); else p5New.add(action.id);
        return { ...state, p5Erased: p5New };

    case 'P6_SET_ACTIVE_PRINCIPLE':
        return { ...state, p6ActivePrinciple: action.id };
    case 'P6_CONNECT':
        return { 
            ...state, 
            p6Connections: { ...state.p6Connections, [action.principleId]: action.scenarioId },
            p6ActivePrinciple: null 
        };

    case 'P7_UPDATE':
        if (action.field === 'slider') return { ...state, p7SliderVal: action.value };
        if (action.field === 'text') return { ...state, p7UserText: action.value };
        if (action.field === 'feedback') return { ...state, p7AiFeedback: action.value };
        if (action.field === 'evaluating') return { ...state, isEvaluatingP7: action.value };
        return state;
    case 'P7_TOGGLE_EVIDENCE':
        const p7New = new Set(state.p7SelectedEvidence);
        if (p7New.has(action.id)) p7New.delete(action.id); else p7New.add(action.id);
        return { ...state, p7SelectedEvidence: p7New };

    default:
        return state;
  }
}

export const useStructuredAssessment = (data: StructuredAssessmentData) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Init Data
  useEffect(() => {
     if (data) dispatch({ type: 'INIT_DATA', data });
  }, [data]);

  const calculateScore = useCallback(async () => {
      const { currentPhase } = state;
      let score = 0;

      if (currentPhase === 1) {
          let correct = 0, wrong = 0;
          const validWords = data.phase1.words.filter(w => w.isValid);
          data.phase1.words.forEach(w => {
              if (state.p1Selected.has(w.id)) { w.isValid ? correct++ : wrong++; }
          });
          const raw = (correct / validWords.length) * 100;
          score = Math.max(0, Math.round(raw - (wrong * 10)));
      }
      else if (currentPhase === 2) {
          let correct = 0;
          data.phase2.items.forEach(item => {
              if (state.p2BucketMap[item.id] === item.correctCategoryId) correct++;
          });
          score = Math.round((correct / data.phase2.items.length) * 100);
      }
      else if (currentPhase === 3) {
        let correctPos = 0;
        const correctSequence = [...data.phase3.fragments].sort((a,b) => a.correctOrder - b.correctOrder).map(f => f.id);
        correctSequence.forEach((id, idx) => { if (state.p3Order[idx] === id) correctPos++; });
        score = Math.round((correctPos / correctSequence.length) * 100);
      }
      else if (currentPhase === 4) {
        let correct = 0;
        const missingNodes = data.phase4.nodes.filter(n => n.isMissing);
        missingNodes.forEach(node => { if (state.p4Selections[node.id] === node.correctOptionId) correct++; });
        score = missingNodes.length > 0 ? Math.round((correct / missingNodes.length) * 100) : 100;
      }
      else if (currentPhase === 5) {
        let correctErased = 0, wrongErased = 0;
        const totalErrors = data.phase5.segments.filter(s => s.isError).length;
        data.phase5.segments.forEach(s => {
            const isErased = state.p5Erased.has(s.id);
            if (s.isError && isErased) correctErased++;
            if (!s.isError && isErased) wrongErased++;
        });
        score = Math.max(0, Math.round(((correctErased / totalErrors) * 100) - (wrongErased * 15)));
      }
      else if (currentPhase === 6) {
        let correct = 0;
        data.phase6.scenarios.forEach(s => {
             if (state.p6Connections[s.matchingPrincipleId] === s.id) correct++;
        });
        score = Math.round((correct / data.phase6.scenarios.length) * 100);
      }
      else if (currentPhase === 7) {
        dispatch({ type: 'P7_UPDATE', field: 'evaluating', value: true });
        if (!state.p7AiFeedback) {
            const selectedEvidenceTexts = Array.from(state.p7SelectedEvidence).map(id => data.phase7.evidences.find(e => e.id === id)?.text || "");
            const evalResult = await evaluatePhase7(data.phase7.statement, state.p7SliderVal, selectedEvidenceTexts, state.p7UserText);
            dispatch({ type: 'P7_UPDATE', field: 'feedback', value: evalResult.feedback });
            score = evalResult.score;
        } else {
            score = state.scores[6];
        }
        dispatch({ type: 'P7_UPDATE', field: 'evaluating', value: false });
      }

      dispatch({ type: 'LOCK_PHASE', score, feedback: `Skor: ${score}/100` });
  }, [data, state]);

  return { state, dispatch, calculateScore };
};
