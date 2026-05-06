'use client';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';
import { RepositoryConnectionImpl } from '@wsp/connections/Infrastructure/RepositoryImpl';
import type { IConnection } from '@wsp/connections/Domain/IConnection';
import { RepositoryMessageImpl } from '../Infrastructure/RepositoryImpl';
import type { IMessage } from '../Domain/IMessage';

const connRepo = new RepositoryConnectionImpl();
const msgRepo = new RepositoryMessageImpl();

const formatTime = (iso?: string | Date | null): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const SendMessageScreen = () => {
  const [conns, setConns] = useState<IConnection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [history, setHistory] = useState<IMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load connections (only `connected` are usable for sending)
  useEffect(() => {
    let alive = true;
    setLoadingConns(true);
    connRepo
      .list()
      .then((list) => {
        if (!alive) return;
        setConns(list);
        const firstOnline = list.find((c) => c.state === 'connected');
        if (firstOnline) setSelectedId(firstOnline.id);
      })
      .catch((e) => alive && setError((e as { message?: string })?.message ?? 'Failed to load bots'))
      .finally(() => alive && setLoadingConns(false));
    return () => {
      alive = false;
    };
  }, []);

  const onlineConns = useMemo(() => conns.filter((c) => c.state === 'connected'), [conns]);

  const loadHistory = (id: number) => {
    setLoadingHistory(true);
    msgRepo
      .list(id, 50)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    if (selectedId == null) return;
    loadHistory(selectedId);
  }, [selectedId]);

  const send = async () => {
    if (sending || selectedId == null) return;
    setError(null);
    setSuccess(null);
    if (!to.trim()) {
      setError('Ingresa el número de destino');
      return;
    }
    if (!body.trim()) {
      setError('Escribe un mensaje');
      return;
    }
    setSending(true);
    try {
      await msgRepo.send({ connection_id: selectedId, to: to.trim(), body: body.trim() });
      setBody('');
      setSuccess('Mensaje enviado');
      loadHistory(selectedId);
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const selected = conns.find((c) => c.id === selectedId) ?? null;
  const canSend = selected?.state === 'connected' && !sending;

  return (
    <>
      <Topbar crumbs={['Messages', 'Send']} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>Send a message</h1>
            <div className="sub">Manually send a WhatsApp message through one of your connected bots.</div>
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
        {success && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-online) 10%, transparent)',
              color: 'var(--status-online)',
              fontSize: 13,
            }}
          >
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* Composer */}
          <div className="card">
            <div className="card-h">
              <h3>Composer</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 6, fontWeight: 550 }}>
                  Bot
                </label>
                {loadingConns ? (
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Loading…</div>
                ) : onlineConns.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--fg-muted)',
                      padding: 12,
                      borderRadius: 'var(--r-md)',
                      border: '1px dashed var(--border)',
                    }}
                  >
                    No bots are online. Connect one in <strong>Connect</strong> first.
                  </div>
                ) : (
                  <select
                    className="input"
                    value={selectedId ?? ''}
                    onChange={(e) => setSelectedId(Number(e.target.value))}
                    style={{ width: '100%' }}
                  >
                    {onlineConns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.number ? `(${c.number})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 6, fontWeight: 550 }}>
                  To (E.164 format)
                </label>
                <input
                  className="input"
                  placeholder="+51999888777"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4 }}>Country code + number, e.g. +51999888777</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 6, fontWeight: 550 }}>
                  Message
                </label>
                <textarea
                  className="input"
                  placeholder="Type your message…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={4096}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4, textAlign: 'right' }}>
                  {body.length}/4096
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setTo('');
                    setBody('');
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={sending}
                >
                  Clear
                </button>
                <button className="btn btn-brand" onClick={send} disabled={!canSend}>
                  <Icon name="send" size={14} /> {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="card">
            <div className="card-h">
              <h3>Recent {selected ? `· ${selected.name}` : ''}</h3>
            </div>
            <div className="card-body" style={{ padding: 0, maxHeight: 480, overflowY: 'auto' }}>
              {loadingHistory && <div style={{ padding: 16, fontSize: 13, color: 'var(--fg-muted)' }}>Loading…</div>}
              {!loadingHistory && history.length === 0 && (
                <div style={{ padding: 24, fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>
                  No messages yet.
                </div>
              )}
              {!loadingHistory &&
                history.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                        {m.to_number}
                      </span>
                      <span
                        className={`pill pill-${m.status === 'sent' ? 'online' : m.status === 'failed' ? 'warn' : 'idle'}`}
                        style={{ fontSize: 10 }}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {m.body}
                    </div>
                    {m.error && (
                      <div style={{ fontSize: 11, color: 'var(--status-error)' }}>{m.error}</div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--fg-faint)' }}>{formatTime(m.registrar?.fecha)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
