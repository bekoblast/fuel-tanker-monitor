'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { TankUpdate } from '@/lib/types';
import { DEVICES } from '@/lib/devices';
import { generateUpdate } from '@/lib/simulator';

type StreamSource = 'simulator' | 'websocket';

type StreamState = {
  tanks: Map<number, TankUpdate>;
  source: StreamSource;
  connected: boolean;
  lastUpdate: number;
};

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1880/ws/tanks';
const TICK_MS = 3000;

export function useTankStream() {
  const [state, setState] = useState<StreamState>(() => ({
    tanks: new Map(),
    source: 'simulator',
    connected: false,
    lastUpdate: 0,
  }));

  const wsRef = useRef<WebSocket | null>(null);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply an incoming tank update
  const applyUpdate = useCallback((update: TankUpdate) => {
    setState((prev) => {
      const next = new Map(prev.tanks);
      next.set(update.imei, update);
      return { ...prev, tanks: next, lastUpdate: Date.now() };
    });
  }, []);

  // Browser-side simulator tick
  const tickSimulator = useCallback(() => {
    DEVICES.forEach((d) => applyUpdate(generateUpdate(d)));
  }, [applyUpdate]);

  // Try WebSocket; fall back to simulator
  useEffect(() => {
    let cancelled = false;

    // Seed immediately so the UI isn't empty
    tickSimulator();

    // Start simulator on a timer (always running; WS overrides per-message when connected)
    simTimerRef.current = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        tickSimulator();
      }
    }, TICK_MS);

    // Try to connect to Node-RED WS
    try {
      const ws = new WebSocket(DEFAULT_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, source: 'websocket', connected: true }));
      };
      ws.onclose = () => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, source: 'simulator', connected: false }));
      };
      ws.onerror = () => {
        // Silent — simulator keeps running
      };
      ws.onmessage = (ev) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(typeof ev.data === 'string' ? ev.data : '');
          if (data?.type === 'tank_update') applyUpdate(data as TankUpdate);
        } catch {
          /* ignore malformed */
        }
      };
    } catch {
      // WS construction failed — simulator is already ticking
    }

    return () => {
      cancelled = true;
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      wsRef.current?.close();
    };
  }, [applyUpdate, tickSimulator]);

  return state;
}
