"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './Login.module.css';
import { API_BASE_URL } from '@/config';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, access_key: accessKey })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Invalid access credentials");
            }

            const data = await res.json();

            // Store session and theme
            localStorage.setItem('sb_user', JSON.stringify(data.user));
            localStorage.setItem('sb_club', JSON.stringify(data.club));

            // Redirect to dashboard
            window.location.href = '/';
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.premiumBackground}></div>
            <div className={styles.particleOverlay}></div>

            <main className={styles.loginCard}>
                <div className={styles.portalBadge}>ELITE PERFORMANCE PORTAL</div>
                <h1 className={styles.title}>SCIENCEBALL.AI</h1>
                <p className={styles.tagline}>DISCOVER THE FUTURE OF FOOTBALL DNA</p>
                <div className={styles.divider}></div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.group}>
                        <label>PROFESSIONAL EMAIL</label>
                        <input
                            type="email"
                            required
                            placeholder="scout@yourclub.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.group}>
                        <label>ORGANIZATION ACCESS KEY</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={`${styles.loginBtn} ${isLoading ? styles.loading : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'INITIATING JOURNEY...' : 'BEGIN YOUR ANALYTIC JOURNEY'}
                    </button>
                </form>

                <footer className={styles.loginFooter}>
                    POWERING NEXT-GEN TALENT IDENTIFICATION | VER 2026.4
                </footer>
            </main>
        </div>
    );
};

export default LoginPage;
