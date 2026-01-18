
import { GoogleGenAI } from "@google/genai";
import { GeminiMessage } from "../types";

const API_KEY = process.env.API_KEY;

// Inicialização segura
let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

const model = 'gemini-3-flash-preview';
const systemInstruction = `Você é o "Coach IA 15X", um mentor de negócios de classe mundial. Sua missão é fornecer conselhos práticos, estratégicos e inspiradores para ajudar empreendedores a escalar seus negócios em 15 vezes. Use uma linguagem clara, direta e motivadora. Seja conciso mas poderoso.`;

export async function* getBusinessAdviceStream(
  prompt: string,
  history: GeminiMessage[] = []
): AsyncGenerator<string> {
  // Validação Defensiva 1: Verificar inicialização
  if (!ai) {
    yield "Erro de Configuração: Chave de API não encontrada. Verifique as variáveis de ambiente.";
    return;
  }

  // Validação Defensiva 2: Evitar prompt vazio (causa comum de 'Internal Error')
  if (!prompt || prompt.trim().length === 0) {
    yield "Por favor, digite uma pergunta válida para o Coach.";
    return;
  }
  
  try {
      const chat = ai.chats.create({
        model: model,
        config: { 
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
        },
        history,
      });

      const result = await chat.sendMessageStream({ message: prompt });
      
      for await (const chunk of result) {
        // Validação Defensiva 3: Verificar integridade do chunk
        if (chunk && chunk.text) {
            yield chunk.text;
        }
      }
  } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      
      // Tratamento de erros específicos para feedback amigável
      if (error.status === 429) {
          yield "⚠️ Limite de requisições atingido. Por favor, aguarde alguns segundos.";
      } else if (error.message?.includes('SAFETY')) {
          yield "⚠️ O conteúdo solicitado foi bloqueado pelos filtros de segurança da IA.";
      } else {
          yield "Desculpe, ocorreu um erro na comunicação com a inteligência artificial. Tente reformular sua pergunta.";
      }
  }
}
