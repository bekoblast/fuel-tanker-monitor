# Canar Fuel Tanker Monitor — Rebuild

A modern React/Next.js rebuild of the 2023 industrial IoT system originally built on **Node-RED + ThingsBoard** for [Canar](https://www.canar.com.sd/) (Sudanese telecom). The original deployment monitored fuel tanker levels across multiple sites in Sudan; the ThingsBoard server was lost during the 2023 conflict, but the Node-RED flows, dashboard exports, and rule chains survived.

This rebuild faithfully recreates the customer-approved dashboard layout, color palette, and binary protocol — modernized with React 19, Tailwind 4, Leaflet, and Recharts.

---

## Architecture

```
[Tank Simulator]                  [Browser-side simulator]
 generates 140-byte                runs by default; same
 binary packets every               TankUpdate shape as
 5s for 6 virtual                   Node-RED emits.
 devices                           
       │                                   │
       ▼                                   │
[Faithful Decoder]                         │
 bit-level extraction:                     │
 model, IMEI (BCD),                        │
 alarms, battery,                          │
 28 historical                             │
 readings                                  │
       │                                   │
       ▼                                   │
[Format for WebSocket]                     │
 enrich with site                          │
 info, compute                             │
 volume / level%                           │
       │                                   │
       ▼                                   ▼
 ws://host:1880/ws/tanks ────────►  React Dashboard
                                    (Next.js 16 + Tailwind 4)
                                    │
                                    ├── Overview: status cards, OSM map, alarms, tank cards
                                    └── /tank/[imei]: radial gauge, LCD bar, charts, mini map
```

The dashboard always works on its own (browser simulator). When Node-RED is running locally, the dashboard auto-connects to the WebSocket and the browser simulator stands down.

---

## The 6 tanks (SOBA2 is real, the others are realistic Sudan sites added for the demo)

Each device has a `scenario` field that biases the simulator toward a fixed
operational state, so the overview status cards always show every state at
once. Expected breakdown: **Total 6 · Active 3 · Inactive 1 · Warning 1 · Critical 1**.

| ID | Site | City | Capacity | Scenario |
|----|------|------|---------:|----------|
| **SOBA2** | Soba (Savola) | Khartoum | 1000 L | `normal` |
| **KRT_AIRPORT** | International Airport | Khartoum | 2000 L | `normal` |
| **OMD_TOWER_18** | Tower #18 | Omdurman | 1500 L | `warning` (low fuel) |
| **PRT_SUDAN_DEPOT** | Shipping Depot | Port Sudan | 5000 L | `critical` (alarm) |
| **WAD_MADANI_HUB** | Regional Hub | Wad Madani | 1500 L | `normal` |
| **KASSALA_EAST** | Eastern Station | Kassala | 1000 L | `inactive` (offline) |

---

## Project layout

```
.
├── dummy-generator.json        ← Node-RED flow to import (12 nodes)
├── test-roundtrip.js           ← Smoke test for encoder/decoder
├── netlify.toml                ← Netlify build config (base = dashboard)
├── README.md                   ← this file
└── dashboard/                  ← Next.js 16 app
    ├── app/
    │   ├── page.tsx            ← Overview page
    │   ├── about/page.tsx      ← Project story / how it works
    │   └── tank/[imei]/        ← Device details (static-exported, 6 paths)
    ├── components/             ← StatusCard, TankMap, TankGauge, AlarmsTable, NodeRedFlow, …
    ├── hooks/useTankStream.ts  ← WebSocket + simulator state manager
    ├── lib/
    │   ├── types.ts            ← TankUpdate / Device / status helpers
    │   ├── devices.ts          ← 6 device configs (must match Node-RED env)
    │   └── simulator.ts        ← Browser-side simulator (TypeScript port)
    └── next.config.ts          ← Static export config (output: export)
```

---

## Run locally

### Option A — Dashboard only (no Node-RED needed)

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:5178
```

The built-in browser simulator emits new tank updates every 3 seconds. All 6 tanks animate, refill events happen periodically, drops are rare but visible.

### Option B — With the Node-RED backend (true end-to-end)

1. Install Node-RED if you don't have it: `npm install -g node-red`
2. Run it: `node-red` (default port 1880)
3. Open `http://localhost:1880`
4. Menu (top-right ☰) → **Import** → paste the contents of `dummy-generator.json` → Deploy
5. The flow's WebSocket out node exposes `ws://localhost:1880/ws/tanks`
6. Run the dashboard (`npm run dev` in `dashboard/`)
7. The "Live · Browser simulator" indicator will flip to "Live · Node-RED WS" once the WebSocket connects

### Option C — Connect to a remote Node-RED instance

Set `NEXT_PUBLIC_WS_URL` to your WebSocket URL before building:

```bash
NEXT_PUBLIC_WS_URL=wss://your-server.example.com/ws/tanks npm run build
```

---

## Deploy to Netlify

### One-time setup

1. Push this repo to GitHub.
2. In Netlify: **New site from Git** → pick the repo.
3. Confirm the auto-detected settings (matches `netlify.toml`):
   - Base directory: `dashboard`
   - Build command: `npm run build`
   - Publish directory: `out`
4. Click **Deploy site**.

### Optional: point at a real Node-RED

In Netlify → **Site settings → Environment variables**, add:

```
NEXT_PUBLIC_WS_URL = wss://your-noderef.example.com/ws/tanks
```

Then trigger a redeploy.

---

## Original ThingsBoard mapping

The dashboard mirrors these widgets from the original Canar dashboard backup:

| Original ThingsBoard widget | This rebuild |
|-----------------------------|--------------|
| `entities_table` (device list) | Grid of `TankCard` components |
| 5 `simple_card` status cards | `StatusCard` row (Total / Active / Inactive / Warning / Critical) |
| `openstreetmap` device map | Leaflet `TankMap` with OSM tiles + temp-colored markers |
| `alarms_table` | `AlarmsTable` |
| `temperature_radial_gauge_canvas_gauges` | `TankGauge` (SVG, same red/yellow/green thresholds) |
| `lcd_bar_gauge` | `LcdBar` (16-segment, glowing green) |
| `basic_timeseries` (Liquid Level & Temperature) | `TimeseriesChart` with `#244c76` grid + `#8af321` line |

Color palette is taken verbatim from the original — see `app/globals.css` `@theme` block.

---

## What the binary protocol looks like

Each sensor emits a 140-byte packet over TCP. Byte layout (faithful to the original Tekelek CANAR hardware):

| Bytes | Field |
|-------|-------|
| 0 | Model code (0x05 = TEK 733, 0x00 = TEK 766, …) |
| 1 | HW revision (top 5 bits) |
| 2 | SW version (3 bits major + 5 bits minor, formatted "minor.major") |
| 3 | Reason flags (8 bits: refill, drop, reboot, alarm, scheduled, …) |
| 4 | Alarm flags (active, bund, limit1/2/3) |
| 5 | GSM RSSI |
| 6 | Battery (act_3g + RTC_set + voltage in bottom 5 bits) |
| 7–14 | IMEI as **BCD** (each byte's hex = 2 decimal digits) |
| 15 | Message type |
| 16 | msg_length low byte |
| 17–18 | msg_count (uint16 BE) |
| 19 | Tickets (top 3 bits) + RTC hours (bottom 5 bits) |
| 20–21 | error_code (uint16 BE) |
| 23 | Logger interval (0x80 = 15 min) |
| 24 | count_to_log |
| 25 | RTC minutes |
| 26–137 | 28 historical readings × 4 bytes each |
| 138–139 | Reserved |

Each 4-byte reading record:
- byte[0]: Ultrasonic RSSI
- byte[1]: Temperature (`(byte / 2) - 30`)
- byte[2]: SRC (4 bits) + cm high 2 bits
- byte[3]: cm low 8 bits

`cm` is the raw sensor reading — distance from the top-mounted ultrasonic sensor to the fuel surface. Convert to fuel depth with `max_cm - cm`, then to liters with `(fuel_depth / max_cm) * capacity`.

---

## Credits

- **Original system (2022–2023):** Babakr Hussain for Canar (Sudan).
- **Hardware:** Tekelec ultrasonic level sensors (TEK 733 / 766 / 586 / 790 / 822 / 643 family) over GSM/3G.
- **Rebuild stack:** Next.js 16, React 19, Tailwind 4, Leaflet, Recharts, Lucide.
