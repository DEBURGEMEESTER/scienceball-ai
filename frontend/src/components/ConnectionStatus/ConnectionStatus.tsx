"use client";

import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/', { method: 'HEAD' });
                setIsOnline(res.ok);
            } catch (err) {
                setIsOnline(false);
            }
        };

        const interval = setInterval(checkConnection, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    if (isOnline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00f2ff',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                filter: 'drop-shadow(0 0 10px #00f2ff)'
            }}>📡</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>CONNECTION LOST</h1>
            <p style={{ opacity: 0.7, maxWidth: '400px', lineHeight: '1.6' }}>
                ScienceBall Intel Engine has entered an offline state.
                Retrying biometric handshake with the central cognitive network...
            </p>
            <div style={{
                marginTop: '2rem',
                width: '100px',
                height: '2px',
                background: 'rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '40%',
                    height: '100%',
                    background: '#00f2ff',
                    animation: 'scan 1.5s infinite linear'
                }}></div>
            </div>
            <style jsx>{`
                @keyframes scan {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(250%); }
                }
            `}</style>
        </div>
    );
};

export default ConnectionStatus;
