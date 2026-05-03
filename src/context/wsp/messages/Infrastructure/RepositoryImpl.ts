import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryMessage } from '../Domain/Repository';
import type { IMessage, ISendMessageInput } from '../Domain/IMessage';

export class RepositoryMessageImpl implements IRepositoryMessage {
  send(input: ISendMessageInput): Promise<IMessage> {
    return AdapterApi.post<IMessage>(AdapterConfigure.ENDPOINT.SEND, input);
  }

  list(connectionId: number, limit?: number): Promise<IMessage[]> {
    return AdapterApi.get<IMessage[]>(AdapterConfigure.ENDPOINT.LIST(connectionId, limit));
  }
}
