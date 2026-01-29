// selector for course tools and financial models
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { CheckCircle, DollarSign, Zap, Star, ShieldCheck, Info, AlertTriangle, Target, Calculator, Brain, Clock, Megaphone, Copy as CopyIcon, FileText } from './Icons';
import { PremiumTool, PremiumToolId, FinancialModel } from '../types/legacy';

const AVAILABLE_TOOLS: PremiumTool[] = [
    {
        id: 'marketing_pack',
        name: 'Pack Marketing 360º',
        description: 'Pacote Completo: Nexus Ads, Funis, Email Mkt e Radar Viral. Tudo integrado.',
        icon: 'Target',
        baseSetupFee: 997,
        monthlyPerStudent: 4.90,
        dilutedMarkupPercent: 30, // 30% more expensive if diluted
        recommendedNiche: ['Marketing', 'Vendas', 'Negócios']
    },
    {
        id: 'diario_alimentar',
        name: 'Diário Alimentar IA',
        description: 'Análise de fotos de comida com calorias e macros automáticos.',
        icon: 'HeartPulse',
        baseSetupFee: 300,
        monthlyPerStudent: 0.80,
        dilutedMarkupPercent: 20,
        recommendedNiche: ['Saúde', 'Emagrecimento', 'Nutrição']
    },
    {
        id: 'jurista_ia',
        name: 'Jurista IA',
        description: 'Assistente jurídico para análise de contratos e processos.',
        icon: 'Hammer',
        baseSetupFee: 600,
        monthlyPerStudent: 2.00,
        dilutedMarkupPercent: 25,
        recommendedNiche: ['Direito', 'Advocacia']
    },
    {
        id: 'coach_ia',
        name: 'Coach IA (Personalizado)',
        description: 'Um clone seu para tirar dúvidas 24h dos alunos.',
        icon: 'Bot',
        baseSetupFee: 0, // Included in standard plan usually, but can be premium
        monthlyPerStudent: 0.50,
        dilutedMarkupPercent: 0,
        recommendedNiche: []
    },
    {
        id: 'health_pack',
        name: 'Pack Saúde & Mente',
        description: 'Diário completo: Sono, Humor, Espiritualidade e Métricas Físicas.',
        icon: 'HeartPulse',
        baseSetupFee: 497,
        monthlyPerStudent: 2.90,
        dilutedMarkupPercent: 30,
        recommendedNiche: ['Saúde', 'Terapia', 'Emagrecimento', 'Espiritualidade', 'Bem-estar', 'Psicologia']
    }
];

// --- SUB COMPONENTS ---

