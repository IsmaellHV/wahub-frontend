import type { IAuditFields } from '@shared/Domain/ILogDocument';

export const WEBHOOK_EVENTS = [
  'message.received',
  'session.connected',
  'session.disconnected',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface IWebhook extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  last_delivery_at?: string | null;
  last_status?: number | null;
  last_error?: string | null;
}

export interface ISaveWebhookInput {
  name: string;
  url: string;
  events: WebhookEvent[];
  active?: boolean;
}
