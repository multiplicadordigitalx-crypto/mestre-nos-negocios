
import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { X as XIcon, Trophy, CheckCircle, Clock, AlertTriangle, TrendingUp } from './Icons';
import { Student } from '../types';

interface LevelDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onRegisterClick: () => void;
}

const LevelDetailModal: React.FC<LevelDetailModalProps> = ({ isOpen, onClose, student, onRegisterClick }) => {
    if (!isOpen) return null;

    const gamification = student.gamification || { level: 'Iniciante', currentSlots: 3, totalVerifiedPosts: 0 };
    const productStats = student.productStats || [];
    
    const nextLevelMap: Record<string, { name: string, target: number }> = {
        'Iniciante': { name: 'Bronze', target: 2250 },
        'Bronze': { name: 'Prata', target: 4500 },
        'Prata': { name: 'Ouro', target: 9000 },
        'Ouro': { name: 'Mestre', target: 18000 },
        'Mestre': { name: 'Lenda', target: 50000 }
    };

    const nextLevel = nextLevelMap[gamification.level];
    const progressPercent = Math.min(100, Math.round((gamification.totalVerifiedPosts / nextLevel.target) * 100));
    const missingPosts = Math.max(0, nextLevel.target - gamification.totalVerifiedPosts);

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 relative shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-brand-primary" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Seu Nível: {gamification.level}</h2>
                            <p className="text-xs text-gray-400">Multiplicador Digital 15X</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6">
                    {/* Progress Section */}
                    <div className="mb-8 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-300 text-sm">Progresso para {nextLevel.name}</span>
                            <span className="font-bold text-brand-primary">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden mb-2">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${progressPercent}%` }} 
                                className="bg-brand-primary h-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{gamification.totalVerifiedPosts} validados</span>
                            <span>Meta: {nextLevel.target}</span>
                        </div>
                        <p className="text-center mt-4 text-sm text-white bg-gray-900/50 py-2 rounded border border-gray-600">
                            Faltam <span className="font-bold text-brand-primary">{missingPosts}</span> postagens validadas para subir de nível! 🚀
                        </p>
                    </div>

                    {/* Product Stats */}
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-400"/> Progresso por Produto
                    </h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {productStats.length === 0 && (
                            <p className="text-gray-500 italic text-sm text-center py-4">Nenhum produto ativo com postagens registradas ainda.</p>
                        )}
                        {productStats.map((stat, idx) => (
                            <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-white">{stat.productName}</h4>
                                    {stat.status === 'verified' ? (
                                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3"/> VERIFICADO
                                        </span>
                                    ) : stat.status === 'pending_verification' ? (
                                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                                            <Clock className="w-3 h-3"/> EM ANÁLISE
                                        </span>
                                    ) : (
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold">
                                            ATIVO
                                        </span>
                                    )}
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full mb-2">
                                    <div 
                                        className={`h-full rounded-full ${stat.status === 'verified' ? 'bg-green-500' : 'bg-blue-500'}`} 
                                        style={{width: `${Math.min(100, (stat.totalPosts / 2250) * 100)}%`}}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{stat.totalPosts} posts registrados</span>
                                    <span>Meta p/ verificar: 2.250</span>
                                </div>
                                {stat.totalPosts >= 2250 && stat.status === 'active' && (
                                    <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3"/> Atingiu a meta! O suporte verificará em breve.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-center">
                        <Button onClick={() => { onClose(); onRegisterClick(); }} className="w-full md:w-auto !py-3 !px-8 text-lg">
                            REGISTRAR POSTAGENS DE HOJE
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LevelDetailModal;
