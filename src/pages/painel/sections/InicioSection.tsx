import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// Hooks & Types
import { useAlunoData } from '../../../hooks/useAlunoData';
import { submitDailyProductStats, getCoursesByIds } from '../../../services/mockFirebase';
import { StudentPage, Course } from '../../../types';

// Components
import { DashboardHeader } from '../../dashboard/components/DashboardHeader';
import { RenewalBanner } from '../../dashboard/components/RenewalBanner';
import { LaunchpadGrid } from '../../dashboard/components/LaunchpadGrid';
import { ActiveProductsList } from '../../dashboard/components/ActiveProductsList';
import DailyCheckinModal from '../../../components/DailyCheckinModal';
import LevelDetailModal from '../../../components/LevelDetailModal';
import CampaignBanner from '../../../components/CampaignBanner';
import { Target, CheckCircle } from '../../../components/Icons'; 
import { motion } from 'framer-motion';
import { DynamicOnboardingModal } from '../../../components/DynamicOnboardingModal';

interface InicioSectionProps {
    navigateTo: (page: StudentPage) => void;
}

export const InicioSection: React.FC<InicioSectionProps> = ({ navigateTo }) => {
    const { student, subscriptionStatus, actions } = useAlunoData();
    const [isCheckinOpen, setIsCheckinOpen] = useState(false);
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    
    // Lógica para detecção de White Label / Onboarding Dinâmico
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [detectedNiche, setDetectedNiche] = useState('Geral');

    useEffect(() => {
        const checkOnboarding = async () => {
            if (student && student.purchasedCourses && student.purchasedCourses.length > 0) {
                // Se já preencheu, ignora (Verifica flag antiga anamnese ou nova onboarding)
                if (student.onboarding?.filled || student.anamnese?.filled) return;

                // Busca detalhes dos cursos comprados para achar o nicho
                // Simulação: Na prática, isso viria do backend, aqui buscamos mock
                // Vamos tentar inferir pelo ID ou buscar o objeto completo
                const courses = await getCoursesByIds(student.purchasedCourses);
                
                // Prioridade de detecção: Pega o primeiro curso que tenha um nicho definido
                const targetCourse = courses.find(c => c.niche) || courses[0];
                
                if (targetCourse) {
                    // Mapeia IDs ou Nichos para Categorias do Modal
                    let niche = 'Geral';
                    const lowerNiche = (targetCourse.niche || targetCourse.id).toLowerCase();

                    if (lowerNiche.includes('therapy') || lowerNiche.includes('terapia') || lowerNiche.includes('psicologia')) niche = 'Terapia';
                    else if (lowerNiche.includes('slimming') || lowerNiche.includes('emagrecimento') || lowerNiche.includes('fitness')) niche = 'Bem-estar';
                    else if (lowerNiche.includes('business') || lowerNiche.includes('negocios') || lowerNiche.includes('vendas')) niche = 'Negócios';
                    else if (lowerNiche.includes('code') || lowerNiche.includes('programacao') || lowerNiche.includes('tech')) niche = 'Tecnologia';
                    else if (lowerNiche.includes('english') || lowerNiche.includes('idiomas')) niche = 'Idiomas';

                    setDetectedNiche(niche);
                    setShowOnboarding(true);
                }
            }
        };
        checkOnboarding();
    }, [student]);

    const handleDailySubmit = async (count: number, product: string) => {
        if (!student) return;
        await submitDailyProductStats(student.uid, product, count);
        toast.success("Produção registrada com sucesso!");
    };

    return (
        <div className="space-y-6 relative min-h-[calc(100vh-100px)]">
            <DashboardHeader 
                user={student} 
                navigateTo={navigateTo} 
                onCheckIn={() => navigateTo('my_results')}
                onOpenLevel={() => setIsLevelModalOpen(true)}
            />

            {student && <CampaignBanner user={student} />}

            {/* NEXUS ACTION PLAN (STAGE 3) */}
            {student?.nexusActionPlan && student.nexusActionPlan.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-900/20 border-l-4 border-purple-500 rounded-xl p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" /> Plano de Ação Personalizado (Nexus AI)
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">A IA analisou seu perfil e sugeriu os próximos passos para acelerar seus resultados.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        {student.nexusActionPlan.map(action => (
                            <div key={action.id} className="bg-gray-900/80 p-4 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                        action.category === 'Social Media' ? 'bg-pink-500/20 text-pink-400' :
                                        action.category === 'Funil' ? 'bg-blue-500/20 text-blue-400' :
                                        action.category === 'Produto' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>{action.category}</span>
                                    <span className="text-[10px] text-gray-500">{new Date(action.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-white font-bold text-sm mb-1">{action.title}</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">{action.description}</p>
                                <button className="mt-3 text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3"/> Marcar como Feito
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {subscriptionStatus.isRenewPeriod && (
                <RenewalBanner 
                    daysRemaining={subscriptionStatus.daysRemaining} 
                    onOpenRenewal={() => {}} // Passar handler se necessário
                />
            )}

            <LaunchpadGrid 
                user={student}
                navigateTo={navigateTo}
                onCheckIn={() => setIsCheckinOpen(true)}
                onOpenLevel={() => setIsLevelModalOpen(true)}
            />

            <ActiveProductsList student={student} navigateTo={navigateTo} />

            <DailyCheckinModal 
                isOpen={isCheckinOpen} 
                onClose={() => setIsCheckinOpen(false)} 
                onSubmit={handleDailySubmit} 
            />
            
            {student && (
                <LevelDetailModal 
                    isOpen={isLevelModalOpen}
                    onClose={() => setIsLevelModalOpen(false)}
                    student={student}
                    onRegisterClick={() => {
                        setIsLevelModalOpen(false);
                        setIsCheckinOpen(true);
                    }}
                />
            )}

            {/* Modal de Onboarding Dinâmico (Substitui Anamnese) */}
            {student && showOnboarding && (
                <DynamicOnboardingModal 
                    isOpen={showOnboarding}
                    onClose={() => setShowOnboarding(false)}
                    student={student}
                    niche={detectedNiche}
                />
            )}
        </div>
    );
};