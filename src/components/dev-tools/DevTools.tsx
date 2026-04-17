import React from 'react';

import './dev-tools.scss';

const DevTools: React.FC = () => {

    const handleClearEasterEgg = () => {
        localStorage.removeItem('easter_egg_found');
        window.location.reload();
    };

    return (
        <div className="dev-tools">
            <button onClick={handleClearEasterEgg} title="Reset easter egg (dev only)">
                🥚 reset
            </button>
        </div>
    );
};

export default DevTools;
