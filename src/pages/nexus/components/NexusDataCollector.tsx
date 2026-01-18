
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Brain } from '../../../components/Icons';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import toast from 'react-hot-toast';
import { runNexusDataCollection } from '../../../services/mockFirebase';
import { NexusAnalysisResult } from '../../../types';
import { logger } from '../../../services/monitoring';

const NexusDataCollector: React.FC = () => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [analysisResult, setAnalysisResult] = useState<NexusAnalysisResult | null>(null);

    const startCollection = async () => {
        setIsCollecting(true);
        setLogs([]);
        setAnalysisResult(null);
        setProgress(0);

        try {
            const result = await runNexusDataCollection((msg) => {
                setLogs(prev => [msg, ...prev].slice(0, 5));
                setProgress(prev => Math.min(prev + 10, 95));
            });
            setProgress(100);
            setAnalysisResult(result);
            toast.success("Análise de Dados Concluída com Sucesso!", { icon: '📊' });
        } catch (e) {
            logger.error("Erro na coleta de dados Nexus", { error: e });
            toast.error("Erro na coleta de dados.");
        } finally {
            setIsCollecting(false);
        }
    };

    return (
        <Card className="bg-gray-800 border-l-4 border-l-blue-500 p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                        <Database className="w-5 h-5 text-blue-400" /> Coletor de Dados & Performance
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 max-w-lg">
                        A Nexus IA varre o banco de dados em busca de padrões de comportamento, alunos em risco e oportunidades de upsell. Dados anonimizados para segurança.
                    </p>
                </div>
                <Button
                    onClick={startCollection}
                    isLoading={isCollecting}
                    className="!bg-blue-600 hover:!bg-blue-500 !text-xs font-bold"
                >
                    <Search className="w-4 h-4 mr-2" /> Iniciar Varredura Global
                </Button>
            </div>

            {/* Progress & Logs */}
            {isCollecting && (
                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Processando...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <motion.div
                            className="bg-blue-500 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="bg-black/40 p-3 rounded border border-gray-700 font-mono text-[10px] text-gray-400 h-24 overflow-hidden flex flex-col-reverse">
                        {logs.map((log, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                {'>'} {log}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Results Display */}
            <AnimatePresence>
                {analysisResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Total Analisado</p>
                            <p className="text-xl font-black text-white">{analysisResult.totalAnalyzed}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Alunos em Risco</p>
                            <p className="text-xl font-black text-red-400">{analysisResult.highRiskCount}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Alta Performance</p>
                            <p className="text-xl font-black text-green-400">{analysisResult.highPerformanceCount}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">ROI Médio (Base)</p>
                            <p className="text-xl font-black text-blue-400">+{analysisResult.avgROI.toFixed(1)}%</p>
                        </div>

                        <div className="col-span-full mt-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-xs text-blue-200 flex gap-2 items-center">
                            <Brain className="w-4 h-4 flex-shrink-0" />
                            <span>
                                <strong>Insight Nexus:</strong> {analysisResult.highRiskCount > 5 ? 'Detectado alto volume de alunos em risco. Sugiro ativar campanha de "Recuperação" na aba Campanhas Internas.' : 'Base saudável. Sugiro focar em Upsell para os alunos de Alta Performance.'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default NexusDataCollector;
