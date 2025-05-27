// fichier: constants.ts
export const PDF_PROCESSING = {
    MAX_TEXT_LENTGH: 10000, // MAX_TEXT_LENGTH (correction de la faute de frappe si voulue)
    WORKER_SRC: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs',
};

export const API = {
    GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
}

export const RATE_LIMIT = {
    REQUESTS_PER_MINUTE: 5,
    CACHE_MAX_SIZE: 1000,
    CACHE_TTL_MS: 60 * 1000,
};