import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryWebhook } from '../Domain/Repository';
import type { IWebhook, ISaveWebhookInput } from '../Domain/IWebhook';

export class RepositoryWebhookImpl implements IRepositoryWebhook {
  list(): Promise<IWebhook[]> {
    return AdapterApi.get<IWebhook[]>(AdapterConfigure.ENDPOINT.LIST);
  }

  create(input: ISaveWebhookInput): Promise<IWebhook> {
    return AdapterApi.post<IWebhook>(AdapterConfigure.ENDPOINT.CREATE, input);
  }

  update(id: number, input: Partial<ISaveWebhookInput>): Promise<IWebhook> {
    return AdapterApi.request<IWebhook>(AdapterConfigure.ENDPOINT.UPDATE(id), {
      method: 'PATCH',
      body: input,
    });
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }
}
