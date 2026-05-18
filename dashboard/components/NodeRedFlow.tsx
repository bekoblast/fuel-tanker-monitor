// Stylized SVG mockup of the actual Node-RED simulator flow.
// Matches Node-RED's visual language: rounded nodes, colored icon tab on the
// left, white body with the label, small ports, curved wires between them.

type NodeKind = 'inject' | 'function' | 'ws' | 'debug' | 'catch' | 'comment';

type Node = {
  id: string;
  kind: NodeKind;
  label: string;
  icon: string;
  x: number;
  y: number;
  w?: number;
};

type Wire = { from: string; to: string };

// Color palette — matches Node-RED's default node colors
const KIND_COLOR: Record<NodeKind, string> = {
  inject: '#a6bbcf',   // pale blue
  function: '#fdd0a2', // peach
  ws: '#dcdcdc',       // light gray
  debug: '#87a980',    // muted green
  catch: '#e2d96e',    // yellow-green
  comment: '#ffeb3b',  // bright yellow
};

const NODE_H = 36;
const DEFAULT_W = 168;

const NODES: Node[] = [
  { id: 'inject', kind: 'inject', label: 'Every 5s', icon: '⏰', x: 20, y: 80, w: 110 },
  { id: 'sim', kind: 'function', label: 'Tank Simulator', icon: 'ƒ', x: 175, y: 80, w: 170 },
  { id: 'dec', kind: 'function', label: 'Data to Process', icon: 'ƒ', x: 395, y: 80, w: 170 },
  { id: 'fmt', kind: 'function', label: 'Format for WS', icon: 'ƒ', x: 615, y: 80, w: 150 },
  { id: 'ws', kind: 'ws', label: 'WS /ws/tanks', icon: '⇄', x: 815, y: 60, w: 145 },
  { id: 'dbg1', kind: 'debug', label: 'raw 140-byte buffer', icon: '🐛', x: 175, y: 195, w: 170 },
  { id: 'dbg2', kind: 'debug', label: 'tank update (JSON)', icon: '🐛', x: 615, y: 130, w: 150 },
  { id: 'catch', kind: 'catch', label: 'Catch all errors', icon: '⚠', x: 20, y: 290, w: 130 },
  { id: 'dbg3', kind: 'debug', label: 'error', icon: '🐛', x: 200, y: 290, w: 90 },
];

const WIRES: Wire[] = [
  { from: 'inject', to: 'sim' },
  { from: 'sim', to: 'dec' },
  { from: 'sim', to: 'dbg1' },
  { from: 'dec', to: 'fmt' },
  { from: 'fmt', to: 'ws' },
  { from: 'fmt', to: 'dbg2' },
  { from: 'catch', to: 'dbg3' },
];

function getPortPositions(node: Node): { in: [number, number]; out: [number, number] } {
  const w = node.w ?? DEFAULT_W;
  return {
    in: [node.x, node.y + NODE_H / 2],
    out: [node.x + w, node.y + NODE_H / 2],
  };
}

function wirePath(from: [number, number], to: [number, number]): string {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function NodeRedFlow() {
  const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="not-prose bg-zinc-100 rounded-lg border border-zinc-300 p-4 overflow-x-auto">
      {/* Tab header (mimics Node-RED tab bar) */}
      <div className="flex items-center gap-1 mb-3 text-xs">
        <div className="bg-white border border-zinc-300 border-b-white px-3 py-1.5 rounded-t-md font-medium text-zinc-700 -mb-px">
          Canar Rebuild — Simulator
        </div>
        <div className="text-zinc-400 px-2 py-1.5">Tank Level Production</div>
        <div className="text-zinc-400 px-2 py-1.5">Energy Meter v1.1</div>
        <div className="flex-1 border-b border-zinc-300" />
      </div>

      {/* Flow canvas */}
      <div className="bg-white border border-zinc-300 rounded-b-md p-3 min-w-[1000px]">
        <svg
          viewBox="0 0 1000 360"
          className="w-full h-auto"
          style={{ minHeight: 280 }}
        >
          {/* Subtle grid */}
          <defs>
            <pattern id="nr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
            <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000" floodOpacity="0.15" />
            </filter>
          </defs>
          <rect width="1000" height="360" fill="url(#nr-grid)" />

          {/* Wires (draw under nodes) */}
          {WIRES.map((wire, i) => {
            const from = nodeById[wire.from];
            const to = nodeById[wire.to];
            if (!from || !to) return null;
            const fromPos = getPortPositions(from).out;
            const toPos = getPortPositions(to).in;
            return (
              <g key={i}>
                <path d={wirePath(fromPos, toPos)} stroke="#9ca3af" strokeWidth="2.5" fill="none" />
                <path
                  d={wirePath(fromPos, toPos)}
                  stroke="#2369a7"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="6 8"
                  className="nr-wire-flow"
                  opacity={0.6}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const w = node.w ?? DEFAULT_W;
            const color = KIND_COLOR[node.kind];
            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`} filter="url(#node-shadow)">
                {/* Body */}
                <rect width={w} height={NODE_H} rx={5} fill="#fff" stroke="#94a3b8" strokeWidth="1" />
                {/* Colored icon tab */}
                <path
                  d={`M 0 0 L 32 0 L 32 ${NODE_H} L 0 ${NODE_H} Z`}
                  fill={color}
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
                {/* Separator */}
                <line x1={32} y1={0} x2={32} y2={NODE_H} stroke="#94a3b8" strokeWidth="1" />
                {/* Icon */}
                <text
                  x={16}
                  y={NODE_H / 2 + 6}
                  textAnchor="middle"
                  fontSize={16}
                  fill="#1c1c1c"
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {node.icon}
                </text>
                {/* Label */}
                <text
                  x={42}
                  y={NODE_H / 2 + 4}
                  fontSize={12}
                  fill="#1f2937"
                  style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}
                >
                  {node.label}
                </text>
                {/* Input port */}
                <rect x={-4} y={NODE_H / 2 - 5} width={8} height={10} rx={2} fill="#64748b" />
                {/* Output port */}
                <rect x={w - 4} y={NODE_H / 2 - 5} width={8} height={10} rx={2} fill="#64748b" />
              </g>
            );
          })}

          {/* Annotations */}
          <text x={20} y={45} fontSize={11} fill="#64748b" style={{ fontFamily: 'system-ui, sans-serif' }}>
            ⓘ Click the Inject node every 5s, emit 6 binary buffers, decode, format, push to WebSocket.
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-600">
        <LegendDot color={KIND_COLOR.inject} label="Inject (trigger)" />
        <LegendDot color={KIND_COLOR.function} label="Function (JS logic)" />
        <LegendDot color={KIND_COLOR.ws} label="WebSocket out" />
        <LegendDot color={KIND_COLOR.debug} label="Debug (sidebar log)" />
        <LegendDot color={KIND_COLOR.catch} label="Catch (error handler)" />
      </div>

      <style>{`
        @keyframes nr-flow {
          to { stroke-dashoffset: -14; }
        }
        .nr-wire-flow {
          animation: nr-flow 1.4s linear infinite;
        }
      `}</style>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-3 rounded-sm border border-zinc-400"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
