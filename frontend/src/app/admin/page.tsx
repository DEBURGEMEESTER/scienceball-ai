"use client";

import React, { useState } from 'react';
import styles from './Admin.module.css';
import { API_BASE_URL } from '@/config';

const AdminPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [health, setHealth] = useState<any>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/admin/stats/health`);
            const data = await res.json();
            setHealth(data);
        } catch (err) {
            console.error("Health fetch failed:", err);
        }
    };

    React.useEffect(() => {
        fetchHealth();
    }, []);

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            await fetch(`${API_BASE_URL}/admin/stats/regenerate`, { method: 'POST' });
            await fetchHealth();
            setStatus("Synthetic signals synchronized successfully.");
            setIsError(false);
        } catch (err) {
            setStatus("Regeneration failed.");
            setIsError(true);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus(null);
            setIsError(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/import/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setStatus(`Success! Processed ${data.total_rows_processed} rows. Added ${data.players_added} new players.`);
                setIsError(false);
            } else {
                setStatus(`Error: ${data.detail}`);
                setIsError(true);
            }
        } catch (err) {
            setStatus("Network block: Could not reach server.");
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className="text-gradient">Data Sovereignty Room</h1>
                    <p className={styles.subtitle}>SECURE INGESTION & NETWORK HEALTH</p>
                </div>
            </header>

            <div className={styles.dataGrid}>
                {/* Health Card */}
                <div className={`glass ${styles.dashboardCard}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                            NETWORK HEALTH
                        </span>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>REALISM</span>
                            <span className={styles.statHighlight}>{health?.real_data_ratio}%</span>
                        </div>
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>SOVEREIGN NODES</span>
                            <span className={styles.statValue}>{health?.real_count}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>SYNTHETIC NODES</span>
                            <span className={styles.statValue}>{health?.synthetic_count}</span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        <div className={styles.cardDesc}>
                            Hybrid Seeding active. Gap filling enabled.
                        </div>
                        <button
                            className={styles.actionBtn}
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                        >
                            {isRegenerating ? "SYNCING..." : "REGENERATE POOL"}
                        </button>
                    </div>
                </div>

                {/* Automation Card */}
                <div className={`glass ${styles.dashboardCard}`}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            AUTO-PIPELINE
                        </span>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>STATUS</span>
                            <span className={styles.statHighlight}>ACTIVE</span>
                        </div>
                    </div>

                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>SOURCE STREAM</span>
                            <span className={styles.statValue}>OPEN DB</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>LAST SYNC</span>
                            <span className={styles.statValue}>JUST NOW</span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        <div className={styles.cardDesc}>
                            Zero-touch ingestion protocols engaged.
                        </div>
                        <button
                            className={styles.actionBtn}
                            onClick={async () => {
                                try {
                                    setStatus("Triggering Automated Pipeline...");
                                    const res = await fetch(`${API_BASE_URL}/admin/automation/trigger`, { method: 'POST' });
                                    const data = await res.json();
                                    setStatus(`Pipeline Report: ${JSON.stringify(data)}`);
                                } catch (e) {
                                    setStatus("Pipeline trigger failed.");
                                }
                            }}
                        >
                            RUN PIPELINE
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.dropzoneContainer}>
                <div className={styles.dropzone}>
                    <div className={styles.dzIconWrapper}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </div>
                    <h3 className={styles.dzTitle}>
                        {file ? file.name : "Inject Scouting Dataset"}
                    </h3>
                    <p className={styles.dzSub}>
                        Drag and drop CSV or Excel files to initiate secure ingestion protocols.
                        Engine will automatically normalize technical signals via League Strength Indices.
                    </p>

                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv, .xlsx"
                        style={{
                            position: 'absolute', opacity: 0, top: 0,
                            left: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 5
                        }}
                    />

                    {file && !isLoading && (
                        <div className={styles.uploadOverlay}>
                            <button
                                className={styles.primaryBtn}
                                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                            >
                                INITIATE INGESTION PROTOCOL
                            </button>
                        </div>
                    )}

                    {isLoading && <div className={styles.loader}>ANALYZING SIGNAL INTEGRITY...</div>}
                </div>
            </div>

            {status && (
                <div className={`${styles.logArea} ${isError ? styles.errorLog : styles.successLog}`}>
                    <div className={styles.logHeader}>
                        <span>{isError ? "INGESTION ABORTED" : "INGESTION SUCCESSFUL"}</span>
                    </div>
                    <p>{status}</p>
                </div>
            )}

            <div className={styles.reqSection}>
                <h3>Intelligent Header Mapping</h3>
                <div className={styles.reqGrid}>
                    <div className={styles.reqCol}>
                        <h4>REQUIRED SIGNALS</h4>
                        <p>Name, Club, Position, Age</p>
                    </div>
                    <div className={styles.reqCol}>
                        <h4>SCIENTIFIC METRICS</h4>
                        <p>Finishing, Passing, Pace, Vision, etc.<br />(Auto-normalized)</p>
                    </div>
                    <div className={styles.reqCol}>
                        <h4>METADATA</h4>
                        <p>League, Nationality, Market Value</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
