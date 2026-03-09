
import React, { useState, useRef, useEffect } from 'react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { Send, X, Bot, User, Sparkles, AlertCircle, StopCircle, RefreshCw } from 'lucide-react';
import { createArticleChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Props {
    topic: string;
    content: string;
    onClose: () => void;
    theme: 'light' | 'dark' | 'sepia';
}

export const ArticleChat: React.FC<Props> = ({ topic, content, onClose, theme }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'init', role: 'model', text: `Halo! Saya sudah membaca artikel **"${topic}"**. Ada yang ingin ditanyakan atau didiskusikan?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Chat Session
    useEffect(() => {
        const session = createArticleChatSession(topic, content);
        setChatSession(session);
    }, [topic, content]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || !chatSession || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input.trim()
        };

        const botMsgId = (Date.now() + 1).toString();
        const botMsgPlaceholder: ChatMessage = {
            id: botMsgId,
            role: 'model',
            text: '',
            isStreaming: true
        };

        setMessages(prev => [...prev, userMsg, botMsgPlaceholder]);
        setInput('');
        setIsLoading(true);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        try {
            const resultStream = await chatSession.sendMessageStream({ message: userMsg.text });
            
            for await (const chunk of resultStream) {
                const textChunk = (chunk as GenerateContentResponse).text || "";
                setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                    ? { ...msg, text: msg.text + textChunk } 
                    : msg
                ));
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId 
                ? { ...msg, text: msg.text + "\n\n*[Maaf, terjadi kesalahan koneksi. Silakan coba lagi.]*" } 
                : msg
            ));
        } finally {
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId 
                ? { ...msg, isStreaming: false } 
                : msg
            ));
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Theme Styles
    const getBgClass = () => {
        if (theme === 'dark') return 'bg-slate-900 border-l border-slate-800';
        if (theme === 'sepia') return 'bg-[#fcf6e5] border-l border-amber-200';
        return 'bg-white border-l border-slate-200';
    };

    const getMessageClass = (role: 'user' | 'model') => {
        if (role === 'user') {
            return 'bg-blue-600 text-white rounded-tr-none';
        } else {
            if (theme === 'dark') return 'bg-slate-800 text-slate-200 rounded-tl-none';
            if (theme === 'sepia') return 'bg-amber-100 text-amber-900 rounded-tl-none';
            return 'bg-slate-100 text-slate-800 rounded-tl-none';
        }
    };

    return (
        <div className={`fixed top-0 right-0 bottom-0 w-full md:w-[400px] z-50 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0 ${getBgClass()}`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-current/10'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">Asisten Baca</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">AI Contextual Chat</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/[0.02] dark:bg-white/[0.02]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-indigo-500 text-white'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${getMessageClass(msg.role)}`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <MarkdownRenderer content={msg.text} fontSize="sm" disableDropCap={true} />
                                </div>
                            ) : (
                                <div>{msg.text}</div>
                            )}
                            {msg.isStreaming && <span className="inline-block w-2 h-2 bg-current rounded-full animate-ping ml-2"></span>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : theme === 'sepia' ? 'border-amber-200 bg-[#fcf6e5]' : 'border-slate-200 bg-white'}`}>
                <div className={`relative flex items-end gap-2 p-2 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 focus-within:border-indigo-500' : 'bg-slate-50 border-slate-200 focus-within:border-indigo-500'}`}>
                    <textarea 
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tanya tentang artikel ini..."
                        className="w-full max-h-[120px] bg-transparent border-none outline-none resize-none py-3 px-2 text-sm font-medium"
                        rows={1}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`p-3 rounded-xl mb-0.5 transition-all ${
                            input.trim() && !isLoading
                            ? 'bg-indigo-600 text-white shadow-lg hover:scale-105 active:scale-95' 
                            : 'bg-current/10 text-current opacity-30 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? <StopCircle size={18} className="animate-pulse"/> : <Send size={18} />}
                    </button>
                </div>
                <div className="text-[10px] text-center mt-2 opacity-40 font-bold uppercase tracking-widest">
                    Gemini 3 Flash • Context Aware
                </div>
            </div>

        </div>
    );
};
