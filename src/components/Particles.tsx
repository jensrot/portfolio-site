import React from 'react'

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

const Particles: React.FC<ParticlesProps> = () => {
    return (
        <div>Canvas</div>
    )
}

export default Particles;
