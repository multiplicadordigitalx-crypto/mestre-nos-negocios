import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, FastForward, Repeat, Volume2, VolumeX, SkipBack, Settings, Maximize, Mic } from './Icons';

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    volume: number;
    onVolumeChange: (val: number) => void;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    playbackRate: number;
    onRateChange: (rate: number) => void;
    loop: boolean;
    onLoopToggle: () => void;
    onMicClick?: () => void;
    accentColor?: string;
    customControls?: React.ReactNode;
    showMaximize?: boolean;
    isListening?: boolean;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    onPlayPause,
    volume,
    onVolumeChange,
    currentTime,
    duration,
    onSeek,
    playbackRate,
    onRateChange,
    loop,
    onLoopToggle,
    theme = 'dark',
    accentColor = '#00E5FF', // Default Teal/Cyan
    customControls,
    showMaximize = true,
    onMicClick,
    isListening = false
}) => {
    const [isHovering, setIsHovering] = useState(false);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSpeedClick = () => {
        const rates = [0.5, 1.0, 1.25, 1.5, 2.0];
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
        onRateChange(rates[nextIdx]);
    };

    return (
        <div
            className="w-full relative backdrop-blur-xl border-t px-6 py-4 flex flex-col gap-2 transition-all duration-500"
            style={{
                borderColor: `${accentColor}50`,
                background: theme === 'light'
                    ? `linear-gradient(to bottom, rgba(255,255,255,0.9), ${accentColor}15)`
                    : `linear-gradient(to bottom, rgba(17,24,39,0.9), ${accentColor}25)`
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Progress Bar */}
            <div className="w-full flex items-center gap-3 group">
                <span className={`text-[10px] font-mono w-10 text-right ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>{formatTime(currentTime)}</span>
                <div className={`relative flex-1 h-1.5 rounded-full cursor-pointer group-hover:h-2.5 transition-all ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        onSeek(percent * duration);
                    }}
                >
                    <div
                        className="absolute h-full rounded-full"
                        style={{
                            width: `${(currentTime / duration) * 100}%`,
                            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
                            boxShadow: `0 0 10px ${accentColor}66`
                        }}
                    />
                    <div
                        className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-lg -top-0.5 md:-top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
                <span className={`text-[10px] font-mono w-10 ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-1">

                {/* Left: Volume & Settings */}
                <div className="flex items-center gap-4 w-1/3">
                    <div className="flex items-center gap-2 group relative">
                        <button
                            onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
                            className={`transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ accentColor: accentColor }}
                        />
                    </div>
                </div>

                {/* Center: Playback */}
                <div className="flex items-center gap-6 justify-center w-1/3">
                    <button
                        className={`p-2 rounded-full transition-all ${loop ? 'bg-opacity-20' : 'hover:bg-gray-800'}`}
                        style={{ color: loop ? accentColor : (theme === 'light' ? '#9CA3AF' : '#6B7280'), backgroundColor: loop ? `${accentColor}20` : undefined }}
                        onClick={onLoopToggle}
                        title="Loop"
                    >
                        <Repeat className="w-4 h-4" />
                    </button>

                    <button
                        className={`transition-colors hover:scale-110 active:scale-95 ${theme === 'light' ? 'text-gray-400 hover:text-black' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => onSeek(currentTime - 10)}
                        title="-10s"
                    >
                        <SkipBack className="w-6 h-6" />
                    </button>

                    <button
                        className={`w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl aspect-square ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}
                        onClick={onPlayPause}
                        style={{
                            boxShadow: `0 0 25px ${accentColor}40`,
                        }}
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                    </button>

                    <button
                        className={`text-[10px] font-black w-8 text-center border rounded px-1 py-0.5 transition-colors ${theme === 'light' ? 'text-gray-500 border-gray-300 hover:text-black hover:border-black' : 'text-gray-400 border-gray-700 hover:text-white hover:border-white'}`}
                        onClick={handleSpeedClick}
                        title="Velocidade"
                    >
                        {playbackRate}x
                    </button>

                    <button
                        type="button"
                        className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 relative z-50 ${isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                            : (theme === 'light' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white')
                            }`}
                        onClick={onMicClick}
                        onTouchStart={(e) => {
                            if (onMicClick) {
                                e.preventDefault(); // Prevent ghost clicks
                                onMicClick();
                            }
                        }}
                        title={isListening ? "Parar de ouvir" : "Falar com Mentor"}
                    >
                        <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
                    </button>

                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                    {customControls}
                    {showMaximize && (
                        <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg">
                            <Maximize className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
