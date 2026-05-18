type Props = {
  percent: number; // 0-100
  size?: number; // px
  label?: string;
  unit?: string;
};

// Radial gauge — mirrors the ThingsBoard 'temperature_radial_gauge_canvas_gauges' look.
// Thresholds: red 0-25, yellow 25-50, green 50-100 (matches original Canar dashboard).
export function TankGauge({ percent, size = 200, label = 'Level', unit = '%' }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));

  // Half-circle gauge spans 180 deg (from -90 to +90 around top)
  // We render an arc with 3 colored segments + a needle
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 18;
  const strokeW = 14;

  // Arc helper: angle in degrees, 0 = top, going clockwise
  const polar = (angle: number, radius: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  // Arc from -135 deg to +135 deg (270 degrees total spread)
  const startAngle = -135;
  const endAngle = 135;
  const sweep = endAngle - startAngle;

  // Segments: red 0-25%, yellow 25-50%, green 50-100%
  const segments = [
    { from: 0, to: 25, color: '#f30000' },
    { from: 25, to: 50, color: '#d7ff00' },
    { from: 50, to: 100, color: '#1ede63' },
  ];

  const arcPath = (fromPct: number, toPct: number) => {
    const a1 = startAngle + (sweep * fromPct) / 100;
    const a2 = startAngle + (sweep * toPct) / 100;
    const p1 = polar(a1, r);
    const p2 = polar(a2, r);
    const largeArc = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
  };

  // Needle
  const needleAngle = startAngle + (sweep * clamped) / 100;
  const needleTip = polar(needleAngle, r - 6);
  const needleBack = polar(needleAngle + 180, 12);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.9}`}>
        {/* Background track */}
        <path
          d={arcPath(0, 100)}
          stroke="#e5e7eb"
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />
        {/* Colored segments */}
        {segments.map((s, i) => (
          <path
            key={i}
            d={arcPath(s.from, s.to)}
            stroke={s.color}
            strokeWidth={strokeW}
            fill="none"
            strokeLinecap="butt"
            opacity={0.95}
          />
        ))}
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = startAngle + (sweep * tick) / 100;
          const inner = polar(a, r - strokeW - 4);
          const outer = polar(a, r - strokeW - 12);
          const labelP = polar(a, r - strokeW - 26);
          return (
            <g key={tick}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="#71717a"
                strokeWidth={1.5}
              />
              <text
                x={labelP.x}
                y={labelP.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fill="#71717a"
              >
                {tick}
              </text>
            </g>
          );
        })}
        {/* Needle */}
        <line
          x1={needleBack.x}
          y1={needleBack.y}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#1c1c1c"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="#1c1c1c" />
        {/* Center value */}
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          fontSize={28}
          fontWeight={700}
          fill="#1c1c1c"
          className="tabular-tight"
        >
          {clamped.toFixed(1)}
          <tspan fontSize={16} fontWeight={500} fill="#71717a"> {unit}</tspan>
        </text>
        <text
          x={cx}
          y={cy + 56}
          textAnchor="middle"
          fontSize={11}
          fill="#71717a"
          className="uppercase tracking-wider"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
