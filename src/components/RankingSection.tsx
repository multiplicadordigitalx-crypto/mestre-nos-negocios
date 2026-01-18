
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Users, Activity, X as XIcon } from './Icons';
import Card from './Card';
import Button from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { getTeamRankings } from '../services/mockFirebase';
import { SalesPerson } from '../types';

interface RankingSectionProps {
    title?: string;
    className?: string;
}

const RankingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    type: 'general' | 'team' | 'internal';
    data: any[];
    title: string;
}> = ({ isOpen, onClose, type, data, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 w-full max-w-3xl rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[85vh]"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                    <h3 className="font-bold text-white text-xl flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-400" /> {title} (Completo)
                    </h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400 hover:text-white" /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700 text-gray-300 uppercase text-xs font-bold sticky top-0">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Posição</th>
                                <th className="px-4 py-3">{type === 'team' ? 'Equipe' : 'Vendedor'}</th>
                                {type === 'team' && <th className="px-4 py-3 text-center">Membros</th>}
                                <th className="px-4 py-3 text-right rounded-tr-lg">Total Vendas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700 bg-gray-800/50">
                            {data.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-white w-20">
                                        {idx + 1}º
                                        {idx < 3 && <span className="ml-2 text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-white font-medium">
                                        {type === 'team' ? item.name : item.displayName}
                                    </td>
                                    {type === 'team' && (
                                        <td className="px-4 py-3 text-center text-gray-400">{item.members}</td>
                                    )}
                                    <td className="px-4 py-3 text-right font-bold text-green-400">
                                        R$ {(type === 'team' ? item.revenue : item.revenueToday).toLocaleString('pt-BR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900/30 text-right">
                    <Button onClick={onClose}>Fechar Ranking</Button>
                </div>
            </motion.div>
        </div>
    );
};

const RankingSection: React.FC<RankingSectionProps> = ({ title = "Rankings de Performance", className = "" }) => {
    const [loading, setLoading] = useState(true);
    const [generalRanking, setGeneralRanking] = useState<SalesPerson[]>([]);
    const [teamRanking, setTeamRanking] = useState<{ name: string, revenue: number, members: number }[]>([]);
    const [internalRankings, setInternalRankings] = useState<Record<string, SalesPerson[]>>({});

    // Modal State
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'general' | 'team' | 'internal', data: any[], title: string }>({
        isOpen: false, type: 'general', data: [], title: ''
    });

    const refreshData = () => {
        // Silent update if already loaded once to avoid visual flickering
        if (generalRanking.length === 0) setLoading(true);

        getTeamRankings().then(data => {
            setGeneralRanking(data.generalRanking);
            setTeamRanking(data.teamRanking);
            setInternalRankings(data.internalRankings);
            setLoading(false);
        });
    };

    // Auto-refresh interval for "real-time" feel - Increased to 60s to be less distracting
    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 60000); // Poll every 60s
        return () => clearInterval(interval);
    }, []);

    const openModal = (type: 'general' | 'team' | 'internal', data: any[], title: string) => {
        setModalConfig({ isOpen: true, type, data, title });
    };

    if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-brand-primary" />
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ranking Geral Card (Summary) */}
                <Card className="bg-gray-800 border-gray-700 overflow-hidden h-full flex flex-col shadow-lg">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Ranking Geral</h3>
                        <Button className="!py-1 !text-xs" onClick={() => openModal('general', generalRanking, 'Ranking Geral de Vendedores')}>Ver Completo</Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Vendedor</th><th className="px-4 py-3 text-right">Vendas</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {generalRanking.slice(0, 5).map((agent, idx) => (
                                    <tr key={agent.uid} className="hover:bg-gray-700/30 cursor-pointer" onClick={() => openModal('general', generalRanking, 'Ranking Geral')}>
                                        <td className={`px-4 py-3 font-bold ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{idx + 1}º</td>
                                        <td className="px-4 py-3 text-white">{agent.displayName}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-400">R$ {agent.revenueToday.toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                                {generalRanking.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-500">Sem dados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Ranking de Equipes Card (Summary) */}
                <Card className="bg-gray-800 border-gray-700 overflow-hidden h-full flex flex-col shadow-lg">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> Ranking de Equipes</h3>
                        <Button className="!py-1 !text-xs" onClick={() => openModal('team', teamRanking, 'Ranking de Equipes')}>Ver Completo</Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Equipe</th><th className="px-4 py-3 text-center">Membros</th><th className="px-4 py-3 text-right">Total</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {teamRanking.slice(0, 5).map((team, idx) => (
                                    <tr key={idx} className="hover:bg-gray-700/30 cursor-pointer" onClick={() => openModal('team', teamRanking, 'Ranking de Equipes')}>
                                        <td className={`px-4 py-3 font-bold ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{idx + 1}º</td>
                                        <td className="px-4 py-3 text-white font-bold">{team.name}</td>
                                        <td className="px-4 py-3 text-center text-gray-400">{team.members}</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-400">R$ {team.revenue.toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))}
                                {teamRanking.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">Sem dados.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Ranking Interno (Meu Time) - NEW CARD */}
                <Card className="bg-gray-800 border-gray-700 overflow-hidden h-full flex flex-col shadow-lg">
                    <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Ranking Interno</h3>
                        <Button className="!py-1 !text-xs" onClick={() => {
                            const firstTeamName = Object.keys(internalRankings)[0];
                            if (firstTeamName) openModal('internal', internalRankings[firstTeamName], `Ranking Interno: ${firstTeamName}`);
                        }}>Ver Time</Button>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                                <tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Vendedor</th><th className="px-4 py-3 text-right">Total</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {Object.keys(internalRankings).length > 0 ? (
                                    internalRankings[Object.keys(internalRankings)[0]].slice(0, 5).map((m, idx) => (
                                        <tr key={m.uid} className="hover:bg-gray-700/30 cursor-pointer"
                                            onClick={() => openModal('internal', internalRankings[Object.keys(internalRankings)[0]], `Ranking Interno: ${Object.keys(internalRankings)[0]}`)}>
                                            <td className={`px-4 py-3 font-bold ${idx < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{idx + 1}º</td>
                                            <td className="px-4 py-3 text-white">{m.displayName}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-400">R$ {m.revenueToday.toLocaleString('pt-BR')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">Você não via equipe.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Internal Ranking Modal Logic remains below */}

            <RankingModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                type={modalConfig.type}
                data={modalConfig.data}
                title={modalConfig.title}
            />
        </div>
    );
};

export default RankingSection;
