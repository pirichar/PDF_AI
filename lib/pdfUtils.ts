// fichier: lib/pdfUtils.ts

import { PDF_PROCESSING } from "./constants";
import type { TextContent } from "pdfjs-dist/types/src/display/api"; // Utilise "import type"

export const ExtractTextFromPDF = async (file: File): Promise<string> => {
    if (typeof window === 'undefined') {
        // Cette erreur ne devrait jamais se produire si appelé depuis un composant client correctement.
        console.error("ExtractTextFromPDF: Tentative d'exécution côté serveur.");
        throw new Error("L'extraction de PDF ne peut se faire que côté client.");
    }

    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Valider et configurer le workerSrc
        if (!PDF_PROCESSING.WORKER_SRC) {
            console.error("ExtractTextFromPDF: PDF_PROCESSING.WORKER_SRC n'est pas défini dans constants.ts !");
            throw new Error("Le chemin du worker PDF (WORKER_SRC) n'est pas configuré.");
        }
        // Configurer le worker source s'il n'est pas déjà défini ou s'il est différent
        if (pdfjsLib.GlobalWorkerOptions.workerSrc !== PDF_PROCESSING.WORKER_SRC) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_PROCESSING.WORKER_SRC;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useWorkerFetch: false, // Conserve tes options spécifiques
            isEvalSupported: false,
            useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        
        if (pdf.numPages === 0) {
            // Optionnel: logguer un avertissement si un PDF sans pages est soumis
            // console.warn("ExtractTextFromPDF: Le PDF soumis ne contient aucune page.");
            return "Le document PDF ne contient aucune page."; // Ou une chaîne vide, selon la gestion souhaitée
        }

        let allText = "";
        const pagePromises = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const pagePromise = pdf.getPage(i).then(async (page) => {
                const textContent = await page.getTextContent() as TextContent;
                return textContent.items.map(item => ('str' in item ? (item as any).str : '')).join(" ");
            }).catch(pageError => {
                // Log l'erreur spécifique à la page, mais continue le traitement des autres pages
                console.error(`ExtractTextFromPDF: Erreur lors du traitement de la page ${i}:`, pageError);
                return `[Erreur lors de l'extraction de la page ${i}]`; // Texte d'erreur pour cette page
            });
            pagePromises.push(pagePromise);
        }

        const pageTexts = await Promise.all(pagePromises);
        allText = pageTexts.join("\n");
        
        return allText.trim();

    } catch (error) {
        // Capture les erreurs majeures (import, getDocument, configuration worker critique)
        console.error('ExtractTextFromPDF: Erreur majeure lors de l\'extraction du PDF:', error);
        let errorMessage = 'Échec de l\'extraction du texte du PDF';
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
            // Ajoute des détails si l'erreur semble liée au worker
            if (PDF_PROCESSING.WORKER_SRC && (error.message.toLowerCase().includes("worker") || error.message.toLowerCase().includes("fetch"))) {
                errorMessage += `. Vérifiez la configuration de PDF_PROCESSING.WORKER_SRC ('${PDF_PROCESSING.WORKER_SRC}') et l'accessibilité du fichier.`;
            }
        }
        // Propage l'erreur pour qu'elle soit gérée par le composant appelant
        throw new Error(errorMessage);
    }
};