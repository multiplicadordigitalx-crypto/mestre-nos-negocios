import { GoogleGenAI } from "@google/genai";
import { MESTRE_IA_PROMPTS } from "./prompts";
import { getCustomPrompts, checkAiAvailability, incrementUsageCost, getAppProducts, getSalesTeam } from "./mockFirebase";
import { ProductDNA } from "../types";

// Sempre use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FlowInput {
    [key: string]: string | number | boolean;
}

const interpolatePrompt = (prompt: string, variables: FlowInput): string => {
    return prompt.replace(/\{\{(\w+)\}\}/g, (match, key) => String(variables[key] || match));
};

/**
 * Função exclusiva para a Nexus IA auxiliar o suporte.
 * Cruza dados do ticket com performance real do aluno/parceiro.
 */
export async function getNexusSupportAdvice(context: {
    ticketContent: string,
    userData: any,
    userResults?: any,
    userRole: string
}) {
    try {
        const prompt = `
            Você é a Nexus IA operando em Modo Suporte Estratégico.
            Sua missão é ajudar o agente de suporte humano a resolver o problema de um ${context.userRole}.

            DADOS DO USUÁRIO:
            ${JSON.stringify(context.userData)}

            RESULTADOS/MÉTRICAS ATUAIS:
            ${JSON.stringify(context.userResults || 'N/A')}

            CONTEÚDO DO TICKET:
            "${context.ticketContent}"

            DIRETRIZES:
                1. Analise se o usuário está seguindo o método (veja postagens e progresso).
                2. Se for reclamação de resultados, identifique o gargalo real (ex: falta consistência).
                3. Se for pedido de reembolso, verifique se está na garantia (7 dias) e sugere uma estratégia de retenção.
                4. Forneça 3 pontos de ação claros para o agente humano falar com o usuário.
                
            Responda em Português, formato JSON:
            {"diagnosis": "resumo da situação", "advice": ["dica 1", "dica 2", "dica 3"], "isEligibleForRefund": boolean}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text || '{}');
    } catch (error) {
        console.error("Nexus Support Error:", error);
        return { diagnosis: "Erro ao conectar com Nexus IA.", advice: ["Tente diagnosticar manualmente o progresso do aluno."], isEligibleForRefund: false };
    }
}

export async function getSalesCoachTips(salesPersonName: string, performanceData: any) {
    try {
        const prompt = `
            Você é a Nexus IA, o cérebro do Mestre dos Negócios 50X.
            Analise os dados do vendedor "${salesPersonName}" e do atual Top 1 do ranking.
            DADOS: ${JSON.stringify(performanceData)}
            
            MISSÃO: Identificar o que o Top 1 está fazendo de diferente (ex: conversão mais alta, atendimento mais rápido) e entregar 3 dicas curtas e "brutais" para o vendedor replicar o comportamento de elite. 
            Fale sobre gatilhos mentais, velocidade e tom de voz.
            
            Retorne em Português, formato JSON: 
            {"tips": ["dica 1", "dica 2", "dica 3"], "top1_insight": "insight sobre o lider"}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text || '{"tips": [], "top1_insight": ""}');
    } catch (error) {
        return { tips: ["Foque no tempo de resposta.", "Use o áudio.", "Gatilho de Escassez."], top1_insight: "O líder atual responde em 45s." };
    }
}

