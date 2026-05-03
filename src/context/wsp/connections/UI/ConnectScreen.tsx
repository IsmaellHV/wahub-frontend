'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { QrCode } from '@shared/UI/components/QrCode';
import { Topbar } from '@shared/UI/components/Topbar';
import { RepositoryConnectionImpl } from '../Infrastructure/RepositoryImpl';
import { useConnectionRealtime } from '../Application/useConnectionRealtime';
import type { IConnection } from '../Domain/IConnection';

const repo = new RepositoryConnectionImpl();
const QR_TTL = 60; // seconds

export const ConnectScreen = () => {
  const [conn, setConn] = useState<IConnection | null>(null);
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(QR_TTL);
  const [botName, setBotName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  // Pre-existing online bots — surface them so user knows there's already one paired
  // instead of being silently auto-attached. Multi-bot is fully supported.
  const [existingOnline, setExistingOnline] = useState<IConnection[]>([]);

  const realtime = useConnectionRealtime({ connectionId: conn?.id ?? null, initial: conn });
  const state = realtime.state;
  const qrDataUrl = realtime.qr;

  // Validate name. Backend caps at 64 chars.
  const validateName = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return 'Pon un nombre para identificar el bot';
    if (trimmed.length > 64) return 'Máximo 64 caracteres';
    return null;
  };

  // On mount: surface bots that are already online so user can decide whether to add another.
  useEffect(() => {
    let alive = true;
    repo
      .list()
      .then((list) => {
        if (!alive) return;
        setExistingOnline(list.filter((c) => c.state === 'connected'));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Start: requires a name. Reuses ONLY in-flight (scanning/revision/connecting) sessions.
  // Already-`connected` rows are NOT auto-attached — user sees them in the existingOnline panel.
  const start = useCallback(async () => {
    const err = validateName(botName);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);
    setBusy(true);
    setCreateError(null);
    try {
      const list = await repo.list();
      // Reusable = something the user can finish pairing right now (NOT already-connected ones).
      const inFlight = list.find((c) => c.state === 'scanning' || c.state === 'revision' || c.state === 'connecting');
      if (inFlight) {
        setConn(inFlight);
      } else {
        const created = await repo.create(botName.trim());
        setConn(created);
      }
      setSeconds(QR_TTL);
    } catch (e) {
      setCreateError((e as { message?: string })?.message ?? 'Failed to start connection');
    } finally {
      setBusy(false);
    }
  }, [botName]);

  // Countdown only while scanning/revision. Reset whenever a new QR arrives.
  useEffect(() => {
    if (state !== 'scanning' && state !== 'revision') return;
    const i = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, [state]);

  useEffect(() => {
    if (qrDataUrl) setSeconds(QR_TTL);
  }, [qrDataUrl]);

  // Regenerate: backend restarts wwebjs on SAME row + resets counters.
  // No DELETE+POST → no orphan auth folders.
  const regenerate = useCallback(async () => {
    if (busy || !conn) return;
    setBusy(true);
    setCreateError(null);
    try {
      const refreshed = await repo.regenerate(conn.id);
      setConn(refreshed);
      setSeconds(QR_TTL);
    } catch (e) {
      setCreateError((e as { message?: string })?.message ?? 'Failed to regenerate');
    } finally {
      setBusy(false);
    }
  }, [busy, conn]);

  // Auto-regenerate when QR expires (countdown hits 0 while still scanning/revision).
  // Hard guards: must be scanning/revision AND have an actual qr loaded — otherwise we
  // could storm the backend on a stale local state that never received WS updates.
  useEffect(() => {
    if (busy) return;
    if (state !== 'scanning' && state !== 'revision') return;
    if (seconds !== 0) return;
    if (!qrDataUrl) return;
    void regenerate();
  }, [state, seconds, busy, qrDataUrl, regenerate]);

  const showStatePills = !!conn;

  return (
    <>
      <Topbar crumbs={['Bots', 'Connect']} />
      <div className="page page-narrow fade-in">
        <div className="page-h">
          <div>
            <h1>Connect a WhatsApp number</h1>
            <div className="sub">
              Scan the QR code with WhatsApp on the phone you want to use as a bot. The connection runs through your own session — we never store your messages.
            </div>
          </div>
          <div className="actions">
            {conn && (
              <button className="btn btn-secondary" onClick={regenerate} disabled={busy}>
                <Icon name="refresh" size={14} /> {busy ? 'Working…' : 'Regenerate'}
              </button>
            )}
          </div>
        </div>

        {!conn && existingOnline.length > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-online) 8%, var(--bg-subtle))',
              border: '1px solid color-mix(in srgb, var(--status-online) 25%, var(--border))',
              fontSize: 13,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span className="dot dot-online pulse" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--fg)', fontWeight: 550 }}>
                {existingOnline.length === 1 ? '1 bot ya conectado' : `${existingOnline.length} bots ya conectados`} · puedes agregar otro abajo
              </div>
              <div style={{ color: 'var(--fg-muted)', fontSize: 12, marginTop: 2 }}>
                {existingOnline.map((c) => `${c.name}${c.number ? ` (${c.number})` : ''}`).join(' · ')}
              </div>
            </div>
            <Link href="/bots" className="btn btn-secondary btn-sm">
              Ver bots
            </Link>
          </div>
        )}

        {createError && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
              color: 'var(--status-error)',
              fontSize: 13,
            }}
          >
            {createError}
          </div>
        )}

        <div className="qr-wrap">
          {/* QR Stage */}
          <div className="qr-stage">
            <div className="qr-frame">
              <div className="qr-corner tl" />
              <div className="qr-corner tr" />
              <div className="qr-corner bl" />
              <div className="qr-corner br" />

              <div
                className="qr-image-wrap"
                style={{
                  filter: state === 'connected' ? 'blur(2px) saturate(0)' : 'none',
                  transition: 'filter .3s',
                }}
              >
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="WhatsApp pairing QR" src={qrDataUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      filter: !conn ? 'blur(8px)' : 'none',
                      opacity: !conn ? 0.25 : 1,
                      transition: 'all .3s',
                    }}
                  >
                    <QrCode data={conn ? `wahub-pair-${conn.session_id}` : 'wahub-pair-pending'} size={248} />
                  </div>
                )}
              </div>

              {/* Pre-start: name input + CTA inside frame */}
              {!conn && !busy && (
                <div
                  className="qr-overlay"
                  style={{
                    background: 'linear-gradient(160deg, color-mix(in srgb, var(--brand-500) 8%, var(--bg-elevated)), var(--bg-elevated))',
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: 14,
                      boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--brand-500) 60%, transparent)',
                    }}
                  >
                    <Icon name="qr" size={28} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fg)', letterSpacing: '-0.01em' }}>Name your bot</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4, marginBottom: 14, maxWidth: 240, textAlign: 'center' }}>
                    Pick a label so you can identify this WhatsApp session later.
                  </div>
                  <div style={{ width: '100%', maxWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      className="input"
                      autoFocus
                      placeholder="e.g. Sales bot"
                      value={botName}
                      onChange={(e) => {
                        setBotName(e.target.value);
                        if (nameError) setNameError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void start();
                      }}
                      maxLength={64}
                      style={{ textAlign: 'center', fontWeight: 500 }}
                    />
                    {nameError && (
                      <div style={{ fontSize: 11.5, color: 'var(--status-error)', textAlign: 'center' }}>{nameError}</div>
                    )}
                    <button className="btn btn-brand" onClick={start} disabled={!botName.trim()}>
                      <Icon name="qr" size={14} /> Generate QR
                    </button>
                  </div>
                </div>
              )}

              {/* Spinner while POST in flight */}
              {!conn && busy && (
                <div
                  className="qr-overlay"
                  style={{ background: 'color-mix(in srgb, var(--bg-elevated) 96%, transparent)' }}
                >
                  <div className="qr-spinner" />
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg)' }}>Starting session…</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>Booting WhatsApp client</div>
                </div>
              )}

              {(state === 'scanning' || state === 'revision') && conn && <div className="qr-scan-line" />}

              {state === 'connecting' && (
                <div className="qr-overlay">
                  <div className="qr-spinner" />
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg)' }}>Connecting…</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 4 }}>Syncing session keys</div>
                </div>
              )}

              {state === 'connected' && (
                <div className="qr-overlay">
                  <div className="qr-success">
                    <Icon name="check" size={28} stroke={2.5} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--fg)', letterSpacing: '-0.01em' }}>
                    ¡Listo! Bot enlazado
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 6, maxWidth: 240, textAlign: 'center' }}>
                    Ya puedes enviar y recibir mensajes desde este número.
                  </div>
                  {(realtime.number ?? conn?.number) && (
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                      {realtime.number ?? conn?.number}
                    </div>
                  )}
                </div>
              )}
            </div>

            {conn && (
              <>
                <div className="qr-stage-title">
                  {state === 'scanning' && (
                    <>
                      <span className="dot dot-online pulse" /> Waiting for scan
                    </>
                  )}
                  {state === 'revision' && (
                    <>
                      <span className="dot dot-warn pulse" /> Re-pair required
                    </>
                  )}
                  {state === 'connecting' && <>Establishing session…</>}
                  {state === 'connected' && (
                    <>
                      <Icon name="check" size={14} stroke={2.5} style={{ color: 'var(--status-online)' }} /> Bot is now live
                    </>
                  )}
                </div>
                <div className="qr-stage-sub">
                  {(state === 'scanning' || state === 'revision') && (
                    <>
                      Code expires in <span className="mono">0:{String(seconds).padStart(2, '0')}</span>
                      {realtime.attempts > 0 && (
                        <span className="faint" style={{ marginLeft: 8 }}>
                          · attempt {realtime.attempts}
                        </span>
                      )}
                    </>
                  )}
                  {state === 'connecting' && <>Don&apos;t close this window</>}
                  {state === 'connected' && <>You can now send and receive messages from this number</>}
                </div>
              </>
            )}

            {showStatePills && (
              <div className="state-pills">
                <div className={`state-pill ${state === 'scanning' ? 'active' : 'done'}`}>
                  {state !== 'scanning' && <Icon name="check" size={11} stroke={2.5} />}
                  <span>1. Scan</span>
                </div>
                <div className={`state-pill ${state === 'connecting' ? 'active' : state === 'connected' ? 'done' : ''}`}>
                  {state === 'connected' && <Icon name="check" size={11} stroke={2.5} />}
                  <span>2. Pair</span>
                </div>
                <div className={`state-pill ${state === 'connected' ? 'done' : ''}`}>
                  {state === 'connected' && <Icon name="check" size={11} stroke={2.5} />}
                  <span>3. Online</span>
                </div>
              </div>
            )}

            {state === 'connected' && (
              <div style={{ marginTop: 32, display: 'flex', gap: 8, zIndex: 1 }}>
                <Link href="/bots" className="btn btn-brand btn-lg">
                  Configure bot <Icon name="arrow_right" size={14} />
                </Link>
                <button className="btn btn-secondary btn-lg" onClick={regenerate} disabled={busy}>
                  Connect another
                </button>
              </div>
            )}
          </div>

          {/* Side */}
          <div className="qr-side">
            <div className="card">
              <div className="card-h">
                <h3>How to scan</h3>
              </div>
              <div className="card-body">
                <div className="steps">
                  <div className="step">
                    <div className="step-num">1</div>
                    <div className="step-body">
                      Open <strong>WhatsApp</strong> on your phone
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">2</div>
                    <div className="step-body">
                      Go to <strong>Settings → Linked devices</strong>
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">3</div>
                    <div className="step-body">
                      Tap <strong>Link a device</strong> and point your camera at this code
                    </div>
                  </div>
                  <div className="step">
                    <div className="step-num">4</div>
                    <div className="step-body">Wait for the green check — your bot is ready</div>
                  </div>
                </div>
              </div>
            </div>

            {conn && (
              <div className="card">
                <div className="card-h">
                  <h3>Session details</h3>
                  <div className="actions">
                    <span className={`pill ${state === 'connected' ? 'pill-online' : 'pill-idle'}`}>
                      <span className={`dot ${state === 'connected' ? 'dot-online pulse' : 'dot-idle'}`} />
                      {state}
                    </span>
                  </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="contact-row" style={{ padding: '10px 16px' }}>
                    <span>Session ID</span>
                    <span className="v" title={conn.session_id}>
                      {conn.session_id.slice(0, 8)}…
                    </span>
                  </div>
                  <div className="contact-row" style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Bot name</span>
                    <span className="v">{conn.name}</span>
                  </div>
                  {(realtime.number ?? conn.number) && (
                    <div className="contact-row" style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <span>Number</span>
                      <span className="v">{realtime.number ?? conn.number}</span>
                    </div>
                  )}
                  <div className="contact-row" style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Realtime</span>
                    <span className="v" style={{ color: realtime.connected ? 'var(--status-online)' : 'var(--fg-muted)' }}>
                      {realtime.connected ? 'connected' : 'disconnected'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                background: 'color-mix(in srgb, var(--brand-500) 6%, var(--bg-subtle))',
                border: '1px solid color-mix(in srgb, var(--brand-500) 25%, var(--border))',
                fontSize: 12.5,
                color: 'var(--fg-muted)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ color: 'var(--brand-500)', flexShrink: 0, marginTop: 1 }}>
                <Icon name="sparkles" size={14} />
              </div>
              <div>
                <div style={{ color: 'var(--fg)', fontWeight: 550, marginBottom: 2 }}>Tip — use a dedicated number</div>
                We recommend a SIM you don&apos;t use personally. WhatsApp limits one active session per number.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
