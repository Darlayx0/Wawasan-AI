
export interface Source {
  title: string;
  uri: string;
}

export interface ArticleData {
  topic: string;
  content: string;
  sources: Source[];
  mainImage?: string; // URL or Base64
  factualityMode?: FactualityMode; // New Prop to track mode in the article data
}

// --- CONFIG TYPES ---

export type ModelType = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';
export type DifficultyLevel = 'Umum' | 'SD' | 'SMP' | 'SMA' | 'Kuliah' | 'Profesional' | 'Ahli';
export type IllustrationType = 'NONE' | 'SEARCH' | 'IMAGEN';
export type FactualityMode = 'AUTO' | 'STRICT' | 'GROUNDED' | 'CREATIVE' | 'FICTION';

export interface ArticleConfig {
  // Config Mode removed (Unified)
  rawPrompt?: string; 
  difficulty: DifficultyLevel; 
  illustrationType: IllustrationType;
  factualityMode: FactualityMode; // NEW: Controls strictness of sources

  // Inline Content Features (Tables, Math, Code) -> REMOVED user control, now auto
  useTables: boolean;
  
  // Style & Identity
  // Removed explicit audience selection from UI, inferred from difficulty
  tone: string; 
  languageStyle: string; 
  perspective: string; 
  emotionalArc: string;
  format: string; 
  structure: string; 
  paragraphLength: string; 
  length: string;
  depth: string; 
  exampleDensity: string; 
  analogies: string; 
  citationStyle: string;
  exclusions: string; 
  engagement: string; 
  keywords: string; 
  customInstruction: string; 
}

// --- NEW: IDEA LAB MODES ---
// REPLACED 'STARTUP' with 'LEVEL_UP', ADDED 'SCIFI', 'INVERSION', 'CHRONO'
export type IdeaMode = 'FUSION' | 'LENS' | 'VERSUS' | 'WHAT_IF' | 'LEVEL_UP' | 'SCIFI' | 'INVERSION' | 'CHRONO';
export type IdeaCatalyst = 'NONE' | 'FUTURISTIC' | 'DARK_NOIR' | 'UTOPIAN' | 'CHAOS_GLITCH' | 'PHILOSOPHICAL' | 'BUSINESS';

// NEW: Starter Topic Result
export interface StarterTopic {
    topic: string;
    teaser: string;
    tag?: string; // Optional tag like "Filosofis", "Teknis"
}

// NEW: Prompt Suggestion Structure
export interface PromptSuggestion {
    type: 'FIX' | 'BROAD' | 'DEEP' | 'CREATIVE';
    text: string;
}

// NEW: Contextual Idea (Spin-off)
export interface ContextualIdea {
    title: string;
    premise: string;
    type: 'SEQUEL' | 'PREQUEL' | 'WHAT_IF' | 'DEEP_DIVE' | 'OPPOSITE';
    viralScore: number;
}

// --- CHAT TYPES ---
export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isStreaming?: boolean;
}

// --- SMART TOOLS TYPES (EXPANDED) ---

export type SmartToolType = 
  | 'CHEAT_SHEET' // Priority 1
  | 'MIND_MAP'    // Priority 2
  | 'KEY_POINTS'  // Priority 3
  | 'ELI5'        // Priority 4 (NEW)
  | 'FAQ'         // Priority 5
  | 'GLOSSARY'    
  | 'TIMELINE'    
  | 'PROS_CONS'   
  | 'ANALOGY'     
  | 'PRACTICAL'   
  | 'STATISTICS'
  // NEW UTILITIES
  | 'SOCRATIC'
  | 'FEYNMAN'
  | 'ROLEPLAY'
  | 'PODCAST'
  | 'CROSS_POLLINATOR'
  | 'CLOZE'
  | 'ACTIONABLE_CHECKLIST'
  | 'DEBATE_ARENA'
  | 'REAL_WORLD_CURATOR'; 

export interface GlossaryItem { term: string; definition: string; category?: string; }
export interface FAQItem { question: string; answer: string; }
export interface FAQCategory { categoryName: string; items: FAQItem[]; } 
export interface TimelineItem { date: string; event: string; description?: string; }
export interface ProsConsData { pros: string[]; cons: string[]; }
export interface KeyPointItem { point: string; description: string; icon?: string; }
export interface AnalogyData { concept: string; analogy: string; explanation: string; visualCue?: string; }
export interface PracticalItem { scenario: string; application: string; impact: string; }
export interface StatisticItem { label: string; value: string; context: string; trend?: 'UP' | 'DOWN' | 'NEUTRAL'; }

