"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ClubTheme {
    primary: string;
    secondary: string;
    accent: string;
}

const ThemeContext = createContext<{ theme: ClubTheme | null }>({ theme: null });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<ClubTheme | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('sb_club');
        if (stored) {
            const club = JSON.parse(stored);
            setTheme(club);

            // Inject CSS variables
            const root = document.documentElement;
            root.style.setProperty('--primary', club.primary);
            root.style.setProperty('--secondary', club.secondary);
            root.style.setProperty('--accent', club.accent);

            // Derivative colors for glass and glows
            root.style.setProperty('--primary-glow', `${club.primary}4D`); // 30% alpha
            root.style.setProperty('--secondary-glow', `${club.secondary}33`); // 20% alpha
        }
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
