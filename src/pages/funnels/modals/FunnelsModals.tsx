
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { X as XIcon, Zap, AlertTriangle, PlayCircle, Trash, ShoppingBag, Activity, ShieldCheck } from '../../../components/Icons';
import { Funnel } from '../types';
import toast from 'react-hot-toast';

// --- MESTRE FULL ACTIVATION MODAL ---
export const MestreFullModal: React.FC<{ isOpen: boolean, onClose: () => void, onConfirm: () => void, currentBalance?: number, estimatedDailyCost?: number, activeSlots?: number, maxSlots?: number }> = ({ isOpen, onClose, onConfirm, currentBalance = 0, estimatedDailyCost = 25, activeSlots = 42, maxSlots = 50 }) => {
    if (!isOpen) return null;
    const isFull = activeSlots >= maxSlots;
    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-900 w-full max-w-md rounded-2xl border border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/50 relative group">
                        <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-50 animate-ping"></div>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide">Ativar Modo Mestre Full?</h2>
                    <p className="text-yellow-500 font-bold text-xs uppercase tracking-widest mt-2">IA controla Funil + Páginas</p>
                </div>

                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl mb-6 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Seu Saldo (Wallet)</span>
                        <span className={`text-sm font-black ${currentBalance < estimatedDailyCost ? 'text-red-500' : 'text-green-400'}`}>{currentBalance.toFixed(2)} Créditos</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs font-bold uppercase flex items-center gap-1"><Activity className="w-3 h-3" /> Consumo Estimado</span>
                        <span className="text-sm font-bold text-yellow-500">~{estimatedDailyCost} Créditos/dia</span>
                    </div>
                    {currentBalance < estimatedDailyCost && (
                        <div className="mt-3 bg-red-900/20 border border-red-500/30 p-2 rounded flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-red-300 text-[10px] font-bold">Saldo Insuficiente para operar 24h. Recarregue agora.</p>
                        </div>
                    )}
                </div>

                {/* --- RESERVA TÉCNICA ALERT --- */}
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg flex gap-3 mb-6">
                    <ShieldCheck className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                    <div>
                        <p className="text-yellow-400 font-bold text-xs uppercase mb-1">Reserva Técnica Obrigatória</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">
                            Para garantir operação autônoma por 24h, o sistema reservará <strong>{estimatedDailyCost} créditos</strong> do seu saldo.
                            Se o saldo cair abaixo disso, o Mestre Full pausa automaticamente.
                        </p>
                    </div>
                </div>


                {/* --- SLOT LIMIT ALERT --- */}
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded-lg mb-4 border border-gray-700">
                    <span className="text-xs text-gray-400 font-bold uppercase">Vagas Globais Ocupadas</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${isFull ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(activeSlots / maxSlots) * 100}%` }}></div>
                        </div>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-white'}`}>{activeSlots}/{maxSlots}</span>
                    </div>
                </div>

                {
                    isFull && (
                        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-red-400 font-bold text-xs uppercase mb-1">Vagas Esgotadas</p>
                                <p className="text-gray-300 text-[10px]">
                                    O Mestre Full atingiu o limite de {maxSlots} operações simultâneas para garantir a qualidade da IA.
                                    <br /><span className="text-white font-bold cursor-pointer underline hover:text-red-300">Entrar na Lista de Espera</span>
                                </p>
                            </div>
                        </div>
                    )
                }

                <div className="bg-gray-800/50 p-4 rounded-xl border border-yellow-500/20 mb-6 text-left max-h-60 overflow-y-auto custom-scrollbar">
                    <p className="text-gray-300 text-sm font-bold mb-2">A IA assumirá o controle total:</p>
                    <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                        <li>Ciclo Automático e Perpétuo (24h/dia).</li>
                        <li>Cria e testa novas páginas se conversão cair.</li>
                        <li><strong>Pausa imediata</strong> se Conversão &lt; 18% ou ROAS &lt; 2.0.</li>
                        <li><strong>Escala Automática</strong> (+1000%) se ROAS &gt; 5x e todos indicadores verdes por 24h.</li>
                        <li>Bloqueio de orçamento: Nunca &gt; 25% em uma única página.</li>
                        <li>Diversificação e pausa automática de criativos fatigados.</li>
                        <li>Notificação instantânea se faturamento &gt; R$ 15.000/24h.</li>
                    </ul>
                    <p className="text-yellow-500 text-xs font-bold mt-3 flex items-center gap-1 bg-yellow-500/10 p-2 rounded">
                        <AlertTriangle className="w-3 h-3" /> O sistema tomará decisões financeiras sozinho.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button
                        onClick={onConfirm}
                        disabled={currentBalance < estimatedDailyCost || isFull}
                        className={`flex-1 font-black uppercase shadow-lg ${(currentBalance < estimatedDailyCost || isFull) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : '!bg-yellow-500 hover:!bg-yellow-400 text-black shadow-yellow-900/20'}`}
                    >
                        {isFull ? 'Vagas Esgotadas' : currentBalance < estimatedDailyCost ? 'Saldo Insuficiente' : 'Reservar & Ligar'}
                    </Button>
                </div>
            </motion.div >
        </div >
    );
};

