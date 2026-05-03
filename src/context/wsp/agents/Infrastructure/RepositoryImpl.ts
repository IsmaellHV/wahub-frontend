import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IAiAgent, ISaveAgentInput } from '../Domain/IAiAgent';

export class RepositoryAiAgentImpl {
  list(): Promise<IAiAgent[]> {
    return AdapterApi.get<IAiAgent[]>(AdapterConfigure.ENDPOINT.LIST);
  }

  create(input: ISaveAgentInput): Promise<IAiAgent> {
    return AdapterApi.post<IAiAgent>(AdapterConfigure.ENDPOINT.CREATE, input);
  }

  update(id: number, input: ISaveAgentInput): Promise<IAiAgent> {
    return AdapterApi.put<IAiAgent>(AdapterConfigure.ENDPOINT.UPDATE(id), input);
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }
}
