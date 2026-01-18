import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronUp, Zap } from './Icons';

interface MobileMiniPlayerProps {
    isPlaying: boolean;
    onPlayPause: (e: React.MouseEvent) => void;
    title: string;
    subtitle: string;
    progress: number; // 0 to 100
    currentTheme: { primary: string; secondary: string };
    onExpand: () => void;
    isLightMode: boolean;
    compact?: boolean;
    customIcon?: React.ReactNode;
    onCustomClick?: () => void;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({
    isPlaying,
    onPlayPause,
    title,
    subtitle,
    progress,
    currentTheme,
    onExpand,
    isLightMode,
    customIcon,
    onCustomClick
}) => {

    return (
        <motion.div
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.1 }}
            dragConstraints={{ left: -300, right: 0, top: -600, bottom: 0 }}
            initial={{ scale: 0.8, opacity: 0, y: 0, x: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            className={`fixed bottom-[100px] right-4 h-14 w-14 rounded-full shadow-2xl backdrop-blur-md flex items-center justify-center z-50 cursor-pointer border hover:scale-105 transition-colors ${isLightMode ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/20'}`}
            onClick={onCustomClick || onExpand}
            style={{
                boxShadow: `0 8px 32px -4px ${currentTheme.primary}40`,
                touchAction: 'none' // Important for drag on mobile
            }}
        >
            {/* Circular Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" strokeWidth="4" className={isLightMode ? 'stroke-gray-200' : 'stroke-white/10'} />
                <circle cx="50" cy="50" r="48" fill="none" strokeWidth="4"
                    stroke={currentTheme.primary}
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (301.59 * progress) / 100}
                    strokeLinecap="round"
                />
            </svg>

            {/* Icon Logic: Custom >> Playing State */}
            <div className={`relative z-10 flex items-center justify-center ${!customIcon && isPlaying ? 'animate-pulse' : ''}`}>
                {customIcon ? (
                    customIcon
                ) : (
                    isPlaying ? <Zap className="w-6 h-6" style={{ color: currentTheme.primary }} /> : <Play className={`w-6 h-6 ml-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                )}
            </div>

            {/* Title Tooltip (Optional, maybe too cluttered for a balloon) */}
        </motion.div>
    );
};
