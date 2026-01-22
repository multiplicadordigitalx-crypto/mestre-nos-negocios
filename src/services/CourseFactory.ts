
import { GoogleGenAI } from "@google/genai";
import { NEXUS_TOOLS, NexusToolId } from "./ToolRegistry";

// Initialize Gemini with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY || '' });

export interface CourseManifest {
    lessons: {
        id: string;
        title: string;
        duration: number; // Seconds
        script: string; // The "Teacher" conversational script
        checkpoints: {
            time: number; // Seconds into audio
            type: 'quiz' | 'tool_redirect' | 'reflection';
            data?: any;
            toolId?: NexusToolId;
            toolTaskLabel?: string;
            question?: string;
        }[];
    }[];
}

export const CourseFactory = {
    /**
     * AI Step: Converts raw content (text/pdf) into a structured Conversation Manifest.
     */
    async generateCourseManifest(rawContent: string, courseContext: string): Promise<CourseManifest> {
        // SYSTEM PROMPT FOR CURRICULUM GENERATION
        const prompt = `
            ACT AS: The "Mentor IA" of Mestre dos Negócios. Expert, engaging, practical, business-focused.
            TASK: Convert the raw content below into a series of 10-minute conversational audio lessons.
            CONTEXT: ${courseContext}
            AVAILABLE TOOLS MAP: ${JSON.stringify(Object.values(NEXUS_TOOLS).map(t => ({ id: t.id, name: t.name, activities: Object.values(t.activities).map(a => a.label) })))}

            RULES:
            1. STRUCTURE: Create 1-3 lessons based on the content length.
            2. DURATION: Each lesson must be ~600 seconds (10 minutes).
            3. TONE: Professional but conversational Brazilian Portuguese (PT-BR). Use "Você", be direct.
            4. CHECKPOINTS (CRITICAL):
               - Insert a 'quiz' checkpoint every ~180 seconds to test retention.
               - Insert a 'tool_redirect' checkpoint whenever a practical task can be done using the AVAILABLE TOOLS.
               - Example: If discussing contracts, add a checkpoint to 'mentor_juridico' with label 'Redigir Contrato'.
               - Example: If discussing ads/metrics, add a checkpoint to 'vendas_hoje' with label 'Configurar Pixel'.
               - Timestamps must be strictly increasing.

            RAW CONTENT TO PROCESS:
            "${rawContent.substring(0, 30000)}"

            OUTPUT SCHEMA (JSON ONLY):
            {
              "lessons": [
                {
                  "title": "Clear Lesson Title",
                  "script": "Full educational script to be spoken by TTS...",
                  "duration": 600,
                  "checkpoints": [
                    { "time": 180, "type": "quiz", "question": "Question text?" },
                    { "time": 400, "type": "tool_redirect", "toolId": "mentor_juridico", "toolTaskLabel": "Analisar Contrato" }
                  ]
                }
              ]
            }
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp', // Using the fast experimental model for complex JSON tasks
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.7
                }
            });

            const text = response.text || '{}';
            console.log("AI Raw Output:", text); // Debugging

            const manifest = JSON.parse(text) as CourseManifest;

            // Post-processing and Validation
            manifest.lessons.forEach((l, index) => {
                l.id = `lesson-${Date.now()}-${index}`;
                // Validate Tool IDs
                l.checkpoints = l.checkpoints.map(cp => {
                    if (cp.type === 'tool_redirect' && cp.toolId) {
                        // Fallback if AI hallucinates a tool ID
                        if (!NEXUS_TOOLS[cp.toolId]) {
                            console.warn(`AI suggested invalid tool: ${cp.toolId}. Fallback to reflection.`);
                            return { ...cp, type: 'reflection', question: `Reflexão prática: Como você aplicaria ${cp.toolTaskLabel}?` };
                        }
                    }
                    return cp;
                });
            });

            return manifest;

        } catch (error) {
            console.error("CourseFactory Error:", error);
            // Return a safe fallback manifest so the UI doesn't crash
            return {
                lessons: [
                    {
                        id: 'error-fallback',
                        title: 'Introdução ao Tema (Fallback)',
                        duration: 300,
                        script: "Não foi possível gerar o curso detalhado agora. Por favor, tente novamente com um texto mais curto ou claro.",
                        checkpoints: []
                    }
                ]
            };
        }
    }
};
