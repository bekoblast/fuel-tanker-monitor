type Props = {
  source: 'websocket' | 'simulator';
  connected: boolean;
};

export function LiveIndicator({ source, connected }: Props) {
  if (source === 'websocket' && connected) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-canar-green/10 border border-canar-green/30 text-canar-green text-xs font-medium">
        <span className="size-1.5 rounded-full bg-canar-green live-dot" />
        Live · Node-RED WS
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-canar-blue/10 border border-canar-blue/30 text-canar-blue text-xs font-medium">
      <span className="size-1.5 rounded-full bg-canar-blue live-dot" />
      Live · Browser simulator
    </div>
  );
}
