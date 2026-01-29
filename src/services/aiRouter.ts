// src/services/aiRouter.ts
import { AiProxyService } from "./aiProxyService";

export interface InputMestre {
  objective: string;
  platform: string;
  contentType: string;
  product: string;
  audience: string;
  tone: string;
  history?: string;
}

export async function gerarConteudoCompleto(input: InputMestre) {
  const prompt = `
Você é o Mestre IA mais inteligente do Brasil em marketing digital.
Histórico do aluno: ${input.history || 'primeira vez usando'}
Objetivo de hoje: ${input.objective}
Plataforma: ${input.platform}
Tipo de conteúdo: ${input.contentType}
Produto: ${input.product}
Público: ${input.audience}
Tom de voz: ${input.tone}

REGRAS RÍGIDAS:
- Nunca faça calendário de 30/90 dias
- Só entregue o conteúdo de HOJE
- Fale como irmão mais velho que já faturou 8 dígitos
- 100% dentro das regras atuais da plataforma

Retorne exatamente neste formato JSON:
{
  "copy": "texto completo para postar",
  "roteiro": "roteiro do vídeo passo a passo",
  "hashtags": "5-10 hashtags estratégicas",
  "horario": "horário ideal para postar"
}
`;

  try {
    const text = await AiProxyService.generateContent([{ role: 'user', content: prompt }], {
      model: 'gemini-flash-latest',
      toolId: 'mestre_ia_router'
    });

    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Sanitize JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const texto = JSON.parse(cleanText);

    // Simulation of image/video generation delay (Mocking Flux/Veo for now)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const img = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop";
    const vid = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

    return { texto, imagem: img, video: vid };

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Falha ao gerar conteúdo. Tente novamente.");
  }
}
