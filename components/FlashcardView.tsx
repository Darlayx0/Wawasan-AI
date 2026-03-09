
import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../types';
import { ArrowLeft, ArrowRight, RotateCw, Check, Search, GraduationCap, X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

interface FlashcardViewProps {
  cards: Flashcard[];
  onClose: () => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ cards, onClose, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        setIsFlipped(prev => !prev);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]); // Re-bind when index changes if needed

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150); // Small delay to prevent flipping glitch during transition
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
    }, 150);
  };

  // Touch Swipe Logic
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) nextCard();
    if (isRightSwipe) prevCard();
  };

  const currentCard = cards[currentIndex];

  // Theming
  const getPageBg = () => {
    if (theme === 'dark') return 'bg-slate-950 text-slate-100';
    if (theme === 'sepia') return 'bg-[#fcf6e5] text-amber-950';
    return 'bg-slate-50 text-slate-800';
  }

  const getCardBg = () => {
    if (theme === 'dark') return 'bg-slate-900 border-slate-700 shadow-slate-900/50';
    if (theme === 'sepia') return 'bg-[#fffbeb] border-amber-200 shadow-amber-900/10';
    return 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  };

  return (
    <div className={`flex flex-col items-center min-h-screen relative overflow-hidden transition-colors duration-300 ${getPageBg()}`}>
       
       {/* --- Top Navigation --- */}
       <div className="w-full max-w-3xl flex justify-between items-center p-6 z-20">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-all opacity-60 hover:opacity-100 flex items-center gap-2">
                  <ArrowLeft size={20}/> <span className="font-bold text-sm hidden md:inline">Keluar</span>
            </button>
            
            <div className="flex flex-col items-center">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Flashcards</div>
                 <div className="font-bold text-lg flex items-center gap-2">
                    {currentIndex + 1} <span className="opacity-30">/</span> {cards.length}
                 </div>
            </div>

            <div className="w-10"></div> {/* Spacer for alignment */}
       </div>

       {/* --- Progress Bar --- */}
       <div className="w-full max-w-md h-1.5 bg-black/5 dark:bg-white/10 rounded-full mb-8 overflow-hidden">
           <div 
             className="h-full bg-blue-500 transition-all duration-300 ease-out" 
             style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
           ></div>
       </div>

       {/* --- Main Stage --- */}
       <div 
         className="flex-grow flex items-center justify-center w-full max-w-xl px-6 pb-20 perspective-1500"
         onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
       >
           {/* Card Scene */}
           <div className="relative w-full aspect-[3/4] md:aspect-[4/3] flashcard-scene group">
               
               {/* Stacked Cards Effect (Background decoration) */}
               <div className={`absolute top-4 inset-x-4 bottom-0 rounded-[1.5rem] opacity-40 scale-[0.95] -z-10 transform translate-y-3 transition-all ${getCardBg()}`}></div>
               <div className={`absolute top-8 inset-x-8 bottom-0 rounded-[1.5rem] opacity-20 scale-[0.90] -z-20 transform translate-y-6 transition-all ${getCardBg()}`}></div>

               {/* The Card Itself */}
               <div 
                 className={`flashcard-inner cursor-pointer ${isFlipped ? 'flashcard-flipped' : ''}`}
                 onClick={() => setIsFlipped(!isFlipped)}
               >
                   
                   {/* FRONT FACE (Question) */}
                   <div className={`flashcard-face flashcard-front ${getCardBg()} p-8 md:p-12 text-center border`}>
                       <div className="flex-shrink-0 flex justify-between items-start mb-4">
                           <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                               <HelpCircle size={24} />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 bg-black/5 px-2 py-1 rounded">Pertanyaan</span>
                       </div>

                       <div className="flex-grow flex items-center justify-center">
                           <h3 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-balance select-none">
                             {currentCard.front}
                           </h3>
                       </div>

                       <div className="mt-auto pt-6 opacity-40 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest animate-pulse">
                           <RotateCw size={14}/> Ketuk Balik
                       </div>
                   </div>

                   {/* BACK FACE (Answer) */}
                   <div className={`flashcard-face flashcard-back ${getCardBg()} p-8 md:p-12 text-center border relative overflow-hidden`}>
                       {/* Subtle Background decoration for back */}
                       <div className="absolute inset-0 bg-green-500/5 pointer-events-none"></div>
                       
                       <div className="flex-shrink-0 flex justify-between items-start mb-4 relative z-10">
                           <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300">
                               <Check size={24} />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 bg-black/5 px-2 py-1 rounded">Jawaban</span>
                       </div>

                       <div className="flex-grow flex items-center justify-center relative z-10 w-full overflow-y-auto custom-scrollbar">
                           <p className="text-xl md:text-2xl font-serif font-medium leading-relaxed opacity-90 text-balance select-none">
                             {currentCard.back}
                           </p>
                       </div>

                       <div className="mt-auto pt-6 relative z-10 w-full">
                           <button 
                             onClick={(e) => { e.stopPropagation(); nextCard(); }}
                             className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                           >
                               Lanjut <ChevronRight size={16}/>
                           </button>
                       </div>
                   </div>

               </div>
           </div>
       </div>

       {/* --- Desktop Controls --- */}
       <div className="fixed bottom-8 hidden md:flex items-center gap-6 z-30">
           <button onClick={prevCard} className="p-4 rounded-full bg-white dark:bg-slate-800 border hover:bg-slate-50 shadow-lg active:scale-90 transition-all group">
               <ChevronLeft size={24} className="opacity-50 group-hover:opacity-100"/>
           </button>
           
           <div className="px-6 py-3 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold tracking-wider flex items-center gap-4 shadow-xl">
                <span className="flex items-center gap-1"><kbd className="bg-white/20 px-1.5 rounded">Spasi</kbd> Balik</span>
                <span className="w-px h-4 bg-white/20"></span>
                <span className="flex items-center gap-1"><kbd className="bg-white/20 px-1.5 rounded">←</kbd> <kbd className="bg-white/20 px-1.5 rounded">→</kbd> Navigasi</span>
           </div>

           <button onClick={nextCard} className="p-4 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-90 transition-all">
               <ChevronRight size={24} />
           </button>
       </div>

       {/* --- Mobile Hint --- */}
       <div className="fixed bottom-6 md:hidden text-[10px] font-bold uppercase tracking-widest opacity-30 pointer-events-none">
            Swipe Kiri / Kanan
       </div>

    </div>
  );
};
