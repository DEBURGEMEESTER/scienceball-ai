"use client";

import React, { useEffect, useState } from 'react';
import styles from './PitchHeatmap.module.css';

interface PitchHeatmapProps {
    data?: number[][];
    playerName?: string;
}

const PitchHeatmap: React.FC<PitchHeatmapProps> = ({ data, playerName }) => {
    const [grid, setGrid] = useState<number[][]>([]);
    const [mode, setMode] = useState<'offensive' | 'defensive'>('offensive');

    useEffect(() => {
        if (data) {
            setGrid(data);
        } else {
            // Default to baseline
            fetch('http://127.0.0.1:8000/analytics/xt-pitch')
                .then(res => res.json())
                .then(val => setGrid(val))
                .catch(err => console.error("Failed to fetch xT grid:", err));
        }
    }, [data]);

    if (!grid.length) return <div className={styles.loading}>Initializing pitch data...</div>;

    return (
        <div className={styles.pitchContainer}>
            <div className={styles.controls}>
                <button
                    className={`${styles.modeBtn} ${mode === 'offensive' ? styles.active : ''}`}
                    onClick={() => setMode('offensive')}
                >
                    OFFENSIVE THREAT
                </button>
                <button
                    className={`${styles.modeBtn} ${mode === 'defensive' ? styles.active : ''}`}
                    onClick={() => setMode('defensive')}
                >
                    DEFENSIVE RADIUS
                </button>
            </div>

            <div className={styles.pitch}>
                {/* Standard Pitch Markings */}
                <div className={styles.penaltyAreaLeft}></div>
                <div className={styles.penaltyAreaRight}></div>
                <div className={styles.centerCircle}></div>
                <div className={styles.halfwayLine}></div>

                {/* Heatmap Layer */}
                <div className={styles.heatmapGrid}>
                    {grid.map((row, i) => (
                        <div key={i} className={styles.row}>
                            {row.map((val, j) => {
                                // Simulate defensive view by flipping or shifting if mode is defensive
                                const displayVal = mode === 'defensive' ? (j < 6 ? val * 0.8 : val * 0.2) : val;
                                const color = mode === 'offensive' ? '0, 242, 255' : '255, 60, 117';

                                return (
                                    <div
                                        key={j}
                                        className={styles.cell}
                                        style={{
                                            backgroundColor: `rgba(${color}, ${Math.min(displayVal * 10, 0.7)})`,
                                            boxShadow: displayVal > 0.08 ? `0 0 10px rgba(${color}, 0.2)` : 'none'
                                        }}
                                        title={`${mode === 'offensive' ? 'xT' : 'Radius'}: ${displayVal.toFixed(3)}`}
                                    ></div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {playerName && (
                <div className={styles.pitchLegend}>
                    <span className={styles.playerName}>{playerName.toUpperCase()}</span>
                    <span className={styles.metricLabel}>
                        {mode === 'offensive' ? 'SPATIAL THREAT ANALYSIS' : 'DEFENSIVE COVERAGE MODEL'} • v2.0
                    </span>
                </div>
            )}
        </div>
    );
};

export default PitchHeatmap;
