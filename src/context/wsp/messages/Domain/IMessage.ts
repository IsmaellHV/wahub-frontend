export type MessageStatus = 'pending' | 'sent' | 'failed';
export type MessageDirection = 'out' | 'in';

export interface IMessage {
  id: number;
  usuario_id: number;
  connection_id: number;
  to_number: string;
  body: string;
  status: MessageStatus;
  direction: MessageDirection;
  error?: string | null;
  wa_message_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ISendMessageInput {
  connection_id: number;
  to: string;
  body: string;
}
