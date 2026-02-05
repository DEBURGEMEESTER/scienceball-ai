"use client";

import React, { useState, useEffect } from 'react';
import styles from './Decisions.module.css';
import Link from 'next/link';
import { Player } from '@/types';
import { API_BASE_URL } from '@/config';

interface Negotiation {
    id: number;
    player_id: string;
    status: string;
    estimated_fee: number;
}

interface RiskAssessment {
    player_id: string;
    overall_score: number;
    level: string;
}

const DecisionDashboard = () => {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [players, setPlayers] = useState<Record<string, Player>>({});
    const [risks, setRisks] = useState<Record<string, RiskAssessment>>({});

    useEffect(() => {
        const fetchData = async () => {
            const negRes = await fetch(`${API_BASE_URL}/negotiations/`);
            const negData = await negRes.json();
            setNegotiations(negData);

            negData.forEach(async (n: Negotiation) => {
                // Fetch player info
                const pRes = await fetch(`${API_BASE_URL}/players/${n.player_id}`);
                const pData = await pRes.json();
                setPlayers(prev => ({ ...prev, [n.player_id]: pData }));

                // Fetch risk assessment
                const rRes = await fetch(`${API_BASE_URL}/reports/risk-assessment/${n.player_id}`);
                const rData = await rRes.json();
                setRisks(prev => ({ ...prev, [n.player_id]: rData }));
            });
        };
        fetchData();
    }, []);

    const calculateROI = (player: Player) => {
        if (!player) return 0;
        // Simple mock ROI: predicted growth / age
        return (player.predicted_growth / (player.age - 15)).toFixed(1);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>DECISION SUPPORT</h1>
                <p className={styles.subtitle}>EXECUTIVE ROA & RISK AGGREGATION</p>
            </header>

            <div className={`glass ${styles.statsStrip}`}>
                <div className={styles.statItem}>
                    <label>PORTFOLIO EXPOSURE</label>
                    <span>€{(negotiations.reduce((acc, n) => acc + n.estimated_fee, 0) / 1000000).toFixed(1)}M</span>
                </div>
                <div className={styles.statItem}>
                    <label>AVG PORTFOLIO RISK</label>
                    <span className={styles.lowRisk}>LOW (12.4%)</span>
                </div>
            </div>

            <section className={styles.tableWrapper}>
                <table className={styles.decisionTable}>
                    <thead>
                        <tr>
                            <th>TARGET</th>
                            <th>STATUS</th>
                            <th>FEE</th>
                            <th>SPORTING ROI</th>
                            <th>RISK SCORE</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {negotiations.map(neg => {
                            const p = players[neg.player_id];
                            const r = risks[neg.player_id];
                            return (
                                <tr key={neg.id}>
                                    <td>
                                        <div className={styles.targetCell}>
                                            <span className={styles.pName}>{p?.name || 'Loading...'}</span>
                                            <span className={styles.pClub}>{p?.club}</span>
                                        </div>
                                    </td>
                                    <td><span className={styles.statusBadge}>{neg.status}</span></td>
                                    <td>€{(neg.estimated_fee / 1000000).toFixed(1)}M</td>
                                    <td><span className={styles.roiValue}>+{calculateROI(p as Player)}x</span></td>
                                    <td>
                                        <div className={styles.riskBarWrapper}>
                                            <div
                                                className={`${styles.riskBar} ${r?.level === 'HIGH' ? styles.riskHigh : styles.riskLow}`}
                                                style={{ width: `${r?.overall_score || 0}%` }}
                                            ></div>
                                            <span className={styles.riskText}>{r?.overall_score}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <Link href={`/players/${neg.player_id}`} className={styles.intelBtn}>
                                            OPEN INTEL
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default DecisionDashboard;
