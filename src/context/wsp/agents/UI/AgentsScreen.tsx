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
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  anthropic: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5'],
  custom: [''],
};

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
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="card-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{editing.id ? 'Editar agente' : 'Nuevo agente'}</h3>
                <button className="icon-btn" onClick={() => setEditing(null)}>
                  <Icon name="x" size={14} />
                </button>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '70vh', overflowY: 'auto' }}>
                <Field label="Nombre">
                  <input
                    className="input"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Asistente de ventas"
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Proveedor">
                    <select
                      className="input"
                      value={editing.provider}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          provider: e.target.value as AiProvider,
                          model: PROVIDER_MODELS[e.target.value as AiProvider][0],
                        })
                      }
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="custom">Custom</option>
                    </select>
                  </Field>
                  <Field label="Modelo">
                    {editing.provider === 'custom' ? (
                      <input
                        className="input"
                        value={editing.model}
                        onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                      />
                    ) : (
                      <select
                        className="input"
                        value={editing.model}
                        onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                      >
                        {models.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>

                <Field label="Sesión de WhatsApp (opcional)">
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
                  <Field label="Temperatura">
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
                  <Field label="Max tokens">
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

                <Field label="API Key">
                  <input
                    type="password"
                    className="input"
                    value={editing.api_key ?? ''}
                    onChange={(e) => setEditing({ ...editing, api_key: e.target.value })}
                    placeholder={editing.id ? '•••••••• (deja vacío para conservar)' : 'sk-…'}
                  />
                </Field>

                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    checked={!!editing.enabled}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  />
                  Activar (responde automáticamente)
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
          max-width: 560px;
          box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550 }}>{label}</label>
    {children}
  </div>
);
