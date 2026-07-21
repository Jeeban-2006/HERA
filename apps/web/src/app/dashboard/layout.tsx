'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/global/Sidebar';
import { useAuthStore } from '@/state/auth.store';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { accessToken, hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.push('/login');
    }
  }, [hasHydrated, accessToken, router]);

  if (!hasHydrated || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void text-bio-teal">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-80 pt-20">
        <main className="min-h-[calc(100vh-5rem)] p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
