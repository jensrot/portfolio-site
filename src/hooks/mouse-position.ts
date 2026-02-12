import { useState, useEffect } from "react";

interface MousePosition {
    x: number;
    y: number;
}

/**
 * A custom hook that tracks the user's mouse position globally.
 * * It attaches a 'mousemove' event listener to the window on mount 
 * and ensures the listener is removed on unmount to prevent memory leaks.
 * * @returns {MousePosition} An object containing the current `x` and `y` coordinates.
 */
export default function useMousePosition(): MousePosition {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        /**
         * Updates state with the current mouse coordinates.
         * @param {MouseEvent} event - The native DOM mouse event.
         */
        const handleMouseMove = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        // Cleanup: Remove listener when the component using the hook unmounts
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return mousePosition;
}
