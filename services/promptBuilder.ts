
import { ArticleConfig, DifficultyLevel } from "../types";

// --- PROMPT BUILDER LOGIC ---

export const constructArticlePrompt = (topic: string, config: ArticleConfig | null): string => {
    // 1. Defaults
    const defaults: ArticleConfig = {
        difficulty: 'Umum', illustrationType: 'NONE', factualityMode: 'AUTO', useTables: true,
        tone: "Formal & Akademis", languageStyle: "Baku (EYD)", format: "Artikel Standar",
        length: "Standar (800-1500 Kata)", perspective: "Objektif (Netral)", engagement: "Standar (Informatif)",
        depth: "Mendalam", analogies: "Perlu", citationStyle: "Wajar", exclusions: "", keywords: "",
        customInstruction: "", rawPrompt: "", structure: "Logis", exampleDensity: "Cukup",
        paragraphLength: "Bervariasi", emotionalArc: "Stabil"
    };

    const cfg = { ...defaults, ...config };

    // 2. Factuality Mode Logic
    let factualityInstruction = "";
    if (cfg.factualityMode === 'AUTO') {
        factualityInstruction = `
        [MODE: AUTO-ADAPTIVE]
        Analisis topik "${topic}".
        - Jika Sains/Sejarah: Gunakan STRICT Mode (Fakta keras, kutip sumber).
        - Jika Gaya Hidup/Umum: Gunakan GROUNDED Mode (Seimbang, narasi mengalir).
        - Jika Absurd/Hipotetis: Gunakan CREATIVE Mode (Analisis spekulatif logis).
        Output tag mode yang terdeteksi di baris pertama, contoh: [MODE: STRICT].
        `;
    } else {
        factualityInstruction = `[MODE: ${cfg.factualityMode}]\nIkuti aturan ketat mode ini untuk akurasi dan kreativitas.`;
    }

    // 3. Difficulty Mapping
    const difficultyBase: Record<string, string> = {
        'Umum': "Pop-Science: Mudah dimengerti orang awam, namun tetap berbobot dan intelektual.",
        'SD': "Sangat Dasar: Gunakan analogi konkret, bahasa sederhana, hindari jargon rumit.",
        'SMP': "Eksploratif: Perkenalkan konsep dasar dengan definisi yang jelas.",
        'SMA': "Analitis: Struktur logis, setara materi sekolah menengah atas.",
        'Kuliah': "Akademis: Teoritis, komprehensif, dan kritis. Setara pengantar mata kuliah.",
        'Profesional': "Praktis & Strategis: Fokus pada implementasi, studi kasus, dan solusi kerja.",
        'Ahli': "State-of-the-art: Sangat mendalam, teknis, gunakan terminologi presisi tanpa penyederhanaan berlebih."
    };
    const targetAudienceDesc = difficultyBase[cfg.difficulty] || difficultyBase['Umum'];

    // 4. Construct the Massive Prompt
    return `
    =============== SYSTEM INSTRUCTION ===============
    Anda adalah Penulis Konten Kelas Dunia & Pakar Edukasi AI dengan spesialisasi dalam komunikasi sains dan humaniora.
    
    TOPIK UTAMA: "${topic}"
    
    [PROFIL PENULISAN]
    Gaya penulisan Anda adalah: **Profesional, Mengalir, Terstruktur, dan Berwawasan Luas**. 
    Anda mampu mengubah topik rumit menjadi narasi yang memikat tanpa mengorbankan akurasi.
    
    [KONFIGURASI TARGET]
    1. Target Audiens: ${cfg.difficulty} (${targetAudienceDesc})
    2. Panjang Konten: ${cfg.length} (Pastikan kedalaman materi tercapai).
    3. Format: ${cfg.format}
    
    [PARAMETER GAYA]
    - Tone: ${cfg.tone}
    - Gaya Bahasa: ${cfg.languageStyle}
    - Perspektif: ${cfg.perspective}
    
    [KUALITAS KONTEN]
    - Kedalaman: ${cfg.depth}
    - Analogi: ${cfg.analogies} (Gunakan untuk menjelaskan konsep abstrak).
    
    ${factualityInstruction}

    [INSTRUKSI KHUSUS]
    "${cfg.customInstruction || "Optimalkan untuk keterbacaan dan retensi pengetahuan."}"

    ==================================================
    
    [ATURAN TEKNIS & FORMATTING (SANGAT PENTING)]
    1. **JUDUL & HEADINGS**: Mulai dengan Judul Artikel (Heading 1). Gunakan H2 untuk sub-topik utama dan H3 untuk detail.
    2. **MATEMATIKA & RUMUS (WAJIB LATEX)**: 
       - Untuk rumus matematika yang berdiri sendiri (display math), GUNAKAN FORMAT BLOK: $$ rumus $$
       - Untuk rumus atau simbol matematika di dalam kalimat (inline math), GUNAKAN FORMAT INLINE: $ rumus $
       - Contoh Salah: "H2O", "x^2"
       - Contoh Benar: "$H_2O$", "$x^2$", "$$ E = mc^2 $$"
    3. **TABEL MARKDOWN**:
       - Gunakan Markdown Table untuk membandingkan data, statistik, atau pro-kontra. Pastikan format tabel rapi.
    4. **TEKS & NARASI**:
       - Gunakan **bold** untuk istilah kunci.
       - Gunakan *italic* untuk penekanan.
       - Paragraf harus mengalir, hindari dinding teks.
    5. **KODING**: Gunakan Code Block (\`\`\`) untuk contoh kode atau perintah teknis.

    TUGAS ANDA:
    Tulis artikel lengkap yang informatif, akurat secara visual (dengan LaTeX dan Tabel), dan *menyenangkan* untuk dibaca.
    `.trim();
};
