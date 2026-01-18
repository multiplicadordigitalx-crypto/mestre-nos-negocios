
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Search, Cpu, Zap, Users, TrendingUp } from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { runToolAnalysis } from '../../../services/mockFirebase';
import { ToolOptimizationReport } from '../../../types';

const NexusToolOptimizer: React.FC = () => {
    const [report, setReport] = useState<ToolOptimizationReport | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleScan = async () => {
        setIsScanning(true);
        setReport(null);
        setProgress(0);

        // Simulate progress bar
        const interval = setInterval(() => {
            setProgress(prev => {
                if(prev >= 90) return prev;
                return prev + 10;
            });
        }, 100);

        try {
            const data = await runToolAnalysis();
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setReport(data);
                setIsScanning(false);
                toast.success("Varredura de Ferramentas Concluída!");
            }, 500);
        } catch (e) {
            clearInterval(interval);
            setIsScanning(false);
            toast.error("Erro na análise.");
        }
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-yellow-500 p-6 relative overflow-hidden mt-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <Settings className="w-6 h-6 text-yellow-500"/> Otimizador de Ferramentas Nexus (Etapa 6)
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-2xl">
                        A IA correlaciona o ROI dos alunos com o uso das ferramentas do "Mestre IA". Identifica quais cards geram lucro e quais travam o progresso, sugerindo melhorias no sistema ou recomendando trocas de ferramentas aos alunos.
                    </p>
                </div>
                <Button 
                    onClick={handleScan} 
                    isLoading={isScanning}
                    className="!bg-yellow-600 hover:!bg-yellow-500 text-black font-bold !text-xs"
                >
                    <Search className="w-4 h-4 mr-2"/> Analisar Performance das Tools
                </Button>
            </div>

            {/* Scanning Progress */}
            {isScanning && (
                <div className="mb-6 relative z-10">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Analisando logs de uso e tickets...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <motion.div 
                            className="bg-yellow-500 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Report View */}
            <AnimatePresence>
                {report && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10"
                    >
                        {/* Left: System Improvements */}
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase">
                                <Cpu className="w-4 h-4 text-red-400"/> Correções Críticas (Admin)
                            </h4>
                            <div className="space-y-3">
                                {report.systemImprovements.map(imp => (
                                    <div key={imp.id} className="bg-gray-800 p-3 rounded-lg border border-gray-600 hover:border-yellow-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-white bg-gray-700 px-2 py-0.5 rounded">{imp.toolName}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${imp.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {imp.priority}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 mb-1">🔴 {imp.description}</p>
                                        <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500">{imp.affectedStudents} alunos afetados</span>
                                            <span className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                                                <Zap className="w-3 h-3"/> {imp.recommendedAction}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {report.systemImprovements.length === 0 && <p className="text-gray-500 text-xs italic">Nenhuma falha crítica detectada.</p>}
                            </div>
                        </div>

                        {/* Right: Student Refinement */}
                        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase">
                                <Users className="w-4 h-4 text-blue-400"/> Sugestões de Refinamento (Aluno)
                            </h4>
                            <div className="space-y-3">
                                {report.studentRecommendations.map(rec => (
                                    <div key={rec.id} className="bg-gray-800 p-3 rounded-lg border border-gray-600 hover:border-blue-500/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-white">Aluno ID: {rec.studentId}</span>
                                            <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded">Pendente</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                                            <span className="line-through opacity-50">{rec.currentToolId}</span> 
                                            <TrendingUp className="w-3 h-3 text-green-400"/> 
                                            <span className="font-bold text-blue-300">{rec.suggestedToolId}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic">"{rec.reason}"</p>
                                        <div className="mt-2 text-right">
                                             <button className="text-[10px] font-bold text-blue-400 hover:text-white uppercase">Enviar Recomendação →</button>
                                        </div>
                                    </div>
                                ))}
                                {report.studentRecommendations.length === 0 && <p className="text-gray-500 text-xs italic">Nenhuma recomendação necessária.</p>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </Card>
    );
};

export default NexusToolOptimizer;
