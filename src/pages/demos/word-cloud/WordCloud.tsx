import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { prepareWithSegments, measureNaturalWidth } from '@chenglou/pretext';
import useMousePosition from '../../../hooks/mouse-position';
import './word-cloud.scss';

const WORDS = [
    'pretext', 'layout', 'canvas', 'Unicode', 'React', 'TypeScript',
    'measurement', 'reflow', 'bidi', 'Intl', 'grapheme', 'kerning',
    'animation', 'WebGL', 'SVG', 'font', 'ligature', 'segment',
    'linebreak', 'CJK', 'Arabic', 'emoji', 'cursor', 'viewport',
    'monospace', 'serif', 'advance', 'glyph', 'hyphen', 'wrap',
];
const SIZES = [13, 17, 21, 26, 32];
const STATICITY = 45;
const EASE = 50;

type WordParticle = {
    text: string;
    measuredWidth: number;
    fontSize: number;
    font: string;
    x: number; y: number;
    translateX: number; translateY: number;
    alpha: number; targetAlpha: number;
    dx: number; dy: number;
    magnetism: number;
    hue: number;
};

function remapValue(v: number, s1: number, e1: number, s2: number, e2: number): number {
    const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2;
    return r > 0 ? r : 0;
}

const WordCloud: React.FC = () => {
    const history = useHistory();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const particles = useRef<WordParticle[]>([]);
    const mousePosition = useMousePosition();
    const mouse = useRef({ x: 0, y: 0 });
    const canvasSize = useRef({ w: 0, h: 0 });
    const rafId = useRef<number | null>(null);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    // Pre-measure all (word, size) combos with pretext once at startup
    const measured = useRef<{ text: string; measuredWidth: number; fontSize: number; font: string }[]>([]);

    const makeParticle = (entry: typeof measured.current[number]): WordParticle => ({
        ...entry,
        x: Math.random() * canvasSize.current.w,
        y: Math.random() * canvasSize.current.h,
        translateX: 0, translateY: 0,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.55 + 0.2).toFixed(2)),
        dx: (Math.random() - 0.5) * 0.45,
        dy: (Math.random() - 0.5) * 0.45,
        magnetism: 0.2 + Math.random() * 2,
        hue: Math.random() * 360,
    });

    const buildParticles = () => {
        const { w, h } = canvasSize.current;
        const count = Math.max(WORDS.length, Math.floor((w * h) / 14000));
        particles.current = Array.from({ length: count }, (_, i) =>
            makeParticle(measured.current[i % measured.current.length])
        );
    };

    const resizeCanvas = () => {
        if (!containerRef.current || !canvasRef.current || !ctxRef.current) return;
        canvasSize.current.w = containerRef.current.offsetWidth;
        canvasSize.current.h = containerRef.current.offsetHeight;
        canvasRef.current.width = canvasSize.current.w * dpr;
        canvasRef.current.height = canvasSize.current.h * dpr;
        canvasRef.current.style.width = `${canvasSize.current.w}px`;
        canvasRef.current.style.height = `${canvasSize.current.h}px`;
        ctxRef.current.scale(dpr, dpr);
    };

    const animate = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

        const next: WordParticle[] = [];
        for (const p of particles.current) {
            const edge = [
                p.x + p.translateX, canvasSize.current.w - p.x - p.translateX,
                p.y + p.translateY, canvasSize.current.h - p.y - p.translateY,
            ];
            const closest = edge.reduce((a, b) => Math.min(a, b));
            const remap = Math.round(remapValue(closest, 0, 20, 0, 1) * 100) / 100;
            if (remap > 1) {
                p.alpha += 0.02;
                if (p.alpha > p.targetAlpha) p.alpha = p.targetAlpha;
            } else {
                p.alpha = p.targetAlpha * remap;
            }

            p.x += p.dx;
            p.y += p.dy;
            p.translateX += (mouse.current.x / (STATICITY / p.magnetism) - p.translateX) / EASE;
            p.translateY += (mouse.current.y / (STATICITY / p.magnetism) - p.translateY) / EASE;

            // Use pretext-measured width for accurate out-of-bounds check
            const oob =
                p.x < -(p.measuredWidth + 10) ||
                p.x > canvasSize.current.w + p.measuredWidth + 10 ||
                p.y < -(p.fontSize + 10) ||
                p.y > canvasSize.current.h + p.fontSize + 10;

            if (oob) {
                p.x = Math.random() * canvasSize.current.w;
                p.y = Math.random() * canvasSize.current.h;
                p.translateX = 0; p.translateY = 0;
                p.alpha = 0;
            }

            ctx.save();
            ctx.translate(p.translateX, p.translateY);
            ctx.font = p.font;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `hsla(${p.hue}, 75%, 70%, ${p.alpha})`;
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();

            next.push(p);
        }
        particles.current = next;
        rafId.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext('2d');

        // Measure every (word, size) pair with pretext — done once, no DOM needed
        measured.current = WORDS.flatMap(word =>
            SIZES.map(fontSize => {
                const font = `bold ${fontSize}px monospace`;
                const prepared = prepareWithSegments(word, font);
                return { text: word, measuredWidth: measureNaturalWidth(prepared), fontSize, font };
            })
        );

        resizeCanvas();
        buildParticles();
        rafId.current = requestAnimationFrame(animate);

        const handleResize = () => { resizeCanvas(); buildParticles(); };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = mousePosition.x - rect.left - w / 2;
        const y = mousePosition.y - rect.top - h / 2;
        if (x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2) {
            mouse.current.x = x;
            mouse.current.y = y;
        }
    }, [mousePosition.x, mousePosition.y]);

    return (
        <div className="demo-page" id="word-cloud-page">
            <a className="demo-back-link" href="#" onClick={e => { e.preventDefault(); history.goBack(); }}>&#8592; Demos</a>
            <div className="demo-canvas-wrapper" ref={containerRef} aria-hidden="true">
                <canvas ref={canvasRef} />
            </div>
            <span className="demo-api-label">measureNaturalWidth()</span>
        </div>
    );
};

export default WordCloud;
