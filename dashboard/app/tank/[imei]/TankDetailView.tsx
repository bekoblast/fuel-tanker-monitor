'use client';

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTankStream } from '@/hooks/useTankStream';
import { TankGauge } from '@/components/TankGauge';
import { LcdBar } from '@/components/LcdBar';
import { TimeseriesChart } from '@/components/TimeseriesChart';
import { TankMap } from '@/components/TankMap';
import { LiveIndicator } from '@/components/LiveIndicator';
import { getTankStatus } from '@/lib/types';
import { ChevronLeft, Battery, Signal, Cpu, Radio, Calendar, MapPin } from 'lucide-react';

const MAX_HISTORY = 40;

export function TankDetailView() {
  const params = useParams<{ imei: string }>();
  const imei = parseInt(params.imei, 10);
  const { tanks, source, connected } = useTankStream();
  const update = tanks.get(imei);

  const [history, setHistory] = useState<Array<{ time: string; level: number; temp: number; battery: number }>>([]);
  const lastTsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!update) return;
    if (update.timestamp === lastTsRef.current) return;
    lastTsRef.current = update.timestamp;
    setHistory((h) => {
      const next = [
        ...h,
        {
          time: new Date(update.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          level: update.reading.level_percent,
          temp: update.reading.temperature_c,
          battery: update.device_status.battery_percent,
        },
      ];
      return next.slice(-MAX_HISTORY);
    });
  }, [update]);

  if (!update) {
    return (
      <div className="text-center py-24 text-zinc-500">
        <p>Waiting for tank data...</p>
        <Link href="/" className="text-canar-blue hover:underline text-sm mt-2 inline-block">
          ← Back to overview
        </Link>
      </div>
    );
  }

  const status = getTankStatus(update);
  const statusBadge =
    status === 'critical' ? 'bg-canar-red text-white' :
    status === 'warning' ? 'bg-canar-amber text-white' :
    status === 'inactive' ? 'bg-canar-gray text-white' :
    'bg-canar-green text-white';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-canar-blue gap-1 mb-2">
          <ChevronLeft className="size-4" />
          Back to overview
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">{update.device}</h1>
              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${statusBadge}`}>
                {status}
              </span>
            </div>
            <div className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
              <MapPin className="size-3.5" />
              {update.site.name}
            </div>
          </div>
          <LiveIndicator source={source} connected={connected} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white rounded-lg border border-zinc-200 p-4 flex flex-col">
          <div className="font-semibold text-zinc-900 mb-2">Current Tank Level</div>
          <div className="flex-1 flex items-center justify-center">
            <TankGauge percent={update.reading.level_percent} size={260} />
          </div>
          <div className="text-center text-sm text-zinc-500 tabular-tight">
            <strong className="text-zinc-900">{update.reading.volume_liters.toLocaleString()}</strong> / {update.tank.capacity_liters.toLocaleString()} L
            &nbsp;·&nbsp;
            <strong className="text-zinc-900">{update.reading.fuel_depth_cm}</strong> cm depth
          </div>
        </div>

        <div className="lg:col-span-2">
          <LcdBar
            value={update.reading.temperature_c}
            min={0}
            max={50}
            label="Temp"
            unit="°C"
            height={360}
          />
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3 content-start">
          <InfoCard icon={<Battery className="size-5" />} label="Battery" value={`${update.device_status.battery_percent}%`} sub={`${update.device_status.battery_volt} V`} accent="green" />
          <InfoCard icon={<Signal className="size-5" />} label="GSM Signal" value={update.device_status.gsm_signal.toString()} sub={update.device_status.hw_revision} accent="blue" />
          <InfoCard icon={<Cpu className="size-5" />} label="Model" value={update.device_status.model} sub={`SW ${update.device_status.sw_version}`} accent="purple" />
          <InfoCard icon={<Radio className="size-5" />} label="IMEI" value={String(update.imei).slice(-6)} sub="last 6 digits" accent="gray" />
          <InfoCard icon={<Calendar className="size-5" />} label="Last Reading" value={update.reading.rtc} sub={`every ${update.device_status.logger_interval_min} min`} accent="blue" />
          <InfoCard icon={<MapPin className="size-5" />} label="Coordinates" value={`${update.site.lat.toFixed(4)}`} sub={`${update.site.long.toFixed(4)}`} accent="gray" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeseriesChart data={history.map((h) => ({ time: h.time, value: h.level }))} title="Liquid Level" unit="%" color="#8af321" yDomain={[0, 100]} />
        <TimeseriesChart data={history.map((h) => ({ time: h.time, value: h.temp }))} title="Temperature" unit="°C" color="#efab16" yDomain={[0, 50]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200">
              <div className="font-semibold text-zinc-900">Location</div>
              <div className="text-xs text-zinc-500">{update.site.address}</div>
            </div>
            <TankMap updates={[update]} height={300} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg border border-zinc-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
            <div className="font-semibold text-zinc-900">Recent Readings</div>
            <div className="text-xs text-zinc-500">{history.length} readings since page open</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-2">Time</th>
                  <th className="text-right px-4 py-2">Level %</th>
                  <th className="text-right px-4 py-2">Temp °C</th>
                  <th className="text-right px-4 py-2">Battery %</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().slice(0, 12).map((h, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className="px-4 py-2 font-mono text-xs text-zinc-600">{h.time}</td>
                    <td className="px-4 py-2 text-right tabular-tight font-medium">{h.level.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right tabular-tight">{h.temp.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right tabular-tight">{h.battery}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-400">Waiting for readings…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon, label, value, sub, accent,
}: { icon: React.ReactNode; label: string; value: string; sub?: string; accent: 'blue' | 'green' | 'purple' | 'gray' }) {
  const ACCENT = {
    blue: 'text-canar-blue bg-canar-blue/10',
    green: 'text-canar-green bg-canar-green/10',
    purple: 'text-canar-purple bg-canar-purple/10',
    gray: 'text-zinc-600 bg-zinc-200/50',
  };
  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-3 flex items-center gap-3">
      <div className={`size-10 rounded-md flex items-center justify-center ${ACCENT[accent]}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
        <div className="font-semibold text-zinc-900 tabular-tight truncate">{value}</div>
        {sub && <div className="text-xs text-zinc-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}
