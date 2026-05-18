// Vertical LCD-style bar gauge (mirrors original ThingsBoard 'lcd_bar_gauge' widget).
type Props = {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
  height?: number;
};

export function LcdBar({ value, min = 0, max = 100, label, unit = '', color = '#55c015', height = 200 }: Props) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  // Render N segments, light up the ones <= pct
  const segments = 16;
  const filled = Math.round(pct * segments);

  return (
    <div className="bg-zinc-900 rounded-lg p-3 flex flex-col items-center gap-2" style={{ height }}>
      <div className="text-xs uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="flex flex-col-reverse gap-0.5 flex-1 w-8">
        {Array.from({ length: segments }).map((_, i) => {
          const isOn = i < filled;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                background: isOn ? color : 'rgba(255,255,255,0.05)',
                boxShadow: isOn ? `0 0 6px ${color}80` : 'none',
              }}
            />
          );
        })}
      </div>
      <div className="text-lg font-bold tabular-tight text-white">
        {value.toFixed(1)}<span className="text-xs text-zinc-400 font-medium">{unit}</span>
      </div>
    </div>
  );
}
