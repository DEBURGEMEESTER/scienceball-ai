"use client";

import React from 'react';
import styles from './ProfileTabs.module.css';

interface ProfileTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'attributes', label: 'Detailed Attributes' },
        { id: 'history', label: 'Market History' },
        { id: 'intelligence', label: 'Sim Intelligence' },
        { id: 'negotiation', label: 'Negotiation Hub' },
        { id: 'medical', label: 'Medical & Physical' },
        { id: 'field_notes', label: 'Collaborative Notes' },
    ];

    return (
        <nav className={styles.tabs}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    );
};

export default ProfileTabs;
