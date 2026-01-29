import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Image as ImageIcon, X, Bot, User, Zap, Sparkles } from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import { useCreditGuard } from '@/hooks/useCreditGuard';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import toast from 'react-hot-toast';
import { callMestreIA } from '@/services/mestreIaService';



interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type: 'text' | 'audio' | 'image';
    timestamp: Date;
}


export interface GrokChatHandle {
    sendMessage: (text: string) => void;
}

interface GrokChatProps {
    currentTheme?: { primary: string; secondary: string };
    hideHeader?: boolean;
    externalIsListening?: boolean;
    onExternalMicClick?: () => void;
    onAction?: (action: string, payload?: any) => void;
    onBeforeSendMessage?: () => Promise<boolean | { proceed: boolean, skipWallet: boolean }>;
    onAudioGenerated?: (audioUrl: string) => void; // New prop for voice
    dailyLimit?: number;
    contextId?: string;
    isLightMode?: boolean;
}

import { ElevenLabsService } from '@/services/ElevenLabsService'; // Import Service

export const GrokChatInterface = React.forwardRef<GrokChatHandle, GrokChatProps>((props, ref) => {
    const { user } = useAuth();
    const { checkAndConsume } = useCreditGuard();
    const { currentTheme, hideHeader, externalIsListening, onExternalMicClick, onAction, onAudioGenerated, isLightMode = false } = props;

    // Dynamic Theme Variables
    const themeBg = isLightMode ? 'bg-[#fcfcfc]' : 'bg-[#0c0d12]';
    const themeText = isLightMode ? 'text-gray-900' : 'text-white';
    const themeBorder = isLightMode ? 'border-gray-200' : 'border-gray-800';
    const msgUserBg = isLightMode ? 'bg-gray-200 text-gray-900' : 'bg-gray-800 text-white';
    const msgAiBg = isLightMode ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-gradient-to-br from-gray-900 to-black border-gray-800 text-gray-200';

    // Default to brand-primary (yellow-400) if no theme provided
    const themeColor = currentTheme?.primary || '#FACC15';

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Olá! Sou seu Mentor IA. Como posso te ajudar a aplicar essa aula no seu negócio hoje?', type: 'text', timestamp: new Date() }
    ]);
    const [attachments, setAttachments] = useState<{ id: string, type: 'image' | 'file', url: string, file: File }[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Only use internal hook if external control is NOT provided
    const shouldUseInternalHook = externalIsListening === undefined;

    const { isListening: internalIsListening, startListening, stopListening, isSupported: isSpeechSupported } = useSpeechRecognition((text) => {
        if (shouldUseInternalHook) {
            setInput(prev => {
                const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                return prev + separator + text;
            });
        }
    });

    // Resolve which state to use
    const isListening = externalIsListening !== undefined ? externalIsListening : internalIsListening;

    const handleMicToggle = () => {
        if (onExternalMicClick) {
            onExternalMicClick();
        } else {
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        }
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setAttachments(prev => [...prev, { id: Date.now().toString(), type, url, file }]);
        }
    };

    const removeAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };

    // Helper to process AI Text
    const processAIResponse = (text: string) => {
        const actionRegex = /\[ACTION:([A-Z_]+)(?::([^\]]+))?\]/g;
        let cleanText = text;
        let match;

        // Execute all actions found
        while ((match = actionRegex.exec(text)) !== null) {
            const actionType = match[1];
            const payload = match[2];
            console.log(`[MentorIA] Action Triggered: ${actionType}`, payload);
            if (onAction) onAction(actionType, payload);

            // Remove the tag from the text
            cleanText = cleanText.replace(match[0], '');
        }

        return cleanText.trim();
    };

    const sendMessageInternal = async (text: string) => {
        if (!text.trim() && attachments.length === 0) return;

        // 1. Check Pre-Conditions (External Blockers like Daily Limits)
        let skipWallet = false;
        if (props.onBeforeSendMessage) {
            const result = await props.onBeforeSendMessage();
            if (typeof result === 'object') {
                if (!result.proceed) return;
                skipWallet = result.skipWallet;
            } else {
                if (!result) return;
            }
        }

        // 2. Check Credits (Wallet Consumption with Daily Limit fallback)
        // If onBeforeSendMessage is not used (or returned generic), we use the internal prop
        if (!skipWallet) {
            const proceed = await checkAndConsume('student_ai_chat', 'Chat Mentor IA', 1);
            if (!proceed) return;
        }

        // Process attachments to base64
        const processedAttachments = await Promise.all(attachments.map(async (att) => {
            return new Promise<{ base64: string, mimeType: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(att.file);
                reader.onload = () => resolve({
                    base64: reader.result as string,
                    mimeType: att.file.type
                });
                reader.onerror = reject;
            });
        }));

        // 2. Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            type: attachments.length > 0 ? 'image' : 'text', // Simple type check for now
            timestamp: new Date()
        };

        // Optimistically show attachments in user message
        if (attachments.length > 0) {
            userMsg.content = `${text}\n${attachments.map(a => `[Anexo: ${a.file.name}]`).join('\n')}`;
        }

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachments([]);
        setIsTyping(true);


        try {
            // 3. Call AI
            const response = await callMestreIA('mestre_dos_negocios', {
                pergunta: text || "Analise este anexo.",
                contexto: 'Aluno assistindo aula sobre Negócios'
            }, processedAttachments);

            // 4. Process Actions & Add AI Response
            const finalContent = processAIResponse(response.output || "Entendi.");

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: finalContent,
                type: 'text',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

            // 5. Generate Audio (Voice)
            if (onAudioGenerated) {
                // Use 'Rachel' (Warm) for Wellness/Marketing, 'Antoni' (Authoritative) for Business?
                // For now, default to Rachel as per plan
                ElevenLabsService.generateAudio(finalContent, '21m00Tcm4TlvDq8ikWAM')
                    .then(url => {
                        if (url) onAudioGenerated(url);
                    });
            }

        } catch (error) {
            toast.error("Erro ao falar com o Mentor.");
        } finally {
            setIsTyping(false);
        }
    };

    React.useImperativeHandle(ref, () => ({
        sendMessage: (text: string) => {
            sendMessageInternal(text);
        }
    }));

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        sendMessageInternal(input);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-full ${themeBg} border-l ${themeBorder}`}>
            {/* Hidden Inputs */}
            <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')}
            />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
                onChange={(e) => handleFileSelect(e, 'file')}
            />

            {/* Header */}
            {!hideHeader && (
                <div className={`p-2 md:p-3 border-b ${themeBorder} flex justify-between items-center bg-gray-900/50 backdrop-blur`}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${themeColor}20` }}>
                            <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-black ${themeText} text-xs uppercase tracking-wide`}>Mentor IA</h3>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] text-gray-500 font-bold uppercase">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-gray-500 uppercase font-bold">Saldo</span>
                        <span className="text-xs font-black flex items-center gap-1" style={{ color: themeColor }}>
                            <Zap className="w-3 h-3" /> {(user as any)?.creditBalance || 0}
                        </span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 md:space-y-6 custom-scrollbar">
                {messages.map((msg, index) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : ''}`}
                            style={msg.role === 'assistant' ? { backgroundColor: `${themeColor}20` } : {}}
                        >
                            {msg.role === 'user' ? <User className="w-5 h-5 text-gray-300" /> : <Sparkles className="w-5 h-5" style={{ color: themeColor }} />}
                        </div>
                        <div className={`flex flex-col max-w-[88%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed ${msg.role === 'user'
                                ? `${msgUserBg} rounded-tr-none`
                                : `${msgAiBg} border rounded-tl-none shadow-lg`
                                }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>

                                {msg.role === 'assistant' && index === messages.length - 1 && (
                                    <div className="mt-2 text-[10px] text-gray-500 italic border-t border-white/5 pt-2">
                                        💡 Dica: Toque no player abaixo para retomar a aula.
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-600 mt-1.5 uppercase font-bold tracking-wider">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColor}20` }}>
                            <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
                className="p-2 md:p-5 border-t transition-colors duration-300"
                style={{
                    borderTopColor: isLightMode ? `${currentTheme?.primary}40` : `${themeColor}20`,
                    background: isLightMode ? `linear-gradient(to top, ${currentTheme?.primary}05, transparent)` : `linear-gradient(to top, ${themeColor}10, transparent)`
                }}
            >
                {/* PREVIEW AREA */}
                {attachments.length > 0 && (
                    <div className="flex gap-2 mb-2 overflow-x-auto px-1 py-1">
                        {attachments.map(att => (
                            <div key={att.id} className="relative group shrink-0">
                                {att.type === 'image' ? (
                                    <img src={att.url} alt="anexo" className="h-20 w-20 object-cover rounded-xl border border-gray-700" />
                                ) : (
                                    <div className="h-20 w-20 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 text-xs text-gray-400">
                                        <Paperclip className="w-8 h-8" />
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(att.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    className={`relative border rounded-3xl p-3 transition-colors shadow-lg ${isLightMode ? 'bg-white border-gray-200' : 'bg-[#0c0d12] border-gray-700'}`}
                    style={{ borderColor: input.trim() ? themeColor : undefined }} // Optional: Dynamic focus border
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Pergunte sobre a aula..."
                        className={`w-full bg-transparent ${themeText} text-base resize-none outline-none max-h-40 px-3 py-2 placeholder-gray-500 scrollbar-hide font-medium leading-relaxed`}
                        rows={1}
                        style={{ minHeight: '56px' }}
                    />

                    <div className="flex justify-between items-center mt-2 px-1">
                        <div className="flex gap-1 md:gap-2 text-gray-500">
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className="p-2 md:p-3 hover:bg-gray-800 rounded-xl transition-colors tooltip"
                                style={{ '--hover-color': themeColor } as any}
                                title="Adicionar Imagem"
                            >
                                <ImageIcon className="w-5 h-5 md:w-6 md:h-6 hover:text-[var(--hover-color)]" />
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 md:p-3 hover:bg-gray-800 rounded-xl transition-colors tooltip"
                                style={{ '--hover-color': themeColor } as any}
                                title="Anexar Arquivo"
                            >
                                <Paperclip className="w-5 h-5 md:w-6 md:h-6 hover:text-[var(--hover-color)]" />
                            </button>
                            <button
                                type="button"
                                onClick={handleMicToggle}
                                onTouchStart={(e) => { e.preventDefault(); handleMicToggle(); }}
                                className={`p-2 md:p-3 rounded-xl transition-colors tooltip relative z-50 ${isListening ? 'bg-red-500/20 text-red-500' : 'hover:bg-gray-800'}`}
                                style={{ '--hover-color': isListening ? '#EF4444' : themeColor } as any}
                                title={isListening ? "Parar Gravacão" : "Modo Voz"}
                            >
                                <Mic className={`w-5 h-5 md:w-6 md:h-6 ${isListening ? 'animate-pulse' : 'hover:text-[var(--hover-color)]'}`} />
                            </button>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && attachments.length === 0) || isTyping}
                            className={`p-2.5 md:p-3.5 rounded-2xl transition-all ${input.trim() || attachments.length > 0
                                ? 'text-black hover:scale-105'
                                : 'bg-gray-800 text-gray-500'
                                }`}
                            style={input.trim() || attachments.length > 0 ? { backgroundColor: themeColor, boxShadow: `0 0 20px ${themeColor}50` } : {}}
                        >
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest">Mentor IA pode cometer erros. Verifique informações importantes.</p>
                </div>
            </div>
        </div>
    );
});

GrokChatInterface.displayName = 'GrokChatInterface';
