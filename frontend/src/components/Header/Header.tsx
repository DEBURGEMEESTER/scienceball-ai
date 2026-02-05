"use client";

import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import SearchOverlay from '../SearchOverlay/SearchOverlay';
import { API_BASE_URL } from '@/config';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).toUpperCase();
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                setIsOverlayVisible(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/players/search?q=${searchQuery}`);
                const data = await response.json();
                setSearchResults(data);
                setIsOverlayVisible(true);
            } catch (error) {
                console.error('Search failed:', error);
            }
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOverlayVisible(true);
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <div className={styles.simDate}>
                    <span className={styles.dateLabel}>SYSTEM CLOCK</span>
                    <span className={styles.dateValue}>
                        {hasMounted ? `${formatDate(currentTime)} | ${formatTime(currentTime)}` : 'SYNCHRONIZING...'}
                    </span>
                </div>
            </div>

            <div className={styles.search}>
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search players, clubs or metrics..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length > 1 && setIsOverlayVisible(true)}
                    />
                </form>
                <SearchOverlay
                    results={searchResults}
                    isVisible={isOverlayVisible}
                    onClose={() => setIsOverlayVisible(false)}
                />
            </div>

            <div className={styles.user}>
                <div className={styles.credits}>
                    <span className={styles.creditLabel}>SUBSCRIPTION</span>
                    <span className={styles.creditValue}>ELITE PLATINUM</span>
                </div>
                <div className={styles.avatar}>LS</div>
            </div>
        </header>
    );
};

export default Header;
