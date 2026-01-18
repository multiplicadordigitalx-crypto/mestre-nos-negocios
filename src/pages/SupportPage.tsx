import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/Button';
import { Send, Star, History, Calendar, X as XIcon, ArrowLeft, Paperclip, Image, File } from '../components/Icons';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage, User } from '../types';
import { listenToSupportMessages, sendSupportMessage, startNewSupportSession, rateSupportThread, getSupportHistory, getSessionMessages, confirmTicketClosure, uploadFileToStorage } from '../services/mockFirebase';
import toast from 'react-hot-toast';

interface SupportPageProps {
  userOverride?: User | null;
}

const SupportPage: React.FC<SupportPageProps> = ({ userOverride }) => {
  const { user: authUser } = useAuth();
  const user = userOverride || authUser;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'open' | 'resolved' | 'in_progress' | 'pending_closure'>('open');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousStatusRef = useRef<'open' | 'resolved' | 'in_progress' | 'pending_closure'>('open');
  
  // Rating State
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hasRated, setHasRated] = useState(false);

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<{id: string, date: number, summary: string, status: string, pendingRating?: boolean}[]>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pending Evaluation Count
  const pendingEvaluationsCount = historyItems.filter(i => i.pendingRating).length + (status === 'resolved' && !hasRated && !viewingHistoryId ? 1 : 0);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = listenToSupportMessages(user.uid, (data) => {
        // Only update live messages if we are NOT viewing history
        if (!viewingHistoryId) {
            if (data.messages.length !== messages.length || data.status !== status) {
                setMessages(data.messages);
                setStatus(data.status);
            }
            
            if (data.status === 'resolved' && data.nps) {
                setHasRated(true);
            }
            
            if (data.status === 'open') {
                setHasRated(false);
                setRating(0);
                setFeedbackComment('');
            }
        }
    });

    loadHistory();

    return () => unsubscribe();
  }, [user, viewingHistoryId]);

  useEffect(() => {
      if ((previousStatusRef.current === 'open' || previousStatusRef.current === 'in_progress' || previousStatusRef.current === 'pending_closure') && status === 'resolved') {
          if (!hasRated) {
              toast("Atendimento encerrado. Por favor, avalie nosso suporte.", { icon: '⭐', duration: 5000 });
          }
      }
      previousStatusRef.current = status;
  }, [status, hasRated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, historyMessages, viewingHistoryId]);

  const loadHistory = () => {
      if (user) {
          getSupportHistory(user.uid).then(setHistoryItems);
      }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user) return;
    
    // OPTIMISTIC UI UPDATE
    const tempMsg: ChatMessage = {
        id: 'temp-' + Date.now(),
        channelId: 'support',
        text: newMessage.trim(),
        createdAt: Date.now(),
        user: { 
            uid: user.uid, 
            name: user.displayName || 'Usuário', 
            avatar: user.photoURL || '', 
            role: user.role || 'student'
        }
    };
    setMessages(prev => [...prev, tempMsg]);

    sendSupportMessage(newMessage.trim(), user, user.role || 'student');
    setNewMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      if (file.size > 5 * 1024 * 1024) {
          toast.error("O arquivo deve ter no máximo 5MB.");
          return;
      }

      setIsUploading(true);
      const toastId = toast.loading("Enviando anexo...");

      uploadFileToStorage(file, (progress) => {
      }).then((url) => {
          const type = file.type.startsWith('image/') ? 'image' : 'file';
          const text = type === 'image' ? '📷 Imagem enviada' : `📎 Arquivo enviado: ${file.name}`;
          
          const tempMsg: ChatMessage = {
              id: 'temp-' + Date.now(),
              channelId: 'support',
              text: text,
              createdAt: Date.now(),
              user: { uid: user.uid, name: user.displayName || 'Usuário', avatar: user.photoURL || '', role: user.role || 'student' },
              attachmentUrl: url,
              messageType: type
          };
          setMessages(prev => [...prev, tempMsg]);

          sendSupportMessage(text, user, user.role || 'student', url, type);
          toast.success("Anexo enviado!", { id: toastId });
      }).catch(() => {
          toast.error("Erro ao enviar anexo.", { id: toastId });
      }).finally(() => {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      });
  };

  const handleConfirmClosure = (confirmed: boolean) => {
      if (!user) return;
      confirmTicketClosure(user.uid, confirmed);
      
      if (confirmed) {
          setStatus('resolved');
      } else {
          setStatus('open');
          toast("Atendimento mantido em aberto.", { icon: '🔓' });
      }
  }

  const handleStartNewSession = () => {
      if (!user) return;
      startNewSupportSession(user.uid);
      setViewingHistoryId(null);
      setHasRated(false);
      setRating(0);
      setFeedbackComment('');
      setMessages([]);
      setStatus('open');
      
      toast.success("Novo atendimento iniciado.");
      loadHistory();
  }

  const handleRate = () => {
      if (!user || rating === 0) return;
      if (rating <= 3 && !feedbackComment) {
          toast.error("Por favor, deixe um comentário sobre o que podemos melhorar.");
          return;
      }
      rateSupportThread(user.uid, rating, feedbackComment);
      setHasRated(true);
      toast.success("Obrigado pela avaliação!");
      loadHistory();
  }
  
  const handleHistoryItemClick = async (item: typeof historyItems[0]) => {
      if (item.id === 'active') {
          setViewingHistoryId(null);
      } else {
          const msgs = await getSessionMessages(item.id);
          setHistoryMessages(msgs);
          setViewingHistoryId(item.id);
      }
      setIsHistoryOpen(false);
  }

  const displayMessages = viewingHistoryId ? historyMessages : messages;
  const isViewingArchive = !!viewingHistoryId;

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-89px)] relative">
      
      {status === 'resolved' && !hasRated && !isViewingArchive && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500 border-b border-yellow-600 p-2 text-center text-black text-xs font-bold flex justify-center items-center shadow-lg z-10"
          >
             <Star className="w-4 h-4 mr-2 fill-current text-black" />
             ATENDIMENTO ENCERRADO! SUA AVALIAÇÃO É IMPORTANTE 👇
          </motion.div>
      )}

      {isViewingArchive && (
          <div className="bg-blue-500/20 border-b border-blue-500/30 p-2 text-center text-blue-200 text-sm font-medium flex justify-between items-center px-4">
             <span className="flex items-center"><History className="w-4 h-4 mr-2" /> Você está visualizando um atendimento antigo.</span>
             <button onClick={() => setViewingHistoryId(null)} className="text-white underline hover:text-blue-100 text-xs">Voltar ao chat atual</button>
          </div>
      )}

      <div className="flex-shrink-0 flex justify-between items-center p-4 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 rounded-t-xl">
        <div className="flex items-center gap-2">
            {isViewingArchive && (
                <button onClick={() => setViewingHistoryId(null)} className="mr-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6"/>
                </button>
            )}
            <div>
                <h1 className="text-lg md:text-xl font-bold text-white">{isViewingArchive ? 'Histórico' : 'Chat Suporte'}</h1>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${!isViewingArchive && status !== 'resolved' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    <span className="text-xs text-gray-400">
                        {!isViewingArchive && status !== 'resolved' ? (status === 'pending_closure' ? 'Aguardando Confirmação' : 'Online') : 'Encerrado'}
                    </span>
                </div>
            </div>
        </div>
        <Button variant="ghost" onClick={() => setIsHistoryOpen(true)} className="text-sm !py-2 relative">
            <History className="w-5 h-5 md:mr-2" />
            <span className="hidden md:inline">Histórico</span>
            {pendingEvaluationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-gray-800">
                    {pendingEvaluationsCount}
                </span>
            )}
        </Button>
      </div>

      <div className="flex-1 bg-gray-800/50 rounded-b-xl flex flex-col overflow-hidden relative">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <AnimatePresence>
            {displayMessages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`flex items-end gap-2 md:gap-3 my-3 ${msg.user.uid === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                {msg.user.uid !== user?.uid && (
                  <img src={msg.user.avatar} alt={msg.user.name} className="w-6 h-6 md:w-8 md:h-8 rounded-full self-start" />
                )}
                <div className={`flex flex-col max-w-[85%] md:max-w-md lg:max-w-lg ${msg.user.uid === user?.uid ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl text-sm overflow-hidden ${
                      msg.user.uid === user?.uid
                        ? 'bg-brand-primary text-gray-900 rounded-br-none'
                        : 'bg-purple-600 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="font-bold text-xs mb-1 opacity-80">{msg.user.name}</p>
                    
                    {msg.messageType === 'image' && msg.attachmentUrl ? (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                            <img src={msg.attachmentUrl} alt="Anexo" className="max-w-full h-auto object-cover" />
                        </div>
                    ) : msg.messageType === 'file' && msg.attachmentUrl ? (
                        <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg mb-2">
                            <File className="w-5 h-5"/>
                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white truncate max-w-[200px]">
                                Ver Anexo
                            </a>
                        </div>
                    ) : null}

                    {msg.text && <p className="whitespace-pre-wrap leading-snug">{msg.text}</p>}
                  </div>
                   <span className="text-[10px] text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 md:p-4 bg-gray-900/50 border-t border-gray-700">
            {isViewingArchive ? (
                 <div className="text-center">
                     <p className="text-gray-400 text-sm mb-2">Esta é uma conversa antiga.</p>
                     <Button onClick={() => setViewingHistoryId(null)} className="!py-2">Voltar para o Suporte Atual</Button>
                 </div>
            ) : (status !== 'resolved') ? (
                <div className="flex flex-col gap-3">
                    <AnimatePresence>
                        {status === 'pending_closure' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 10, height: 0 }}
                                className="bg-gray-800 border border-brand-primary/50 p-4 rounded-xl shadow-lg mb-2"
                            >
                                <p className="text-white text-sm font-bold text-center mb-3">
                                    O suporte marcou este atendimento como resolvido. Confirma o encerramento?
                                </p>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="secondary" 
                                        className="flex-1 !bg-red-900/20 text-red-200 border-red-800 hover:!bg-red-900/40 !text-xs !py-2"
                                        onClick={() => handleConfirmClosure(false)}
                                    >
                                        Não, continuar
                                    </Button>
                                    <Button 
                                        className="flex-1 !bg-green-600 hover:!bg-green-500 text-white !text-xs !py-2"
                                        onClick={() => handleConfirmClosure(true)}
                                    >
                                        Sim, foi resolvido
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage}>
                        <div className="flex items-center gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()} 
                                className={`p-3 rounded-full transition-colors ${isUploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                                disabled={isUploading}
                                title="Anexar arquivo"
                            >
                                <Paperclip className={`w-5 h-5 ${isUploading ? 'animate-pulse' : ''}`} />
                            </button>

                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className={`flex-1 bg-gray-700 border border-gray-600 rounded-full py-3 px-4 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary`}
                            />
                            <Button type="submit" className="!rounded-full !p-3">
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800 rounded-xl p-4 sm:p-6 text-center border border-brand-primary shadow-2xl shadow-brand-primary/10 relative overflow-hidden mx-auto max-w-lg"
                >
                    <div className="absolute -top-10 -right-10 w-20 h-20 bg-brand-primary/10 rounded-full blur-2xl"></div>

                    {!hasRated ? (
                        <>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Atendimento Encerrado</h3>
                            <p className="text-gray-400 text-sm mb-4 font-medium">Como você avalia o atendente?</p>
                            
                            <div className="flex flex-col gap-1.5 max-w-sm mx-auto mb-4 text-left">
                                {[5, 4, 3, 2, 1].map(score => (
                                    <label key={score} className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${rating === score ? 'bg-brand-primary/20 border-brand-primary shadow-sm scale-[1.01]' : 'bg-gray-700/30 border-transparent hover:bg-gray-700/50'}`}>
                                        <input type="radio" name="rating" value={score} onClick={() => setRating(score)} className="mr-3 text-brand-primary focus:ring-brand-primary bg-gray-600 h-4 w-4"/>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex text-yellow-400">
                                                {[...Array(score)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current"/>)}
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                {score === 5 ? 'Excelente' : score === 4 ? 'Muito Bom' : score === 3 ? 'Bom' : score === 2 ? 'Ruim' : 'Péssimo'}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="max-w-sm mx-auto mb-4">
                                <textarea 
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white text-sm placeholder-gray-400 focus:border-brand-primary outline-none resize-none"
                                    placeholder={rating > 0 && rating <= 3 ? "O que podemos melhorar? (Obrigatório)" : "Deixe um comentário (Opcional)"}
                                    value={feedbackComment}
                                    onChange={e => setFeedbackComment(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button variant="secondary" onClick={handleStartNewSession} className="flex-1 !py-2 !text-sm">Pular</Button>
                                <Button onClick={handleRate} disabled={rating === 0} className="!bg-brand-primary hover:!bg-yellow-400 text-black font-bold flex-1 !py-2 !text-sm">Enviar Avaliação</Button>
                            </div>
                        </>
                    ) : (
                        <div className="py-2">
                             <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce shadow-lg shadow-green-500/30">
                                 <Star className="w-6 h-6 text-white fill-current" />
                             </div>
                             <h3 className="text-lg font-bold text-white">Avaliação enviada!</h3>
                             <p className="text-gray-400 text-xs mt-1 mb-4">Seu feedback ajuda a melhorar nosso atendimento.</p>
                             <Button onClick={handleStartNewSession} className="!bg-brand-primary text-brand-secondary w-full sm:w-auto font-bold !py-2 text-sm">Novo atendimento</Button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>

        <AnimatePresence>
            {isHistoryOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 z-40"
                        onClick={() => setIsHistoryOpen(false)}
                    />
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 w-3/4 md:w-80 h-full bg-gray-900 border-l border-gray-700 z-50 shadow-2xl flex flex-col"
                    >
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                            <h2 className="font-bold text-white flex items-center text-sm md:text-base"><History className="w-5 h-5 mr-2 text-brand-primary"/> Histórico</h2>
                            <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2">Encerrados / Arquivados</h3>
                                {historyItems.filter(i => i.status === 'Resolvido').map(item => (
                                    <div key={item.id} onClick={() => handleHistoryItemClick(item)} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-brand-primary/50 transition-colors cursor-pointer mb-2 relative">
                                        {item.pendingRating && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs text-gray-400 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-white font-medium line-clamp-2">{item.summary || 'Sem assunto'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupportPage;