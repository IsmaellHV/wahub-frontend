import type { IAuditFields } from '@shared/Domain/ILogDocument';

export type AiProvider = 'openai' | 'anthropic' | 'deepseek' | 'custom';

export interface IAiAgent extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id: string;
  connection_id?: number | null;
  name: string;
  provider: AiProvider;
  model: string;
  system_prompt: string;
  greeting?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  enabled: boolean;
  api_key?: string | null;
}

export interface ISaveAgentInput {
  id?: number;
  connection_id?: number | null;
  name: string;
  provider: AiProvider;
  model: string;
  system_prompt: string;
  greeting?: string | null;
  temperature?: number | null;
  max_tokens?: number | null;
  enabled?: boolean;
  api_key?: string | null;
}
