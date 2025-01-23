export const settings: Array<Object> = [
    {
        particles: {
            number: {
                value: 200,
                density: {
                    enable: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    speed: 6,
                    size_min: 0.3
                }
            },
            line_linked: {
                enable: false
            },
            move: {
                random: true,
                speed: 1,
                direction: "top",
                out_mode: "out"
            }
        },
        interactivity: {
            events: {
                onhover: {
                    enable: true,
                    mode: "bubble"
                },
                onclick: {
                    enable: true,
                    mode: "repulse"
                }
            },
            modes: {
                bubble: {
                    distance: 250,
                    duration: 2,
                    size: 0,
                    opacity: 0
                },
                repulse: {
                    distance: 400,
                    duration: 4
                }
            }
        }
    }
];