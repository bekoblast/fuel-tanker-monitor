import type { TankUpdate } from '@/lib/types';
import { AlertTriangle, Droplet, TrendingDown } from 'lucide-react';

type Alarm = {
  imei: number;
  device: string;
  site: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  detail: string;
  timestamp: string;
};

function extractAlarms(updates: TankUpdate[]): Alarm[] {
  const alarms: Alarm[] = [];
  for (const u of updates) {
    if (u.alarms.low_level) {
      alarms.push({
        imei: u.imei,
        device: u.device,
        site: u.site.city,
        type: 'Low fuel level',
        severity: 'critical',
        detail: `${u.reading.level_percent.toFixed(1)}% / ${u.reading.volume_liters}L`,
        timestamp: u.timestamp,
      });
    }
    if (u.events.drop) {
      alarms.push({
        imei: u.imei,
        device: u.device,
        site: u.site.city,
        type: 'Sudden drop',
        severity: 'critical',
        detail: 'Possible theft / leak event',
        timestamp: u.timestamp,
      });
    }
    if (u.events.refill) {
      alarms.push({
        imei: u.imei,
        device: u.device,
        site: u.site.city,
        type: 'Refill detected',
        severity: 'info',
        detail: `Tank topped up to ${u.reading.level_percent.toFixed(1)}%`,
        timestamp: u.timestamp,
      });
    }
    if (!u.alarms.low_level && u.reading.level_percent < 40) {
      alarms.push({
        imei: u.imei,
        device: u.device,
        site: u.site.city,
        type: 'Level approaching low',
        severity: 'warning',
        detail: `Currently ${u.reading.level_percent.toFixed(1)}%`,
        timestamp: u.timestamp,
      });
    }
  }
  return alarms.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 } as const;
    return order[a.severity] - order[b.severity];
  });
}

const SEV = {
  critical: { color: 'text-canar-red', bg: 'bg-canar-red/5', icon: <AlertTriangle className="size-4" />, label: 'CRITICAL' },
  warning: { color: 'text-canar-amber', bg: 'bg-canar-amber/5', icon: <TrendingDown className="size-4" />, label: 'WARNING' },
  info: { color: 'text-canar-blue', bg: 'bg-canar-blue/5', icon: <Droplet className="size-4" />, label: 'INFO' },
} as const;

export function AlarmsTable({ updates }: { updates: TankUpdate[] }) {
  const alarms = extractAlarms(updates);

  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="font-semibold text-zinc-900">Active Alarms</div>
        <div className="text-xs text-zinc-500 tabular-tight">{alarms.length} event{alarms.length === 1 ? '' : 's'}</div>
      </div>
      {alarms.length === 0 ? (
        <div className="px-4 py-12 text-center text-zinc-400 text-sm">
          No active alarms — all tanks operating normally.
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 max-h-[400px] overflow-y-auto">
          {alarms.map((a, i) => {
            const sev = SEV[a.severity];
            return (
              <div key={i} className={`px-4 py-3 flex items-start gap-3 ${sev.bg}`}>
                <div className={`shrink-0 mt-0.5 ${sev.color}`}>{sev.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.color}`}>{sev.label}</span>
                    <span className="text-sm font-medium text-zinc-900">{a.type}</span>
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    <span className="font-medium">{a.device}</span> · {a.site} · {a.detail}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 shrink-0 tabular-tight">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
