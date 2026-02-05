"use client";

import React, { useEffect, useState } from 'react';
import { useShortlist } from '@/context/ShortlistContext';
import styles from './Shortlist.module.css';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';
import { API_BASE_URL } from '@/config';

interface Player {
    id: string;
    name: string;
    club: string;
    position: string;
    market_value: string;
    predicted_growth: number;
}

export default function ShortlistPage() {
    const { shortlists, toggleShortlist, createShortlist, deleteShortlist } = useShortlist();
    const [playerData, setPlayerData] = useState<Record<string, Player>>({});
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');

    useEffect(() => {
        const fetchAllPlayers = async () => {
            const allIds = Array.from(new Set(Object.values(shortlists).flat()));
            if (allIds.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const results = await Promise.all(
                    allIds.map(id => fetch(`${API_BASE_URL}/players/${id}`).then(res => res.json()))
                );
                const mapping: Record<string, Player> = {};
                results.forEach(p => { mapping[p.id] = p; });
                setPlayerData(mapping);
            } catch (error) {
                console.error("Watchlist fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPlayers();
    }, [shortlists]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCatName.trim()) {
            createShortlist(newCatName.trim());
            setNewCatName('');
        }
    };

    if (loading) return <div className={styles.loading}>Synchronizing Intelligence Shortlists...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Intelligence Shortlists</h1>
                    <p className={styles.subtitle}>Categorized strategic scouting assets</p>
                </div>
                <form className={styles.createForm} onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="New Shortlist Name..."
                        className={styles.catInput}
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                    />
                    <button type="submit" className={styles.createBtn}>＋ CREATE</button>
                </form>
            </header>

            {Object.keys(shortlists).map(category => (
                <section key={category} className={styles.portfolioSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.categoryTitle}>{category}</h2>
                        <div className={styles.sectionActions}>
                            <span className={styles.countBadge}>{shortlists[category].length} TARGETS</span>
                            {category !== 'General Shortlist' && (
                                <button className={styles.deleteCatBtn} onClick={() => deleteShortlist(category)}>DELETE</button>
                            )}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {shortlists[category].length > 0 ? (
                            shortlists[category].map(id => {
                                const player = playerData[id];
                                if (!player) return null;
                                const isHighValue = parseFloat(player.market_value.replace('€', '').replace('M', '')) > 80;
                                return (
                                    <div key={id} className={`glass ${styles.playerCard}`}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.avatar}>{player.name[0]}</div>
                                            <div className={styles.info}>
                                                <Link href={`/players/${player.id}`} className={styles.name}>{player.name}</Link>
                                                <span className={styles.meta}>{player.club} • {player.position}</span>
                                            </div>
                                            <button
                                                className={styles.unwatchBtn}
                                                onClick={() => toggleShortlist(player.id, category)}
                                            >
                                                −
                                            </button>
                                        </div>
                                        <div className={styles.cardStats}>
                                            <div className={styles.stat}>
                                                <span className={styles.statLabel}>VALUE</span>
                                                <span className={styles.statValue}>{formatCurrency(player.market_value)}</span>
                                            </div>
                                            <div className={styles.stat}>
                                                <span className={styles.statLabel}>BUDGETARY FIT</span>
                                                <span className={`${styles.statValue} ${isHighValue ? styles.highValue : styles.lowValue}`}>
                                                    {isHighValue ? 'EXCEEDS CEILING' : 'OPTIMAL'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.emptyCat}>No targets assigned to this shortlist.</div>
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}
