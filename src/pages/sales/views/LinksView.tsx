import React from 'react';
import { motion } from 'framer-motion';
import { AppProduct, SalesPerson } from '@/types';
import {
    Link as LinkIcon, ShoppingBag, ClipboardCopy,
    ExternalLink, Globe, CheckCircle
} from '@/components/Icons';
import Card from '@/components/Card';
import toast from 'react-hot-toast';

interface LinksViewProps {
    products: AppProduct[];
    salesPerson: SalesPerson;
}

export const LinksView: React.FC<LinksViewProps> = ({ products, salesPerson }) => {

    const copyToClipboard = (text: string, label: string) => {
        if (!text) {
            toast.error(`${label} não disponível.`);
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success(`${label} copiado com sucesso!`);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
            <div className="mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <LinkIcon className="w-7 h-7 text-blue-400" /> Meus Ativos de Venda
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Links sincronizados e rastreados automaticamente para garantir sua comissão.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                        <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4 opacity-30" />
                        <p className="text-gray-500 font-bold">Nenhum produto publicado no momento.</p>
                    </div>
                ) : products.map(p => {
                    // Lógica de rastreio automático: concatena o UID do vendedor como parâmetro ref
                    const affiliateId = salesPerson.uid;
                    const salesPageUrl = p.landingPage;

                    // Constrói o link de checkout com rastreio
                    const checkoutUrl = p.baseAffiliateLink
                        ? (p.baseAffiliateLink.includes('?')
                            ? `${p.baseAffiliateLink}&ref=${affiliateId}`
                            : `${p.baseAffiliateLink}?ref=${affiliateId}`)
                        : '';

                    return (
                        <Card key={p.id} className="bg-gray-900 border-gray-800 border-l-4 border-l-blue-600 hover:border-l-blue-400 transition-all group overflow-hidden relative">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all"></div>

                            {/* Product Header */}
                            <div className="p-6 pb-4 border-b border-gray-800 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700 shadow-inner overflow-hidden">
                                        {p.coverUrl ? (
                                            <img src={p.coverUrl} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <ShoppingBag className="w-7 h-7 text-brand-primary opacity-50" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-white uppercase tracking-tighter truncate" title={p.name}>
                                            {p.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-gray-950 px-2 py-0.5 rounded border border-gray-800">
                                                Comissão: <span className="text-green-400">{(p.commission || 10)}%</span>
                                            </span>
                                            {p.status === 'active' && (
                                                <span className="text-[10px] text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50 font-bold uppercase flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Sincronizado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Links Content */}
                            <div className="p-6 pt-4 space-y-5 relative z-10">
                                {/* Sales Page Section - Para Estudo */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" /> Página de Vendas (Estudo)
                                        </span>
                                        <span className="text-[9px] text-gray-600 italic">Visualize a oferta antes de vender</span>
                                    </div>
                                    <div className="bg-blue-950/20 p-3 rounded-2xl border border-blue-500/20 flex items-center justify-between group/link hover:bg-blue-950/40 transition-colors">
                                        <code className="text-xs text-blue-200 truncate flex-1 font-mono mr-3 opacity-60 group-hover/link:opacity-100 transition-opacity">
                                            {salesPageUrl || 'URL Indisponível'}
                                        </code>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => salesPageUrl && window.open(salesPageUrl, '_blank')}
                                                className="text-blue-400 hover:text-white transition-all bg-blue-500/10 p-2 rounded-xl hover:bg-blue-500/30 border border-blue-500/20"
                                                title="Acessar para Estudo"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(salesPageUrl, "Link da Página")}
                                                className="text-blue-400 hover:text-white transition-all bg-blue-500/10 p-2 rounded-xl hover:bg-blue-500/30 border border-blue-500/20"
                                                title="Copiar URL"
                                            >
                                                <ClipboardCopy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Link Section - Para Vender */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <LinkIcon className="w-3.5 h-3.5" /> Link de Checkout (Venda)
                                        </span>
                                        <span className="text-[9px] text-gray-600 italic">Sua comissão está garantida aqui</span>
                                    </div>
                                    <div className="bg-green-950/20 p-3 rounded-2xl border border-green-500/20 flex items-center justify-between group/link hover:bg-green-950/40 transition-colors">
                                        <code className="text-xs text-green-200 truncate flex-1 font-mono mr-3">
                                            {checkoutUrl || 'Checkout não configurado'}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(checkoutUrl, "Link de Checkout")}
                                            className="text-green-400 hover:text-white transition-all bg-green-500/10 p-2 rounded-xl hover:bg-green-500/30 border border-green-500/20 shadow-lg shadow-green-900/10"
                                            title="Copiar Link de Venda"
                                            disabled={!checkoutUrl}
                                        >
                                            <ClipboardCopy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Tracking Info */}
                            <div className="px-6 pb-4 bg-black/10 pt-2 border-t border-gray-800/50">
                                <p className="text-[8px] text-gray-600 text-center leading-tight">
                                    ESTE ATIVO CONTÉM O TOKEN DE RASTREIO <span className="text-blue-500 font-mono">{affiliateId.substring(0, 12)}...</span> <br />
                                    SINCRONIZADO COM O MOTOR DE PAGAMENTOS EM TEMPO REAL.
                                </p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </motion.div>
    );
};