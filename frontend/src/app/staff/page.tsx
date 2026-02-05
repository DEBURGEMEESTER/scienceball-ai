"use client";

import React, { useState, useEffect } from 'react';
import styles from './Staff.module.css';
import Link from 'next/link';

interface StaffMember {
    id: number;
    name: string;
    role: string;
    specialization: string;
}

interface ActivityEvent {
    type: 'MESSAGE' | 'NEGOTIATION' | 'ASSIGNMENT';
    time: string;
    user: string;
    content: string;
    ref?: string;
}

const StaffPage = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [feed, setFeed] = useState<ActivityEvent[]>([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/staff/')
            .then(res => res.json())
            .then(data => setStaff(data));

        fetch('http://127.0.0.1:8000/staff/feed')
            .then(res => res.json())
            .then(data => setFeed(data));
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE': return '💬';
            case 'NEGOTIATION': return '💶';
            case 'ASSIGNMENT': return '📋';
            default: return '📍';
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>TECHNICAL DEPARTMENT</h1>
                <p className={styles.subtitle}>ORGANIZATIONAL INTELLIGENCE & SYNERGY</p>
            </header>

            <div className={styles.layout}>
                <section className={styles.staffGrid}>
                    <h2 className={styles.sectionTitle}>STAFF ROSTER</h2>
                    <div className={styles.roster}>
                        {staff.map(member => (
                            <div key={member.id} className={`glass ${styles.staffCard}`}>
                                <div className={styles.staffAvatar}>
                                    {(member.name || "Unknown").split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className={styles.staffInfo}>
                                    <h3 className={member.role === 'DIRECTOR' ? styles.directorName : ''}>
                                        {member.name}
                                    </h3>
                                    <span className={styles.roleTag}>{member.role}</span>
                                    <p className={styles.spec}>{member.specialization}</p>
                                </div>
                                <div className={styles.staffStats}>
                                    <div className={styles.miniStat}>
                                        <label>DEALS</label>
                                        <span>4</span>
                                    </div>
                                    <div className={styles.miniStat}>
                                        <label>HITS</label>
                                        <span>{member.role === 'ANALYST' ? '92%' : '88%'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={`glass ${styles.activityHub}`}>
                    <h2 className={styles.sectionTitle}>GLOBAL ACTIVITY LOG</h2>
                    <div className={styles.feed}>
                        {feed.map((event, i) => (
                            <div key={i} className={styles.event}>
                                <div className={styles.eventIcon}>{getIcon(event.type)}</div>
                                <div className={styles.eventContent}>
                                    <div className={styles.eventMeta}>
                                        <span className={styles.eventUser}>{event.user}</span>
                                        <span className={styles.eventTime}>{new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className={styles.eventText}>{event.content}</p>
                                    {event.ref && (
                                        <Link href={`/players/${event.ref}`} className={styles.refLink}>
                                            🔎 VIEW INTEL
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StaffPage;
