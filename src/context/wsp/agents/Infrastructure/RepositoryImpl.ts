import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IAiAgent, ISaveAgentInput, AiProvider } from '../Domain/IAiAgent';

export interface TestAgentInput {
  provider: AiProvider;
  model: string;
  system_prompt: string;
  api_key: string;
  temperature?: number | null;
  max_tokens?: number | null;
  message: string;
}

export interface TestAgentResult {
  reply: string;
  latency_ms: number;
}

// Coerce a number nativo. Postgres devuelve DECIMAL como string ("0.7") para
// no perder precision, asi que tenemos que normalizar para que el backend
// acepte el round-trip (su ajv exige type:'number' estricto).
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

// Backend renombró la PK numérica a `i` (Phase 3). Frontend aún usa `id`
// en su modelo de dominio — normalizamos en el boundary.
const normalize = <T extends Record<string, unknown>>(row: T): T & { id: number } => {
  const { i, ...rest } = row as { i?: number } & Record<string, unknown>;
  const r = { ...rest } as Record<string, unknown>;
  if ('temperature' in r) r.temperature = toNum(r.temperature);
  if ('max_tokens' in r) r.max_tokens = toNum(r.max_tokens);
  return { ...(r as T), id: (r as { id?: number }).id ?? i ?? 0 } as T & { id: number };
};

// Sanitiza input antes de enviar: coerce numericos por si algun handler dejo
// strings, y descarta api_key vacio en update (asi el backend mantiene la
// existente en lugar de borrarla).
const sanitizeForSave = (input: ISaveAgentInput, isUpdate: boolean): ISaveAgentInput => {
  const out: ISaveAgentInput = {
    ...input,
    temperature: toNum(input.temperature),
    max_tokens: toNum(input.max_tokens),
  };
  if (isUpdate && (!out.api_key || out.api_key.trim() === '')) {
    delete (out as { api_key?: string | null }).api_key;
  }
  return out;
};

export class RepositoryAiAgentImpl {
  async list(): Promise<IAiAgent[]> {
    const rows = await AdapterApi.get<Array<Record<string, unknown>>>(AdapterConfigure.ENDPOINT.LIST);
    return rows.map(r => normalize(r) as unknown as IAiAgent);
  }

  async create(input: ISaveAgentInput): Promise<IAiAgent> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.CREATE, sanitizeForSave(input, false));
    return normalize(row) as unknown as IAiAgent;
  }

  async update(id: number, input: ISaveAgentInput): Promise<IAiAgent> {
    const row = await AdapterApi.put<Record<string, unknown>>(AdapterConfigure.ENDPOINT.UPDATE(id), sanitizeForSave(input, true));
    return normalize(row) as unknown as IAiAgent;
  }

  remove(id: number): Promise<{ ok: boolean }> {
    return AdapterApi.delete<{ ok: boolean }>(AdapterConfigure.ENDPOINT.REMOVE(id));
  }

  test(input: TestAgentInput): Promise<TestAgentResult> {
    return AdapterApi.post<TestAgentResult>(AdapterConfigure.ENDPOINT.TEST, input);
  }
}
