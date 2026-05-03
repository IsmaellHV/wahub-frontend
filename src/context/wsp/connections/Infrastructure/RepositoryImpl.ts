import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryConnection } from '../Domain/Repository';
import type { IConnection } from '../Domain/IConnection';

export class RepositoryConnectionImpl implements IRepositoryConnection {
  list(): Promise<IConnection[]> {
    return AdapterApi.get<IConnection[]>(AdapterConfigure.ENDPOINT.LIST);
  }

  create(name: string): Promise<IConnection> {
    return AdapterApi.post<IConnection>(AdapterConfigure.ENDPOINT.CREATE, { name });
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }

  regenerate(id: number): Promise<IConnection> {
    return AdapterApi.post<IConnection>(AdapterConfigure.ENDPOINT.REGENERATE(id), {});
  }

  disconnect(id: number): Promise<IConnection> {
    return AdapterApi.post<IConnection>(AdapterConfigure.ENDPOINT.DISCONNECT(id), {});
  }

  rename(id: number, name: string): Promise<IConnection> {
    return AdapterApi.request<IConnection>(AdapterConfigure.ENDPOINT.RENAME(id), {
      method: 'PATCH',
      body: { name },
    });
  }
}
