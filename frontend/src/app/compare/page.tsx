"use client";

import React, { useEffect, useState } from 'react';
import { useComparison } from '@/context/ComparisonContext';
import { useShortlist } from '@/context/ShortlistContext';
import styles from './ComparisonPage.module.css';
import RadarChart from '@/components/RadarChart/RadarChart';
import Link from 'next/link';
import { generatePlayerReport } from '@/utils/ReportGenerator';
import AttributeGrid from '@/components/AttributeGrid/AttributeGrid';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import { Player } from '@/types';
import { API_BASE_URL } from '@/config';

export default function ComparisonPage() {
    const { selectedPlayers, togglePlayer } = useComparison();
    const { shortlists } = useShortlist();
    const [playersData, setPlayersData] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);

    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const hist = JSON.parse(localStorage.getItem('scouting_history') || '[]');
        setHistory(hist);
    }, []);

    const handleSearch = async (q: string) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/players/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchPlayers = async () => {
            if (selectedPlayers.length < 1) {
                setPlayersData([]);
                return;
            }
            setLoading(true);
            try {
                const results = await Promise.all(
                    selectedPlayers.map(async p => {
                        const base = await fetch(`${API_BASE_URL}/players/${p.id}`).then(res => res.json());
                        const growth = await fetch(`${API_BASE_URL}/players/${p.id}/growth-prediction`).then(res => res.json());
                        return { ...base, trajectory: growth.trajectory };
                    })
                );
                setPlayersData(results);
            } catch (error) {
                console.error("Comparison fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [selectedPlayers]);

    // Flatten shortlist for easy comparison
    const allShortlistedIds = Array.from(new Set(Object.values(shortlists).flat()));

    // Chart logic
    const chartData = playersData.length >= 1 ? (playersData[0]?.trajectory?.map((point, i) => {
        const row: any = { label: point.label };
        playersData.forEach(p => {
            row[p.name] = p.trajectory?.[i]?.value || 0;
        });
        return row;
    }) || []) : [];

    return (
        <div className={styles.container} id="comparison-content">
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className="text-gradient">DNA Correlation Analysis</h1>
                    <p className={styles.subtitle}>Side-by-side technical profiling & growth forecast</p>
                </div>

                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Add player to DNA analysis..."
                        className={styles.compareSearch}
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => setShowResults(true)}
                    />
                    {showResults && (
                        <div className={styles.resultsDropdown}>
                            {searchQuery.length < 2 && (
                                <>
                                    <div className={styles.groupLabel}>RECENTLY VIEWED</div>
                                    {history.map(p => (
                                        <div key={p.id} className={styles.searchItem} onClick={() => { togglePlayer(p); setShowResults(false); }}>
                                            <span>{p.name}</span>
                                            <span className={styles.itemMeta}>{p.club}</span>
                                        </div>
                                    ))}
                                    <div className={styles.groupLabel}>FROM SHORTLISTS</div>
                                    {/* Simplified for now, could fetch full data */}
                                    {allShortlistedIds.slice(0, 5).map(id => (
                                        <div key={id} className={styles.searchItem} onClick={() => { togglePlayer({ id, name: "Loading..." } as Player); setShowResults(false); }}>
                                            <span>ID: {id}</span>
                                            <span className={styles.itemMeta}>Shortlisted</span>
                                        </div>
                                    ))}
                                </>
                            )}
                            {searchQuery.length >= 2 && searchResults.map(p => (
                                <div key={p.id} className={styles.searchItem} onClick={() => { togglePlayer(p); setShowResults(false); }}>
                                    <span>{p.name}</span>
                                    <span className={styles.itemMeta}>{p.club}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className={styles.reportBtn}
                    onClick={() => generatePlayerReport('comparison-content', 'Comparison_Report')}
                >
                    📄 EXPORT DNA REPORT
                </button>
            </header>

            {selectedPlayers.length === 0 ? (
                <div className={styles.empty}>
                    <h2>Ready for correlation analysis.</h2>
                    <p>Search and add players above to begin the comparison DNA stream.</p>
                </div>
            ) : (
                <div className={styles.comparisonLayout}>
                    <div className={styles.topSection}>
                        {playersData.map((player) => (
                            <div key={player.id} className={`glass ${styles.playerCard}`}>
                                <div className={styles.playerHeader}>
                                    <div>
                                        <h2 className={styles.playerName}>{player.name}</h2>
                                        <p className={styles.playerMeta}>{player.club} • {player.position}</p>
                                    </div>
                                    <button onClick={() => togglePlayer(player)} className={styles.removePlayer}>×</button>
                                </div>

                                <div className={styles.radarWrapper}>
                                    <RadarChart data={player.metrics} size={220} />
                                </div>

                                <div className={styles.attributeSection}>
                                    <AttributeGrid
                                        technical={player.attributes?.technical || []}
                                        mental={player.attributes?.mental || []}
                                        physical={player.attributes?.physical || []}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {playersData.length > 0 && (
                        <section className={styles.forecastSection}>
                            <div className={`glass ${styles.forecastPanel}`}>
                                <span className={styles.sectionTitle}>POTENTIAL TRAJECTORY CORRELATION</span>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickFormatter={(val) => `€${val}M`} />
                                        <Tooltip contentStyle={{ background: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }} />
                                        <Legend />
                                        {playersData.map((p, idx) => (
                                            <Line
                                                key={p.id}
                                                type="monotone"
                                                dataKey={p.name}
                                                stroke={idx === 0 ? "var(--primary)" : (idx === 1 ? "var(--secondary)" : "var(--accent)")}
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
