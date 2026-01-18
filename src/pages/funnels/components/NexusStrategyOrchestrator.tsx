
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import {
    Cpu, Rocket, Search, Smartphone, Layers, FileText, CheckCircle,
    MessageSquare, Mail as MailIcon, Phone, Send, Users, ShoppingBag,
    Filter, Home, Trash, Brain, X as XIcon
} from '../../../components/Icons';
import toast from 'react-hot-toast';

const NexusStrategyOrchestrator: React.FC = () => {
    const [stage, setStage] = useState<'config' | 'deploying' | 'completed'>('config');
    const [searchProduct, setSearchProduct] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [touchpoints, setTouchpoints] = useState<string[]>([]);
    const [funnelSteps, setFunnelSteps] = useState<{ id: number, name: string, nextStep: string }[]>([
        { id: 1, name: 'Anúncio', nextStep: 'Página de Vendas' },
        { id: 2, name: 'Página de Vendas', nextStep: 'Checkout' }
    ]);
    const [newStepName, setNewStepName] = useState('');
    const [hasForm, setHasForm] = useState(false);
    const [formQuestions, setFormQuestions] = useState<string[]>(['Nome', 'Email', 'WhatsApp']);
    const [newQuestion, setNewQuestion] = useState('');
    const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
    const [activeAgent, setActiveAgent] = useState('');

    // Mock Products
    const products = [
        'Mestre 15X (Elite)', 'Ebook Viral 3.0', 'Mentoria High Ticket',
        'Curso Tráfego Pago', 'Imersão Presencial', 'Consultoria 1-1',
        'Comunidade VIP', 'Box de Ferramentas', 'Pack de Artes'
    ];

    const filteredProducts = products.filter(p => p.toLowerCase().includes(searchProduct.toLowerCase()));

    // AI Form Generation
    const [formObjective, setFormObjective] = useState('');
    const [formQuestionCount, setFormQuestionCount] = useState(3);
    const [isGeneratingForm, setIsGeneratingForm] = useState(false);

    const touchpointOptions = [
        { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'email', label: 'E-mail', icon: <MailIcon className="w-4 h-4" /> },
        { id: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
        { id: 'call', label: 'Ligação', icon: <Phone className="w-4 h-4" /> },
        { id: 'direct', label: 'Direct', icon: <Send className="w-4 h-4" /> },
        { id: 'social', label: 'Redes Sociais', icon: <Users className="w-4 h-4" /> },
        { id: 'sales_page', label: 'Pág. Vendas', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'thank_you', label: 'Pág. Obrigado', icon: <CheckCircle className="w-4 h-4" /> },
        { id: 'capture_page', label: 'Pág. Captação', icon: <Filter className="w-4 h-4" /> },
        { id: 'institutional', label: 'Institucional', icon: <Home className="w-4 h-4" /> }
    ];

    const toggleTouchpoint = (id: string) => {
        setTouchpoints(prev => {
            const exists = prev.includes(id);
            if (!exists && id === 'capture_page') {
                setHasForm(true);
                toast("Modo Captação: Formulário ativado.", { icon: '🤖' });
            }
            return exists ? prev.filter(t => t !== id) : [...prev, id];
        });
    };

    const handleGenerateFormAI = () => {
        if (!formObjective) return toast.error("Descreva o objetivo do formulário.");
        setIsGeneratingForm(true);
        setTimeout(() => {
            const newQuestions = [
                "Qual seu nome completo?",
                "Qual seu melhor e-mail?",
                "WhatsApp para contato?",
                `Qual seu principal objetivo com ${formObjective}?`,
                "Qual seu nível de comprometimento (1-10)?",
                "Você já tentou resolver isso antes?"
            ];
            setFormQuestions(newQuestions.slice(0, formQuestionCount));
            setIsGeneratingForm(false);
            toast.success("Formulário gerado com IA!");
        }, 1500);
    };

    const addStep = () => {
        if (!newStepName.trim()) return;
        setFunnelSteps([...funnelSteps, {
            id: Date.now(),
            name: newStepName,
            nextStep: 'Finalizar'
        }]);
        setNewStepName('');
    };

    const removeStep = (id: number) => {
        setFunnelSteps(prev => prev.filter(s => s.id !== id));
    };

    const updateNextStep = (id: number, val: string) => {
        setFunnelSteps(prev => prev.map(s => s.id === id ? { ...s, nextStep: val } : s));
    };

    const addQuestion = () => {
        if (!newQuestion.trim()) return;
        setFormQuestions([...formQuestions, newQuestion]);
        setNewQuestion('');
    };

    const removeQuestion = (idx: number) => {
        setFormQuestions(prev => prev.filter((_, i) => i !== idx));
    };

    const startDeployment = () => {
        setStage('deploying');
        const logs = [
            { msg: 'Iniciando Nexus Autônomo...', agent: 'Nexus Core' },
            { msg: `Produto selecionado: ${selectedProduct}`, agent: 'Nexus Core' },
            { msg: `Configurando pontos de contato: ${touchpoints.join(', ')}...`, agent: 'Omnichannel Hub' },
            { msg: 'Gerando estrutura do funil personalizado...', agent: 'Funnel Builder' },
            { msg: `Validando ${funnelSteps.length} etapas lógicas...`, agent: 'Logic Validator' },
            hasForm ? { msg: `Criando formulário de qualificação com ${formQuestions.length} perguntas...`, agent: 'Form Engine' } : { msg: 'Formulário ignorado.', agent: 'Form Engine' },
            { msg: 'Otimizando rotas de conversão...', agent: 'Otimizador 24h' },
            { msg: 'Orquestração Finalizada. Sistema pronto.', agent: 'Nexus Core' },
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < logs.length) {
                setDeploymentLogs(prev => [...prev, logs[i].msg]);
                setActiveAgent(logs[i].agent);
                i++;
            } else {
                clearInterval(interval);
                setStage('completed');
                toast.success("Estratégia implantada com sucesso! O ecossistema está rodando.");
            }
        }, 1200);
    };

    return (
        <Card className="p-0 overflow-hidden border border-brand-primary/50 shadow-2xl relative bg-gray-900 mt-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-green-500 animate-pulse"></div>

            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/90 relative z-10">
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                    <Cpu className="w-8 h-8 text-brand-primary animate-pulse-slow" /> Orquestrador de Estratégia Nexus
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-3 py-1 rounded-full border border-gray-700">v5.0.0 (Custom Build)</span>
                    {stage === 'deploying' && <span className="text-xs text-green-400 font-bold animate-pulse">● EXECUTANDO</span>}
                </div>
            </div>

            <div className="p-8 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                <AnimatePresence mode="wait">
                    {stage === 'config' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Step 1: Product Selection */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-gray-600">1</span>
                                    Selecione o Produto Alvo
                                </h4>
                                <div className="mb-3 relative">
                                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                                    <input
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-brand-primary outline-none"
                                        placeholder="Buscar produto..."
                                        value={searchProduct}
                                        onChange={e => setSearchProduct(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                    {filteredProducts.map(prod => (
                                        <button
                                            key={prod}
                                            onClick={() => setSelectedProduct(prod)}
                                            className={`p-4 rounded-xl border text-left transition-all ${selectedProduct === prod ? 'bg-brand-primary/10 border-brand-primary ring-1 ring-brand-primary' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}
                                        >
                                            <p className={`font-bold text-sm ${selectedProduct === prod ? 'text-brand-primary' : 'text-white'}`}>{prod}</p>
                                        </button>
                                    ))}
                                    {filteredProducts.length === 0 && <p className="text-gray-500 text-xs text-center col-span-full py-4">Nenhum produto encontrado.</p>}
                                </div>
                            </div>

                            {/* Step 2: Advanced Structure Configuration */}
                            {selectedProduct && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-6 border-t border-gray-800">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                        <span className="bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs border border-gray-600">2</span>
                                        Defina a Estratégia Personalizada
                                    </h4>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* 2.1 Touchpoints */}
                                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                            <h5 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2"><Smartphone className="w-4 h-4 text-blue-400" /> Pontos de Contato</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {touchpointOptions.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleTouchpoint(opt.id)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${touchpoints.includes(opt.id) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'}`}
                                                    >
                                                        {opt.icon} {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2.2 Funnel Steps */}
                                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                            <h5 className="text-xs font-bold text-white uppercase mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-purple-400" /> Estrutura do Funil</h5>
                                            <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto custom-scrollbar">
                                                {funnelSteps.map((step, idx) => (
                                                    <div key={step.id} className="bg-gray-800 p-2 rounded border border-gray-600 flex flex-col gap-1 relative group">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white text-xs font-bold">{idx + 1}. {step.name}</span>
                                                            <button onClick={() => removeStep(step.id)} className="text-gray-500 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                            <span>Próx:</span>
                                                            <input
                                                                className="bg-transparent border-b border-gray-600 text-purple-300 w-full outline-none focus:border-purple-500"
                                                                value={step.nextStep}
                                                                onChange={e => updateNextStep(step.id, e.target.value)}
                                                            />
                                                        </div>
                                                        {idx < funnelSteps.length - 1 && <div className="absolute -bottom-3 left-4 w-0.5 h-3 bg-gray-600 z-0"></div>}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                                    placeholder="Nome da etapa..."
                                                    value={newStepName}
                                                    onChange={e => setNewStepName(e.target.value)}
                                                />
                                                <button onClick={addStep} className="bg-purple-600 hover:bg-purple-500 text-white rounded px-2 py-1 text-xs font-bold">+</button>
                                            </div>
                                        </div>

                                        {/* 2.3 Qualification Form */}
                                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="text-xs font-bold text-white uppercase flex items-center gap-2"><FileText className="w-4 h-4 text-yellow-400" /> Formulário de Qualificação</h5>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" checked={hasForm} onChange={e => setHasForm(e.target.checked)} />
                                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                                                </label>
                                            </div>

                                            {hasForm ? (
                                                <div className="animate-fade-in">
                                                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 mb-3">
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 flex items-center gap-1"><Brain className="w-3 h-3 text-purple-400" /> Gerar com IA</p>
                                                        <input
                                                            className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white mb-2"
                                                            placeholder="Objetivo: ex: Qualificar leads para High Ticket"
                                                            value={formObjective}
                                                            onChange={e => setFormObjective(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-16 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                                                value={formQuestionCount}
                                                                onChange={e => setFormQuestionCount(parseInt(e.target.value) || 1)}
                                                                min={1} max={10}
                                                            />
                                                            <Button
                                                                onClick={handleGenerateFormAI}
                                                                isLoading={isGeneratingForm}
                                                                className="flex-1 !py-1 !text-xs !bg-purple-600 hover:!bg-purple-500"
                                                            >
                                                                Gerar Perguntas
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <ul className="space-y-1 mb-3 max-h-[100px] overflow-y-auto custom-scrollbar">
                                                        {formQuestions.map((q, i) => (
                                                            <li key={i} className="flex justify-between items-center text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded">
                                                                {q}
                                                                <button onClick={() => removeQuestion(i)} className="text-gray-500 hover:text-red-400"><XIcon className="w-3 h-3" /></button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="flex gap-2">
                                                        <input
                                                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                                            placeholder="Nova pergunta manual..."
                                                            value={newQuestion}
                                                            onChange={e => setNewQuestion(e.target.value)}
                                                        />
                                                        <button onClick={addQuestion} className="bg-yellow-600 hover:bg-yellow-500 text-black rounded px-2 py-1 text-xs font-bold">+</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">Formulário desativado. O lead irá direto para a próxima etapa.</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex justify-end pt-6 border-t border-gray-800">
                                <Button
                                    onClick={startDeployment}
                                    className="!py-4 !px-8 text-lg font-black uppercase !bg-green-600 hover:!bg-green-500 shadow-lg shadow-green-900/20 flex items-center gap-3"
                                    disabled={!selectedProduct || touchpoints.length === 0}
                                >
                                    <Rocket className="w-6 h-6" /> Iniciar Implantação Autônoma
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 'deploying' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10"
                        >
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-brand-primary border-r-brand-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu className="w-12 h-12 text-brand-primary animate-pulse" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2">Orquestrando Ecossistema...</h3>
                            <p className="text-brand-primary font-bold uppercase text-sm mb-8 tracking-widest">Agente Ativo: {activeAgent}</p>

                            <div className="w-full max-w-2xl bg-black/50 rounded-xl border border-gray-700 p-6 font-mono text-xs h-64 overflow-hidden flex flex-col-reverse shadow-inner">
                                {deploymentLogs.map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-green-400/90 mb-1"
                                    >
                                        {'>'} {log}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {stage === 'completed' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-white mb-4">Implantação Concluída!</h3>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
                                O Nexus configurou toda a jornada personalizada. Pontos de contato ativos, funil estruturado e formulários integrados. O "Modo Mestre Full" está monitorando para iniciar a escala.
                            </p>

                            <div className="flex gap-4 justify-center">
                                <Button variant="secondary" onClick={() => setStage('config')}>Nova Estratégia</Button>
                                <Button onClick={() => setStage('config')} className="!bg-blue-600 hover:!bg-blue-500">
                                    Ver Dashboard de Performance
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};

export default NexusStrategyOrchestrator;
