import type { IAuditFields } from '@shared/Domain/ILogDocument';

export type MessageStatus = 'pending' | 'sent' | 'failed';
export type MessageDirection = 'out' | 'in';

export interface IMessage extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id: string;
  connection_id: number;
  to_number: string;
  body: string;
  status: MessageStatus;
  direction: MessageDirection;
  error?: string | null;
  wa_message_id?: string | null;
}

export interface ISendMessageInput {
  connection_id: number;
  to: string;
  body: string;
}
