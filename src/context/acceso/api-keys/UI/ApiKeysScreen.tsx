'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { RepositoryApiKeyImpl } from '../Infrastructure/RepositoryImpl';
import type { IApiKey, IApiKeyCreated } from '../Domain/IApiKey';

const repo = new RepositoryApiKeyImpl();

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
};

export const ApiKeysScreen = () => {
  const { t } = useI18n();
  const [keys, setKeys] = useState<IApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [createBusy, setCreateBusy] = useState(false);

  // Holds the freshly minted key — shown ONCE, then forgotten.
  const [revealed, setRevealed] = useState<IApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);

  // Confirm-revoke state
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [revokeBusy, setRevokeBusy] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    repo
      .list()
      .then((list) => setKeys(list))
      .catch((e) => setError((e as { message?: string })?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const submitCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreateBusy(true);
    try {
      const created = await repo.create(name);
      setRevealed(created);
      setCreating(false);
      setNewName('');
      // Optimistic insert so the new row appears under the modal even before reveal closes
      setKeys((cur) => [{ ...created }, ...cur]);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Create failed');
    } finally {
      setCreateBusy(false);
    }
  };

  const doRevoke = async (id: number) => {
    setRevokeBusy(id);
    try {
      await repo.revoke(id);
      setKeys((cur) => cur.map((k) => (k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k)));
      setConfirmId(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Revoke failed');
    } finally {
      setRevokeBusy(null);
    }
  };

  const copyKey = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api/wahub').replace(/\/$/, '');
  const exampleKey = revealed?.key ?? 'wh_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
  const curlExample = `curl -X POST ${apiBase}/v1/messages/text \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${exampleKey}" \\
  -d '{
    "code": "WSP-AB12C",
    "to": "51999000111",
    "text": "Hola desde la API"
  }'`;

  return (
    <>
      <div className="page-h" style={{ marginTop: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>Claves de API</div>
          <div className="sub">Crea claves para enviar mensajes desde tus servicios.</div>
        </div>
        <div className="actions">
          <button className="btn btn-brand" onClick={() => setCreating(true)}>
            <Icon name="plus" size={14} /> Nueva clave
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button className="icon-btn" onClick={() => setError(null)}>
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {/* Quick start */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-h">
            <h3>Inicio rápido</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
              Endpoint público <span className="mono" style={{ color: 'var(--fg)' }}>POST /v1/messages/text</span>. Autentica con
              header <span className="mono" style={{ color: 'var(--fg)' }}>X-Api-Key</span>. El campo <span className="mono">code</span> es el código de tu sesión (visible en Sesiones).
            </div>
            <pre
              style={{
                background: 'var(--bg-subtle)',
                padding: 14,
                borderRadius: 'var(--r-md)',
                fontSize: 12.5,
                color: 'var(--fg)',
                overflow: 'auto',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
{curlExample}
            </pre>
          </div>
        </div>

        {/* Keys list */}
        <div className="card">
          <div className="card-h" style={{ padding: '8px 16px', background: 'var(--bg-subtle)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 180px 180px 120px 90px',
                gap: 16,
                width: '100%',
                alignItems: 'center',
                fontSize: 11,
                color: 'var(--fg-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 500,
              }}
            >
              <span>Nombre</span>
              <span>Prefijo</span>
              <span>Último uso</span>
              <span>Estado</span>
              <span style={{ textAlign: 'right' }} />
            </div>
          </div>

          {loading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>Cargando…</div>
          )}

          {!loading && keys.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="empty-icon">
                <Icon name="key" size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 550, color: 'var(--fg)', marginBottom: 4 }}>Aún no tienes claves</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 14 }}>
                Crea una para empezar a enviar mensajes vía API.
              </div>
              <button className="btn btn-brand btn-sm" onClick={() => setCreating(true)}>
                <Icon name="plus" size={12} /> Nueva clave
              </button>
            </div>
          )}

          {keys.map((k) => {
            const revoked = !!k.revoked_at;
            const busy = revokeBusy === k.id;
            return (
              <div
                key={k.id}
                className="bot-row"
                style={{ gridTemplateColumns: '1fr 180px 180px 120px 90px', position: 'relative' }}
              >
                <div className="bot-meta" style={{ minWidth: 0 }}>
                  <span className="n">{k.name}</span>
                  <span className="num">creada {formatDate(k.created_at)}</span>
                </div>
                <div className="mono" style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>
                  {k.prefix}…
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{formatDate(k.last_used_at)}</div>
                <span className={`pill pill-${revoked ? 'warn' : 'online'}`}>
                  <span className={`dot dot-${revoked ? 'warn' : 'online pulse'}`} />
                  {revoked ? 'revocada' : 'activa'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {!revoked && (
                    <button
                      className="icon-btn"
                      title="Revocar"
                      onClick={() => setConfirmId(k.id)}
                      disabled={busy}
                      style={{ color: 'var(--status-error)' }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>

                {confirmId === k.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 'calc(100% - 4px)',
                      zIndex: 60,
                      width: 300,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      boxShadow: '0 16px 32px -12px rgba(0,0,0,0.3)',
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>Revocar clave?</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 12 }}>
                      Cualquier servicio que use esta clave dejará de funcionar. No se puede deshacer.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)} disabled={busy}>
                        Cancelar
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--status-error)', color: '#fff', border: 'none' }}
                        onClick={() => doRevoke(k.id)}
                        disabled={busy}
                      >
                        {busy ? '…' : 'Revocar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      {/* Create modal */}
      {creating && (
        <Modal onClose={() => !createBusy && setCreating(false)}>
          <h3 style={{ marginTop: 0 }}>Nueva clave de API</h3>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 14 }}>
            Ponle un nombre que recuerdes (ej. "Producción", "Servidor backend").
          </div>
          <input
            className="input"
            autoFocus
            placeholder="Producción"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void submitCreate();
              if (e.key === 'Escape') setCreating(false);
            }}
            maxLength={100}
            disabled={createBusy}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost" onClick={() => setCreating(false)} disabled={createBusy}>
              Cancelar
            </button>
            <button className="btn btn-brand" onClick={submitCreate} disabled={createBusy || !newName.trim()}>
              {createBusy ? 'Creando…' : 'Crear'}
            </button>
          </div>
        </Modal>
      )}

      {/* Reveal modal — shown ONCE after create */}
      {revealed && (
        <Modal onClose={() => setRevealed(null)} wide>
          <h3 style={{ marginTop: 0 }}>Tu clave: {revealed.name}</h3>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-warn, #f59e0b) 15%, transparent)',
              color: 'var(--fg)',
              fontSize: 12.5,
              marginBottom: 14,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <Icon name="key" size={14} />
            <span>
              Cópiala ahora. <strong>No podrás verla de nuevo</strong> — solo guardamos un hash. Si la pierdes,
              tendrás que crear una nueva.
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              padding: 12,
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            <code
              className="mono"
              style={{ flex: 1, fontSize: 13, color: 'var(--fg)', overflow: 'auto', whiteSpace: 'nowrap' }}
            >
              {revealed.key}
            </code>
            <button className="btn btn-secondary btn-sm" onClick={copyKey}>
              <Icon name={copied ? 'check' : 'copy'} size={13} /> {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-brand" onClick={() => setRevealed(null)}>
              He guardado la clave
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

interface ModalProps {
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}

const Modal = ({ onClose, wide, children }: ModalProps) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'color-mix(in srgb, #000 50%, transparent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        width: '100%',
        maxWidth: wide ? 640 : 440,
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  </div>
);
