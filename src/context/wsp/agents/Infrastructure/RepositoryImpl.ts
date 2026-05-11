import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IAiAgent, ISaveAgentInput } from '../Domain/IAiAgent';

// Backend renombró la PK numérica a `i` (Phase 3). Frontend aún usa `id`
// en su modelo de dominio — normalizamos en el boundary.
const normalize = <T extends Record<string, unknown>>(row: T): T & { id: number } => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  return { ...(rest as T), id: (rest as { id?: number }).id ?? i ?? 0 } as T & { id: number };
};

export class RepositoryAiAgentImpl {
  async list(): Promise<IAiAgent[]> {
    const rows = await AdapterApi.get<Array<Record<string, unknown>>>(AdapterConfigure.ENDPOINT.LIST);
    return rows.map(r => normalize(r) as unknown as IAiAgent);
  }

  async create(input: ISaveAgentInput): Promise<IAiAgent> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.CREATE, input);
    return normalize(row) as unknown as IAiAgent;
  }

  async update(id: number, input: ISaveAgentInput): Promise<IAiAgent> {
    const row = await AdapterApi.put<Record<string, unknown>>(AdapterConfigure.ENDPOINT.UPDATE(id), input);
    return normalize(row) as unknown as IAiAgent;
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }
}
