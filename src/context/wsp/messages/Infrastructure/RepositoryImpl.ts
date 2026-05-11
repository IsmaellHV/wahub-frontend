import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryMessage } from '../Domain/Repository';
import type { IMessage, ISendMessageInput } from '../Domain/IMessage';

// Backend renombró la PK numérica a `i` (Phase 3). Frontend aún usa `id`
// en su modelo de dominio — normalizamos en el boundary.
const normalize = <T extends Record<string, unknown>>(row: T): T & { id: number } => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  return { ...(rest as T), id: (rest as { id?: number }).id ?? i ?? 0 } as T & { id: number };
};

export class RepositoryMessageImpl implements IRepositoryMessage {
  async send(input: ISendMessageInput): Promise<IMessage> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.SEND, input);
    return normalize(row) as unknown as IMessage;
  }

  async list(connectionId: number, limit?: number): Promise<IMessage[]> {
    const rows = await AdapterApi.get<Array<Record<string, unknown>>>(AdapterConfigure.ENDPOINT.LIST(connectionId, limit));
    return rows.map(r => normalize(r) as unknown as IMessage);
  }
}
