
// ... existing imports ...
import { useState } from 'react';
import { AppState, ArticleData, ArticleConfig, ModelType, DifficultyLevel, PrePostTestData, PrePostTestResult, McqExamData, TfExamData, WrittenExamData, StructuredAssessmentData, Flashcard, Recommendations, TestMode, SmartToolType } from '../types';
import * as gemini from '../services/geminiService';

export const useAppManager = () => {
    // --- STATE ---
    const [appState, setAppState] = useState<AppState>(AppState.HOME);
    const [previousAppState, setPreviousAppState] = useState<AppState>(AppState.HOME);
    
    // Core Content
    const [topic, setTopic] = useState('');
    const [article, setArticle] = useState<ArticleData | null>(null);
    const [recommendations, setRecommendations] = useState<Recommendations | null>(null); // State for Feed
    const [isFeedLoading, setIsFeedLoading] = useState(false); // New loading state for feed

    // Configurations
    const [selectedModel, setSelectedModel] = useState<ModelType>('gemini-3-flash-preview');
    const [config, setConfig] = useState<ArticleConfig | null>(null); 

    // Assessments Data
    const [testMode, setTestMode] = useState<TestMode>('QUICK');
    const [preTestData, setPreTestData] = useState<PrePostTestData | null>(null);
    const [postTestData, setPostTestData] = useState<PrePostTestData | null>(null);
    const [mcqExam, setMcqExam] = useState<McqExamData | null>(null);
    const [tfExam, setTfExam] = useState<TfExamData | null>(null);
    const [writtenExam, setWrittenExam] = useState<WrittenExamData | null>(null);
    const [structuredData, setStructuredData] = useState<StructuredAssessmentData | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);

    // Smart Tools Data
    const [activeToolType, setActiveToolType] = useState<SmartToolType | null>(null);
    const [smartToolData, setSmartToolData] = useState<any>(null);
    // Cache for tools: { TOOL_NAME: data }
    const [toolCache, setToolCache] = useState<Record<string, any>>({});

    // Results
    const [preTestResult, setPreTestResult] = useState<PrePostTestResult | null>(null);
    const [postTestResult, setPostTestResult] = useState<PrePostTestResult | null>(null);
    const [scores, setScores] = useState({ mcq: null as number|null, tf: null as number|null, written: null as number|null, structured: null as number|null, flashcards: false });

    // --- ACTIONS ---

    const navigate = (state: AppState) => {
        setPreviousAppState(appState);
        setAppState(state);
    };

    const generateArticle = async (inputTopic: string, cfg: ArticleConfig) => {
        setTopic(inputTopic);
        setConfig(cfg);
        navigate(AppState.GENERATING_ARTICLE);
        setArticle(null);
        
        // Reset Exam & Tool States
        setScores({ mcq: null, tf: null, written: null, structured: null, flashcards: false });
        setPreTestResult(null); setPostTestResult(null); setPreTestData(null); setPostTestData(null);
        setSmartToolData(null); setActiveToolType(null);
        setToolCache({}); // Clear cache on new article

        try {
            const data = await gemini.generateArticle(inputTopic, cfg.difficulty, selectedModel, cfg);
            setArticle(data);
            navigate(AppState.READING);
        } catch (e) {
            alert("Gagal membuat artikel.");
            navigate(AppState.HOME);
        }
    };

    // Open Directory (Clean State)
    const openDirectory = () => {
        setRecommendations(null); // Clear previous feed
        setTopic(''); // Clear topic so UI shows directory
        navigate(AppState.RECOMMENDATIONS);
    };

    // Generate Feed (100 Ideas)
    const generateFeed = async (inputTopic: string) => {
        setTopic(inputTopic);
        navigate(AppState.RECOMMENDATIONS);
        setIsFeedLoading(true);
        setRecommendations(null); // Clear previous results while loading

        try {
            const res = await gemini.generateRecommendations(inputTopic, []);
            setRecommendations(res);
        } catch (e) {
            console.error("Feed failed", e);
            alert("Gagal membuat feed topik.");
            // Don't navigate back, just stay in recommendations (will show empty or directory)
        } finally {
            setIsFeedLoading(false);
        }
    };

    const startTool = async (type: SmartToolType, forceRegenerate = false) => {
        if (!article) return;
        setActiveToolType(type);
        setSmartToolData(null);
        
        // Check cache first if not forced
        if (!forceRegenerate && toolCache[type]) {
            setSmartToolData(toolCache[type]);
            navigate(AppState.TOOL_VIEW);
            return;
        }

        navigate(AppState.GENERATING_TOOL);
        
        try {
            const data = await gemini.generateSmartTool(article.content, type);
            if (data) {
                setSmartToolData(data);
                setToolCache(prev => ({ ...prev, [type]: data })); // Update cache
                navigate(AppState.TOOL_VIEW);
            } else {
                alert("Maaf, gagal membuat alat bantu ini saat ini. Silakan coba lagi.");
                navigate(AppState.READING);
            }
        } catch (e) { 
            console.error(e);
            alert("Terjadi kesalahan saat memproses alat bantu.");
            navigate(AppState.READING); 
        }
    };

    // Updated to accept mode
    const startPreTest = async (mode: TestMode = 'QUICK') => {
        if (!article) return;
        setTestMode(mode);
        navigate(AppState.GENERATING_PRE_TEST);
        try {
            const data = await gemini.generatePreTest(article.topic, mode);
            setPreTestData(data);
            navigate(AppState.PRE_TEST);
        } catch { navigate(AppState.READING); }
    };

    const startPostTest = async () => {
        if (!article || !preTestData) return;
        navigate(AppState.GENERATING_POST_TEST);
        try {
            // Collect existing questions to ensure uniqueness
            const existingQs = preTestData.mcq.map(q => q.question);
            if (preTestData.writing) {
                preTestData.writing.short.forEach(q => existingQs.push(q.question));
                existingQs.push(preTestData.writing.desc.question);
                existingQs.push(preTestData.writing.essay.question);
                existingQs.push(preTestData.writing.opinion.question);
            }

            // Generate FRESH post-test data (no reuse of pre-test)
            const postData = await gemini.generateAdditionalPostTestQuestions(article.content, testMode, existingQs);
            setPostTestData(postData);
            navigate(AppState.POST_TEST);
        } catch { navigate(AppState.READING); }
    };

    const startExam = async (type: 'MCQ' | 'TF' | 'WRITTEN' | 'STRUCTURED' | 'FLASHCARDS') => {
        if (!article) return;
        
        try {
            if (type === 'MCQ') {
                navigate(AppState.GENERATING_MCQ_EXAM);
                const d = await gemini.generateMcqExam(article.content);
                setMcqExam(d);
                navigate(AppState.MCQ_EXAM);
            } else if (type === 'TF') {
                navigate(AppState.GENERATING_TF_EXAM);
                const d = await gemini.generateTfExam(article.content);
                setTfExam(d);
                navigate(AppState.TF_EXAM);
            } else if (type === 'WRITTEN') {
                navigate(AppState.GENERATING_WRITTEN_EXAM);
                const d = await gemini.generateWrittenExam(article.content);
                setWrittenExam(d);
                navigate(AppState.WRITTEN_EXAM);
            } else if (type === 'STRUCTURED') {
                navigate(AppState.GENERATING_STRUCTURED);
                const d = await gemini.generateStructuredAssessment(article.content);
                setStructuredData(d);
                navigate(AppState.STRUCTURED_ASSESSMENT);
            } else if (type === 'FLASHCARDS') {
                navigate(AppState.GENERATING_FLASHCARDS);
                const d = await gemini.generateFlashcards(article.content);
                setFlashcards(d);
                navigate(AppState.FLASHCARDS);
            }
        } catch { navigate(AppState.READING); }
    };

    const saveScore = (type: keyof typeof scores, val: any) => {
        setScores(prev => ({ ...prev, [type]: val }));
        navigate(AppState.READING);
    };

    const resetApp = () => {
        setAppState(AppState.HOME);
        setTopic('');
        setArticle(null);
    };

    return {
        // State
        appState, previousAppState, topic, setTopic, article, recommendations, isFeedLoading,
        selectedModel, setSelectedModel, config, setConfig,
        preTestData, setPreTestData, postTestData, setPostTestData, preTestResult, setPreTestResult, postTestResult, setPostTestResult,
        mcqExam, tfExam, writtenExam, structuredData, flashcards, scores, testMode,
        activeToolType, smartToolData,
        
        // Actions
        navigate, generateArticle, openDirectory, generateFeed, startPreTest, startPostTest, startExam, saveScore, resetApp, startTool
    };
};
