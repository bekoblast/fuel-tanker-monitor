'use client';

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Point = { time: string; value: number };

type Props = {
  data: Point[];
  title: string;
  unit?: string;
  color?: string;
  yDomain?: [number, number];
  height?: number;
};

// Mirrors the original ThingsBoard timeseries widget look:
// dark blue grid background (#244c76), bright green line (#8af321 by default).
export function TimeseriesChart({
  data,
  title,
  unit = '%',
  color = '#8af321',
  yDomain = [0, 100],
  height = 280,
}: Props) {
  return (
    <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="font-semibold text-zinc-900 text-sm">{title}</div>
        <div className="text-xs text-zinc-500">last {data.length} readings</div>
      </div>
      <div style={{ background: '#244c76', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#545454" strokeOpacity={0.35} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <YAxis
              domain={yDomain}
              stroke="rgba(255,255,255,0.6)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(28, 28, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
              formatter={(v) => [`${Number(v).toFixed(1)}${unit}`, '']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
