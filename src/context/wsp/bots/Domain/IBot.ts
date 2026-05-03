export type BotStatus = 'online' | 'warn' | 'idle' | 'offline';

export interface IBot {
  id: string;
  name: string;
  number: string;
  status: BotStatus;
  conv: number;
  msg24: number;
  ai: boolean;
  since: string;
  initials: string;
}
