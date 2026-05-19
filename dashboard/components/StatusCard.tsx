'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  label: string;
  value: number | string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple';
  icon?: React.ReactNode;
  subtitle?: string;
};

const COLOR_MAP = {
  blue: 'bg-canar-blue',
  green: 'bg-canar-green',
  amber: 'bg-canar-amber',
  red: 'bg-canar-red',
  gray: 'bg-canar-gray',
  purple: 'bg-canar-purple',
} as const;

export function StatusCard({ label, value, color, icon, subtitle }: Props) {
  // Flash + scale the value briefly when it changes so the card visibly
  // reacts to live updates.
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div
      className={`relative ${COLOR_MAP[color]} text-white rounded-lg shadow-sm p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] ${flash ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-canar-bg' : ''}`}
    >
      {/* Tiny pulsing dot in the corner: signals that this card is wired to a live stream */}
      <span className="absolute top-2 right-2 size-1.5 rounded-full bg-white/70 live-dot" aria-hidden="true" />

      {icon && (
        <div className="size-12 rounded-md bg-white/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div
          className={`text-3xl font-bold tabular-tight leading-none transition-transform duration-500 origin-left ${flash ? 'animate-status-bump' : ''}`}
        >
          {value}
        </div>
        <div className="text-sm font-medium uppercase tracking-wide opacity-90 mt-1">{label}</div>
        {subtitle && <div className="text-xs opacity-75 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
