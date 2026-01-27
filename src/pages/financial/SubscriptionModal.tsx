import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, RefreshCw, AlertTriangle, CheckCircle, ShieldOff } from '../../components/Icons';
import { User, UserSubscription } from '../../types/legacy';
import { updateStudent } from '../../services/userService';
import { paymentService } from '../../services/paymentService'; // [NEW]
import { toast } from 'react-hot-toast';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const subscriptions = user.activeSubscriptions || [];

    const handleToggleAutoRenew = async (sub: UserSubscription) => {
        setLoading(true);
        try {
            // Em produção, chamaria API real
            const updatedSubs = user.activeSubscriptions?.map(s => {
                if (s.id === sub.id) {
                    return { ...s, autoRenew: !s.autoRenew };
                }
                return s;
            });

            await updateStudent(user.uid, { activeSubscriptions: updatedSubs });

            // Hack para atualizar estado local se não usar context global reativo
            if (user.activeSubscriptions) {
                const target = user.activeSubscriptions.find(s => s.id === sub.id);
                if (target) target.autoRenew = !target.autoRenew;
            }

            toast.success(`Renovação automática ${!sub.autoRenew ? 'DESATIVADA' : 'ATIVADA'}`);
        } catch (error) {
            toast.error("Erro ao atualizar assinatura.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('pt-BR');
    };

    const getDaysRemaining = (expiry: string) => {
        const diff = new Date(expiry).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Minhas Assinaturas</h2>
                                <p className="text-sm text-gray-400">Gerencie seus planos mensais recorrentes</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {subscriptions.length === 0 ? (
                            <div className="text-center py-10">
                                <ShieldOff className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Você não possui assinaturas ativas no momento.</p>
                            </div>
                        ) : (
                            subscriptions.map(sub => {
                                const daysLeft = getDaysRemaining(sub.expiresAt);
                                const isExpired = daysLeft < 0;
                                const isWarning = daysLeft < 3 && !isExpired;

                                return (
                                    <div key={sub.id} className={`border rounded-xl p-5 transition-all ${isExpired ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-800/40 border-gray-700'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-12 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{sub.planName}</h3>
                                                    <p className="text-xs text-gray-400 font-mono uppercase">{sub.toolId}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isExpired ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'}`}>
                                                {isExpired ? 'EXPIRADO' : 'ATIVO'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                <p className="text-gray-500 text-xs mb-1">Custo Mensal</p>
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                                    {sub.cost} Créditos
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                <p className="text-gray-500 text-xs mb-1">Vencimento</p>
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <Calendar className="w-4 h-4 text-blue-400" />
                                                    {formatDate(sub.expiresAt)}
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 flex flex-col justify-center">
                                                <p className="text-gray-500 text-xs mb-1">Status</p>
                                                {isExpired ? (
                                                    <span className="text-red-400 text-sm font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Venceu</span>
                                                ) : (
                                                    <span className="text-gray-300 text-sm">{daysLeft} dias restantes</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-700/50 pt-4 mt-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${sub.autoRenew ? 'bg-green-500' : 'bg-gray-600'}`} onClick={() => handleToggleAutoRenew(sub)}>
                                                    <motion.div
                                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                                        animate={{ x: sub.autoRenew ? 16 : 0 }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-300">Renovação Automática</span>
                                            </div>

                                            {isExpired && (
                                                <button className="text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-900/20">
                                                    <RefreshCw className="w-3 h-3" />
                                                    RENOVAR AGORA
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-center">
                        <p className="text-xs text-gray-500">
                            <AlertTriangle className="w-3 h-3 inline mr-1 text-yellow-500" />
                            A renovação automática debita créditos do seu saldo no dia do vencimento. Mantenha seu saldo positivo para evitar interrupções.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
