import { AiProxyService } from "./aiProxyService";
import { GeminiMessage } from "../types";

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
            const text = await AiProxyService.generateContent(
                [{ role: 'user', content: systemPrompt + "\n\nTRANSCRIPT: " + transcript }],
                {
                    model: 'gemini-flash-latest',
                    toolId: 'language_analysis'
                }
            );
            return text || "Sem resposta da IA.";
        } catch (error) {
            console.error("Language Analysis Error:", error);
            return "Desculpe, tive um problema ao analisar seu áudio. Pode repetir?";
        }
    }
};
