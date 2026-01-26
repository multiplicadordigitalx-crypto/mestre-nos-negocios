
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
    ClipboardCopy, Pencil, Link as LinkIcon, Eye, CheckCircle,
    Clock, X as XIcon, LockClosed, PlusCircle, ShoppingBag, Trophy,
    DollarSign, BarChart3, Users, Zap, ShieldCheck,
    Search, Trash, Activity,
    Brain, Target, Star, ArrowRight, Whatsapp, Wallet, TrendingUp, PieChart, ExternalLink,
    Info, Crown, AlertTriangle
} from '../components/Icons';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { AppProduct, CheckoutLink, ProductDNA } from '../types';
import { getAppProducts, saveAppProduct, updateProductDNA, calibrateAutonomousDNA, sendInviteViaWhatsAppInstance } from '../services/mockFirebase';
import { ProductWizardModal } from '../components/ProductWizardModal';
import { NexusOnboardingModal } from '../components/NexusOnboardingModal';
import { callMestreIA } from '../services/mestreIaService';
import { CreditBalanceWidget } from '../components/CreditBalanceWidget';

// --- HELPERS INTERNOS ---
const KpiCard: React.FC<{ label: string, value: string, icon: React.ReactNode, color: string, subValue?: string, onClick?: () => void }> = ({ label, value, icon, color, subValue, onClick }) => (
    <div onClick={onClick} className={`bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-${color.split('-')[1]}-500/50 transition-all shadow-lg cursor-pointer hover:scale-[1.02] group relative overflow-hidden`}>
        <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${color.replace('text-', 'bg-').replace('400', '500')}/10 blur-xl group-hover:blur-2xl transition-all`}></div>
        <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20 border border-current border-opacity-10`}>{icon}</div>
        </div>
        <p className="text-2xl font-black text-white relative z-10">{value}</p>
        {subValue && <p className="text-[10px] text-gray-500 font-medium mt-1">{subValue}</p>}
    </div>
);

