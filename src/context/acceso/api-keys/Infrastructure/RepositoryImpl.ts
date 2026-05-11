import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryApiKey } from '../Domain/Repository';
import type { IApiKey, IApiKeyCreated } from '../Domain/IApiKey';

// Backend renombró la PK numérica a `i` (Phase 3). Frontend aún usa `id`
// en su modelo de dominio — normalizamos en el boundary.
const normalize = <T extends Record<string, unknown>>(row: T): T & { id: number } => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  return { ...(rest as T), id: (rest as { id?: number }).id ?? i ?? 0 } as T & { id: number };
};

export class RepositoryApiKeyImpl implements IRepositoryApiKey {
  async list(): Promise<IApiKey[]> {
    const rows = await AdapterApi.get<Array<Record<string, unknown>>>(AdapterConfigure.ENDPOINT.LIST);
    return rows.map(r => normalize(r) as unknown as IApiKey);
  }

  async create(name: string): Promise<IApiKeyCreated> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.CREATE, { name });
    return normalize(row) as unknown as IApiKeyCreated;
  }

  revoke(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REVOKE(id));
  }
}
