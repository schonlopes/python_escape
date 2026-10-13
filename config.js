
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        space: {
                            900: '#030712',
                            800: '#090d1f',
                            700: '#111827',
                            600: '#1f293d',
                        },
                        cyber: {
                            cyan: '#00f0ff',
                            purple: '#b026ff',
                            blue: '#0077ff',
                            pink: '#ff007f',
                            green: '#00ff88',
                            orange: '#ff9900',
                            red: '#ff2a6d'
                        }
                    },
                    fontFamily: {
                        mono: ['Fira Code', 'Courier New', 'monospace'],
                        sans: ['Inter', 'sans-serif']
                    },
                    boxShadow: {
                        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.2)',
                        'neon-purple': '0 0 15px rgba(176, 38, 255, 0.5), inset 0 0 15px rgba(176, 38, 255, 0.2)',
                        'neon-green': '0 0 15px rgba(0, 255, 136, 0.5), inset 0 0 15px rgba(0, 255, 136, 0.2)',
                        'neon-red': '0 0 15px rgba(255, 42, 109, 0.5), inset 0 0 15px rgba(255, 42, 109, 0.2)',
                    }
                }
            }
        }
    