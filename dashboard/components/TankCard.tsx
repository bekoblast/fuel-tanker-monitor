import Link from 'next/link';
import type { TankUpdate } from '@/lib/types';
import { getTankStatus } from '@/lib/types';
import { Battery, Signal, Thermometer, Droplet } from 'lucide-react';

type Props = { update: TankUpdate };

const STATUS_BADGE = {
  ok: { bg: 'bg-canar-green/10', border: 'border-canar-green/30', dot: 'bg-canar-green', text: 'text-canar-green', label: 'OK' },
  warning: { bg: 'bg-canar-amber/10', border: 'border-canar-amber/30', dot: 'bg-canar-amber', text: 'text-canar-amber', label: 'WARN' },
  critical: { bg: 'bg-canar-red/10', border: 'border-canar-red/30', dot: 'bg-canar-red', text: 'text-canar-red', label: 'CRITICAL' },
  inactive: { bg: 'bg-zinc-100', border: 'border-zinc-300', dot: 'bg-zinc-400', text: 'text-zinc-500', label: 'OFFLINE' },
};

export function TankCard({ update }: Props) {
  const status = getTankStatus(update);
  const s = STATUS_BADGE[status];
  const lvl = update.reading.level_percent;
  const fillColor =
    lvl < 20 ? 'bg-canar-red' :
    lvl < 40 ? 'bg-canar-amber' :
    'bg-canar-green';

  return (
    <Link
      href={`/tank/${update.imei}`}
      className="bg-white rounded-lg border border-zinc-200 hover:border-canar-blue/40 hover:shadow-md transition-all p-4 block group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate group-hover:text-canar-blue transition-colors">
            {update.device}
          </div>
          <div className="text-xs text-zinc-500 truncate">{update.site.city} · {update.device_status.model}</div>
        </div>
        <div className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${s.bg} ${s.border} ${s.text} flex items-center gap-1`}>
          <span className={`size-1.5 rounded-full ${s.dot} ${status === 'ok' ? 'live-dot' : ''}`} />
          {s.label}
        </div>
      </div>

      {/* Visual tank fill */}
      <div className="flex items-end gap-3 mb-3">
        <div className="w-10 h-20 rounded-md border-2 border-zinc-300 bg-zinc-50 relative overflow-hidden shrink-0">
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${fillColor}`}
            style={{ height: `${Math.max(2, lvl)}%` }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-3xl font-bold tabular-tight leading-none text-zinc-900">
            {lvl.toFixed(1)}<span className="text-base text-zinc-400 font-medium">%</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-tight">
            {update.reading.volume_liters.toLocaleString()} / {update.tank.capacity_liters.toLocaleString()} L
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100">
        <Stat icon={<Thermometer className="size-3.5" />} value={`${update.reading.temperature_c}°`} />
        <Stat icon={<Battery className="size-3.5" />} value={`${update.device_status.battery_percent}%`} />
        <Stat icon={<Signal className="size-3.5" />} value={`${update.device_status.gsm_signal}`} />
      </div>

      {update.events.refill && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-canar-green flex items-center gap-1">
          <Droplet className="size-3" /> Refill detected
        </div>
      )}
      {update.events.drop && (
        <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-canar-red flex items-center gap-1">
          ⚠ Drop event
        </div>
      )}
    </Link>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-600">
      <span className="text-zinc-400">{icon}</span>
      <span className="tabular-tight font-medium">{value}</span>
    </div>
  );
}
