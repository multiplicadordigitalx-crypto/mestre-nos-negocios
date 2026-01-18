import React, { useRef, useEffect } from 'react';

export type VisualizerMode = 'WAVEFORM' | 'SMOKE' | 'ORB' | 'FREQUENCY' | 'STARFIELD' | 'NOVA' | 'SPIRAL' | 'LIQUID';

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

    // Shared State for Particles/Stars
    const particlesRef = useRef<any[]>([]); // For Smoke, Nova, etc
    const starsRef = useRef<any[]>([]);       // Dedicated for Starfield
    const rotationRef = useRef(0);

    // Reset refs on unmount only
    useEffect(() => {
        return () => {
            particlesRef.current = [];
            starsRef.current = [];
        };
    }, []);

    // Explicit Cleanup on Mode Change (Double Safety)
    useEffect(() => {
        if (mode === 'STARFIELD') {
            particlesRef.current = []; // Clear smoke/particles
        } else if (mode === 'SMOKE') {
            starsRef.current = []; // Clear stars
        }
    }, [mode]);

    useEffect(() => {
        if (!audioElement || !canvasRef.current) return;

        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return; // Safety check

            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256; // higher = more detail

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

            if (mode === 'WAVEFORM') {
                analyserRef.current.getByteTimeDomainData(dataArray);
            } else {
                analyserRef.current.getByteFrequencyData(dataArray);
            }

            // Clear with Trail Effect
            // Light Mode: White trail | Dark Mode: Black trail
            if (theme === 'light') {
                ctx.fillStyle = mode === 'STARFIELD' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)';
            } else {
                ctx.fillStyle = mode === 'STARFIELD' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)';
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Modes
            switch (mode) {
                case 'WAVEFORM': drawWaveform(ctx, canvas, dataArray, primaryColor); break;
                case 'FREQUENCY': drawFrequency(ctx, canvas, dataArray, primaryColor, secondaryColor); break;
                case 'ORB': drawOrb(ctx, canvas, dataArray, primaryColor); break;
                case 'SMOKE': drawSmoke(ctx, canvas, dataArray, primaryColor); break;
                case 'STARFIELD': drawStarfield(ctx, canvas, dataArray, primaryColor); break;
                case 'NOVA': drawNova(ctx, canvas, dataArray, primaryColor, secondaryColor); break;
                case 'SPIRAL': drawSpiral(ctx, canvas, dataArray, primaryColor); break;
                case 'LIQUID': drawLiquid(ctx, canvas, dataArray, primaryColor); break;
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [audioElement, isPlaying, mode, primaryColor, secondaryColor, theme]);

    // --- PREMIUM DRAWING FUNCTIONS ---

    const drawLiquid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        // Liquid 'Time' state
        rotationRef.current += 0.005 + (avg / 10000);

        ctx.save();
        ctx.translate(centerX, centerY);

        const radius = 80 + (avg / 2);
        const points = 8; // Number of 'blobs' or vertices

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2 + rotationRef.current;

            // Distort radius based on frequency data wrapping around the circle
            // We map the angle to an index in the frequency data
            const dataIndex = Math.floor((i / points) * 20); // First 20 bins (bass/low-mids)
            const deformity = (data[dataIndex] || 0) / 3;

            // Sine wave perturbation for liquid effect
            const r = radius + deformity + Math.sin(angle * 5 + rotationRef.current * 3) * 15;

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            if (i === 0) ctx.moveTo(x, y);
            else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        // Soft Fluid Gradient
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.5);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.6, `${color}99`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = theme === 'light' ? 10 : 30;
        ctx.shadowColor = color;

        // Fill
        ctx.fill();

        // Inner "Bubble" Highlight
        ctx.globalCompositeOperation = 'overlay';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.restore();
    };



    const drawWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        ctx.lineWidth = 2; // Thinner, sharper
        ctx.strokeStyle = color;
        ctx.shadowBlur = theme === 'light' ? 5 : 15;
        ctx.shadowColor = color;
        ctx.beginPath();

        const sliceWidth = canvas.width * 1.0 / data.length;
        let x = 0;

        // Catmull-Rom spline or simple curve smoothing could be added here, 
        // but for audio data, direct curves often look best if data is dense.
        for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) ctx.moveTo(x, y);
            else {
                // Smooth curves between points
                // const xc = (x + (x - sliceWidth)) / 2;
                // const yc = (y + previousY) / 2;
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    const drawFrequency = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, c1: string, c2: string) => {
        const barWidth = (canvas.width / data.length) * 4; // Wider bars
        let x = 0;

        // Mirror effect for symmetry
        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / 255) * canvas.height * 0.6;

            // Gradient fill for each bar
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, c1);
            gradient.addColorStop(1, `${c1}00`); // Fade to transparent

            ctx.fillStyle = gradient;
            ctx.shadowBlur = 20;
            ctx.shadowColor = c1;

            // Draw rounded top bars
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [5, 5, 0, 0]);
            ctx.fill();

            ctx.shadowBlur = 0;
            x += barWidth + 4;
        }
    };

    const drawOrb = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        // Advanced Orb with internal turbulence
        const bass = data.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const radius = 60 + (bass / 3); // More reactive
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.2, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Core Pulse
        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
        gradient.addColorStop(0, theme === 'light' ? '#FFF' : '#FFF');
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, `${color}00`);

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 50;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
    };

    const drawSmoke = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;

        // Always spawn a little bit to keep it "alive" even in silence
        if (avg > 5 || Math.random() > 0.9) {
            particlesRef.current.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 50,
                y: canvas.height + 20,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1 - (avg / 50), // Speed based on audio
                life: 1.0,
                size: Math.random() * 30 + 10,
                color: color,
                wobble: Math.random() * Math.PI * 2
            });
        }

        ctx.globalCompositeOperation = theme === 'light' ? 'multiply' : 'screen';

        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const p = particlesRef.current[i];

            p.y += p.vy;
            p.x += Math.sin(p.wobble) * 1 + p.vx; // Sine wave drift
            p.wobble += 0.05;
            p.life -= 0.008; // Slower fade for smoother look
            p.size += 0.2;

            if (p.life <= 0) {
                particlesRef.current.splice(i, 1);
                continue;
            }

            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, `${p.color}40`); // Softer core
            grad.addColorStop(1, '#00000000');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
    };

    const drawStarfield = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        // Calculate speed based on bass frequencies only for more impact
        const bass = data.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const speed = 0.5 + (bass / 15); // Base speed ensures it never freezes

        if (starsRef.current.length < 200) {
            starsRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random() * 2, // Depth
                prevZ: 2 // For trails
            });
        }

        ctx.fillStyle = theme === 'light' ? '#333' : '#FFF';
        ctx.strokeStyle = theme === 'light' ? '#333' : '#FFF';
        ctx.lineWidth = 1.5;

        for (let i = 0; i < starsRef.current.length; i++) {
            const p = starsRef.current[i];
            p.prevZ = p.z; // Track previous position for trail
            p.z -= 0.02 * speed;

            if (p.z <= 0) {
                p.z = 2;
                p.prevZ = 2;
                p.x = Math.random() * canvas.width;
                p.y = Math.random() * canvas.height;
            }

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            const x = (p.x - cx) / p.z + cx;
            const y = (p.y - cy) / p.z + cy;

            const prevX = (p.x - cx) / p.prevZ + cx;
            const prevY = (p.y - cy) / p.prevZ + cy;

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                const s = (1 - p.z / 2) * 3;

                // Draw Star
                ctx.beginPath();
                ctx.arc(x, y, s < 0 ? 0 : s, 0, Math.PI * 2);
                ctx.fill();

                // Draw Warp Trail if speed is high
                if (speed > 2) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(prevX, prevY);
                    ctx.globalAlpha = 0.5;
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                }
            }
        }
    };

    const drawNova = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, c1: string, c2: string) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const bass = data.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
        const mid = data.slice(10, 20).reduce((a, b) => a + b, 0) / 10;

        // Base pulsating scale
        const scale = 0.8 + (bass / 200);
        rotationRef.current += 0.005; // Constant slow rotation

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // 1. Inner Core (White Hot)
        const coreGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 60);
        coreGrad.addColorStop(0, '#FFFFFF');
        coreGrad.addColorStop(0.4, c1);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.shadowBlur = 60;
        ctx.shadowColor = c1;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 2. Rotating Energy Rings (Replacing static lines)
        // Ring 1 (Slow, Clockwise)
        ctx.rotate(rotationRef.current);
        ctx.strokeStyle = c2;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const rad = 80 + (mid / 2);
            ctx.rotate(Math.PI / 4);
            ctx.moveTo(rad, 0);
            ctx.arc(0, 0, rad, 0, Math.PI / 8);
        }
        ctx.stroke();

        // Ring 2 (Fast, Counter-Clockwise)
        ctx.rotate(-rotationRef.current * 2.5);
        ctx.strokeStyle = c1;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const rad = 100 + (bass / 3);
            ctx.rotate(Math.PI / 6);
            ctx.moveTo(rad, 0);
            ctx.lineTo(rad + 20, 0); // Short bursts instead of long lines
        }
        ctx.stroke();

        // 3. Dynamic Rays (Subtle, growing from center)
        if (bass > 100) {
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = c2;
            for (let i = 0; i < 6; i++) {
                ctx.rotate(Math.PI / 3);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(200, 20); // Cone shape
                ctx.lineTo(200, -20);
                ctx.fill();
            }
        }

        ctx.restore();
    };

    const drawSpiral = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, data: Uint8Array, color: string) => {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        rotationRef.current += 0.02; // Faster rotation

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRef.current);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;

        // Double Helix style
        for (let i = 0; i < data.length; i += 3) {
            const val = data[i];
            const angle = 0.1 * i;
            // Radius expands with frequency index + audio swell
            const r = 10 + (i * 1.2) + (val / 8);

            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second layer (Ghost echo)
        ctx.rotate(Math.PI);
        ctx.globalAlpha = 0.3;
        ctx.stroke();

        ctx.restore();
    };

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-3xl"
            style={{ filter: mode === 'NOVA' ? 'contrast(1.1) brightness(1.2)' : 'none' }}
        />
    );
};
