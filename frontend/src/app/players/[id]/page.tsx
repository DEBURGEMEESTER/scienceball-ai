"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './PlayerProfile.module.css';
import RadarChart from '@/components/RadarChart/RadarChart';
import ValueChart from '@/components/ValueChart/ValueChart';
import AttributeGrid from '@/components/AttributeGrid/AttributeGrid';
import ProfileTabs from '@/components/ProfileTabs/ProfileTabs';
import Link from 'next/link';
import PitchHeatmap from '@/components/PitchHeatmap/PitchHeatmap';
import { useComparison } from '@/context/ComparisonContext';
import { useShortlist } from '@/context/ShortlistContext';
import { generatePlayerReport } from '@/utils/ReportGenerator';
import { formatCurrency } from '@/utils/currency';

import { Player } from '@/types';
import { API_BASE_URL } from '@/config';

// ... imports remain the same

export default function PlayerProfile() {
    const params = useParams();
    const id = params?.id as string;
    const { selectedPlayers, togglePlayer } = useComparison();
    const { toggleShortlist, isInShortlist, shortlists } = useShortlist();

    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [trajectory, setTrajectory] = useState<any[]>([]);
    const [similar, setSimilar] = useState<any[]>([]);
    const [isNormalized, setIsNormalized] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [showShortlistDrop, setShowShortlistDrop] = useState(false);

    // Phase 17: Tactical State
    const [heatmapData, setHeatmapData] = useState<number[][] | null>(null);
    const [tacticalKpis, setTacticalKpis] = useState<any | null>(null);

    const [negotiation, setNegotiation] = useState<any | null>(null);
    const [negotiationError, setNegotiationError] = useState<string | null>(null);
    const [risk, setRisk] = useState<any | null>(null);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        // Main Player Data
        fetch(`${API_BASE_URL}/players/${id}?normalized=${isNormalized}`)
            .then(res => res.json())
            .then(data => { setPlayer(data); setLoading(false); });

        // Growth Trajectory
        fetch(`${API_BASE_URL}/players/${id}/growth-prediction`)
            .then(res => res.json())
            .then(data => setTrajectory(data.trajectory || []));

        // Similar Players
        fetch(`${API_BASE_URL}/players/${id}/similar`)
            .then(res => res.json())
            .then(data => setSimilar(Array.isArray(data) ? data : []));

        // Phase 17: Heatmap & Tactical Intel
        fetch(`${API_BASE_URL}/players/${id}/heatmap`)
            .then(res => res.json())
            .then(data => setHeatmapData(data));

        fetch(`${API_BASE_URL}/players/${id}/tactical-kpis`)
            .then(res => res.json())
            .then(data => setTacticalKpis(data));

        // Phase 18: Negotiation
        fetch(`${API_BASE_URL}/negotiations/`)
            .then(res => res.json())
            .then(data => {
                const active = data.find((n: any) => n.player_id === id);
                setNegotiation(active || null);
            });

        fetch(`${API_BASE_URL}/reports/risk-assessment/${id}`)
            .then(res => res.json())
            .then(data => setRisk(data));

    }, [id, isNormalized]);

    const handleNoteSubmit = async () => {
        if (!newNote.trim()) return;
        try {
            await fetch(`${API_BASE_URL}/analytics/players/${id}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scout: "Lead Analyst", note: newNote })
            });
            setNewNote("");
            // Refresh player
            const res = await fetch(`${API_BASE_URL}/players/${id}?normalized=${isNormalized}`);
            const data = await res.json();
            setPlayer(data);
        } catch (err) { console.error(err); }
    };

    const initiateNegotiation = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/negotiations/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player_id: id, estimated_fee: 0 })
            });
            if (!res.ok) throw new Error("Failed to initialize negotiation signal.");
            const data = await res.json();
            setNegotiation(data);
            setActiveTab('negotiation');
        } catch (err: any) { setNegotiationError(err.message); }
    };

    const handleDownloadDossier = () => {
        window.open(`${API_BASE_URL}/reports/player/${id}/pdf`, '_blank');
    };

    const [isAssigning, setIsAssigning] = useState(false);

    const requestDeepDive = async () => {
        setIsAssigning(true);
        try {
            await fetch(`${API_BASE_URL}/staff/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: id,
                    staff_id: 2, // Default to Chief Scout for now
                    priority: "HIGH",
                    notes: "Urgent tactical deep-dive required for system fit verification."
                })
            });
            alert("Deep-Dive assigned to Chief Scout Piet de Visser.");
        } catch (err) { console.error(err); }
        finally { setIsAssigning(false); }
    };

    if (loading) return <div className={styles.loading}>Decrypting player signal...</div>;
    if (!player) return <div className={styles.error}>Player profile lost in transition.</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className={styles.overviewGrid}>
                        <div className={styles.mainLeft}>
                            <section className={`glass ${styles.fmSection}`}>
                                <AttributeGrid
                                    technical={player.attributes?.technical || []}
                                    mental={player.attributes?.mental || []}
                                    physical={player.attributes?.physical || []}
                                />
                            </section>
                        </div>
                        <div className={styles.mainRight}>
                            <section className={`glass ${styles.radarSectionSmall}`}>
                                <h2 className={styles.sectionTitle}>Performance DNA</h2>
                                <RadarChart data={player.metrics} size={280} />
                            </section>

                            <section className={`glass ${styles.briefSmall}`}>
                                <h2 className={styles.sectionTitle}>Scientific Metrics (Per 90)</h2>
                                <div className={styles.sciMetricsGrid}>
                                    <div className={styles.sciMetric}>
                                        <label>xG</label>
                                        <span>{player.xg_per_90}</span>
                                    </div>
                                    <div className={styles.sciMetric}>
                                        <label>xA</label>
                                        <span>{player.xa_per_90}</span>
                                    </div>
                                    <div className={styles.sciMetric}>
                                        <label>PPDA</label>
                                        <span>{player.ppda}</span>
                                    </div>
                                </div>
                            </section>

                            <section className={`glass ${styles.briefSmall}`}>
                                <h2 className={styles.sectionTitle}>Intelligence Brief</h2>
                                <p className={styles.briefText}>
                                    Elite acquisition target detected.
                                    High tactical fit for modern {player.position} role.
                                </p>
                            </section>
                        </div>
                    </div>
                );
            case 'attributes':
                return (
                    <section className={`glass ${styles.fullAttributes}`}>
                        <AttributeGrid
                            technical={player.attributes?.technical || []}
                            mental={player.attributes?.mental || []}
                            physical={player.attributes?.physical || []}
                        />
                    </section>
                );
            case 'history':
                return (
                    <section className={`glass ${styles.valueSection}`}>
                        <h2 className={styles.sectionTitle}>Market Value History</h2>
                        <div className={styles.chartWrapper}>
                            <ValueChart data={player.value_history || []} />
                        </div>
                    </section>
                );
            case 'intelligence':
                return (
                    <div className={styles.simIntelligence}>
                        <div className={styles.potentialGrid}>
                            <section className={`glass ${styles.potentialCard}`}>
                                <h3 className={styles.potTitle}>COGNITIVE DNA</h3>
                                {player.cognitive_profile ? (
                                    <RadarChart
                                        data={[
                                            { label: 'Inhibition', value: player.cognitive_profile.inhibition },
                                            { label: 'Memory', value: player.cognitive_profile.working_memory },
                                            { label: 'Flexibility', value: player.cognitive_profile.flexibility },
                                            { label: 'Fluency', value: player.cognitive_profile.design_fluency }
                                        ]}
                                        size={220}
                                    />
                                ) : <p>Assessment Pending</p>}
                                <p className={styles.potDesc}>Executive functions correlating with elite processing speed and tactical inhibition.</p>
                            </section>
                            <section className={`glass ${styles.potentialCard}`}>
                                <span className={styles.potTitle}>CURRENT GROWTH INDEX</span>
                                <span className={styles.potValue}>+{player.predicted_growth}%</span>
                                <p className={styles.potDesc}>Annualized development velocity based on current match involvement and performance plateau analysis.</p>
                            </section>

                            {/* Phase 20: AI Risk Assessment */}
                            {risk && (
                                <section className={`glass ${styles.potentialCard} ${styles.riskCard}`}>
                                    <span className={styles.potTitle}>TRANSFER RISK SCORE</span>
                                    <span className={`${styles.potValue} ${risk.level === 'LOW' ? styles.lowRisk : styles.highRisk}`}>
                                        {risk.overall_score}%
                                    </span>
                                    <p className={styles.potDesc}>Aggregated risk based on medical history, tactical fit, and market volatility.</p>
                                    <div className={styles.riskLevelBadge}>{risk.level} RISK PROFILE</div>
                                </section>
                            )}

                            {/* Phase 17: Tactical KPIs */}
                            {tacticalKpis && (
                                <section className={`glass ${styles.potentialCard} ${styles.tacticalCard}`}>
                                    <h3 className={styles.potTitle}>POSITIONAL KPIs</h3>
                                    <div className={styles.kpiGrid}>
                                        <div className={styles.kpiItem}>
                                            <label>{tacticalKpis.primary.label}</label>
                                            <span className={styles.kpiValue}>{tacticalKpis.primary.value}</span>
                                        </div>
                                        <div className={styles.kpiItem}>
                                            <label>{tacticalKpis.secondary.label}</label>
                                            <span className={styles.kpiValue}>{tacticalKpis.secondary.value}</span>
                                        </div>
                                        <div className={styles.kpiItem}>
                                            <label>{tacticalKpis.tertiary.label}</label>
                                            <span className={styles.kpiValue}>{tacticalKpis.tertiary.value}</span>
                                        </div>
                                    </div>
                                    <p className={styles.potDesc}>Metrics calibrated specifically for the {player.position} profile.</p>
                                </section>
                            )}
                        </div>

                        <section className={`glass ${styles.growthCurve}`}>
                            <h2 className={styles.sectionTitle}>PROJETED MATURATION CURVE</h2>
                            <div className={styles.chartWrapper}>
                                <ValueChart
                                    data={trajectory.map(t => ({ date: t.label, value: t.value }))}
                                />
                            </div>
                        </section>

                        <section className={`glass ${styles.tacticalEngagement}`}>
                            <h2 className={styles.sectionTitle}>TACTICAL ENGAGEMENT xT & SPATIAL RADIUS</h2>
                            <div className={styles.ghostingGrid}>
                                <div className={styles.heatmapWrapper}>
                                    <PitchHeatmap playerName={player.name} data={heatmapData || undefined} />
                                </div>
                                <div className={styles.ghostAnalysis}>
                                    <h3 className={styles.catLabel}>SYNERGY EVALUATION</h3>
                                    <div className={styles.ghostMetric}>
                                        <span>SYSTEM FIT</span>
                                        <span className={styles.ghostValue}>94% MATCH</span>
                                    </div>
                                    <p className={styles.ghostDesc}>
                                        High spatial correlation with our current build-up patterns.
                                        Player tends to occupy "half-space" zones that support vertical progression.
                                    </p>
                                    <div className={styles.ghostTag}>TACTICAL ELITE</div>
                                </div>
                            </div>
                        </section>

                        {player.scientific_dossier && (
                            <section className={`glass ${styles.dossierSection}`}>
                                <h2 className={styles.sectionTitle}>SCIENTIFIC DOSSIER (INTEL SUMMARY)</h2>
                                <div className={styles.dossierContent}>
                                    <span className={styles.dossierBadge}>CONFIDENTIAL</span>
                                    <p>{player.scientific_dossier}</p>
                                </div>
                            </section>
                        )}

                        <section className={`glass ${styles.videoHub}`}>
                            <h2 className={styles.sectionTitle}>VIDEO INTELLIGENCE HUB</h2>
                            <div className={styles.videoGrid}>
                                {[1, 2, 3].map(v => (
                                    <div key={v} className={styles.videoCard}>
                                        <div className={styles.videoThumb}>
                                            <div className={styles.playBtn}>▶</div>
                                            <span className={styles.videoTag}>xT PEAK</span>
                                        </div>
                                        <div className={styles.videoInfo}>
                                            <span className={styles.videoTitle}>Attacking Phase Analysis 0{v}</span>
                                            <span className={styles.videoMeta}>Match vs Atletico • 72'</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                );
            case 'negotiation':
                return (
                    <div className={styles.negotiationGrid}>
                        {negotiation ? (
                            <section className={`glass ${styles.negActiveCard}`}>
                                <div className={styles.negHeader}>
                                    <span className={styles.negStatusBadge}>{negotiation.status}</span>
                                    <h2 className={styles.sectionTitle}>ACTIVE NEGOTIATION</h2>
                                </div>
                                <div className={styles.negMetrics}>
                                    <div className={styles.negStat}>
                                        <label>ESTIMATED TRANSFER FEE</label>
                                        <span className={styles.negValue}>{formatCurrency(negotiation.estimated_fee)}</span>
                                    </div>
                                    <div className={styles.negStat}>
                                        <label>CONTRACT DURATION</label>
                                        <span className={styles.negValue}>{negotiation.contract_years || 'TBD'} YEARS</span>
                                    </div>
                                </div>
                                <div className={styles.negActions}>
                                    <button className={styles.negMainBtn}>UPDATE FINANCIALS</button>
                                    <Link href="/pipeline" className={styles.pipelineLink}>VIEW IN PIPELINE →</Link>
                                </div>
                                {negotiationError && <div className={styles.negError}>{negotiationError}</div>}
                            </section>
                        ) : (
                            <section className={`glass ${styles.negEmptyCard}`}>
                                <div className={styles.negEmptyIcon}>📈</div>
                                <h2>NO ACTIVE PIPELINE</h2>
                                <p>Initialize a recruitment signal to track negotiations and budget impact.</p>
                                <button className={styles.initiateBtn} onClick={initiateNegotiation}>
                                    INITIATE NEGOTIATION SIGNAL
                                </button>
                                {negotiationError && <div className={styles.negError}>{negotiationError}</div>}
                            </section>
                        )}

                        <section className={`glass ${styles.agentCard}`}>
                            <h2 className={styles.sectionTitle}>AGENT INTELLIGENCE</h2>
                            {player.agent_info ? (
                                <>
                                    <div className={styles.agentInfo}>
                                        <div className={styles.agentAvatar}>
                                            {player.agent_info.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div className={styles.agentDetails}>
                                            <span className={styles.agentName}>{player.agent_info.name}</span>
                                            <span className={styles.agencyName}>{player.agent_info.agency} ({player.agent_info.tier})</span>
                                        </div>
                                    </div>
                                    <div className={styles.agentHistory}>
                                        <span className={styles.catLabel}>PREVIOUS DEALINGS</span>
                                        <ul>
                                            {player.agent_info.history.map((h: string, i: number) => (
                                                <li key={i}>• {h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <p>No agent intelligence available.</p>
                            )}
                        </section>
                    </div>
                );
            case 'medical':
                return (
                    <div className={styles.medicalGrid}>
                        <section className={`glass ${styles.medicalCard}`}>
                            <h2 className={styles.sectionTitle}>Medical DNA</h2>
                            <div className={styles.medicalMetrics}>
                                <div className={styles.medStat}>
                                    <span className={styles.medLabel}>INJURY RISK</span>
                                    <span className={`${styles.medValue} ${player.medical_dna?.injury_risk === 'Low' ? styles.lowRisk : styles.highRisk}`}>
                                        {player.medical_dna?.injury_risk?.toUpperCase() || "UNKNOWN"}
                                    </span>
                                </div>
                                <div className={styles.medStat}>
                                    <span className={styles.medLabel}>RECOVERY RATE</span>
                                    <span className={styles.medValue}>{player.medical_dna?.recovery_rate}%</span>
                                </div>
                            </div>
                            <div className={styles.injuryHistory}>
                                <span className={styles.medLabel}>NOTABLE INJURIES</span>
                                {player.medical_dna?.notable_injuries.length ? (
                                    <ul className={styles.injuryList}>
                                        {player.medical_dna.notable_injuries.map((inj: string, i: number) => <li key={i}>{inj}</li>)}
                                    </ul>
                                ) : <p className={styles.noneText}>No major injury history recorded.</p>}
                            </div>
                        </section>

                        <section className={`glass ${styles.physicalDNA}`}>
                            <h2 className={styles.sectionTitle}>Physical & Biometric Benchmarks</h2>
                            <div className={styles.physicalGrid}>
                                <div className={styles.physBox}>
                                    <span className={styles.physLabel}>TOP SPEED</span>
                                    <span className={styles.physValue}>{player.physical_metrics?.top_speed || "???"} km/h</span>
                                </div>
                                <div className={styles.physBox}>
                                    <span className={styles.physLabel}>BIO-AGE</span>
                                    <span className={styles.physValue}>{player.biometric_profile?.bio_banded_age || player.age} yrs</span>
                                </div>
                                <div className={styles.physBox}>
                                    <span className={styles.physLabel}>RAE FACTOR</span>
                                    <span className={styles.physValue}>{player.biometric_profile?.rae_factor || "N/A"}</span>
                                </div>
                            </div>
                            {player.biometric_profile?.rae_factor === "Q4" && (
                                <div className={styles.raeWarning}>
                                    ⚠️ RELATIVE AGE EFFECT: Late developer bias likely. Physical metrics expected to surge in maturation phase.
                                </div>
                            )}
                        </section>
                    </div>
                );
            case 'field_notes':
                return (
                    <div className={styles.notesContainer}>
                        <section className={`glass ${styles.notesList}`}>
                            <h2 className={styles.sectionTitle}>Intelligence Notes</h2>
                            {player.scout_notes?.map((n, i) => (
                                <div key={i} className={styles.noteItem}>
                                    <div className={styles.noteHeader}>
                                        <span className={styles.scoutName}>{n.scout}</span>
                                        <span className={styles.noteDate}>{n.date}</span>
                                    </div>
                                    <p className={styles.noteText}>"{n.note}"</p>
                                </div>
                            ))}
                        </section>

                        <section className={`glass ${styles.addNoteSection}`}>
                            <h2 className={styles.sectionTitle}>Append Intelligence</h2>
                            <textarea
                                className={styles.noteInput}
                                placeholder="Enter qualitative observation..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                            ></textarea>
                            <button className={styles.submitNoteBtn} onClick={handleNoteSubmit}>
                                SUBMIT TO GLOBAL FEED
                            </button>
                        </section>
                    </div>
                );
            default:
                return <div>Coming Soon</div>;
        }
    };


    return (
        <div className={styles.container} id="player-profile-content">
            <header className={styles.header}>
                <div className={styles.identity}>
                    <div className={styles.avatarLarge}>
                        {player.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h1 className="text-gradient">{player.name}</h1>
                        <p className={styles.subtitle}>
                            {player.nationality} • {player.age} yrs • {player.club} • <span className={styles.roleHighlight}>{player.tactical_role}</span>
                        </p>
                        <div className={styles.leagueLabel}>
                            LEAGUE INDEX: <span className={styles.strengthValue}>{player.league === "Premier League" ? "1.00" : (player.league === "Eredivisie" ? "0.78" : "0.95")}</span>
                        </div>
                    </div>

                    <div className={styles.toggleWrapper}>
                        <button
                            className={`${styles.normToggle} ${isNormalized ? styles.active : ''}`}
                            onClick={() => setIsNormalized(!isNormalized)}
                        >
                            {isNormalized ? 'NORMALIZED VIEW' : 'RAW DATA VIEW'}
                        </button>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={`glass ${styles.assignBtn}`}
                        onClick={requestDeepDive}
                        disabled={isAssigning}
                    >
                        {isAssigning ? '⌛ ASSIGNING...' : '📋 ASSIGN DEEP-DIVE'}
                    </button>
                    <button
                        className={`glass ${styles.shareBtn}`}
                        onClick={handleDownloadDossier}
                    >
                        📄 DOWNLOAD DOSSIER (PDF)
                    </button>
                    <button
                        className={`glass ${styles.shareBtn}`}
                        onClick={() => {
                            fetch(`${API_BASE_URL}/chat/messages`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    channel_id: 1, // Default Staff Hub
                                    sender: "Lead Scout",
                                    content: `Check out this target: ${player.name}`,
                                    player_id: player.id
                                })
                            }).then(() => alert("Shared to Intelligence Network"));
                        }}
                    >
                        📡 SHARE TO INTEL
                    </button>
                    <div className={styles.watchlistWidget}>
                        <button
                            className={`glass ${styles.watchActionBtn} ${isInShortlist(player.id) ? styles.watched : ''}`}
                            onClick={() => setShowShortlistDrop(!showShortlistDrop)}
                        >
                            {isInShortlist(player.id) ? '★ IN SHORTLISTS' : '☆ ADD TO SHORTLIST'}
                        </button>

                        {showShortlistDrop && (
                            <div className={styles.watchlistDropdown}>
                                {Object.keys(shortlists).map(cat => (
                                    <div
                                        key={cat}
                                        className={`${styles.catOption} ${shortlists[cat].includes(player.id) ? styles.activeCat : ''}`}
                                        onClick={() => toggleShortlist(player.id, cat)}
                                    >
                                        <span className={styles.catCheck}>{shortlists[cat].includes(player.id) ? '✓' : '＋'}</span>
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.compareWrapper}>
                        <button
                            className={`glass ${styles.compareBtn} ${selectedPlayers.find(p => p.id === player.id) ? styles.active : ''}`}
                            onClick={() => togglePlayer(player as any)}
                        >
                            {selectedPlayers.find(p => p.id === player.id) ? '✓ COMPARING' : '＋ COMPARE'}
                        </button>

                        {selectedPlayers.length >= 2 && (
                            <Link href="/compare" className={styles.dnaQuickLink}>
                                GO TO DNA ANALYSIS →
                            </Link>
                        )}
                    </div>
                    <div className={`glass ${styles.valueCardSmall}`}>
                        <span className={styles.valueLabel}>MARKET VALUE</span>
                        <span className={styles.valueAmountSmall}>{formatCurrency(player.market_value)}</span>
                    </div>
                </div>
            </header>

            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className={styles.fmLayout}>
                <div className={styles.contentArea}>
                    {renderTabContent()}
                </div>

                <div className={styles.fmSidebar}>
                    <section className={`glass ${styles.similarSmall}`}>
                        <h2 className={styles.sectionTitle}>Shadow Squad</h2>
                        <div className={styles.similarList}>
                            {similar.map(s => (
                                <Link key={s.id} href={`/players/${s.id}`} className={styles.similarItem}>
                                    <div className={styles.miniAvatar}>{s.name[0]}</div>
                                    <div className={styles.miniInfo}>
                                        <span className={styles.miniName}>{s.name}</span>
                                        <span className={styles.miniMeta}>{s.position}</span>
                                    </div>
                                    <span className={styles.dnaMatch}>92%</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
