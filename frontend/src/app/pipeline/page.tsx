"use client";

import React, { useState, useEffect } from 'react';
import styles from './Pipeline.module.css';
import { Player } from '@/types';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

interface Negotiation {
    id: number;
    player_id: string;
    status: string;
    estimated_fee: number;
    notes: string;
    last_updated: string;
}

const STAGES = [
    { id: 'INQUIRY', label: 'INQUIRY' },
    { id: 'VERBAL', label: 'VERBAL TERMS' },
    { id: 'MEDICAL', label: 'MEDICAL/FINAL' },
    { id: 'SIGNED', label: 'SIGNED' }
];

const PipelinePage = () => {
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [players, setPlayers] = useState<Record<string, Player>>({});
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/negotiations/`)
            .then(res => res.json())
            .then(data => setNegotiations(data));

        fetch(`${API_BASE_URL}/negotiations/summary`)
            .then(res => res.json())
            .then(data => setSummary(data));
    }, []);

    useEffect(() => {
        const playerIds = Array.from(new Set(negotiations.map(n => n.player_id)));
        playerIds.forEach(id => {
            if (!players[id]) {
                fetch(`${API_BASE_URL}/players/${id}`)
                    .then(res => res.json())
                    .then(p => setPlayers(prev => ({ ...prev, [id]: p })));
            }
        });
    }, [negotiations]);

    const updateStatus = (negId: number, newStatus: string) => {
        fetch(`${API_BASE_URL}/negotiations/${negId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
            .then(res => res.json())
            .then(updated => {
                setNegotiations(prev => prev.map(n => n.id === negId ? updated : n));
            });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>RECRUITMENT PIPELINES</h1>
                    <p className={styles.subtitle}>COMMITTED CAPITAL: €{(summary?.total_committed_fees / 1000000).toFixed(1)}M</p>
                </div>
                <div className={`glass ${styles.budgetWidget}`}>
                    <div className={styles.budgetItem}>
                        <label>ACTIVE DEALS</label>
                        <span>{summary?.active_negotiations}</span>
                    </div>
                    <div className={styles.budgetItem}>
                        <label>CAPACITY UTILIZATION</label>
                        <div className={styles.barWrapper}>
                            <div className={styles.bar} style={{ width: '45%' }}></div>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.kanban}>
                {STAGES.map(stage => (
                    <div key={stage.id} className={styles.column}>
                        <div className={styles.colHeader}>
                            <h2>{stage.label}</h2>
                            <span className={styles.count}>
                                {negotiations.filter(n => n.status === stage.id).length}
                            </span>
                        </div>
                        <div className={styles.cards}>
                            {negotiations.filter(n => n.status === stage.id).map(neg => {
                                const player = players[neg.player_id];
                                return (
                                    <div key={neg.id} className={`glass ${styles.card}`}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.club}>{player?.club}</span>
                                            <span className={styles.price}>€{(neg.estimated_fee / 1000000).toFixed(1)}M</span>
                                        </div>
                                        <h3 className={styles.playerName}>{player?.name || 'Loading...'}</h3>
                                        <p className={styles.pos}>{player?.position}</p>

                                        <div className={styles.actions}>
                                            <select
                                                className={styles.statusSelect}
                                                value={neg.status}
                                                onChange={(e) => updateStatus(neg.id, e.target.value)}
                                            >
                                                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                <option value="FAILED">ABANDONED</option>
                                            </select>
                                            <Link href={`/players/${neg.player_id}`} className={styles.viewBtn}>
                                                INTEL →
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PipelinePage;
