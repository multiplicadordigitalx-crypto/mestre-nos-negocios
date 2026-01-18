import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, MoreHorizontal, MessageSquare } from './Icons';
import { ReactiveAudioVisualizer, VisualizerMode } from './ReactiveAudioVisualizer';
import { PlayerControls } from './PlayerControls';

interface MobileExpandedPlayerProps {
    isOpen: boolean;
    onCollapse: () => void;
    audioElement: HTMLAudioElement | null;
    isPlaying: boolean;
    visualizerMode: VisualizerMode;
    toggleVisualizerMode: () => void; // Cycle modes or a minimal selector
    currentTheme: { primary: string; secondary: string; name: string };
    isLightMode: boolean;
    // Proxied props for PlayerControls
    volume: number;
    setVolume: (v: number) => void;
    currentTime: number;
    duration: number;
    onSeek: (t: number) => void;
    onPlayPause: () => void;
    // New prop for theme cycling
    onToggleTheme: () => void;
    onMicClick: () => void;
    isListening?: boolean;
}

export const MobileExpandedPlayer: React.FC<MobileExpandedPlayerProps> = ({
    isOpen,
    onCollapse,
    audioElement,
    isPlaying,
    visualizerMode,
    toggleVisualizerMode,
    currentTheme,
    isLightMode,
    volume,
    setVolume,
    currentTime,
    duration,
    onSeek,
    onPlayPause,
    onToggleTheme,
    onMicClick,
    isListening = false
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[60] flex flex-col ${isLightMode ? 'bg-white' : 'bg-[#050510]'}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6">
                <button onClick={onCollapse} className={`p-2 rounded-full ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                    <ChevronDown className={`w-6 h-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                </button>
                <div className="text-center">
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Tocando Agora
                    </span>
                    <h3 className={`text-sm font-bold ${isLightMode ? 'text-gray-900' : 'text-white'}`} style={{ color: currentTheme.primary }}>
                        Aula 01: Fundamentos
                    </h3>
                </div>
                <button className={`p-2 rounded-full ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                    <MoreHorizontal className={`w-6 h-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                </button>
            </div>

            {/* Visualizer Stage */}
            <div className="flex-1 px-6 pb-6 relative w-full flex flex-col justify-center">
                <div
                    className="w-full aspect-square rounded-[2rem] overflow-hidden relative shadow-2xl"
                    style={{ boxShadow: `0 25px 50px -12px ${currentTheme.primary}40` }}
                    onClick={toggleVisualizerMode}
                >
                    <ReactiveAudioVisualizer
                        audioElement={audioElement || undefined}
                        isPlaying={isPlaying}
                        mode={visualizerMode}
                        primaryColor={currentTheme.primary}
                        secondaryColor={currentTheme.secondary}
                        theme={isLightMode ? 'light' : 'dark'}
                    />

                    {/* Tap hint */}
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 backdrop-blur rounded text-[10px] text-white/50 pointer-events-none uppercase font-bold tracking-wider">
                        Efeitos
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="px-8 pb-12">
                <div className="mb-8">
                    <h2 className={`text-2xl font-black mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                        Fundamentos
                    </h2>
                    <p className={`text-base ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Módulo Iniciação • {currentTheme.name}
                    </p>
                </div>

                <PlayerControls
                    isPlaying={isPlaying}
                    onPlayPause={onPlayPause}
                    volume={volume}
                    onVolumeChange={setVolume}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={onSeek}
                    playbackRate={1}
                    onRateChange={() => { }}
                    loop={false}
                    onLoopToggle={() => { }}
                    theme={isLightMode ? 'light' : 'dark'}
                    accentColor={currentTheme.primary}
                    showMaximize={false}
                    onMicClick={onMicClick}
                    isListening={isListening}
                    customControls={
                        <button
                            onClick={onToggleTheme}
                            className={`absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all active:scale-95 ${isLightMode ? 'bg-gray-100/50 border-gray-200 text-gray-600' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                        >
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: currentTheme.primary }}></div>
                            <span className="text-[8px] font-bold uppercase tracking-wider">Estilo</span>
                        </button>
                    }
                />

                <div className="flex items-center justify-between mt-8 opacity-80">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold text-black">
                            AI
                        </div>
                        <span className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>Mentor está ouvindo...</span>
                    </div>
                </div>
            </div>

            {/* Draggable MENTOR IA Button (Floating) */}
            <motion.div
                drag
                dragMomentum={false}
                whileDrag={{ scale: 1.1 }}
                dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`fixed bottom-[100px] right-4 h-14 w-14 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center z-[70] cursor-pointer border hover:scale-105 transition-colors ${isLightMode ? 'bg-white/90' : 'bg-black/40'}`}
                onClick={onCollapse}
                style={{
                    touchAction: 'none',
                    borderColor: isLightMode ? `${currentTheme.primary}40` : `${currentTheme.primary}60`,
                    boxShadow: `0 8px 32px -4px ${currentTheme.primary}40`
                }}
            >
                <div className="flex flex-col items-center justify-center">
                    <MessageSquare className="w-6 h-6" style={{ color: currentTheme.primary }} />
                    <span className="text-[8px] font-black uppercase mt-0.5" style={{ color: currentTheme.primary }}>Mentor</span>
                </div>
            </motion.div>
        </motion.div>
    );
};
