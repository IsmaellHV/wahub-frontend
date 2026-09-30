import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import { MOCK_BOTS } from './mockBots';
import type { IRepositoryBot } from '../Domain/Repository';
import type { IBot } from '../Domain/IBot';

// Explicit opt-in: the API URL is now optional (relative by default), so its
// absence can no longer mean "no backend".
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

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
