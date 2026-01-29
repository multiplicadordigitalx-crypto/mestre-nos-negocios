import { AiProxyService } from "./aiProxyService";
import { GeminiMessage } from "../types";

const model = 'gemini-flash-latest';
const systemInstruction = `Você é o "Coach IA 15X", um mentor de negócios de classe mundial. Sua missão é fornecer conselhos práticos, estratégicos e inspiradores para ajudar empreendedores a escalar seus negócios em 15 vezes. Use uma linguagem clara, direta e motivadora. Seja conciso mas poderoso.`;

export async function* getBusinessAdviceStream(
  prompt: string,
  history: GeminiMessage[] = []
): AsyncGenerator<string> {

  if (!prompt || prompt.trim().length === 0) {
    yield "Por favor, digite uma pergunta válida para o Coach.";
    return;
  }

  try {
    // Convert history format if needed
    const messages = history.map(h => ({
      role: h.role,
      content: h.parts.map((p: any) => p.text).join(' ')
    }));

    // Add current prompt
    messages.push({ role: 'user', content: prompt });

    // Add system instruction effectively as a pre-prompt since some models/proxies handle it differently
    // Or assume the persona is enough context.
    const fullMessages = [
      { role: 'user', content: `[SYSTEM INSTRUCTION: ${systemInstruction}]` },
      ...messages
    ];

    // Call Proxy (Non-streaming for now, simulate stream)
    const text = await AiProxyService.generateContent(fullMessages, {
      model: model,
      toolId: 'coach_15x'
    });

    if (text) {
      // Simulate streaming for UI compatibility
      const chunks = text.match(/.{1,20}/g) || [text];
      for (const chunk of chunks) {
        yield chunk;
        await new Promise(r => setTimeout(r, 30)); // Typwriter effect
      }
    }

  } catch (error: any) {
    console.error("Gemini API Proxy Error:", error);

    if (error.message?.includes('Saldo insuficiente')) {
      yield "⚠️ Seu saldo de créditos acabou. Por favor, recarregue para continuar.";
    } else {
      yield "Desculpe, a conexão com o Coach IA falhou temporariamente. Tente novamente.";
    }
  }
}
