import type { IWebhook, ISaveWebhookInput } from './IWebhook';

export interface IRepositoryWebhook {
  list(): Promise<IWebhook[]>;
  create(input: ISaveWebhookInput): Promise<IWebhook>;
  update(id: number, input: Partial<ISaveWebhookInput>): Promise<IWebhook>;
  remove(id: number): Promise<{ ok: boolean }>;
}
