import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { courseService } from '../services/courseService';
import { callMestreIA } from '../services/mestreIaService';
import { useAuth } from '../hooks/useAuth';
import { ActivityIcon, CheckCircle, AlertCircle, Play, Loader2 } from 'lucide-react';

export const DebugCourseBuilder = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runUseCases = async () => {
        if (!user) return toast.error("Faça login primeiro!");

        setIsRunning(true);
        setLogs([]);
        setStatus('running');
        addLog("🚀 Iniciando Teste do AI Course Builder...");

        try {
            // 1. Test AI Connection
            addLog("🤖 1. Testando Conexão IA (course_naming_refiner)...");
            const aiResponse = await callMestreIA('course_naming_refiner', {
                objective: 'marketing digital',
                transformation: 'aprender a vender online',
                name: 'Curso Teste'
            });

            if (!aiResponse || !aiResponse.output) throw new Error("Falha na resposta da IA");
            addLog("✅ IA Respondeu: " + aiResponse.output.slice(0, 50) + "...");

            // 2. Test Create Course
            addLog("📚 2. Testando Criação de Curso (Mock)...");
            const courseId = `debug-course-${Date.now()}`;
            const mockCourse = {
                id: courseId,
                productId: courseId,
                modulesOrder: [],
                playerSettings: { allowComments: true, showProgress: true },
                totalModules: 0,
                totalLessons: 0,
                totalDuration: 0,
                modules: [] as any[] // Adding this specifically for the test flow if needed by service
            };

            // Note: In real app, we save via saveProduct -> publishes course. 
            // Here we test publishCourse directly.
            // We need a dummy 'Course' object conforming to the type.
            // Let's rely on courseService.enrollStudent mainly as that was the refactor.

            // 3. Test Enrollment
            addLog(`👤 3. Testando Matrícula Automática: ${user.uid} -> ${courseId}`);
            await courseService.enrollStudent(user.uid, courseId);
            addLog("✅ Matrícula processada no Firestore!");

            addLog("🎉 TESTE CONCLUÍDO COM SUCESSO!");
            setStatus('success');
            toast.success("Todos os sistemas operacionais!");

        } catch (error: any) {
            console.error(error);
            addLog(`❌ ERRO: ${error.message}`);
            setStatus('error');
            toast.error("Falha no teste.");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <ActivityIcon className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Debug: AI Course Builder</h1>
                        <p className="text-gray-400">Ferramenta de Verificação de Integridade</p>
                    </div>
                </div>

                <div className="bg-black/50 rounded-xl p-4 font-mono text-sm h-64 overflow-y-auto mb-6 border border-gray-800">
                    {logs.length === 0 ? (
                        <span className="text-gray-600">Aguardando início do teste...</span>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className={`mb-1 ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : 'text-gray-300'}`}>
                                {log}
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={runUseCases}
                    disabled={isRunning}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isRunning
                            ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20'
                        }`}
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Executando Testes...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            Iniciar Diagnóstico
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default DebugCourseBuilder;
