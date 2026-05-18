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
  return (
    <div className={`${COLOR_MAP[color]} text-white rounded-lg shadow-sm p-4 flex items-center gap-4 transition-transform hover:scale-[1.02]`}>
      {icon && (
        <div className="size-12 rounded-md bg-white/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-3xl font-bold tabular-tight leading-none">{value}</div>
        <div className="text-sm font-medium uppercase tracking-wide opacity-90 mt-1">{label}</div>
        {subtitle && <div className="text-xs opacity-75 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}
