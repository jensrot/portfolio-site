import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

import "./easter-egg.scss";

const EasterEgg: React.FC = () => {
    
      const [demosRevealed, setDemosRevealed] = useState(
        () => localStorage.getItem('easter_egg_found') === 'true'
      );
      const [isWaiting, setIsWaiting] = useState(false);
      const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
      const waitTime = 2000; // 2 seconds

      const handleEasterEggEnter = () => {
        if (demosRevealed) return;
        setIsWaiting(true);
        hoverTimer.current = setTimeout(() => {
          localStorage.setItem('easter_egg_found', 'true');
          setDemosRevealed(true);
          setIsWaiting(false);
        }, waitTime);
      };
    
      const handleEasterEggLeave = () => {
        if (hoverTimer.current) {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = null;
        }
        setIsWaiting(false);
      };

return (
    <div
        className="easter-egg-zone"
        onMouseEnter={handleEasterEggEnter}
        onMouseLeave={handleEasterEggLeave}
        style={{ cursor: isWaiting ? 'progress' : 'default' }}
        aria-hidden="true"
      >
        {demosRevealed && (
          <Link to="/demos" className="easter-egg-link">demos</Link>
        )}
      </div>
    )
};

export default EasterEgg;