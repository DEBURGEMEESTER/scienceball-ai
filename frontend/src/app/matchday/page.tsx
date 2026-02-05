"use client";

import React, { useEffect, useState } from 'react';
import styles from './Matchday.module.css';
import PitchHeatmap from '@/components/PitchHeatmap/PitchHeatmap';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

interface ScoutReport {
    opponent: string;
    date: string;
    venue: string;
    tactical_brief: string[];
    win_probability_boost: number;
    recommended_role: string;
}

const LEAGUE_FORMATIONS = [
    { team: "Ajax", formation: "4-3-3", style: "Positional", dangerous_player: "Hato" },
    { team: "Feyenoord", formation: "4-2-3-1", style: "High Press", dangerous_player: "Timber" },
    { team: "PSV", formation: "4-3-3", style: "Vertical", dangerous_player: "Bakayoko" },
    { team: "AZ", formation: "4-3-3", style: "Balanced", dangerous_player: "Clasie" },
    { team: "Twente", formation: "4-2-3-1", style: "Compact", dangerous_player: "Steijn" },
];

const MatchdayPage = () => {
    const [report, setReport] = useState<ScoutReport | null>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/analytics/scout-report`)
            .then(res => res.json())
            .then(data => setReport(data))
            .catch(err => console.error("Failed to fetch scout report:", err));
    }, []);

    if (!report) return <div className={styles.loading}>Generating analytical briefing...</div>;

    return (
        <div className={styles.matchdayContainer}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className="text-gradient">Tactical Manager Prep</h1>
                    <p className={styles.subtitle}>Intelligence Briefing • Next Fixture: {report.opponent} ({report.venue})</p>
                </div>
                <div className={styles.matchStatus}>
                    <div className={styles.statusBox}>
                        <span className={styles.label}>TACTICAL ADVANTAGE</span>
                        <span className={styles.value}>+{report.win_probability_boost}%</span>
                    </div>
                </div>
            </header>

            <div className={styles.layout}>
                <main className={styles.content}>
                    <div className={styles.topRow}>
                        <section className={`glass ${styles.tacticalBoard}`}>
                            <div className={styles.boardHeader}>
                                <h2>Tactical Board</h2>
                                <span className={styles.tag}>ZONE CONTROL xT</span>
                            </div>
                            <PitchHeatmap />
                        </section>

                        <section className={`glass ${styles.leagueIntel}`}>
                            <div className={styles.boardHeader}>
                                <h2>League Formations</h2>
                                <span className={styles.tag}>EREDIVISIE 24/25</span>
                            </div>
                            <div className={styles.formationTable}>
                                {LEAGUE_FORMATIONS.map((f, i) => (
                                    <div key={i} className={styles.formationRow}>
                                        <span className={styles.teamName}>{f.team}</span>
                                        <span className={styles.formationVal}>{f.formation}</span>
                                        <span className={styles.styleTag}>{f.style}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className={`glass ${styles.oppositionScout}`}>
                        <div className={styles.boardHeader}>
                            <h2>Manager's Tactical Directives</h2>
                            <span className={styles.tag}>VS {report.opponent.toUpperCase()}</span>
                        </div>
                        <div className={styles.intelGrid}>
                            <div className={styles.intelCard}>
                                <h3>Defensive Vulnerability</h3>
                                <p>{report.tactical_brief[0]}</p>
                                <Link href="/scout" className={styles.solutionBridge}>FIND DEFENSIVE SOLUTION →</Link>
                            </div>
                            <div className={styles.intelCard}>
                                <h3>Build-up Recommendation</h3>
                                <p>{report.tactical_brief[1]}</p>
                                <Link href="/scout" className={styles.solutionBridge}>FIND PROGRESSIVE PIVOT →</Link>
                            </div>
                        </div>
                    </section>
                </main>

                <aside className={styles.sidebar}>
                    <div className={`glass ${styles.briefingPanel}`}>
                        <h2 className={styles.sectionTitle}>Technical Briefing</h2>
                        <div className={styles.briefContent}>
                            <div className={styles.briefItem}>
                                <span className={styles.bullet}>▸</span>
                                <p>Exploit **Half-spaces** to bypass the opposition mid-block.</p>
                            </div>
                            <div className={styles.briefItem}>
                                <span className={styles.bullet}>▸</span>
                                <p>Transition focus: High-intensity counter-pressing in Zone 14.</p>
                            </div>
                        </div>
                    </div>

                    <div className={`glass ${styles.shortlistIntegration}`}>
                        <h2 className={styles.sectionTitle}>Tactical Fit (Shortlist)</h2>
                        <div className={styles.targetList}>
                            <p className={styles.shortlistNote}>Analyze your **Elite Prospects** shortlist to identify the perfect tactical alignment for this fixture.</p>
                        </div>
                        <Link href="/watchlist" className={styles.solutionBridge}>MANAGE SHORTLISTS →</Link>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default MatchdayPage;
