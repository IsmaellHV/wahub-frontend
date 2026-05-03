export const WEBHOOK_EVENTS = [
  'message.received',
  'session.connected',
  'session.disconnected',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface IWebhook {
  id: number;
  usuario_id: number;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  last_delivery_at?: string | null;
  last_status?: number | null;
  last_error?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface ISaveWebhookInput {
  name: string;
  url: string;
  events: WebhookEvent[];
  active?: boolean;
}
