'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ShieldCheck, Sun, Users, Camera, Moon, AlertTriangle, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { useFindRoute } from '@/hooks/useSafety';
import type { RouteResult } from '@/types/safety.types';

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck, Sun, Users, Camera, Moon, AlertTriangle, X,
};

const LOCATIONS = [
  { name: 'Bandra Station', lat: 19.0544, lng: 72.8347 },
  { name: 'Andheri Station', lat: 19.1136, lng: 72.8479 },
  { name: 'Powai', lat: 19.1176, lng: 72.9060 },
  { name: 'BKC', lat: 19.0596, lng: 72.8295 },
  { name: 'Juhu Beach', lat: 19.1031, lng: 72.8273 },
];

interface RouteSidebarProps {
  routeResult: RouteResult | null;
  selectedRoute: 'safest' | 'fastest' | null;
  onRouteSelect: (type: 'safest' | 'fastest') => void;
  onSearch: (result: RouteResult) => void;
}

export function RouteSidebar({ routeResult, selectedRoute, onRouteSelect, onSearch }: RouteSidebarProps) {
  const [originIndex, setOriginIndex] = useState<string>('');
  const [destinationIndex, setDestinationIndex] = useState<string>('');
  
  const findRouteMutation = useFindRoute();

  const handleSearch = () => {
    if (originIndex === '' || destinationIndex === '') return;
    const origin = LOCATIONS[Number(originIndex)];
    const destination = LOCATIONS[Number(destinationIndex)];
    
    findRouteMutation.mutate(
      { origin: { lat: origin.lat, lng: origin.lng }, destination: { lat: destination.lat, lng: destination.lng } },
      {
        onSuccess: (data) => {
          onSearch(data);
        }
      }
    );
  };

  const activeRoute = routeResult
    ? selectedRoute === 'fastest' ? routeResult.fastestRoute : routeResult.safestRoute
    : null;

  return (
    <div className="space-y-4">
      {/* Search */}
      <GlassCard className="p-4 space-y-3" glowColor="violet">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bio-violet" />
          <select
            value={originIndex}
            onChange={(e) => setOriginIndex(e.target.value)}
            className="input-base pl-9 w-full bg-void/50 text-text-primary border border-white/10"
          >
            <option value="" disabled>Select origin...</option>
            {LOCATIONS.map((loc, idx) => (
              <option key={`orig-${idx}`} value={idx}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bio-coral" />
          <select
            value={destinationIndex}
            onChange={(e) => setDestinationIndex(e.target.value)}
            className="input-base pl-9 w-full bg-void/50 text-text-primary border border-white/10"
          >
            <option value="" disabled>Select destination...</option>
            {LOCATIONS.map((loc, idx) => (
              <option key={`dest-${idx}`} value={idx}>{loc.name}</option>
            ))}
          </select>
        </div>
        
        {findRouteMutation.isError && (
          <p className="text-red-400 text-xs text-center">Failed to find route. Please try again.</p>
        )}

        <GlowButton
          variant="primary"
          accent="violet"
          size="md"
          className="w-full"
          onClick={handleSearch}
          disabled={originIndex === '' || destinationIndex === '' || findRouteMutation.isPending}
        >
          {findRouteMutation.isPending ? 'Calculating safest path…' : '🛡️ Find Safe Route'}
        </GlowButton>
      </GlassCard>

      {/* Route Comparison */}
      {routeResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Route Options</h3>
          <div className="grid grid-cols-2 gap-3">
            {[routeResult.safestRoute, routeResult.fastestRoute].map((route) => {
              const isSafest = route.type === 'safest';
              const isSelected = selectedRoute === route.type || (!selectedRoute && isSafest);
              return (
                <GlassCard
                  key={route.type}
                  className={`p-3 cursor-pointer border-2 transition-all ${
                    isSelected
                      ? isSafest ? 'border-bio-teal' : 'border-bio-coral'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                  onClick={() => onRouteSelect(route.type as 'safest'|'fastest')}
                >
                  {isSafest && (
                    <span className="text-xs bg-bio-teal/20 text-bio-teal border border-bio-teal/30 rounded-full px-2 py-0.5 font-mono mb-2 block w-fit">
                      Recommended
                    </span>
                  )}
                  <div className="text-sm font-semibold text-text-primary capitalize">{route.type}</div>
                  <div className="text-xs text-text-muted mt-1">{route.distance} · {route.duration}</div>
                  <div
                    className="text-sm font-mono font-bold mt-2"
                    style={{ color: route.safetyScore >= 7 ? '#00FFD1' : '#FF5F7E' }}
                  >
                    {route.safetyScore} / 10
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Safety Signals */}
          {activeRoute && (
            <GlassCard className="p-4 space-y-2">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Safety Signals</h3>
              {activeRoute.signals.map((signal, idx) => {
                const Icon = ICON_MAP[signal.iconName] ?? ShieldCheck;
                return (
                  <motion.div
                    key={signal.type + idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: signal.positive ? '#00FFD1' : '#FF5F7E' }}
                    />
                    <span className="text-xs text-text-muted">{signal.description}</span>
                  </motion.div>
                );
              })}
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
