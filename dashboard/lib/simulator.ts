// Browser-side tank simulator — TypeScript port of the Node-RED Tank Simulator function.
// Each device is biased toward its assigned `scenario` so the overview status
// cards always show a meaningful breakdown of every operational state.
// Runs in the browser so the deployed dashboard "just works" without Node-RED.
// When a real WebSocket connection from Node-RED is available, the stream will override.

import type { Device, TankUpdate, Scenario } from './types';

type TankState = {
  cm: number; // distance from sensor to fuel surface (ullage); LOW = full
  temp: number;
  battery_volt: number;
  gsm: number;
  msg_count: number;
  tick: number;
};

const states = new Map<string, TankState>();

// Scenario tuning, expressed as fraction-of-max_cm targets (cm = distance
// from top to fuel surface, so HIGH cm = empty).
//   - 'normal'   keeps the tank ~75% full so it stays comfortably above warning
//   - 'warning'  keeps the tank at ~30% (below 40% threshold, above 20%)
//   - 'critical' keeps the tank below 20% so the low_level alarm fires
//   - 'inactive' irrelevant (emitted with stale timestamp)
const SCENARIO_CM_FRAC: Record<Scenario, { target: number; jitter: number }> = {
  normal: { target: 0.25, jitter: 0.06 },     // ~75% full
  warning: { target: 0.68, jitter: 0.04 },    // ~32% full
  critical: { target: 0.92, jitter: 0.03 },   // ~8% full (triggers low_level alarm)
  inactive: { target: 0.40, jitter: 0.05 },   // doesn't show, stale timestamp
};

function initState(device: Device): TankState {
  const sc = device.scenario || 'normal';
  const { target, jitter } = SCENARIO_CM_FRAC[sc];
  return {
    cm: Math.round(device.max_cm * (target + (Math.random() - 0.5) * jitter)),
    temp: 25 + Math.random() * 10,
    battery_volt: 5.5 + (Math.random() - 0.5) * 0.5,
    gsm: 60 + Math.floor(Math.random() * 100),
    msg_count: 0,
    tick: 0,
  };
}

function evolve(state: TankState, device: Device): TankState {
  state.tick++;
  state.msg_count++;
  const sc = device.scenario || 'normal';
  const { target, jitter } = SCENARIO_CM_FRAC[sc];
  const targetCm = device.max_cm * target;

  // Quick mean-revert to the scenario's target so the dashboard never flips
  // a "normal" tank into critical and vice-versa.
  state.cm += (targetCm - state.cm) * 0.18;
  state.cm += (Math.random() - 0.5) * device.max_cm * jitter * 0.4;
  state.cm = Math.max(0, Math.min(device.max_cm, Math.round(state.cm)));

  // Environment drift — temperature / battery / GSM keep moving so the
  // detail page charts still look alive.
  state.temp += (Math.random() - 0.5) * 0.5;
  state.temp = Math.max(15, Math.min(45, state.temp));

  if (state.battery_volt < 3.5) state.battery_volt = 5.5;
  else state.battery_volt -= 0.001 + Math.random() * 0.002;

  state.gsm += Math.floor((Math.random() - 0.5) * 20);
  state.gsm = Math.max(0, Math.min(255, state.gsm));

  return state;
}

export function generateUpdate(device: Device): TankUpdate {
  const key = device.IMEI;
  let state = states.get(key);
  if (!state) {
    state = initState(device);
    states.set(key, state);
  }
  state = evolve(state, device);
  states.set(key, state);

  const fuelDepthCm = Math.max(0, device.max_cm - state.cm);
  const levelPercent = Math.max(0, Math.min(100, (fuelDepthCm / device.max_cm) * 100));
  const volume = Math.round((fuelDepthCm / device.max_cm) * device.capacity_liters);
  const battPercent = Math.max(0, Math.min(100, Math.round(((state.battery_volt - 3.4) * 100) / 2.6)));
  // Trigger the low-level alarm bit when the tank drops below 20% of capacity.
  // (Using level_percent rather than absolute cm so the threshold scales with
  // tank size — a 5000L tank at 8% still alarms.)
  const alarmLow = levelPercent < 20;

  // Inactive devices emit a timestamp 2 minutes in the past so getTankStatus
  // reports them as offline (no fresh telemetry).
  const now = new Date();
  const ts = device.scenario === 'inactive'
    ? new Date(now.getTime() - 120_000)
    : now;

  return {
    type: 'tank_update',
    timestamp: ts.toISOString(),
    imei: parseInt(device.IMEI),
    device: device.name,
    site: {
      name: device.site_name,
      city: device.city,
      address: device.address,
      lat: device.lat,
      long: device.long,
    },
    tank: {
      capacity_liters: device.capacity_liters,
      max_cm: device.max_cm,
    },
    reading: {
      cm: state.cm,
      fuel_depth_cm: fuelDepthCm,
      level_percent: Math.round(levelPercent * 10) / 10,
      volume_liters: volume,
      temperature_c: Math.round(state.temp * 2) / 2,
      ultrasonic_rssi: Math.floor(150 + Math.random() * 80),
      src: Math.floor(Math.random() * 16),
      rtc: ts.toTimeString().slice(0, 5),
    },
    device_status: {
      model: device.model,
      hw_revision: device.hw_uc15 ? 'UC15' : 'UC20',
      sw_version: `${device.sw_minor}.${device.sw_major}`,
      battery_volt: Math.round(state.battery_volt * 10) / 10,
      battery_percent: battPercent,
      gsm_signal: state.gsm,
      logger_interval_min: 15,
    },
    alarms: {
      low_level: alarmLow,
      active: alarmLow,
      bund_status: false,
      limit1: levelPercent < 10,
      limit2: levelPercent < 20,
      limit3: levelPercent < 30,
    },
    events: {
      refill: false,
      drop: false,
      scheduled: true,
    },
    raw_payload_hex: '', // not generated client-side
  };
}

export function resetSimulator() {
  states.clear();
}
