import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Course } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Brain, Users, DollarSign, Settings, Globe, Monitor, AlertTriangle, CheckCircle, Clock } from '../../components/Icons';
import { getSchoolConfigByNiche } from '../../services/schoolService';
import { LaunchChecklist } from '../../components/LaunchChecklist';
import { useProducerProducts } from '../../hooks/useEcosystem';
import { AppProduct } from '../../types';

export const ProducerSchoolsPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [schools, setSchools] = useState<AppProduct[]>([]);
    const [schoolForChecklist, setSchoolForChecklist] = useState<AppProduct | null>(null);
    const [activeTab, setActiveTab] = useState<'published' | 'setup'>('published');

    // NEW: Use Ecosystem Hooks
    const { products, loading } = useProducerProducts();
    const [schools, setSchools] = useState<AppProduct[]>([]);

    useEffect(() => {
        if (!loading && products) {
            // Filter products that are "Courses" (Schools)
            // In this new logic, every course product is a "School" entry
            const coursesRequest = products.filter(p => p.deliverableType === 'course');
            setSchools(coursesRequest);
        }
    }, [products, loading]);

    // Filter by Tab
    const displayedSchools = schools.filter(s => {
        if (activeTab === 'published') return s.status === 'active';
        if (activeTab === 'setup') return s.status !== 'active'; // Completed Wizard but not Published
        return false;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-900 border-gray-800 p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-900/20 rounded-xl">
                        <Brain className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Total de Escolas</p>
                        <p className="text-3xl font-black text-white">{schools.length}</p>
                    </div>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-900/20 rounded-xl">
                        <Users className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Alunos Ativos</p>
                        <p className="text-3xl font-black text-white">1,248</p>
                    </div>
                </Card>
                <Card className="bg-gray-900 border-gray-800 p-6 flex items-center gap-4">
                    <div className="p-3 bg-brand-primary/20 rounded-xl">
                        <DollarSign className="w-8 h-8 text-brand-primary" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Receita Mensal</p>
                        <p className="text-3xl font-black text-white">R$ 48.290</p>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div>
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Monitor className="w-6 h-6 text-gray-400" /> Minhas Escolas
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Gerencie suas escolas ativas e termine a configuração das pendentes.</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-gray-900/50 p-1 rounded-xl flex gap-1 border border-gray-800">
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${activeTab === 'published' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Globe className={`w-4 h-4 ${activeTab === 'published' ? 'text-green-400' : ''}`} />
                            Ativas
                            <span className="bg-gray-900 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono">{schools.filter(s => s.status === 'active').length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('setup')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition-all ${activeTab === 'setup' ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Settings className={`w-4 h-4 ${activeTab === 'setup' ? 'text-brand-primary' : ''}`} />
                            Em Setup
                            <span className="bg-gray-900 px-1.5 py-0.5 rounded text-[10px] text-gray-400 font-mono">{schools.filter(s => s.status !== 'active').length}</span>
                        </button>
                    </div>
                </div>

                {displayedSchools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedSchools.map(school => {
                            const config = getSchoolConfigByNiche(school.dna?.alignmentScore ? 'Generic' : 'Generic'); // Fallback
                            const primaryColor = config.theme?.primaryColor || '#FACC15';
                            const isSetup = school.status !== 'active';

                            return (
                                <Card
                                    key={school.id}
                                    className={`p-0 overflow-hidden border transition-all group relative ${isSetup ? 'border-brand-primary/30 hover:border-brand-primary' : 'border-gray-800 hover:border-gray-600'}`}
                                >
                                    <div className="h-32 bg-gray-900 relative overflow-hidden">
                                        {school.coverUrl ? (
                                            <img src={school.coverUrl} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="Capa" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
                                        )}
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-2 py-1 rounded-lg border border-white/10">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isSetup ? 'text-brand-primary' : 'text-white'}`}>
                                                {isSetup ? <Clock className="w-3 h-3" /> : <Globe className="w-3 h-3 text-green-400" />}
                                                {isSetup ? 'Aguardando Setup' : 'Online'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Alert for Critical Failures (Only for Active Schools) */}
                                    {!isSetup && (school as any).stats?.conversionRate < 1 && (
                                        <div
                                            className="absolute top-12 right-4 bg-red-950/90 backdrop-blur px-3 py-2 rounded-xl border border-red-500/50 shadow-xl max-w-[180px] z-20 cursor-pointer hover:bg-red-950 transition-all duration-300 group/alert overflow-hidden h-[34px] hover:h-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigate?.('consultancy');
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider whitespace-nowrap">3 Falhas Críticas</span>
                                            </div>
                                            <div className="opacity-0 group-hover/alert:opacity-100 transition-opacity duration-300 delay-75">
                                                <p className="text-[9px] text-red-300 leading-tight mb-2">
                                                    Sua escola está perdendo faturamento.
                                                </p>
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-white bg-red-500/20 px-2 py-1 rounded border border-red-500/30 group-hover/alert:bg-red-500 group-hover/alert:border-red-500 transition-all">
                                                    CORRIGIR AGORA <span className="text-[8px]">→</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6 relative">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg absolute -top-6 left-6 border-2 border-gray-950"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <Brain className="w-6 h-6 text-black" />
                                        </div>

                                        <div className="mt-4 mb-6">
                                            <h4 className="text-lg font-black text-white leading-tight mb-1 truncate">{school.name}</h4>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{school.schoolSubdomain || 'Não configurado'}</p>
                                        </div>

                                        {isSetup ? (
                                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Progresso do Lançamento</span>
                                                    <span className="text-xs text-brand-primary font-bold">{(school.setupProgress || 0)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${(school as any).setupProgress || 0}%` }}></div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-2">Complete o checklist para publicar.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4 mb-4">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Alunos</p>
                                                    <p className="text-white font-bold">124</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Faturamento</p>
                                                    <p className="text-white font-bold text-green-400">R$ 12k</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                className={`flex-1 !py-2 text-[10px] font-black uppercase border-gray-700 hover:text-white ${isSetup ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary hover:text-black hover:border-brand-primary' : 'text-gray-400'}`}
                                                onClick={() => setSchoolForChecklist(school)}
                                            >
                                                <Settings className="w-4 h-4 mr-2" /> {isSetup ? 'Continuar Setup' : 'Configurações'}
                                            </Button>
                                            {!isSetup && (
                                                <Button className="flex-1 !py-2 text-[10px] font-black uppercase !bg-gray-800 text-white hover:!bg-gray-700">
                                                    Ver Painel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl bg-gray-900/30">
                        {activeTab === 'published' ? (
                            <>
                                <Globe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h4 className="text-gray-400 font-bold text-lg">Nenhuma escola publicada</h4>
                                <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">Suas escolas publicadas aparecerão aqui. Vá para a aba "Em Setup" para finalizar seus lançamentos.</p>
                            </>
                        ) : (
                            <>
                                <Settings className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <h4 className="text-gray-400 font-bold text-lg">Nenhum setup pendente</h4>
                                <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">Tudo organizado! Você não tem escolas aguardando configuração final.</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Checklist Modal */}
            <AnimatePresence>
                {schoolForChecklist && (
                    <LaunchChecklist
                        course={schoolForChecklist as any} // Temporary cast until Checklist supports AppProduct
                        onClose={() => setSchoolForChecklist(null)}
                        onUpdateProgress={async (val) => {
                            // Update local list optimistic
                            setSchools(prev => prev.map(s =>
                                s.id === schoolForChecklist.id ? { ...s, setupProgress: val } : s
                            ));

                            // Also trigger global update if needed (in real app)
                            const all = await getCourses();
                            const target = all.find(c => c.id === schoolForChecklist.id);
                            if (target) {
                                target.setupProgress = val;
                                // In real app we would call updateCourse(target)
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
