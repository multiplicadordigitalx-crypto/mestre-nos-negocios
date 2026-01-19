
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { ShoppingBag, Zap, DollarSign, CheckCircle, Star, Calculator, ArrowRight, ShieldCheck, Mail, Film, Rocket, X as XIcon, CreditCard, FileText, Link as LinkIcon } from '../../../components/Icons';
import { purchaseCombo, getCreditCombos } from '../../../services/mockFirebase';
import { useAuth } from '../../../hooks/useAuth';
import { CreditCombo, PaymentMethod } from '../../../types';
import { LucPayService, LucPayGatewayProfile } from '../../../services/LucPayService';
import toast from 'react-hot-toast';

// Mock Data updated to include paymentMethods for demonstration if backend data is sparse
// Initial state empty, fetched on mount
const COMBOS_INITIAL: CreditCombo[] = [];

// --- PAYMENT SELECTION MODAL ---
const PaymentMethodModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    combo: CreditCombo;
    onSelect: (method: PaymentMethod) => void
}> = ({ isOpen, onClose, combo, onSelect }) => {
    if (!isOpen) return null;

    const methods = combo.paymentMethods?.filter(m => m.active) || [];

    const getIcon = (type: string) => {
        switch (type) {
            case 'pix': return <Zap className="w-5 h-5 text-green-400" />;
            case 'credit_card': return <CreditCard className="w-5 h-5 text-blue-400" />;
            case 'boleto': return <FileText className="w-5 h-5 text-yellow-400" />;
            default: return <LinkIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden"
            >
                <div className="p-6 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-white">Forma de Pagamento</h3>
                        <p className="text-xs text-gray-400">Escolha como deseja pagar o pacote <strong>{combo.name}</strong></p>
                    </div>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6 space-y-3">
                    {methods.length > 0 ? methods.map(method => (
                        <button
                            key={method.id}
                            onClick={() => onSelect(method)}
                            className="w-full p-4 bg-gray-900 hover:bg-gray-700 border border-gray-600 hover:border-brand-primary rounded-xl flex items-center justify-between transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-600 transition-colors">
                                    {getIcon(method.type)}
                                </div>
                                <span className="font-bold text-white text-sm">{method.label}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
                        </button>
                    )) : (
                        <p className="text-center text-gray-500 text-sm py-4">Nenhum método de pagamento disponível no momento.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export const RechargeSection: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [brlAmount, setBrlAmount] = useState<string>('');
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // State for Payment Selection
    const [selectedComboForPayment, setSelectedComboForPayment] = useState<CreditCombo | null>(null);

    const calculatedCredits = Math.floor(parseFloat(brlAmount) || 0);

    // Fetch combos from "backend" to get updated payment links if any
    const [combos, setCombos] = useState(COMBOS_INITIAL);
    const [activeGateway, setActiveGateway] = useState<LucPayGatewayProfile | null>(null);

    // Initial Load: Combos & Amount
    React.useEffect(() => {
        // Load System Combos
        getCreditCombos().then(data => {
            // Filter active combos
            setCombos(data.filter(c => c.active));
        });

        LucPayService.getConfigs().then(configs => {
            const active = configs.find(c => c.isActive && c.provider === 'stripe');
            if (active) setActiveGateway(active);
        });
    }, []);

    const handlePurchaseClick = (combo: CreditCombo) => {
        // Construct dynamic payment methods based on active gateway
        let availableMethods: PaymentMethod[] = [];

        if (activeGateway) {
            availableMethods.push({
                id: 'stripe_card',
                type: 'credit_card',
                label: `Cartão de Crédito (${activeGateway.mode === 'live' ? 'Stripe' : 'Teste'})`,
                active: true
            });
            availableMethods.push({
                id: 'stripe_pix',
                type: 'pix',
                label: 'Pix Instantâneo (Via Stripe)',
                active: true
            });
        } else {
            // Fallback to legacy simulation if no gateway
            availableMethods.push({ id: 'sim_pix', type: 'pix', label: 'Pix Simulado', active: true });
        }

        if (availableMethods.length > 1) {
            // Inject methods into the combo object just for the modal
            const comboWithMethods = { ...combo, paymentMethods: availableMethods };
            setSelectedComboForPayment(comboWithMethods);
        } else if (availableMethods.length === 1) {
            handleProcessPayment(combo, availableMethods[0]);
        }
    };

    const handleProcessPayment = async (combo: CreditCombo, method: PaymentMethod) => {
        // Close modal if open
        setSelectedComboForPayment(null);

        // LIVE STRIPE FLOW
        if (activeGateway && (method.id.startsWith('stripe'))) {
            setLoadingId(combo.id);
            try {
                const response = await LucPayService.processPayment(
                    combo.price,
                    'brl',
                    method.type,
                    activeGateway.id,
                    combo.id
                );

                if (response.success) {
                    if (response.paymentUrl) {
                        toast.success("Redirecionando para pagamento...");
                        window.open(response.paymentUrl, '_blank');
                    } else {
                        // Simulated Success (Local Test or Fallback)
                        await purchaseCombo(user?.uid || '', combo);
                        await refreshUser();
                        toast.success(`[${activeGateway.mode === 'live' ? 'PROD' : 'TEST'}] ` + response.message);
                    }
                } else {
                    toast.error(response.message);
                }
            } catch (error: any) {
                toast.error("Erro ao processar: " + error.message);
            } finally {
                setLoadingId(null);
            }
            return;
        }

        // LEGACY LINK FLOW
        if (method.url && method.url.startsWith('http')) {
            window.open(method.url, '_blank');
            toast("Redirecionando para pagamento seguro...", { icon: '🔒' });
        } else {
            // Fallback Simulation
            handleSimulatedPurchase(combo);
        }
    };

    const handleSimulatedPurchase = async (combo: CreditCombo) => {
        if (!user) return;
        setLoadingId(combo.id);
        toast.loading(`Gerando PIX para ${combo.name}...`);

        try {
            await purchaseCombo(user.uid, combo);
            await refreshUser();
            toast.dismiss();
            toast.success("Compra simulada com sucesso! Créditos adicionados ao bolso correspondente.");
        } catch (e) {
            toast.error("Erro no processamento.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleManualPurchase = async () => {
        if (!user || calculatedCredits <= 0) return;
        setLoadingId('manual');
        try {
            const manualCombo: CreditCombo = {
                id: 'manual',
                name: 'Créditos Avulsos',
                credits: calculatedCredits,
                price: parseFloat(brlAmount),
                active: true,
                salesCount: 0,
                validForTools: [] // Uso global
            };
            await purchaseCombo(user.uid, manualCombo);
            await refreshUser();
            setBrlAmount('');
            toast.success("Créditos Soberanos adicionados!");
        } catch (e) {
            toast.error("Falha na recarga.");
        } finally {
            setLoadingId(null);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <header className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                    Recarregue seu <span className="text-brand-primary">Estoque de Ativos</span>
                </h1>
                <p className="text-gray-400 mt-2">Escolha pacotes por objetivo ou invista o valor que desejar.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {combos.map(combo => (
                    <Card key={combo.id} className={`p-6 bg-gray-800 border-2 border-gray-700 relative overflow-hidden flex flex-col h-full hover:scale-[1.02] transition-all shadow-xl`}>
                        <div className="flex-1">
                            <div className="p-3 bg-gray-900 rounded-xl w-fit mb-4">
                                {combo.name.includes('Vídeo') ? <Film className="w-8 h-8 text-brand-primary" /> : <Rocket className="w-8 h-8 text-brand-primary" />}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{combo.name}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">Pacote específico para escala acelerada.</p>

                            <div className="mb-8">
                                <p className="text-4xl font-black text-white tracking-tighter">{combo.credits}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Créditos de Escala</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
                                <span className="text-gray-500 text-xs font-bold uppercase">Investimento:</span>
                                <span className="text-green-400 font-black text-xl">R$ {combo.price.toFixed(2)}</span>
                            </div>
                            <Button onClick={() => handlePurchaseClick(combo)} isLoading={loadingId === combo.id} className="w-full !py-4 font-black uppercase text-sm">
                                COMPRAR AGORA
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="p-8 bg-gray-900 border-gray-700 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase flex items-center gap-3">
                            <Calculator className="w-6 h-6 text-brand-primary" /> Calculadora Dinâmica
                        </h3>
                        <p className="text-gray-400 mt-4 leading-relaxed">
                            Quer investir um valor específico? Digite ao lado e veja quantos créditos sofredores você recebe no Bolso Global.
                        </p>
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span>Aprovação em menos de 2 minutos via Pix.</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <ShieldCheck className="w-5 h-5 text-blue-500" />
                                <span>Segurança garantida pelo Mestre Shield.</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 shadow-2xl">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Eu quero investir (R$)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl p-4 text-3xl font-black text-white focus:border-brand-primary outline-none"
                                    placeholder="0,00"
                                    value={brlAmount}
                                    onChange={e => setBrlAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-center p-4 bg-black/30 rounded-xl border border-dashed border-gray-600">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Você receberá:</p>
                                    <p className="text-4xl font-black text-brand-primary">{calculatedCredits} <span className="text-sm font-bold uppercase">Créditos</span></p>
                                </div>
                            </div>
                            <Button disabled={!brlAmount || calculatedCredits <= 0} onClick={handleManualPurchase} isLoading={loadingId === 'manual'} className="w-full !py-5 font-black text-lg">
                                GERAR PIX AGORA <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Payment Selection Modal */}
            {selectedComboForPayment && (
                <PaymentMethodModal
                    isOpen={!!selectedComboForPayment}
                    onClose={() => setSelectedComboForPayment(null)}
                    combo={selectedComboForPayment}
                    onSelect={(method) => handleProcessPayment(selectedComboForPayment, method)}
                />
            )}
        </div>
    );
};
