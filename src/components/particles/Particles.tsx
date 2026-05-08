import React, { useEffect, useRef } from 'react';
import useMousePosition from '../../hooks/mouse-position';
import { hexToRgb } from '../../utils/hex-to-rgb';

interface ParticlesProps {
    className?: string;
    quantity?: number;
    staticity?: number;
    ease?: number;
    refresh?: boolean;
    color?: string;
    vx?: number;
    vy?: number;
}

const Particles: React.FC<ParticlesProps> = ({
    className = "",
    quantity = 30,
    staticity = 50,
    ease = 50,
    refresh = false,
    color = "#ffffff",
    vx = 0,
    vy = 0,
}) => {

    type Circle = {
        x: number;
        y: number;
        translateX: number;
        translateY: number;
        size: number;
        alpha: number;
        targetAlpha: number;
        dx: number;
        dy: number;
        magnetism: number;
    }

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const circles = useRef<Circle[]>([]);
    const mousePosition = useMousePosition();
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    const frameCount = useRef(0);
    const rafId = useRef<number | null>(null); // Track the animation frame ID

    useEffect(() => {
        if (canvasRef.current) {
            context.current = canvasRef.current.getContext("2d");
        }
        initCanvas();

        // The Animation Loop
        const render = () => {
            animate();
            rafId.current = window.requestAnimationFrame(render);
        };
        rafId.current = window.requestAnimationFrame(render);

        let resizeTimer: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initCanvas, 200);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            // CLEANUP: This prevents the 'removeChild' error
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimer);
            if (rafId.current) {
                window.cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    useEffect(() => {
        initCanvas();
    }, [refresh])

    useEffect(() => {
        onMouseMove();
    }, [mousePosition.x, mousePosition.y]);

    const onMouseMove = () => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const { w, h } = canvasSize.current;
            const x = mousePosition.x - rect.left - w / 2;
            const y = mousePosition.y - rect.top - h / 2;
            const insideCanvas: boolean = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
            if (insideCanvas) {
                mouse.current.x = x;
                mouse.current.y = y;
            }
        }
    };

    const initCanvas = () => {
        console.log('[initCanvas] called | url:', window.location.pathname);
        resizeCanvas();
        drawParticles();
        console.log('[initCanvas] done | circles:', circles.current.length, '| w:', canvasSize.current.w, '| h:', canvasSize.current.h);
    }

    const resizeCanvas = () => {
        if (canvasContainerRef.current && canvasRef.current && context.current) {
            circles.current.length = 0;
            canvasSize.current.w = window.innerWidth;
            canvasSize.current.h = window.innerHeight;
            console.log('[resizeCanvas] using window:', canvasSize.current.w, 'x', canvasSize.current.h, '| container was:', canvasContainerRef.current.offsetWidth, 'x', canvasContainerRef.current.offsetHeight, '| ctx:', !!context.current);
            canvasRef.current.width = canvasSize.current.w * dpr;
            canvasRef.current.height = canvasSize.current.h * dpr;
            canvasRef.current.style.width = `${canvasSize.current.w}px`;
            canvasRef.current.style.height = `${canvasSize.current.h}px`;
            context.current.scale(dpr, dpr);
        } else {
            console.warn('[resizeCanvas] skipped | container:', !!canvasContainerRef.current, '| canvas:', !!canvasRef.current, '| ctx:', !!context.current);
        }
    };

    const circleParams = (): Circle => {
        const x = Math.floor(Math.random() * canvasSize.current.w);
        const y = Math.floor(Math.random() * canvasSize.current.h);
        const translateX = 0;
        const translateY = 0;
        const size = Math.floor(Math.random() * 2) + 1;
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.2;
        const dy = (Math.random() - 0.5) * 0.2;
        const magnetism = 0.1 + Math.random() * 2;
        return { x, y, translateX, translateY, size, alpha, targetAlpha, dx, dy, magnetism };
    };

    const rgb = hexToRgb(color);

    const drawCircle = (circle: Circle, update = false) => {
        // Guard clause: ensure context still exists
        if (context.current && canvasRef.current) {
            const { x, y, translateX, translateY, size, alpha } = circle;
            context.current.translate(translateX, translateY);
            context.current.beginPath();
            context.current.arc(x, y, size, 0, 2 * Math.PI);
            context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`; // TODO: create a random color for each circle.
            context.current.fill();
            context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (!update) {
                circles.current.push(circle);
            }
        }
    };

    const clearContext = () => {
        if (context.current) {
            context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        }
    };

    const drawParticles = () => {
        clearContext();
        const particleCount = quantity;
        for (let i = 0; i < particleCount; i++) {
            const circle = circleParams();
            drawCircle(circle);
        }
    };

    const remapValue = (
        value: number,
        start1: number,
        end1: number,
        start2: number,
        end2: number,
    ): number => {
        const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
        return remapped > 0 ? remapped : 0;
    };

    const animate = () => {
        // Guard clause: If canvas is gone, stop logic execution
        if (!canvasRef.current || !context.current) return;

        frameCount.current++;
        if (frameCount.current % 120 === 0) {
            console.log('[animate] alive | circles:', circles.current.length, '| w:', canvasSize.current.w, '| h:', canvasSize.current.h, '| ctx:', !!context.current);
        }
        if (circles.current.length === 0 && frameCount.current > 10) {
            console.warn('[animate] circles empty | w:', canvasSize.current.w, '| h:', canvasSize.current.h, '| ctx:', !!context.current);
        }
        clearContext();
        const newCircles: Circle[] = [];

        circles.current.forEach((circle: Circle) => {
            // Handle the alpha value
            const edge = [
                circle.x + circle.translateX - circle.size, // distance from left edge
                canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right edge
                circle.y + circle.translateY - circle.size, // distance from top edge
                canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
            ];
            const closestEdge = edge.reduce((a, b) => Math.min(a, b));
            const remapClosestEdge = Math.round(remapValue(closestEdge, 0, 20, 0, 1) * 100) / 100;
            if (remapClosestEdge > 1) {
                circle.alpha += 0.02;
                if (circle.alpha > circle.targetAlpha) {
                    circle.alpha = circle.targetAlpha;
                }
            } else {
                circle.alpha = circle.targetAlpha * remapClosestEdge;
            }
            circle.x += circle.dx + vx;
            circle.y += circle.dy + vy;
            circle.translateX +=
                (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
            circle.translateY +=
                (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

            // Check if circle is out of bounds
            const outOfBounds =
                circle.x < -circle.size ||
                circle.x > canvasSize.current.w + circle.size ||
                circle.y < -circle.size ||
                circle.y > canvasSize.current.h + circle.size;

            if (outOfBounds) {
                // Create and draw a new circle to replace the out-of-bounds one
                const newCircle = circleParams();
                drawCircle(newCircle);
                newCircles.push(newCircle);
            } else {
                // Continue drawing and keep the circle
                drawCircle(circle, true);
                newCircles.push(circle);
            }
        });

        circles.current = newCircles;
        // window.requestAnimationFrame(animate); // REMOVED: Managed by useEffect loop now
    };

    return (
        <div className={className} ref={canvasContainerRef} aria-hidden="true">
            <canvas ref={canvasRef} />
        </div>
    )
}

export default Particles;
