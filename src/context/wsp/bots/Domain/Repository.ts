import type { IBot } from './IBot';

export interface IRepositoryBot {
  list(): Promise<IBot[]>;
  findById(id: string): Promise<IBot | null>;
}
