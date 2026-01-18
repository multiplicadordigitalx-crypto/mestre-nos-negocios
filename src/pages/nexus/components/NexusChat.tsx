
import React, { useState, useEffect, useRef } from 'react';
import { Cpu, RefreshCw, Settings, Paperclip, Send, LockClosed, Terminal, BarChart3 } from '../../../components/Icons';

const NexusChat: React.FC = () => {
    const [messages, setMessages] = useState<{role: 'nexus' | 'admin', text: string, type?: 'text' | 'report' | 'code'}[]>([
        { role: 'nexus', text: 'Olá Paulo e Thales. Sistemas operantes. Monitorando 100% da plataforma. Em que posso ajudar hoje?', type: 'text' }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'admin', text: userMsg }]);
        setInput('');
        setIsThinking(true);

        // Simulate AI Logic
        setTimeout(() => {
            let reply = '';
            let type: 'text' | 'report' | 'code' = 'text';

            if (userMsg.toLowerCase().includes('financeiro') || userMsg.toLowerCase().includes('vendas')) {
                reply = "Analisando fluxo de caixa em tempo real...\n\nReceita Hoje: R$ 12.450,00 (+15%)\nLTV Médio: R$ 297,00\nCusto Operacional: R$ 420,00\n\nAlerta: Detectei uma oportunidade de escala no produto 'Mestre 15X'. O CPA caiu 20% nas últimas 4 horas.";
                type = 'report';
            } else if (userMsg.toLowerCase().includes('bug') || userMsg.toLowerCase().includes('erro')) {
                reply = "Varredura de logs iniciada...\n\nNenhuma anomalia crítica detectada no Core.\nEntretanto, o Webhook da Hotmart apresentou 2 falhas de timeout às 03:00 AM. Já apliquei o protocolo de retry automático. Sistema estável.";
                type = 'code';
            } else {
                reply = "Entendido. Estou processando essa solicitação com base nos dados do ecossistema. Um momento...";
            }

            setMessages(prev => [...prev, { role: 'nexus', text: reply, type }]);
            setIsThinking(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[600px] bg-black/40 border border-gray-700 rounded-2xl overflow-hidden relative">
            <div className="bg-gray-900/90 p-4 border-b border-gray-700 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center border border-brand-primary/50 relative">
                        <Cpu className="w-6 h-6 text-brand-primary" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Nexus AI Core</h3>
                        <p className="text-xs text-brand-primary font-mono">ONLINE • v5.2.0 • ACESSO TOTAL</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Limpar Contexto"><RefreshCw className="w-4 h-4"/></button>
                    <button className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Configurações"><Settings className="w-4 h-4"/></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'admin' 
                                ? 'bg-brand-primary text-black font-medium rounded-tr-none' 
                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                        }`}>
                            {msg.type === 'code' && <Terminal className="w-4 h-4 text-brand-primary mb-2"/>}
                            {msg.type === 'report' && <BarChart3 className="w-4 h-4 text-brand-primary mb-2"/>}
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex gap-2 items-center">
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="flex gap-2 items-center bg-black/50 p-2 rounded-xl border border-gray-600 focus-within:border-brand-primary transition-colors">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Upload de Arquivo/Imagem para Análise">
                        <Paperclip className="w-5 h-5"/>
                    </button>
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                        placeholder="Comando para Nexus..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        className="p-2 bg-brand-primary hover:bg-yellow-400 text-black rounded-lg transition-colors"
                    >
                        <Send className="w-5 h-5"/>
                    </button>
                </div>
                <div className="flex justify-between mt-2 px-1">
                    <p className="text-[9px] text-gray-500 font-mono">ACESSO ADMIN: Paulo & Thales</p>
                    <p className="text-[9px] text-gray-500 font-mono flex items-center gap-1"><LockClosed className="w-3 h-3"/> CONEXÃO CRIPTOGRAFADA</p>
                </div>
            </div>
        </div>
    );
};

export default NexusChat;