// UPDATED: Support multiple maps
export interface MindMapItem { title: string; code: string; type: 'graph' | 'mindmap'; summary: string; }
export interface MindMapData { maps: MindMapItem[]; }

// UPDATED: Cheat Sheet Type (Enhanced)
export interface CheatSheetSection { title: string; items: string[]; }
export interface CheatSheetData { 
    summary: string;
    sections: CheatSheetSection[]; 
    formulas?: { name: string; equation: string }[]; 
    importantDates?: { date: string; event: string }[];
    mnemonics?: { label: string; phrase: string; explanation: string }[]; // NEW
    commonPitfalls?: string[]; // NEW
}

// NEW: ELI5 Data
export interface Eli5Data {
    simpleExplanation: string;
    keyConcept: string;
    realWorldAnalogy: string;
    whyItMatters: string;
}

// --- UPGRADED TYPES FOR UTILITIES ---

export interface SocraticData {
    initialQuestion: string;
    context: string;
}

export interface RoleplayData {
    role: string;
    setting: string;
    initialSituation: string;
    initialOptions: string[];
}

export interface PodcastData {
    title: string;
    hosts: { name: string; role: string; voiceGender?: 'Male'|'Female' }[];
    script: { speaker: string; text: string; emotion?: string }[];
    durationGuess?: string;
}

export interface CrossPollinatorData {
    connections: { field: string; concept: string; explanation: string }[];
}

export interface ClozeData {
    originalText: string;
    hiddenWords: string[]; // The correct answers
    maskedText: string; // Text with [___] placeholders
    hints: string[]; // NEW: Hints for each hidden word
}

export interface ActionableChecklistData {
    goal: string;
    description: string;
    steps: { id: string; task: string; detail: string; priority: 'High' | 'Medium' | 'Low' }[];
}

export interface DebateArenaData {
    topic: string;
    aiPersona: string; // "Kontra" or "Devil's Advocate"
    userPersona: string;
    openingArgument: string;
    context: string;
}

export interface RealWorldCuratorData {
    intro: string;
    books: { title: string, author: string, year: string, reason: string, type: 'BOOK' }[];
    journals: { title: string, source: string, year: string, focus: string, type: 'JOURNAL' }[];
}

// --- EXAM TYPES ---

export interface ExamQuestionMCQ {
  id: number; question: string; options: string[]; correctAnswerIndex: number; explanation: string;
}
export interface ExamQuestionTF {
  id: number; statement: string; isTrue: boolean; explanation: string;
}
export interface ExamQuestionWritten {
  id: number; type: 'SHORT' | 'DESCRIPTION' | 'ESSAY' | 'OPINION'; question: string; maxLengthsHint?: string;
}

export interface McqExamData { questions: ExamQuestionMCQ[]; }
export interface TfExamData { questions: ExamQuestionTF[]; }
export interface WrittenExamData {
  shortAnswers: ExamQuestionWritten[]; description: ExamQuestionWritten; essay: ExamQuestionWritten; opinion: ExamQuestionWritten;
}
export interface WrittenGradingResult {
  score: number; feedbackGeneral: string;
  details: { id: number; question: string; userAnswer: string; score: number; feedback: string; isCorrect?: boolean; }[];
}

// --- PRE/POST TEST TYPES ---

export type TestMode = 'QUICK' | 'DETAILED' | 'EXTENDED';

export interface PrePostWritingQuestion {
    id: number;
    question: string;
    type: 'SHORT' | 'DESC' | 'ESSAY' | 'OPINION';
}

export interface PrePostTestData { 
    mode: TestMode;
    mcq: ExamQuestionMCQ[]; 
    writing?: {
        short: PrePostWritingQuestion[];
        desc: PrePostWritingQuestion;
        essay: PrePostWritingQuestion;
        opinion: PrePostWritingQuestion;
    };
}

export interface PrePostWritingResultDetail {
    question: string;
    userAnswer: string;
    score: number; 
    feedback: string;
}

export interface PrePostTestResult {
  mcqScore: number; 
  writingScore?: number; 
  totalScore: number; 
  userMcqAnswers: number[];
  
  userWritingAnswers?: {
      short: string[];
      desc: string;
      essay: string;
      opinion: string;
  };
  writingGrading?: {
      shortDetails: PrePostWritingResultDetail[];
      descDetail: PrePostWritingResultDetail;
      essayDetail: PrePostWritingResultDetail;
      opinionDetail: PrePostWritingResultDetail;
  }
}

export interface Flashcard { front: string; back: string; }

// --- STRUCTURED ASSESSMENT TYPES ---

