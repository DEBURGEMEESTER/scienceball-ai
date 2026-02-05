"use client";

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ComparisonPanel from '@/components/Comparison/ComparisonPanel';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import ConnectionStatus from '@/components/ConnectionStatus/ConnectionStatus';

export default function PageShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <div className="login-wrapper">{children}</div>;
    }

    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
            <ComparisonPanel />
            <ChatWidget />
            <ConnectionStatus />
        </div>
    );
}
