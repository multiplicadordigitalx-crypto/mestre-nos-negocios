import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface SpeechRecognitionHook {
    isListening: boolean;
    startListening: () => void;
    stopListening: () => void;
    transcript: string;
    isSupported: boolean;
}

export const useSpeechRecognition = (onResult?: (text: string) => void): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef<any>(null);
    const onResultRef = useRef(onResult);

    // Update ref when callback changes
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one sentence
            recognitionRef.current.interimResults = false; // Wait for final result
            recognitionRef.current.lang = 'pt-BR';

            recognitionRef.current.onstart = () => {
                console.log('[Speech] Started');
                setIsListening(true);
                toast.dismiss(); // Clear previous toasts
                toast("Ouvindo...", { icon: "🎙️" });
            };

            recognitionRef.current.onend = () => {
                console.log('[Speech] Ended');
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event: any) => {
                console.log('[Speech] Result Raw:', event);
                const text = event.results[0][0].transcript;
                console.log('[Speech] Transcript:', text);
                if (text) {
                    setTranscript(text);
                    if (onResultRef.current) {
                        console.log('[Speech] Calling callback with:', text);
                        onResultRef.current(text);
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('[Speech] Error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    toast.error("Permissão de microfone negada.");
                } else if (event.error === 'no-speech') {
                    // Start over silently or just stop
                    toast("Não entendi. Tente de novo.", { icon: "🤔" });
                } else {
                    toast.error("Erro no reconhecimento de voz.");
                }
            };
        }
    }, []); // Only run once on mount (stable)

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return {
        isListening,
        startListening,
        stopListening,
        transcript,
        isSupported
    };
};
