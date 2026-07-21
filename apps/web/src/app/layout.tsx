import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import '@/styles/globals.css';
import { ParticleField } from '@/components/animations/ParticleField';
import { PulsingGradient } from '@/components/animations/PulsingGradient';
import { ToastProvider } from '@/components/global/ToastProvider';
import { Navbar } from '@/components/global/Navbar';
import { Footer } from '@/components/global/Footer';
import { QueryProvider } from '@/app/providers';
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: 'HERA - Women\'s Health Platform',
  description: 'AI-powered women\'s health intelligence platform. PCOD analysis, mood tracking, and women safety.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050810',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50' font-size='50' fill='%2300FFD1' dominant-baseline='middle' text-anchor='middle'>♀</text></svg>" />
      </head>
      <body className="bg-void text-text-primary overflow-x-hidden" suppressHydrationWarning>
        <ParticleField />
        <PulsingGradient />
        <NextTopLoader
          color="#00FFD1"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #00FFD1,0 0 5px #00FFD1"
        />
        <Navbar />

        <QueryProvider>
          <ToastProvider />
          {children}
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
