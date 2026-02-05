"use client";

import React from 'react';
import Link from 'next/link';
import { useShortlist } from '@/context/ShortlistContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const { shortlist } = useShortlist();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/scout', label: 'Scouting Hub', icon: '🕵️‍♂️' },
    { href: '/matchday', label: 'Tactical Prep', icon: '🏟️' },
    { href: '/pipeline', label: 'Recruitment Pipeline', icon: '📈' },
    { href: '/staff', label: 'Staff Hub', icon: '🏢' },
    { href: '/director/decisions', label: 'Decision Support', icon: '⚖️' },
    { href: '/director', label: 'Director Hub', icon: '🏢' },
    { href: '/shortlists', label: 'Shortlists', icon: '⭐', count: shortlist.length },
    { href: '/compare', label: 'DNA Analysis', icon: '🧬' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoArea}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>SB</span>
            {!isCollapsed && <span className={styles.logoText}>INTEL</span>}
          </div>
        </Link>
        <button onClick={toggleSidebar} className={styles.topToggleBtn}>
          ☰
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item: any) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            <span className={styles.icon}>{item.icon}</span>
            {!isCollapsed && <span className={styles.label}>{item.label}</span>}

            {item.count !== undefined && item.count > 0 && (
              <span className={`${styles.badge} ${isCollapsed ? styles.mini : ''}`}>
                {item.count}
              </span>
            )}

            {item.badge && !isCollapsed && (
              <span className={styles.statusBadge}>{item.badge}</span>
            )}
          </Link>
        ))}

        <div className={styles.navDivider}></div>
        {isMounted && (() => {
          const clubStr = localStorage.getItem('sb_club');
          const club = clubStr ? JSON.parse(clubStr) : {};

          if (club.is_admin) {
            return (
              <>
                <Link href="/admin/archive" className={styles.navLink}>
                  <span className={styles.icon}>🔒</span>
                  {!isCollapsed && <span className={styles.label}>Data Vault</span>}
                </Link>
                <Link href="/admin" className={styles.navLink}>
                  <span className={styles.icon}>🗄️</span>
                  {!isCollapsed && <span className={styles.label}>Data Room</span>}
                </Link>
              </>
            );
          }
          return null;
        })()}

        <Link href="/settings" className={styles.navLink}>
          <span className={styles.icon}>⚙️</span>
          {!isCollapsed && <span className={styles.label}>Settings</span>}
        </Link>
      </nav>

      <div className={styles.footer}>
        {!isCollapsed && (
          <div className={styles.engineStatus}>
            <div className={styles.statusDot}></div>
            <span>INTEL ENGINE: ACTIVE</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