export async function callMestreIA(flowId: string, inputs: FlowInput, attachments?: { base64: string, mimeType: string }[]) {
    await checkAiAvailability();

    let extraContext = "";

    if (inputs.category === 'therapy_master' || (inputs as any).therapyConfig) {
        const therapy = (inputs as any).therapyConfig;
        extraContext = `
        [PROTOCOLO CLÍNICO ATIVO - MESTRE DA TERAPIA]
        Base Teórica: ${therapy?.baseTeorica || 'TCC'}
        Elementos Obrigatórios: ${therapy?.elementos?.join(', ') || 'Psicoeducação'}
        Restrições Rigorosas: 
        - Linguagem neutra e científica.
        - Foco em autonomia e consciência.
        - Normalização emocional constante.
      `;
    } else if (inputs.product || inputs.productLink) {
        const prods = await getAppProducts();
        const product = prods.find(p =>
            p.name.toLowerCase().includes(String(inputs.product || "").toLowerCase()) ||
            p.landingPage.includes(String(inputs.productLink || ""))
        );

        if (product && product.dna) {
            extraContext = `
            [DNA DO PRODUTO ATIVO - ASSERTIVIDADE: ${product.dna.alignmentScore}%]
            Fundamentos OBRIGATÓRIOS:
            - Dor: ${product.dna.sevenGoldenQuestions.painEliminated}
            - Desejo: ${product.dna.sevenGoldenQuestions.statusAndEnvy}
            - Ganhos: ${product.dna.sevenGoldenQuestions.moneyGainOrSave}
            - Ganhos: ${product.dna.sevenGoldenQuestions.moneyGainOrSave}
            - Persona (${product.dna.realPersona ? 'VALIDADA PELO NEXUS' : 'TEÓRICA'}): ${product.dna.realPersona ? product.dna.realPersona.ageRange : product.dna.idealPersona.ageRange}, ${product.dna.realPersona ? product.dna.realPersona.gender : product.dna.idealPersona.gender}.
            ${product.dna.realPersona ? `[ATENÇÃO: Use a Persona VALIDADA acima. Ela foi refinada com dados reais de vendas.]` : ''}
            
            MATRIZ DE QUEBRA DE OBJEÇÕES (Use isso para contra-argumentar):
            ${product.dna.universalObjections ? Object.entries(product.dna.universalObjections).map(([key, val]) => `- ${key}: ${val}`).join('\n') : 'N/A'}
          `;
        }
    }

    const customPrompts = await getCustomPrompts();
    const promptTemplate = customPrompts[flowId] || (MESTRE_IA_PROMPTS as any)[flowId];

    if (!promptTemplate) throw new Error(`Flow ID '${flowId}' não encontrado.`);

    const finalPrompt = `${extraContext}\n\n${interpolatePrompt(promptTemplate, inputs)}`;

    try {
        const modelName = flowId === 'mestre_dos_negocios' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

        // Construct content parts
        const contents = [];
        if (attachments && attachments.length > 0) {
            // Add text prompt first
            contents.push({ text: finalPrompt });
            // Add attachments
            attachments.forEach(att => {
                // Remove data URL prefix if present (e.g., "data:image/png;base64,")
                const base64Data = att.base64.split(',')[1] || att.base64;
                contents.push({
                    inlineData: {
                        mimeType: att.mimeType,
                        data: base64Data
                    }
                });
            });
        } else {
            // Text only
            contents.push({ text: finalPrompt });
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
        });

        const text = response.text;
        if (!text) throw new Error("IA retornou resposta vazia.");

        // Higher cost for multimodal
        const cost = attachments && attachments.length > 0 ? 0.50 : 0.10;
        await incrementUsageCost(cost);

        return {
            output: text,
            previewImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
            status: "completed"
        };

    } catch (error) {
        console.error("Mestre IA Error:", error);
        throw new Error("Falha ao processar solicitação na IA. Verifique sua conexão ou cota.");
    }
}

export async function generateCourseCoverImage(inputs: { title: string, niche: string, category: string, transformation: string }) {
    await checkAiAvailability();

    const promptInputs: FlowInput = {
        title: inputs.title,
        niche: inputs.niche,
        category: inputs.category,
        transformation: inputs.transformation
    };

    const descriptionPrompt = interpolatePrompt(MESTRE_IA_PROMPTS.course_cover_designer, promptInputs);

    const descriptionRes = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: descriptionPrompt
    });

    const visualDescription = descriptionRes.text;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: visualDescription || `Capa cinematográfica para curso de ${inputs.niche}: ${inputs.title}` }],
        config: {
            imageConfig: { aspectRatio: "1:1" }
        }
    });

    let imageUrl = "";
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    if (!imageUrl) throw new Error("Falha ao processar imagem de capa.");
    await incrementUsageCost(1.50);
    return imageUrl;
}

export async function generateSchoolLogo(inputs: { title: string, description: string }) {
    await checkAiAvailability();

    const promptInputs: FlowInput = {
        title: inputs.title,
        description: inputs.description
    };

    const descriptionPrompt = interpolatePrompt(MESTRE_IA_PROMPTS.logo_designer, promptInputs);

    const descriptionRes = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: descriptionPrompt
    });

    const optimizedPrompt = descriptionRes.text;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: optimizedPrompt || `Vector logo for brand ${inputs.title}. Minimalist.` }],
        config: {
            imageConfig: { aspectRatio: "1:1" }
        }
    });

    let imageUrl = "";
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        }
    }

    if (!imageUrl) throw new Error("Falha ao gerar logo.");
    await incrementUsageCost(2.00);
    return imageUrl;
}

/**
 * Gera um Quiz estruturado a partir da transcrição da aula.
 * Usado pelo StudentPlayerView para popular o "Teste do Conhecimento".
 */
export async function generateQuizFromContent(transcript: string) {
    await checkAiAvailability();

    const prompt = `
        Aja como um Professor Especialista em Negócios.
        Analise a seguinte transcrição de aula e crie 3 perguntas de múltipla escolha para testar o entendimento do aluno.
        
        CRITÉRIOS:
        1. Perguntas desafiadoras, não óbvias.
        2. Foco em aplicação prática do conceito.
        3. Feedback educativo para a resposta certa.

        TRANSCRIÇÃO:
        "${transcript.substring(0, 5000)}" (limitado para contexto)

        RETORNE APENAS UM JSON ARRAY:
        [
            {
                "id": "1",
                "text": "Pergunta aqui?",
                "options": ["A", "B", "C", "D"],
                "correctIndex": 0, // 0-3
                "explanation": "Por que esta é a correta..."
            }
        ]
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Erro ao gerar quiz:", error);
        // Fallback Mock em caso de erro da IA
        return [
            {
                id: '99',
                text: "Qual o principal conceito abordado nesta aula (Backup)?",
                options: ["Foco no Cliente", "Vendas Complexas", "Gestão de Tempo", "Liderança"],
                correctIndex: 0,
                explanation: "Esta é uma pergunta de backup pois a IA não conseguiu processar o texto original."
            }
        ];
    }
}