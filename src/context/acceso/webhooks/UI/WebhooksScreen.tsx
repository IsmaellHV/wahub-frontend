'use client';
import { useEffect, useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { RepositoryWebhookImpl } from '../Infrastructure/RepositoryImpl';
import type { IWebhook, ISaveWebhookInput, WebhookEvent } from '../Domain/IWebhook';
import { WEBHOOK_EVENTS } from '../Domain/IWebhook';

const repo = new RepositoryWebhookImpl();

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return '—';
  }
};

const blank = (): ISaveWebhookInput => ({
  name: '',
  url: '',
  events: ['message.received'],
  active: true,
});

export const WebhooksScreen = () => {
  const [items, setItems] = useState<IWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state — when `editing.id` set, we're updating; otherwise creating.
  const [editing, setEditing] = useState<(ISaveWebhookInput & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);

  // Tracks the secret of a freshly created webhook so we can highlight + copy it once.
  const [revealedSecret, setRevealedSecret] = useState<{ id: number; secret: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = () => {
    setLoading(true);
    repo
      .list()
      .then((list) => setItems(list))
      .catch((e) => setError((e as { message?: string })?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const startNew = () => setEditing(blank());

  const startEdit = (w: IWebhook) =>
    setEditing({ id: w.id, name: w.name, url: w.url, events: w.events, active: w.active });

  const submit = async () => {
    if (!editing) return;
    const payload: ISaveWebhookInput = {
      name: editing.name.trim(),
      url: editing.url.trim(),
      events: editing.events,
      active: editing.active,
    };
    if (!payload.name || !payload.url || payload.events.length === 0) return;
    setSaving(true);
    try {
      if (editing.id) {
        const updated = await repo.update(editing.id, payload);
        setItems((cur) => cur.map((w) => (w.id === updated.id ? updated : w)));
      } else {
        const created = await repo.create(payload);
        setItems((cur) => [created, ...cur]);
        setRevealedSecret({ id: created.id, secret: created.secret });
      }
      setEditing(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (w: IWebhook) => {
    setBusyId(w.id);
    try {
      const updated = await repo.update(w.id, { active: !w.active });
      setItems((cur) => cur.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const doRemove = async (id: number) => {
    setBusyId(id);
    try {
      await repo.remove(id);
      setItems((cur) => cur.filter((w) => w.id !== id));
      setConfirmId(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const copySecret = async () => {
    if (!revealedSecret) return;
    try {
      await navigator.clipboard.writeText(revealedSecret.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const toggleEvent = (e: WebhookEvent) => {
    if (!editing) return;
    const has = editing.events.includes(e);
    setEditing({
      ...editing,
      events: has ? editing.events.filter((x) => x !== e) : [...editing.events, e],
    });
  };

  return (
    <>
      <div className="page-h" style={{ marginTop: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg)' }}>Webhooks</div>
          <div className="sub">Recibe eventos de WhatsApp en tu URL (mensajes entrantes, conexiones, etc.).</div>
        </div>
        <div className="actions">
          <button className="btn btn-brand" onClick={startNew}>
            <Icon name="plus" size={14} /> Nuevo webhook
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

      {/* Quick info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-h">
          <h3>Cómo funciona</h3>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            Cuando ocurre un evento (ej. nuevo mensaje), te enviamos un <span className="mono" style={{ color: 'var(--fg)' }}>POST</span> a tu URL con el payload firmado.
            Verifica la firma con HMAC-SHA256 usando tu <span className="mono" style={{ color: 'var(--fg)' }}>secret</span>.
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
{`POST /tu-endpoint
Content-Type: application/json
X-Wahub-Signature: sha256=<hex hmac>
X-Wahub-Delivery-Attempt: 1

{
  "event": "message.received",
  "ts": 1730000000000,
  "connection": { "id": 1, "code": "WSP-AB12C", "name": "ismael", "number": "51999..." },
  "data": { "from": "51999...@c.us", "text": "Hola", "timestamp": 1730000000 }
}`}
          </pre>
        </div>
      </div>

      {/* List */}
      <div className="card">
        <div className="card-h" style={{ padding: '8px 16px', background: 'var(--bg-subtle)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 220px 130px 100px 90px',
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
            <span>Nombre / URL</span>
            <span>Eventos</span>
            <span>Última entrega</span>
            <span>Estado</span>
            <span style={{ textAlign: 'right' }} />
          </div>
        </div>

        {loading && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>Cargando…</div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="empty-icon">
              <Icon name="webhook" size={20} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 550, color: 'var(--fg)', marginBottom: 4 }}>Aún no tienes webhooks</div>
            <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 14 }}>
              Crea uno para empezar a recibir eventos en tu URL.
            </div>
            <button className="btn btn-brand btn-sm" onClick={startNew}>
              <Icon name="plus" size={12} /> Nuevo webhook
            </button>
          </div>
        )}

        {items.map((w) => {
          const busy = busyId === w.id;
          const lastOk = w.last_status && w.last_status >= 200 && w.last_status < 300;
          return (
            <div
              key={w.id}
              className="bot-row"
              style={{ gridTemplateColumns: '1fr 220px 130px 100px 90px', position: 'relative' }}
            >
              <div className="bot-meta" style={{ minWidth: 0 }}>
                <span className="n">{w.name}</span>
                <span
                  className="num mono"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  title={w.url}
                >
                  {w.url}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {w.events.map((e) => (
                  <span
                    key={e}
                    className="mono"
                    style={{
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--fg-muted)',
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                {formatDate(w.last_delivery_at)}
                {w.last_status != null && (
                  <div
                    className="mono"
                    style={{ fontSize: 11, color: lastOk ? 'var(--status-online)' : 'var(--status-error)' }}
                  >
                    HTTP {w.last_status || 'err'}
                  </div>
                )}
              </div>
              <button
                className={`pill pill-${w.active ? 'online' : 'warn'}`}
                onClick={() => toggleActive(w)}
                disabled={busy}
                style={{ cursor: 'pointer', border: 'none' }}
                title={w.active ? 'Click para pausar' : 'Click para activar'}
              >
                <span className={`dot dot-${w.active ? 'online pulse' : 'warn'}`} />
                {w.active ? 'activo' : 'pausado'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                <button className="icon-btn" title="Editar" onClick={() => startEdit(w)} disabled={busy}>
                  <Icon name="edit" size={14} />
                </button>
                <button
                  className="icon-btn"
                  title="Eliminar"
                  onClick={() => setConfirmId(w.id)}
                  disabled={busy}
                  style={{ color: 'var(--status-error)' }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>

              {confirmId === w.id && (
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
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>Eliminar webhook?</div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 12 }}>
                    Dejarás de recibir estos eventos. No se puede deshacer.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmId(null)} disabled={busy}>
                      Cancelar
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: 'var(--status-error)', color: '#fff', border: 'none' }}
                      onClick={() => doRemove(w.id)}
                      disabled={busy}
                    >
                      {busy ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reveal secret panel under the row that just got created */}
              {revealedSecret?.id === w.id && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'color-mix(in srgb, var(--brand-500) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--brand-500) 40%, transparent)',
                    borderRadius: 'var(--r-md)',
                    padding: 12,
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: 'var(--fg)' }}>
                    <strong>Secret generado</strong> — guárdalo, lo necesitarás para verificar la firma.
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code
                      className="mono"
                      style={{ flex: 1, fontSize: 12.5, color: 'var(--fg)', overflow: 'auto', whiteSpace: 'nowrap' }}
                    >
                      {revealedSecret.secret}
                    </code>
                    <button className="btn btn-secondary btn-sm" onClick={copySecret}>
                      <Icon name={copied ? 'check' : 'copy'} size={13} /> {copied ? 'Copiado' : 'Copiar'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setRevealedSecret(null)}>
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create / edit modal */}
      {editing && (
        <Modal onClose={() => !saving && setEditing(null)} wide>
          <h3 style={{ marginTop: 0 }}>{editing.id ? 'Editar webhook' : 'Nuevo webhook'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Nombre">
              <input
                className="input"
                value={editing.name}
                placeholder="Mi servidor"
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                maxLength={100}
                disabled={saving}
              />
            </Field>
            <Field label="URL (https recomendado)">
              <input
                className="input mono"
                value={editing.url}
                placeholder="https://midominio.com/wahub-events"
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                disabled={saving}
              />
            </Field>
            <Field label="Eventos">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {WEBHOOK_EVENTS.map((e) => {
                  const checked = editing.events.includes(e);
                  return (
                    <label key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleEvent(e)} disabled={saving} />
                      <span className="mono">{e}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={editing.active ?? true}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                disabled={saving}
              />
              <span>Activo</span>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </button>
            <button
              className="btn btn-brand"
              onClick={submit}
              disabled={saving || !editing.name.trim() || !editing.url.trim() || editing.events.length === 0}
            >
              {saving ? 'Guardando…' : editing.id ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550 }}>{label}</span>
    {children}
  </div>
);

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
        maxWidth: wide ? 560 : 440,
        boxShadow: '0 24px 48px -12px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  </div>
);
