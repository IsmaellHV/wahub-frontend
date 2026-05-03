import type { IMessage, ISendMessageInput } from './IMessage';

export interface IRepositoryMessage {
  send(input: ISendMessageInput): Promise<IMessage>;
  list(connectionId: number, limit?: number): Promise<IMessage[]>;
}
