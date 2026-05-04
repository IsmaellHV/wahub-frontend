'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';
import { RepositoryConnectionImpl } from '@wsp/connections/Infrastructure/RepositoryImpl';
import type { IConnection, ConnectionState } from '@wsp/connections/Domain/IConnection';
import { useI18n } from '@shared/i18n/I18nProvider';

type Filter = 'all' | 'online' | 'idle';

const repo = new RepositoryConnectionImpl();

// Map backend connection state → UI status (online / idle / warn).
const toStatus = (s: ConnectionState): 'online' | 'idle' | 'warn' => {
  if (s === 'connected') return 'online';
  if (s === 'scanning' || s === 'connecting' || s === 'revision') return 'idle';
  return 'warn';
};

// Friendly label shown in the State column (the raw backend enum is too cryptic).
const labelOf = (s: ConnectionState): string => {
  switch (s) {
    case 'connected':
      return 'connected';
    case 'connecting':
      return 'connecting';
    case 'scanning':
      return 'scanning';
    case 'revision':
      return 'verifying';
    case 'disconnected':
      return 'disconnected';
    default:
      return s;
  }
};

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'WA';

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '—';
  }
};

export const BotsListScreen = () => {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  const [conns, setConns] = useState<IConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [renameId, setRenameId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmDisconnectId, setConfirmDisconnectId] = useState<number | null>(null);
  const menuRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const reload = () => {
    let alive = true;
    setLoading(true);
    repo
      .list()
      .then((list) => alive && setConns(list))
      .catch((e) => alive && setError((e as { message?: string })?.message ?? 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  };

  useEffect(() => reload(), []);

  // Click-outside closes any open menu
  useEffect(() => {
    if (openMenuId == null) return;
    const onDoc = (e: MouseEvent) => {
      const node = menuRefs.current.get(openMenuId);
      if (node && !node.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenuId]);

  // Hide disconnected sessions from the list entirely (per UX request).
  const visible = useMemo(() => conns.filter((c) => c.state !== 'disconnected'), [conns]);

  const counts = useMemo(() => {
    const c = { all: visible.length, online: 0, idle: 0 };
    for (const x of visible) {
      const s = toStatus(x.state);
      if (s === 'online' || s === 'idle') c[s]++;
    }
    return c;
  }, [visible]);

  // Sort desc by id (newest created first). created_at would need parsing — id is stable.
  const sorted = useMemo(() => [...visible].sort((a, b) => b.id - a.id), [visible]);
  const filtered = useMemo(
    () => sorted.filter((c) => filter === 'all' || toStatus(c.state) === filter),
    [sorted, filter],
  );

  const startRename = (c: IConnection) => {
    setRenameId(c.id);
    setRenameValue(c.name);
    setOpenMenuId(null);
  };

  const submitRename = async () => {
    if (renameId == null) return;
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setActionBusy(renameId);
    try {
      const updated = await repo.rename(renameId, trimmed);
      setConns((cs) => cs.map((c) => (c.id === renameId ? { ...c, name: updated.name } : c)));
      setRenameId(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Rename failed');
    } finally {
      setActionBusy(null);
    }
  };

  const doDisconnect = async (id: number) => {
    setActionBusy(id);
    try {
      const updated = await repo.disconnect(id);
      setConns((cs) => cs.map((c) => (c.id === id ? { ...c, state: updated.state, qr: null } : c)));
      setConfirmDisconnectId(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Disconnect failed');
    } finally {
      setActionBusy(null);
    }
  };

  const doDelete = async (id: number) => {
    setActionBusy(id);
    try {
      await repo.remove(id);
      setConns((cs) => cs.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Delete failed');
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <>
      <Topbar crumbs={[t('sessions.title')]} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>{t('sessions.title')}</h1>
            <div className="sub">{t('sessions.subtitle')}</div>
          </div>
          <div className="actions">
            <Link href="/connect" className="btn btn-brand">
              <Icon name="plus" size={14} /> {t('sessions.new')}
            </Link>
          </div>
        </div>

        <div className="row" style={{ gap: 4, marginBottom: 12 }}>
          {(['all', 'online', 'idle'] as Filter[]).map((id) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`btn btn-sm ${filter === id ? 'btn-secondary' : 'btn-ghost'}`}
            >
              {id === 'all' ? t('common.all') : id === 'online' ? t('sessions.online') : t('sessions.pairing')}{' '}
              <span className="mono faint" style={{ marginLeft: 4 }}>
                {counts[id]}
              </span>
            </button>
          ))}
          <div className="spacer" />
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

        <div className="card">
          <div className="card-h" style={{ padding: '8px 16px', background: 'var(--bg-subtle)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 130px 110px 90px 32px',
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
              <span />
              <span>{t('sessions.bot')}</span>
              <span>{t('sessions.created')}</span>
              <span style={{ textAlign: 'right' }}>{t('sessions.state')}</span>
              <span style={{ textAlign: 'right' }}>{t('sessions.status')}</span>
              <span />
            </div>
          </div>

          {loading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>Loading…</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="empty-icon">
                <Icon name="bot" size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 550, color: 'var(--fg)', marginBottom: 4 }}>{t('sessions.empty')}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 14 }}>{t('sessions.emptyHint')}</div>
              <Link href="/connect" className="btn btn-brand btn-sm">
                <Icon name="plus" size={12} /> {t('sessions.connectCta')}
              </Link>
            </div>
          )}

          {filtered.map((c) => {
            const status = toStatus(c.state);
            const isRenaming = renameId === c.id;
            const isMenuOpen = openMenuId === c.id;
            const busy = actionBusy === c.id;
            return (
              <div
                key={c.id}
                className="bot-row"
                style={{ gridTemplateColumns: '32px 1fr 130px 110px 90px 32px', position: 'relative' }}
              >
                <div className="bot-icon">{initialsOf(c.name)}</div>
                <div className="bot-meta" style={{ minWidth: 0 }}>
                  {isRenaming ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        className="input"
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void submitRename();
                          if (e.key === 'Escape') setRenameId(null);
                        }}
                        maxLength={64}
                        style={{ height: 28, fontSize: 13 }}
                      />
                      <button className="btn btn-brand btn-sm" onClick={submitRename} disabled={busy}>
                        Save
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setRenameId(null)} disabled={busy}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link href={`/bots/${c.id}`} className="n" style={{ textDecoration: 'none', color: 'inherit' }}>
                        {c.name}
                      </Link>
                      <span className="num">{c.number ?? 'unpaired'}</span>
                    </>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)' }} title={c.created_at ?? ''}>
                  {formatDate(c.created_at)}
                </div>
                <div className="metric-mini">
                  <div className="v mono">{labelOf(c.state)}</div>
                  <div className="l">backend</div>
                </div>
                <span className={`pill pill-${status}`}>
                  <span className={`dot dot-${status === 'online' ? 'online pulse' : status === 'warn' ? 'warn' : 'idle'}`} />
                  {status}
                </span>
                <div
                  ref={(el) => {
                    menuRefs.current.set(c.id, el);
                  }}
                  style={{ position: 'relative' }}
                >
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : c.id);
                    }}
                    disabled={busy}
                  >
                    <Icon name="more" size={14} />
                  </button>
                  {isMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 4px)',
                        zIndex: 50,
                        minWidth: 180,
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        boxShadow: '0 12px 28px -12px rgba(0,0,0,0.25)',
                        padding: 4,
                        fontSize: 13,
                      }}
                    >
                      <button className="menu-item" onClick={() => startRename(c)}>
                        <Icon name="edit" size={13} /> Rename
                      </button>
                      {c.state === 'connected' && (
                        <button
                          className="menu-item"
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirmDisconnectId(c.id);
                          }}
                        >
                          <Icon name="power" size={13} /> Disconnect
                        </button>
                      )}
                      {c.state !== 'connected' && c.state !== 'scanning' && c.state !== 'connecting' && (
                        <Link href="/connect" className="menu-item">
                          <Icon name="qr" size={13} /> Re-pair
                        </Link>
                      )}
                      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                      <button
                        className="menu-item"
                        style={{ color: 'var(--status-error)' }}
                        onClick={() => {
                          setOpenMenuId(null);
                          setConfirmDeleteId(c.id);
                        }}
                      >
                        <Icon name="trash" size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Confirm disconnect */}
                {confirmDisconnectId === c.id && (
                  <ConfirmInline
                    title="Desconectar bot?"
                    message="Se cierra la sesión de WhatsApp. Puedes volver a enlazarlo después con el mismo nombre."
                    cta="Disconnect"
                    busy={busy}
                    onCancel={() => setConfirmDisconnectId(null)}
                    onConfirm={() => doDisconnect(c.id)}
                  />
                )}
                {confirmDeleteId === c.id && (
                  <ConfirmInline
                    title="Eliminar bot?"
                    message="Borra la sesión y todos sus mensajes. No se puede deshacer."
                    cta="Delete"
                    danger
                    busy={busy}
                    onCancel={() => setConfirmDeleteId(null)}
                    onConfirm={() => doDelete(c.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 10px;
          background: transparent;
          border: none;
          color: var(--fg);
          font-size: 13px;
          border-radius: var(--r-sm);
          cursor: pointer;
          text-align: left;
          text-decoration: none;
        }
        .menu-item:hover {
          background: var(--bg-subtle);
        }
      `}</style>
    </>
  );
};

interface ConfirmInlineProps {
  title: string;
  message: string;
  cta: string;
  danger?: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmInline = ({ title, message, cta, danger, busy, onCancel, onConfirm }: ConfirmInlineProps) => (
  <div
    style={{
      position: 'absolute',
      right: 12,
      top: 'calc(100% - 4px)',
      zIndex: 60,
      width: 280,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      boxShadow: '0 16px 32px -12px rgba(0,0,0,0.3)',
      padding: 14,
    }}
  >
    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--fg)', marginBottom: 4 }}>{title}</div>
    <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 12 }}>{message}</div>
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
      <button className="btn btn-ghost btn-sm" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
      <button
        className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-brand'}`}
        onClick={onConfirm}
        disabled={busy}
        style={danger ? { background: 'var(--status-error)', color: '#fff', border: 'none' } : undefined}
      >
        {busy ? '…' : cta}
      </button>
    </div>
  </div>
);
