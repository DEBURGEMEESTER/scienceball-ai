"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

import { Player } from '@/types';

interface ComparisonContextType {
    selectedPlayers: Player[];
    togglePlayer: (player: Player) => void;
    clearComparison: () => void;
    isInComparison: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

    const togglePlayer = (player: Player) => {
        setSelectedPlayers(prev => {
            const exists = prev.find(p => p.id === player.id);
            if (exists) {
                return prev.filter(p => p.id !== player.id);
            }
            if (prev.length >= 2) {
                // Limit to 2 for side-by-side comparison in this version
                return [prev[1], player];
            }
            return [...prev, player];
        });
    };

    const clearComparison = () => setSelectedPlayers([]);

    const isInComparison = (id: string) => selectedPlayers.some(p => p.id === id);

    return (
        <ComparisonContext.Provider value={{ selectedPlayers, togglePlayer, clearComparison, isInComparison }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export const useComparison = () => {
    const context = useContext(ComparisonContext);
    if (!context) {
        throw new Error('useComparison must be used within a ComparisonProvider');
    }
    return context;
};