// --- LEAD MODE PREVIEW MODAL ---
export const LeadModeModal: React.FC<{ isOpen: boolean, onClose: () => void, title: string }> = ({ isOpen, onClose, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[110] p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-[375px] h-[80vh] rounded-[30px] border-8 border-gray-800 shadow-2xl relative overflow-hidden flex flex-col"
            >
                <div className="h-6 bg-black text-white text-[10px] flex justify-between items-center px-4">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-100 p-4 text-black">
                    <div className="bg-red-600 text-white p-2 text-center text-xs font-bold uppercase mb-4 rounded">
                        Oferta Exclusiva: {title}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2 leading-tight">DESCUBRA COMO MULTIPLICAR SEUS RESULTADOS</h1>
                    <div className="w-full aspect-video bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                        Esta é uma simulação de como o seu cliente verá a página. A estrutura foi otimizada para conversão mobile com base nas 7 perguntas de ouro.
                    </p>
                    <button className="w-full bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg uppercase text-sm animate-pulse">
                        QUERO ACESSAR AGORA
                    </button>

                    <div className="mt-8 border-t pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                            <div>
                                <p className="text-xs font-bold">Maria Silva</p>
                                <p className="text-xs text-gray-500">Comprou há 5 minutos</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 italic">"Mudou minha vida completamente!"</p>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-gray-900"
                >
                    FECHAR MODO LEAD
                </button>
            </motion.div>
        </div>
    );
};

// --- FUNNEL EDITOR MODAL ---
export const FunnelEditorModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (funnel: Funnel) => void, initialData?: Funnel | null }> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState(initialData?.type || 'Perpétuo');
    const [steps, setSteps] = useState<string[]>(initialData?.steps || ['Ads', 'Página Vendas', 'Checkout']);
    const [newStep, setNewStep] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setSteps(initialData.steps);
        } else {
            setName('');
            setType('Perpétuo');
            setSteps(['Ads', 'Página Vendas', 'Checkout']);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddStep = () => {
        if (newStep.trim()) {
            setSteps([...steps, newStep]);
            setNewStep('');
        }
    };

    const removeStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const handleSave = () => {
        if (!name.trim()) return toast.error("Nome do funil é obrigatório");
        onSave({
            id: initialData?.id || Date.now().toString(),
            name,
            type,
            steps,
            status: initialData?.status || 'active'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[120] p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-800 w-full max-w-lg rounded-xl border border-gray-700 p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{initialData ? 'Editar Funil' : 'Montar Novo Funil'}</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>
                <div className="space-y-4">
                    <Input label="Nome do Funil" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Funil High Ticket" />
                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Tipo</label>
                        <select className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white" value={type} onChange={e => setType(e.target.value)}>
                            <option>Perpétuo</option>
                            <option>Lançamento</option>
                            <option>VSL</option>
                            <option>Webinar</option>
                            <option>High Ticket</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-gray-400 font-bold uppercase mb-2 block">Etapas do Funil</label>
                        <div className="flex gap-2 mb-2">
                            <input className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm" placeholder="Nova etapa (Ex: Upsell)" value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddStep()} />
                            <Button onClick={handleAddStep} className="!py-1">+ Add</Button>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg min-h-[100px] border border-gray-700 space-y-2">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-gray-800 p-2 rounded border border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px] text-white font-mono">{idx + 1}</span>
                                        <span className="text-white text-sm">{step}</span>
                                    </div>
                                    <button onClick={() => removeStep(idx)} className="text-red-400 hover:text-white"><Trash className="w-4 h-4" /></button>
                                </div>
                            ))}
                            {steps.length === 0 && <p className="text-center text-gray-500 text-xs">Nenhuma etapa definida.</p>}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button onClick={handleSave} className="flex-1 !bg-blue-600 hover:!bg-blue-500">Salvar Funil</Button>
                </div>
            </motion.div>
        </div>
    );
};
