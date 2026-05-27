'use client';
import { useEffect, useMemo, useState } from 'react';
import { Topbar } from '@shared/UI/components/Topbar';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { RepositoryAiAgentImpl } from '../Infrastructure/RepositoryImpl';
import { RepositoryConnectionImpl } from '@wsp/connections/Infrastructure/RepositoryImpl';
import type { IAiAgent, ISaveAgentInput, AiProvider } from '../Domain/IAiAgent';
import type { IConnection } from '@wsp/connections/Domain/IConnection';

const repo = new RepositoryAiAgentImpl();
const connRepo = new RepositoryConnectionImpl();

const PROVIDER_MODELS: Record<AiProvider, string[]> = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4.1-mini'],
  anthropic: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5'],
  // DeepSeek V4 (actual). Los antiguos `deepseek-chat` / `deepseek-reasoner`
  // siguen funcionando como aliases pero quedaran deprecated; se mapean a
  // los modos non-thinking / thinking de v4-flash respectivamente.
  deepseek: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
  custom: [''],
};

interface ProviderMeta {
  id: AiProvider;
  label: string;
  badge: string; // 2-3 chars for visual chip
  color: string; // accent color
  apiKeyHint: string;
  apiKeyUrl?: string;
}

const PROVIDERS: ProviderMeta[] = [
  { id: 'openai', label: 'OpenAI', badge: 'AI', color: '#10a37f', apiKeyHint: 'sk-…', apiKeyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', label: 'Anthropic', badge: 'Cl', color: '#d97757', apiKeyHint: 'sk-ant-…', apiKeyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'deepseek', label: 'DeepSeek', badge: 'DS', color: '#4d6bfe', apiKeyHint: 'sk-…', apiKeyUrl: 'https://platform.deepseek.com/api_keys' },
  { id: 'custom', label: 'Custom', badge: '?', color: '#64748b', apiKeyHint: 'tu-token' },
];

const providerMeta = (id: AiProvider): ProviderMeta => PROVIDERS.find(p => p.id === id) ?? PROVIDERS[0];

const blankAgent = (): ISaveAgentInput => ({
  name: '',
  provider: 'openai',
  model: 'gpt-4o-mini',
  system_prompt: 'Eres un asistente útil y conciso para WhatsApp. Responde en el idioma del usuario.',
  greeting: '¡Hola! ¿En qué puedo ayudarte?',
  temperature: 0.7,
  max_tokens: 500,
  enabled: false,
  connection_id: null,
  api_key: '',
});

export const AgentsScreen = () => {
  const { t } = useI18n();
  const [agents, setAgents] = useState<IAiAgent[]>([]);
  const [conns, setConns] = useState<IConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ISaveAgentInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([repo.list(), connRepo.list()]);
      setAgents(a);
      setConns(c);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const startNew = () => setEditing(blankAgent());

  const startEdit = (a: IAiAgent) =>
    setEditing({
      id: a.id,
      connection_id: a.connection_id ?? null,
      name: a.name,
      provider: a.provider,
      model: a.model,
      system_prompt: a.system_prompt,
      greeting: a.greeting ?? '',
      temperature: a.temperature ?? 0.7,
      max_tokens: a.max_tokens ?? 500,
      enabled: a.enabled,
      api_key: a.api_key ?? '',
    });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      if (editing.id) await repo.update(editing.id, editing);
      else await repo.create(editing);
      setEditing(null);
      await reload();
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('¿Eliminar este agente?')) return;
    try {
      await repo.remove(id);
      await reload();
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Delete failed');
    }
  };

  const models = useMemo(() => (editing ? PROVIDER_MODELS[editing.provider] : []), [editing]);

  return (
    <>
      <Topbar crumbs={[t('nav.aiAgents')]} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>{t('nav.aiAgents')}</h1>
            <div className="sub">Configura personalidades de IA. Asígnalas a una sesión de WhatsApp para responder automáticamente.</div>
          </div>
          <div className="actions">
            <button className="btn btn-brand" onClick={startNew}>
              <Icon name="plus" size={14} /> Nuevo agente
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              color: 'var(--status-error)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>{t('common.loading')}</div>
        ) : agents.length === 0 && !editing ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <div className="empty-icon">
              <Icon name="sparkles" size={20} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12 }}>Sin agentes aún</div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 6, marginBottom: 16 }}>
              Crea un agente IA con personalidad propia.
            </div>
            <button className="btn btn-brand" onClick={startNew}>
              <Icon name="plus" size={14} /> Crear primer agente
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {agents.map((a) => (
              <div key={a.id} className="card">
                <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{a.name}</h3>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 2 }}>
                      {a.provider} · {a.model}
                    </div>
                  </div>
                  <span className={`pill pill-${a.enabled ? 'online' : 'idle'}`}>
                    <span className={`dot dot-${a.enabled ? 'online pulse' : 'idle'}`} />
                    {a.enabled ? 'on' : 'off'}
                  </span>
                </div>
                <div className="card-body">
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--fg-muted)',
                      lineHeight: 1.5,
                      maxHeight: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {a.system_prompt}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => startEdit(a)}>
                      <Icon name="edit" size={12} /> Editar
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(a.id)} style={{ color: 'var(--status-error)' }}>
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="modal-backdrop" onClick={() => !saving && setEditing(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
              <AgentModalHeader editing={editing} onClose={() => setEditing(null)} />
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '72vh', overflowY: 'auto', padding: 20 }}>
                {/* IDENTIDAD */}
                <SectionTitle>Identidad</SectionTitle>
                <Field label="Nombre">
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Asistente de ventas"
                  />
                </Field>
                <Field label="Sesión de WhatsApp (opcional)" hint="Si la fijas, este agente responde solo en esa sesión">
                  <select
                    className="input"
                    value={editing.connection_id ?? ''}
                    onChange={(e) =>
                      setEditing({ ...editing, connection_id: e.target.value ? Number(e.target.value) : null })
                    }
                  >
                    <option value="">— Ninguna (manual) —</option>
                    {conns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code ? `${c.code} · ` : ''}
                        {c.name} {c.number ? `(${c.number})` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* PROVEEDOR */}
                <Divider />
                <SectionTitle>Proveedor</SectionTitle>
                <ProviderPicker
                  value={editing.provider}
                  onChange={(p) =>
                    setEditing({ ...editing, provider: p, model: PROVIDER_MODELS[p][0] ?? '' })
                  }
                />
                <Field label="Modelo">
                  {editing.provider === 'custom' ? (
                    <input
                      className="input"
                      value={editing.model}
                      onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                      placeholder="nombre-del-modelo"
                    />
                  ) : (
                    <select
                      className="input"
                      value={editing.model}
                      onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  )}
                </Field>

                {/* COMPORTAMIENTO */}
                <Divider />
                <SectionTitle>Comportamiento</SectionTitle>
                <Field label="Personalidad / instrucciones (system prompt)">
                  <textarea
                    className="input"
                    rows={6}
                    value={editing.system_prompt}
                    onChange={(e) => setEditing({ ...editing, system_prompt: e.target.value })}
                    maxLength={8000}
                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--fg-faint)', textAlign: 'right' }}>
                    {editing.system_prompt.length}/8000
                  </div>
                </Field>
                <Field label="Saludo inicial (opcional)">
                  <input
                    className="input"
                    value={editing.greeting ?? ''}
                    onChange={(e) => setEditing({ ...editing, greeting: e.target.value })}
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Temperatura" hint="0 = determinista, 1 = creativo">
                    <input
                      type="number"
                      className="input"
                      step="0.1"
                      min="0"
                      max="2"
                      value={editing.temperature ?? 0.7}
                      onChange={(e) => setEditing({ ...editing, temperature: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Max tokens" hint="Limita longitud de la respuesta">
                    <input
                      type="number"
                      className="input"
                      min="1"
                      max="4096"
                      value={editing.max_tokens ?? 500}
                      onChange={(e) => setEditing({ ...editing, max_tokens: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                {/* CREDENCIALES */}
                <Divider />
                <SectionTitle>Credenciales</SectionTitle>
                <ApiKeyField
                  provider={editing.provider}
                  value={editing.api_key ?? ''}
                  isEdit={!!editing.id}
                  onChange={(v) => setEditing({ ...editing, api_key: v })}
                />

                {/* PRUEBA */}
                <Divider />
                <SectionTitle>Probar agente</SectionTitle>
                <AgentTester editing={editing} />

                {/* TOGGLE */}
                <Divider />
                <label
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    background: editing.enabled ? 'color-mix(in srgb, var(--brand-500) 8%, transparent)' : 'var(--bg-elev)',
                    border: `1px solid ${editing.enabled ? 'color-mix(in srgb, var(--brand-500) 35%, var(--border))' : 'var(--border)'}`,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!editing.enabled}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  />
                  <div>
                    <div style={{ fontWeight: 550 }}>Activar agente</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                      Si esta apagado, no responde automaticamente
                    </div>
                  </div>
                </label>
              </div>
              <div
                style={{
                  padding: 16,
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                }}
              >
                <button className="btn btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
                  {t('common.cancel')}
                </button>
                <button className="btn btn-brand" onClick={save} disabled={saving || !editing.name.trim()}>
                  {saving ? '…' : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: color-mix(in srgb, #000 50%, transparent);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: grid;
          place-items: center;
          padding: 24px;
        }
        .modal {
          background: var(--bg-elevated);
          border-radius: var(--r-lg);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 680px;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.4);
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </>
  );
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550 }}>
      {label}
      {hint && <span style={{ color: 'var(--fg-faint)', fontWeight: 400, marginLeft: 6 }}>· {hint}</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
    {children}
  </div>
);

const Divider = () => <div style={{ height: 1, background: 'var(--border)', opacity: 0.6 }} />;

// ----------------------------------------------------------------
// Header: muestra titulo + chip del proveedor activo + close button.
// ----------------------------------------------------------------
const AgentModalHeader = ({ editing, onClose }: { editing: ISaveAgentInput; onClose: () => void }) => {
  const meta = providerMeta(editing.provider);
  return (
    <div
      className="card-h"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${meta.color} 20%, transparent)`,
            color: meta.color,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.4,
          }}
        >
          {meta.badge}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 16, lineHeight: 1.2 }}>
            {editing.id ? 'Editar agente' : 'Nuevo agente'}
          </h3>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
            {meta.label} · {editing.model || '(sin modelo)'}
          </div>
        </div>
      </div>
      <button className="icon-btn" onClick={onClose} title="Cerrar">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
};

// ----------------------------------------------------------------
// Provider picker: 4 cards seleccionables.
// ----------------------------------------------------------------
const ProviderPicker = ({ value, onChange }: { value: AiProvider; onChange: (p: AiProvider) => void }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
    {PROVIDERS.map((p) => {
      const active = p.id === value;
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '12px 8px',
            borderRadius: 'var(--r-md)',
            background: active ? `color-mix(in srgb, ${p.color} 12%, transparent)` : 'var(--bg-elev)',
            border: `1.5px solid ${active ? p.color : 'var(--border)'}`,
            cursor: 'pointer',
            color: 'var(--fg)',
            transition: 'background 120ms, border 120ms',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              background: `color-mix(in srgb, ${p.color} 20%, transparent)`,
              color: p.color,
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            {p.badge}
          </div>
          <div style={{ fontSize: 12, fontWeight: 550 }}>{p.label}</div>
        </button>
      );
    })}
  </div>
);

// ----------------------------------------------------------------
// Tester: envia un mensaje al provider con la config actual del modal
// (sin guardar) y muestra reply + latencia. Util para validar prompt + key
// antes de persistir.
// ----------------------------------------------------------------
const AgentTester = ({ editing }: { editing: ISaveAgentInput }) => {
  const [message, setMessage] = useState('Hola, ¿quién eres?');
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const canTest = !!editing.api_key && !!editing.model && !!editing.system_prompt;

  const run = async () => {
    setBusy(true);
    setErr(null);
    setReply(null);
    setLatency(null);
    try {
      const res = await repo.test({
        provider: editing.provider,
        model: editing.model,
        system_prompt: editing.system_prompt,
        api_key: editing.api_key ?? '',
        temperature: editing.temperature ?? null,
        max_tokens: editing.max_tokens ?? null,
        message,
      });
      setReply(res.reply);
      setLatency(res.latency_ms);
    } catch (e) {
      setErr((e as { message?: string })?.message ?? 'Falló la prueba');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Field label="Mensaje de prueba" hint="Se envia con tu system prompt actual">
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hola, que puedes hacer?"
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canTest && !busy) {
                e.preventDefault();
                void run();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void run()}
            disabled={busy || !canTest || !message.trim()}
            title={!canTest ? 'Completa api_key, model y system_prompt primero' : ''}
          >
            {busy ? '…' : (
              <>
                <Icon name="send" size={12} /> Probar
              </>
            )}
          </button>
        </div>
      </Field>

      {!canTest && (
        <div style={{ fontSize: 11, color: 'var(--fg-faint)' }}>
          Necesitas api_key, modelo y system prompt para probar.
        </div>
      )}

      {err && (
        <div
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--r-md)',
            background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
            color: 'var(--status-error)',
            fontSize: 12,
            wordBreak: 'break-word',
          }}
        >
          {err}
        </div>
      )}

      {reply !== null && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            fontSize: 13,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--fg-faint)' }}>
              Respuesta
            </span>
            {latency !== null && (
              <span style={{ fontSize: 11, color: 'var(--fg-faint)' }}>{latency} ms</span>
            )}
          </div>
          {reply || <span style={{ color: 'var(--fg-faint)' }}>(respuesta vacia)</span>}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------
// API Key con toggle de visibilidad + link a la consola del provider.
// ----------------------------------------------------------------
const ApiKeyField = ({
  provider,
  value,
  isEdit,
  onChange,
}: {
  provider: AiProvider;
  value: string;
  isEdit: boolean;
  onChange: (v: string) => void;
}) => {
  const [show, setShow] = useState(false);
  const meta = providerMeta(provider);

  return (
    <Field label="API Key">
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isEdit ? '•••••••• (deja vacío para conservar)' : meta.apiKeyHint}
          style={{ paddingRight: 40, fontFamily: show ? 'var(--font-mono, monospace)' : 'inherit' }}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          title={show ? 'Ocultar' : 'Mostrar'}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'var(--fg-muted)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            display: 'inline-flex',
          }}
        >
          <Icon name="eye" size={13} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-faint)' }}>
        <span>Almacenada en plano en DB — usa keys con scope limitado</span>
        {meta.apiKeyUrl && (
          <a href={meta.apiKeyUrl} target="_blank" rel="noopener noreferrer" style={{ color: meta.color, textDecoration: 'none' }}>
            Obtener key ↗
          </a>
        )}
      </div>
    </Field>
  );
};
