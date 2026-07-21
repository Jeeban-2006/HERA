'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface RouteMapProps {
  routeResult: {
    safestRoute: { coordinates: [number, number][] };
    fastestRoute: { coordinates: [number, number][] };
  } | null;
  selectedRoute: 'safest' | 'fastest' | null;
}

const DEFAULT_CENTER: [number, number] = [19.0544, 72.8347]; // [lat, lng]

// Helper component to auto-fit bounds when routes change
function MapBoundsFitter({ routes }: { routes: [number, number][][] }) {
  const map = useMap();

  useEffect(() => {
    if (!routes || routes.length === 0) return;
    
    const allCoords = routes.flat();
    if (allCoords.length === 0) return;

    // Convert [lng, lat] to [lat, lng] for bounds calculation
    const latLngs = allCoords.map(c => [c[1], c[0]] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, routes]);

  return null;
}

export default function RouteMap({ routeResult, selectedRoute }: RouteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR issues with Leaflet

  // Mapbox uses [lng, lat], Leaflet uses [lat, lng]
  const safestCoords = routeResult?.safestRoute.coordinates.map(c => [c[1], c[0]] as [number, number]) || [];
  const fastestCoords = routeResult?.fastestRoute.coordinates.map(c => [c[1], c[0]] as [number, number]) || [];

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden relative">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {routeResult && (
          <MapBoundsFitter 
            routes={[routeResult.safestRoute.coordinates, routeResult.fastestRoute.coordinates]} 
          />
        )}

        {safestCoords.length > 0 && (
          <Polyline 
            positions={safestCoords} 
            color="#00FFD1" 
            weight={selectedRoute === 'safest' ? 6 : 4} 
            opacity={selectedRoute === 'fastest' ? 0.3 : 1}
          />
        )}

        {fastestCoords.length > 0 && (
          <Polyline 
            positions={fastestCoords} 
            color="#6B7B9E" 
            weight={selectedRoute === 'fastest' ? 5 : 3} 
            opacity={selectedRoute === 'safest' ? 0.3 : 1}
            dashArray="5, 10"
          />
        )}
      </MapContainer>
      
      {/* Legend overlay */}
      {routeResult && (
        <div className="absolute bottom-4 left-4 z-[1000] p-4 rounded-xl bg-surface/80 backdrop-blur-md border border-white/10 w-full max-w-xs text-sm text-text-muted pointer-events-none shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-1.5 rounded-full bg-bio-teal" /> 
            <span className={selectedRoute === 'safest' ? 'text-bio-teal font-semibold' : ''}>Safest route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full bg-text-muted" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#6B7B9E 0,#6B7B9E 4px,transparent 4px,transparent 8px)' }} /> 
            <span className={selectedRoute === 'fastest' ? 'text-white font-semibold' : ''}>Fastest route</span>
          </div>
        </div>
      )}
    </div>
  );
}
