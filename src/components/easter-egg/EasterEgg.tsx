import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./easter-egg.scss";

const waitTime = 1500;

const EasterEgg: React.FC = () => {

  const [demosRevealed, setDemosRevealed] = useState(() => localStorage.getItem('easter_egg_found') === 'true');
  const [isWaiting, setIsWaiting] = useState(false);

  const reveal = () => {
    localStorage.setItem('easter_egg_found', 'true');
    setDemosRevealed(true);
    setIsWaiting(false);
  };

  const cancel = () => setIsWaiting(false);

  // Start the timer after React renders the SVG, so animation and timer stay in sync
  useEffect(() => {
    if (!isWaiting) return;
    const timer = setTimeout(reveal, waitTime);
    return () => clearTimeout(timer);
  }, [isWaiting]);

  // Catch touchend/touchcancel fired outside the zone element on mobile
  useEffect(() => {
    document.addEventListener('touchend', cancel);
    document.addEventListener('touchcancel', cancel);
    return () => {
      document.removeEventListener('touchend', cancel);
      document.removeEventListener('touchcancel', cancel);
    };
  }, []);

  const zoneClass = `easter-egg-zone${demosRevealed ? ' hint-hidden' : ''}${isWaiting ? ' is-waiting' : ''}`;

  return (
    <div
      className={zoneClass}
      onMouseEnter={() => !demosRevealed && setIsWaiting(true)}
      onMouseLeave={cancel}
      onTouchStart={() => !demosRevealed && setIsWaiting(true)}
      onTouchMove={cancel}
      style={{ cursor: isWaiting ? 'progress' : 'default' }}
      aria-hidden={demosRevealed ? undefined : true}
    >
      {!demosRevealed && <span className="sparkle-secondary">✦</span>}
      {isWaiting && (
        <svg className="easter-egg-progress" viewBox="0 0 40 40" width="40" height="40">
          <circle className="easter-egg-progress__track" cx="20" cy="20" r="16" />
          <circle className="easter-egg-progress__fill" cx="20" cy="20" r="16" />
        </svg>
      )}
      {demosRevealed && (
        <Link to="/demos" className="easter-egg-link">demos</Link>
      )}
    </div>
  )
};

export default EasterEgg;
