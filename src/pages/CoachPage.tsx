
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Send, Sparkles, Rocket, Bot } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { getBusinessAdviceStream } from '../services/geminiService';
import { GeminiMessage } from '../types';

const CoachPage: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação Defensiva: Impede envio de string vazia ou apenas espaços
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isLoading) return;

    const userMessage: GeminiMessage = { role: 'user', parts: [{ text: cleanPrompt }] };
    setConversation(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    const modelMessage: GeminiMessage = { role: 'model', parts: [{ text: '' }] };
    setConversation(prev => [...prev, modelMessage]);

    try {
      const stream = await getBusinessAdviceStream(cleanPrompt, conversation);
      
      let accumulatedText = '';
      for await (const chunk of stream) {
        accumulatedText += chunk;
        setConversation(prev => {
            const newConversation = [...prev];
            const lastMessage = newConversation[newConversation.length - 1];
            if (lastMessage.role === 'model') {
                lastMessage.parts[0].text = accumulatedText;
            }
            return newConversation;
        });
      }
    } catch (error) {
      console.error('Frontend Coach Error:', error);
      setConversation(prev => {
          const newConv = [...prev];
          const last = newConv[newConv.length - 1];
          if (last.role === 'model') {
              last.parts[0].text = 'Erro ao processar resposta. Tente novamente.';
          }
          return newConv;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">
            Seu Coach de Negócios IA
        </h1>
        <p className="text-gray-400 mb-8">Faça perguntas estratégicas para acelerar seus resultados.</p>
        
        <Card className="h-[calc(100vh-230px)] md:h-[calc(100vh-170px)] flex flex-col">
            <div className="flex items-center gap-4 p-4 border-b border-gray-700 bg-gray-900/50">
                <div className="p-2 bg-brand-primary/20 rounded-full">
                    <Bot className="w-6 h-6 text-brand-primary" />
                </div>
                <h2 className="text-xl font-bold text-white">Coach IA 15X</h2>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {conversation.length === 0 && (
                    <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                        <Rocket className="w-16 h-16 mb-4 text-gray-600 opacity-20"/>
                        <p className="text-lg font-medium">Faça sua primeira pergunta para começar.</p>
                        <p className="text-sm opacity-60">Ex: "Como posso aumentar as vendas da minha loja online?"</p>
                    </div>
                )}
                {conversation.map((msg, index) => (
                    <div key={index} className={`flex gap-4 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-2xl px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-brand-secondary rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none shadow-lg'}`}>
                           <div className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">
                               {msg.parts[0].text}
                           </div>
                       </div>
                    </div>
                ))}
                 {isLoading && conversation.length > 0 && conversation[conversation.length - 1].parts[0].text === '' && (
                  <div className="flex justify-start">
                     <div className="bg-gray-700 text-white rounded-2xl rounded-bl-none px-5 py-3">
                         <LoadingSpinner size="sm" />
                     </div>
                  </div>
                )}
                <div ref={conversationEndRef}></div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-900/50 border-t border-gray-700">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                <input
                    type="text"
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Pergunte qualquer coisa ao seu coach de IA..."
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full py-3 px-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                    disabled={isLoading}
                />
                <Button 
                    type="submit" 
                    className="!rounded-full !p-4 shadow-lg" 
                    isLoading={isLoading} 
                    disabled={!prompt.trim() || isLoading}
                >
                    <Send className="w-6 h-6" />
                </Button>
                </div>
            </form>
        </Card>
    </div>
  );
};

export default CoachPage;
