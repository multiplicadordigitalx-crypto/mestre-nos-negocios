
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import { DollarSign, Users, TrendingUp, Activity, MessageSquare } from '../../components/Icons';

export const ProducerOverviewPage: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Content */}
            <div className="flex flex-col gap-2">
                <h2 className="text-xl text-gray-400 font-medium">Balanço Geral</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col justify-between hover:border-brand-primary/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">+12%</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Faturamento Total</p>
                            <p className="text-2xl font-black text-white mt-1">R$ 142.390</p>
                            <p className="text-[10px] text-gray-500 mt-1">Últimos 30 dias</p>
                        </div>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col justify-between hover:border-blue-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full font-bold">+48</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total de Alunos</p>
                            <p className="text-2xl font-black text-white mt-1">3,892</p>
                            <p className="text-[10px] text-gray-500 mt-1">Ativos na plataforma</p>
                        </div>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col justify-between hover:border-purple-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                <Activity className="w-6 h-6 text-purple-500" />
                            </div>
                            <span className="text-[10px] bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full font-bold">98%</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Taxa de Conclusão</p>
                            <p className="text-2xl font-black text-white mt-1">76%</p>
                            <p className="text-[10px] text-gray-500 mt-1">Média das escolas</p>
                        </div>
                    </Card>

                    <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col justify-between hover:border-orange-500/50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                <MessageSquare className="w-6 h-6 text-orange-500" />
                            </div>
                            <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full font-bold">Novo</span>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Suporte</p>
                            <p className="text-2xl font-black text-white mt-1">12</p>
                            <p className="text-[10px] text-gray-500 mt-1">Tickets abertos</p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg text-white font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-400" /> Atividade Recente
                    </h3>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-200">Nova Venda: <span className="text-white font-bold">Mestre nos Negócios</span></p>
                                <p className="text-xs text-green-400 font-bold">+ R$ 497,00</p>
                            </div>
                            <span className="text-xs text-gray-600">agora</span>
                        </div>
                        <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-200">Nova Venda: <span className="text-white font-bold">Mentoria High Ticket</span></p>
                                <p className="text-xs text-green-400 font-bold">+ R$ 997,00</p>
                            </div>
                            <span className="text-xs text-gray-600">há 5min</span>
                        </div>
                        <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30">
                                <Activity className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-200">Solicitação de Reembolso</p>
                                <p className="text-xs text-red-400">Motivo: "Não era o que eu esperava"</p>
                            </div>
                            <span className="text-xs text-gray-600">há 2h</span>
                        </div>
                        <div className="p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-200">Nova Venda: <span className="text-white font-bold">Imersão IA</span></p>
                                <p className="text-xs text-green-400 font-bold">+ R$ 297,00</p>
                            </div>
                            <span className="text-xs text-gray-600">há 3h</span>
                        </div>
                    </div>
                </div>

                {/* Notifications / Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg text-white font-bold">Ações Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-4 bg-gradient-to-r from-purple-900/50 to-purple-900/20 border border-purple-500/30 rounded-xl hover:border-purple-500 transition-all group">
                            <p className="text-purple-300 font-bold text-xs uppercase mb-1 group-hover:text-white">Live Class</p>
                            <h4 className="text-white font-bold">Iniciar Transmissão</h4>
                        </button>
                        <button className="w-full text-left p-4 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all">
                            <h4 className="text-gray-300 text-sm font-bold">Enviar Broadcast</h4>
                        </button>
                        <button
                            onClick={() => window.location.href = '/app/create_course'}
                            className="w-full text-left p-4 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-all"
                        >
                            <h4 className="text-gray-300 text-sm font-bold">Criar Novo Curso</h4>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
