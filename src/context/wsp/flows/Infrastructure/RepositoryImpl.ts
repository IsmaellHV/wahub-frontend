import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IFlow, ISaveFlowInput } from '../Domain/IFlow';

// Backend usa PK `i`; frontend usa `id`. Normalizamos en el boundary.
const normalize = (row: Record<string, unknown>): IFlow => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  return { ...(rest as unknown as IFlow), id: ((rest as { id?: number }).id ?? i ?? 0) };
};

export class RepositoryFlowImpl {
  async list(): Promise<IFlow[]> {
    const rows = await AdapterApi.get<Array<Record<string, unknown>>>(AdapterConfigure.ENDPOINT.LIST);
    return rows.map(normalize);
  }

  async get(id: number): Promise<IFlow> {
    const row = await AdapterApi.get<Record<string, unknown>>(AdapterConfigure.ENDPOINT.GET(id));
    return normalize(row);
  }

  async create(input: ISaveFlowInput): Promise<IFlow> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.CREATE, input);
    return normalize(row);
  }

  async update(id: number, input: ISaveFlowInput): Promise<IFlow> {
    const row = await AdapterApi.put<Record<string, unknown>>(AdapterConfigure.ENDPOINT.UPDATE(id), input);
    return normalize(row);
  }

  toggle(id: number, enabled: boolean): Promise<boolean> {
    return AdapterApi.patch<boolean>(AdapterConfigure.ENDPOINT.TOGGLE(id), { enabled });
  }

  remove(id: number): Promise<boolean> {
    return AdapterApi.delete<boolean>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }
}
