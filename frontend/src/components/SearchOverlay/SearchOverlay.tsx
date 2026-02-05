import React from 'react';
import styles from './SearchOverlay.module.css';
import Link from 'next/link';
import { useShortlist } from '@/context/ShortlistContext';

interface PlayerResult {
    id: string;
    name: string;
    club: string;
    position: string;
}

interface SearchOverlayProps {
    results: PlayerResult[];
    isVisible: boolean;
    onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ results, isVisible, onClose }) => {
    const { toggleShortlist, isInShortlist } = useShortlist();

    if (!isVisible) return null;

    const handleAdd = (e: React.MouseEvent, playerId: string) => {
        e.preventDefault();
        e.stopPropagation();
        toggleShortlist(playerId);
        // Maybe some feedback here later
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
                {results.length > 0 ? (
                    results.map(player => (
                        <div key={player.id} className={styles.itemWrapper}>
                            <Link
                                href={`/players/${player.id}`}
                                className={styles.resultItem}
                                onClick={onClose}
                            >
                                <div className={styles.avatar}>
                                    {player.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.name}>{player.name}</span>
                                    <span className={styles.meta}>{player.club} • {player.position}</span>
                                </div>
                            </Link>
                            <button
                                className={`${styles.addBtn} ${isInShortlist(player.id) ? styles.active : ''}`}
                                onClick={(e) => handleAdd(e, player.id)}
                            >
                                {isInShortlist(player.id) ? '✓' : '＋'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>No matches found in intelligence database.</div>
                )}
            </div>
        </div>
    );
};

export default SearchOverlay;
