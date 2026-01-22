import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactiveAudioVisualizer, VisualizerMode } from '@/components/ReactiveAudioVisualizer';
import { GrokChatInterface, GrokChatHandle } from '@/components/GrokChatInterface';
import { PlayerControls } from '@/components/PlayerControls';
import { ChevronLeft, Disc, Activity, Wind, Zap, Star, Radio, Aperture, Sun, Moon, LockClosed, FlaskConical, Play, Pause, Pencil } from '@/components/Icons';
import { MobileMiniPlayer } from '@/components/MobileMiniPlayer';
import { MobileExpandedPlayer } from '@/components/MobileExpandedPlayer';
import { useLessonFlow } from '@/hooks/useLessonFlow';
import { useAuth } from '@/hooks/useAuth';
import { ElevenLabsService } from '@/services/ElevenLabsService';
import { StudentMemoryService } from '@/services/StudentMemoryService';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { callMestreIA, generateQuizFromContent } from '@/services/mestreIaService';
import { QuizInterface, Question } from '@/components/player/QuizInterface';
import toast from 'react-hot-toast';
import { CreditBalanceWidget } from '@/components/CreditBalanceWidget';
import { useMentorState } from '@/context/MentorStateContext';
import { LessonCheckpoint } from '@/types/legacy';
import { NEXUS_TOOLS } from '@/services/ToolRegistry';



// Theme Definitions

const COURSE_THEMES = {
    TECH: { id: 'TECH', primary: '#00E5FF', secondary: '#7C3AED', name: 'Cyber Tech', bg: 'bg-black' },
    MARKETING: { id: 'MARKETING', primary: '#FF5733', secondary: '#FFC300', name: 'Mkt. Fire', bg: 'bg-[#1a0500]' },
    FINANCE: { id: 'FINANCE', primary: '#10B981', secondary: '#F59E0B', name: 'Finance Gold', bg: 'bg-[#001a0f]' },
    WELLNESS: { id: 'WELLNESS', primary: '#EC4899', secondary: '#8B5CF6', name: 'Wellness Flow', bg: 'bg-[#1a0010]' }
};

import { Course, Lesson } from '@/types';

interface StudentPlayerViewProps {
    onBack: () => void;
    lesson: Lesson;
    course: Course;
    onNavigate?: (page: string) => void;
}

