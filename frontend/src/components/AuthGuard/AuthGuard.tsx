"use client";

import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const user = localStorage.getItem('sb_user');
        const path = window.location.pathname;
        if (!user && path !== '/login') {
            window.location.href = '/login';
        }
    }, []);

    return <>{children}</>;
}
