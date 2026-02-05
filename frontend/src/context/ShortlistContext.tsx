"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ShortlistContextType {
    shortlists: Record<string, string[]>;
    toggleShortlist: (playerId: string, category?: string) => Promise<void>;
    isInShortlist: (playerId: string) => boolean;
    createShortlist: (name: string) => Promise<void>;
    deleteShortlist: (name: string) => Promise<void>;
    shortlist: string[]; // Keep for compatibility with simpler components
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(undefined);

export const ShortlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [shortlists, setShortlists] = useState<Record<string, string[]>>({ "General Shortlist": [] });

    useEffect(() => {
        const fetchShortlists = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/watchlist');
                const data = await response.json();
                setShortlists(data);
            } catch (error) {
                console.error("Failed to fetch shortlists:", error);
            }
        };

        fetchShortlists();
    }, []);

    const toggleShortlist = async (playerId: string, category: string = "General Shortlist") => {
        const isInCat = shortlists[category]?.includes(playerId);
        const method = isInCat ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`http://127.0.0.1:8000/watchlist/${encodeURIComponent(category)}/${playerId}`, { method });
            const data = await response.json();
            if (data.status === 'success') {
                setShortlists(data.watchlist);
            }
        } catch (error) {
            console.error(`Failed to ${method} shortlist:`, error);
        }
    };

    const createShortlist = async (name: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/watchlist/category?name=${encodeURIComponent(name)}`, { method: 'POST' });
            const data = await response.json();
            setShortlists(data.watchlist);
        } catch (err) {
            console.error("Failed to create shortlist:", err);
        }
    };

    const deleteShortlist = async (name: string) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/watchlist/category/${encodeURIComponent(name)}`, { method: 'DELETE' });
            const data = await response.json();
            setShortlists(data.watchlist);
        } catch (err) {
            console.error("Failed to delete shortlist:", err);
        }
    };

    const isInShortlist = (playerId: string) => {
        return Object.values(shortlists).some(p => p.includes(playerId));
    };

    // Flatten for simple counters
    const shortlist = Array.from(new Set(Object.values(shortlists).flat()));

    return (
        <ShortlistContext.Provider value={{ shortlists, shortlist, toggleShortlist, isInShortlist, createShortlist, deleteShortlist }}>
            {children}
        </ShortlistContext.Provider>
    );
};

export const useShortlist = () => {
    const context = useContext(ShortlistContext);
    if (!context) {
        throw new Error('useShortlist must be used within a ShortlistProvider');
    }
    return context;
};
