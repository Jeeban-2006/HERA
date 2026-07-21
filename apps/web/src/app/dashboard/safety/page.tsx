'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
const RouteMap = dynamic(() => import('@/components/safety/RouteMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[500px] rounded-2xl bg-surface border border-bio-violet/20 animate-pulse flex items-center justify-center text-text-muted">Loading map...</div>
});
import { RouteSidebar } from '@/components/safety/RouteSidebar';
import { SOSPanel } from '@/components/safety/SOSPanel';
import type { RouteResult } from '@/types/safety.types';

export default function SafetyPage() {
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<'safest' | 'fastest' | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-display font-bold">Safety <span className="text-bio-violet">Routes</span></h1>
        <p className="text-text-muted">Intelligent route recommendations with real-time safety scoring</p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
        {/* Map */}
        <RouteMap routeResult={routeResult} selectedRoute={selectedRoute} />

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          <RouteSidebar
            routeResult={routeResult}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
            onSearch={(result) => {
              setRouteResult(result);
              setSelectedRoute('safest');
            }}
          />
          <SOSPanel />
        </div>
      </div>
    </div>
  );
}
