"use client";

import React from 'react';
import styles from './ComparisonPanel.module.css';
import { useComparison } from '@/context/ComparisonContext';
import Link from 'next/link';

const ComparisonPanel = () => {
    const { selectedPlayers, togglePlayer, clearComparison } = useComparison();

    if (selectedPlayers.length === 0) return null;

    return (
        <div className={styles.stickyPanel}>
            <div className={`glass ${styles.container}`}>
                <div className={styles.players}>
                    {selectedPlayers.map(p => (
                        <div key={p.id} className={styles.playerTag}>
                            <span>{p.name}</span>
                            <button onClick={() => togglePlayer(p)} className={styles.removeBtn}>×</button>
                        </div>
                    ))}
                    {selectedPlayers.length < 2 && (
                        <div className={styles.placeholder}>Select another player to compare</div>
                    )}
                </div>

                <div className={styles.actions}>
                    {selectedPlayers.length === 2 && (
                        <Link href="/compare" className={styles.compareBtn}>
                            COMPARE DNA
                        </Link>
                    )}
                    <button onClick={clearComparison} className={styles.clearBtn}>CLEAR</button>
                </div>
            </div>
        </div>
    );
};

export default ComparisonPanel;
