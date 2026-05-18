export type TankUpdate = {
  type: 'tank_update';
  timestamp: string;
  imei: number;
  device: string;
  site: {
    name: string;
    city: string;
    address: string;
    lat: number;
    long: number;
  };
  tank: {
    capacity_liters: number;
    max_cm: number;
  };
  reading: {
    cm: number;            // raw sensor distance from top
    fuel_depth_cm: number; // tank.max_cm - cm
    level_percent: number;
    volume_liters: number;
    temperature_c: number;
    ultrasonic_rssi: number;
    src: number;
    rtc: string;
  };
  device_status: {
    model: string;
    hw_revision: string;
    sw_version: string;
    battery_volt: number;
    battery_percent: number;
    gsm_signal: number;
    logger_interval_min: number;
  };
  alarms: {
    low_level: boolean;
    active: boolean;
    bund_status: boolean;
    limit1: boolean;
    limit2: boolean;
    limit3: boolean;
  };
  events: {
    refill: boolean;
    drop: boolean;
    scheduled: boolean;
  };
  raw_payload_hex: string;
};

export type Device = {
  IMEI: string;
  name: string;
  site_name: string;
  city: string;
  address: string;
  lat: number;
  long: number;
  model: string;
  max_cm: number;
  capacity_liters: number;
  hw_uc15: boolean;
  sw_major: number;
  sw_minor: number;
};

export type TankStatus = 'ok' | 'warning' | 'critical' | 'inactive';

export function getTankStatus(update: TankUpdate | undefined): TankStatus {
  if (!update) return 'inactive';
  const ageMs = Date.now() - new Date(update.timestamp).getTime();
  if (ageMs > 60_000) return 'inactive';
  if (update.alarms.low_level || update.reading.level_percent < 20) return 'critical';
  if (update.reading.level_percent < 40) return 'warning';
  return 'ok';
}

export function statusColor(s: TankStatus): string {
  switch (s) {
    case 'ok': return 'var(--color-canar-green)';
    case 'warning': return 'var(--color-canar-amber)';
    case 'critical': return 'var(--color-canar-red)';
    case 'inactive': return 'var(--color-canar-gray)';
  }
}
