import type { IConnection } from './IConnection';

export interface IRepositoryConnection {
  list(): Promise<IConnection[]>;
  create(name: string): Promise<IConnection>;
  remove(id: number): Promise<{ ok: boolean }>;
  regenerate(id: number): Promise<IConnection>;
  rename(id: number, name: string): Promise<IConnection>;
  disconnect(id: number): Promise<IConnection>;
}
