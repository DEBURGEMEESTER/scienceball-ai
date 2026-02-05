"use client";

import React, { useEffect, useState } from 'react';
import styles from './ScoutingFeed.module.css';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';

interface FeedEvent {
    type: 'MESSAGE' | 'NEGOTIATION' | 'ASSIGNMENT';
    time: string;
    user: string;
    content: string;
    ref?: string;
}

const ScoutingFeed = () => {
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/staff/feed`);
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Failed to fetch global feed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
        const interval = setInterval(fetchFeed, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE': return '💬';
            case 'NEGOTIATION': return '💶';
            case 'ASSIGNMENT': return '📋';
            default: return '📍';
        }
    };

    if (loading) return <div className={styles.loading}>Connecting to global intelligence stream...</div>;

    return (
        <div className={styles.feedContainer}>
            <div className={styles.feedHeader}>
                <div className={styles.liveIndicator}>
                    <span className={styles.pulse}></span>
                    GLOBAL ACTIVITY FEED
                </div>
                <span className={styles.count}>{events.length} ACTIVE SIGNALS</span>
            </div>
            <div className={styles.eventList}>
                {events.map((event, idx) => (
                    <div key={idx} className={styles.eventCard}>
                        <div className={styles.eventBody}>
                            <div className={styles.eventHeader}>
                                <span className={styles.eventType}>{getIcon(event.type)} {event.type}</span>
                                <span className={styles.timestamp}>{new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={styles.eventContent}>
                                <div className={styles.eventUser}>{event.user}</div>
                                <p className={styles.details}>{event.content}</p>
                                {event.ref && (
                                    <Link href={`/players/${event.ref}`} className={styles.refLink}>
                                        🔎 VIEW PROFILE
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScoutingFeed;
