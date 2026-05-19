import type { Device } from './types';

// Six fuel tanker sites across Sudan. SOBA2 is the actual production site
// from the 2023 Canar deployment; the others are realistic sites added for
// the rebuild demo so the status cards on the overview page always show
// every operational state at once (active / warning / critical / inactive).
//
// The `scenario` field is a demo seed — it tells the browser simulator
// which behavior band to bias toward. The Node-RED simulator uses the same.
export const DEVICES: Device[] = [
  {
    IMEI: '860147043918943',
    name: 'SOBA2',
    site_name: 'Khartoum - Soba (Savola)',
    city: 'Khartoum',
    address: 'Sudan, Khartoum, Soba, Savola',
    lat: 15.4837,
    long: 32.5836,
    model: 'TEK 733',
    max_cm: 200,
    capacity_liters: 1000,
    hw_uc15: true,
    sw_major: 0,
    sw_minor: 5,
    scenario: 'normal',
  },
  {
    IMEI: '860147043918944',
    name: 'KRT_AIRPORT',
    site_name: 'Khartoum International Airport',
    city: 'Khartoum',
    address: 'Sudan, Khartoum, Airport Rd',
    lat: 15.5896,
    long: 32.5536,
    model: 'TEK 733',
    max_cm: 250,
    capacity_liters: 2000,
    hw_uc15: true,
    sw_major: 0,
    sw_minor: 5,
    scenario: 'normal',
  },
  {
    IMEI: '860147043923083',
    name: 'OMD_TOWER_18',
    site_name: 'Omdurman Tower #18',
    city: 'Omdurman',
    address: 'Sudan, Omdurman, Ombada 18',
    lat: 15.6715,
    long: 32.4511,
    model: 'TEK 766',
    max_cm: 220,
    capacity_liters: 1500,
    hw_uc15: false,
    sw_major: 1,
    sw_minor: 2,
    scenario: 'warning',
  },
  {
    IMEI: '860147043923084',
    name: 'PRT_SUDAN_DEPOT',
    site_name: 'Port Sudan Shipping Depot',
    city: 'Port Sudan',
    address: 'Sudan, Port Sudan, Harbor District',
    lat: 19.6157,
    long: 37.2164,
    model: 'TEK 822',
    max_cm: 350,
    capacity_liters: 5000,
    hw_uc15: true,
    sw_major: 2,
    sw_minor: 1,
    scenario: 'critical',
  },
  {
    IMEI: '860147043923085',
    name: 'WAD_MADANI_HUB',
    site_name: 'Wad Madani Regional Hub',
    city: 'Wad Madani',
    address: 'Sudan, Wad Madani, Central',
    lat: 14.4012,
    long: 33.5199,
    model: 'TEK 790',
    max_cm: 220,
    capacity_liters: 1500,
    hw_uc15: true,
    sw_major: 1,
    sw_minor: 3,
    scenario: 'normal',
  },
  {
    IMEI: '860147043923086',
    name: 'KASSALA_EAST',
    site_name: 'Kassala Eastern Station',
    city: 'Kassala',
    address: 'Sudan, Kassala, East District',
    lat: 15.4500,
    long: 36.4000,
    model: 'TEK 643',
    max_cm: 200,
    capacity_liters: 1000,
    hw_uc15: false,
    sw_major: 0,
    sw_minor: 8,
    scenario: 'inactive',
  },
];

export function deviceByImei(imei: number | string): Device | undefined {
  const s = String(imei);
  return DEVICES.find(d => d.IMEI === s);
}
