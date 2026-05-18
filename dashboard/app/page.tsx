'use client';

import { useTankStream } from '@/hooks/useTankStream';
import { StatusCard } from '@/components/StatusCard';
import { TankCard } from '@/components/TankCard';
import { AlarmsTable } from '@/components/AlarmsTable';
import { TankMap } from '@/components/TankMap';
import { LiveIndicator } from '@/components/LiveIndicator';
import { AboutBanner } from '@/components/AboutBanner';
import { getTankStatus } from '@/lib/types';
import { Database, CheckCircle2, AlertTriangle, AlertOctagon, PowerOff } from 'lucide-react';

export default function OverviewPage() {
  const { tanks, source, connected } = useTankStream();
  const updates = Array.from(tanks.values()).sort((a, b) => a.device.localeCompare(b.device));

  const total = updates.length;
  const counts = updates.reduce(
    (acc, u) => {
      const s = getTankStatus(u);
      acc[s]++;
      return acc;
    },
    { ok: 0, warning: 0, critical: 0, inactive: 0 }
  );

  return (
    <div className="space-y-6">
      <AboutBanner />

      {/* Page header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Tank Fleet Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Live monitoring of {total} fuel tanker{total === 1 ? '' : 's'} across Sudan.
          </p>
        </div>
        <LiveIndicator source={source} connected={connected} />
      </div>

      {/* Status cards row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard
          label="Total"
          value={total}
          color="blue"
          icon={<Database className="size-6 text-white" />}
        />
        <StatusCard
          label="Active"
          value={counts.ok}
          color="green"
          icon={<CheckCircle2 className="size-6 text-white" />}
        />
        <StatusCard
          label="Inactive"
          value={counts.inactive}
          color="gray"
          icon={<PowerOff className="size-6 text-white" />}
        />
        <StatusCard
          label="Warning"
          value={counts.warning}
          color="amber"
          icon={<AlertTriangle className="size-6 text-white" />}
        />
        <StatusCard
          label="Critical"
          value={counts.critical}
          color="red"
          icon={<AlertOctagon className="size-6 text-white" />}
        />
      </div>

      {/* Map + Alarms row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="font-semibold text-zinc-900">Device Locations</div>
              <div className="text-xs text-zinc-500">Markers colored by temperature (cooler → warmer)</div>
            </div>
            <TankMap updates={updates} height={480} />
          </div>
        </div>
        <div>
          <AlarmsTable updates={updates} />
        </div>
      </div>

      {/* Tank cards grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-900">All Tanks</h2>
          <div className="text-xs text-zinc-500">Click a card for detailed readings</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {updates.map((u) => (
            <TankCard key={u.imei} update={u} />
          ))}
        </div>
      </div>
    </div>
  );
}
