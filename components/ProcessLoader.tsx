
import React, { useState, useEffect } from 'react';

export type ProcessMode = 'ARTICLE' | 'FEED' | 'EXAM' | 'FLASHCARD' | 'STRUCTURED' | 'GENERIC';

interface Props {
  mode: ProcessMode;
  topic?: string;
}

export const ProcessLoader: React.FC<Props> = ({ mode, topic }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // MESSAGES CYCLE
  const messagesMap: Record<ProcessMode, string[]> = {
      ARTICLE: [
        "Membangun kerangka pengetahuan...",
        "Melakukan riset mendalam via Google Search...",
        "Menganalisis korelasi data & fakta...",
        "Menyusun narasi yang terstruktur...",
        "Finalisasi tata bahasa dan format..."
      ],
      FEED: [
        "Menginisialisasi Agen Kurasi...",
        "Memilah fakta esensial & tren terkini...",
        "Mengidentifikasi sudut pandang perdebatan...",
        "Menganalisis statistik pendukung...",
        "Menghubungkan titik-titik wawasan..."
      ],
      EXAM: [
        "Memindai materi pembelajaran...",
        "Mengidentifikasi konsep kunci & distraktors...",
        "Kalibrasi tingkat kesulitan soal...",
        "Validasi logika jawaban...",
        "Menyusun paket evaluasi..."
      ],
      STRUCTURED: [
        "Membangun matriks evaluasi kognitif...",
        "Analisis Taksonomi Bloom...",
        "Menyiapkan skenario studi kasus...",
        "Kalibrasi sistem penilaian otomatis...",
        "Menyusun 7 fase asesmen terpadu..."
      ],
      FLASHCARD: [
        "Ekstraksi definisi & istilah kunci...",
        "Optimasi materi untuk Active Recall...",
        "Menyusun kartu memori digital..."
      ],
      GENERIC: [
        "Memproses permintaan...",
        "Sedang menganalisis...",
        "Menghubungkan ke basis pengetahuan...",
      ]
  };

  const messages = messagesMap[mode] || messagesMap.GENERIC;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000); // Switch text every 2s
    return () => clearInterval(interval);
  }, [messages.length]);

  // --- 3D VISUAL COMPONENTS (Seamless Loop) ---

  const CubeVisual = () => (
      <div className="scene-3d">
          <div className="cube-3d">
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
              <div className="cube-face bg-blue-500/10 border-blue-400"></div>
          </div>
      </div>
  );

  const GyroVisual = () => (
      <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="gyro-ring w-full h-full animate-[spin_3s_linear_infinite]"></div>
          <div className="gyro-ring w-4/5 h-4/5 animate-[spin-reverse_4s_linear_infinite] border-t-pink-500 border-b-pink-500"></div>
          <div className="gyro-ring w-3/5 h-3/5 animate-[spin_2s_linear_infinite] border-t-cyan-500 border-b-cyan-500"></div>
          <div className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse"></div>
      </div>
  );

  const RadarVisual = () => (
      <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="scanner-radar">
              <div className="scanner-line"></div>
              <div className="scanner-dot absolute w-1.5 h-1.5 bg-emerald-400 rounded-full top-[20%] left-[60%] shadow-[0_0_8px_#34d399] animate-pulse"></div>
              <div className="scanner-dot absolute w-1.5 h-1.5 bg-emerald-400 rounded-full top-[70%] left-[30%] shadow-[0_0_8px_#34d399] animate-pulse delay-700"></div>
          </div>
          <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
      </div>
  );

  const GenericVisual = () => (
      <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute inset-2 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
          <div className="absolute inset-6 border-4 border-t-transparent border-r-purple-500 border-b-transparent border-l-purple-500 rounded-full animate-[spin-reverse_1s_linear_infinite]"></div>
      </div>
  );

  // Selector
  const renderVisual = () => {
      if (mode === 'ARTICLE') return <CubeVisual />;
      if (mode === 'FEED') return <GyroVisual />;
      if (mode === 'EXAM' || mode === 'STRUCTURED') return <RadarVisual />;
      return <GenericVisual />;
  };

  const getTitle = () => {
      if (mode === 'FEED') return "Eksplorasi Wawasan";
      if (mode === 'ARTICLE') return "Menyusun Artikel";
      if (mode === 'EXAM') return "Menyiapkan Evaluasi";
      return "Memproses...";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors animate-fade-in">
        
        {/* Main 3D Object Area */}
        <div className="mb-12 scale-150 md:scale-[2]">
            {renderVisual()}
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md px-6 z-10">
            <div className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mb-3 animate-pulse">
                {getTitle()}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400 dark:from-white dark:to-slate-600 mb-6 leading-tight">
                {topic ? `"${topic}"` : "Wawasan AI"}
            </h2>

            {/* Cycling Status Message with Fade Effect */}
            <div className="h-8">
                <p key={currentMessageIndex} className="text-lg md:text-xl font-medium text-blue-600 dark:text-blue-400 animate-fade-in-up">
                    {messages[currentMessageIndex]}
                </p>
            </div>
        </div>

        {/* Background Ambient Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

    </div>
  );
};
