'use client';
import { useEffect, useRef, useState } from 'react';
import { AdapterConfigure } from '../Infrastructure/AdapterConfigure';
import type { ConnectionEvent, ConnectionState, IConnection } from '../Domain/IConnection';

interface RealtimeState {
  state: ConnectionState;
  qr: string | null;
  number: string | null;
  connected: boolean;
  attempts: number;
  bucket: 'scanning' | 'revision' | null;
}

interface UseRealtimeArgs {
  connectionId: number | null;
  // Seed state from backend snapshot. Critical when subscribing to an already-`connected`
  // session — wwebjs only emits NEW events, so without a seed the local state stays
  // 'scanning' and triggers the auto-regenerate loop.
  initial?: Pick<IConnection, 'state' | 'number' | 'qr' | 'qr_attempts'> | null;
}

const seedFrom = (initial: UseRealtimeArgs['initial']): RealtimeState => ({
  state: initial?.state ?? 'idle',
  qr: initial?.qr ?? null,
  number: initial?.number ?? null,
  connected: false,
  attempts: initial?.qr_attempts ?? 0,
  bucket: null,
});

// Subscribes to backend realtime channel for one connection.
// Backend emits: qr → state(connecting) → state(connected) + messages.
export const useConnectionRealtime = (args: UseRealtimeArgs): RealtimeState => {
  const { connectionId, initial } = args;
  const [state, setState] = useState<RealtimeState>(() => seedFrom(initial));
  const wsRef = useRef<WebSocket | null>(null);

  // Re-seed when the underlying conn switches (new id) so we don't carry stale state.
  useEffect(() => {
    setState((s) => ({ ...seedFrom(initial), connected: s.connected }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  useEffect(() => {
    if (connectionId == null) return;

    let closed = false;
    let backoff = 500;
    const channel = AdapterConfigure.WS.CHANNEL(connectionId);

    const connect = () => {
      const ws = new WebSocket(AdapterConfigure.WS.URL);
      wsRef.current = ws;

      ws.addEventListener('open', () => {
        backoff = 500;
        setState((s) => ({ ...s, connected: true }));
        ws.send(JSON.stringify({ event: AdapterConfigure.WS.EVENT_SUBSCRIBE, data: { id: connectionId } }));
      });

      ws.addEventListener('message', (msg) => {
        try {
          const parsed = JSON.parse(msg.data) as { channel?: string; data?: ConnectionEvent | { type: 'snapshot'; state: ConnectionState; number?: string | null; qr?: string | null; attempts?: number } };
          if (parsed.channel !== channel || !parsed.data) return;
          const ev = parsed.data as { type: string } & Record<string, unknown>;
          if (ev.type === 'snapshot') {
            // Backend pushes current DB row right after subscribe.
            // Snapshot is the source of truth — replace fields, do NOT fall back to local
            // (that's how a stale qr from before survived a `connected` snapshot).
            const snapState = (ev.state as ConnectionState) ?? 'idle';
            const isPairing = snapState === 'scanning' || snapState === 'revision';
            setState((s) => ({
              ...s,
              state: snapState,
              number: (ev.number as string | null | undefined) ?? null,
              qr: isPairing ? ((ev.qr as string | null | undefined) ?? null) : null,
              attempts: (ev.attempts as number | undefined) ?? 0,
            }));
          } else if (ev.type === 'qr') {
            const e = ev as unknown as Extract<ConnectionEvent, { type: 'qr' }>;
            setState((s) => ({
              ...s,
              qr: e.dataUrl,
              state: e.bucket === 'revision' ? 'revision' : 'scanning',
              attempts: e.attempts ?? s.attempts,
              bucket: e.bucket ?? s.bucket,
            }));
          } else if (ev.type === 'state') {
            const e = ev as unknown as Extract<ConnectionEvent, { type: 'state' }>;
            setState((s) => ({ ...s, state: e.state, number: e.number ?? s.number }));
          }
        } catch {
          /* ignore non-JSON */
        }
      });

      ws.addEventListener('close', () => {
        setState((s) => ({ ...s, connected: false }));
        if (closed) return;
        setTimeout(connect, Math.min(backoff, 10000));
        backoff *= 2;
      });

      ws.addEventListener('error', () => ws.close());
    };

    connect();
    return () => {
      closed = true;
      wsRef.current?.close();
    };
  }, [connectionId]);

  return state;
};
