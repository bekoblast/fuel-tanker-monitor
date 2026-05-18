// Browser-side tank simulator — TypeScript port of the Node-RED Tank Simulator function.
// Runs in the browser so the deployed dashboard "just works" without needing Node-RED.
// When a real WebSocket connection from Node-RED is available, the stream will override.

import type { Device, TankUpdate } from './types';

type TankState = {
  cm: number; // distance from sensor to fuel surface (ullage); low = full
  temp: number;
  battery_volt: number;
  gsm: number;
  msg_count: number;
  last_refill_tick: number;
  tick: number;
  last_refill: boolean;
  last_drop: boolean;
};

const states = new Map<string, TankState>();

function initState(device: Device): TankState {
  const maxCm = device.max_cm;
  return {
    // Start with tank ~50-90% full -> cm at 10-50% of max (sensor sees fuel close to it)
    cm: Math.round(maxCm * (0.1 + Math.random() * 0.4)),
    temp: 25 + Math.random() * 10,
    battery_volt: 5.5 + (Math.random() - 0.5) * 0.5,
    gsm: 60 + Math.floor(Math.random() * 100),
    msg_count: 0,
    last_refill_tick: -1000,
    tick: 0,
    last_refill: false,
    last_drop: false,
  };
}

function evolve(state: TankState, device: Device): TankState {
  state.tick++;
  state.msg_count++;
  const maxCm = device.max_cm;

  // Natural drain: fuel surface drops -> cm increases
  const drainRate = 1 + Math.random() * 2;
  state.cm = Math.min(maxCm, state.cm + drainRate);

  // Refill when tank is low
  state.last_refill = false;
  if (state.tick - state.last_refill_tick > 40 + Math.floor(Math.random() * 20)) {
    if (state.cm > maxCm * 0.7) {
      state.cm = Math.max(5, maxCm * (0.05 + Math.random() * 0.1));
      state.last_refill_tick = state.tick;
      state.last_refill = true;
    }
  }

  // Rare drop event
  state.last_drop = false;
  if (Math.random() < 0.02 && state.cm < maxCm - 50) {
    state.cm += 30 + Math.random() * 50;
    state.last_drop = true;
  }

  state.cm = Math.max(0, Math.min(maxCm, Math.round(state.cm)));

  // Temperature drift (Sudan: 25-45°C)
  state.temp += (Math.random() - 0.5) * 0.5;
  state.temp = Math.max(15, Math.min(45, state.temp));

  // Battery slow decay
  if (state.battery_volt < 3.5) state.battery_volt = 5.5;
  else state.battery_volt -= 0.001 + Math.random() * 0.002;

  // GSM drift
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
  const alarmLow = fuelDepthCm < 20;

  return {
    type: 'tank_update',
    timestamp: new Date().toISOString(),
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
      rtc: new Date().toTimeString().slice(0, 5),
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
      refill: state.last_refill,
      drop: state.last_drop,
      scheduled: true,
    },
    raw_payload_hex: '', // not generated client-side
  };
}

export function resetSimulator() {
  states.clear();
}
