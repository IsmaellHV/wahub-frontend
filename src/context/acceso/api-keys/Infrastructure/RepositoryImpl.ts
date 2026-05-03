import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryApiKey } from '../Domain/Repository';
import type { IApiKey, IApiKeyCreated } from '../Domain/IApiKey';

export class RepositoryApiKeyImpl implements IRepositoryApiKey {
  list(): Promise<IApiKey[]> {
    return AdapterApi.get<IApiKey[]>(AdapterConfigure.ENDPOINT.LIST);
  }

  create(name: string): Promise<IApiKeyCreated> {
    return AdapterApi.post<IApiKeyCreated>(AdapterConfigure.ENDPOINT.CREATE, { name });
  }

  revoke(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REVOKE(id));
  }
}
