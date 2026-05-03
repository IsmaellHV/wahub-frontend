export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface IBroadcast {
  id: number;
  bot_id: string;
  audience: string;
  body: string;
  scheduled_at?: string | null;
  throttle_per_min: number;
  status: BroadcastStatus;
  recipients_count: number;
  created_at?: string;
}
