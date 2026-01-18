
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../../../../components/Card';
import Button from '../../../../../components/Button';
import Input from '../../../../../components/Input';
import { 
    PlusCircle, Trash, X as XIcon, Zap, DollarSign, 
    TrendingUp, ShoppingBag, CheckCircle, Pencil, Star,
    Crown, Users, Activity, Wallet, Box, Trophy, LockClosed, Brain, Settings
} from '../../../../../components/Icons';
import { getCreditCombos, saveCreditCombo, deleteCreditCombo } from '../../../../../services/mockFirebase';
import { CreditCombo } from '../../../../../types';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../../../../../components/LoadingSpinner';
import { SYSTEM_MODULES } from '../constants';

export const CombosTab: React.FC = () => {
    const [combos, setCombos] = useState<CreditCombo[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCombo, setCurrentCombo] = useState<Partial<CreditCombo>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getCreditCombos();
        // Fixed: Use setCombos instead of setLeads
        setCombos(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentCombo.name || !currentCombo.credits || currentCombo.price === undefined) {
            return toast.error("Preencha todos os campos obrigatórios.");
        }

        const comboToSave: CreditCombo = {
            id: currentCombo.id || `combo-${Date.now()}`,
            name: currentCombo.name,
            credits: Number(currentCombo.credits),
            price: Number(currentCombo.price),
            active: currentCombo.active ?? true,
            salesCount: currentCombo.salesCount || 0,
            targetRole: currentCombo.targetRole || 'all',
            validForTools: currentCombo.validForTools || [],
            paymentLink: currentCombo.paymentLink || ''
        };

        await saveCreditCombo(comboToSave);
        await loadData();
        setIsEditing(false);
        toast.success(currentCombo.id ? "Pacote atualizado!" : "Novo combo criado com sucesso!", {
            icon: '💰'
        });
    };
    
    const handleDelete = async (id: string) => {
        if(confirm("Deseja realmente remover este pacote? Alunos que já compraram não serão afetados, mas ele sumirá da loja.")) {
            await deleteCreditCombo(id);
            await loadData();
            toast.success("Pacote removido da prateleira.");
        }
    };

    const totalStats = useMemo(() => {
        return {
            totalRevenue: combos.reduce((acc, c) => acc + (c.price * c.salesCount), 0),
            totalSales: combos.reduce((acc, c) => acc + c.salesCount, 0),
            bestSeller: [...combos].sort((a, b) => b.salesCount - a.salesCount)[0]
        };
    }, [combos]);

    const toggleToolFilter = (toolId: string) => {
        const current = currentCombo.validForTools || [];
        if (current.includes(toolId)) {
            setCurrentCombo({ ...currentCombo, validForTools: current.filter(id => id !== toolId) });
        } else {
            setCurrentCombo({ ...currentCombo, validForTools: [...current, toolId] });
        }
    };

    return (
        <div className="animate-fade-in space-y-8 pb-20">
             {/* Dashboard de Performance da Loja */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-2xl flex items-center gap-4">
                     <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                         <DollarSign className="w-6 h-6"/>
                     </div>
                     <div>
                         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Faturamento Total Loja</p>
                         <p className="text-xl font-black text-white">R$ {totalStats.totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                     </div>
                 </div>
                 <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-2xl flex items-center gap-4">
                     <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                         <ShoppingBag className="w-6 h-6"/>
                     </div>
                     <div>
                         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Pacotes Vendidos</p>
                         <p className="text-xl font-black text-white">{totalStats.totalSales} unidades</p>
                     </div>
                 </div>
                 <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-2xl flex items-center gap-4">
                     <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                         <Trophy className="w-6 h-6"/>
                     </div>
                     <div>
                         <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Produto Campeão</p>
                         <p className="text-sm font-black text-white truncate max-w-[150px]">{totalStats.bestSeller?.name || '-'}</p>
                     </div>
                 </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                 <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Box className="w-6 h-6 text-brand-primary"/> Prateleira de Créditos
                     </h3>
                     <p className="text-gray-400 text-sm">Gerencie os produtos da loja de créditos da plataforma.</p>
                 </div>
                 <Button 
                    onClick={() => { 
                        setCurrentCombo({ name: '', credits: 100, price: 0, active: true, salesCount: 0, targetRole: 'all', validForTools: [] }); 
                        setIsEditing(true); 
                    }} 
                    className="!bg-brand-primary text-black font-black uppercase text-xs tracking-widest shadow-xl shadow-yellow-500/10"
                >
                    <PlusCircle className="w-4 h-4 mr-2"/> Criar Novo Combo
                </Button>
             </div>

             {loading ? (
                 <div className="flex justify-center py-20"><LoadingSpinner size="lg"/></div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {combos.map((combo, idx) => (
                            <motion.div
                                key={combo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={`p-0 overflow-hidden border-2 transition-all group relative ${combo.active ? 'border-gray-700 hover:border-brand-primary/50' : 'border-red-900/30 opacity-60'}`}>
                                    {/* Decorator Light */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-brand-primary/10 transition-all"></div>
                                    
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h4 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-brand-primary transition-colors">{combo.name}</h4>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                                        combo.targetRole === 'all' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                                        combo.targetRole === 'influencer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                        {combo.targetRole === 'all' ? 'Global' : combo.targetRole === 'influencer' ? 'Influencer' : 'Aluno'}
                                                    </span>
                                                    {combo.validForTools && combo.validForTools.length > 0 ? (
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-orange-500/10 text-orange-400 border-orange-500/20">
                                                            {combo.validForTools.length} Ferramentas Específicas
                                                        </span>
                                                    ) : (
                                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-green-500/10 text-green-400 border-green-500/20">
                                                            Uso Universal
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-xl ${combo.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {combo.active ? <Zap className="w-5 h-5"/> : <LockClosed className="w-5 h-5"/>}
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <p className="text-4xl font-black text-white tracking-tighter">
                                                {combo.credits} <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Créditos</span>
                                            </p>
                                            <p className="text-xl font-bold text-green-400 font-mono">
                                                R$ {combo.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6 bg-black/20 p-3 rounded-xl border border-gray-700/50 shadow-inner">
                                            <div className="text-center border-r border-gray-700/50">
                                                <p className="text-[9px] text-gray-500 uppercase font-black">Vendas</p>
                                                <p className="text-sm font-bold text-white">{combo.salesCount}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-500 uppercase font-black">Receita</p>
                                                <p className="text-sm font-bold text-green-500">R$ {(combo.price * combo.salesCount).toLocaleString('pt-BR')}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => { setCurrentCombo(combo); setIsEditing(true); }} 
                                                className="flex-1 !py-2 !text-xs border-gray-600 hover:bg-gray-700"
                                            >
                                                <Pencil className="w-3 h-3 mr-2"/> Editar
                                            </Button>
                                            <button 
                                                onClick={() => handleDelete(combo.id)}
                                                className="p-2 bg-gray-900 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/10 transition-all border border-gray-700"
                                                title="Remover"
                                            >
                                                <Trash className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
             )}

             {/* Modal de Edição/Criação */}
             <AnimatePresence>
                 {isEditing && (
                     <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150] p-4">
                         <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-gray-800 w-full max-w-2xl rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                         >
                             <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                                 <div className="flex items-center gap-3">
                                     <div className="p-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                                         <PlusCircle className="w-6 h-6 text-brand-primary"/>
                                     </div>
                                     <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                         {currentCombo.id ? 'Ajustar Pacote' : 'Novo Pacote Comercial'}
                                     </h3>
                                 </div>
                                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                                     <XIcon className="w-6 h-6 text-gray-400 hover:text-white"/>
                                 </button>
                             </div>

                             <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                                 <div className="space-y-6">
                                     <Input 
                                        label="Nome Comercial do Combo" 
                                        value={currentCombo.name} 
                                        onChange={e => setCurrentCombo({...currentCombo, name: e.target.value})} 
                                        placeholder="Ex: Pack Escala E-mail Marketing" 
                                        className="!bg-gray-900 focus:!border-brand-primary"
                                     />
                                     
                                     <div className="grid grid-cols-2 gap-6">
                                         <div className="space-y-2">
                                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Quantidade de Créditos</label>
                                             <div className="relative">
                                                 <Zap className="absolute left-3 top-3.5 w-5 h-5 text-brand-primary"/>
                                                 <input 
                                                    type="number" 
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white font-black text-lg focus:border-brand-primary outline-none transition-all"
                                                    value={currentCombo.credits} 
                                                    onChange={e => setCurrentCombo({...currentCombo, credits: parseInt(e.target.value)})}
                                                 />
                                             </div>
                                         </div>
                                         <div className="space-y-2">
                                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Preço de Venda (R$)</label>
                                             <div className="relative">
                                                 <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-green-500"/>
                                                 <input 
                                                    type="number" 
                                                    step="0.01"
                                                    className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-green-400 font-black text-lg focus:border-brand-primary outline-none transition-all"
                                                    value={currentCombo.price} 
                                                    onChange={e => setCurrentCombo({...currentCombo, price: parseFloat(e.target.value)})}
                                                 />
                                             </div>
                                         </div>
                                     </div>

                                     <div className="grid grid-cols-2 gap-4">
                                         <div>
                                             <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Público Alvo</label>
                                             <select 
                                                className="w-full bg-gray-900 border border-gray-600 rounded-xl p-3 text-white text-sm font-bold outline-none focus:border-brand-primary"
                                                value={currentCombo.targetRole}
                                                onChange={e => setCurrentCombo({...currentCombo, targetRole: e.target.value as any})}
                                             >
                                                 <option value="student">Alunos</option>
                                                 <option value="influencer">Influenciadores</option>
                                                 <option value="all">Global (Todos)</option>
                                             </select>
                                         </div>
                                         <div className="flex flex-col justify-end">
                                             <label className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-600 rounded-xl cursor-pointer hover:bg-gray-800 transition-all">
                                                 <input 
                                                    type="checkbox" 
                                                    checked={currentCombo.active} 
                                                    onChange={e => setCurrentCombo({...currentCombo, active: e.target.checked})} 
                                                    className="w-5 h-5 rounded bg-gray-700 border-gray-500 text-brand-primary focus:ring-0"
                                                 />
                                                 <span className="text-sm font-bold text-white uppercase tracking-tighter">Pacote Ativo na Loja</span>
                                             </label>
                                         </div>
                                     </div>
                                 </div>

                                 {/* Restrição de Ferramentas */}
                                 <div className="space-y-4">
                                     <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                         <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                             <Settings className="w-4 h-4 text-orange-400"/> Limitar para Ferramentas Específicas
                                         </h4>
                                         <button 
                                            onClick={() => setCurrentCombo({...currentCombo, validForTools: []})}
                                            className="text-[10px] text-gray-500 hover:text-white uppercase font-bold"
                                         >
                                             Remover Todas
                                         </button>
                                     </div>
                                     <p className="text-[11px] text-gray-500 italic leading-relaxed">
                                         Se nenhuma ferramenta for selecionada, os créditos serão de uso global. Se selecionar uma ou mais, os créditos só poderão ser usados nessas ferramentas (ideal para venda de módulos específicos).
                                     </p>

                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                         {SYSTEM_MODULES.map(module => (
                                             <div key={module.id} className="space-y-2">
                                                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-900 p-2 rounded-lg border border-gray-800 flex items-center gap-2">
                                                     {module.icon} {module.label}
                                                 </p>
                                                 <div className="space-y-1 pl-2">
                                                     {module.tools.map(tool => {
                                                         const isSelected = (currentCombo.validForTools || []).includes(tool.id);
                                                         return (
                                                             <label 
                                                                key={tool.id} 
                                                                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                                                    isSelected ? 'bg-orange-500/10 border-orange-500/40 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-500 hover:bg-gray-800 hover:border-gray-600'
                                                                }`}
                                                             >
                                                                 <div className="flex items-center gap-2">
                                                                     <input 
                                                                        type="checkbox" 
                                                                        className="hidden" 
                                                                        checked={isSelected} 
                                                                        onChange={() => toggleToolFilter(tool.id)}
                                                                     />
                                                                     <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'bg-gray-900 border-gray-600'}`}>
                                                                         {isSelected && <CheckCircle className="w-2.5 h-2.5 text-black"/>}
                                                                     </div>
                                                                     <span className="text-xs font-medium">{tool.label}</span>
                                                                 </div>
                                                             </label>
                                                         )
                                                     })}
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-2xl flex gap-4 items-start">
                                     <Brain className="w-6 h-6 text-blue-400 shrink-0 mt-1"/>
                                     <div>
                                         <p className="text-xs text-blue-200 font-bold uppercase mb-1">Nexus IA Auditoria Financeira</p>
                                         <p className="text-[10px] text-blue-100 leading-relaxed opacity-80">
                                             Ao salvar, a IA recalculará a margem de lucro deste pacote baseada no custo médio das ferramentas habilitadas. O sistema impedirá vendas que resultem em margem negativa (Prejuízo).
                                         </p>
                                     </div>
                                 </div>
                             </div>

                             <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex gap-3">
                                 <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Descartar</Button>
                                 <Button onClick={handleSave} className="flex-[2] !bg-green-600 hover:!bg-green-500 font-black uppercase text-sm shadow-lg shadow-green-900/20">
                                     {currentCombo.id ? 'ATUALIZAR PACOTE' : 'PUBLICAR NA LOJA'}
                                 </Button>
                             </div>
                         </motion.div>
                     </div>
                 )}
             </AnimatePresence>
        </div>
    );
};
