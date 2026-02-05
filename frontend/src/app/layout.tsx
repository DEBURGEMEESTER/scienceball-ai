import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ComparisonProvider } from '@/context/ComparisonContext';
import { ShortlistProvider } from '@/context/ShortlistContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthGuard from '@/components/AuthGuard/AuthGuard';
import PageShell from '@/components/layout/PageShell';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScienceBall.ai | Advanced Football Scouting",
  description: "Multidisciplinary data modeling for talent identification and recruitment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ThemeProvider>
          <AuthGuard>
            <ComparisonProvider>
              <ShortlistProvider>
                <PageShell>
                  {children}
                </PageShell>
              </ShortlistProvider>
            </ComparisonProvider>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
