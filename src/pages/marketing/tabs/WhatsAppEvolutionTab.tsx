import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/Button';
import { Phone, Brain, CheckCircle, PlayCircle, Send, PlusCircle, Bell, Trash, Zap, EyeOff, Eye, X as XIcon, User, MessageSquare, Link as LinkIcon, ActivityIcon, Mic, Paperclip, ShoppingBag, RefreshCw, ShieldCheck, Tag, ChevronDown, ChevronRight, Box, Clock, AlertTriangle, TrendingUp, BarChart2, PieChart, DollarSign, Shield, Lock, FileText } from '../../../components/Icons';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import toast from 'react-hot-toast';
import { SalesRecoveryWidget } from '../components/SalesRecoveryWidget';
import { getAppProducts, getProducerSlots } from '../../../services/mockFirebase';
import { AppProduct, SharedAccount, InstanceSlot } from '../../../types';
import { MESTRE_IA_PROMPTS } from '../../../services/prompts';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'bot' | 'lead' | 'human';
    timestamp: number;
    type: 'text' | 'audio' | 'link';
    status?: 'sending' | 'sent' | 'read';
}

interface Conversation {
    id: string;
    name: string;
    phone: string;
    status: 'hot' | 'warm' | 'cold';
    lastMessage: string;
    messages: ChatMessage[];
    isAutonomous: boolean;
    productInterest: string; // Tag do produto de interesse
    sentimentScore: number; // -1 (angry) to 1 (happy)
}

interface SmartCheckoutLink {
    id: string;
    productId: string;
    productName: string;
    url: string;
    tag: string;
    visualTag: string;
    status: 'synced' | 'manual' | 'verifying';
    lastVerified: number;
}

interface WhatsAppEvolutionTabProps {
    accounts?: SharedAccount[];
}

const PowerSwitch: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-white/30' : 'bg-gray-600'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300 ${isActive ? 'left-4.5' : 'left-0.5'}`} style={{ left: isActive ? '18px' : '2px' }}></div>
    </div>
);

const ApiStatusBadge: React.FC<{ name: string, status: string, detail?: string, ping?: string }> = ({ name, status, detail, ping }) => (
    <div className="flex flex-col bg-gray-900 p-2.5 rounded-lg border border-gray-700 relative overflow-hidden group hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tight">{name}</span>
        </div>
        {(detail || ping) && (
            <div className="flex justify-between items-center mt-0.5">
                {detail && <span className="text-[9px] text-gray-500 font-mono truncate">{detail}</span>}
                {ping && <span className="text-[9px] text-green-600 font-mono ml-auto">{ping}</span>}
            </div>
        )}
    </div>
);

// --- HUMANIZATION COMPONENTS ---
const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1 p-2 bg-gray-800 rounded-2xl rounded-tl-none w-fit border border-gray-700">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
        <span className="text-[9px] text-gray-500 ml-1 font-bold uppercase">Alex Digitando...</span>
    </div>
);

const AudioMessage: React.FC<{ duration: string, isPlaying: boolean, onPlay: () => void }> = ({ duration, isPlaying, onPlay }) => (
    <div className="flex items-center gap-3 min-w-[200px]">
        <button onClick={onPlay} className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-400 transition-colors">
            {isPlaying ? <div className="w-3 h-3 bg-white rounded-sm" /> : <PlayCircle className="w-5 h-5" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
            <div className="h-1 bg-green-800/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isPlaying ? '100%' : '0%' }}
                    transition={{ duration: parseFloat(duration.replace('s', '')) * (isPlaying ? 1 : 0), ease: "linear" }}
                    className="h-full bg-green-400"
                />
            </div>
            <span className="text-[9px] text-green-200 font-mono text-right">{duration}</span>
        </div>
        <Mic className="w-4 h-4 text-green-300/50" />
    </div>
);

// --- METRICS DASHBOARD COMPONENTS ---
const MetricsDashboardItem: React.FC<{ label: string, value: string | number, trend?: 'up' | 'down' | 'neutral', subtext?: string, icon?: React.ReactNode, color?: string }> = ({ label, value, trend, subtext, icon, color = 'blue' }) => (
    <div className={`bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col justify-between relative overflow-hidden group hover:border-${color}-500/50 transition-all`}>
        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-400`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</p>
            <div className="flex items-end gap-2 mt-1">
                <h4 className="text-2xl font-bold text-white leading-none">{value}</h4>
                {trend && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${trend === 'up' ? 'text-green-400 bg-green-500/10' : trend === 'down' ? 'text-red-400 bg-red-500/10' : 'text-gray-400'}`}>
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '-'}
                    </span>
                )}
            </div>
        </div>
        {subtext && <p className={`text-[10px] mt-2 font-mono ${trend === 'up' ? 'text-green-500/80' : 'text-gray-500'}`}>{subtext}</p>}
    </div>
);

