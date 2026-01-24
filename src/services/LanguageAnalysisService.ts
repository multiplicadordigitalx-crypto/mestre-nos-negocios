import { GoogleGenAI } from "@google/genai";
import { GeminiMessage } from "../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let ai: any = null;
if (API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI", e);
    }
}

export interface LanguageAssessment {
    fluencyScore: number;
    accuracyScore: number;
    grammarFeedback: string;
    vocabularyFeedback: string;
    completionAnalysis: string;
    suggestedResponse: string;
}

export const LanguageAnalysisService = {
    async analyzeSpeech(
        transcript: string,
        context: { mission: string; region: string; difficulty: string; role: string }
    ): Promise<string> {
        if (!ai) {
            return "Erro: IA não configurada. Verifique as chaves de API.";
        }

        const systemPrompt = `Você é um Instrutor de Inglês Executivo e Mentor de Negócios.
        O aluno está em uma missão de simulação em ${context.region} com o objetivo: "${context.mission}".
        Nível de Dificuldade: ${context.difficulty}.
        Seu papel no roleplay: ${context.role}.

        Analise o texto dito pelo aluno: "${transcript}".
        
        Sua resposta deve seguir esta estrutura:
        1. [Roleplay]: Responda como o personagem do conselho, de forma curta e direta em inglês (máximo 2 sentenças).
        2. [Feedback]: Forneça um feedback amigável em PORTUGUÊS sobre o inglês dele:
           - Gramática e Vocabulário.
           - Se ele atingiu o objetivo da missão.
           - Uma sugestão de como ele poderia ter dito melhor (em inglês).

        Mantenha um tom profissional e encorajador.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: [{ text: systemPrompt + "\n\nTRANSCRIPT: " + transcript }]
            });
            return response.text || "Sem resposta da IA.";
        } catch (error) {
            console.error("Language Analysis Error:", error);
            return "Desculpe, tive um problema ao analisar seu áudio. Pode repetir?";
        }
    }
};
