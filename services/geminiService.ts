
import { GoogleGenAI, Type, Schema, GenerateContentResponse, GenerateImagesResponse, Chat } from "@google/genai";
import { 
    ArticleData, McqExamData, TfExamData, WrittenExamData, WrittenGradingResult, 
    PrePostTestData, Flashcard, DifficultyLevel, Recommendations, StructuredAssessmentData, 
    Source, ModelType, ArticleConfig, TestMode, FeedItem, SmartToolType, IdeaMode, 
    StarterTopic, ContextualIdea, FactualityMode, IdeaCatalyst, PrePostTestResult,
    PrePostWritingResultDetail, PromptSuggestion
} from "../types";
import { constructArticlePrompt } from "./promptBuilder";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const DEFAULT_MODEL = 'gemini-3-flash-preview';

// --- RETRY HELPER ---

const callWithRetry = async <T>(fn: () => Promise<T>, retries = 4, baseDelay = 2000): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const status = error?.status || error?.code || error?.response?.status || 0;
            const message = error?.message || JSON.stringify(error);
            const isRateLimit = status === 429 || status === 503 || message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED');
            
            if (isRateLimit && i < retries - 1) {
                const delayTime = baseDelay * Math.pow(2, i) + (Math.random() * 1000);
                console.warn(`Gemini API Rate Limit (${status}). Retrying in ${Math.round(delayTime)}ms... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delayTime));
            } else {
                if (i === retries - 1 && isRateLimit) {
                    console.error("Max retries exceeded for rate limit.");
                }
                throw error;
            }
        }
    }
    throw new Error("Request failed after max retries");
};

// --- CHAT SESSION ---

export const createArticleChatSession = (articleTopic: string, articleContent: string): Chat => {
    const systemInstruction = `
    Anda adalah Asisten Pembelajaran AI yang berdedikasi untuk membantu pengguna memahami artikel berjudul "${articleTopic}".
    
    TUGAS UTAMA:
    Jawab pertanyaan pengguna berdasarkan KONTEN ARTIKEL berikut. Anda boleh menggunakan pengetahuan umum untuk menjelaskan istilah sulit, tetapi fokuslah pada konteks artikel ini.
    
    KONTEN ARTIKEL:
    ${articleContent}
    
    GAYA KOMUNIKASI:
    - Ramah, suportif, dan edukatif.
    - Gunakan Bahasa Indonesia yang baik.
    - Jika pengguna bertanya di luar topik, jawab dengan singkat lalu arahkan kembali ke artikel.
    - Gunakan format Markdown (bold, italic, list) untuk jawaban yang mudah dibaca.
    - Jika perlu rumus matematika, gunakan format LaTeX ($...$ atau $$...$$).
    `;

    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: systemInstruction,
        }
    });
};

// --- ARTICLE GENERATION ---

export const generateArticle = async (
    topic: string, 
    difficulty: DifficultyLevel = 'Profesional', 
    model: ModelType = 'gemini-3-flash-preview',
    config: ArticleConfig | null = null
): Promise<ArticleData> => {
  try {
    const userPrompt = constructArticlePrompt(topic, config);
    let factuality = config?.factualityMode || 'GROUNDED';

    let systemInstruction = "";
    let useGoogleSearch = true;

    if (factuality === 'STRICT' || factuality === 'AUTO') {
        systemInstruction = `Anda adalah AI Penulis Konten berbasis Fakta. ATURAN KERAS: 1. WAJIB pakai Google Search tool untuk memverifikasi setiap klaim. 2. DILARANG KERAS berhalusinasi. BAHASA: INDONESIA.`;
    } else if (factuality === 'GROUNDED') {
        systemInstruction = `Anda adalah AI Penulis Konten Edukatif. Gunakan Google Search untuk fondasi fakta. BAHASA: INDONESIA.`;
    } else if (factuality === 'CREATIVE') {
        systemInstruction = `Anda adalah AI Penulis Kreatif. Gunakan fakta sebagai inspirasi. BAHASA: INDONESIA.`;
    } else if (factuality === 'FICTION') {
        systemInstruction = `Anda adalah Penulis Fiksi. Fokus pada world-building dan narasi. BAHASA: INDONESIA.`;
    }

    const fullPrompt = `${userPrompt}\n\n[ACTION] Lakukan riset mendalam menggunakan Google Search tentang "${topic}" untuk memastikan akurasi data. Tulis kontennya sesuai mode: ${factuality}. \n\nPENTING: GUNAKAN BAHASA INDONESIA YANG BAIK DAN BENAR.`;

    const tools: any[] = [];
    if (useGoogleSearch) {
        tools.push({ googleSearch: {} });
    }

    const textPromise = callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: model, 
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        responseMimeType: "text/plain",
      },
    }));

    let imagePromise: Promise<string | undefined> = Promise.resolve(undefined);
    if (config?.illustrationType === 'IMAGEN') {
        imagePromise = (async () => {
            try {
                const imgResponse = await callWithRetry<GenerateImagesResponse>(() => ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: `A high quality, professional illustration about ${topic}.`,
                    config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
                }), 2);
                const base64EncodeString = imgResponse.generatedImages?.[0]?.image?.imageBytes;
                if (base64EncodeString) return `data:image/jpeg;base64,${base64EncodeString}`;
            } catch (e) {
                console.warn("Imagen generation failed:", e);
                return undefined;
            }
            return undefined;
        })();
    }

    const [response, generatedImage] = await Promise.all([textPromise, imagePromise]);

    let extractedSources: Source[] = [];
    const candidateChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const topLevelChunks = (response as any).groundingMetadata?.groundingChunks;
    const chunks = candidateChunks || topLevelChunks;
    
    if (chunks && Array.isArray(chunks)) {
        extractedSources = chunks
            .filter((c: any) => c.web?.uri && c.web?.title)
            .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
    }

    const uniqueSources = Array.from(new Map(extractedSources.map((item) => [item.uri, item])).values());
    let contentText = response.text || "Gagal membuat konten artikel.";
    let mainImage = generatedImage;

    if (config?.factualityMode === 'AUTO') {
        const modeMatch = contentText.match(/^\[MODE:\s*(.*?)\]/i);
        if (modeMatch) {
            const detectedMode = modeMatch[1].trim().toUpperCase();
            if (['STRICT', 'GROUNDED', 'CREATIVE', 'FICTION'].includes(detectedMode)) {
                factuality = detectedMode as FactualityMode;
            }
            contentText = contentText.replace(/^\[MODE:\s*.*?\]\s*/i, '');
        }
    }

    if (config?.illustrationType === 'SEARCH' && !mainImage) {
        const imgRegex = /!\[(.*?)\]\((.*?)\)/;
        const match = contentText.match(imgRegex);
        if (match && match[2]) mainImage = match[2];
    }

    return { topic, content: contentText, sources: uniqueSources, mainImage: mainImage, factualityMode: factuality };
  } catch (error: any) {
    console.error("Error generating article:", error);
    if (error?.message?.includes('429') || error?.status === 429) {
        throw new Error("Kuota API habis (429). Silakan tunggu beberapa saat atau periksa billing.");
    }
    throw new Error("Gagal membuat artikel. Periksa koneksi atau API Key.");
  }
};

// --- IDEA LAB ---

export const generateContextualIdeas = async (topic: string, contentSnippet: string): Promise<ContextualIdea[]> => {
    try {
        const prompt = `Based on "${topic}" and content, generate 5 "Spin-off" ideas (SEQUEL, PREQUEL, WHAT_IF, DEEP_DIVE, OPPOSITE). JSON format. Language: Indonesian.`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: `${prompt}\n\nCONTEXT:\n${contentSnippet.substring(0, 5000)}`,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "[]");
    } catch { return []; }
};

// --- UTILS ---

export const explainText = async (text: string, contextTopic: string): Promise<string> => {
    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: `Jelaskan "${text}" dalam konteks "${contextTopic}" secara TO THE POINT (Bahasa Indonesia). Maksimal 2 kalimat.`,
        }));
        return response.text || "Gagal memuat penjelasan.";
    } catch { return "Error loading explanation."; }
};

export const simplifyText = async (text: string, contextTopic: string): Promise<string> => {
    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: `Ubah ke bahasa anak SD (ELI5 - Bahasa Indonesia). Hapus jargon. Maksimal 2 kalimat. Konteks: "${contextTopic}". Teks: "${text}"`,
        }));
        return response.text || "Gagal menyederhanakan.";
    } catch { return "Error simplifying."; }
};

export const translateText = async (text: string): Promise<string> => {
    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: `Translate to Indonesian/English (detect opposite). Text: "${text}"`,
        }));
        return response.text || "Gagal menerjemahkan.";
    } catch { return "Error translating."; }
};

export const explainBatch = async (texts: string[], contextTopic: string): Promise<string> => {
    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: `Jelaskan teks berikut secara SINGKAT dalam BAHASA INDONESIA (Max 3 kalimat). Teks: "${texts.join(" ")}". Konteks: "${contextTopic}"`,
        }));
        return response.text || "Gagal analisis.";
    } catch { return "Gagal analisis batch."; }
};

export const generateStarterTopics = async (inputs: string[], mode: IdeaMode = 'FUSION'): Promise<StarterTopic[]> => {
    try {
        let prompt = "";
        
        if (mode === 'INVERSION') {
            prompt = `Idea Lab Mode: INVERSION. 
            Topic: "${inputs[0]}".
            Task: Generate 5 article topics that explore the "Anti-Pattern", "Failure Mode", or "Opposite Perspective" of this topic. 
            Example: If topic is "Success", output "How to Fail Miserably".
            Output JSON: { "topics": [{ "topic": "Title (Indonesian)", "teaser": "Short hook (Indonesian)", "tag": "Inversi" }] }`;
        } else if (mode === 'CHRONO') {
            prompt = `Idea Lab Mode: CHRONO (Time Travel).
            Topic: "${inputs[0]}".
            Task: Generate 5 article topics. Mix between:
            1. Historical perspective (100 years ago).
            2. Future perspective (100 years from now).
            3. Timeline evolution.
            Output JSON: { "topics": [{ "topic": "Title (Indonesian)", "teaser": "Short hook (Indonesian)", "tag": "Masa Lalu/Depan" }] }`;
        } else {
            prompt = `Idea Lab AI (Mode: ${mode}). Inputs: [${inputs.join(", ")}]. Create 5 unique article topics. Output JSON: { "topics": [{ "topic": "Title (Indonesian)", "teaser": "Short hook (Indonesian)", "tag": "Micro-tag" }] }`;
        }

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}").topics || [];
    } catch { return [{ topic: inputs[0], teaser: "Error generating.", tag: "Error" }]; }
};

export const refineTopic = async (topic: string): Promise<PromptSuggestion[]> => {
    try {
        const prompt = `You are a helpful AI Editor. 
        User input: "${topic}".
        Task: Analyze the input and provide 4 specific types of suggestions in INDONESIAN:
        1. "FIX": Correct the grammar, spelling, or clarity of the input. Make it sound professional.
        2. "BROAD": A broader, more general, or beginner-friendly variation (Topik Umum/Luas).
        3. "DEEP": A specific, niche, or academic variation (Topik Mendalam/Spesifik).
        4. "CREATIVE": A catchy, unique, or "clicky" title variation.

        Output JSON: 
        { 
            "suggestions": [
                { "type": "FIX", "text": "..." },
                { "type": "BROAD", "text": "..." },
                { "type": "DEEP", "text": "..." },
                { "type": "CREATIVE", "text": "..." }
            ] 
        }`;

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        
        const res = JSON.parse(response.text || "{}");
        return res.suggestions || [];
    } catch (e) { 
        console.error("Refine failed", e); 
        return []; 
    }
};

// --- MASSIVE FEED GENERATION (100 ITEMS) ---

export const generateRecommendations = async (topic: string, existingTopics: string[] = []): Promise<Recommendations> => {
  try {
    const isRealTime = ["Berita", "News", "Terkini", "Hari Ini", "Trending", "Viral", "Saham", "Politik"].some(k => topic.includes(k));
    const tools: any[] = [];
    
    if (isRealTime) {
        tools.push({ googleSearch: {} });
    }

    const count = 100;
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `Bertindaklah sebagai 'Knowledge Curator' dengan akses database universal.
    
    KONTEKS DOMAIN: "${topic}"
    TANGGAL HARI INI: ${dateStr}
    
    TUGAS: Hasilkan daftar **TEPAT ${count} (SERATUS)** topik artikel/feed dalam BAHASA INDONESIA.
    
    ATURAN ISI:
    1. Variasi adalah kunci. Jangan repetitif. Gali sub-niche yang jarang dibahas.
    2. Campur tingkat kesulitan: dari "Fakta Receh" (Level 1) sampai "Teori Konspirasi/Filsafat Berat" (Level 5).
    3. Judul harus "Clicky" tapi Intelektual.
    
    FORMAT OUTPUT (JSON):
    {
      "feed": [
        {
          "id": "1",
          "type": "DEEP_DIVE" | "QUICK_FACT" | "DEBATE" | "TUTORIAL" | "DISCOVERY" | "PARADOX",
          "title": "Judul Menarik (Max 10 Kata)",
          "description": "Teaser singkat (Max 15 Kata)",
          "category": "Sub-Kategori",
          "difficultyLevel": 1-5,
          "readingTime": "X min",
          "viralScore": 1-100,
          "tags": ["Tag1", "Tag2"],
          "factContent": "Isi fakta singkat (jika type QUICK_FACT)",
          "debateSides": ["Pro", "Kontra"] (jika type DEBATE)
        },
        ... (Total 100 items)
      ],
      "relatedTopics": ["Topik Lain 1", "Topik Lain 2"]
    }`;

    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: isRealTime ? 'gemini-3-pro-preview' : DEFAULT_MODEL, 
      contents: prompt,
      config: { 
          responseMimeType: "application/json",
          tools: tools
      }
    }));

    const result = JSON.parse(response.text || "{ \"feed\": [], \"relatedTopics\": [] }");
    
    result.feed = result.feed.map((f: any, i: number) => ({
        ...f,
        id: f.id || `feed-${Date.now()}-${i}`
    }));

    return result;
  } catch (error) {
    console.error("Feed Error", error);
    return { feed: [], relatedTopics: [] };
  }
};

// --- SMART TOOLS ---

export const generateSmartTool = async (content: string, type: SmartToolType): Promise<any> => {
    try {
        let prompt = "";
        
        if (type === 'CHEAT_SHEET') {
            prompt = `Create a Cheat Sheet (JSON) in INDONESIAN. Structure: { summary: string, sections: {title:string, items:string[]}[], formulas: {name:string, equation:string}[], importantDates: {date:string, event:string}[], mnemonics: {label:string, phrase:string, explanation:string}[], commonPitfalls: string[] }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'MIND_MAP') {
            prompt = `Create a Mermaid.js Mind Map in INDONESIAN. JSON: { maps: {title:string, code:string (mermaid syntax), summary:string}[] }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'ELI5') {
            prompt = `Explain Like I'm 5 (INDONESIAN). JSON: { simpleExplanation: string, keyConcept: string, realWorldAnalogy: string, whyItMatters: string }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'GLOSSARY') {
            prompt = `Extract Glossary (INDONESIAN). JSON Array: { term: string, definition: string, category: string }[]. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'FAQ') {
            prompt = `Generate FAQ (INDONESIAN). JSON: { categories: {categoryName:string, items:{question:string, answer:string}[]}[] }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'TIMELINE') {
            prompt = `Generate Timeline (INDONESIAN). JSON Array: { date: string, event: string, description: string }[]. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'PROS_CONS') {
            prompt = `Generate Pros & Cons (INDONESIAN). JSON: { pros: string[], cons: string[] }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'KEY_POINTS') {
            prompt = `Extract Key Points (INDONESIAN). JSON Array: { point: string, description: string, icon: string (emoji) }[]. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'ANALOGY') {
            prompt = `Create a master analogy (INDONESIAN). JSON: { concept: string, analogy: string, explanation: string, visualCue: string }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'PRACTICAL') {
            prompt = `Practical Applications (INDONESIAN). JSON Array: { scenario: string, application: string, impact: string }[]. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'STATISTICS') {
            prompt = `Extract Data/Stats (INDONESIAN). JSON Array: { label: string, value: string, context: string, trend: 'UP'|'DOWN'|'NEUTRAL' }[]. Content: ${content.substring(0, 10000)}`;
        
        // --- NEW UTILITIES (UPGRADED) ---
        } else if (type === 'SOCRATIC') {
            // Returns just the initial setup for the chat
            prompt = `Act as a Socratic Tutor (INDONESIAN). Create the INITIAL starting point. JSON: { initialQuestion: string (The deep opening question), context: string (Brief context on what the user should think about) }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'FEYNMAN') {
            prompt = `Create a Feynman Test Challenge (INDONESIAN). JSON: { conceptToExplain: string, rules: string[] (simple rules), exampleAnalogy: string (AI example of simplicity) }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'ROLEPLAY') {
            prompt = `Create a Roleplay Adventure Setup (INDONESIAN). JSON: { role: string (Who is the user?), setting: string (Where are they?), initialSituation: string (The starting conflict), initialOptions: string[] (2-3 generic actions to start, e.g. 'Investigate', 'Talk', 'Run') }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'PODCAST') {
            prompt = `Generate a Podcast Script (Host & Expert) (INDONESIAN). Make it SOUND NATURAL with banter. JSON: { title: string, hosts: {name:string, role:string, voiceGender: 'Male'|'Female'}[], script: {speaker:string, text:string, emotion:string}[], durationGuess: string }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'CROSS_POLLINATOR') {
            prompt = `Connect this topic to 3 different UNEXPECTED fields (INDONESIAN). JSON: { connections: {field:string, concept:string, explanation:string}[] }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'CLOZE') {
            prompt = `Create a Cloze Deletion Passage (INDONESIAN). Mask 5-10 KEY CONCEPTS only. Include hints for each. JSON: { originalText: string, hiddenWords: string[], maskedText: string (use [___] for hidden words), hints: string[] (Hint for each hidden word) }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'ACTIONABLE_CHECKLIST') {
            prompt = `Create an ULTRA-SPECIFIC Actionable Checklist (INDONESIAN). Convert knowledge into a step-by-step master plan. JSON: { goal: string, description: string, steps: { id: string, task: string, detail: string, priority: 'High'|'Medium'|'Low' }[] }. Content: ${content.substring(0, 10000)}`;
        } else if (type === 'DEBATE_ARENA') {
            prompt = `Set up a Debate Arena (INDONESIAN). Identify a controversial angle. JSON: { topic: string, aiPersona: string (e.g. 'Skeptis Radikal'), userPersona: string, openingArgument: string, context: string }. Content: ${content.substring(0, 5000)}`;
        } else if (type === 'REAL_WORLD_CURATOR') {
            prompt = `Act as an expert Librarian & Researcher. 
            Identify 3 REAL books and 2 REAL academic journals/papers related to the content.
            JSON: { 
                intro: string (Short intro about why these resources matter),
                books: { title: string, author: string, year: string, reason: string, type: 'BOOK' }[],
                journals: { title: string, source: string, year: string, focus: string, type: 'JOURNAL' }[]
            }. Content: ${content.substring(0, 5000)}`;
        }

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error(`Error generating tool ${type}:`, e);
        return null;
    }
};

// --- INTERACTIVE HELPERS ---

export const continueSocraticTurn = async (history: {role: string, text: string}[]): Promise<string> => {
    try {
        const historyText = history.map(h => `${h.role === 'model' ? 'Tutor' : 'Student'}: ${h.text}`).join('\n');
        const prompt = `
        Act as a Socratic Tutor.
        Conversation History:
        ${historyText}
        
        Task: 
        1. Analyze the Student's last answer.
        2. If they are correct/deep, ask a harder follow-up.
        3. If they are vague, ask for clarification.
        4. If they are wrong, guide them with a question (do NOT give the answer).
        5. Keep it short (1-2 sentences).
        6. Language: Indonesian.
        `;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
        }));
        return response.text || "...";
    } catch { return "Maaf, saya kehilangan fokus. Bisa ulangi?"; }
};

export const evaluateDebateTurn = async (history: {speaker: string, text: string}[], context: string): Promise<{reply: string, score: {ai: number, user: number}, commentary: string}> => {
    try {
        const historyText = history.map(h => `${h.speaker}: ${h.text}`).join('\n');
        const prompt = `
        Debate Judge & Opponent AI.
        Context: ${context.substring(0, 300)}
        History: ${historyText}
        
        Task:
        1. Generate a sharp, logical rebuttal as the Opponent (max 2 sentences).
        2. Evaluate who is winning logically (Score 0-100 for AI and User).
        3. Provide 1 sentence commentary on the User's last point.
        
        Output JSON: { reply: string, score: { ai: number, user: number }, commentary: string }
        `;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { reply: "Argumen menarik...", score: {ai: 50, user: 50}, commentary: "Lanjut." }; }
};

export const continueRoleplay = async (history: {text: string}[], choice: string): Promise<{narration: string, options: string[]}> => {
    try {
        const historyText = history.slice(-3).map(h => h.text).join('\n'); // Keep context small
        const prompt = `
        Text Adventure Game Master (Indonesian).
        History: ${historyText}
        User Action: ${choice}
        
        Task:
        1. Describe the consequence of the action (Immersive, 2-3 sentences).
        2. Provide 3 new distinct options for the user.
        
        Output JSON: { narration: string, options: string[] }
        `;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { narration: "Sesuatu terjadi, namun kabut menutupi pandangan...", options: ["Coba lagi", "Lari", "Diam"] }; }
};

export const generateCustomConnection = async (concept: string, customField: string): Promise<{concept: string, explanation: string}> => {
    try {
        const prompt = `Connect the concept "${concept}" with the field "${customField}" in a creative, metaphorical way. Indonesian. JSON: { concept: string (Title of connection), explanation: string (The analogy) }`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { concept: "Gagal", explanation: "Tidak dapat menghubungkan." }; }
};

// --- FEYNMAN EVALUATION ---
export const evaluateFeynman = async (concept: string, userExplanation: string): Promise<any> => {
    try {
        const prompt = `Evaluate this Feynman Technique explanation (INDONESIAN).
        Concept: ${concept}
        User Explanation: "${userExplanation}"
        
        Task:
        1. Rate Simplicity (0-100).
        2. Rate Accuracy (0-100).
        3. Provide Feedback (Constructive).
        4. Provide "Better Version": Rewrite the user's explanation to be perfectly simple yet accurate (ELI5 style).
        
        Output JSON: { simplicityScore: number, accuracyScore: number, feedback: string, betterVersion: string }`;

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { simplicityScore: 0, accuracyScore: 0, feedback: "Error evaluating.", betterVersion: "" }; }
};

// --- DEBATE CONTINUATION (Legacy function kept for compatibility if needed, but superseded by evaluateDebateTurn) ---
export const continueDebate = async (history: {speaker: string, text: string}[], userReply: string, context: string, aiPersona: string): Promise<string> => {
    const res = await evaluateDebateTurn([...history, {speaker: 'User', text: userReply}], context);
    return res.reply;
};

// ... (Rest of existing functions: generatePreTest, etc. remain unchanged) ...
// --- PRE/POST TESTS ---

export const generatePreTest = async (topic: string, mode: TestMode): Promise<PrePostTestData> => {
    try {
        let mcqCount = 10;
        let instruction = "Generate a Pre-Test.";
        
        if (mode === 'EXTENDED') {
            mcqCount = 20;
            instruction = "Generate a COMPREHENSIVE Pre-Test (20 Questions).";
        } else if (mode === 'DETAILED') {
            mcqCount = 10;
            instruction = "Generate a DETAILED Pre-Test (13 Questions Total: 10 MCQ + 1 Isian Singkat + 1 Uraian Singkat + 1 Esai Singkat + 1 Opini Singkat).";
        }

        const prompt = `${instruction} Topic: "${topic}". Mode: ${mode}.
        
        REQUIREMENTS:
        1. LANGUAGE: INDONESIAN (Bahasa Indonesia) ONLY.
        2. Generate EXACTLY ${mcqCount} MCQ questions.
        3. EACH MCQ question MUST have EXACTLY 5 options (labeled A, B, C, D, E) in the 'options' array.
        
        4. IF mode is DETAILED, the JSON MUST include a 'writing' object with:
           - 'short': Array containing exactly 1 "Isian Singkat" question.
           - 'desc': Object for 1 "Uraian Singkat" question.
           - 'essay': Object for 1 "Esai Singkat" question.
           - 'opinion': Object for 1 "Opini Singkat" question.

        JSON Structure:
        {
            mode: "${mode}",
            mcq: { id: number, question: string, options: string[], correctAnswerIndex: number (0-4), explanation: string }[],
            writing: {
                short: {id:number, question:string, type:'SHORT'}[],
                desc: {id:number, question:string, type:'DESC'},
                essay: {id:number, question:string, type:'ESSAY'},
                opinion: {id:number, question:string, type:'OPINION'}
            } (include 'writing' object ONLY if mode is DETAILED)
        }`;

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed to generate pre-test"); }
};

export const generateAdditionalPostTestQuestions = async (content: string, mode: TestMode, existingQuestions: string[]): Promise<PrePostTestData> => {
    try {
        let mcqCount = 10;
        let instruction = "Generate Post-Test.";

        if (mode === 'EXTENDED') {
            mcqCount = 20;
            instruction = "Generate COMPREHENSIVE Post-Test (20 MCQ).";
        }
        else if (mode === 'DETAILED') { 
            mcqCount = 10; 
            instruction = "Generate DETAILED Post-Test (10 MCQ + 4 Writing Questions).";
        }

        const prompt = `${instruction} Content Context: ${content.substring(0, 10000)}. Mode: ${mode}.
        
        REQUIREMENTS:
        1. LANGUAGE: INDONESIAN (Bahasa Indonesia) ONLY.
        2. Generate EXACTLY ${mcqCount} MCQ questions.
        3. EACH MCQ question MUST have EXACTLY 5 options (A, B, C, D, E).
        4. DO NOT duplicate these existing questions: ${JSON.stringify(existingQuestions.slice(0, 5))}.
        5. IF mode is DETAILED, generate 'writing' object with:
           - 'short': Array with 1 "Isian Singkat" question.
           - 'desc': 1 "Uraian Singkat" question.
           - 'essay': 1 "Esai Singkat" question.
           - 'opinion': 1 "Opini Singkat" question.
        
        JSON Structure same as Pre-Test.`;

        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed to generate post-test"); }
};

export const gradePrePostWriting = async (context: string, questions: any, answers: any): Promise<any> => {
    try {
        const prompt = `Grade these answers based on the topic. Language: INDONESIAN.
        Questions: ${JSON.stringify(questions)}
        Answers: ${JSON.stringify(answers)}
        Output JSON: {
            shortDetails: {question:string, userAnswer:string, score:number (0-100), feedback:string}[],
            descDetail: {question:string, userAnswer:string, score:number, feedback:string},
            essayDetail: {question:string, userAnswer:string, score:number, feedback:string},
            opinionDetail: {question:string, userAnswer:string, score:number, feedback:string}
        }`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { shortDetails: [], descDetail: {score:0}, essayDetail: {score:0}, opinionDetail: {score:0} }; }
};

// --- EXAMS ---

export const generateMcqExam = async (content: string): Promise<McqExamData> => {
    try {
        const prompt = `Generate 10 MCQ questions based on the content in INDONESIAN.
        IMPORTANT: Each question MUST have EXACTLY 5 options (A, B, C, D, E).
        
        JSON: { questions: { id:number, question:string, options:string[], correctAnswerIndex:number (0-4), explanation:string }[] }. 
        Content: ${content.substring(0, 10000)}`;
        
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed MCQ"); }
};

export const generateTfExam = async (content: string): Promise<TfExamData> => {
    try {
        const prompt = `Generate 20 True/False questions in INDONESIAN. JSON: { questions: { id:number, statement:string, isTrue:boolean, explanation:string }[] }. Content: ${content.substring(0, 10000)}`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed TF"); }
};

export const generateWrittenExam = async (content: string): Promise<WrittenExamData> => {
    try {
        const prompt = `Generate Written Exam in INDONESIAN. JSON: { 
            shortAnswers: {id:number, type:'SHORT', question:string, maxLengthsHint:string}[], 
            description: {id:number, type:'DESCRIPTION', question:string, maxLengthsHint:string}, 
            essay: {id:number, type:'ESSAY', question:string, maxLengthsHint:string}, 
            opinion: {id:number, type:'OPINION', question:string, maxLengthsHint:string} 
        }. Content: ${content.substring(0, 10000)}`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed Written"); }
};

export const gradeWrittenExam = async (content: string, qaPairs: any[]): Promise<WrittenGradingResult> => {
    try {
        const prompt = `Grade these written answers in INDONESIAN.
        Pairs: ${JSON.stringify(qaPairs)}
        Context: ${content.substring(0, 5000)}
        Output JSON: { score: number (0-100 total), feedbackGeneral: string, details: { id:number, question:string, userAnswer:string, score:number, feedback:string }[] }`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { score: 0, feedbackGeneral: "Error", details: [] }; }
};

export const generateStructuredAssessment = async (content: string): Promise<StructuredAssessmentData> => {
    try {
        const prompt = `Generate Structured Assessment (7 Phases) in INDONESIAN.
        JSON Structure:
        {
          phase1: { words: {id:string, text:string, isValid:boolean}[] },
          phase2: { categories: {id:string, name:string}[], items: {id:string, text:string, correctCategoryId:string}[] },
          phase3: { fragments: {id:string, text:string, correctOrder:number}[] },
          phase4: { processName: string, nodes: {id:string, text:string, isMissing:boolean, correctOptionId:string}[], options: {id:string, text:string}[] },
          phase5: { segments: {id:string, text:string, isError:boolean, correction:string}[] },
          phase6: { principles: {id:string, text:string}[], scenarios: {id:string, text:string, matchingPrincipleId:string}[] },
          phase7: { statement: string, evidences: {id:string, text:string, bias:'SUPPORT'|'OPPOSE'}[] }
        }
        Content: ${content.substring(0, 10000)}`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { throw new Error("Failed Structured"); }
};

export const evaluatePhase7 = async (statement: string, sliderVal: number, evidences: string[], userText: string): Promise<{score: number, feedback: string}> => {
    try {
        const prompt = `Evaluate Phase 7 Synthesis (INDONESIAN).
        Statement: ${statement}
        User Slider: ${sliderVal}%
        Selected Evidence: ${JSON.stringify(evidences)}
        User Argument: ${userText}
        Output JSON: { score: number (0-100), feedback: string }`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { score: 0, feedback: "Error evaluating" }; }
};

export const generateFlashcards = async (content: string): Promise<Flashcard[]> => {
    try {
        const prompt = `Generate 15 Flashcards in INDONESIAN. JSON Array: { front: string, back: string }[]. Content: ${content.substring(0, 10000)}`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "[]");
    } catch { return []; }
};

export const gradeStandardAssessment = async (content: string, essayPrompt: string, essayAnswer: string, shortAnswers: any[]): Promise<any> => {
    try {
        const prompt = `Grade Standard Assessment in INDONESIAN.
        Essay Prompt: ${essayPrompt}
        Essay Answer: ${essayAnswer}
        Short Answers: ${JSON.stringify(shortAnswers)}
        Context: ${content.substring(0, 5000)}
        Output JSON: { essayScore: number, essayFeedback: string, shortAnswerResults: {id:number, question:string, userAnswer:string, isCorrect:boolean, feedback:string}[] }`;
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        }));
        return JSON.parse(response.text || "{}");
    } catch { return { essayScore: 0, essayFeedback: "Error", shortAnswerResults: [] }; }
};