export interface Phase1Word { id: string; text: string; isValid: boolean; }
export interface Phase2Category { id: string; name: string; }
export interface Phase2Item { id: string; text: string; correctCategoryId: string; }
export interface Phase3Fragment { id: string; text: string; correctOrder: number; }
export interface Phase4Node { id: string; text: string; isMissing: boolean; correctOptionId?: string; }
export interface Phase4Option { id: string; text: string; }
export interface Phase5Segment { id: string; text: string; isError: boolean; correction: string; }
export interface Phase6Principle { id: string; text: string; }
export interface Phase6Scenario { id: string; text: string; matchingPrincipleId: string; }
export interface Phase7Evidence { id: string; text: string; bias: 'SUPPORT' | 'OPPOSE'; }
export interface Phase7Data { statement: string; evidences: Phase7Evidence[]; }

export interface StructuredAssessmentData {
  phase1: { words: Phase1Word[] };
  phase2: { categories: Phase2Category[], items: Phase2Item[] };
  phase3: { fragments: Phase3Fragment[] };
  phase4: { processName: string, nodes: Phase4Node[], options: Phase4Option[] };
  phase5: { segments: Phase5Segment[] };
  phase6: { principles: Phase6Principle[], scenarios: Phase6Scenario[] };
  phase7: Phase7Data;
}

export interface StructuredState {
  currentPhase: number;
  scores: number[];
  isLocked: boolean;
  viewMode: 'ASSESSMENT' | 'RESULTS' | 'REVIEW';
  feedbackMsg: string;
  p1Selected: Set<string>;
  p2BucketMap: Record<string, string>;
  p2ActiveCategory: string | null;
  p3Order: string[];
  p4Selections: Record<string, string>;
  p4ActiveOption: string | null;
  p5Erased: Set<string>;
  p6Connections: Record<string, string>;
  p6ActivePrinciple: string | null;
  p7SliderVal: number;
  p7SelectedEvidence: Set<string>;
  p7UserText: string;
  p7AiFeedback: string;
  isEvaluatingP7: boolean;
}

export enum AppState {
  HOME = 'HOME',
  GENERATING_ARTICLE = 'GENERATING_ARTICLE',
  READING = 'READING',
  GENERATING_PRE_TEST = 'GENERATING_PRE_TEST',
  PRE_TEST = 'PRE_TEST',
  GENERATING_POST_TEST = 'GENERATING_POST_TEST',
  POST_TEST = 'POST_TEST',
  COMPARISON_RESULTS = 'COMPARISON_RESULTS',
  GENERATING_MCQ_EXAM = 'GENERATING_MCQ_EXAM',
  MCQ_EXAM = 'MCQ_EXAM',
  GENERATING_TF_EXAM = 'GENERATING_TF_EXAM',
  TF_EXAM = 'TF_EXAM',
  GENERATING_WRITTEN_EXAM = 'GENERATING_WRITTEN_EXAM',
  WRITTEN_EXAM = 'WRITTEN_EXAM',
  GENERATING_STRUCTURED = 'GENERATING_STRUCTURED',
  STRUCTURED_ASSESSMENT = 'STRUCTURED_ASSESSMENT',
  GENERATING_FLASHCARDS = 'GENERATING_FLASHCARDS',
  FLASHCARDS = 'FLASHCARDS',
  RECOMMENDATIONS = 'RECOMMENDATIONS', // Now purely a Directory
  
  // NEW STATES FOR TOOLS
  GENERATING_TOOL = 'GENERATING_TOOL',
  TOOL_VIEW = 'TOOL_VIEW'
}

// --- MISSING TYPES ---

export interface QuickQuizData {
  questions: ExamQuestionMCQ[];
}

export interface StandardQuizData {
  phase1: ExamQuestionMCQ[];
  phase2: ExamQuestionTF[];
  phase3: ExamQuestionMCQ[];
  phase4: { id: number; question: string }[];
  phase5: { prompt: string };
}

export interface QuizResult {
  mcqScore: number;
  tfScore: number;
  criticalScore: number;
  shortAnswerResults: {
    id: number;
    question: string;
    userAnswer: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  essayScore: number;
  essayFeedback: string;
  totalScore: number;
}

// --- FEED TYPES ---

export type FeedType = 'DEEP_DIVE' | 'QUICK_FACT' | 'DEBATE' | 'TUTORIAL' | 'DISCOVERY' | 'PARADOX';

export interface FeedItem {
    id: string;
    type: FeedType;
    title: string;
    description: string;
    category: string;
    difficultyLevel: number;
    readingTime: string;
    viralScore: number;
    tags: string[];
    factContent?: string;
    debateSides?: string[];
}

export interface Recommendations {
    feed: FeedItem[];
    relatedTopics: string[];
}
