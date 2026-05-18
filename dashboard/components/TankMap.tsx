'use client';

import dynamic from 'next/dynamic';
import type { TankUpdate } from '@/lib/types';

const TankMapInner = dynamic(
  () => import('./TankMapInner').then((m) => m.TankMapInner),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export function TankMap(props: { updates: TankUpdate[]; height?: number }) {
  return <TankMapInner {...props} />;
}

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 text-sm">
      Loading map…
    </div>
  );
}
