
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Brain } from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { getStudents, generateStudentActionPlan } from '../../../services/mockFirebase';
import { Student, NexusAction } from '../../../types';

const NexusActionGenerator: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedPlans, setGeneratedPlans] = useState<{name: string, plan: NexusAction[]}[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [targetStudentId, setTargetStudentId] = useState('');

    useEffect(() => {
        getStudents().then(setStudents);
    }, []);

    const handleGenerate = async () => {
        setIsProcessing(true);
        setGeneratedPlans([]);
        
        try {
            // If target selected, generate only for one
            const targets = targetStudentId ? students.filter(s => s.uid === targetStudentId) : students.slice(0, 5); // Limit batch for demo
            
            const results = [];
            for (const student of targets) {
                const plan = await generateStudentActionPlan(student.uid);
                if (plan.length > 0) {
                    results.push({ name: student.displayName || 'Aluno', plan });
                }
            }
            
            setGeneratedPlans(results);
            toast.success(`${results.length} Planos de Ação Gerados e Enviados!`, { icon: '🎯' });

        } catch (e) {
            toast.error("Erro ao gerar planos.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-purple-500 p-6 relative overflow-hidden mt-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <Target className="w-5 h-5 text-purple-400"/> Gerador de Planos de Ação (IA)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-lg">
                        Transforma os dados coletados na Etapa 2 em missões práticas e personalizadas para cada aluno.
                        Foca em resolver gargalos de vendas, engajamento e retenção.
                    </p>
                </div>
                <div className="flex gap-2">
                    <select 
                        className="bg-gray-900 border border-gray-600 rounded-lg px-3 text-xs text-white outline-none"
                        value={targetStudentId}
                        onChange={(e) => setTargetStudentId(e.target.value)}
                    >
                        <option value="">Gerar em Lote (Top 5)</option>
                        {students.map(s => <option key={s.uid} value={s.uid}>{s.displayName}</option>)}
                    </select>
                    <Button 
                        onClick={handleGenerate} 
                        isLoading={isProcessing}
                        className="!bg-purple-600 hover:!bg-purple-500 !text-xs font-bold"
                    >
                        <Brain className="w-4 h-4 mr-2"/> Gerar e Atribuir Missões
                    </Button>
                </div>
            </div>

            {/* Generated Plans Preview */}
            <AnimatePresence>
                {generatedPlans.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                    >
                        <p className="text-xs text-gray-400 font-bold uppercase">Últimos Planos Gerados:</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {generatedPlans.map((item, idx) => (
                                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
                                        <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400 font-bold">
                                            {item.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-bold text-white">{item.name}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {item.plan.map((action, actionIdx) => (
                                            <div key={action.id} className="flex gap-2 items-start">
                                                <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                                    action.category === 'Social Media' ? 'bg-pink-500' :
                                                    action.category === 'Funil' ? 'bg-blue-500' :
                                                    action.category === 'Produto' ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}></div>
                                                <div>
                                                    <p className="text-xs text-gray-300 font-bold">{action.title}</p>
                                                    <p className="text-[10px] text-gray-500 leading-tight">{action.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default NexusActionGenerator;
