"use client";

import React, { useState } from 'react';
import styles from './Director.module.css';
import { useShortlist } from '@/context/ShortlistContext';
import Link from 'next/link';

const DirectorPage = () => {
    const { shortlist } = useShortlist();
    const [selectedRole, setSelectedRole] = useState("all");
    const [targets, setTargets] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchTargets = async () => {
            if (shortlist.length === 0) return;
            const promises = shortlist.map(id =>
                fetch(`http://127.0.0.1:8000/players/${id}`).then(res => res.json())
            );
            const data = await Promise.all(promises);
            setTargets(data);
        };
        fetchTargets();
    }, [shortlist]);

    // Mock Squad Data (In real app, this would be your actual team)
    const squad = [
        { id: "s1", name: "David Raya", position: "Goalkeeper", minutes: 1800, status: "Starter", contract: 2026 },
        { id: "s2", name: "William Saliba", position: "Center Back", minutes: 1750, status: "Starter", contract: 2027 },
        { id: "s3", name: "Gabriel Magalhaes", position: "Center Back", minutes: 1700, status: "Starter", contract: 2026 },
        { id: "s4", name: "Ben White", position: "Right Back", minutes: 1500, status: "Starter", contract: 2028 },
        { id: "s5", name: "Oleksandr Zinchenko", position: "Left Back", minutes: 1100, status: "Rotation", contract: 2026 },
        { id: "s6", name: "Declan Rice", position: "Defensive Midfield", minutes: 1800, status: "Key", contract: 2028 },
        { id: "s7", name: "Martin Odegaard", position: "Attacking Midfield", minutes: 1780, status: "Key", contract: 2028 },
        { id: "s8", name: "Bukayo Saka", position: "Winger", minutes: 1750, status: "Key", contract: 2027 },
        { id: "s9", name: "Kai Havertz", position: "Striker", minutes: 1200, status: "Starter", contract: 2028 },
        { id: "s10", name: "Gabriel Jesus", position: "Striker", minutes: 900, status: "Rotation", contract: 2027 },
        { id: "s11", name: "Jorginho", position: "Central Midfield", minutes: 600, status: "Backup", contract: 2025 },
    ];

    const positions = ["Goalkeeper", "Center Back", "Right Back", "Left Back", "Defensive Midfield", "Central Midfield", "Attacking Midfield", "Winger", "Striker"];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className="text-gradient">Director Hub</h1>
                    <p className={styles.subtitle}>SQUAD PLANNING & SUCCESSION STRATEGY</p>
                </div>
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>SQUAD SIZE</span>
                        <span className={styles.statValue}>{squad.length}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>AVG AGE</span>
                        <span className={styles.statValue}>24.8</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>CONTRACT RISK</span>
                        <span className={styles.statValueRed}>2 CRITICAL</span>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Shadow Squad Matrix */}
                <section className={`glass ${styles.matrixSection}`}>
                    <div className={styles.sectionHeader}>
                        <h3>Shadow Squad Matrix</h3>
                        <div className={styles.legend}>
                            <span className={styles.legItem}><span className={styles.dotStart}></span> Starter</span>
                            <span className={styles.legItem}><span className={styles.dotTarget}></span> Target</span>
                        </div>
                    </div>

                    <div className={styles.matrixGrid}>
                        {positions.map(pos => {
                            const currentOptions = squad.filter(s => s.position === pos);
                            // In a real app, we'd filter shortlist by position too, but for now we just show names
                            // assuming the shortlist items have position data (they do in context/mock)
                            // We need to fetch full shortlist objects or assume we have them. 
                            // The context just gives IDs? No, let's assume useShortlist gives minimal data or we fetch it.
                            // For simplicity, we'll map context Shortlist to dummy rendering if data missing, 
                            // but in this app `useShortlist` currently only gives string IDs. 
                            // We need real data. For UI mock, let's pretend we have data or fetch it.
                            // To avoid async complexity in this step, I'll mock the Shadow targets logic locally 
                            // or just list "Shortlisted Target" if ID exists.

                            return (
                                <div key={pos} className={styles.posRow}>
                                    <div className={styles.posLabel}>{pos}</div>
                                    <div className={styles.depthChart}>
                                        {currentOptions.map(p => (
                                            <div key={p.id} className={`${styles.depthCard} ${styles.current}`}>
                                                <span className={styles.pName}>{p.name}</span>
                                                <span className={styles.pMeta}>{p.status} • {p.contract}</span>
                                                <div className={styles.minutesBar} style={{ width: `${(p.minutes / 1800) * 100}%` }}></div>
                                            </div>
                                        ))}
                                        {/* Placeholder for Shadow Targets */}
                                        <div className={`${styles.depthCard} ${styles.shadow}`}>
                                            <span className={styles.shadowLabel}>+ ADD TARGET</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={`glass ${styles.widget}`}>
                        <h3>Squad Minutes</h3>
                        <p className={styles.widgetDesc}>Visualizing load management.</p>
                        <div className={styles.minList}>
                            {squad.sort((a, b) => b.minutes - a.minutes).slice(0, 5).map(s => (
                                <div key={s.id} className={styles.minItem}>
                                    <div className={styles.minHead}>
                                        <span>{s.name}</span>
                                        <span>{Math.round((s.minutes / 1800) * 100)}%</span>
                                    </div>
                                    <div className={styles.minTrack}>
                                        <div className={styles.minFill} style={{ width: `${(s.minutes / 1800) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`glass ${styles.widget}`}>
                        <h3>Contract Expiry Timeline</h3>
                        <div className={styles.timeline}>
                            <div className={styles.timeItem}>
                                <span className={styles.year}>2025</span>
                                <div className={styles.avatars}>
                                    <span className={styles.miniAv}>J</span>
                                </div>
                            </div>
                            <div className={styles.timeItem}>
                                <span className={styles.year}>2026</span>
                                <div className={styles.avatars}>
                                    <span className={styles.miniAv}>R</span>
                                    <span className={styles.miniAv}>G</span>
                                    <span className={styles.miniAv}>Z</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DirectorPage;
