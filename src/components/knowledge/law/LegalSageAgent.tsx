import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale, Upload, Mic, Play,
    FileText, CheckCircle, RefreshCw,
    ChevronLeft, Download, Search, AlertCircle,
    Zap, LockClosed, XCircle, LoadingSpinner
} from '../../Icons';
import Button from '../../Button';
import toast from 'react-hot-toast';

interface LegalSageAgentProps {
    onBack: () => void;
}

export const LegalSageAgent: React.FC<LegalSageAgentProps> = ({ onBack }) => {
    // Steps: 0=Config, 1=Processing, 2=Summary (Wait for Exec), 3=Executing, 4=Result
    const [step, setStep] = useState(0);
    const [specialty, setSpecialty] = useState<string>('');
    const [caseDescription, setCaseDescription] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    // Costs
    const [processingCost, setProcessingCost] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const EXECUTION_COST = 45;

    // Modals
    const [showProcessConfirm, setShowProcessConfirm] = useState(false);
    const [showExecutionConfirm, setShowExecutionConfirm] = useState(false);

    const [generatedProcess, setGeneratedProcess] = useState<string | null>(null);

    // Initial Specialties (Expanded)
    const specialties = [
        { id: 'civil', label: 'Direito Civil', icon: '⚖️', desc: 'Contratos, Família, Bens' },
        { id: 'penal', label: 'Direito Penal', icon: '👮', desc: 'Crimes, Defesa' },
        { id: 'trabalho', label: 'Trabalhista', icon: '👷', desc: 'Reclamações, Acordos' },
        { id: 'tributario', label: 'Tributário', icon: '💰', desc: 'Impostos, Execuções' },
        { id: 'consumidor', label: 'Consumidor', icon: '🛒', desc: 'Danos, Vícios, Trocas' },
        { id: 'previdenciario', label: 'Previdenciário', icon: '👴', desc: 'Aposentadoria, Benefícios' },
        { id: 'empresarial', label: 'Empresarial', icon: '💼', desc: 'Societário, Falência' },
        { id: 'ambiental', label: 'Ambiental', icon: '🌳', desc: 'Licenciamento, Multas' },
        { id: 'digital', label: 'Digital', icon: '💻', desc: 'LGPD, Crimes Virtuais' },
        { id: 'constitucional', label: 'Constitucional', icon: '📜', desc: 'Remédios, Direitos Fund.' },
        { id: 'eleitoral', label: 'Eleitoral', icon: '🗳️', desc: 'Campanha, Prestação Contas' },
        { id: 'administrativo', label: 'Administrativo', icon: '🏛️', desc: 'Licitações, Servidores' },
        { id: 'proc_civil', label: 'Proc. Civil', icon: '⚖️', desc: 'Prazos, Recursos, Tutelas' },
        { id: 'proc_penal', label: 'Proc. Penal', icon: '🚓', desc: 'Inquérito, Prisões, Habeas' },
        { id: 'imobiliario', label: 'Imobiliário', icon: '🏢', desc: 'Locação, Usucapião' },
        { id: 'prop_intelectual', label: 'Prop. Intelectual', icon: '💡', desc: 'Marcas, Patentes, Autor' },
        { id: 'internacional', label: 'Internacional', icon: '🌍', desc: 'Tratados, Homologação' },
        { id: 'familia', label: 'Família/Sucessões', icon: '👨‍👩‍👧', desc: 'Divórcio, Herança' },
        { id: 'medico', label: 'Direito Médico', icon: '⚕️', desc: 'Erro Médico, Planos' },
        { id: 'agrario', label: 'Direito Agrário', icon: '🚜', desc: 'Terras, Contratos Rurais' },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            setLinkUrl(''); // Clear link if file uploaded

            // Simulação de cálculo de custo
            const estimatedPages = Math.max(3, Math.ceil(file.size / 1024 / 50));
            const cost = estimatedPages * 1;

            setPageCount(estimatedPages);
            setProcessingCost(cost);

            toast.success(`Documento recebido! Estimativa: ${estimatedPages} páginas.`);
        }
    };

    const recognitionRef = useRef<any>(null);

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            toast.success("Gravação finalizada.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast("Navegador sem suporte ou HTTPS. Usando Simulação...");
            setIsRecording(true);
            setTimeout(() => {
                setIsRecording(false);
                setCaseDescription(prev => (prev ? prev + ' ' : '') + "[Transcrição Simulada: O cliente relatou que houve quebra de contrato abusiva por parte da fornecedora...]");
                toast.success("Áudio transcrito (Simulado)!");
            }, 3000);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setIsRecording(true);
            toast('Ouvindo...', { icon: '🎙️' });
        };

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');

            // For continuous/interim, we might want to be careful not to overwrite partially. 
            // A simple approach for this context is to just update the input with the current finalized transcript + interim.
            // But since we want to *append* to existing text, "continuous" mode is tricky with React state.
            // Simpler approach: Turn off continuous, or handle manual appending.
            // Let's force simple mode:
            // Actually, for "Dictation", we usually want the user to see what they say.
            // Let's use a temp buffer or just direct set (but careful with overwriting previous manual text).

            // Better UX: Just assume the user is dictating a new segment.
            // Or simpler:
            const current = event.results[event.results.length - 1][0].transcript;
            // But React state updates on every word might be glitches.
        };

        // Let's try a robust implementation for "Append"
        recognition.continuous = false; // Easier to manage state
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const lastResult = event.results[event.results.length - 1];
            if (lastResult.isFinal) {
                const text = lastResult[0].transcript;
                setCaseDescription(prev => (prev ? prev + ' ' : '') + text);
            }
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
                toast.error("Permissão de microfone negada.");
            }
        };

        recognition.onend = () => {
            // Loop if we want continuous, but maybe auto-stop is safer for credits/ux
            // Let's just stop.
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    // 1. Request Processing (OCR/Reading)
    const handleRequestProcessing = () => {
        if (!specialty || (!caseDescription && !uploadedFile && !linkUrl)) {
            toast.error("Selecione uma especialidade e forneça o caso (texto, arquivo ou link).");
            return;
        }
        setShowProcessConfirm(true);
    };

    const confirmProcessing = () => {
        setShowProcessConfirm(false);
        setStep(1); // Processing State

        setTimeout(() => {
            setStep(2); // Ready/Summary State
            toast.success("Análise inicial concluída!");
        }, 3000);
    };

    // 2. Request Execution (Generation)
    const handleRequestExecution = () => {
        setShowExecutionConfirm(true);
    };

    const confirmExecution = () => {
        setShowExecutionConfirm(false);
        setStep(3); // Generating State

        setTimeout(() => {
            setGeneratedProcess(`
EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA DO TRABALHO DE SÃO PAULO - SP

[NOME DO RECLAMANTE], qualificado nos autos... vem respeitosamente à presença de Vossa Excelência...

DA NULIDADE DA JUSTA CAUSA
A reclamada aplicou a penalidade máxima de justa causa sem observar os requisitos de gradação da pena e imediatidade...

DA JURISPRUDÊNCIA / TESES
Conforme entendimento consolidado do TST na Súmula XXX, a ausência de inquérito para apuração...

DOS PEDIDOS
a) A reversão da justa causa...
b) O pagamento das verbas rescisórias...

[IA NOTE: Analisei 43 casos similares no TRT-2. A tese de 'Perdão Tácito' tem 78% de chance de êxito neste contexto.]
            `);
            setStep(4); // Finished State
            toast.success("Processo gerado com sucesso!");
        }, 4000);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col relative h-auto">

            {/* Header */}
            <div className="bg-gray-950/80 p-6 border-b border-gray-800 flex items-center justify-center relative backdrop-blur-md sticky top-0 z-20">
                <div className="absolute left-6">
                    <Button onClick={onBack} className="!p-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2 tracking-tight">
                        🦉 O Sábio
                    </h2>
                    <p className="text-sm text-gray-400 font-medium tracking-wide bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">Agente Jurídico</p>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 md:p-10 relative">

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none"></div>

                <AnimatePresence mode="wait">

                    {/* STEP 0: CONFIGURATION */}
                    {step === 0 && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="max-w-4xl mx-auto space-y-8 relative z-10"
                        >
                            {/* 1. Select Specialty */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-xs font-bold">1</span>
                                    Escolha a Especialidade (Abrangente)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {specialties.map(spec => (
                                        <div
                                            key={spec.id}
                                            onClick={() => setSpecialty(spec.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${specialty === spec.id ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'}`}
                                        >
                                            <div className="text-xl mb-1">{spec.icon}</div>
                                            <div className="font-bold text-xs text-white truncate">{spec.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Input Data */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase text-gray-500 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-blue-500 text-black flex items-center justify-center text-xs font-bold">2</span>
                                    Alimentar o Agente
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Text Input */}
                                    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col h-full">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-gray-300">Descreva o Caso / Tese</label>
                                            <button
                                                onClick={toggleRecording}
                                                className={`text-xs flex items-center gap-1 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                <Mic className="w-3 h-3" /> {isRecording ? 'Gravando...' : 'Falar'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={caseDescription}
                                            onChange={(e) => setCaseDescription(e.target.value)}
                                            className="w-full h-full min-h-[150px] bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:border-blue-500 outline-none resize-none placeholder-gray-600"
                                            placeholder="Ex: Cliente comprou um imóvel na planta..."
                                        />
                                    </div>

                                    {/* File/Link Input */}
                                    <div className="flex flex-col gap-4">
                                        {/* Upload Box */}
                                        <div className="bg-gray-800/50 border border-gray-700 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center relative hover:bg-gray-800/80 transition-colors flex-1">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.png,.jpg,.jpeg"
                                            />
                                            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                                {uploadedFile ? <CheckCircle className="w-6 h-6 text-green-500" /> : <Upload className="w-6 h-6 text-gray-400" />}
                                            </div>
                                            <h4 className="font-bold text-white text-sm mb-1">{uploadedFile ? 'Arquivo Recebido' : 'Arraste documentos'}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{uploadedFile ? uploadedFile.name : 'PDFs ou Imagens (OCR)'}</p>

                                            {uploadedFile && (
                                                <div className="mt-2 bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30 text-[10px] text-blue-200">
                                                    Est. Páginas: <strong>{pageCount}</strong> • Custo: <strong className='text-yellow-400'>{processingCost} Créditos</strong>
                                                </div>
                                            )}

                                            {uploadedFile && <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setProcessingCost(0); }} className="relative z-10 text-[10px] text-red-400 hover:underline mt-2">Remover</button>}
                                        </div>

                                        {/* Link Toggle */}
                                        {!showLinkInput ? (
                                            <button onClick={() => setShowLinkInput(true)} className="text-xs text-blue-400 hover:text-blue-300 underline">+ Inserir Link (GDrive, Dropbox)</button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={linkUrl}
                                                    onChange={(e) => setLinkUrl(e.target.value)}
                                                    placeholder="Cole o link do PDF/Doc..."
                                                    className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white w-full focus:border-blue-500 outline-none"
                                                />
                                                <button onClick={() => setShowLinkInput(false)} className="text-gray-500 hover:text-white"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-8 pb-8 md:pb-0 flex flex-col md:flex-row justify-center md:justify-end gap-3">
                                <Button
                                    onClick={handleRequestProcessing}
                                    className="w-full md:w-auto !bg-blue-600 hover:!bg-blue-500 !px-10 !py-4 text-lg font-bold shadow-xl shadow-blue-500/20"
                                >
                                    <Zap className="w-5 h-5 mr-2" /> Iniciar Processamento
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* CONFIRMATION MODALS */}
                    {showProcessConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                                <div className="flex items-center gap-3 text-yellow-500 mb-2">
                                    <AlertCircle className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-white">Confirmação de Custo</h3>
                                </div>
                                <p className="text-sm text-gray-300">
                                    Esta ação iniciará a leitura e estruturação dos dados. O custo será debitado da sua carteira.
                                </p>
                                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Processamento (IA):</span>
                                        <span className="text-white font-mono">{processingCost > 0 ? processingCost : '0'} Créditos</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
                                        <span>Saldo Atual:</span>
                                        <span className="text-green-400">1.250 Créditos</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowProcessConfirm(false)} className="flex-1 !bg-gray-800 hover:!bg-gray-700">Cancelar</Button>
                                    <Button onClick={confirmProcessing} className="flex-1 !bg-green-600 hover:!bg-green-500">Confirmar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showExecutionConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
                                <div className="flex items-center gap-3 text-blue-500 mb-2">
                                    <Zap className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-white">Gerar Documento Final</h3>
                                </div>
                                <p className="text-sm text-gray-300">
                                    A análise foi concluída. Confirmar a geração completa da peça jurídica baseada na tese estruturada?
                                </p>
                                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Execução (IA):</span>
                                        <span className="text-white font-mono">{EXECUTION_COST} Créditos</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button onClick={() => setShowExecutionConfirm(false)} className="flex-1 !bg-gray-800 hover:!bg-gray-700">Cancelar</Button>
                                    <Button onClick={confirmExecution} className="flex-1 !bg-blue-600 hover:!bg-blue-500">Gerar Agora</Button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* STEP 1: PROCESSING LOADING */}
                    {step === 1 && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full pt-20"
                        >
                            <LoadingSpinner className="w-16 h-16 text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Lendo Documentos...</h3>
                            <p className="text-sm text-gray-500">Extraindo texto e identificando padrões</p>
                        </motion.div>
                    )}

                    {/* STEP 2: SUMMARY (Wait for Execution) */}
                    {step === 2 && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto space-y-6 pt-10"
                        >
                            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Análise Concluída</h3>
                                        <p className="text-sm text-gray-400">O Sábio estruturou os seguintes pontos:</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-300 mb-6">
                                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">●</span> Identificada tese de nulidade de justa causa.</li>
                                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">●</span> 3 Documentos processados ({pageCount} páginas).</li>
                                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">●</span> Jurisprudência do TRT-2 localizada (78% favorável).</li>
                                </ul>

                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 text-yellow-200 text-xs mb-6">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>Para redigir a peça completa com os argumentos jurídicos e a jurisprudência, será necessário executar a geração final.</p>
                                </div>

                                <Button
                                    onClick={handleRequestExecution}
                                    className="w-full !py-4 !bg-blue-600 hover:!bg-blue-500 text-lg shadow-lg shadow-blue-500/20"
                                >
                                    Gerar Peça Completa
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: EXECUTING */}
                    {step === 3 && (
                        <motion.div
                            key="executing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-full pt-20"
                        >
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-purple-500 border-b-purple-900 border-l-purple-900 rounded-full animate-spin"></div>
                                <div className="absolute inset-4 bg-gray-900 rounded-full flex items-center justify-center text-4xl animate-pulse">🦉</div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Escrevendo Peça...</h3>
                            <p className="text-gray-500 text-sm">Validando precedentes e argumentos</p>
                        </motion.div>
                    )}


                    {/* STEP 4: RESULT */}
                    {step === 4 && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/30 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Processo Gerado
                                    </div>
                                    <span className="text-xs text-gray-500">Há 2 segundos</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="!p-2 !bg-gray-800 border border-gray-700 hover:!bg-gray-700" title="Editar com IA">
                                        <Mic className="w-4 h-4" />
                                    </Button>
                                    <Button className="!py-2 !px-4 !bg-blue-600 hover:!bg-blue-500 text-xs font-bold shadow-lg shadow-blue-500/20">
                                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 bg-white text-black rounded-lg shadow-2xl p-8 overflow-y-auto font-serif leading-relaxed text-sm whitespace-pre-wrap border-2 border-gray-300">
                                {generatedProcess}
                            </div>

                            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                                <span>Tokens usados: 2.340</span>
                                <button onClick={() => setStep(0)} className="hover:text-white underline">Novo Processo</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
