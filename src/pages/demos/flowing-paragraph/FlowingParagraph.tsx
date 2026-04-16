import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
    prepareWithSegments,
    layoutNextLine,
    type LayoutCursor,
    type PreparedTextWithSegments,
} from '@chenglou/pretext';
import './flowing-paragraph.scss';

const PARAGRAPH =
    'Pretext is a pure JavaScript and TypeScript library for multiline text measurement and layout. ' +
    'It is fast, accurate, and supports all the languages you did not even know about — from Arabic ' +
    'to CJK scripts, emoji, and mixed-direction text. By side-stepping DOM measurements that trigger ' +
    'layout reflow, pretext implements its own text measurement logic using the browser font engine ' +
    'as ground truth. The result is text layout at the speed of pure arithmetic, without touching ' +
    'the DOM. On resize, only the cheap layout pass reruns — the expensive measurement is cached. ' +
    'This makes it possible to reflow text around moving obstacles at sixty frames per second. ' +
    'The library exposes a small, composable API. You call prepareWithSegments once to segment and ' +
    'measure a string, then drive each line through layoutNextLine with whatever maxWidth you choose ' +
    'for that row. Because every call is pure and stateless, you can change the available width on ' +
    'every single line — exactly what this demo does to hug the glowing circles. Traditional CSS ' +
    'text layout gives you one width for the entire block. Pretext gives you a different width per ' +
    'line, computed in microseconds. The segmenter understands grapheme clusters, so multi-codepoint ' +
    'emoji and ligatures are never split mid-glyph. Bidirectional text is handled by the same Unicode ' +
    'bidi algorithm the browser uses, so Arabic and Hebrew run correctly inside a left-to-right ' +
    'paragraph without any extra configuration. Measurement results are cached by font and segment, ' +
    'so repeated calls with the same input are essentially free. The cache is keyed on the font ' +
    'string exactly as you pass it, which means switching between weights or sizes at runtime still ' +
    'benefits from the cache for any previously seen font. Pretext was designed for canvas-based ' +
    'rendering engines, rich text editors, game UIs, and any situation where the DOM is either ' +
    'unavailable or too slow. It runs in the browser, in Node, in workers, and at the edge.';


const TEXT_FONT = '14.5px sans-serif';
const LINE_HEIGHT = 22;
const MARGIN = 28;
const MIN_LINE_WIDTH = 36;

type Obstacle = {
    x: number; y: number; r: number;
    dx: number; dy: number;
    hue: number;
};

const FlowingParagraph: React.FC = () => {
    const history = useHistory();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const canvasSize = useRef({ w: 0, h: 0 });
    const rafId = useRef<number | null>(null);
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    const preparedRef = useRef<PreparedTextWithSegments | null>(null);
    const obstacles = useRef<Obstacle[]>([]);

    const initObstacles = () => {
        const { w, h } = canvasSize.current;
        obstacles.current = [
            { x: w * 0.7, y: h * 0.3, r: 65, dx: 0.7, dy: 0.55, hue: 10 },
            { x: w * 0.8, y: h * 0.65, r: 50, dx: -0.55, dy: 0.8, hue: 185 },
            { x: w * 0.6, y: h * 0.55, r: 42, dx: 0.6, dy: -0.65, hue: 55 },
        ];
    };

    // Compute the left start x and available width for a text line at a given y,
    // accounting for obstacles that intrude from the right.
    const getLineMetrics = (y: number): { leftX: number; lineWidth: number } => {
        const { w } = canvasSize.current;
        let rightX = w - MARGIN;
        for (const obs of obstacles.current) {
            const dy = Math.abs(y - obs.y);
            if (dy < obs.r) {
                const intrusion = Math.sqrt(obs.r * obs.r - dy * dy);
                rightX = Math.min(rightX, obs.x - intrusion - 6);
            }
        }
        return { leftX: MARGIN, lineWidth: Math.max(rightX - MARGIN, MIN_LINE_WIDTH) };
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

        // Move obstacles, bounce off walls
        for (const obs of obstacles.current) {
            obs.x += obs.dx;
            obs.y += obs.dy;
            if (obs.x - obs.r < 0 || obs.x + obs.r > w) obs.dx = -obs.dx;
            if (obs.y - obs.r < 0 || obs.y + obs.r > h) obs.dy = -obs.dy;
        }

        ctx.clearRect(0, 0, w, h);

        // Draw glowing obstacle circles
        for (const obs of obstacles.current) {
            const grad = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, obs.r);
            grad.addColorStop(0, `hsla(${obs.hue}, 85%, 65%, 0.55)`);
            grad.addColorStop(0.5, `hsla(${obs.hue}, 75%, 55%, 0.25)`);
            grad.addColorStop(1, `hsla(${obs.hue}, 70%, 50%, 0)`);
            ctx.beginPath();
            ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // Re-layout the entire paragraph each frame using layoutNextLine.
        // Each line can have a different maxWidth depending on obstacle positions —
        // this is the key capability that pretext provides and plain canvas cannot.
        if (preparedRef.current) {
            ctx.font = TEXT_FONT;
            ctx.textBaseline = 'top';

            let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
            let lineY = MARGIN;

            while (lineY + LINE_HEIGHT <= h - MARGIN) {
                const midY = lineY + LINE_HEIGHT / 2;
                const { leftX, lineWidth } = getLineMetrics(midY);
                // layoutNextLine wraps text to lineWidth and advances the cursor
                const line = layoutNextLine(preparedRef.current, cursor, lineWidth);
                if (!line) break;

                const fadeBottom = Math.min(1, (h - MARGIN - lineY) / (LINE_HEIGHT * 2));
                ctx.fillStyle = `rgba(210, 225, 255, ${0.75 * fadeBottom})`;
                ctx.fillText(line.text, leftX, lineY);

                cursor = line.end;
                lineY += LINE_HEIGHT;
            }
        }

        rafId.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        ctxRef.current = canvasRef.current.getContext('2d');
        resizeCanvas();

        // prepareWithSegments runs once: segments text, measures widths via canvas, caches all.
        // Every subsequent layoutNextLine call is pure arithmetic over those cached widths.
        preparedRef.current = prepareWithSegments(PARAGRAPH, TEXT_FONT);
        initObstacles();
        rafId.current = requestAnimationFrame(animate);

        const handleResize = () => { resizeCanvas(); initObstacles(); };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (rafId.current !== null) cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <div className="demo-page" id="flowing-paragraph-page">
            <a className="demo-back-link" href="#" onClick={e => { e.preventDefault(); history.goBack(); }}>&#8592; Demos</a>
            <div className="demo-canvas-wrapper" ref={containerRef} aria-hidden="true">
                <canvas ref={canvasRef} />
            </div>
            <span className="demo-api-label">layoutNextLine() · variable width per line</span>
        </div>
    );
};

export default FlowingParagraph;