export const StudentPlayerView: React.FC<StudentPlayerViewProps> = ({ onBack, lesson, course, onNavigate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { startMission } = useMentorState();
    const [processedCheckpoints, setProcessedCheckpoints] = useState<string[]>([]);

    // Safety Guard
    if (!lesson) return <div className="p-8 text-white">Carregando aula...</div>;
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(600);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [loop, setLoop] = useState(false);
    const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('NUCLEUS');
    const [isLightMode, setIsLightMode] = useState(false);

    // Theme State
    const [currentTheme, setCurrentTheme] = useState(COURSE_THEMES.TECH);
    const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'mentor' | 'quiz'>('mentor');
    const [quizScore, setQuizScore] = useState(0);
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

    // Load Quiz Content (Simulated Transcript)
    useEffect(() => {
        const loadQuiz = async () => {
            // In a real scenario, this would come from the current lesson's transcript
            const mockTranscript = "Nesta aula aprendemos sobre Negócios Exponenciais. O efeito rede é crucial. O custo marginal tende a zero.";
            const questions = await generateQuizFromContent(mockTranscript);
            setQuizQuestions(questions);
        };
        loadQuiz();
    }, []);

    // Chat Ref and Voice Hook
    const chatRef = useRef<GrokChatHandle>(null);
    const { isListening, startListening, stopListening, isSupported } = useSpeechRecognition((text) => {
        if (chatRef.current) {
            // 1. Auto-Pause Player (Immersive Switch)
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();

            // 2. Switch Focus to Chat (Mobile: Close Overlay)
            setIsPlayerExpanded(false);

            // 3. Send Message
            chatRef.current.sendMessage(text);

            toast.dismiss();
            // toast.success("Enviado para o Mentor!", { icon: "📨" }); // Optional: Let the chat UI be the feedback
        }
    });

    // Audio State Ref (using State to trigger re-render for Visualizer)
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null); // Keep ref for direct access if needed, but sync with state

    // AI Audio State
    const [aiAudioElement, setAiAudioElement] = useState<HTMLAudioElement | null>(null);
    const aiAudioRef = useRef<HTMLAudioElement | null>(null);
    const [activeSource, setActiveSource] = useState<'LESSON' | 'AI'>('LESSON');

    const audioSrc = lesson.videoUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Valid placeholder

    // Hook for Mentorship Logic
    const { isLocked, unlockCurrentSegment, currentSegment } = useLessonFlow(
        user?.uid,
        'lesson_1',
        currentTime,
        () => setIsPlaying(false) // Callback to pause audio
    );

    // Safety check to prevent playing if locked (in case user tries to play manually)
    useEffect(() => {
        if (isLocked && isPlaying) {
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
        }
    }, [isLocked, isPlaying, audioRef]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.playbackRate = playbackRate;
            audioRef.current.loop = loop;
        }
    }, [volume, playbackRate, loop]);

    // Init Backend Services
    useEffect(() => {
        if (user) {
            // Select Theme based on Course Category
            if (course.category === 'therapy_master') setCurrentTheme(COURSE_THEMES.WELLNESS);
            else if (course.category === 'personal_master') setCurrentTheme(COURSE_THEMES.MARKETING);
            else if (course.category === 'slimming_master') setCurrentTheme(COURSE_THEMES.TECH); // Maybe create a HEALTH theme later
            else setCurrentTheme(COURSE_THEMES.TECH);

            StudentMemoryService.updateProfile(user.uid, { lastInteraction: Date.now() });
            toast("Mentor IA Conectado: Memória Ativa", { icon: "🧠" });
        }
    }, [user, course]);

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.pause();
            else audioRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);

            // Checkpoints Logic
            if (lesson.checkpoints) {
                lesson.checkpoints.forEach(cp => {
                    // Trigger within 1s window, efficiently
                    const isTime = Math.abs(time - cp.time) < 1.0;
                    const id = `${lesson.id}-${cp.time}`;

                    if (isTime && !processedCheckpoints.includes(id)) {
                        setProcessedCheckpoints(prev => [...prev, id]);

                        // Pause Player
                        if (audioRef.current) audioRef.current.pause();
                        setIsPlaying(false);

                        // Handle Checkpoint Type
                        if (cp.type === 'tool_redirect' && cp.toolId) {
                            startMission({
                                id: id,
                                label: cp.toolTaskLabel || "Nova Missão",
                                toolId: cp.toolId,
                                status: 'pending',
                                returnTimestamp: cp.time,
                                lessonId: lesson.id,
                                context: `The student stopped the lesson "${lesson.title}" at ${cp.time}s to use tool ${cp.toolId}.`
                            });
                            toast.success("🎯 Missão Iniciada! O Mentor está te aguardando.", { duration: 5000 });
                        } else if (cp.type === 'quiz') {
                            setActiveTab('quiz');
                            toast("🧠 Checkpoint de Conhecimento!", { icon: "📝" });
                        }
                    }
                });
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    const toggleTheme = () => setIsLightMode(!isLightMode);

    // DYNAMIC STYLES based on currentTheme
    const themeBorder = isLightMode ? 'border-gray-200' : 'border-gray-800';
    const themeTextMain = isLightMode ? 'text-gray-900' : 'text-white';
    const themeTextSub = isLightMode ? 'text-gray-500' : 'text-gray-500';
    const themeBgSidebar = isLightMode ? 'bg-gray-200' : 'bg-[#050510]';
    // Use theme-specific BG in dark mode if desired, or keep generic dark
    const themeBgMain = isLightMode ? 'bg-[#d1d5db]' : 'bg-gray-950';

    return (
        <div className={`flex h-[calc(100dvh-145px)] md:h-[calc(100vh-100px)] overflow-hidden rounded-2xl md:rounded-[2rem] border shadow-2xl relative transition-colors duration-300 ${isLightMode ? 'bg-gray-300 border-gray-400' : 'bg-[#030712] border-gray-800'}`}>
            <audio
                ref={setAudioElement}
                src={audioSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                crossOrigin="anonymous"
            />

            {/* LEFT SIDEBAR: PLAYER & CONTROLS */}
            <div className={`w-[420px] shrink-0 border-r flex flex-col relative z-20 transition-colors duration-300 hidden md:flex ${themeBgSidebar} ${themeBorder}`}>

                {/* Header Back & Theme Selector */}
                <div className={`p-4 border-b flex flex-col gap-3 transition-colors duration-300 ${themeBorder} ${isLightMode ? 'bg-gray-100' : 'bg-black/50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={onBack} className={`p-2 rounded-full transition-colors ${isLightMode ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-gray-900 hover:bg-gray-800 text-gray-400'}`}>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: currentTheme.primary }}>Painel de Controle</h2>
                                <p className="text-[10px] text-gray-500">Módulo de Áudio & Visualização</p>
                            </div>
                        </div>
                        {/* Light/Dark Toggle */}
                        <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${isLightMode ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                            {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>



                    {/* Recharge Card */}
                    <div className="w-full">
                        <CreditBalanceWidget onRecharge={() => onNavigate && onNavigate('recharge')} />
                    </div>

                    {/* Daily Limit Badge */}
                    {user?.dailyMestreIALimit && (
                        <div className={`px-3 py-2 rounded-xl border flex items-center justify-between gap-2 text-[10px] font-bold ${isLightMode ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                            <span className="uppercase tracking-wider">Limite Diário</span>
                            <span className={((user.dailyUsage || 0) >= user.dailyMestreIALimit) ? 'text-red-500' : 'text-green-500'}>
                                {user.dailyUsage || 0}/{user.dailyMestreIALimit}
                            </span>
                        </div>
                    )}
                </div>

                {/* Visualizer Container */}
                <div className={`flex-1 relative flex items-center justify-center overflow-hidden border-b transition-colors duration-300 ${themeBorder} ${isLightMode ? 'bg-gray-200' : 'bg-black'}`}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${currentTheme.primary}22, transparent)` }}></div>

                    <ReactiveAudioVisualizer
                        audioElement={activeSource === 'AI' ? (aiAudioElement || undefined) : (audioElement || undefined)}
                        isPlaying={isPlaying || activeSource === 'AI'}
                        mode={visualizerMode}
                        primaryColor={currentTheme.primary}
                        secondaryColor={currentTheme.secondary}
                        theme={isLightMode ? 'light' : 'dark'}
                    />



                    {/* Effects Button (Mobile Aesthetic) */}
                    <button
                        onClick={() => {
                            const modes: VisualizerMode[] = ['NUCLEUS', 'NEURAL', 'SPECTRUM', 'VORTEX', 'SYNAPSE', 'ECLIPSE'];
                            const nextIndex = (modes.indexOf(visualizerMode) + 1) % modes.length;
                            setVisualizerMode(modes[nextIndex]);
                        }}
                        className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur rounded text-[10px] text-white/50 hover:bg-black/60 hover:text-white transition-all uppercase font-bold tracking-wider border border-white/5 z-50"
                    >
                        Efeitos
                    </button>

                    <div className="absolute bottom-4 right-4 animate-pulse">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isLightMode ? 'bg-green-100 border-green-200' : 'bg-green-500/20 border-green-500/30'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isLightMode ? 'bg-green-600' : 'bg-green-500'}`}></div>
                            <span className={`text-[8px] font-black uppercase ${isLightMode ? 'text-green-700' : 'text-green-400'}`}>ElevenLabs</span>
                        </div>
                    </div>
                </div>



                {/* Compact Player Controls */}
                <div className={`p-6 space-y-4 transition-colors duration-300 ${isLightMode ? 'bg-gray-100' : 'bg-[#080812]'}`}>

                    {/* Status Banner for Logic */}
                    {isLocked && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                            <div className="bg-yellow-500 p-2 rounded-full text-black">
                                <LockClosed className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-yellow-500 font-bold text-xs uppercase">Aprendizado Ativo</h4>
                                <p className={`text-[10px] ${themeTextSub}`}>Responda no chat para liberar o áudio.</p>
                            </div>
                            <button
                                onClick={unlockCurrentSegment} // Temporary mock unlock button for testing
                                className="ml-auto px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded"
                            >
                                Pular (Dev)
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner transition-colors duration-300 ${isLightMode ? 'bg-gray-100 border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                            <Disc className={`w-6 h-6 ${isPlaying ? 'animate-spin-slow' : ''} ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm leading-tight ${themeTextMain}`}>{lesson.title}</h3>
                            <p className="text-xs text-brand-primary">{course.title}</p>
                        </div>
                    </div>

                    <PlayerControls
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        volume={volume}
                        onVolumeChange={setVolume}
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={handleSeek}
                        playbackRate={playbackRate}
                        onRateChange={setPlaybackRate}
                        loop={loop}
                        onLoopToggle={() => setLoop(!loop)}
                        theme={isLightMode ? 'light' : 'dark'}
                        accentColor={currentTheme.primary}
                        onMicClick={() => {
                            if (!isSupported) return toast.error("Seu navegador não suporta voz.");
                            if (isListening) stopListening();
                            else startListening();
                        }}
                        isListening={isListening}
                        showMaximize={false}
                        customControls={
                            <button
                                onClick={() => {
                                    const themes = Object.values(COURSE_THEMES);
                                    const currentIndex = themes.findIndex(t => t.id === currentTheme.id);
                                    const nextIndex = (currentIndex + 1) % themes.length;
                                    setCurrentTheme(themes[nextIndex]);
                                }}
                                className={`absolute bottom-1 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all active:scale-95 ${isLightMode ? 'bg-gray-100/50 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                            >
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
                                <span className="text-[8px] font-bold uppercase tracking-wider">Estilo</span>
                            </button>
                        }
                    />
                </div>
            </div>

            {/* MAIN STAGE: MENTOR IA OR QUIZ (Using All Remaining Space) */}
            <div className={`flex-1 relative flex flex-col transition-colors duration-300 ${themeBgMain}`}>
                <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none transition-opacity duration-300 ${isLightMode ? 'opacity-20' : 'opacity-5'}`}></div>

                {/* Floating Tab Switcher (Main Stage) */}
                <div className={`hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-30 gap-1 p-1 rounded-full backdrop-blur-md border shadow-lg transition-colors duration-300 ${isLightMode ? 'bg-white/60 border-gray-200' : 'bg-black/60 border-white/10'}`}>
                    <button
                        onClick={() => setActiveTab('mentor')}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'mentor'
                            ? (isLightMode ? 'bg-gray-900 text-white shadow-lg scale-105' : 'bg-white text-black shadow-lg scale-105')
                            : (isLightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-black/5' : 'text-gray-400 hover:text-white hover:bg-white/10')
                            }`}
                        style={activeTab === 'mentor' ? {} : {}}
                    >
                        Mentor IA
                    </button>
                    <button
                        onClick={() => setActiveTab('quiz')}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all ${activeTab === 'quiz'
                            ? (isLightMode ? 'bg-gray-900 text-white shadow-lg scale-105' : 'bg-white text-black shadow-lg scale-105')
                            : (isLightMode ? 'text-gray-500 hover:text-gray-900 hover:bg-black/5' : 'text-gray-400 hover:text-white hover:bg-white/10')
                            }`}
                        style={activeTab === 'quiz' ? { backgroundColor: currentTheme.primary } : {}}
                    >
                        Quiz
                    </button>
                    {/* Future Tabs (My Diary, etc) can go here */}
                </div>

                {/* Top Title & Info */}
                <div className={`border-b px-4 py-2 md:px-6 md:py-4 transition-colors duration-300 flex flex-col gap-1 ${themeBorder} ${isLightMode ? 'bg-gray-300' : 'bg-[#050510]'}`}>
                    <div className="flex flex-col gap-2">
                        {/* Row 1: Title & Badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-black uppercase tracking-wide text-sm ${themeTextMain}`}>
                                    {activeTab === 'mentor' ? 'Mentor IA' : 'Teste do Conhecimento'}
                                </h3>
                                {activeTab === 'mentor' && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] font-black text-green-500 uppercase tracking-wider">Online</span>
                                    </div>
                                )}
                            </div>

                            {/* Gamification Badge (Top Right) */}
                            {activeTab === 'quiz' && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 animate-fade-in shadow-sm">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-yellow-500">{quizScore} XP</span>
                                </div>
                            )}
                        </div>

                        {/* Row 2: Module Info & Balance (moved down) */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-medium uppercase tracking-wider ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>Módulo Atual:</span>
                                <span className={`text-[10px] font-bold ${isLightMode ? 'text-gray-700' : 'text-gray-400'}`}>{lesson.title}</span>
                            </div>

                            <CreditBalanceWidget onRecharge={() => onNavigate && onNavigate('recharge')} />
                        </div>
                    </div>
                </div>

                {/* Content Area Switcher */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {activeTab === 'mentor' ? (
                        <>
                            <div className="flex-1 w-full relative">
                                <GrokChatInterface
                                    ref={chatRef}
                                    currentTheme={currentTheme}
                                    hideHeader={true}
                                    dailyLimit={course.aiConfig?.monthlyCreditAllowance || 50}
                                    contextId={course.id}
                                    isLightMode={isLightMode}
                                    externalIsListening={isListening}
                                    onExternalMicClick={() => {
                                        if (!isSupported) return toast.error("Seu navegador não suporta voz.");
                                        if (isListening) stopListening();
                                        else startListening();
                                    }}
                                    // onBeforeSendMessage removed - logic moved to GrokChatInterface config
                                    // But GrokChatInterface needs to know the Limit.
                                    // I need to update GrokChatInterface to accept 'dailyLimit' and pass it to checkAndConsume.
                                    // Or I pass it via onBeforeSendMessage? No, GrokChatInterface calls checkAndConsume directly.
                                    // I should pass dailyLimit as a prop to GrokChatInterface.
                                    // Let's first remove this manual block.
                                    // Handle AI Voice
                                    onAudioGenerated={(url) => {
                                        if (audioRef.current) {
                                            audioRef.current.pause();
                                            setIsPlaying(false);
                                        }
                                        if (aiAudioRef.current) {
                                            aiAudioRef.current.src = url;
                                            aiAudioRef.current.play();
                                            setActiveSource('AI');
                                            toast('Mentor IA falando...', { icon: '🗣️' });
                                        }
                                    }}
                                    onBeforeSendMessage={undefined} onAction={(action, payload) => {
                                        console.log("AI Command Received:", action, payload);
                                        if (action === 'OPEN_QUIZ' || action === 'NAVIGATE_QUIZ') {
                                            setActiveTab('quiz');
                                            toast('🧠 Mentor IA abriu o Teste do Conhecimento', { icon: '🤖' });
                                        } else if (action === 'OPEN_MENTOR') {
                                            setActiveTab('mentor');
                                        }
                                    }}
                                />
                            </div>

                            {/* Hidden AI Audio Element */}
                            <audio
                                ref={(el) => {
                                    aiAudioRef.current = el;
                                    setAiAudioElement(el);
                                }}
                                className="hidden"
                                onEnded={() => {
                                    setActiveSource('LESSON'); // Revert visualizer to lesson
                                    // Optional: Resume lesson automatically?
                                    // setIsPlaying(true); 
                                    // if(audioRef.current) audioRef.current.play();
                                }}
                                crossOrigin="anonymous"
                            />


                        </>
                    ) : (
                        <QuizInterface
                            theme={currentTheme}
                            questions={quizQuestions}
                            onScoreUpdate={setQuizScore}
                            onComplete={(score) => {
                                toast.success(`Quiz Finalizado! +${score} XP`);
                                // Could play a sound or unlock next module here
                            }}
                            isLightMode={isLightMode}
                        />
                    )}
                </div>
            </div>

            {/* MOBILE MINI PLAYER (Rotation Logic) - Moved outside conditional rendering */}
            <div className="md:hidden">
                <MobileMiniPlayer
                    isPlaying={isPlaying}
                    onPlayPause={(e) => {
                        e.stopPropagation();
                        handlePlayPause();
                    }}
                    title={lesson.title}
                    subtitle={`${course.title} • Nexus AI`}
                    progress={(currentTime / duration) * 100 || 0}
                    currentTheme={currentTheme}
                    onExpand={() => setIsPlayerExpanded(true)}
                    // ROTATION LOGIC START
                    customIcon={
                        activeTab === 'mentor'
                            ? <Pencil className="w-6 h-6 text-brand-primary" />  // Mentor -> Quiz
                            : <Disc className="w-6 h-6 text-brand-primary animate-spin-slow" />     // Quiz -> Player (Disc looks more like a player than a triangle)
                    }
                    onCustomClick={() => {
                        if (activeTab === 'mentor') {
                            setActiveTab('quiz');
                        } else {
                            setIsPlayerExpanded(true);
                        }
                    }}
                    // ROTATION LOGIC END
                    isLightMode={isLightMode}
                />
            </div>

            {/* MOBILE EXPANDED PLAYER OVERLAY (Independent of Tab) */}
            <div className="md:hidden">
                <MobileExpandedPlayer
                    isOpen={isPlayerExpanded}
                    onCollapse={() => {
                        setIsPlayerExpanded(false);
                        setActiveTab('mentor'); // Player -> Mentor
                    }}
                    audioElement={audioElement}
                    isPlaying={isPlaying}
                    visualizerMode={visualizerMode}
                    toggleVisualizerMode={() => {
                        const modes: VisualizerMode[] = ['NUCLEUS', 'NEURAL', 'SPECTRUM', 'VORTEX', 'SYNAPSE', 'ECLIPSE'];
                        const nextIndex = (modes.indexOf(visualizerMode) + 1) % modes.length;
                        setVisualizerMode(modes[nextIndex]);
                    }}
                    currentTheme={{ ...currentTheme, secondary: currentTheme.secondary }} // Helper to match type if needed
                    isLightMode={isLightMode}
                    volume={volume}
                    setVolume={setVolume}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    onPlayPause={handlePlayPause}
                    onToggleTheme={() => {
                        const themes = Object.values(COURSE_THEMES);
                        const currentIndex = themes.findIndex(t => t.id === currentTheme.id);
                        const nextIndex = (currentIndex + 1) % themes.length;
                        setCurrentTheme(themes[nextIndex]);
                    }}
                    onMicClick={() => {
                        if (!isSupported) {
                            toast.error("Navegador não suporta voz.");
                            return;
                        }
                        if (isListening) stopListening();
                        else startListening();
                    }}
                    isListening={isListening}
                    onToggleLightMode={toggleTheme}
                    onNavigate={onNavigate}
                />
            </div>

        </div >
    );
};

const VisualizerIcon = ({ active, onClick, icon, isLightMode, activeColor }: any) => (
    <button
        onClick={onClick}
        style={active ? { backgroundColor: activeColor, boxShadow: `0 10px 15px -3px ${activeColor}40` } : {}}
        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${active
            ? (isLightMode ? 'text-white scale-110' : 'text-black scale-110')
            : (isLightMode ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-800' : 'text-gray-400 hover:bg-white/10 hover:text-white')
            }`}
    >
        {icon}
    </button>
);
