import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import { MOCK_BOTS } from './mockBots';
import type { IRepositoryBot } from '../Domain/Repository';
import type { IBot } from '../Domain/IBot';

const USE_MOCKS = !process.env.NEXT_PUBLIC_API_URL;

export class RepositoryBotImpl implements IRepositoryBot {
  async list(): Promise<IBot[]> {
    if (USE_MOCKS) return MOCK_BOTS;
    return AdapterApi.get<IBot[]>(AdapterConfigure.ENDPOINT.LIST);
  }

  async findById(id: string): Promise<IBot | null> {
    if (USE_MOCKS) return MOCK_BOTS.find((b) => b.id === id) ?? null;
    return AdapterApi.get<IBot>(AdapterConfigure.ENDPOINT.BY_ID(id));
  }
}
