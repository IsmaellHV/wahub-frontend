import type { IAuditFields } from '@shared/Domain/ILogDocument';

export type ConnectionState = 'idle' | 'scanning' | 'revision' | 'connecting' | 'connected' | 'disconnected';

export interface IConnection extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id?: string;
  code?: string | null;
  session_id: string;
  name: string;
  number?: string | null;
  state: ConnectionState;
  qr?: string | null;
  qr_attempts?: number;
  qr_attempts_revision?: number;
  last_seen?: string | null;
}

export type ConnectionEvent =
  | { type: 'qr'; dataUrl: string; raw: string; attempts?: number; bucket?: 'scanning' | 'revision' }
  | { type: 'state'; state: ConnectionState; number?: string | null; reason?: string }
  | { type: 'message'; from: string; body: string; timestamp: number };
