import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { prepareWithSegments, measureNaturalWidth } from '@chenglou/pretext';
import useMousePosition from '../../../hooks/mouse-position';
import './multilang.scss';

// Default input intentionally contains multi-codepoint sequences:
//   🏳️‍🌈 = 4 code points, 1 grapheme cluster
//   👨‍👩‍👧‍👦 = 7 code points, 1 grapheme cluster
//   é    = may be 1 or 2 code points depending on normalization
const DEFAULT_TEXT = 'Hello 🏳️‍🌈 👨‍👩‍👧‍👦 مرحبا 你好 🇺🇸 café';

const PARTICLE_FONT = 'bold 20px monospace';
const FONT_SIZE = 20;
const STATICITY = 45;
const EASE = 48;
const MOBILE_BREAKPOINT = 600;
const HIT_AREA = 12; // px either side of the divider line that counts as a hit

type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

type GlyphParticle = {
    char: string;
    width: number;
    x: number; y: number;
    translateX: number; translateY: number;
    alpha: number; targetAlpha: number;
    dx: number; dy: number;
    magnetism: number;
    hue: number;
    half: 'left' | 'right';
};

function remapValue(v: number, s1: number, e1: number, s2: number, e2: number): number {
    const r = ((v - s1) * (e2 - s2)) / (e1 - s1) + s2;
    return r > 0 ? r : 0;
}

function getPretextSegments(text: string): string[] {
    const prepared = prepareWithSegments(text, PARTICLE_FONT);
    return prepared.segments.filter(s => s.trim() !== '');
}

function getNaiveCodepoints(text: string): string[] {
    return Array.from(text).filter(s => s.trim() !== '');
}

function makeParticle(
    char: string,
    width: number,
    half: 'left' | 'right',
    bounds: Bounds,
): GlyphParticle {
    const m = 10;
    return {
        char, width, half,
        x: bounds.minX + m + Math.random() * Math.max(0, bounds.maxX - bounds.minX - m * 2),
        y: bounds.minY + m + Math.random() * Math.max(0, bounds.maxY - bounds.minY - m * 2),
        translateX: 0, translateY: 0,
        alpha: 0,
        targetAlpha: parseFloat((Math.random() * 0.6 + 0.2).toFixed(2)),
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        magnetism: 0.1 + Math.random() * 1.8,
        hue: half === 'left' ? 190 + Math.random() * 60 : 0 + Math.random() * 50,
    };
}

