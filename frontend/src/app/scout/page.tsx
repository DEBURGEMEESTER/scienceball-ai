"use client";

import React, { useEffect, useState } from 'react';
import styles from './Scout.module.css';
import RadarChart from '@/components/RadarChart/RadarChart';
import AttributeGrid from '@/components/AttributeGrid/AttributeGrid';
import { useShortlist } from '@/context/ShortlistContext';
import { useComparison } from '@/context/ComparisonContext';
import Link from 'next/link';
import ScoutingFeed from '@/components/ScoutingFeed/ScoutingFeed';
import { formatCurrency } from '@/utils/currency';

interface Player {
    id: string;
    name: string;
    club: string;
    position: string;
    age: number;
    nationality: string;
    metrics: { label: string; value: number }[];
    market_value: string;
    attributes: {
        technical: { name: string; value: number }[];
        mental: { name: string; value: number }[];
        physical: { name: string; value: number }[];
    };
}

const ScoutPage = () => {
    const { toggleShortlist, isInShortlist } = useShortlist();
    const { togglePlayer, isInComparison } = useComparison();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [maxAge, setMaxAge] = useState(35); // Default higher for general search
    const [league, setLeague] = useState("all");
    const [clubSearch, setClubSearch] = useState("");
    const [position, setPosition] = useState("all");
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(200);

    const [savedSearches, setSavedSearches] = useState<any[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    useEffect(() => {
        fetch('http://127.0.0.1:8000/scouting/searches')
            .then(res => res.json())
            .then(data => setSavedSearches(data))
            .catch(err => console.error(err));
    }, []);

    const saveSearch = async () => {
        const name = prompt("Name this search preset:");
        if (!name) return;

        const criteria = {
            q: searchQuery, max_age: maxAge, league, club: clubSearch,
            pos: position, min_val: minValue, max_val: maxValue
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/scouting/searches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, criteria })
            });
            const newSearch = await res.json();
            setSavedSearches([newSearch, ...savedSearches]);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSearch = (criteria: any) => {
        setSearchQuery(criteria.q || "");
        setMaxAge(criteria.max_age || 35);
        setLeague(criteria.league || "all");
        setClubSearch(criteria.club || "");
        setPosition(criteria.pos || "all");
        setMinValue(criteria.min_val || 0);
        setMaxValue(criteria.max_val || 200);

        setOffset(0);
        doFetchWithCriteria(criteria, 0, false);
    };

    const getParams = (c: any) => {
        const params = new URLSearchParams();
        if (c.q) params.append('q', c.q);
        if (c.pos && c.pos !== "all") params.append('pos', c.pos);
        if (c.league && c.league !== "all") params.append('league', c.league);
        if (c.club) params.append('club', c.club);
        if (c.max_age) params.append('max_age', c.max_age.toString());
        if (c.min_val) params.append('min_val', c.min_val.toString());
        if (c.max_val) params.append('max_val', c.max_val.toString());
        return params;
    }

    const doFetchWithCriteria = (c: any, currentOffset = 0, append = false) => {
        setLoading(true);
        const params = getParams(c);
        params.append('limit', LIMIT.toString());
        params.append('offset', currentOffset.toString());

        fetch(`http://127.0.0.1:8000/players/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                const newPlayers = Array.isArray(data) ? data : [];
                setPlayers(prev => append ? [...prev, ...newPlayers] : newPlayers);
                setHasMore(newPlayers.length === LIMIT);
                setLoading(false);
            });
    };

    const fetchPlayers = (isFilter = false, currentOffset = 0, append = false) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('limit', LIMIT.toString());
        params.append('offset', currentOffset.toString());

        let url = `http://127.0.0.1:8000/players/prospects/top?${params.toString()}`;

        if (isFilter) {
            const filterParams = getParams({
                q: searchQuery, pos: position, league, club: clubSearch,
                max_age: maxAge, min_val: minValue, max_val: maxValue
            });
            filterParams.append('limit', LIMIT.toString());
            filterParams.append('offset', currentOffset.toString());
            url = `http://127.0.0.1:8000/players/filter?${filterParams.toString()}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const newPlayers = Array.isArray(data) ? data : [];
                setPlayers(prev => append ? [...prev, ...newPlayers] : newPlayers);
                setHasMore(newPlayers.length === LIMIT);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch scout player:", err);
                setLoading(false);
            });
    };

    const loadMore = () => {
        const nextOffset = offset + LIMIT;
        setOffset(nextOffset);
        fetchPlayers(showFilters || searchQuery !== "", nextOffset, true);
    }

    useEffect(() => {
        fetchPlayers();
    }, []);

    const featuredPlayer = players[0];

    return (
        <div className={styles.scoutContainer}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className="text-gradient">Scouting Hub</h1>
                    <p className={styles.subtitle}>Intelligence-led talent identification.</p>
                </div>
                <div className={styles.searchBarWrapper}>
                    <input
                        type="text"
                        placeholder="Search players, clubs or nationalities..."
                        className={styles.mainSearch}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchPlayers(true)}
                    />
                    <button className={styles.searchIconBtn} onClick={() => fetchPlayers(true)}>🕵️‍♂️</button>
                </div>
                <div className={styles.controls}>
                    <button
                        className={`glass ${styles.filterBtn} ${showFilters ? styles.active : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Toggle Filters"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        <span>FILTERS</span>
                    </button>
                </div>
            </header>

            {showFilters && (
                <section className={`glass ${styles.filterTray}`}>
                    <div className={styles.filterGrid}>
                        <div className={styles.filterGroup}>
                            <label>AGE RANGE (MAX)</label>
                            <div className={styles.sliderWrapper}>
                                <input
                                    type="range"
                                    min="16" max="40"
                                    value={maxAge}
                                    onChange={(e) => setMaxAge(parseInt(e.target.value))}
                                    className={styles.rangeSlider}
                                />
                                <span className={styles.rangeLabel}>{maxAge} YRS</span>
                            </div>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>MARKET VALUE RANGE</label>
                            <div className={styles.sliderWrapper}>
                                <span className={styles.rangeLabel}>€{minValue}M</span>
                                <input
                                    type="range"
                                    min="0" max="200"
                                    value={minValue}
                                    onChange={(e) => setMinValue(parseInt(e.target.value))}
                                    className={styles.rangeSlider}
                                />
                            </div>
                            <div className={styles.sliderWrapper}>
                                <span className={styles.rangeLabel}>€{maxValue}M</span>
                                <input
                                    type="range"
                                    min="0" max="200"
                                    value={maxValue}
                                    onChange={(e) => setMaxValue(parseInt(e.target.value))}
                                    className={styles.rangeSlider}
                                />
                            </div>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>TACTICAL POSITION</label>
                            <select value={position} onChange={(e) => setPosition(e.target.value)} className={styles.selectInput}>
                                <option value="all">Any Position</option>
                                <option value="Goalkeeper">Goalkeeper</option>
                                <option value="Center Back">Center Back</option>
                                <option value="Right Back">Right Back</option>
                                <option value="Left Back">Left Back</option>
                                <option value="Defensive Midfield">Defensive Midfield</option>
                                <option value="Central Midfield">Central Midfield</option>
                                <option value="Attacking Midfield">Attacking Midfield</option>
                                <option value="Winger">Winger</option>
                                <option value="Striker">Striker</option>
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label>LEAGUE & CLUB</label>
                            <div className={styles.splitInputs}>
                                <select value={league} onChange={(e) => setLeague(e.target.value)} className={styles.selectInput}>
                                    <option value="all">Any League</option>
                                    <option value="Premier League">Premier League</option>
                                    <option value="La Liga">La Liga</option>
                                    <option value="Eredivisie">Eredivisie</option>
                                    <option value="HNL">HNL (Croatia)</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Club name..."
                                    className={styles.clubSearchInput}
                                    value={clubSearch}
                                    onChange={(e) => setClubSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.filterActions}>
                            <button
                                className={styles.clearBtn}
                                onClick={() => {
                                    setSearchQuery("");
                                    setMaxAge(35);
                                    setLeague("all");
                                    setClubSearch("");
                                    setPosition("all");
                                    setMinValue(0);
                                    setMaxValue(200);
                                    fetchPlayers(false);
                                }}
                            >
                                RESET
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={saveSearch}
                            >
                                💾 SAVE
                            </button>
                            <button
                                className={styles.applyBtn}
                                onClick={() => fetchPlayers(true)}
                            >
                                APPLY FILTERS
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {loading ? (
                <div className={styles.loading}>Scanning intelligence data...</div>
            ) : !featuredPlayer ? (
                <div className={styles.noResults}>
                    <h3>No intelligence matches found.</h3>
                    <p>Broaden your search criteria or try searching for a specific name.</p>
                </div>
            ) : (
                <div className={styles.dashboard}>
                    {/* Featured Profile Card */}
                    <section className={`glass ${styles.fmProfileCard}`}>
                        <div className={styles.cardHeader}>
                            <div className={styles.identity}>
                                <span className={styles.hotBadge}>PRIMARY INTEL MATCH</span>
                                <div className={styles.nameRow}>
                                    <Link href={`/players/${featuredPlayer.id}`}>
                                        <h2>{featuredPlayer.name}</h2>
                                    </Link>
                                    <button
                                        className={`${styles.watchBtn} ${isInShortlist(featuredPlayer.id) ? styles.watched : ''}`}
                                        onClick={() => toggleShortlist(featuredPlayer.id)}
                                    >
                                        {isInShortlist(featuredPlayer.id) ? '★' : '☆'}
                                    </button>
                                </div>
                                <p className={styles.subtitleSmall}>
                                    {featuredPlayer.position} • {featuredPlayer.age} yrs • {featuredPlayer.nationality} • {featuredPlayer.club}
                                </p>
                            </div>
                            <div className={styles.ratingBox}>
                                <span className={styles.ratingValue}>84.7</span>
                                <span className={styles.ratingLabel}>BALL INDEX</span>
                            </div>
                        </div>

                        <div className={styles.fmGrid}>
                            <div className={styles.attrCol}>
                                <AttributeGrid
                                    technical={featuredPlayer?.attributes?.technical || []}
                                    mental={featuredPlayer?.attributes?.mental || []}
                                    physical={featuredPlayer?.attributes?.physical || []}
                                />
                            </div>
                            <div className={styles.visualCol}>
                                <div className={styles.radarWrapper}>
                                    <RadarChart data={featuredPlayer?.metrics || []} size={250} />
                                </div>
                                <div className={styles.quickBrief}>
                                    <h3>Intelligence Summary</h3>
                                    <p>Elite playmaker profile detected. Exceptional behaviors suggest high tactical ceiling.</p>
                                    <div className={styles.valueRow}>
                                        <span className={styles.valueLabel}>MARKET VALUE</span>
                                        <span className={styles.valueVal}>{formatCurrency(featuredPlayer.market_value)}</span>
                                    </div>

                                    <Link href={`/players/${featuredPlayer.id}`} className={styles.fullProfileLink}>
                                        VIEW FULL ANALYSIS →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className={styles.sidebar}>
                        <div className={`glass ${styles.insightCard}`}>
                            <h3>Other Intelligence Matches</h3>
                            <div className={styles.resultList}>
                                {players.slice(1).map(p => {
                                    const similarity = Math.floor(Math.random() * (98 - 85) + 85); // Simulated Score
                                    return (
                                        <Link key={p.id} href={`/players/${p.id}`} className={styles.resultItem}>
                                            <div className={styles.cardTop}>
                                                <div className={styles.matchScoreBadge}>{similarity}% MATCH</div>
                                                <span className={styles.resVal}>{formatCurrency(p.market_value)}</span>
                                            </div>
                                            <div className={styles.resultMain}>
                                                <span className={styles.resName}>{p.name}</span>
                                                <span className={styles.resMeta}>
                                                    {p.club} • <span className={styles.posTag}>{p.position}</span>
                                                </span>
                                            </div>
                                            <button
                                                className={`${styles.compareMiniBtn} ${isInComparison(p.id) ? styles.activeComp : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    togglePlayer(p as any);
                                                }}
                                            >
                                                {isInComparison(p.id) ? '✓ ADDED' : '⇄ COMPARE'}
                                            </button>
                                        </Link>
                                    );
                                })}
                                {players.length <= 1 && (
                                    <p className={styles.noOthers}>No other matches found.</p>
                                )}
                                {hasMore && (
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={loadMore}
                                        disabled={loading}
                                    >
                                        {loading ? "SCANNING..." : "LOAD MORE PROFILES"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={`glass ${styles.insightCard}`}>
                            <h3>Shortlist Integration</h3>
                            <p className={styles.sidebarDesc}>Directly associate matches with your recruitment pipelines.</p>
                            <Link href="/watchlist" className={styles.sidebarAction}>MANAGE SHORTLISTS</Link>
                        </div>

                        <div className={`glass ${styles.insightCard}`}>
                            <h3>Saved Searches</h3>
                            <div className={styles.savedList}>
                                {savedSearches.map(s => (
                                    <div key={s.id} className={styles.savedItem} onClick={() => loadSearch(s.criteria)}>
                                        <span className={styles.savedName}>{s.name}</span>
                                        <span className={styles.savedDate}>{s.date}</span>
                                    </div>
                                ))}
                                {savedSearches.length === 0 && <p className={styles.noOthers}>No saved presets.</p>}
                            </div>
                        </div>

                        <div className={`glass ${styles.feedPanel}`}>
                            <div className={styles.panelHeader}>
                                <span className={styles.panelTitle}>INTELLIGENCE STREAM</span>
                            </div>
                            <ScoutingFeed />
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default ScoutPage;