export const CreditControlCard: React.FC<{
    limit: number,
    onChange: (val: number) => void,
    courseDuration: number,
    onDurationChange: (val: number) => void
}> = ({ limit, onChange, courseDuration, onDurationChange }) => {

    const TOTAL_CONTENT_CREDITS = 1500; // Mock "Mass" of the course content

    // Auto-adjust limit when duration changes
    useEffect(() => {
        if (courseDuration > 0) {
            const requiredLimit = Math.ceil(TOTAL_CONTENT_CREDITS / courseDuration);
            // Only auto-update if the current limit is significantly different or to enforce minimum
            if (Math.abs(limit - requiredLimit) > 5) {
                onChange(requiredLimit);
            }
        }
    }, [courseDuration]);

    // Dynamic Credit Limit Calculation
    const recommendedLimit = Math.ceil(TOTAL_CONTENT_CREDITS / (courseDuration || 1));
    const isBelowRecommended = limit < recommendedLimit;
    const deficitPercent = isBelowRecommended ? Math.round(((recommendedLimit - limit) / recommendedLimit) * 100) : 0;

    // Calculate Dynamic Setup Cost (Option A: Credits Upfront)
    const COST_PER_CREDIT = 0.01; // USD
    const totalCredits = limit * courseDuration;
    const totalSetupCostUSD = totalCredits * COST_PER_CREDIT;
    const totalSetupCostBRL = totalSetupCostUSD * 6.00; // Exchange rate mockup

    return (
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-full mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Brain className="w-40 h-40 text-purple-500" />
            </div>

            <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center gap-2 relative z-10">
                <ShieldCheck className="w-6 h-6 text-purple-400" /> Controle de Interações (Dinâmico)
            </h3>

            <p className="text-sm text-gray-400 mb-6 max-w-3xl leading-relaxed relative z-10">
                O sistema calculou que este curso possui uma <strong>Carga de Conteúdo de {TOTAL_CONTENT_CREDITS} Interações</strong>.
                Ao alterar a duração, a IA ajustará automaticamente o limite diário necessário para consumir todo o material.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Duration Input */}
                <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 flex flex-col justify-between hover:border-brand-primary/30 transition-colors">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Duração do Curso</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={courseDuration}
                                onChange={(e) => onDurationChange(parseInt(e.target.value) || 1)}
                                className="bg-gray-900 text-white text-3xl font-black w-28 p-2 rounded-lg border border-gray-700 focus:border-brand-primary outline-none text-center"
                            />
                            <span className="text-sm text-gray-400 font-bold uppercase">Dias</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-[10px] text-gray-600 font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Defina em quantos dias o aluno deve completar a jornada.
                        </p>
                    </div>
                </div>

                {/* Credit Limit Input */}
                <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${isBelowRecommended ? 'bg-red-900/10 border-red-500/50' : 'bg-gray-950 border-gray-800'}`}>
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Limite Diário (IA)</label>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-4xl font-black ${isBelowRecommended ? 'text-red-500' : 'text-brand-primary'}`}>{limit}</span>
                                <span className="text-sm text-gray-500 font-bold">interações/dia</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Carga Total Estimada</p>
                            <p className="text-sm font-bold text-white">
                                {totalCredits} Créditos ({courseDuration} dias)
                            </p>
                            <p className="text-[10px] text-green-500 font-bold mt-1">
                                Custo Setup: R$ {totalSetupCostBRL.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="relative pt-1">
                        <input
                            type="range"
                            min="5"
                            max="150"
                            step="5"
                            value={limit}
                            onChange={(e) => onChange(parseInt(e.target.value))}
                            className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all ${isBelowRecommended ? 'bg-red-900/40 accent-red-500' : 'bg-gray-700 accent-brand-primary'}`}
                        />
                    </div>

                    {/* WARNING MESSAGE */}
                    {isBelowRecommended && (
                        <div className="mt-3 bg-red-900/20 border border-red-500/30 p-3 rounded-lg animate-pulse">
                            <div className="flex gap-2 items-start">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-red-400 uppercase mb-1">Atenção Crítica: Déficit de {deficitPercent}%</p>
                                    <p className="text-[10px] text-red-300 leading-tight">
                                        Você reduziu as interações abaixo do necessário para a duração escolhida.
                                        <strong> O sistema EXCLUIRÁ automaticamente {deficitPercent}% dos módulos práticos (Workshops e Análises)</strong> para caber neste limite.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* COMMERCIAL TRANSPARENCY KIT - NEW FEATURE */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Megaphone className="w-32 h-32 text-white" />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wide">Kit de Transparência Comercial (Anti-Reembolso)</h4>
                            <p className="text-[10px] text-gray-400">Copie e cole este aviso na sua Página de Vendas para evitar disputas.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. SALES PAGE BADGE */}
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-700/50">
                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                                <Star className="w-3 h-3 text-yellow-500" /> Selo de Garantia (Display)
                            </p>
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-brand-primary/30 p-4 rounded-lg flex items-center justify-between shadow-lg">
                                <div>
                                    <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">Powered by Nexus AI</p>
                                    <p className="text-white font-bold text-sm">Incluso: {limit} Interações/Dia Grátis</p>
                                </div>
                                <Zap className="w-6 h-6 text-brand-primary animate-pulse" />
                            </div>
                        </div>

                        {/* 2. TERMS SNIPPET */}
                        <div className="bg-black/40 p-4 rounded-xl border border-gray-700/50 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-gray-400" /> Texto Legal (Termos de Uso)
                                </p>
                                <div className="bg-gray-900 p-3 rounded border border-gray-800 text-[10px] text-gray-300 font-mono italic relative group">
                                    "O aluno terá direito a uma franquia diária de {limit} interações gratuitas com o Mentor IA. O uso excedente poderá ser adquirido dentro da plataforma via recarga de créditos."

                                    <button
                                        className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`O aluno terá direito a uma franquia diária de ${limit} interações gratuitas com o Mentor IA. O uso excedente poderá ser adquirido dentro da plataforma via recarga de créditos.`);
                                            // Ideally toast here, but simplistic for now
                                        }}
                                        title="Copiar Texto"
                                    >
                                        <CopyIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const ToolSelectionGrid: React.FC<{
    niche: string,
    selectedTools: PremiumToolId[],
    onToggle: (id: PremiumToolId) => void
}> = ({ niche, selectedTools, onToggle }) => {
    // Stable list order (no jumping on selection)
    const displayTools = AVAILABLE_TOOLS;

    return (
        <div className="space-y-4 mb-8">

            {/* COMMISSION INFO BLOCK - Now at Source Top */}
            {
                selectedTools.length > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 p-4 rounded-xl flex items-start gap-4 animate-fade-in">
                        <div className="bg-green-500/20 p-2 rounded-lg shrink-0">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase mb-1">Lucre com sua Escola</h4>
                            <p className="text-xs text-gray-300 leading-relaxed mb-2">
                                Ao ativar ferramentas extras, você ganha <strong>comissão sobre o valor líquido</strong> de cada crédito ou assinatura que seus alunos comprarem.
                            </p>
                            <div className="bg-black/30 p-2 rounded-lg inline-block">
                                <p className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-2">
                                    <Megaphone className="w-3 h-3" /> Faremos campanhas internas para incentivar o uso.
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-brand-primary" /> Turbine a Experiência de Aprendizado
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTools.map(tool => (
                    <div
                        key={tool.id}
                        onClick={() => onToggle(tool.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-48 group relative overflow-hidden ${selectedTools.includes(tool.id) ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_30px_rgba(250,204,21,0.15)]' : 'bg-gray-800 border-gray-700 hover:border-brand-primary/50'}`}
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-xl transition-colors shrink-0 ${selectedTools.includes(tool.id) ? 'bg-brand-primary text-black' : 'bg-gray-900 text-gray-500 group-hover:text-white'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div className="relative z-10 w-full">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-black uppercase text-sm ${selectedTools.includes(tool.id) ? 'text-white' : 'text-gray-300'}`}>{tool.name}</h4>
                                    {selectedTools.includes(tool.id) && <CheckCircle className="w-5 h-5 text-brand-primary drop-shadow-lg" />}
                                </div>
                                <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded mb-2 ${tool.baseSetupFee === 0 ? 'bg-green-900/40 text-green-400' : 'bg-gray-900 text-brand-primary'}`}>
                                    {tool.baseSetupFee === 0 ? 'SETUP GRÁTIS' : `SETUP R$ ${tool.baseSetupFee}`}
                                </span>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed mb-4 line-clamp-2">{tool.description}</p>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-gray-700/50 flex items-center justify-between mt-auto">
                            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                <DollarSign className="w-3 h-3 text-brand-primary" />
                                Mensalidade:
                            </div>
                            <div className="text-sm font-black text-white">
                                + R$ {tool.monthlyPerStudent.toFixed(2)}/aluno
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export const CostSummaryCard: React.FC<{
    selectedTools: PremiumToolId[],
    paymentType: 'upfront' | 'diluted',
    setPaymentType: (t: 'upfront' | 'diluted') => void,
    dailyLimit?: number,
    courseDuration?: number
}> = ({ selectedTools, paymentType, setPaymentType, dailyLimit = 30, courseDuration = 30 }) => {

    useEffect(() => {
        // Enforce default to diluted on mount
        setPaymentType('diluted');
    }, []);

    const calculateTotals = () => {
        const tools = AVAILABLE_TOOLS.filter(t => selectedTools.includes(t.id));
        const totalSetupTools = tools.reduce((acc, t) => acc + t.baseSetupFee, 0); // Only Tools
        const totalMonthly = tools.reduce((acc, t) => acc + t.monthlyPerStudent, 0);

        // Diluted fee applies ONLY to Tools now
        // Standard markup logic (e.g. 20-30%)
        const dilutedFeeTools = tools.reduce((acc, t) => acc + (t.baseSetupFee * (1 + t.dilutedMarkupPercent / 100)), 0);

        // Dynamic Credit Cost (Bundled Model: Infra included in Credit Unit Cost)
        // At 900 credits * $0.01 = $9.00. This covers the ~$3.50 infra cost + token usage.
        const totalCredits = dailyLimit * courseDuration;
        const COST_PER_CREDIT_USD = 0.01;
        const embeddedCreditCost = (totalCredits * COST_PER_CREDIT_USD * 6.00); // BRL

        // Hosting Cost is now effectively 0 for the producer (hidden/bundled)
        const hostingCost = 0;

        return { totalSetupTools, totalMonthly, dilutedFeeTools, embeddedCreditCost, hostingCost };
    };

    const totals = calculateTotals();
    const hasToolsCost = totals.totalSetupTools > 0;

    // NEW LOGIC: Deduction is 2.5% of the TOTAL DILUTED COST per sale.
    // Example: If diluted cost is R$ 1300. Deduction is 1300 * 0.025 = R$ 32.50 per sale.
    // It takes exactly 40 sales to pay off (100% / 2.5% = 40).
    const deductionPerSale = totals.dilutedFeeTools * 0.025;
    const salesToBreakEven = 40; // Mathematically constant with this rule

    return (
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Calculator className="w-40 h-40 text-brand-primary" />
            </div>

            <h3 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2 relative z-10">
                <Calculator className="w-6 h-6 text-green-400" /> Resumo de Custos & Repasse
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

                {/* LEFT: Fixed Costs & Credits */}
                <div className="space-y-4">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-400 uppercase">Setup do Aluno (Créditos)</span>
                            <span className="text-xl font-black text-white">R$ {totals.embeddedCreditCost.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            Este valor cobre o uso do <strong>Nexus Player, Infraestrutura de Vídeo e Pacote de Inteligência Artificial</strong>. Deduzido automaticamente da venda.
                        </p>
                    </div>

                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-gray-400 uppercase">Taxa Mensal Ferramentas</span>
                            <span className="text-xl font-black text-yellow-500">R$ {totals.totalMonthly.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            Valor cobrado mensalmente por aluno ativo que utiliza as ferramentas extras (Módulos Opcionais).
                        </p>
                    </div>
                </div>

                {/* RIGHT: Deduction Example or Tool Payment */}
                <div className="space-y-4">
                    {/* Tool Payment Logic (Only if tools selected) */}
                    {hasToolsCost && (
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-2 tracking-widest">Pagamento Setup Ferramentas (Opcional)</label>
                            <div className="flex flex-col-reverse md:flex-row gap-3">
                                {/* Upfront Option (Secondary now) */}
                                <button
                                    onClick={() => setPaymentType('upfront')}
                                    className={`flex-1 p-3 rounded-xl border text-center transition-all opacity-80 hover:opacity-100 ${paymentType === 'upfront' ? 'bg-green-900/20 border-green-500 opacity-100 ring-1 ring-green-500' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
                                >
                                    <span className={`block font-bold text-xs ${paymentType === 'upfront' ? 'text-green-400' : 'text-gray-400'}`}>Pagar Agora (R$ {totals.totalSetupTools})</span>
                                </button>

                                {/* Diluted Option (Primary/Default) */}
                                <button
                                    onClick={() => setPaymentType('diluted')}
                                    className={`flex-1 p-4 rounded-xl border text-center transition-all bg-brand-primary text-black shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:scale-[1.02] active:scale-95 ${paymentType === 'diluted' ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-yellow-600 opacity-90'}`}
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="block font-black text-sm uppercase leading-none mb-1">DILUIR INVESTIMENTO</span>
                                        <span className="block font-bold text-[10px] opacity-80 bg-black/10 px-2 py-0.5 rounded-full">Recomendado</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* DEDUCTION EXAMPLE */}
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                        <h4 className="text-xs font-black text-green-400 uppercase mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Exemplo de Fluxo de Caixa (1 Venda)
                        </h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-gray-400">
                                <span>Valor da Venda (Exemplo)</span>
                                <span>R$ 197,00</span>
                            </div>
                            <div className="flex justify-between text-red-400/80">
                                <span>(-) Setup Infra + IA (Único)</span>
                                <span>- R$ {totals.embeddedCreditCost.toFixed(2)}</span>
                            </div>

                            {/* DILUTION LINE */}
                            {paymentType === 'diluted' && hasToolsCost && (
                                <div className="flex justify-between text-blue-300 bg-blue-900/20 p-1 rounded px-2 -mx-2">
                                    <span className="font-bold">(-) Diluição Ferramentas</span>
                                    <div className="text-right">
                                        <span className="block font-bold">- R$ {deductionPerSale.toFixed(2)}</span>
                                        <span className="block text-[9px] text-blue-400 opacity-80">(Total de {salesToBreakEven} vendas para quitar)</span>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-700 my-2 pt-2 flex justify-between font-black text-white text-sm">
                                <span>Recebido pelo Produtor</span>
                                <span>= R$ {(197 - totals.embeddedCreditCost - (paymentType === 'diluted' && hasToolsCost ? deductionPerSale : 0)).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-center">
                            <p className="text-[11px] text-brand-primary font-bold leading-tight">
                                <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                                O produtor não desembolsa nada antecipadamente pelas interações. Tudo é descontado do fluxo de caixa.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN WRAPPER (Deprecated but kept for compatibility if needed elsewhere) ---
// Note: AdminTrainingPage will likely use the sub-components directly for custom ordering.

interface SchoolToolsSelectorProps {
    niche: string;
    onSave: (config: { tools: PremiumToolId[], financial: FinancialModel }) => void;
    onBack: () => void;
    initialData?: any;
}

export const SchoolToolsSelector: React.FC<SchoolToolsSelectorProps> = ({ niche, onSave, onBack, initialData }) => {
    const [selectedTools, setSelectedTools] = useState<PremiumToolId[]>(initialData?.tools || []);
    const [paymentType, setPaymentType] = useState<'upfront' | 'diluted'>(initialData?.financial?.type || 'diluted');

    // Sync to parent whenever state changes
    useEffect(() => {
        onSave({
            tools: selectedTools,
            financial: { type: paymentType, installments: paymentType === 'diluted' ? 12 : 1, interestRate: 0 }
        });
    }, [selectedTools, paymentType]);

    const handleToggle = (id: PremiumToolId) => {
        setSelectedTools(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <ToolSelectionGrid
                niche={niche}
                selectedTools={selectedTools}
                onToggle={handleToggle}
            />
            <CostSummaryCard
                selectedTools={selectedTools}
                paymentType={paymentType}
                setPaymentType={setPaymentType}
                dailyLimit={initialData?.aiConfig?.monthlyCreditAllowance || 30}
                courseDuration={initialData?.courseDurationDays || 30}
            />
        </div>
    );
};