const ConversionBarChart: React.FC<{ data: number[] }> = ({ data }) => {
    const max = Math.max(...data);
    return (
        <div className="flex items-end justify-between h-16 gap-1 w-full mt-2">
            {data.map((value, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                    <div className="w-full bg-gray-700/50 rounded-t relative h-full flex items-end overflow-hidden group-hover:bg-gray-700/80 transition-colors">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(value / max) * 100}%` }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="w-full bg-brand-primary/80 group-hover:bg-brand-primary"
                        >
                        </motion.div>
                    </div>
                    <span className="text-[8px] text-gray-600 font-mono hidden md:block">D-{7 - i}</span>
                </div>
            ))}
        </div>
    );
};

const SlotCard: React.FC<{ slot: InstanceSlot, onConnect: (id: string) => void }> = ({ slot, onConnect }) => {
    const isConnected = slot.status === 'connected';
    return (
        <div className={`relative p-6 rounded-2xl border transition-all duration-300 ${isConnected ? 'bg-gray-800/80 border-green-500/30' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}>
            {slot.role === 'sales' && <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[9px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl border-l border-b border-green-500/30">PRINCIPAL</div>}
            {slot.role === 'backup' && <div className="absolute top-0 right-0 bg-gray-700 text-gray-400 text-[9px] font-black px-2 py-1 rounded-bl-xl rounded-tr-xl">FAILOVER</div>}

            <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg ${slot.visualColor === 'green' ? 'bg-gradient-to-br from-green-500 to-green-700' : slot.visualColor === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gray-700'}`}>
                    {slot.icon === 'Brain' && <Brain />}
                    {slot.icon === 'Shield' && <Shield />}
                    {slot.icon === 'Zap' && <Zap />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg leading-tight">{slot.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{slot.description}</p>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {slot.safetyRules.map(rule => (
                    <div key={rule} className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-900/50 p-1.5 rounded border border-gray-700/50">
                        <ShieldCheck className="w-3 h-3 text-brand-primary" />
                        <span className="uppercase font-bold tracking-wider">{rule.replace(/_/g, ' ')}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onConnect(slot.id)}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${isConnected ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}
            >
                {isConnected ? <><CheckCircle className="w-4 h-4" /> Conectado</> : <><RefreshCw className="w-4 h-4" /> Conectar</>}
            </button>
        </div>
    );
};

export const WhatsAppEvolutionTab: React.FC<WhatsAppEvolutionTabProps> = () => {
    const [isActive, setIsActive] = useState(true);
    const [isBrainOpen, setIsBrainOpen] = useState(false);

    // Expanded Metrics State
    const [metrics, setMetrics] = useState({
        leadsToday: 4892,
        botSales: 1847,
        activeLeads: 317,
        avgResponseTime: '4,8s',
        avgSaleTime: '11min 42s',
        humanSales: 892,
        roas: '41.5x',
        audiosSent: 1204,
        conversionRate: 37.8, // %
        salesHistory: [120, 145, 132, 160, 185, 210, 245], // Last 7 days
        botVsHuman: { bot: 72, human: 28 } // % share
    });

    // DNA & Rules State (Consistency with Bot Automation)
    const [activeDNA, setActiveDNA] = useState<any>(null);
    const [rules, setRules] = useState([
        { id: 1, text: 'Se lead perguntar "preço" → enviar áudio curto antes do link' },
        { id: 2, text: 'Se lead disser "vou ver com marido" → usar objeção "Decisor Externo"' }
    ]);
    const [newRuleText, setNewRuleText] = useState('');


    // --- INSTANCE SLOTS STATE (NEW) ---
    const [slots, setSlots] = useState<InstanceSlot[]>([]);
    const [viewMode, setViewMode] = useState<'slots' | 'dashboard'>('slots');
    const [connectingSlot, setConnectingSlot] = useState<string | null>(null);

    useEffect(() => {
        getProducerSlots('current-user').then(setSlots);
    }, []);

    useEffect(() => {
        // Mock loading DNA on mount
        const loadDNA = async () => {
            // Simulating loading the default product DNA
            const mockDNA = {
                product: 'Mestre do Tráfego',
                goldenQuestions: [
                    { q: 'Qual seu maior desafio hoje?', a: 'Usar para segmentar nível de consciência.' },
                    { q: 'Já investiu em tráfego antes?', a: 'Se sim -> focar em escala. Se não -> focar em facilidade.' }
                ],
                objections: [
                    { obj: 'Sem dinheiro', handler: 'Oferecer parcelamento inteligente ou boleto parcelado.' },
                    { obj: 'Sem tempo', handler: 'Enfatizar que o curso é direto ao ponto (aulas de 10min).' }
                ]
            };
            setActiveDNA(mockDNA);
        };
        loadDNA();
    }, []);

    const handleAddRule = () => {
        if (!newRuleText) return;
        setRules([...rules, { id: Date.now(), text: newRuleText }]);
        setNewRuleText('');
        toast.success("Regra adicionada à Matrix.");
    };

    const handleDeleteRule = (id: number) => {
        setRules(rules.filter(r => r.id !== id));
        toast.success("Regra removida.");
    };

    const handleConnectSlot = (slotId: string) => {
        setConnectingSlot(slotId);
        // Simulate QR Code Connection Process
        const toastId = toast.loading("Gerando QR Code de Instância Segura...");

        setTimeout(() => {
            setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'connected' } : s));
            setConnectingSlot(null);
            toast.success("Instância Conectada e Protegida!", { id: toastId });
            setViewMode('dashboard');
        }, 1500);
    };

    if (viewMode === 'slots') {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Conexão de Canais Seguros</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">Selecione um slot pré-configurado para conectar seu WhatsApp. O sistema aplicará automaticamente as regras de segurança (Anti-Ban) para cada finalidade.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {slots.map(slot => (
                        <SlotCard key={slot.id} slot={slot} onConnect={handleConnectSlot} />
                    ))}
                </div>

                {/* Back to Dashboard if at least one connected */}
                {slots.some(s => s.status === 'connected') && (
                    <div className="mt-12 flex justify-center">
                        <Button variant="secondary" onClick={() => setViewMode('dashboard')}>
                            Voltar para o Dashboard
                        </Button>
                    </div>
                )}
            </div>
        );
    }


    // Smart Checkout Links State
    const [checkoutLinks, setCheckoutLinks] = useState<SmartCheckoutLink[]>([
        { id: '1', productId: 'p1', productName: 'Mestre do Tráfego', url: 'https://pay.hotmart.com/M123X', tag: 'ADS_FB_TRAFEGO', visualTag: 'Mestre do Tráfego', status: 'synced', lastVerified: Date.now() },
        { id: '2', productId: 'p2', productName: 'Mentoria Elite 50X', url: 'https://pay.kiwify.com.br/ELITE50', tag: 'HIGH_TICKET_PRO', visualTag: 'Mentoria Elite 50X', status: 'synced', lastVerified: Date.now() }
    ]);
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [isSyncingNexus, setIsSyncingNexus] = useState(false);
    const [newLinkData, setNewLinkData] = useState({ product: '', url: '', tag: '', visualTag: '' });
    const [expandedProduct, setExpandedProduct] = useState<string | null>('Mestre do Tráfego');
    const [stockCounter, setStockCounter] = useState(3); // Scarcity Logic

    // Real-time Chat Monitor State
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 'c1', name: 'Ricardo Mendes', phone: '5511998721234', status: 'hot', lastMessage: 'Como faço pra pagar via Pix?', isAutonomous: true,
            productInterest: 'Mestre do Tráfego', sentimentScore: 0.8,
            messages: [
                { id: 'm1', text: 'Olá! Gostaria de saber mais sobre o Mestre 50X', sender: 'lead', timestamp: Date.now() - 3600000, type: 'text' },
                { id: 'm2', text: 'Com certeza, Ricardo! O Mestre 50X é focado em escala rápida. Como posso te ajudar?', sender: 'bot', timestamp: Date.now() - 3500000, type: 'text' },
                { id: 'm3', text: 'Como faço pra pagar via Pix?', sender: 'lead', timestamp: Date.now() - 60000, type: 'text' }
            ]
        },
        {
            id: 'c2', name: 'Fernanda Lima', phone: '5521988223344', status: 'warm', lastMessage: 'Vou ver com meu marido.', isAutonomous: true,
            productInterest: 'Mentoria Elite 50X', sentimentScore: 0.5,
            messages: [
                { id: 'm4', text: 'O suporte é vitalício?', sender: 'lead', timestamp: Date.now() - 7200000, type: 'text' },
                { id: 'm5', text: 'Sim, Fernanda! No plano Elite você tem acompanhamento constante.', sender: 'bot', timestamp: Date.now() - 7100000, type: 'text' },
                { id: 'm6', text: 'Vou ver com meu marido e te aviso.', sender: 'lead', timestamp: Date.now() - 300000, type: 'text' }
            ]
        },
        {
            id: 'c3', name: 'Marcos Silva', phone: '5511977665544', status: 'hot', lastMessage: 'Quero processar vcs!', isAutonomous: false, // Sentinel triggered
            productInterest: 'Mestre do Tráfego', sentimentScore: -0.9,
            messages: [
                { id: 'm7', text: 'Quero processar vcs! Onde está meu reembolso?', sender: 'lead', timestamp: Date.now() - 10000, type: 'text' }
            ]
        }
    ]);

    const [selectedId, setSelectedId] = useState<string>('c1');
    const [manualInput, setManualInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false); // Visual simulation state
    const [botActionStatus, setBotActionStatus] = useState<string>(''); // "Gravando áudio...", "Digitando..."
    const chatEndRef = useRef<HTMLDivElement>(null);

    const activeChat = conversations.find(c => c.id === selectedId) || conversations[0];

    useEffect(() => {
        if (!isActive) return;
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                leadsToday: prev.leadsToday + Math.floor(Math.random() * 2),
                botSales: prev.botSales + (Math.random() > 0.8 ? 1 : 0),
                activeLeads: Math.max(200, prev.activeLeads + Math.floor(Math.random() * 3) - 1),
                // Pseudo-random updates for charts
                conversionRate: Math.min(45, Math.max(30, prev.conversionRate + (Math.random() - 0.5))),
                salesHistory: [...prev.salesHistory.slice(1), prev.salesHistory[prev.salesHistory.length - 1] + Math.floor(Math.random() * 5)]
            }));
        }, 4000);
        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat.messages, isBotTyping]);

    // --- SENTINEL PROTOCOL LOGIC ---
    useEffect(() => {
        const checkSentinel = () => {
            if (activeChat.isAutonomous && activeChat.sentimentScore < -0.5) {
                // If bot is active but sentiment is terrible, trigger Handoff
                handleToggleAutonomous(activeChat.id); // Turn off bot
                toast((t) => (
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div>
                            <p className="font-bold text-red-500">SENTINEL TRIGGERED</p>
                            <p className="text-xs text-gray-500">Transbordo preventivo ativado para {activeChat.name}.</p>
                        </div>
                    </div>
                ), { duration: 5000 });
            }
        };
        checkSentinel();
    }, [activeChat.lastMessage]);

    const handleToggleAutonomous = (id: string) => {
        setConversations(prev => prev.map(c => {
            if (c.id === id) {
                const newState = !c.isAutonomous;
                toast(newState ? `Bot Alex reassumiu o controle de ${c.name}` : `Modo Humano ativado para ${c.name}`, {
                    icon: newState ? '🤖' : '👨‍💻'
                });
                return { ...c, isAutonomous: newState };
            }
            return c;
        }));
    };

    const handleSendMessage = async () => {
        if (!manualInput.trim()) return;

        const newMessage: ChatMessage = {
            id: `m-${Date.now()}`,
            text: manualInput,
            sender: 'human',
            timestamp: Date.now(),
            type: 'text'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return { ...c, messages: [...c.messages, newMessage], lastMessage: manualInput };
            }
            return c;
        }));

        setManualInput('');
        toast.success("Mensagem enviada via Evolution API");
    };

    // --- HUMANIZED BOT SIMULATION ---
    const simulateBotResponse = async () => {
        if (!activeChat.isAutonomous) return;

        // 1. Calculate Human Delay
        setIsBotTyping(true);
        setBotActionStatus('Digitando...');

        // Simulating thinking + typing time based on "complexity"
        await new Promise(resolve => setTimeout(resolve, 3000));

        setIsBotTyping(false);
        setBotActionStatus('');

        const botText = `Entendi, ${activeChat.name.split(' ')[0]}! Sobre o Pix, é bem simples e libera na hora.`;

        const newMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            text: botText,
            sender: 'bot',
            timestamp: Date.now(),
            type: 'text'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return { ...c, messages: [...c.messages, newMessage], lastMessage: botText };
            }
            return c;
        }));
    };

    // Only for demo: trigger sim after user msg (in real app, this is webhook driven)
    // useEffect(() => {
    //    if(activeChat.messages[activeChat.messages.length -1].sender === 'lead') simulateBotResponse();
    // }, [activeChat.messages]);

    const handleSendAudio = async () => {
        // Mock ElevenLabs Generation
        setIsBotTyping(true);
        setBotActionStatus('Gravando áudio...');
        toast("ElevenLabs: Gerando voz clonada do Alex...", { icon: '🎙️' });

        await new Promise(resolve => setTimeout(resolve, 4000)); // Time to generate

        setIsBotTyping(false);
        setBotActionStatus('');

        const newAudioMsg: ChatMessage = {
            id: `audio-${Date.now()}`,
            text: 'Audio message',
            sender: 'human', // or bot
            timestamp: Date.now(),
            type: 'audio'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) return { ...c, messages: [...c.messages, newAudioMsg], lastMessage: 'Áudio enviado' };
            return c;
        }));
    };

    const handleSendSalesLink = () => {
        if (stockCounter <= 0) {
            toast.error("Sem estoque de vagas promocionais!");
            return;
        }

        const link = "https://mestredosnegocios.com.br/checkout-especial";
        const newMessage: ChatMessage = {
            id: `m-link-${Date.now()}`,
            text: `Aqui está seu link com o bônus de 50X ativado: ${link}\n(Restam ${stockCounter} vagas)`,
            sender: 'human',
            timestamp: Date.now(),
            type: 'link'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return { ...c, messages: [...c.messages, newMessage], lastMessage: 'Link de Venda enviado.' };
            }
            return c;
        }));

        setStockCounter(prev => prev - 1);
        toast.success("Link com gatilho de escassez enviado!", { icon: '🔥' });
    };

    const handleNexusSync = async () => {
        setIsSyncingNexus(true);
        toast.loading("Nexus AI: Sincronizando e validando rotas de checkout...", { id: 'nexus-sync' });

        try {
            const products = await getAppProducts();
            await new Promise(resolve => setTimeout(resolve, 2000));

            const syncedLinks = products.map((p: AppProduct) => ({
                id: `sync-${p.id}`,
                productId: p.id,
                productName: p.name,
                url: p.baseAffiliateLink || 'Link não configurado',
                tag: p.category?.toUpperCase().replace(/\s/g, '_') || 'GERAL',
                visualTag: p.name,
                status: 'synced' as const,
                lastVerified: Date.now()
            }));

            setCheckoutLinks(prev => [...syncedLinks, ...prev.filter(l => l.status === 'manual')]);
            toast.success("Nexus AI: 100% das rotas de checkout verificadas e sincronizadas!", { id: 'nexus-sync' });
        } catch (error) {
            toast.error("Erro na sincronização Nexus.", { id: 'nexus-sync' });
        } finally {
            setIsSyncingNexus(false);
        }
    };

    const handleAddManualLink = () => {
        if (!newLinkData.product || !newLinkData.url || !newLinkData.visualTag) return toast.error("Preencha produto, URL e Tag Visual.");
        const newLink: SmartCheckoutLink = {
            id: `manual-${Date.now()}`,
            productId: 'manual',
            productName: newLinkData.product,
            url: newLinkData.url,
            tag: newLinkData.tag.toUpperCase().replace(/\s/g, '_') || 'MANUAL',
            visualTag: newLinkData.visualTag,
            status: 'manual',
            lastVerified: Date.now()
        };
        setCheckoutLinks([newLink, ...checkoutLinks]);
        setIsAddingLink(false);
        setNewLinkData({ product: '', url: '', tag: '', visualTag: '' });
        toast.success("Link adicionado e pronto para uso pelo Bot Alex.");
    };

    const uniqueProducts = Array.from(new Set(checkoutLinks.map(l => l.productName)));

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            {/* CABEÇALHO FIXO - STATUS GERAL OTIMIZADO */}
            <div className={`border-b-4 ${isActive ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'} p-4 rounded-t-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl relative overflow-hidden bg-gray-800`}>
                <div className="relative z-10 w-full md:w-auto flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">
                            BOT INTELIGENTE ALEX (PHASE 3)
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-300 items-center">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-gray-500">Mode:</span>
                            <span className="text-green-400 font-mono font-bold uppercase">Humanized Sales</span>
                        </div>
                        <div className="h-3 w-px bg-gray-700 hidden md:block"></div>
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-300 font-bold" title="Gerenciado pelo Vagas Reais">
                            <Clock className="w-3 h-3" /> VAGAS PROMO: {stockCounter}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 w-full md:w-auto justify-end">
                    <button
                        onClick={() => setIsBrainOpen(true)}
                        className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-2"
                        title="Ver Cérebro do Bot (Prompt Oficial)"
                    >
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span className="text-xs font-bold text-purple-400 uppercase hidden md:inline">Protocolo Alex v2</span>
                    </button>

                    <button
                        onClick={() => setViewMode('slots')}
                        className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors flex items-center gap-2"
                        title="Gerenciar Conexões / Slots"
                    >
                        <RefreshCw className="w-5 h-5 text-blue-500" />
                        <span className="text-xs font-bold text-blue-400 uppercase hidden md:inline">Canais</span>
                    </button>

                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`w-[240px] h-[42px] px-4 rounded-lg font-bold text-xs uppercase transition-all shadow-lg transform active:scale-95 border flex items-center justify-center gap-3 ${isActive
                            ? 'bg-green-600 border-green-400 text-white hover:bg-green-500 shadow-green-900/50'
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        <PowerSwitch isActive={isActive} />
                        <span className="tracking-wide">{isActive ? 'BOT ATIVO' : 'BOT DESLIGADO'}</span>
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            </div>

            {/* SEÇÃO 2 - METRICS DASHBOARD (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Esquerda - KPIs Principais */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-1 gap-4">
                    <MetricsDashboardItem
                        label="ROAS (Retorno em Ads)"
                        value={metrics.roas}
                        trend="up"
                        subtext="Eficiência de Campanha"
                        icon={<DollarSign className="w-10 h-10" />}
                        color="green"
                    />
                    <MetricsDashboardItem
                        label="Taxa de Conversão"
                        value={`${metrics.conversionRate.toFixed(1)}%`}
                        trend="up"
                        subtext="Leads -> Vendas"
                        icon={<TrendingUp className="w-10 h-10" />}
                        color="purple"
                    />
                </div>

                {/* Meio - Gráfico de Conversão */}
                <Card className="col-span-1 md:col-span-6 p-4 flex flex-col justify-between border-t-0 rounded-t-none md:rounded-xl md:border-t border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <ActivityIcon className="w-4 h-4 text-brand-primary" /> Tendência de Vendas (7 Dias)
                            </h3>
                            <p className="text-[10px] text-gray-500">Evolução diária de fechamentos automáticos.</p>
                        </div>
                        <span className="text-xs font-mono text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">+12% este mês</span>
                    </div>
                    <ConversionBarChart data={metrics.salesHistory} />
                </Card>

                {/* Direita - Batalha Bot vs Humano */}
                <Card className="col-span-1 md:col-span-3 p-4 flex flex-col justify-center border-t-0 rounded-t-none md:rounded-xl md:border-t border-gray-700">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" /> Performance Battle
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-green-500" /> Bot Alex</span>
                                <span className="text-white font-bold">{metrics.botVsHuman.bot}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${metrics.botVsHuman.bot}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span className="flex items-center gap-1"><User className="w-3 h-3 text-blue-500" /> Humanos</span>
                                <span className="text-white font-bold">{metrics.botVsHuman.human}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${metrics.botVsHuman.human}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-2 bg-gray-800 border border-gray-700 rounded text-[10px] text-center text-gray-400">
                        O Bot converte <strong>2.3x mais</strong> que humanos.
                    </div>
                </Card>
            </div>

            {/* SEÇÃO 3 - STATUS DAS APIS & RECOVERY */}
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
                    <ApiStatusBadge name="WhatsMeow API" status="online" ping="12ms" />
                    <ApiStatusBadge name="Nexus AI" status="online" detail={`${metrics.leadsToday} msgs`} />
                    <ApiStatusBadge name="ElevenLabs" status="online" detail={`${metrics.audiosSent} áudios`} />
                    <ApiStatusBadge name="Firebase" status="online" detail="Sync OK" />
                </div>
            </div>

            {/* SEÇÃO DNA STRATEGY BOARD (Added for Consistency) */}
            <Card className="p-0 bg-gray-800 border-gray-700 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                        <Brain className="w-4 h-4 text-brand-primary" /> Matriz Estratégica (DNA - Alex)
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1"><Lock className="w-2 h-2" /> Protocolo Blindado</span>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1"><Zap className="w-2 h-2" /> DNA Ativo</span>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* SECTION A: MANDATORY DIRECTIVES */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1">01. Diretrizes de Venda (Humanizadas)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="bg-gray-900/80 border-l-2 border-green-500 p-2 rounded-r flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ActivityIcon className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] text-gray-200 font-bold">Rapport Acelerado</span>
                                </div>
                                <span className="text-[9px] text-gray-500 italic">"Gírias leves & Emojis"</span>
                            </div>
                            <div className="bg-gray-900/80 border-l-2 border-red-500 p-2 rounded-r flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-red-500" />
                                    <span className="text-[10px] text-gray-200 font-bold">Escassez Real</span>
                                </div>
                                <span className="text-[9px] text-gray-500 italic">"Oferta expira em 3h"</span>
                            </div>
                            <div className="bg-gray-900/80 border-l-2 border-purple-500 p-2 rounded-r flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-purple-500" />
                                    <span className="text-[10px] text-gray-200 font-bold">Spin Selling</span>
                                </div>
                                <span className="text-[9px] text-gray-500 italic">"Perguntar dor antes..."</span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: PRODUCT DNA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 mt-2">02. Perguntas de Diagnóstico (DNA)</h4>
                            {!activeDNA ? (
                                <p className="text-[10px] text-gray-500 animate-pulse">Carregando DNA...</p>
                            ) : (
                                <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-2">
                                    <div className="space-y-1 pl-1">
                                        {activeDNA.goldenQuestions.map((qi: any, i: number) => (
                                            <div key={i} className="text-[9px] text-gray-400 mb-1.5 border-b border-blue-500/10 pb-1 last:border-0 last:pb-0">
                                                <span className="text-blue-300 font-bold block mb-0.5">Q: {qi.q}</span>
                                                <span className="text-gray-500 italic">"Objetivo: {qi.a}"</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 mt-2">03. Matadora de Objeções (DNA)</h4>
                            {!activeDNA ? (
                                <p className="text-[10px] text-gray-500 animate-pulse">Carregando DNA...</p>
                            ) : (
                                <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-2">
                                    <div className="space-y-1 pl-1">
                                        {activeDNA.objections.map((obj: any, i: number) => (
                                            <div key={i} className="text-[9px] text-gray-400 mb-1.5 border-b border-orange-500/10 pb-1 last:border-0 last:pb-0">
                                                <span className="text-orange-300 font-bold block mb-0.5">Se disser: "{obj.obj}"</span>
                                                <span className="text-gray-500 italic">→ {obj.handler}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION C: CUSTOM RULES */}
                    <div>
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest pl-1 mt-2">04. Ajustes Finos (Regras Locais)</h4>
                        <div className="space-y-2">
                            {rules.map((rule, idx) => (
                                <div key={rule.id} className="flex gap-2 text-[10px] text-gray-400 font-mono border border-gray-700 bg-gray-900 px-2 py-1 rounded items-center">
                                    <span className="text-yellow-600">Rule_v2_{idx + 1}:</span>
                                    <span className="truncate flex-1">{rule.text}</span>
                                    <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:text-red-400"><Trash className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input
                                className="flex-1 bg-black/50 border border-gray-700 rounded p-1.5 text-[10px] text-white focus:border-brand-primary outline-none"
                                placeholder="Nova regra de comportamento..."
                                value={newRuleText}
                                onChange={e => setNewRuleText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddRule()}
                            />
                            <button onClick={handleAddRule} className="px-3 bg-gray-700 text-white text-[10px] font-bold rounded hover:bg-gray-600 border border-gray-600">+</button>
                        </div>
                    </div>
                </div>
            </Card>

            <SalesRecoveryWidget />

            {/* PRODUCT FOLDERS CARD */}
            <Card className="p-6 bg-gray-800 border-gray-700 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-brand-primary" /> Pastas de Produto do Alex
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Organize links de checkout por produto. O Bot Alex selecionará o link correto baseado no contexto da conversa.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleNexusSync}
                            isLoading={isSyncingNexus}
                            className="!py-1.5 !px-3 !text-[10px] !bg-gray-700 hover:!bg-gray-600 border border-gray-600 text-brand-primary font-bold flex items-center gap-2"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNexus ? 'animate-spin' : ''}`} /> SINCRONIZAR NEXUS IA
                        </Button>
                        <Button
                            onClick={() => setIsAddingLink(true)}
                            className="!py-1.5 !px-3 !text-[10px] !bg-brand-primary text-black font-black uppercase flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                        >
                            <PlusCircle className="w-3.5 h-3.5" /> ADICIONAR MANUAL
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isAddingLink && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 bg-gray-900/50 p-4 rounded-xl border border-brand-primary/20 space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input label="Produto" placeholder="Ex: Mestre 15X" value={newLinkData.product} onChange={e => setNewLinkData({ ...newLinkData, product: e.target.value })} />
                                <Input label="URL de Checkout" placeholder="https://pay..." value={newLinkData.url} onChange={e => setNewLinkData({ ...newLinkData, url: e.target.value })} />
                                <Input label="Tag Visual (Ícone)" placeholder="Ex: Mestre do Tráfego" value={newLinkData.visualTag} onChange={e => setNewLinkData({ ...newLinkData, visualTag: e.target.value })} />
                                <Input label="Tag de Origem" placeholder="Ex: ADS_FB_V1" value={newLinkData.tag} onChange={e => setNewLinkData({ ...newLinkData, tag: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setIsAddingLink(false)} className="!py-1.5 !px-4 !text-xs">Cancelar</Button>
                                <Button onClick={handleAddManualLink} className="!py-1.5 !px-4 !text-xs !bg-brand-primary text-black">Salvar Link</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PRODUCT FOLDERS LIST */}
                <div className="space-y-3">
                    {uniqueProducts.map((prodName) => {
                        const prodLinks = checkoutLinks.filter(l => l.productName === prodName);
                        const isExpanded = expandedProduct === prodName;

                        return (
                            <div key={prodName} className={`bg-gray-900/50 border transition-all overflow-hidden rounded-xl ${isExpanded ? 'border-brand-primary/50 shadow-lg shadow-brand-primary/5' : 'border-gray-700 hover:border-gray-600'}`}>
                                <div
                                    onClick={() => setExpandedProduct(isExpanded ? null : prodName)}
                                    className="p-4 cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isExpanded ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                                            <Box className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${isExpanded ? 'text-white' : 'text-gray-300'}`}>{prodName}</h4>
                                            <p className="text-[10px] text-gray-500 flex items-center gap-2">
                                                <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" /> {prodLinks.length} links de checkout</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Excluir pasta "${prodName}" e seus links?`)) {
                                                    setCheckoutLinks(prev => prev.filter(l => l.productName !== prodName));
                                                    toast.success("Pasta removida.");
                                                }
                                            }}
                                            className="p-1 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-500 transition-colors"
                                        >
                                            <Trash className="w-3 h-3" />
                                        </button>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 text-brand-primary" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="border-t border-gray-700"
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-black/20 text-gray-400 uppercase font-black text-[9px] tracking-widest">
                                                        <tr>
                                                            <th className="p-3 pl-4">Tag Visual</th>
                                                            <th className="p-3">Checkout URL</th>
                                                            <th className="p-3">Atribuição</th>
                                                            <th className="p-3 text-center">Status</th>
                                                            <th className="p-3 text-right pr-4">Ação</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-800/50">
                                                        {prodLinks.map(link => (
                                                            <tr key={link.id} className="hover:bg-white/5 transition-colors group">
                                                                <td className="p-3 pl-4">
                                                                    <span className="text-[9px] text-brand-primary font-black uppercase flex items-center gap-1 bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20 w-fit">
                                                                        <ShoppingBag className="w-2.5 h-2.5" /> {link.visualTag}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 font-mono text-[10px] text-blue-400 max-w-[200px] truncate cursor-pointer hover:underline" onClick={() => { navigator.clipboard.writeText(link.url); toast.success("Copiado!"); }}>
                                                                    {link.url}
                                                                </td>
                                                                <td className="p-3">
                                                                    <span className="bg-gray-800 px-2 py-0.5 rounded border border-gray-700 text-gray-300 font-mono flex items-center gap-1 w-fit text-[9px]">
                                                                        <Tag className="w-2.5 h-2.5 text-gray-500" /> {link.tag}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={`w-2 h-2 rounded-full ${link.status === 'synced' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3 text-right pr-4">
                                                                    <button className="text-gray-600 hover:text-red-400 transition-colors" onClick={() => setCheckoutLinks(prev => prev.filter(l => l.id !== link.id))}>
                                                                        <Trash className="w-3 h-3" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* --- MONITORAMENTO E INTERVENÇÃO --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

                {/* Lista de Conversas Ativas */}
                <Card className="lg:col-span-4 p-0 overflow-hidden bg-gray-800 border-gray-700 flex flex-col h-[600px] shadow-2xl">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-brand-primary" /> Atendimentos Live
                        </h3>
                        <span className="bg-gray-800 text-gray-400 text-[10px] px-2 py-1 rounded font-bold">{conversations.length} ONLINE</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {conversations.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => setSelectedId(chat.id)}
                                className={`p-4 border-b border-gray-700 cursor-pointer transition-all hover:bg-gray-700/50 ${selectedId === chat.id ? 'bg-gray-700/80 border-l-4 border-l-brand-primary' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-white text-sm">{chat.name}</span>
                                        <span className="text-[9px] text-brand-primary font-black uppercase flex items-center gap-1 bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20 w-fit">
                                            <ShoppingBag className="w-2.5 h-2.5" /> {chat.productInterest}
                                        </span>
                                    </div>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${chat.status === 'hot' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                                        {chat.status === 'hot' ? 'Fervendo' : 'Morno'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mb-2">{chat.lastMessage}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-600 font-mono">{chat.phone}</span>
                                    {chat.sentimentScore < -0.5 && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" title="Sentimento Negativo Detectado" />}
                                    <div className="flex items-center gap-1">
                                        {chat.isAutonomous ? (
                                            <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Bot Alex
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                                                <User className="w-3 h-3" /> Humano
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Janela de Chat e Intervenção */}
                <Card className="lg:col-span-8 p-0 overflow-hidden bg-gray-900 border-gray-700 flex flex-col h-[600px] shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-800 bg-gray-800/80 flex justify-between items-center z-10 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white border border-gray-600 shadow-inner">
                                {activeChat.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{activeChat.name}</h4>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {activeChat.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-bold uppercase ${activeChat.isAutonomous ? 'text-green-400' : 'text-blue-400'}`}>
                                    {activeChat.isAutonomous ? 'Atendimento Autônomo' : 'Intervenção Humana'}
                                </span>
                                <p className="text-[9px] text-gray-500 uppercase font-bold">Modo de Operação</p>
                            </div>
                            <button
                                onClick={() => handleToggleAutonomous(activeChat.id)}
                                className={`w-14 h-8 rounded-full relative transition-all duration-300 border-2 ${activeChat.isAutonomous ? 'bg-green-600 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`}
                            >
                                <motion.div
                                    animate={{ x: activeChat.isAutonomous ? 24 : 0 }}
                                    className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                                >
                                    {activeChat.isAutonomous ? <Brain className="w-3.5 h-3.5 text-green-600" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
                                </motion.div>
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                        {activeChat.messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'lead' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg relative ${msg.sender === 'lead'
                                    ? 'bg-gray-800 text-white rounded-tl-none'
                                    : msg.sender === 'bot'
                                        ? 'bg-green-600/90 text-white rounded-tr-none border border-green-400/30'
                                        : 'bg-blue-600 text-white rounded-tr-none border border-blue-400/30'
                                    }`}>
                                    {msg.sender !== 'lead' && (
                                        <span className="absolute -top-5 right-0 text-[8px] font-bold uppercase text-gray-500">
                                            {msg.sender === 'bot' ? '🤖 Resposta Bot Alex' : '👨‍💻 Você assumiu'}
                                        </span>
                                    )}
                                    {msg.type === 'link' && <LinkIcon className="w-4 h-4 mb-2 text-yellow-300" />}

                                    {/* Content Render */}
                                    {msg.type === 'audio' ? (
                                        <AudioMessage duration="0:32" isPlaying={false} onPlay={() => { }} />
                                    ) : (
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    )}

                                    <p className="text-[9px] mt-1 text-right opacity-60 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* BOT TYPING INDICATOR */}
                        <AnimatePresence>
                            {isBotTyping && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-end">
                                    <div className="bg-green-600/50 text-white rounded-2xl rounded-tr-none p-4 flex items-center gap-3 border border-green-500/20">
                                        {botActionStatus.includes('áudio') ? (
                                            <div className="flex items-center gap-2">
                                                <Mic className="w-4 h-4 animate-pulse text-green-300" />
                                                <span className="text-xs font-mono">{botActionStatus}</span>
                                            </div>
                                        ) : (
                                            <TypingIndicator />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input / Controls */}
                    <div className="p-4 bg-gray-800 border-t border-gray-700 z-10 backdrop-blur-md">
                        {activeChat.isAutonomous ? (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 animate-fade-in">
                                <Brain className="w-8 h-8 text-green-500 animate-pulse" />
                                <div>
                                    <p className="text-green-400 font-bold text-sm">O Bot Alex está cuidando deste lead agora.</p>
                                    <p className="text-xs text-gray-400">Intervenha apenas se o lead precisar de algo ultra-específico.</p>
                                </div>
                                <Button
                                    onClick={() => handleToggleAutonomous(activeChat.id)}
                                    className="!py-2 !px-6 !text-xs !bg-gray-700 hover:!bg-gray-600 border border-gray-600"
                                >
                                    ASSUMIR ESTA CONVERSA
                                </Button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="flex gap-2 mb-2">
                                    <Button
                                        onClick={handleSendSalesLink}
                                        className="!py-1.5 !px-4 !text-[10px] !bg-brand-primary text-black font-black uppercase flex items-center gap-2 shadow-lg shadow-brand-primary/20"
                                    >
                                        <LinkIcon className="w-3.5 h-3.5" /> Enviar Checkout {activeChat.productInterest} (Restam {stockCounter})
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleSendAudio}
                                        className="!py-1.5 !px-4 !text-[10px] flex items-center gap-2"
                                    >
                                        <Mic className="w-3.5 h-3.5" /> Enviar Áudio (Gerar IA)
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <div className="flex-1 relative flex items-center bg-gray-900 rounded-xl border border-gray-600 focus-within:border-blue-500 transition-colors">
                                        <button className="p-3 text-gray-500 hover:text-white"><Paperclip className="w-5 h-5" /></button>
                                        <input
                                            className="flex-1 bg-transparent border-none outline-none p-3 text-sm text-white"
                                            placeholder="Digite sua mensagem manual..."
                                            value={manualInput}
                                            onChange={e => setManualInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!manualInput.trim()}
                                            className="p-3 text-blue-500 hover:text-blue-400 disabled:opacity-30"
                                        >
                                            <Send className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                                        <ActivityIcon className="w-3 h-3" /> Digitando como Humano
                                    </p>
                                    <button
                                        onClick={() => handleToggleAutonomous(activeChat.id)}
                                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase underline"
                                    >
                                        Devolver para o Bot Alex
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </div>

            {/* AI Brain Modal - Displaying the REAL Protocol */}
            <AnimatePresence>
                {isBrainOpen && (
                    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-purple-500" /> CÉREBRO DO BOT ALEX (LIVE)
                                </h2>
                                <button onClick={() => setIsBrainOpen(false)} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar bg-black/30">
                                <div className="bg-gray-800/50 p-4 rounded-xl border border-purple-500/20 font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {MESTRE_IA_PROMPTS.whatsapp_alex_protocol}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};