
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsService } from "./ElevenLabsService";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_KEY || '' });

export class StudioService {
    // BASE ACTORS LIBRARY (Simulator)
    // In production, these would be IDs referring to High-Res Video Assets stored in CDN/S3.
    private static BASE_ACTORS: any[] = [
        { id: 'actor_lucas_tech', name: 'Lucas (Tech)', style: 'Casual, energetic', gender: 'male', image: 'https://randomuser.me/api/portraits/men/32.jpg', format: '9:16' },
        { id: 'actor_julia_marketing', name: 'Julia (Marketing)', style: 'Professional, warm', gender: 'female', image: 'https://randomuser.me/api/portraits/women/44.jpg', format: '9:16' },
        { id: 'actor_roberto_finance', name: 'Roberto (Finance)', style: 'Senior, trustworthy', gender: 'male', image: 'https://randomuser.me/api/portraits/men/85.jpg', format: '9:16' },
        { id: 'actor_sofia_lifestyle', name: 'Sofia (Lifestyle)', style: 'Vlog style, selfie', gender: 'female', image: 'https://randomuser.me/api/portraits/women/65.jpg', format: '9:16' },
        { id: 'actor_marcos_news', name: 'Marcos (News)', style: 'Anchorman, serious', gender: 'male', image: 'https://randomuser.me/api/portraits/men/11.jpg', format: '16:9' },
        { id: 'actor_elena_teacher', name: 'Elena (Teacher)', style: 'Educational, white background', gender: 'female', image: 'https://randomuser.me/api/portraits/women/33.jpg', format: '16:9' }
    ];

    public static addCustomActor(actor: any) {
        StudioService.BASE_ACTORS.unshift(actor);
    }

    public static removeCustomActor(actorId: string) {
        StudioService.BASE_ACTORS = StudioService.BASE_ACTORS.filter(a => a.id !== actorId);
    }

    /**
     * SIMULATED RADAR: Finds viral videos in a niche to "Clone/Remix".
     */
    static async findViralTrends(niche: string) {
        // Mocking a scraping service returning trending videos
        await new Promise(r => setTimeout(r, 1500));
        return [
            { id: 't1', title: 'Como ganhei R$5k em casa', views: '2.4M', channel: '@empreendedor.digital', script_mood: 'Urgent, Excited', original_url: '#' },
            { id: 't2', title: 'Pare de perder dinheiro', views: '1.1M', channel: '@financas.rapidas', script_mood: 'Warning, Serious', original_url: '#' },
            { id: 't3', title: 'Segredo dos Milionários', views: '890k', channel: '@mentoria.vip', script_mood: 'Educational, Calm', original_url: '#' },
        ];
    }

    /**
     * MAIN PIPELINE: Orchestrates the creation of a realistic UGC video.
     * Steps: Script -> Voice -> LipSync (Simulated) -> Final Video
     */
    static async generateUGCVideo(request: VideoRequest): Promise<VideoResult> {
        console.log("🎬 StudioService: Starting UGC Pipeline for", request.productName);

        // 1. SELECT ACTOR
        const actors = StudioService.BASE_ACTORS;
        const actor = actors.find(a => request.actorType === 'any' || a.gender === request.actorType) || actors[1];
        console.log(`👤 Actor Selected: ${actor.name}`);

        // 2. GENERATE SCRIPT (Gemini)
        // We instruct the AI to write a script that fits the base actor's style and the duration.
        const scriptPrompt = `
            ACT AS: A viral TikTok/Reels Scriptwriter.
            TASK: Write a natural, persuasive testimonial script for a product.
            PRODUCT: ${request.productName}
            AUDIENCE: ${request.targetAudience}
            ACTOR PERSONA: ${actor.name} (${actor.style})
            FORMAT: ${request.durationContext === 'short_reel' ? '15 seconds max' : '45-60 seconds storytelling'}
            LANGUAGE: Brazilian Portuguese (Natural, use slang if fit).
            
            OUTPUT: Just the spoken text. No scene directions.
        `;

        let scriptText = "";
        try {
            const scriptRes = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: scriptPrompt
            });
            scriptText = scriptRes.text || "Produto incrível, mudou minha vida!";
            console.log("📝 Script Generated:", scriptText.substring(0, 50) + "...");
        } catch (e) {
            console.error("Script Gen Failed", e);
            scriptText = `Gente, vocês precisam conhecer o ${request.productName}. É surreal!`;
        }

        // 3. GENERATE AUDIO (ElevenLabs)
        // In real implementation, we'd use the stored voiceId for the specific actor.
        console.log("🔊 Generating Audio via ElevenLabs...");
        // Mocking a scraping service returning trending videos
        // const audioUrl = await ElevenLabsService.generate(scriptText, actor.voiceId);
        const mockAudioDuration = request.durationContext === 'short_reel' ? 15 : 45;

        // 4. LIP SYNC & RENDERING (The "Magic" Step)
        // This is where we would call an API like SyncLabs or HeyGen.
        // We send: { video_url: actor.baseVideoUrl, audio_url: audioUrl }
        // The API returns a new video where the lips move perfectly.

        console.log("🔄 Sending to LipSync Engine (Simulation)...");
        await new Promise(r => setTimeout(r, 2000)); // Simulate processing time

        // 5. MOCK RESULT
        // Returning a placeholder that represents the "Processed" video.
        return {
            id: `vid_${Date.now()}`,
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder
            thumbnail: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop", // Actor face
            script: scriptText,
            duration: mockAudioDuration,
            status: 'completed'
        };
    }

    static getAvailableActors() {
        return StudioService.BASE_ACTORS;
    }
}
