
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { StudentPage } from '../types';
import { StudentHeader } from '../components/StudentHeader';
import { StudentSidebar } from '../components/layout/StudentSidebar';
import { MessageCircle, Eye } from '../components/Icons';
import Button from '../components/Button';
import { PainelDoAluno } from '../pages/painel/PainelDoAluno';

import { DynamicOnboardingModal } from '../components/DynamicOnboardingModal';
import { getSchoolSettings } from '../services/mockFirebase';
import { SchoolConfig } from '../types';
import { getAllowedPagesForStudent } from '../config/whiteLabel';
import { Student } from '../types';
import { getCoursesByIds } from '../services/mockFirebase'; // Import

export const StudentLayout: React.FC = () => {
    const { user, isImpersonating, stopImpersonation } = useAuth();
    const [history, setHistory] = useState<StudentPage[]>(['dashboard']);
    const activePage = history[history.length - 1];

    const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null);
    const [purchasedCoursesData, setPurchasedCoursesData] = useState<any[]>([]); // New State

    React.useEffect(() => {
        const loadCourses = async () => {
            const student = user as Student;
            if (student?.purchasedCourses?.length) {
                const courses = await getCoursesByIds(student.purchasedCourses);
                setPurchasedCoursesData(courses);
            }
        };
        loadCourses();
    }, [user]);

    // White Label: Calculate Allowed Pages
    const visiblePages = React.useMemo(() => {
        // If IMPERSONATING, matched to student being impersonated? 
        // Logic already fetches based on 'user' (which is the impersonated student if set).
        return Array.from(getAllowedPagesForStudent(purchasedCoursesData));
    }, [purchasedCoursesData]);

    React.useEffect(() => {
        const loadSchool = async () => {
            // ... existing logic
            if (user?.uid) {
                const config = await getSchoolSettings(user.uid);
                if (config) setSchoolConfig(config);
            }
        };
        loadSchool();
    }, [user]);

    // Redirect if current page is not allowed
    React.useEffect(() => {
        if (visiblePages.length > 0 && !visiblePages.includes(activePage)) {
            console.warn(`Redirecting from unauthorized page: ${activePage}`);
            // Allow 'dashboard' always just in case common list failed? 
            // Common list already includes dashboard.

            // BUT: wait for initial load? unique case?
            // Only redirect if we are SURE config is loaded or default safe list exists.
            // Our config has defaults, so safe.

            if (activePage !== 'dashboard') {
                setHistory(prev => ['dashboard']);
            }
        }
    }, [activePage, visiblePages]);

    const [supportBadge, setSupportBadge] = useState(1);

    const navigateTo = (page: StudentPage) => {
        if (page === 'producer_dashboard') {
            window.location.href = '/producer';
            return;
        }

        // Guard: Prevent navigation to hidden pages
        if (visiblePages.length > 0 && !visiblePages.includes(page)) {
            // Maybe show toast?
            console.log("Blocked navigation to", page);
            return;
        }

        if (page === activePage) return;
        setHistory(prev => [...prev, page]);
        if (page === 'support') setSupportBadge(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        if (history.length > 1) {
            setHistory(prev => prev.slice(0, -1));
        }
    };

    // CHECK ONBOARDING STATUS
    const needsOnboarding = user && !user.onboarding?.filled && !isImpersonating && user.role === 'student';

    if (needsOnboarding) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-[9999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                <div className="relative z-10 w-full max-w-lg text-center">
                    <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                        <span className="text-brand-primary">Cadastro</span> Pendente
                    </h1>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Para liberar seu acesso ao Painel do Aluno e Ferramentas, precisamos personalizar sua experiência.
                    </p>

                    {/* Force Modal Open */}
                    <DynamicOnboardingModal
                        isOpen={true}
                        onClose={() => { }} // Cannot close until finished
                        student={user as any}
                        niche="Geral" // Default to generic, will be refined inside if possible or user input
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen relative bg-brand-secondary overflow-hidden">
            {isImpersonating && (
                <div className="fixed top-0 left-0 w-full bg-indigo-600 z-[100] flex justify-between items-center px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Eye className="w-5 h-5" />
                        <span>Modo Personificação: Visualizando como {user?.displayName}</span>
                    </div>
                    <Button
                        onClick={stopImpersonation}
                        className="!py-1 !px-3 !text-xs !bg-white !text-indigo-600 hover:!bg-gray-100 font-bold"
                    >
                        Voltar para Admin
                    </Button>
                </div>
            )}

            <StudentSidebar
                activePage={activePage}
                navigateTo={navigateTo}
                supportBadge={supportBadge}
                isImpersonating={isImpersonating}
                schoolConfig={schoolConfig}
                visiblePages={visiblePages} // Pass Filter
            />

            <main className={`flex-1 overflow-y-auto relative bg-gray-900 scroll-smooth ${isImpersonating ? 'pt-12' : ''}`}>
                <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
                    <StudentHeader
                        canGoBack={history.length > 1}
                        goBack={goBack}
                        navigateTo={navigateTo}
                    />
                    <PainelDoAluno activePage={activePage} navigateTo={navigateTo} />
                </div>
            </main>
        </div>
    );
};
