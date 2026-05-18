import { DEVICES } from '@/lib/devices';
import { TankDetailView } from './TankDetailView';

// Pre-generate a static page per IMEI so we can use `output: 'export'` on Netlify.
export function generateStaticParams() {
  return DEVICES.map((d) => ({ imei: d.IMEI }));
}

export const dynamicParams = false;

export default function Page() {
  return <TankDetailView />;
}
