'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TankUpdate } from '@/lib/types';
import { getTankStatus } from '@/lib/types';

// Temperature → color (mirrors original ThingsBoard widget: blue→red as temp rises)
function tempColor(t: number): string {
  const pct = Math.max(0, Math.min(1, (t + 60) / 120));
  const r = Math.round(60 + 195 * pct);
  const b = Math.round(220 - 170 * pct);
  const g = Math.round(80 + 30 * (1 - Math.abs(pct - 0.5) * 2));
  return `rgb(${r}, ${g}, ${b})`;
}

function FitBounds({ updates }: { updates: TankUpdate[] }) {
  const map = useMap();
  useEffect(() => {
    if (updates.length === 0) return;
    const bounds = L.latLngBounds(updates.map((u) => [u.site.lat, u.site.long] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [updates, map]);
  return null;
}

export function TankMapInner({ updates, height = 480 }: { updates: TankUpdate[]; height?: number }) {
  // Default center: Sudan
  const center: [number, number] = useMemo(() => [15.5, 32.5], []);

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-zinc-200">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds updates={updates} />
        {updates.map((u) => {
          const status = getTankStatus(u);
          const color = status === 'critical' ? '#ed0a0a' : tempColor(u.reading.temperature_c);
          return (
            <CircleMarker
              key={u.imei}
              center={[u.site.lat, u.site.long]}
              radius={status === 'critical' ? 14 : 11}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: color,
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-zinc-900">{u.device}</div>
                  <div className="text-xs text-zinc-600">{u.site.name}</div>
                  <div className="text-xs text-zinc-500 pt-1 border-t border-zinc-200 mt-1">
                    <div>Level: <strong className="text-zinc-900">{u.reading.level_percent.toFixed(1)}%</strong></div>
                    <div>Volume: <strong className="text-zinc-900">{u.reading.volume_liters} L</strong></div>
                    <div>Temp: <strong className="text-zinc-900">{u.reading.temperature_c}°C</strong></div>
                    <div>Battery: <strong className="text-zinc-900">{u.device_status.battery_percent}%</strong></div>
                  </div>
                  <a
                    href={`/tank/${u.imei}`}
                    className="block text-xs text-canar-blue font-medium pt-1 hover:underline"
                  >
                    View details →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
