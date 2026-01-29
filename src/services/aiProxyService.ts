import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface AiProxyOptions {
    toolId?: string;
    model?: string;
    contents?: any[]; // Direct Multimodal Content
}

export const AiProxyService = {
    async generateContent(messagesOrContents: ChatMessage[] | any[], options: AiProxyOptions = {}) {
        const user = auth?.currentUser;
        if (!user) throw new Error("Usuário não autenticado");

        const toolId = options.toolId || 'mestre_ia_chat';
        const model = options.model || 'gemini-flash-latest';

        let body: any = {
            uid: user.uid,
            toolId,
            model
        };

        // Determine if passing messages or direct contents
        const isDirectContents = options.contents || (Array.isArray(messagesOrContents) && messagesOrContents.length > 0 && (messagesOrContents[0].parts));

        if (isDirectContents) {
            body.contents = options.contents || messagesOrContents;
        } else {
            body.messages = messagesOrContents;
        }

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error("Saldo insuficiente. Recarregue seus créditos.");
                const err = await response.json();
                throw new Error(err.error || "Erro na geração de IA");
            }

            const data = await response.json();
            return data.text;
        } catch (error: any) {
            console.error("AiProxy Error:", error);
            throw error;
        }
    }
};
