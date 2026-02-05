"use client";

import React, { useEffect, useState } from 'react';
import styles from './Planner.module.css';
import { API_BASE_URL } from '@/config';

interface Gap {
    pos: string;
    reason: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface StabilityData {
    overall_stability: number;
    critical_gaps: Gap[];
    positional_health: Record<string, number>;
}

const SquadPlannerPage = () => {
    const [data, setData] = useState<StabilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [successors, setSuccessors] = useState<Record<string, any[]>>({});

    const fetchSuccessors = async (pos: string) => {
        // Mocking a lookup for a player in that position. 
        // In a real app, this would be based on the aging star player's ID.
        // For now, let's just fetch for 'lamine-yamal' if RW, or use a general pool.
        const mockPlayerId = pos === 'RB' ? 'kobbie-mainoo' : 'lamine-yamal';
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/players/${mockPlayerId}/successors`);
            const val = await res.json();
            setSuccessors(prev => ({ ...prev, [pos]: val }));
        } catch (err) {
            console.error("Successor fetch failed:", err);
        }
    };

    useEffect(() => {
        // ... existing fetch for data ...
        fetch(`${API_BASE_URL}/analytics/squad/stability`)
            .then(res => res.json())
            .then(val => {
                setData(val);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch stability data:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className={styles.loading}>Analyzing squad DNA...</div>;
    if (!data) return <div className={styles.error}>Intelligence data unavailable.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className="text-gradient">Squad Planning Office</h1>
                    <p className={styles.subtitle}>Strategic Positional Stability • Season 2024/25</p>
                </div>
                <div className={styles.stabilityMetrics}>
                    <div className={styles.metricBox}>
                        <span className={styles.metricLabel}>OVERALL STABILITY</span>
                        <span className={styles.metricValue}>{data.overall_stability}%</span>
                    </div>
                </div>
            </header>

            <div className={styles.grid}>
                <section className={styles.mainContent}>
                    <div className={`glass ${styles.healthMatrix}`}>
                        <h2 className={styles.sectionTitle}>Positional Health Matrix</h2>
                        <div className={styles.healthGrid}>
                            {Object.entries(data.positional_health).map(([pos, val]) => (
                                <div key={pos} className={styles.healthItem}>
                                    <span className={styles.posLabel}>{pos}</span>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{
                                                width: `${val}%`,
                                                backgroundColor: val > 80 ? '#00ff88' : val > 60 ? 'var(--primary)' : '#ff4444'
                                            }}
                                        ></div>
                                    </div>
                                    <span className={styles.posValue}>{val}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`glass ${styles.gapAnalysis}`}>
                        <h2 className={styles.sectionTitle}>Critical Gap Identification</h2>
                        <div className={styles.gapList}>
                            {data.critical_gaps.map((gap, i) => (
                                <div key={i} className={`${styles.gapCard} ${styles[gap.priority.toLowerCase()]}`}>
                                    <div className={styles.gapHeader}>
                                        <span className={styles.gapPos}>{gap.pos}</span>
                                        <span className={styles.gapPriority}>{gap.priority} PRIORITY</span>
                                    </div>
                                    <p className={styles.gapReason}>{gap.reason}</p>

                                    {successors[gap.pos] && (
                                        <div className={styles.successorList}>
                                            <span className={styles.successorLabel}>IDENTIFIED PROSPECTS:</span>
                                            {successors[gap.pos].slice(0, 2).map(s => (
                                                <div key={s.id} className={styles.successorItem}>
                                                    <span>{s.name} ({s.age}y)</span>
                                                    <span className={styles.fitScore}>{s.fit_score}% FIT</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        className={styles.findSuccessorBtn}
                                        onClick={() => fetchSuccessors(gap.pos)}
                                    >
                                        {successors[gap.pos] ? 'REFRESH SCAN' : 'FIND REPLACEMENT / SUCCESSOR'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={`glass ${styles.strategicBrief}`}>
                        <h2 className={styles.sectionTitle}>Strategic Brief</h2>
                        <p className={styles.briefText}>
                            The defense sector indicates significant vulnerability. Failure to identify a U23 Right-Back successor within the next two windows represents a 15% risk to overall squad reliability.
                        </p>
                        <ul className={styles.recommendations}>
                            <li>▸ Scan HNL & Primeira Liga for high-potential RB profiles.</li>
                            <li>▸ Prioritize players with 15+ Acceleration metrics.</li>
                        </ul>
                    </div>

                    <div className={`glass ${styles.budgetPanel}`}>
                        <h2 className={styles.sectionTitle}>Budgetary Ceiling</h2>
                        <div className={styles.budgetMetrics}>
                            <div className={styles.budgetRow}>
                                <span>TOTAL POOL</span>
                                <span className={styles.budgetValue}>€120M</span>
                            </div>
                            <div className={styles.budgetRow}>
                                <span>COMMITTED</span>
                                <span className={styles.budgetValue}>€45M</span>
                            </div>
                            <div className={styles.budgetDivider}></div>
                            <div className={styles.budgetRow}>
                                <span className={styles.availableLabel}>AVAILABLE</span>
                                <span className={styles.availableValue}>€75M</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SquadPlannerPage;