// --- MODAL: CONVIDAR AFILIADO ---
const AffiliateManagerModal: React.FC<{ isOpen: boolean, onClose: () => void, products: AppProduct[] }> = ({ isOpen, onClose, products }) => {
    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState({ name: '', phone: '', email: '', product: '' });

    if (!isOpen) return null;

    const handleSendInvite = async () => {
        if (!inviteData.name || (!inviteData.phone && !inviteData.email) || !inviteData.product) return toast.error("Preencha Nome, Produto e pelo menos um contato.");

        setLoading(true);
        try {
            // Generate unique link
            const link = `https://mestre15x.com/invite?ref=${Math.random().toString(36).substring(7)}&product=${inviteData.product}`;
            const productName = products.find(p => p.id === inviteData.product)?.name || 'Produto';

            // Send via Unified Nexus System
            const { nexusCore } = await import('../services/NexusCore');
            const result = await nexusCore.sendSystemInvite({
                name: inviteData.name,
                phone: inviteData.phone,
                email: inviteData.email,
                projectName: productName,
                link: link
            });

            // Rich Feedback
            const channels = [];
            if (result.wa) channels.push(`WhatsApp (${result.waInstance})`);
            if (result.email) channels.push(`Email (${result.emailServer})`);

            if (channels.length > 0) {
                toast.success(`Convite enviado via: ${channels.join(' & ')}`, { icon: '🚀', duration: 4000 });
                onClose();
            } else {
                toast.error("Falha ao enviar convite (Sem canais disponíveis).");
            }
        } catch (error: any) {
            console.error("Invite Error:", error);
            toast.error(`Erro ao enviar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-800 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-400" /> Convidar Parceiro
                    </h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-200">
                            <strong>Nota:</strong> O Nexus escolherá automaticamente a melhor rota (WhatsApp Sistema ou Email Marketing).
                        </div>

                        <Input label="Nome" value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })} placeholder="Nome do afiliado" />
                        <Input label="WhatsApp" value={inviteData.phone} onChange={e => setInviteData({ ...inviteData, phone: e.target.value })} placeholder="5511999999999" />
                        <Input label="Email (Opcional)" value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })} placeholder="email@parceiro.com" />

                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase mb-1 block">Produto</label>
                            <select className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white text-sm" value={inviteData.product} onChange={e => setInviteData({ ...inviteData, product: e.target.value })}>
                                <option value="">Selecione...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleSendInvite} isLoading={loading} className="w-full mt-2 !bg-green-600 hover:!bg-green-500 font-bold">
                            <Whatsapp className="w-4 h-4 mr-2" /> ENVIAR CONVITE UNIFICADO
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

interface AppProductsViewProps {
    navigateTo?: (page: any) => void;
}

const AppProductsView: React.FC<AppProductsViewProps> = ({ navigateTo }) => {
    const { user } = useAuth();
    const [products, setProducts] = useState<AppProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedProduct, setSelectedProduct] = useState<AppProduct | null>(null);
    const [activeProductTab, setActiveProductTab] = useState<'active' | 'development'>('active');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states - wizardOpen começa como false para garantir que a lista abra primeiro
    const [wizardOpen, setWizardOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [productToEdit, setProductToEdit] = useState<AppProduct | null>(null);
    const [nexusModalOpen, setNexusModalOpen] = useState(false);
    const [createdProductName, setCreatedProductName] = useState('');
    const [createdProduct, setCreatedProduct] = useState<AppProduct | null>(null);
    const [isAffiliateManagerOpen, setIsAffiliateManagerOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const prods = await getAppProducts();
        // Filtra produtos do usuário ou todos se admin
        if (user && user.role !== 'admin' && user.role !== 'super_admin') {
            setProducts(prods.filter(p => p.ownerId === user.uid));
        } else {
            setProducts(prods);
        }
        setLoading(false);
    };

    const handleEditProduct = (product: AppProduct) => {
        setProductToEdit(product);
        setIsEditMode(true);
        setWizardOpen(true);
    };

    // Fix: Added missing handleProductUpdate function to update local state after Nexus onboarding
    const handleProductUpdate = (updatedProduct: AppProduct) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        if (selectedProduct && selectedProduct.id === updatedProduct.id) {
            setSelectedProduct(updatedProduct);
        }
        if (createdProduct && createdProduct.id === updatedProduct.id) {
            setCreatedProduct(updatedProduct);
        }
    };

    const handleWizardSuccess = async (savedProduct?: AppProduct) => {
        await loadData();
        if (savedProduct && savedProduct.status === 'active') {
            setCreatedProductName(savedProduct.name);
            setCreatedProduct(savedProduct);
            setNexusModalOpen(true);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            // Lógica Reconstruída: Aba 'Ativos' mostra tudo que NÃO é Rascunho (development) ou Arquivado.
            // Isso garante que 'pending', 'active', 'paused', 'inactive' apareçam.
            const matchesTab = activeProductTab === 'active'
                ? (p.status !== 'development' && p.status !== 'archived')
                : p.status === 'development';
            return matchesSearch && matchesTab;
        });
    }, [products, searchTerm, activeProductTab]);

    const stats_summary = useMemo(() => {
        const activeList = products.filter(p => p.status === 'active');
        return {
            active: activeList.length,
            sales: activeList.reduce((acc, p) => acc + (p.stats.totalSales || 0), 0),
            revenue: activeList.reduce((acc, p) => acc + (p.stats.revenue || 0), 0),
            afiliados: activeList.reduce((acc, p) => acc + (p.affiliates?.length || 0), 0)
        };
    }, [products]);

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Credit Balance Widget - Mobile Priority */}
            <div className="flex justify-end mb-4">
                <CreditBalanceWidget onRecharge={() => navigateTo ? navigateTo('recharge') : null} />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-brand-primary" /> Meus Produtos e Ativos
                    </h2>
                    <p className="text-gray-400 text-sm">Gerencie seus produtos, links e acompanhe o ROI em tempo real.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Botões Responsivos */}
                    <Button onClick={() => setIsAffiliateManagerOpen(true)} className="!py-3 !px-6 !bg-green-600 hover:!bg-green-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 text-xs w-full sm:w-auto justify-center">
                        <Whatsapp className="w-5 h-5" /> Convidar Afiliado
                    </Button>

                    <Button
                        onClick={() => navigateTo && navigateTo('mestre_ia')}
                        className="!py-3 !px-6 !bg-purple-600 hover:!bg-purple-500 font-black text-white shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-xs w-full sm:w-auto justify-center"
                    >
                        <Brain className="w-5 h-5" /> MESTRE IA
                    </Button>

                    <Button onClick={() => setWizardOpen(true)} className="!bg-brand-primary text-black hover:!bg-yellow-400 font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 text-xs w-full sm:w-auto justify-center">
                        <PlusCircle className="w-5 h-5" /> Lançar Novo Ativo
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard label="Ativos em Venda" value={stats_summary.active.toString()} icon={<ShoppingBag className="w-6 h-6 text-blue-400" />} color="text-blue-500" />
                <KpiCard label="Vendas Totais" value={stats_summary.sales.toLocaleString()} icon={<BarChart3 className="w-6 h-6 text-green-400" />} color="text-green-500" />
                <KpiCard label="Faturamento" value={`R$ ${stats_summary.revenue.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-yellow-400" />} color="text-yellow-500" />
                <KpiCard label="Afiliados" value={stats_summary.afiliados.toString()} icon={<Users className="w-6 h-6 text-purple-400" />} color="text-purple-500" />
            </div>

            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden min-h-[500px] shadow-xl">
                <div className="flex border-b border-gray-700 bg-gray-900/30">
                    <button onClick={() => setActiveProductTab('active')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${activeProductTab === 'active' ? 'border-brand-primary text-white bg-gray-800/50' : 'border-transparent text-gray-500 hover:text-white'}`}>Ativos Disponíveis</button>
                    <button onClick={() => setActiveProductTab('development')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${activeProductTab === 'development' ? 'border-brand-primary text-white bg-gray-800/50' : 'border-transparent text-gray-500 hover:text-white'}`}>Em Preparação</button>
                </div>

                <div className="p-4 bg-gray-800 border-b border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-brand-primary outline-none transition-all" placeholder="Filtrar por nome do produto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="p-4 hover:border-brand-primary/50 transition-all cursor-pointer group flex flex-col h-full" onClick={() => { setSelectedProduct(product); setView('detail'); }}>
                                <div className="relative h-40 bg-gray-900 rounded-xl mb-4 overflow-hidden border border-gray-700 flex items-center justify-center">
                                    {product.coverUrl ? <img src={product.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" /> : <ShoppingBag className="w-12 h-12 text-gray-700" />}
                                    <div className="absolute top-2 left-2"><span className="bg-black/60 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full border border-white/10 font-bold uppercase">{product.category || 'Geral'}</span></div>
                                </div>
                                <h4 className="font-bold text-white text-lg line-clamp-1 mb-2">{product.name}</h4>
                                <div className="space-y-2 text-xs text-gray-400 mb-6 flex-1">
                                    <div className="flex justify-between"><span>Plataforma:</span> <span className="text-white font-medium">{product.platform}</span></div>
                                    <div className="flex justify-between"><span>Preço:</span> <span className="text-green-400 font-bold">R$ {product.price?.toFixed(2)}</span></div>
                                    <div className="flex justify-between border-t border-gray-700/50 pt-2"><span>Sua Comissão:</span> <span className="text-yellow-400 font-bold">{product.commission}%</span></div>

                                    {/* Status Tag Logic */}
                                    <div className="mt-3 pt-2 border-t border-gray-700/50">
                                        {product.status === 'pending' ? (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1 flex items-center justify-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase">SETUP PENDENTE</span>
                                            </div>
                                        ) : product.status === 'active' ? (
                                            <div className="bg-green-500/10 border border-green-500/30 rounded px-2 py-1 flex items-center justify-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                <span className="text-[10px] font-bold text-green-500 uppercase">SETUP ATIVO</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-700 flex gap-2">
                                    <Button variant="secondary" className="flex-1 !py-1.5 !text-[10px]" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}><Pencil className="w-3 h-3 mr-1" /> Editar</Button>
                                    <Button className="flex-1 !py-1.5 !text-[10px]" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setView('detail'); }}>Inteligência</Button>
                                </div>
                            </Card>
                        ))}
                        {filteredProducts.length === 0 && <div className="col-span-full text-center py-20 text-gray-600"><ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Nenhum produto encontrado.</p></div>}
                    </div>
                </div>
            </div>

            {/* Modais de Gerenciamento - Renderizados apenas quando necessários */}
            {wizardOpen && (
                <ProductWizardModal
                    isOpen={wizardOpen}
                    onClose={() => setWizardOpen(false)}
                    onSuccess={handleWizardSuccess}
                    user={user}
                    initialProduct={productToEdit}
                    isEditMode={isEditMode}
                />
            )}

            {nexusModalOpen && (
                <NexusOnboardingModal
                    isOpen={nexusModalOpen}
                    onClose={() => setNexusModalOpen(false)}
                    productName={createdProductName}
                    product={createdProduct}
                    onUpdate={handleProductUpdate}
                />
            )}
            {isAffiliateManagerOpen && (
                <AffiliateManagerModal
                    isOpen={isAffiliateManagerOpen}
                    onClose={() => setIsAffiliateManagerOpen(false)}
                    products={products}
                />
            )}
        </div>
    );
};

export default AppProductsView;
