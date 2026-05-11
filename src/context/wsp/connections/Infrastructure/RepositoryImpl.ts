import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryConnection } from '../Domain/Repository';
import type { IConnection } from '../Domain/IConnection';

const normalize = <T extends Partial<IConnection> & { i?: number }>(row: T): IConnection => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  return { ...(rest as unknown as IConnection), id: (rest as { id?: number }).id ?? i ?? 0 };
};

const normalizeList = (rows: Array<Partial<IConnection> & { i?: number }>): IConnection[] => rows.map(normalize);

export class RepositoryConnectionImpl implements IRepositoryConnection {
  async list(): Promise<IConnection[]> {
    const rows = await AdapterApi.get<Array<Partial<IConnection> & { i?: number }>>(AdapterConfigure.ENDPOINT.LIST);
    return normalizeList(rows);
  }

  async create(name: string): Promise<IConnection> {
    const row = await AdapterApi.post<Partial<IConnection> & { i?: number }>(AdapterConfigure.ENDPOINT.CREATE, { name });
    console.log('create', row);
    return normalize(row);
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }

  async regenerate(id: number): Promise<IConnection> {
    const row = await AdapterApi.post<Partial<IConnection> & { i?: number }>(AdapterConfigure.ENDPOINT.REGENERATE(id), {});
    return normalize(row);
  }

  async disconnect(id: number): Promise<IConnection> {
    const row = await AdapterApi.post<Partial<IConnection> & { i?: number }>(AdapterConfigure.ENDPOINT.DISCONNECT(id), {});
    return normalize(row);
  }

  async rename(id: number, name: string): Promise<IConnection> {
    const row = await AdapterApi.request<Partial<IConnection> & { i?: number }>(AdapterConfigure.ENDPOINT.RENAME(id), {
      method: 'PATCH',
      body: { name },
    });
    return normalize(row);
  }
}
