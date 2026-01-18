
import React from 'react';
import { motion } from 'framer-motion';

export const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    // Generate random bars for visualization
    const bars = Array.from({ length: 20 });

    return (
        <div className="flex items-center justify-center gap-1 h-16 w-full bg-gray-900 rounded-xl border border-gray-700 p-2 overflow-hidden">
            {bars.map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-brand-primary rounded-full"
                    animate={{
                        height: isActive ? [10, Math.random() * 40 + 10, 10] : 4,
                        opacity: isActive ? 1 : 0.3
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    );
};
