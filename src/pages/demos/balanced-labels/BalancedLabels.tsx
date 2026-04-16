import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
    prepareWithSegments,
    measureNaturalWidth,
    measureLineStats,
    layoutWithLines,
} from '@chenglou/pretext';
import useMousePosition from '../../../hooks/mouse-position';
import './balanced-labels.scss';

const LABELS = [
    'Hello World', 'New York City', 'The quick brown fox',
    'React TypeScript', 'Lorem ipsum dolor', 'Canvas animation',
    'Pretext layout engine', 'Web typography', 'Unicode support',
    'Font measurement', 'Variable line width', 'Text reflow',
    'Binary search wrap', 'Shrink wrap text',
];

const LABEL_FONT = 'bold 13px sans-serif';
const LINE_H = 18;
const PADDING_X = 14;
const PADDING_Y = 10;
const STATICITY = 40;
const EASE = 55;

type LabelCard = {
    lines: string[];
    cardW: number;
    cardH: number;
    x: number; y: number;
    translateX: number; translateY: number;
    alpha: number; targetAlpha: number;
    dx: number; dy: number;
    magnetism: number;
    hue: number;
};

// Binary-search the minimum wrap width that keeps text to at most maxLines.
// Each iteration calls measureLineStats — pure arithmetic, no DOM.
// This is the "CSS text-wrap: balance" problem solved in ~18 iterations.
function findBalancedWidth(prepared: ReturnType<typeof prepareWithSegments>, maxLines: number): number {
    const naturalW = measureNaturalWidth(prepared);
    // If text already fits in one line shorter than ~180px, don't force wrap
    if (naturalW <= 120 || maxLines >= 3) return naturalW;
    const { lineCount: currentLines } = measureLineStats(prepared, naturalW);
    if (currentLines <= 1 && naturalW <= 160) return naturalW;

    // Binary search: find smallest width that still fits within maxLines
    let lo = naturalW / (maxLines + 0.5);
    let hi = naturalW;
    for (let i = 0; i < 18; i++) {
        const mid = (lo + hi) / 2;
        const { lineCount } = measureLineStats(prepared, mid);
        if (lineCount <= maxLines) hi = mid;
        else lo = mid;
    }
    return Math.ceil(hi) + 1;
}

function buildCard(label: string, canvasW: number, canvasH: number): LabelCard {
    const prepared = prepareWithSegments(label, LABEL_FONT);
    const innerW = findBalancedWidth(prepared, 2);
    const { lines } = layoutWithLines(prepared, innerW, LINE_H);
    const cardW = innerW + PADDING_X * 2;
    const cardH = lines.length * LINE_H + PADDING_Y * 2;

    return {
        lines: lines.map(l => l.text),
        cardW, cardH,
        x: Math.random() * Math.max(0, canvasW - cardW),
        y: Math.random() * Math.max(0, canvasH - cardH),
        translateX: 0, translateY: 0,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.25).toFixed(2)),
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        magnetism: 0.2 + Math.random() * 1.8,
        hue: Math.random() * 360,
    };
}

function remapValue(v: number, s1: number, e1: number, s2: number, e2: number): number {
    const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2;
    return r > 0 ? r : 0;
}

const BalancedLabels: React.FC = () => {
    const history = useHistory();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const cards = useRef<LabelCard[]>([]);
    const mousePosition = useMousePosition();
    const mouse = useRef({ x: 0, y: 0 });
    const canvasSize = useRef({ w: 0, h: 0 });
    const rafId = useRef<number | null>(null);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    const buildCards = () => {
        const { w, h } = canvasSize.current;
        cards.current = LABELS.map(label => buildCard(label, w, h));
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
        const { w, h } = canvasSize.current;
        ctx.clearRect(0, 0, w, h);

        ctx.font = LABEL_FONT;
        ctx.textBaseline = 'top';

        for (const c of cards.current) {
            const edge = [
                c.x + c.translateX, w - c.x - c.translateX - c.cardW,
                c.y + c.translateY, h - c.y - c.translateY - c.cardH,
            ];
            const closest = edge.reduce((a, b) => Math.min(a, b));
            const remap = Math.round(remapValue(closest, 0, 20, 0, 1) * 100) / 100;
            if (remap > 1) {
                c.alpha += 0.015;
                if (c.alpha > c.targetAlpha) c.alpha = c.targetAlpha;
            } else {
                c.alpha = c.targetAlpha * remap;
            }

            c.x += c.dx;
            c.y += c.dy;
            if (c.x < 0 || c.x + c.cardW > w) { c.dx = -c.dx; c.x = Math.max(0, Math.min(w - c.cardW, c.x)); }
            if (c.y < 0 || c.y + c.cardH > h) { c.dy = -c.dy; c.y = Math.max(0, Math.min(h - c.cardH, c.y)); }

            c.translateX += (mouse.current.x / (STATICITY / c.magnetism) - c.translateX) / EASE;
            c.translateY += (mouse.current.y / (STATICITY / c.magnetism) - c.translateY) / EASE;

            ctx.save();
            ctx.translate(c.translateX, c.translateY);
            ctx.globalAlpha = c.alpha;

            // Draw card background
            ctx.beginPath();
            ctx.roundRect(c.x, c.y, c.cardW, c.cardH, 6);
            ctx.fillStyle = `hsla(${c.hue}, 40%, 18%, 0.9)`;
            ctx.fill();
            ctx.strokeStyle = `hsla(${c.hue}, 55%, 55%, 0.35)`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw balanced text lines — widths computed via binary search with measureLineStats
            ctx.fillStyle = `hsla(${c.hue}, 70%, 82%, 1)`;
            for (let i = 0; i < c.lines.length; i++) {
                ctx.fillText(c.lines[i], c.x + PADDING_X, c.y + PADDING_Y + i * LINE_H);
            }
            ctx.restore();
        }

        rafId.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext('2d');
        resizeCanvas();
        buildCards();
        rafId.current = requestAnimationFrame(animate);
        const handleResize = () => { resizeCanvas(); buildCards(); };
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
        <div className="demo-page" id="balanced-labels-page">
            <a className="demo-back-link" href="#" onClick={e => { e.preventDefault(); history.goBack(); }}>&#8592; Demos</a>
            <div className="demo-canvas-wrapper" ref={containerRef} aria-hidden="true">
                <canvas ref={canvasRef} />
            </div>
            <span className="demo-api-label">measureLineStats() binary search · layoutWithLines()</span>
        </div>
    );
};

export default BalancedLabels;
