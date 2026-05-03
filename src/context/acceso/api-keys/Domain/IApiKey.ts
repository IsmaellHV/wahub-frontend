export interface IApiKey {
  id: number;
  usuario_id: number;
  name: string;
  prefix: string;
  last_used_at?: string | null;
  revoked_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

// Returned only on creation (the full key value is never persisted server-side)
export interface IApiKeyCreated extends IApiKey {
  key: string;
}
