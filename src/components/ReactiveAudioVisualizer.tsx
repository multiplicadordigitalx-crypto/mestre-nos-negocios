import React, { useRef, useEffect } from 'react';

export type VisualizerMode = 'NUCLEUS' | 'NEURAL' | 'SPECTRUM' | 'VORTEX' | 'SYNAPSE' | 'ECLIPSE';

interface ReactiveAudioVisualizerProps {
    audioUrl?: string;
    audioElement?: HTMLAudioElement;
    isPlaying: boolean;
    mode: VisualizerMode;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: 'light' | 'dark';
}

export const ReactiveAudioVisualizer: React.FC<ReactiveAudioVisualizerProps> = ({
    audioElement,
    isPlaying,
    mode,
    primaryColor = '#10B981',
    secondaryColor = '#8B5CF6',
    theme = 'dark'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const animationFrameRef = useRef<number>();

    // Shared State for Particles/Nodes
    const particlesRef = useRef<any[]>([]);
    const rotationRef = useRef(0);
    const tickRef = useRef(0);

    // Reset refs on unmount/mode change
    useEffect(() => {
        particlesRef.current = [];
        rotationRef.current = 0;
    }, [mode]);

    useEffect(() => {
        if (!audioElement || !canvasRef.current) return;

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512; // Higher resolution for voice details
            analyserRef.current.smoothingTimeConstant = 0.8; // Smooth out voice jitters

            try {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            } catch (e) {
                // Ignore if already connected
            }
        }

        if (isPlaying && audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const render = () => {
            if (!canvasRef.current || !analyserRef.current) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Handle Resize
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            }

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            // VOICE TUNING: Focus on 100Hz - 3kHz range (indices approx 5 to 100 in 512 FFT)
            // Average amplitude specifically for voice range
            let voiceSum = 0;
            const voiceStart = 5;
            const voiceEnd = 120;
            for (let i = voiceStart; i < voiceEnd; i++) {
                voiceSum += dataArray[i];
            }
            const avg = voiceSum / (voiceEnd - voiceStart);
            const isSilent = avg < 10;

            // Continuous time tick for idle animations
            tickRef.current += 0.01;

            // Clear Background
            if (theme === 'light') {
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; // Clear with slight trail
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Modes
            switch (mode) {
                case 'NUCLEUS': drawNucleus(ctx, canvas, avg, tickRef.current, primaryColor, secondaryColor); break;
                case 'NEURAL': drawNeural(ctx, canvas, dataArray, avg, tickRef.current, primaryColor); break;
                case 'SPECTRUM': drawSpectrum(ctx, canvas, dataArray, avg, primaryColor, secondaryColor); break;
                case 'VORTEX': drawVortex(ctx, canvas, avg, tickRef.current, primaryColor); break;
                case 'SYNAPSE': drawSynapse(ctx, canvas, avg, tickRef.current, primaryColor); break;
                case 'ECLIPSE': drawEclipse(ctx, canvas, avg, tickRef.current, primaryColor); break;
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [audioElement, isPlaying, mode, primaryColor, secondaryColor, theme]);

    // --- VOICE OPTIMIZED DRAWING FUNCTIONS ---

    const drawNucleus = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, energy: number, time: number, c1: string, c2: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Base Pulse (Breathing)
        const breathe = Math.sin(time * 2) * 5;
        const voicePulse = energy / 2; // React to voice
        const radius = 60 + breathe + voicePulse;

        // Core
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, theme === 'light' ? '#FFFFFF' : '#FFFFFF');
        gradient.addColorStop(0.3, c1);
        gradient.addColorStop(0.8, `${c1}40`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Orbital Rings (Data)
        ctx.strokeStyle = c2;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 + (energy / 255);

        // Ring 1
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 1.2, radius * 0.4, time, 0, Math.PI * 2);
        ctx.stroke();

        // Ring 2
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * 1.2, radius * 0.4, -time * 1.5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1.0;
    };

    const drawNeural = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, energy: number, time: number, color: string) => {
        // Constellation nodes that light up on voice
        if (particlesRef.current.length < 50) {
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        // Update & Draw Nodes
        particlesRef.current.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            // Voice reaction: Size boost
            const boost = (energy > 20) ? (energy / 30) : 0;

            ctx.globalAlpha = 0.3 + (boost / 10);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size + boost, 0, Math.PI * 2);
            ctx.fill();

            // Connections
            particlesRef.current.slice(i + 1).forEach(p2 => {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.globalAlpha = (1 - dist / 100) * (0.1 + (energy / 400)); // Brighten connections on voice
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        ctx.globalAlpha = 1.0;
    };

    const drawSpectrum = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, energy: number, c1: string, c2: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bars = 64;
        const radius = 50 + (energy / 5);

        ctx.strokeStyle = c1;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        for (let i = 0; i < bars; i++) {
            // Map bar directly to voice frequencies (5-100 index range)
            const dataIndex = Math.floor(5 + (i / bars) * 100);
            const val = data[dataIndex] || 0;
            const h = (val / 255) * 80;

            const angle = (i / bars) * Math.PI * 2;

            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(angle) * (radius + h + 2); // Min height of 2
            const y2 = cy + Math.sin(angle) * (radius + h + 2);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Inner Circle glow
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
        ctx.fillStyle = `${c2}20`;
        ctx.fill();
        ctx.strokeStyle = c2;
        ctx.stroke();
    };

    // Correcting the drawSpectrum function on the fly inside the string before sending
    const drawSpectrumFixed = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, energy: number, c1: string, c2: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const bars = 64;
        const radius = 50 + (energy / 5);

        ctx.strokeStyle = c1;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        for (let i = 0; i < bars; i++) {
            const dataIndex = Math.floor(5 + (i / bars) * 60); // Focused range
            const val = data[dataIndex] || 0;
            const h = (val / 255) * 60; // Bar height

            const angle = (i / bars) * Math.PI * 2 - (Math.PI / 2); // Start at top

            const x1 = cx + Math.cos(angle) * radius;
            const y1 = cy + Math.sin(angle) * radius;
            const x2 = cx + Math.cos(angle) * (radius + h + 5);
            const y2 = cy + Math.sin(angle) * (radius + h + 5);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Center glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = c1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = c2;
        ctx.fill();
        ctx.shadowBlur = 0;
    };

    const drawVortex = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, energy: number, time: number, color: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Spawn particles
        if (particlesRef.current.length < 100) {
            particlesRef.current.push({
                angle: Math.random() * Math.PI * 2,
                radius: 200 + Math.random() * 100, // Start far out
                speed: 0.5 + Math.random()
            });
        }

        ctx.fillStyle = color;

        particlesRef.current.forEach((p, i) => {
            // Move inward
            const speedMultiplier = 1 + (energy / 20); // Voice speeds up the vortex
            p.radius -= p.speed * speedMultiplier;
            p.angle += 0.01 * speedMultiplier;

            if (p.radius <= 10) {
                p.radius = 200 + Math.random() * 50; // Reset
            }

            const x = cx + Math.cos(p.angle) * p.radius;
            const y = cy + Math.sin(p.angle) * p.radius;

            // Size increases as it gets closer to center (optical illusion) or based on energy?
            // Let's make it sparkle on voice
            const size = (p.radius / 100) * 2 + (energy > 50 ? Math.random() * 2 : 0);

            ctx.globalAlpha = 1 - (p.radius / 250);
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };

    const drawSynapse = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, energy: number, time: number, color: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Matrix Rain / Ring Stream style
        const ringCount = 5;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        for (let i = 1; i <= ringCount; i++) {
            const r = i * 25;
            const speed = i % 2 === 0 ? time : -time;

            // Dash array changes with voice
            const dashLen = 20 + (energy / 5);
            const gapLen = 10 + (energy / 10);

            ctx.setLineDash([dashLen, gapLen]);

            ctx.beginPath();
            ctx.ellipse(cx, cy, r, r, speed * (0.5 + i * 0.1), 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        // Core flash
        if (energy > 50) {
            ctx.fillStyle = color;
            ctx.globalAlpha = energy / 255;
            ctx.beginPath();
            ctx.arc(cx, cy, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    };

    const drawEclipse = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, energy: number, time: number, color: string) => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Zen Ring
        const baseR = 70;
        const pulse = Math.sin(time) * 2;
        const voiceExpand = energy / 5;

        const r = baseR + pulse + voiceExpand;

        // Shadow/Glow
        ctx.shadowBlur = 30 + voiceExpand;
        ctx.shadowColor = color;

        ctx.strokeStyle = color;
        ctx.lineWidth = 4 + (voiceExpand / 5);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Inner peaceful core
        if (theme === 'light') {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = '#000000';
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
        ctx.fill();
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-3xl"
            style={{ filter: mode === 'NEURAL' ? 'contrast(1.2)' : 'none' }}
        />
    );
};
