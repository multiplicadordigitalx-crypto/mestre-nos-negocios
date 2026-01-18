
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Calculator, Settings, Percent, Box, TrendingUp, Link as LinkIcon } from '../../../../components/Icons';
import { CombosTab } from './tabs/CombosTab';
import { ToolPricingTab } from './tabs/ToolPricingTab';
import { PromotionsTab } from './tabs/PromotionsTab';
import { GeneralRulesTab } from './tabs/GeneralRulesTab';
import { PlansBiTab } from './tabs/PlansBiTab';
import { CheckoutLinksTab } from './tabs/CheckoutLinksTab';

const PricesCreditsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('combos');

    const TABS = [
        { id: 'combos', label: '1. Combos de Venda', icon: <Box className="w-4 h-4" /> },
        { id: 'tools', label: '2. Custo Ferramentas', icon: <Calculator className="w-4 h-4" /> },
        { id: 'plans', label: '3. Planos & BI (Nexus)', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'promotions', label: '4. Ofertas & Cupons', icon: <Percent className="w-4 h-4" /> },
        { id: 'rules', label: '5. Regras Gerais', icon: <Settings className="w-4 h-4" /> },
        { id: 'checkout_links', label: '6. Links & Checkout', icon: <LinkIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 animate-fade-in w-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <Coins className="w-8 h-8 text-green-400" /> Gestão Financeira Nexus
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Precificação dinâmica de IA, pacotes e análise de lucratividade.</p>
                </div>
            </div>

            <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 w-full overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 rounded-lg text-xs md:text-sm font-bold uppercase transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === tab.id
                                ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === 'combos' && <CombosTab />}
                        {activeTab === 'tools' && <ToolPricingTab />}
                        {activeTab === 'plans' && <PlansBiTab />}
                        {activeTab === 'promotions' && <PromotionsTab />}
                        {activeTab === 'rules' && <GeneralRulesTab />}
                        {activeTab === 'checkout_links' && <CheckoutLinksTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PricesCreditsView;
