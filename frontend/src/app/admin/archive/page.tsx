"use client";

import React, { useState } from 'react';
import styles from './Archive.module.css';

const ArchivePage = () => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const runArchive = async () => {
        setIsExecuting(true);
        try {
            const res = await fetch('http://127.0.0.1:8000/admin/archive/execute', { method: 'POST' });
            const data = await res.json();
            setLastResult(data);
        } catch (err) { console.error(err); }
        finally { setIsExecuting(false); }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>DATA VAULT & ARCHIVE</h1>
                <p className={styles.subtitle}>HISTORICAL SEASONAL INTELLIGENCE</p>
            </header>

            <div className={styles.archiveLayout}>
                <section className={`glass ${styles.controlPanel}`}>
                    <h2 className={styles.sectionTitle}>ARCHIVE CONTROLS</h2>
                    <p className={styles.desc}>
                        Automated seasonal cleanup will move COMPLETED deep-dive assignments and obsolete signals
                        to the long-term vault. This ensures the active engine remains lean and performant.
                    </p>
                    <button
                        className={styles.executeBtn}
                        onClick={runArchive}
                        disabled={isExecuting}
                    >
                        {isExecuting ? '⌛ PROCESSING VAULT...' : '🔒 EXECUTE SEASONAL ARCHIVE'}
                    </button>
                    {lastResult && (
                        <div className={styles.result}>
                            <span>SUCCESS: {lastResult.archived_assignments} SIGNALS VAULTED</span>
                        </div>
                    )}
                </section>

                <section className={`glass ${styles.vaultList}`}>
                    <h2 className={styles.sectionTitle}>VAULT INVENTORY</h2>
                    <div className={styles.placeholder}>
                        <span className={styles.lockIcon}>🔒</span>
                        <p>No historical seasons vaulted in the current deployment.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArchivePage;
