import toast from 'react-hot-toast';

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_KEY || ''; // Ensure this env var is set
const API_URL = 'https://api.elevenlabs.io/v1';

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
     * Generates audio from text using ElevenLabs API.
     * @param text The text to speak.
     * @param voiceId The ID of the voice to use.
     * @returns Blob URL of the generated audio.
     */
    async generateAudio(text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<string | null> {
        if (!ELEVENLABS_API_KEY) {
            console.warn('ElevenLabs API Key not found. Using mock response.');
            // Return a dummy audio url or null if we want to fail gracefully in UI
            // For now, let's toast and return null so the UI doesn't break but user knows.
            // toast.error("Chave de API ElevenLabs não configurada.");
            return null; // Or return a local mock file for testing
        }

        try {
            const response = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2', // Good for Portuguese
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail?.message || 'Failed to generate audio');
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('ElevenLabs Error:', error);
            toast.error("Erro ao gerar áudio do mentor.");
            return null;
        }
    },

    /**
     * Preloads standard responses to cache/minimize API usage.
     */
    async preloadWelcomeMessage(studentName: string) {
        // Implementation for pre-caching specific static phrases
    }
};
