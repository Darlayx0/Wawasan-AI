
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
  onTextSelected?: (text: string, rangeRect: DOMRect) => void; 
  disableDropCap?: boolean;
}

declare global {
  interface Window {
    MathJax: any;
    mermaid: any;
  }
}

// --- SUB-COMPONENT: Zoomable Mermaid ---
const ZoomableMermaid: React.FC<{ code: string }> = ({ code }) => {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
    const handleReset = () => setScale(1);

    return (
        <div className="my-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden shadow-sm selection-ignore">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
                    <Maximize2 size={12}/> Diagram Viewer
                </span>
                <div className="flex items-center gap-1">
                    <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Reset"><RotateCcw size={16}/></button>
                </div>
            </div>
            <div className="overflow-auto custom-scrollbar p-6" style={{ maxHeight: '600px' }}>
                <div 
                    ref={containerRef}
                    className="mermaid flex justify-center origin-top-left transition-transform duration-200 ease-out"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                >
                    {code}
                </div>
            </div>
        </div>
    );
};

const MarkdownRendererBase: React.FC<MarkdownRendererProps> = ({ 
  content, 
  fontSize = 'lg', 
  onTextSelected,
  disableDropCap = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanContent = useMemo(() => content || "", [content]);
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- MATHJAX & MERMAID RENDERING ---
  useEffect(() => {
    const renderContent = async () => {
        if (containerRef.current) {
            // 1. Render Mermaid
            if (window.mermaid) {
                try {
                    await window.mermaid.init(undefined, containerRef.current.querySelectorAll('.mermaid'));
                } catch(e) { console.warn("Mermaid error", e)}
            }

            // 2. Render MathJax
            if (window.MathJax) {
                try {
                    // Reset typeset to ensure new content is processed
                    if (window.MathJax.typesetClear) {
                        window.MathJax.typesetClear([containerRef.current]);
                    }
                    if (window.MathJax.typesetPromise) {
                        await window.MathJax.typesetPromise([containerRef.current]);
                    }
                } catch (e) {
                    console.warn("MathJax error", e);
                }
            }
        }
    };

    // Use a small delay to ensure DOM is ready, especially for large content
    const timer = setTimeout(renderContent, 100);
    return () => clearTimeout(timer);
  }, [cleanContent]);

  // --- SELECTION HANDLER ---
  useEffect(() => {
      if (!onTextSelected) return;

      const handleSelectionChange = () => {
          if (selectionTimeoutRef.current) {
              clearTimeout(selectionTimeoutRef.current);
          }

          selectionTimeoutRef.current = setTimeout(() => {
              const selection = window.getSelection();
              
              if (!selection || selection.isCollapsed || !containerRef.current) {
                  return;
              }

              if (containerRef.current.contains(selection.anchorNode) || containerRef.current.contains(selection.focusNode)) {
                  const text = selection.toString().trim();
                  
                  if (text.length > 0) {
                      try {
                          const range = selection.getRangeAt(0);
                          const rect = range.getBoundingClientRect();
                          onTextSelected(text, rect);
                      } catch (e) {
                          console.warn("Selection geometry error", e);
                      }
                  }
              }
          }, 600);
      };

      document.addEventListener('selectionchange', handleSelectionChange);
      return () => {
          document.removeEventListener('selectionchange', handleSelectionChange);
          if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);
      };
  }, [onTextSelected]);

  const textSizeClass = {
    'sm': 'text-sm leading-7',
    'base': 'text-base leading-7',
    'lg': 'text-lg leading-8 tracking-wide',
    'xl': 'text-xl leading-9 tracking-wide'
  }[fontSize];

  // --- PARSER LOGIC ---
  const parseInlineStyles = (text: string) => {
    // 1. Protect Math ($...$) and Code (`...`) from formatting
    // We use obscure delimiters (e.g., %%%MATH0%%%) that do not contain underscores or asterisks
    // to prevent the markdown regex from mangling them.
    const mathSegments: string[] = [];
    const codeSegments: string[] = [];
    
    // Capture inline math ($...$) and inline code (`...`)
    // Note: We check for code first to avoid issues if code contains $
    let protectedText = text.replace(/(`[^`]+?`)|(\$[^$]+?\$)/g, (match, codeMatch, mathMatch) => {
        if (codeMatch) {
            codeSegments.push(codeMatch);
            return `%%%CODE${codeSegments.length - 1}%%%`;
        } else if (mathMatch) {
            mathSegments.push(mathMatch);
            return `%%%MATH${mathSegments.length - 1}%%%`;
        }
        return match;
    });

    // 2. Apply Markdown Formatting (Bold, Italic)
    // Bold: **text** or __text__
    protectedText = protectedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    protectedText = protectedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ 
    // IMPORTANT: The regex (\*|_)(.*?)\1 matches _text_. 
    // Since our placeholders are %%%MATH0%%%, they don't contain _, so they are safe.
    protectedText = protectedText.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // 3. Restore Code
    protectedText = protectedText.replace(/%%%CODE(\d+)%%%/g, (_, index) => {
        const code = codeSegments[parseInt(index)].replace(/`/g, '');
        return `<code class="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md font-mono text-[0.9em] text-pink-600 dark:text-pink-400 font-medium">${code}</code>`;
    });

    // 4. Restore Math
    protectedText = protectedText.replace(/%%%MATH(\d+)%%%/g, (_, index) => {
        return mathSegments[parseInt(index)];
    });

    return protectedText;
  };

  const contentElements = useMemo(() => {
    if (!cleanContent) return null;
    
    // Split by Block Math ($$...$$), Code Blocks (```...```), and Horizontal Rules (---)
    const parts = cleanContent.split(/(\$\$[\s\S]*?\$\$|```mermaid[\s\S]*?```|```[\s\S]*?```|^---$)/gm);
    let hasAppliedDropCap = false;

    return parts.map((part, partIndex) => {
      const key = `part-${partIndex}`;
      const trimmedPart = part.trim();

      if (!trimmedPart) return null;

      // Render Block Math (Display Mode)
      if (trimmedPart.startsWith('$$') && trimmedPart.endsWith('$$')) {
        return (
            <div key={key} className="my-8 flex justify-center w-full overflow-x-auto selection-ignore">
                <div className="py-4 px-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-lg md:text-xl text-slate-800 dark:text-slate-200">
                    {trimmedPart}
                </div>
            </div>
        );
      }

      // Render Mermaid Diagram
      if (trimmedPart.startsWith('```mermaid')) {
          const mermaidCode = trimmedPart.replace(/^```mermaid\s*/, '').replace(/```$/, '').trim();
          return <ZoomableMermaid key={key} code={mermaidCode} />;
      }

      // Render Code Block
      if (trimmedPart.startsWith('```')) {
          const codeContent = trimmedPart.replace(/^```[a-z]*\s*/, '').replace(/```$/, '').trim();
          return (
            <pre key={key} className="my-8 p-6 rounded-2xl bg-slate-900 text-slate-100 overflow-x-auto text-sm font-mono leading-relaxed shadow-lg border border-slate-700 selection:bg-white/20">
                {codeContent}
            </pre>
          );
      }

      // Render Horizontal Rule
      if (trimmedPart === '---') {
          return <hr key={key} className="my-10 border-t-2 border-slate-100 dark:border-slate-800 border-dashed" />;
      }

      // Render Text Paragraphs & Tables
      const lines = part.split('\n');
      const renderedElements: React.ReactNode[] = [];
      let paragraphBuffer: string[] = [];
      let tableBuffer: string[] = [];
      let inTable = false;

      const flushParagraph = () => {
          if (paragraphBuffer.length > 0) {
              const text = paragraphBuffer.join(' ');
              if (text.trim()) {
                  // Check disableDropCap prop
                  const isDropCapEligible = !disableDropCap && !hasAppliedDropCap && !text.startsWith('#') && !text.startsWith('>') && !text.startsWith('-');
                  if (isDropCapEligible) hasAppliedDropCap = true;
                  
                  renderedElements.push(
                      <p key={`p-${renderedElements.length}`} className={`mb-6 font-serif text-justify ${textSizeClass} opacity-90 text-slate-800 dark:text-slate-200 ${isDropCapEligible ? 'drop-cap' : ''}`}>
                          <span dangerouslySetInnerHTML={{__html: parseInlineStyles(text)}} />
                      </p>
                  );
              }
              paragraphBuffer = [];
          }
      };

      const flushTable = () => {
          if (tableBuffer.length === 0) return;
          const headerRow = tableBuffer[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
          const bodyRows = tableBuffer.slice(2).map(row => row.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
          
          renderedElements.push(
              <div key={`table-${renderedElements.length}`} className="my-10 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm md:text-base">
                        <thead className="bg-slate-100 dark:bg-slate-900">
                            <tr>
                                {headerRow.map((h, i) => (
                                    <th key={i} className={`px-6 py-4 text-left font-bold uppercase tracking-wider opacity-80 text-slate-700 dark:text-slate-300`}>
                                        <span dangerouslySetInnerHTML={{__html: parseInlineStyles(h)}} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                            {bodyRows.map((row, rIdx) => (
                                <tr key={rIdx} className={`transition-colors ${rIdx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30'} hover:bg-blue-50 dark:hover:bg-blue-900/10`}>
                                    {row.map((cell, cIdx) => (
                                        <td key={cIdx} className={`px-6 py-4 align-top text-slate-700 dark:text-slate-300`}>
                                            <span dangerouslySetInnerHTML={{__html: parseInlineStyles(cell)}} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          );
          tableBuffer = [];
          inTable = false;
      };

      for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Table Detection (Basic Markdown Table)
          if (line.startsWith('|')) {
              flushParagraph();
              inTable = true;
              tableBuffer.push(line);
              continue;
          } else {
              if (inTable) flushTable();
          }

          // Image Detection
          const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
          if (imageMatch) {
              flushParagraph();
              renderedElements.push(
                  <div key={`img-${i}`} className="my-10 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group relative">
                      <img src={imageMatch[2]} alt={imageMatch[1]} className="w-full h-auto block" loading="lazy" />
                      {imageMatch[1] && <div className="p-3 text-center text-xs opacity-60 font-medium italic bg-white/80 dark:bg-black/80 backdrop-blur-sm absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform">{imageMatch[1]}</div>}
                  </div>
              );
              continue;
          }

          // Headers
          if (line.startsWith('#')) {
              flushParagraph();
              if (line.startsWith('### ')) {
                  renderedElements.push(<h3 key={`h3-${i}`} className="text-2xl font-bold mt-12 mb-4 font-sans text-blue-600 dark:text-blue-400 leading-tight tracking-tight">{line.replace(/^###\s+/, '')}</h3>);
              }
              else if (line.startsWith('## ')) {
                renderedElements.push(<h2 key={`h2-${i}`} className="text-3xl font-extrabold mt-16 mb-6 pb-4 border-b border-current/10 font-sans tracking-tight leading-tight">{line.replace(/^##\s+/, '')}</h2>);
              }
              else if (line.startsWith('# ')) {
                renderedElements.push(<h1 key={`h1-${i}`} className="text-4xl md:text-5xl font-black mb-8 font-sans leading-tight tracking-tighter">{line.replace(/^#\s+/, '')}</h1>);
              }
              continue;
          }

          // Blockquote
          if (line.startsWith('> ')) {
              flushParagraph();
              renderedElements.push(
                <blockquote key={`qt-${i}`} className="border-l-4 border-blue-500 pl-6 py-4 my-10 italic bg-blue-50 dark:bg-blue-900/10 rounded-r-xl">
                    <p className={`${textSizeClass} font-serif opacity-90 text-slate-700 dark:text-slate-300 leading-loose`}>
                        <span dangerouslySetInnerHTML={{__html: parseInlineStyles(line.replace(/^>\s+/, ''))}} />
                    </p>
                </blockquote>
              );
              continue;
          }

          // Unordered Lists
          if (line.match(/^[-*]\s/)) {
              flushParagraph();
              renderedElements.push(
                <div key={`li-${i}`} className="flex items-start gap-3 mb-3 ml-4">
                    <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <div className={`list-none font-serif pl-1 ${textSizeClass}`}>
                        <span dangerouslySetInnerHTML={{__html: parseInlineStyles(line.replace(/^[-*]\s+/, ''))}} />
                    </div>
                </div>
              );
              continue;
          }
          
          // Ordered Lists
          const orderedListMatch = line.match(/^(\d+)\.\s/);
          if (orderedListMatch) {
              flushParagraph();
              renderedElements.push(
                <div key={`li-num-${i}`} className="flex items-start gap-3 mb-3 ml-4">
                    <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[20px] text-right">{orderedListMatch[1]}.</span>
                    <div className={`list-none font-serif ${textSizeClass}`}>
                        <span dangerouslySetInnerHTML={{__html: parseInlineStyles(line.replace(/^\d+\.\s+/, ''))}} />
                    </div>
                </div>
              );
              continue;
          }

          if (!line) {
              flushParagraph();
              continue;
          }

          paragraphBuffer.push(line);
      }

      flushParagraph();
      if (inTable) flushTable();

      return <div key={partIndex} className="markdown-part">{renderedElements}</div>;
    });
  }, [cleanContent, textSizeClass, disableDropCap]);

  return (
    <div 
        ref={containerRef} 
        className="article-content max-w-none text-current transition-all relative"
        style={{ userSelect: 'text' }} // Native behavior enabled
    >
        {contentElements}
    </div>
  );
};

export const MarkdownRenderer = React.memo(MarkdownRendererBase);
