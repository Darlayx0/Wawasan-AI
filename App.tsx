
import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { useAppManager } from './hooks/useAppManager';

// Views & Components
import { HomeView } from './components/HomeView';
import { ReadingView } from './components/ReadingView';
import { TopicRecommendations } from './components/TopicRecommendations';
import { ProcessLoader } from './components/ProcessLoader'; // NEW LOADER

// Assessment Views
import { PrePostTestView } from './components/PrePostTestView';
import { McqExamView } from './components/McqExamView';
import { TfExamView } from './components/TfExamView';
import { WrittenExamView } from './components/WrittenExamView';
import { StructuredAssessmentView } from './components/StructuredAssessmentView';
import { FlashcardView } from './components/FlashcardView';
import { SmartToolsView } from './components/SmartToolsView';

type Theme = 'light' | 'dark' | 'sepia';

const App = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const app = useAppManager();

  // Initialize Default Config on Mount
  useEffect(() => {
     // Config initialization handled lazily in HomeView to prevent hydration mismatches
     const body = document.body;
     body.classList.remove('dark', 'bg-slate-50', 'bg-slate-900', 'bg-sepia-bg', 'text-slate-900', 'text-slate-100', 'text-sepia-text');
     if (theme === 'dark') body.classList.add('dark', 'bg-slate-900', 'text-slate-100');
     else if (theme === 'sepia') body.classList.add('bg-sepia-bg', 'text-sepia-text');
     else body.classList.add('bg-slate-50', 'text-slate-900');
  }, [theme]);

  // SCROLL TO TOP ON NAVIGATION
  useEffect(() => {
      window.scrollTo(0, 0);
  }, [app.appState]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- RENDER ROUTER ---

  switch (app.appState) {
    case AppState.HOME:
      return (
        <HomeView 
           topic={app.topic} setTopic={app.setTopic}
           selectedModel={app.selectedModel} setSelectedModel={app.setSelectedModel}
           config={app.config} setConfig={app.setConfig}
           onStart={app.generateArticle}
           onExplore={(t) => {
               // Logic: If topic exists, generate feed directly. If empty, open directory.
               if (t && t.trim().length > 0) {
                   app.generateFeed(t);
               } else {
                   app.openDirectory();
               }
           }}
           theme={theme}
        />
      );

    case AppState.GENERATING_ARTICLE:
      // Uses ProcessLoader with ARTICLE mode
      return <ProcessLoader mode="ARTICLE" topic={app.topic} />;

    case AppState.READING:
      return (
         <ReadingView 
            article={app.article!}
            onBack={app.resetApp}
            hasTakenPreTest={!!app.preTestResult} hasTakenPostTest={!!app.postTestResult} preTestData={app.preTestData}
            onStartPreTest={app.startPreTest} onStartPostTest={app.startPostTest} onSkipPreTest={() => app.setPreTestData({mcq:[], tf:[]})}
            onShowComparison={() => app.navigate(AppState.COMPARISON_RESULTS)}
            onStartExam={app.startExam} 
            onExplore={() => app.generateFeed(app.article!.topic)} // Explore button on article always generates feed
            onStartTool={(t) => app.startTool(t, false)} // Default: Use Cache
            onSelectTopic={(t) => { app.setTopic(t); app.navigate(AppState.HOME); }} // Handle spin-off topic
            scores={app.scores} theme={theme} onToggleTheme={toggleTheme}
         />
      );

    case AppState.RECOMMENDATIONS:
      return (
          <TopicRecommendations 
            recommendations={app.recommendations}
            topic={app.topic}
            onTopicSelect={(t) => {
                app.setTopic(t);
                app.navigate(AppState.HOME);
            }} 
            onDomainSelect={(domain) => app.generateFeed(domain)}
            onBack={() => {
                if (app.recommendations) {
                    // If in feed mode, go back to directory
                    app.openDirectory();
                } else {
                    // If in directory mode, go back to previous state (Home or Article)
                    app.navigate(app.previousAppState);
                }
            }}
            onRefresh={() => app.generateFeed(app.topic)}
            isLoading={app.isFeedLoading}
            theme={theme}
          />
      );

    // --- ASSESSMENTS & LOADERS ---

    case AppState.GENERATING_PRE_TEST: return <ProcessLoader mode="EXAM" />;
    case AppState.PRE_TEST:
      return app.preTestData ? <PrePostTestView data={app.preTestData} type="PRE" onComplete={app.setPreTestResult} onClose={() => app.navigate(AppState.READING)} theme={theme} /> : null;
    
    case AppState.GENERATING_POST_TEST: return <ProcessLoader mode="EXAM" />;
    case AppState.POST_TEST:
      return app.postTestData ? <PrePostTestView data={app.postTestData} type="POST" onComplete={app.setPostTestResult} onClose={() => app.navigate(AppState.READING)} theme={theme} /> : null;

    case AppState.COMPARISON_RESULTS:
      return app.postTestData && app.preTestResult && app.postTestResult ? 
         <PrePostTestView data={app.postTestData} type="COMPARISON" preTestResult={app.preTestResult} postTestResult={app.postTestResult} onComplete={()=>{}} onClose={() => app.navigate(AppState.READING)} theme={theme} /> : null;

    case AppState.GENERATING_MCQ_EXAM: return <ProcessLoader mode="EXAM" />;
    case AppState.MCQ_EXAM:
       return app.mcqExam ? <McqExamView data={app.mcqExam} onClose={(s) => s!==undefined ? app.saveScore('mcq',s) : app.navigate(AppState.READING)} onRetake={() => app.startExam('MCQ')} theme={theme} /> : null;

    case AppState.GENERATING_TF_EXAM: return <ProcessLoader mode="EXAM" />;
    case AppState.TF_EXAM:
       return app.tfExam ? <TfExamView data={app.tfExam} onClose={(s) => s!==undefined ? app.saveScore('tf',s) : app.navigate(AppState.READING)} onRetake={() => app.startExam('TF')} theme={theme} /> : null;

    case AppState.GENERATING_WRITTEN_EXAM: return <ProcessLoader mode="EXAM" />;
    case AppState.WRITTEN_EXAM:
       return app.writtenExam && app.article ? <WrittenExamView data={app.writtenExam} articleContent={app.article.content} onClose={(s) => s!==undefined ? app.saveScore('written',s) : app.navigate(AppState.READING)} onRetake={() => app.startExam('WRITTEN')} theme={theme} /> : null;

    case AppState.GENERATING_STRUCTURED: return <ProcessLoader mode="STRUCTURED" />;
    case AppState.STRUCTURED_ASSESSMENT:
       return app.structuredData ? <StructuredAssessmentView data={app.structuredData} onClose={(s) => s!==undefined ? app.saveScore('structured',s) : app.navigate(AppState.READING)} theme={theme} /> : null;

    case AppState.GENERATING_FLASHCARDS: return <ProcessLoader mode="FLASHCARD" />;
    case AppState.FLASHCARDS:
       return app.flashcards ? <FlashcardView cards={app.flashcards} onClose={() => app.saveScore('flashcards', true)} theme={theme} /> : null;

    // --- NEW TOOLS ---
    case AppState.GENERATING_TOOL: return <ProcessLoader mode="GENERIC" />;
    case AppState.TOOL_VIEW:
        return app.smartToolData ? 
            <SmartToolsView 
                type={app.activeToolType!} 
                data={app.smartToolData} 
                onClose={() => app.navigate(AppState.READING)} 
                onRegenerate={() => app.startTool(app.activeToolType!, true)} // Force regenerate
                theme={theme} 
            /> : null;

    default:
      return <div>State Error</div>;
  }
};

export default App;
