import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import VideoPlayer from '../components/VideoPlayer';
import { StudentPlayerView } from './painel/views/StudentPlayerView';
import { Check, PlayCircle, LockClosed, AlertTriangle, CheckCircle, File, Download, HardDrive, BookOpen, ChevronLeft } from '../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentPage } from '../types';
import { getTrainingModules, saveLessonProgress, getCoursesByIds } from '../services/mockFirebase';
import { TrainingModule, Lesson, Student, Course } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import CertificateModal from '../components/CertificateModal';

type TrainingState = 'courses_list' | 'modules_list' | 'video' | 'quiz' | 'completed';

interface TrainingPageProps {
    navigateTo: (page: StudentPage) => void;
}

const TrainingPage: React.FC<TrainingPageProps> = ({ navigateTo }) => {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [state, setState] = useState<TrainingState>('courses_list'); // Default state
    const [modules, setModules] = useState<TrainingModule[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

    // Quiz State
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const [quizResult, setQuizResult] = useState<{ passed: boolean, score: number } | null>(null);

    // Completion State
    const [videoWatched, setVideoWatched] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);

    const student = user as Student;

    useEffect(() => {
        const loadContent = async () => {
            if (!student) return;

            // 1. Fetch all modules (we'll filter later)
            const allModules = await getTrainingModules();
            setModules(allModules);

            // 2. Fetch User's Courses
            const courseIds = student.purchasedCourses || ['course-main']; // Fallback for old users
            const userCourses = await getCoursesByIds(courseIds);
            setCourses(userCourses);

            // Logic: If only 1 course, auto-select it and show modules
            if (userCourses.length === 1) {
                setSelectedCourse(userCourses[0]);
                setState('modules_list');
            } else {
                setState('courses_list');
            }
        };
        loadContent();
    }, [student]);

    // Computed Progress for CURRENT SELECTED Course
    const courseProgress = useMemo(() => {
        if (!modules.length || !selectedCourse) return { percent: 0, total: 0, completed: 0 };

        // Filter modules for current course
        const courseModules = modules.filter(m => m.courseId === selectedCourse.id);

        let totalLessons = 0;
        courseModules.forEach(m => totalLessons += m.lessons.length);

        // Count completed lessons that belong to this course
        const completedInCourse = student?.completedLessons?.filter(lid =>
            courseModules.some(m => m.lessons.some(l => l.id === lid))
        ).length || 0;

        return {
            percent: totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0,
            total: totalLessons,
            completed: completedInCourse
        };
    }, [modules, student, selectedCourse]);

    // Helper to calculate progress for ANY course (for the grid view)
    const getProgressForCourse = (courseId: string) => {
        const courseModules = modules.filter(m => m.courseId === courseId);
        let total = 0;
        courseModules.forEach(m => total += m.lessons.length);
        const completed = student?.completedLessons?.filter(lid =>
            courseModules.some(m => m.lessons.some(l => l.id === lid))
        ).length || 0;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const isLessonLocked = (lessonId: string, moduleId: string, lessonIndex: number, moduleIndex: number) => {
        if (!selectedCourse) return true;

        // Filter modules for current course to find correct indices relative to course
        const courseModules = modules.filter(m => m.courseId === selectedCourse.id);

        // First lesson of first module is always unlocked
        if (moduleIndex === 0 && lessonIndex === 0) return false;

        // Check if previous lesson is completed
        let prevLessonId = '';
        if (lessonIndex > 0) {
            prevLessonId = courseModules[moduleIndex].lessons[lessonIndex - 1].id;
        } else {
            // Last lesson of previous module
            const prevMod = courseModules[moduleIndex - 1];
            prevLessonId = prevMod.lessons[prevMod.lessons.length - 1].id;
        }

        return !student?.completedLessons?.includes(prevLessonId);
    };

    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        setState('modules_list');
    };

    const handleBackToCourses = () => {
        setSelectedCourse(null);
        setState('courses_list');
    };

    const handleStartLesson = (lesson: Lesson) => {
        setCurrentLesson(lesson);
        setVideoWatched(false);
        setQuizResult(null);
        setQuizAnswers({});
        setState('video');
    };

    const handleCompleteLesson = async () => {
        if (!currentLesson || !student) return;

        if (currentLesson.quiz) {
            setState('quiz');
            return;
        }

        await saveLessonProgress(student.uid, currentLesson.id);
        await refreshUser();
        toast.success("Aula concluída!");
        setState('modules_list');
    };

    const handleSubmitQuiz = async () => {
        if (!currentLesson?.quiz || !student) return;

        const quiz = currentLesson.quiz;
        let correctCount = 0;
        quiz.questions.forEach(q => {
            if (quizAnswers[q.id] === q.correctOptionIndex) correctCount++;
        });

        const scorePercent = (correctCount / quiz.questions.length) * 100;
        const passed = scorePercent >= quiz.minPassPercent;

        setQuizResult({ passed, score: scorePercent });

        if (passed) {
            await saveLessonProgress(student.uid, currentLesson.id, scorePercent);
            await refreshUser();
            toast.success(quiz.successMessage);
        } else {
            toast.error(quiz.failMessage);
        }
    };

    const handleContinue = () => {
        setState('modules_list');
    }

    const renderContent = () => {
        // --- VIEW: COURSES LIST (GRID) ---
        if (state === 'courses_list') {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h1 className="text-3xl font-bold text-white mb-6">Meus Treinamentos</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => {
                            const progress = getProgressForCourse(course.id);
                            return (
                                <Card key={course.id} className="flex flex-col overflow-hidden group cursor-pointer hover:border-brand-primary transition-all" onClick={() => handleSelectCourse(course)}>
                                    <div className="h-48 bg-gray-800 relative">
                                        <img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">{course.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1 bg-gray-800">
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{course.description}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray-400">Progresso</span>
                                                <span className="text-white font-bold">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-4">
                                                <div className="bg-brand-primary h-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <Button className="w-full !py-2">ACESSAR CURSO</Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </motion.div>
            );
        }

        // --- VIEW: MODULES LIST ---
        if (state === 'modules_list' && selectedCourse) {
            const courseModules = modules.filter(m => m.courseId === selectedCourse.id).sort((a, b) => a.order - b.order);

            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                        <div className="flex-1">
                            {courses.length > 1 && (
                                <button onClick={handleBackToCourses} className="text-sm text-gray-400 hover:text-white mb-2 flex items-center gap-1">
                                    <ChevronLeft className="w-4 h-4" /> Voltar aos Cursos
                                </button>
                            )}
                            <h1 className="text-3xl font-bold text-white mb-2">{selectedCourse.title}</h1>
                            <p className="text-gray-400">
                                Módulo Atual: <span className="text-white font-bold">
                                    {courseModules.find(m => m.lessons.some(l => !student?.completedLessons?.includes(l.id)))?.title || "Concluído"}
                                </span>
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 w-full md:w-auto min-w-[250px]">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Progresso do Curso</span>
                                <span className="font-bold text-brand-primary">{courseProgress.percent}%</span>
                            </div>
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${courseProgress.percent}%` }}
                                    className="bg-brand-primary h-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Congrats Banner if 100% */}
                    {courseProgress.percent === 100 && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-6 rounded-xl mb-8 shadow-lg text-black relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black uppercase">Curso Concluído! 🎉</h2>
                                    <p className="font-medium">Você finalizou "{selectedCourse.title}". Seu certificado está disponível.</p>
                                </div>
                                <div className="flex gap-3">
                                    <Button className="!bg-black !text-yellow-400 hover:!bg-gray-900 border border-black" onClick={() => setShowCertificate(true)}>BAIXAR CERTIFICADO</Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-8">
                        {courseModules.map((mod, mIdx) => (
                            <div key={mod.id}>
                                <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-brand-primary">{mod.title}</h2>
                                <div className="space-y-3">
                                    {mod.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => {
                                        const isCompleted = student?.completedLessons?.includes(lesson.id);
                                        const isLocked = isLessonLocked(lesson.id, mod.id, lIdx, mIdx);

                                        return (
                                            <motion.div
                                                key={lesson.id}
                                                whileHover={!isLocked ? { scale: 1.01 } : {}}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${isLocked
                                                    ? 'bg-gray-900/30 border-gray-800 opacity-60 cursor-not-allowed'
                                                    : isCompleted
                                                        ? 'bg-gray-800/50 border-green-900/50 hover:border-green-500/50 cursor-pointer'
                                                        : 'bg-gray-800 border-gray-700 hover:border-brand-primary cursor-pointer shadow-lg'
                                                    }`}
                                                onClick={() => !isLocked && handleStartLesson(lesson)}
                                            >
                                                <div className="flex-shrink-0">
                                                    {isCompleted ? (
                                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                                            <Check className="w-6 h-6 text-green-500" />
                                                        </div>
                                                    ) : isLocked ? (
                                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                            <LockClosed className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center border border-brand-primary/30 relative">
                                                            <PlayCircle className="w-6 h-6 text-brand-primary" />
                                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-primary rounded-full animate-ping"></span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-bold ${isLocked ? 'text-gray-500' : 'text-white'}`}>{lesson.title}</h3>
                                                        {lesson.quiz && <span className="text-[10px] uppercase font-bold bg-purple-900/50 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">Quiz</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{lesson.description || "Sem descrição"}</p>
                                                </div>

                                                <div className="text-right ml-auto flex-shrink-0">
                                                    <span className="text-[10px] text-gray-500 block">{lesson.duration} min</span>
                                                    {!isLocked && !isCompleted && <span className="text-[10px] md:text-xs text-brand-primary font-bold">COMEÇAR</span>}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        {courseModules.length === 0 && <p className="text-gray-500">Nenhum módulo encontrado para este curso.</p>}
                    </div>
                </motion.div>
            );
        }

        if (state === 'video' && currentLesson) {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="ghost" onClick={() => setState('modules_list')} className="text-sm">← Voltar para lista</Button>
                        <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                    </div>

                    {currentLesson.type === 'video' ? (
                        selectedCourse?.isAiPowered ? (
                            <div className="fixed inset-0 z-50 bg-black">
                                <StudentPlayerView
                                    lesson={currentLesson}
                                    course={selectedCourse}
                                    onBack={() => setState('modules_list')}
                                />
                            </div>
                        ) : (
                            <VideoPlayer
                                src={currentLesson.videoUrl || ""}
                                onWatchCompleted={() => setVideoWatched(true)}
                            />
                        )
                    ) : (
                        <Card className="p-8 text-left min-h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">Conteúdo de leitura. Acesse o material abaixo ou marque como lido.</p>
                            </div>
                        </Card>
                    )}

                    {/* Supplementary Materials */}
                    {currentLesson.materials && currentLesson.materials.length > 0 && (
                        <div className="mt-6 text-left">
                            <h3 className="text-gray-400 text-sm uppercase font-bold mb-3">Materiais Complementares</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentLesson.materials.map(mat => (
                                    <div key={mat.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-brand-primary transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-700 rounded">
                                                {mat.type === 'zip' ? <HardDrive className="w-5 h-5 text-yellow-500" /> : <File className="w-5 h-5 text-blue-400" />}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm font-bold">{mat.name}</p>
                                                <p className="text-xs text-gray-500">{mat.size}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="!p-2 hover:bg-gray-700 text-brand-primary" onClick={() => toast.success("Download iniciado!")}>
                                            <Download className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end pt-6 border-t border-gray-700">
                        <Button
                            onClick={handleCompleteLesson}
                            disabled={currentLesson.type === 'video' && !videoWatched}
                            className={currentLesson.type === 'video' && !videoWatched ? 'opacity-50' : ''}
                        >
                            {currentLesson.type === 'video' && !videoWatched ? (
                                <span className="flex items-center"><LockClosed className="w-4 h-4 mr-2" /> Assista até o final</span>
                            ) : (
                                <span className="flex items-center">
                                    {currentLesson.quiz ? "IR PARA O QUIZ" : "CONCLUIR AULA"} <CheckCircle className="w-4 h-4 ml-2" />
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>
            );
        }

        if (state === 'quiz' && currentLesson?.quiz) {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">{currentLesson.quiz.title}</h2>
                        <p className="text-gray-400">Aprovação mínima: <span className="text-brand-primary font-bold">{currentLesson.quiz.minPassPercent}%</span></p>
                    </div>

                    {!quizResult ? (
                        <div className="space-y-6">
                            {currentLesson.quiz.questions.map((q, idx) => (
                                <Card key={q.id} className="p-6">
                                    <p className="font-bold text-white mb-4"><span className="text-gray-500 mr-2">{idx + 1}.</span> {q.text}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, optIdx) => (
                                            <label key={optIdx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${quizAnswers[q.id] === optIdx ? 'bg-brand-primary/20 border-brand-primary' : 'bg-gray-700/50 border-transparent hover:bg-gray-700'}`}>
                                                <input
                                                    type="radio"
                                                    name={q.id}
                                                    className="text-brand-primary focus:ring-brand-primary bg-gray-600 border-gray-500"
                                                    checked={quizAnswers[q.id] === optIdx}
                                                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                                                />
                                                <span className="ml-3 text-gray-200">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                            <Button className="w-full !py-4 text-lg" onClick={handleSubmitQuiz} disabled={Object.keys(quizAnswers).length < currentLesson.quiz.questions.length}>
                                ENVIAR RESPOSTAS
                            </Button>
                        </div>
                    ) : (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center shadow-2xl">
                            {quizResult.passed ? (
                                <>
                                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-green-400 mb-2">Aprovado! {quizResult.score.toFixed(0)}%</h3>
                                    <p className="text-white text-lg mb-8">Você dominou este conteúdo. Próxima aula liberada.</p>
                                    <Button onClick={handleContinue} className="w-full !bg-green-600 hover:!bg-green-500">CONTINUAR JORNADA</Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <AlertTriangle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-red-400 mb-2">Reprovado. {quizResult.score.toFixed(0)}%</h3>
                                    <p className="text-white text-lg mb-8">Você precisa de {currentLesson.quiz.minPassPercent}% para passar. Revise o conteúdo.</p>
                                    <div className="flex gap-4">
                                        <Button variant="secondary" onClick={() => setState('video')} className="flex-1">REVER AULA</Button>
                                        <Button onClick={() => setQuizResult(null)} className="flex-1">TENTAR NOVAMENTE</Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            );
        }

        return null;
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>

            {showCertificate && student && (
                <CertificateModal
                    isOpen={showCertificate}
                    onClose={() => setShowCertificate(false)}
                    student={student}
                />
            )}
        </>
    );
};

export default TrainingPage;