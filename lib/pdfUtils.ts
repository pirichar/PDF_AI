// fichier: lib/pdfUtils.ts

import { PDF_PROCESSING } from "./constants";
// Importe TextItem en plus de TextContent pour un typage plus précis
import type { TextContent} from "pdfjs-dist/types/src/display/api"; 

export const ExtractTextFromPDF = async (file: File): Promise<string> => {
    if (typeof window === 'undefined') {
        console.error("ExtractTextFromPDF: Tentative d'exécution côté serveur.");
        throw new Error("L'extraction de PDF ne peut se faire que côté client.");
    }

    try {
        const pdfjsLib = await import('pdfjs-dist');

        if (!PDF_PROCESSING.WORKER_SRC) {
            console.error("ExtractTextFromPDF: PDF_PROCESSING.WORKER_SRC n'est pas défini dans constants.ts !");
            throw new Error("Le chemin du worker PDF (WORKER_SRC) n'est pas configuré.");
        }
        if (pdfjsLib.GlobalWorkerOptions.workerSrc !== PDF_PROCESSING.WORKER_SRC) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_PROCESSING.WORKER_SRC;
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useWorkerFetch: false, 
            isEvalSupported: false,
            useSystemFonts: true
        });

        const pdf = await loadingTask.promise;
        
        if (pdf.numPages === 0) {
            return "Le document PDF ne contient aucune page.";
        }

        let allText = "";
        const pagePromises = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const pagePromise = pdf.getPage(i).then(async (page) => {
                const textContent = await page.getTextContent() as TextContent;
                // Modifié ici : Utilise une fonction de garde de type pour s'assurer que c'est un TextItem
                return textContent.items.map(item => {
                    // Vérifie si l'élément a la propriété 'str' et est un TextItem
                    if ('str' in item && typeof item.str === 'string') {
                        return item.str;
                    }
                    return ''; // Retourne une chaîne vide si ce n'est pas un TextItem ou si 'str' n'est pas une chaîne
                }).join(" ");
            }).catch(pageError => {
                console.error(`ExtractTextFromPDF: Erreur lors du traitement de la page ${i}:`, pageError);
                return `[Erreur lors de l'extraction de la page ${i}]`;
            });
            pagePromises.push(pagePromise);
        }

        const pageTexts = await Promise.all(pagePromises);
        allText = pageTexts.join("\n");
        
        return allText.trim();

    } catch (error) {
        console.error('ExtractTextFromPDF: Erreur majeure lors de l\'extraction du PDF:', error);
        let errorMessage = 'Échec de l\'extraction du texte du PDF';
        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
            if (PDF_PROCESSING.WORKER_SRC && (error.message.toLowerCase().includes("worker") || error.message.toLowerCase().includes("fetch"))) {
                errorMessage += `. Vérifiez la configuration de PDF_PROCESSING.WORKER_SRC ('${PDF_PROCESSING.WORKER_SRC}') et l'accessibilité du fichier.`;
            }
        }
        throw new Error(errorMessage);
    }
};