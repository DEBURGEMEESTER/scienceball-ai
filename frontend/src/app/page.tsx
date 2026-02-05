"use client";

import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import RadarChart from '@/components/RadarChart/RadarChart';
import ProspectList from '@/components/ProspectList/ProspectList';
import ScoutingFeed from '@/components/ScoutingFeed/ScoutingFeed';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

interface TDData {
  shortlist_performance: any[];
  contract_risks: any[];
  financial_pulse: {
    shortlist_valuation: number;
    budget_ceiling: number;
    utilization: number;
  };
  squad_health: {
    overall: number;
    gaps: number;
  };
}

interface DashboardData {
  td: TDData;
  tacticalBrief: {
    opponent: string;
    venue: string;
    tactical_brief: string[];
    win_probability_boost: number;
  };
  prospects: any[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const userStr = localStorage.getItem('sb_user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const expires = new Date(user.expires_at);
      const now = new Date();
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      setTimeLeft(`${days}D ${hours}H ${minutes}M`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [td, brief, prospects] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/td-dashboard`).then(res => res.json()),
          fetch(`${API_BASE_URL}/analytics/scout-report`).then(res => res.json()),
          fetch(`${API_BASE_URL}/director/priority-targets`).then(res => res.json())
        ]);

        setData({
          td: td,
          tacticalBrief: brief,
          prospects: prospects
        });
      } catch (err) {
        console.error("Dashboard aggregation failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className={styles.dashboard}>
    <h1 className="text-gradient">Manager Intelligence Briefing</h1>
    <p>Synthesizing global scouting DNA...</p>
  </div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div className={styles.titleArea}>
          <h1 className="text-gradient">TD Situation Room</h1>
          <p className={styles.subtitle}>Strategic Intelligence Hub • Matchday 24</p>
        </div>
        <div className={styles.quickStats}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>SQUAD STABILITY</span>
            <span className={styles.statValue}>{data?.td?.squad_health.overall}%</span>
          </div>
          <div className={`${styles.statBox} ${styles.trialBox}`}>
            <span className={styles.statLabel}>TRIAL REMAINING</span>
            <span className={styles.statValue}>{timeLeft}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>FINANCIAL UTILIZATION</span>
            <span className={styles.statValue}>{data?.td?.financial_pulse.utilization}%</span>
          </div>
        </div>
      </header>

      <div className={styles.fmGrid}>
        {/* Performance Ticker */}
        {data?.td?.shortlist_performance && data.td.shortlist_performance.length > 0 && (
          <div className={styles.performanceTicker}>
            {data.td.shortlist_performance.map((p: any, i: number) => (
              <Link key={i} href={`/players/${p.id}`} className={`glass ${styles.performanceCard}`}>
                <div className={styles.ratingRow}>
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={`${styles.ratingValue} ${p.rating >= 8.0 ? styles.high : ''}`}>
                    {p.rating}
                  </span>
                </div>
                <span className={styles.performanceEvent}>{p.event}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Top Row: Executive Widgets */}
        <div className={styles.topRow}>
          <section className={`glass ${styles.executiveWidget}`}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetTitle}>CONTRACT RISK EXPOSURE</span>
              <span className={styles.tag}>ALERTS</span>
            </div>
            <div className={styles.riskList}>
              {data?.td?.contract_risks.map((risk: any, i: number) => (
                <div key={i} className={styles.riskItem}>
                  <span className={styles.riskName}>{risk.name}</span>
                  <span className={`${styles.riskBadge} ${risk.risk === 'CRITICAL' ? styles.critical : styles.high}`}>
                    {risk.expiry}
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.widgetDesc}>{data?.td?.contract_risks.length} assets requiring renewal.</p>
          </section>

          <section className={`glass ${styles.executiveWidget}`}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetTitle}>FINANCIAL PULSE</span>
              <span className={styles.tag}>BUDGET</span>
            </div>
            <div className={styles.financialVisual}>
              <div className={styles.financialLabels}>
                <span>SHORTLIST VALUE: €{data?.td?.financial_pulse.shortlist_valuation}M</span>
                <span>CEILING: €{data?.td?.financial_pulse.budget_ceiling}M</span>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${data?.td?.financial_pulse.utilization}%` }}></div>
              </div>
            </div>
            <p className={styles.widgetDesc}>Utilizing {data?.td?.financial_pulse.utilization}% of scouting budget.</p>
          </section>

          <section className={`glass ${styles.executiveWidget}`}>
            <div className={styles.widgetHeader}>
              <span className={styles.widgetTitle}>TOP MARKET PROSPECT</span>
              <span className={styles.tag}>EXTERNAL</span>
            </div>
            <RadarChart
              size={140}
              data={data?.prospects?.[0]?.metrics || []}
            />
            <Link href={`/players/${data?.prospects?.[0]?.id}`} className={styles.widgetDesc}>
              <strong>{data?.prospects?.[0]?.name}</strong> ({data?.prospects?.[0]?.club})
            </Link>
          </section>
        </div>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          <section className={styles.prospectsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.panelTitle}>PRIORITY TARGETS (DNA ALIGNMENT)</h2>
            </div>
            <div className={`glass ${styles.listWrapper}`}>
              <ProspectList prospects={data?.prospects || []} />
            </div>
          </section>
        </main>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={`glass ${styles.feedPanel}`}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>SQUAD HEALTH ALERT</span>
            </div>
            <p className={styles.widgetDesc}>Squad stability remains {data?.td?.squad_health.overall}%. {data?.td?.squad_health.gaps} gaps identified in primary succession plan.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
