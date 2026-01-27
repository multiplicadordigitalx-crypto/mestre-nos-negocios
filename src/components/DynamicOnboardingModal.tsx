import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { CheckCircle, Zap, ShieldCheck, X as XIcon, Brain, ActivityIcon, Target, BookOpen, Globe, Code, HeartPulse } from './Icons';
import { Student, ProducerBankData } from '../types';
import { useNavigate } from 'react-router-dom';

import { generateStudentActionPlan } from '../services/mockFirebase';
import { updateStudent, updateUserProducerData } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import Input from './Input';
import { Step0Compliance, validateDoc } from './ProductWizardModal';

interface DynamicOnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    niche: string;
}

// Configuração dos campos por Nicho (Mantida a original)
const NICHE_FORM_CONFIG: Record<string, {
    title: string;
    icon: any;
    color: string;
    description: string;
    questions: { id: string; label: string; placeholder: string; type: 'text' | 'number' | 'select' | 'textarea'; options?: string[] }[];
}> = {
    'Terapia': {
        title: 'Ficha de Saúde & Contexto',
        icon: ActivityIcon,
        color: 'text-pink-500',
        description: 'Dados para adaptar o protocolo clínico à sua realidade.',
        questions: [
            { id: 'main_pain', label: 'Qual sua principal queixa hoje?', placeholder: 'Ansiedade, Insônia...', type: 'text' },
            { id: 'history', label: 'Histórico Médico/Medicamentos', placeholder: 'Toma algum remédio?', type: 'textarea' },
            { id: 'goal', label: 'O que é "cura" para você?', placeholder: 'Voltar a dormir bem...', type: 'textarea' }
        ]
    },
    'Bem-estar': {
        title: 'Perfil de Bem-estar',
        icon: HeartPulse,
        color: 'text-green-500',
        description: 'Para adaptar sua dieta e treino.',
        questions: [
            { id: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: Perder peso', type: 'select', options: ['Perder Peso', 'Ganhar Massa', 'Saúde', 'Flexibilidade'] },
            { id: 'restrictions', label: 'Restrições Alimentares / Lesões', placeholder: 'Joelho, Vegano...', type: 'text' }
        ]
    },
    'Negócios': {
        title: 'Raio-X do Negócio',
        icon: Target,
        color: 'text-blue-500',
        description: 'Para definir se você precisa de Fundação ou Escala.',
        questions: [
            { id: 'revenue', label: 'Faturamento Mensal Atual', placeholder: 'Ex: 0 ou 5000', type: 'text' },
            { id: 'niche_specific', label: 'Seu Nicho de Mercado', placeholder: 'Ex: E-commerce, Info...', type: 'text' },
            { id: 'biggest_challenge', label: 'Maior Gargalo Hoje', placeholder: 'Não sei vender, Tráfego caro...', type: 'textarea' }
        ]
    },
    'Idiomas': {
        title: 'Nivelamento',
        icon: Globe,
        color: 'text-purple-500',
        description: 'Para definir seu ponto de partida.',
        questions: [
            { id: 'level', label: 'Como você se avalia?', placeholder: '', type: 'select', options: ['Zero Absoluto', 'Entendo mas travo', 'Avançado'] },
            { id: 'goal', label: 'Objetivo Principal', placeholder: 'Viagem, Trabalho...', type: 'text' },
            { id: 'time_available', label: 'Tempo Estudo/Dia', placeholder: 'Ex: 30 min', type: 'text' }
        ]
    },
    'Tecnologia': {
        title: 'Stack & Experiência',
        icon: Code,
        color: 'text-cyan-500',
        description: 'Adaptando os projetos práticos.',
        questions: [
            { id: 'role', label: 'Cargo Atual', placeholder: 'Iniciante, Junior...', type: 'text' },
            { id: 'stack', label: 'Tecnologias que conhece', placeholder: 'React, Node, Python...', type: 'textarea' },
            { id: 'os', label: 'Sistema Operacional', placeholder: '', type: 'select', options: ['Windows', 'Mac', 'Linux'] }
        ]
    },
    'Geral': {
        title: 'Boas-vindas',
        icon: BookOpen,
        color: 'text-yellow-500',
        description: 'Conhecendo você melhor.',
        questions: [
            { id: 'main_goal', label: 'Objetivo com o curso', placeholder: 'Aprender...', type: 'textarea' },
            { id: 'discovery', label: 'Como nos conheceu?', placeholder: 'Instagram...', type: 'text' }
        ]
    }
};

export const DynamicOnboardingModal: React.FC<DynamicOnboardingModalProps> = ({ isOpen, onClose, student, niche }) => {
    const { refreshUser } = useAuth();

    // STEP CONTROL: 1 = Niche Questions, 2 = Compliance Data
    const [step, setStep] = useState(1);

    const [isProcessing, setIsProcessing] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // PRODUCER DATA STATE (For Step 2)
    const [producerData, setProducerData] = useState<ProducerBankData>({
        fullName: student?.displayName || '',
        cpfCnpj: student?.producerData?.cpfCnpj || student?.cpf || '',
        email: student?.producerData?.email || student?.email || '',
        phone: student?.producerData?.phone || '',
        birthDate: student?.producerData?.birthDate || '',
        bank: student?.producerData?.bank || '',
        agency: student?.producerData?.agency || '',
        account: student?.producerData?.account || '',
        pixKey: student?.producerData?.pixKey || '',
        address: student?.producerData?.address || {
            zipCode: '',
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            complement: ''
        },
        isVerified: student?.producerData?.isVerified || false
    });

    // Detect config based on Niche keyword match or default to 'Geral'
    // NOTE: This config is only used for Step 1
    const configKey = Object.keys(NICHE_FORM_CONFIG).find(key => niche.includes(key)) || 'Geral';
    const config = NICHE_FORM_CONFIG[configKey];
    const Icon = config.icon;

    const handleAnswerChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    // Determine if Compliance is Mandatory (Marketing, Sales, Business)
    const isMandatory = configKey === 'Negócios' ||
        niche.toLowerCase().includes('marketing') ||
        niche.toLowerCase().includes('vendas') ||
        niche.toLowerCase().includes('money');

    // STEP 2 Action: Skip Compliance (Only for non-mandatory niches)
    const handleSkip = async () => {
        setIsProcessing(true);
        try {
            // Mark Onboarding as Filled WITHOUT verifying producer data
            await updateStudent(student.uid, {
                onboarding: {
                    filled: true,
                    niche: configKey,
                    answers: answers,
                    updatedAt: new Date().toISOString()
                }
            });
            await refreshUser();
            toast.success("Bem-vindo! Você pode completar seus dados fiscais depois no Perfil.");
            onClose();
        } catch (error) {
            toast.error("Erro ao finalizar.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper for Address (Reused from Profile)
    const handleCepChange = async (val: string) => {
        const cleanCep = val.replace(/\D/g, '').slice(0, 8);
        setProducerData(prev => ({ ...prev, address: { ...prev.address, zipCode: cleanCep } }));
        if (cleanCep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setProducerData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: data.logradouro,
                            district: data.bairro,
                            city: data.localidade,
                            state: data.uf
                        }
                    }));
                }
            } catch (e) { console.error(e); }
        }
    };

    // STEP 1 Action: Validate questions & Go to Compliance
    const handleNextStep = async () => {
        const missing = config.questions.some(q => !answers[q.id]);
        if (missing) return toast.error("Por favor, responda todas as perguntas.");

        setIsProcessing(true);
        try {
            // Save initial answers (but keep filled=false to block access)
            await updateStudent(student.uid, {
                onboarding: {
                    filled: false,
                    niche: configKey,
                    answers: answers,
                    updatedAt: new Date().toISOString()
                }
            });
            // Generate Plan immediately (background)
            await generateStudentActionPlan(student.uid);

            setStep(2); // Move to Compliance
        } catch (error) {
            toast.error("Erro ao salvar respostas.");
        } finally {
            setIsProcessing(false);
        }
    };

    // STEP 2 Action: Save Compliance & Finish
    const handleFinalSave = async () => {
        if (!validateDoc(producerData.cpfCnpj)) return toast.error("CPF ou CNPJ inválido.");
        // if (!producerData.pixKey || !producerData.bank) return toast.error("Preencha todos os dados obrigatórios."); // BANKING IS NOW OPTIONAL
        if (!producerData.address.zipCode) return toast.error("Endereço obrigatório.");

        setIsProcessing(true);
        try {
            // 1. Save Producer Data
            await updateUserProducerData(student.uid, { ...producerData, isVerified: true });

            // 2. Mark Onboarding as Filled (Unlocks the app)
            await updateStudent(student.uid, {
                onboarding: {
                    filled: true,
                    niche: configKey,
                    answers: answers,
                    updatedAt: new Date().toISOString()
                }
            });

            await refreshUser();
            toast.success("Cadastro completo! Acesso liberado.");
            onClose();
        } catch (error) {
            toast.error("Erro ao finalizar cadastro.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
            >
                {/* Header Dinâmico */}
                <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {step === 1 ? (
                                <> <Icon className={`w-6 h-6 ${config.color}`} /> {config.title} </>
                            ) : (
                                <> <ShieldCheck className="w-6 h-6 text-green-500" /> Dados para Recebimento </>
                            )}
                        </h3>
                        {/* Cannot close manually until finished */}
                    </div>
                    <p className="text-sm text-gray-400">
                        {step === 1
                            ? <span>Etapa 1/2: {config.description}</span>
                            : <span>Etapa 2/2: Dados fiscais para emissão de nota e recebimento de comissões.</span>
                        }
                    </p>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step1" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                                {config.questions.map((q, idx) => (
                                    <div key={q.id}>
                                        <label className={`${idx < 2 ? 'text-lg text-white' : 'text-xs text-gray-400'} font-bold uppercase mb-2 block`}>{q.label}</label>
                                        {q.type === 'textarea' ? (
                                            <textarea
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none h-20 resize-none"
                                                placeholder={q.placeholder}
                                                value={answers[q.id] || ''}
                                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                            />
                                        ) : q.type === 'select' ? (
                                            <select
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:border-brand-primary outline-none"
                                                value={answers[q.id] || ''}
                                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                            >
                                                <option value="" disabled>Selecione...</option>
                                                {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <Input
                                                value={answers[q.id] || ''}
                                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                                placeholder={q.placeholder}
                                                type={q.type}
                                                className="!bg-gray-800 border-gray-700 focus:!border-brand-primary"
                                            />
                                        )}
                                    </div>
                                ))}
                                <Button onClick={handleNextStep} isLoading={isProcessing} className="w-full !py-3 font-bold uppercase mt-4">
                                    Próxima Etapa
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">

                                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                                    <div className="bg-amber-500/20 p-2 rounded-lg shrink-0">
                                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-400 font-bold text-sm mb-1">Segurança da Conta</h4>
                                        <p className="text-xs text-amber-200/80 leading-relaxed">
                                            Para o primeiro acesso ao curso, é necessário preencher os dados de segurança da conta e recuperação de login abaixo. Isso garante que você nunca perca seu acesso.
                                        </p>
                                    </div>
                                </div>

                                <Step0Compliance
                                    producerData={producerData}
                                    setProducerData={setProducerData}
                                    handleCepChange={handleCepChange}
                                    handleSaveProducer={() => { }} // Disabled internal save
                                    isProcessing={isProcessing}
                                    showSecurity={false}
                                    hideComplianceBanner={true}
                                    hideSubmitButton={true}
                                    customBeforeBanking={
                                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-4">
                                            <h4 className="text-blue-400 font-bold flex items-center gap-2 text-sm mb-2">
                                                <Brain className="w-4 h-4" /> Por que pedimos isso?
                                            </h4>
                                            <div className="space-y-3">
                                                <p className="text-xs text-blue-200/80 leading-relaxed">
                                                    Para que você possa <strong>vender seus próprios produtos</strong> ou <strong>indicar produtos como afiliado</strong> e receber suas comissões, precisamos desses dados fiscais. Se não pretende vender agora, você pode pular.
                                                </p>
                                                <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-500/20">
                                                    <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">Compliance de Split & Recebimento</p>
                                                    <p className="text-[10px] text-blue-200/70">
                                                        Seus dados reais são obrigatórios para a divisão automática de lucros via MestrePay.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                />
                                <div className="pt-4 border-t border-gray-800 flex flex-col gap-3">
                                    <Button
                                        onClick={handleFinalSave}
                                        isLoading={isProcessing}
                                        className="w-full !py-4 text-white font-black uppercase text-sm !bg-green-600 hover:!bg-green-500 shadow-xl shadow-green-900/20"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" /> Salvar e Acessar Painel
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};