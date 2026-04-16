import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
    prepareWithSegments,
    measureNaturalWidth,
    measureLineStats,
    layoutWithLines,
} from '@chenglou/pretext';
import './typewriter-stream.scss';

const PHRASES = [
    'Hello World', 'text layout', 'no DOM reflow', 'pure arithmetic',
    'canvas rendering', 'font engine', 'line breaking', 'Unicode support',
    'pretext library', 'tight fit', 'shrink wrap', 'accurate width',
    'badge sizing', 'zero reflow', 'fast layout', 'CJK support',
    'emoji aware', 'bidi text', 'soft hyphen', 'overflow wrap',
];

const BADGE_FONT = 'bold 13px sans-serif';
const LINE_H = 18;
const PADDING_X = 12;
const PADDING_Y = 8;
const MAX_INNER_W = 160;

type Badge = {
    text: string;
    lines: string[];
    cardW: number;
    cardH: number;
    x: number; y: number;
    alpha: number;
    speed: number;
    hue: number;
};

// Binary-search the tightest inner width that keeps text to at most maxLines.
// Uses measureLineStats (pure arithmetic after prepare) — no DOM touched.
function findTightWidth(prepared: ReturnType<typeof prepareWithSegments>, maxLines: number): number {
    const naturalW = measureNaturalWidth(prepared);
    if (naturalW <= MAX_INNER_W) return naturalW;
    let lo = naturalW / (maxLines + 1);
    let hi = naturalW;
    for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        const { lineCount } = measureLineStats(prepared, mid);
        if (lineCount <= maxLines) hi = mid;
        else lo = mid;
    }
    return Math.ceil(hi) + 1;
}

function spawnBadge(canvasSize: { w: number; h: number }, phraseIndex: number): Badge {
    const text = PHRASES[phraseIndex % PHRASES.length];
    const prepared = prepareWithSegments(text, BADGE_FONT);

    // Compute tight inner width (no DOM, pure pretext arithmetic)
    const innerW = findTightWidth(prepared, 2);
    const { lines } = layoutWithLines(prepared, innerW, LINE_H);

    const cardW = innerW + PADDING_X * 2;
    const cardH = lines.length * LINE_H + PADDING_Y * 2;

    return {
        text,
        lines: lines.map(l => l.text),
        cardW,
        cardH,
        x: canvasSize.w + 10,
        y: PADDING_Y + Math.random() * Math.max(0, canvasSize.h - cardH - PADDING_Y * 2),
        alpha: 0,
        speed: 0.5 + Math.random() * 0.8,
        hue: Math.random() * 360,
    };
}

const TypewriterStream: React.FC = () => {
    const history = useHistory();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const badges = useRef<Badge[]>([]);
    const canvasSize = useRef({ w: 0, h: 0 });
    const rafId = useRef<number | null>(null);
    const phraseIdx = useRef(0);
    const lastSpawn = useRef(0);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

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

    const animate = (timestamp: number) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const { w, h } = canvasSize.current;
        ctx.clearRect(0, 0, w, h);

        // Spawn a new badge every ~1.4 seconds
        if (timestamp - lastSpawn.current > 1400) {
            badges.current.push(spawnBadge(canvasSize.current, phraseIdx.current++));
            lastSpawn.current = timestamp;
        }

        ctx.font = BADGE_FONT;
        ctx.textBaseline = 'top';

        const next: Badge[] = [];
        for (const b of badges.current) {
            // Fade in as badge enters from right, fade out as it exits left
            const fadeIn = Math.min(1, (w - b.x) / 60);
            const fadeOut = Math.min(1, (b.x + b.cardW) / 80);
            b.alpha = Math.min(fadeIn, fadeOut);
            b.x -= b.speed;

            if (b.x + b.cardW < -10) continue; // remove off-screen

            // Draw badge background (rounded rect)
            ctx.save();
            ctx.globalAlpha = b.alpha;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, b.cardW, b.cardH, 6);
            ctx.fillStyle = `hsla(${b.hue}, 45%, 22%, 0.85)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${b.hue}, 60%, 55%, 0.5)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw text lines — their positions came from layoutWithLines, no DOM
            ctx.fillStyle = `hsla(${b.hue}, 80%, 82%, 1)`;
            for (let i = 0; i < b.lines.length; i++) {
                ctx.fillText(b.lines[i], b.x + PADDING_X, b.y + PADDING_Y + i * LINE_H);
            }
            ctx.restore();

            next.push(b);
        }
        badges.current = next;
        rafId.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext('2d');
        resizeCanvas();

        // Pre-spawn a few badges so the canvas isn't empty at start
        for (let i = 0; i < 5; i++) {
            const b = spawnBadge(canvasSize.current, phraseIdx.current++);
            b.x = Math.random() * canvasSize.current.w;
            badges.current.push(b);
        }

        rafId.current = requestAnimationFrame(animate);
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <div className="demo-page" id="typewriter-stream-page">
            <a className="demo-back-link" href="#" onClick={e => { e.preventDefault(); history.goBack(); }}>&#8592; Demos</a>
            <div className="demo-canvas-wrapper" ref={containerRef} aria-hidden="true">
                <canvas ref={canvasRef} />
            </div>
            <span className="demo-api-label">measureLineStats() binary search · layoutWithLines()</span>
        </div>
    );
};

export default TypewriterStream;
