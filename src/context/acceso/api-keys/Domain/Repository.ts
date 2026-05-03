import type { IApiKey, IApiKeyCreated } from './IApiKey';

export interface IRepositoryApiKey {
  list(): Promise<IApiKey[]>;
  create(name: string): Promise<IApiKeyCreated>;
  revoke(id: number): Promise<{ ok: boolean }>;
}
