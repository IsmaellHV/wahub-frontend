import type { IAuditFields } from '@shared/Domain/ILogDocument';

export interface IApiKey extends IAuditFields {
  id: number;
  _id?: string | null;
  usuario_id: string;
  name: string;
  prefix: string;
  last_used_at?: string | null;
}

// Returned only on creation (the full key value is never persisted server-side)
export interface IApiKeyCreated extends IApiKey {
  key: string;
}