const MultilangParticles: React.FC = () => {
    const history = useHistory();
    const [inputText, setInputText] = useState(DEFAULT_TEXT);
    const [cursorStyle, setCursorStyle] = useState('default');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const leftParticles = useRef<GlyphParticle[]>([]);
    const rightParticles = useRef<GlyphParticle[]>([]);
    const mousePosition = useMousePosition();
    const mouse = useRef({ x: 0, y: 0 });
    const canvasSize = useRef({ w: 0, h: 0 });
    const rafId = useRef<number | null>(null);
    const textRef = useRef(inputText);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    // Draggable divider state
    const dividerPos = useRef(0.5); // fraction 0–1
    const splitAxis = useRef<'horizontal' | 'vertical'>('horizontal');
    const isDragging = useRef(false);
    const segmentCounts = useRef({ pretext: 0, naive: 0 }); // cached to avoid per-frame calls

    const getBounds = (): { first: Bounds; second: Bounds } => {
        const { w, h } = canvasSize.current;
        const d = dividerPos.current;
        if (splitAxis.current === 'horizontal') {
            return {
                first:  { minX: 0,     maxX: w * d, minY: 0,     maxY: h },
                second: { minX: w * d, maxX: w,     minY: 0,     maxY: h },
            };
        }
        return {
            first:  { minX: 0, maxX: w, minY: 0,     maxY: h * d },
            second: { minX: 0, maxX: w, minY: h * d, maxY: h },
        };
    };

    const isNearDivider = (localX: number, localY: number): boolean => {
        const { w, h } = canvasSize.current;
        if (splitAxis.current === 'horizontal') {
            return Math.abs(localX - w * dividerPos.current) < HIT_AREA;
        }
        return Math.abs(localY - h * dividerPos.current) < HIT_AREA;
    };

    const buildParticles = () => {
        const text = textRef.current.trim();

        if (!text) {
            leftParticles.current = [];
            rightParticles.current = [];
            return;
        }

        const leftSegs = getPretextSegments(text);
        const rightSegs = getNaiveCodepoints(text);

        if (leftSegs.length === 0) {
            leftParticles.current = [];
            rightParticles.current = [];
            return;
        }

        segmentCounts.current = { pretext: leftSegs.length, naive: rightSegs.length };

        const _bounds = getBounds();
        const lb = _bounds.first;
        const rb = _bounds.second;
        const firstArea  = (lb.maxX - lb.minX) * (lb.maxY - lb.minY);
        const secondArea = (rb.maxX - rb.minX) * (rb.maxY - rb.minY);

        const leftCount  = Math.max(leftSegs.length,  Math.floor(firstArea  / 9000));
        const rightCount = Math.max(rightSegs.length, Math.floor(secondArea / 9000));

        leftParticles.current = Array.from({ length: leftCount }, (_, i) => {
            const char = leftSegs[i % leftSegs.length];
            const prepared = prepareWithSegments(char, PARTICLE_FONT);
            const width = measureNaturalWidth(prepared) || FONT_SIZE * 0.6;
            return makeParticle(char, width, 'left', lb);
        });

        rightParticles.current = rightSegs.length === 0 ? [] : Array.from({ length: rightCount }, (_, i) => {
            const char = rightSegs[i % rightSegs.length];
            return makeParticle(char, FONT_SIZE * 0.65, 'right', rb);
        });
    };

    const resizeCanvas = () => {
        if (!containerRef.current || !canvasRef.current || !ctxRef.current) return;
        canvasSize.current.w = containerRef.current.offsetWidth;
        canvasSize.current.h = containerRef.current.offsetHeight;
        splitAxis.current = canvasSize.current.w < MOBILE_BREAKPOINT ? 'vertical' : 'horizontal';
        canvasRef.current.width  = canvasSize.current.w * dpr;
        canvasRef.current.height = canvasSize.current.h * dpr;
        canvasRef.current.style.width  = `${canvasSize.current.w}px`;
        canvasRef.current.style.height = `${canvasSize.current.h}px`;
        ctxRef.current.scale(dpr, dpr);
    };

    const animateHalf = (
        ctx: CanvasRenderingContext2D,
        list: GlyphParticle[],
        bounds: Bounds,
    ): GlyphParticle[] => {
        const { minX, maxX, minY, maxY } = bounds;
        const next: GlyphParticle[] = [];
        for (const p of list) {
            // Edge fade uses all 4 bounds
            const edge = [
                p.x + p.translateX - minX,
                maxX - p.x - p.translateX,
                p.y + p.translateY - minY,
                maxY - p.y - p.translateY,
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

            // Bounce off all 4 bounds so particles stay in their half
            if (p.x < minX + 2) { p.x = minX + 2; p.dx =  Math.abs(p.dx); }
            if (p.x > maxX - 2) { p.x = maxX - 2; p.dx = -Math.abs(p.dx); }
            if (p.y < minY + 2) { p.y = minY + 2; p.dy =  Math.abs(p.dy); }
            if (p.y > maxY - 2) { p.y = maxY - 2; p.dy = -Math.abs(p.dy); }

            p.translateX += (mouse.current.x / (STATICITY / p.magnetism) - p.translateX) / EASE;
            p.translateY += (mouse.current.y / (STATICITY / p.magnetism) - p.translateY) / EASE;

            ctx.save();
            ctx.translate(p.translateX, p.translateY);
            ctx.font = PARTICLE_FONT;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
            ctx.fillText(p.char, p.x, p.y);
            ctx.restore();

            next.push(p);
        }
        return next;
    };

    const animate = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        const { w, h } = canvasSize.current;
        const d = dividerPos.current;
        const isHoriz = splitAxis.current === 'horizontal';

        ctx.clearRect(0, 0, w, h);

        // Divider line
        const divX = isHoriz ? w * d : w / 2;
        const divY = isHoriz ? h / 2 : h * d;
        ctx.strokeStyle = isDragging.current ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (isHoriz) { ctx.moveTo(w * d, 0); ctx.lineTo(w * d, h); }
        else         { ctx.moveTo(0, h * d); ctx.lineTo(w, h * d); }
        ctx.stroke();

        // Drag handle — 3 dots centred on the divider
        const dotColor = isDragging.current ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.22)';
        ctx.fillStyle = dotColor;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(
                isHoriz ? divX : divX + i * 8,
                isHoriz ? divY + i * 8 : divY,
                2, 0, Math.PI * 2,
            );
            ctx.fill();
        }


        const animBounds = getBounds();
        const lb = animBounds.first;
        const rb = animBounds.second;
        leftParticles.current  = animateHalf(ctx, leftParticles.current,  lb);
        rightParticles.current = animateHalf(ctx, rightParticles.current, rb);

        rafId.current = requestAnimationFrame(animate);
    };

    // --- Pointer events for draggable divider ---

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = containerRef.current!.getBoundingClientRect();
        if (isNearDivider(e.clientX - rect.left, e.clientY - rect.top)) {
            isDragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const localX = e.clientX - rect.left;
        const localY = e.clientY - rect.top;
        const near = isNearDivider(localX, localY);

        setCursorStyle(
            isDragging.current || near
                ? (splitAxis.current === 'horizontal' ? 'col-resize' : 'row-resize')
                : 'default'
        );

        if (!isDragging.current) return;

        if (splitAxis.current === 'horizontal') {
            dividerPos.current = Math.max(0.15, Math.min(0.85, localX / canvasSize.current.w));
        } else {
            dividerPos.current = Math.max(0.15, Math.min(0.85, localY / canvasSize.current.h));
        }
    };

    const handlePointerUp = () => {
        if (isDragging.current) {
            isDragging.current = false;
            buildParticles();
        }
    };

    // --- Lifecycle ---

    useEffect(() => {
        if (!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext('2d');
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
        textRef.current = inputText;
        if (canvasSize.current.w > 0) buildParticles();
    }, [inputText]);

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
        <div className="demo-page" id="multilang-page">
            <a className="demo-back-link" href="#" onClick={e => { e.preventDefault(); history.goBack(); }}>&#8592; Demos</a>
            <div className="multilang-input-wrap">
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type text with emoji or mixed scripts…"
                    spellCheck={false}
                    aria-label="Text for segmentation comparison"
                />
            </div>
            <div className="multilang-info">
                <div className="multilang-info-row">
                    <span className="multilang-info-badge left">pretext</span>
                    <span className="multilang-info-desc">grapheme clusters — emoji &amp; multi-codepoint sequences stay whole</span>
                </div>
                <div className="multilang-info-row">
                    <span className="multilang-info-badge right">naive</span>
                    <span className="multilang-info-desc">Unicode code points via <code>Array.from()</code> — emoji split into broken fragments</span>
                </div>
            </div>
            <div
                className="demo-canvas-wrapper"
                ref={containerRef}
                style={{ cursor: cursorStyle }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                aria-hidden="true"
            >
                <canvas ref={canvasRef} />
            </div>
            <span className="demo-api-label">prepareWithSegments().segments vs Array.from()</span>
        </div>
    );
};

export default MultilangParticles;
