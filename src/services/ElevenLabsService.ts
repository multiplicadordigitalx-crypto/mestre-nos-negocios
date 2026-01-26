import toast from 'react-hot-toast';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface VoiceOption {
    id: string;
    name: string;
    category: 'masculine' | 'feminine' | 'neutral';
    style: 'warm' | 'authoritative' | 'calm' | 'energetic';
}

export const AVAILABLE_VOICES: VoiceOption[] = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'feminine', style: 'warm' },
    { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'feminine', style: 'energetic' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'masculine', style: 'authoritative' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', category: 'masculine', style: 'calm' },
];

export const ElevenLabsService = {
    /**
     * Generates audio from text using ElevenLabs API (Via Secure Server Proxy).
     * @param text The text to speak.
     * @param voiceId The ID of the voice to use.
     * @returns Blob URL of the generated audio.
     */
    async generateAudio(text: string, voiceId: string = "21m00Tcm4TlvDq8ikWAM"): Promise<string | null> {
        try {
            const user = auth?.currentUser;
            if (!user) {
                console.error("User not authenticated for Audio Generation");
                return null;
            }

            const response = await fetch(`${API_URL}/ai/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voiceId,
                    uid: user.uid
                })
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error("Saldo insuficiente para gerar áudio.");
                throw new Error("Erro na geração de áudio");
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("ElevenLabs Error:", error);
            // toast.error("Erro ao gerar áudio do mentor."); 
            // Suppress toast loop in chat interface, let UI handle it if needed
            return null;
        }
    },

    /**
     * Preloads standard responses to cache/minimize API usage.
     */
    async preloadWelcomeMessage(_studentName: string) {
        // Implementation for pre-caching specific static phrases
    }
};
