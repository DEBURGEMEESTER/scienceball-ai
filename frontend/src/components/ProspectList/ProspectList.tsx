import React from 'react';
import styles from './ProspectList.module.css';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

interface Prospect {
    id: string;
    name: string;
    club: string;
    position: string;
    market_value: string;
    predicted_growth: number;
    recruitment_reason?: string;
    match_score?: number;
}

interface ProspectListProps {
    prospects: Prospect[];
}

const ProspectList: React.FC<ProspectListProps> = ({ prospects }) => {
    if (!Array.isArray(prospects)) return <div>No targets available.</div>;
    return (
        <div className={styles.list}>
            <div className={styles.listHeader}>
                <span>PLAYER</span>
                <span>CLUB</span>
                <span>POS</span>
                <span>VALUE</span>
                <span className={styles.alignRight}>PRED. GROWTH</span>
            </div>
            {prospects.map((player) => (
                <Link
                    key={player.id}
                    href={`/players/${player.id}`}
                    className={`${styles.row} glass-hover`}
                >
                    <div className={styles.playerInfo}>
                        <div className={styles.avatar}>{player.name.split(' ').map(n => n[0]).join('')}</div>
                        <div className={styles.nameColumn}>
                            <span className={styles.playerName}>{player.name}</span>
                            {player.recruitment_reason && (
                                <span className={styles.recruitmentReason}>{player.recruitment_reason}</span>
                            )}
                        </div>
                    </div>
                    <span className={styles.clubName}>{player.club}</span>
                    <span className={styles.position}>{player.position}</span>
                    <span className={styles.value}>{formatCurrency(player.market_value)}</span>
                    <div className={`${styles.growth} ${styles.alignRight}`}>
                        <span className={styles.growthValue}>+{player.predicted_growth}%</span>
                        <div className={styles.growthBar}>
                            <div
                                className={styles.growthFill}
                                style={{ width: `${Math.min(player.predicted_growth * 4, 100)}%` }}
                            />
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default ProspectList;
