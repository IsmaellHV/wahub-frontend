export type AiProvider = 'openai' | 'anthropic' | 'custom';

export interface IAiAgent {
  id: number;
  usuario_id: number;
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
  created_at?: string | null;
  updated_at?: string | null;
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
