'use client';
import { useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';

const AUDIENCES = [
  { id: 'all', l: 'All contacts', n: 8420 },
  { id: 'vip', l: 'VIP customers', n: 1240 },
  { id: 'new', l: 'New leads (last 30d)', n: 642 },
  { id: 'cart', l: 'Abandoned cart', n: 89 },
];

export const BroadcastScreen = () => {
  const [body, setBody] = useState(
    'Hola {{first_name}} 👋\n\nTenemos un 20% de descuento en toda la colección de invierno hasta este domingo. Usa el código *INVIERNO20* en tienda o responde a este mensaje y te ayudo.\n\n{{store_link}}',
  );
  const [audience, setAudience] = useState('vip');
  const selected = AUDIENCES.find((a) => a.id === audience)!;

  const previewBody = body
    .replace('{{first_name}}', 'María')
    .replace('{{store_link}}', 'lunaria.mx/promo')
    .replace(/\*([^*]+)\*/g, (_, t) => t);

  return (
    <>
      <Topbar crumbs={['Broadcast', 'New']} />
      <div className="page page-narrow fade-in">
        <div className="page-h">
          <div>
            <h1>New broadcast</h1>
            <div className="sub">Send a templated message to a segment of your contacts. Respects WhatsApp rate limits.</div>
          </div>
          <div className="actions">
            <button className="btn btn-secondary">Save draft</button>
            <button className="btn btn-brand">
              <Icon name="send" size={14} /> Schedule send
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div className="stack">
            <div className="card">
              <div className="card-h">
                <h3>1. From</h3>
              </div>
              <div className="card-body">
                <div className="field">
                  <label className="label">Send from connection</label>
                  <select className="input">
                    <option>Lunaría Boutique · +52 81 9988 1122</option>
                    <option>Acme Support · +52 55 1234 5678</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>2. Audience</h3>
                <div className="actions">
                  <span className="pill pill-brand mono">{selected.n.toLocaleString()} contacts</span>
                </div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {AUDIENCES.map((a, i) => (
                  <label
                    key={a.id}
                    className="row-between"
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderTop: i ? '1px solid var(--border-subtle)' : 'none',
                      background: audience === a.id ? 'var(--bg-hover)' : 'transparent',
                    }}
                  >
                    <div className="row" style={{ gap: 10 }}>
                      <input
                        type="radio"
                        checked={audience === a.id}
                        onChange={() => setAudience(a.id)}
                        style={{ accentColor: 'var(--brand-600)' }}
                      />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.l}</div>
                        <div style={{ fontSize: 12, color: 'var(--fg-faint)' }}>auto-segment</div>
                      </div>
                    </div>
                    <span className="mono faint" style={{ fontSize: 12.5 }}>
                      {a.n.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>3. Message</h3>
                <div className="actions">
                  <button className="btn btn-ghost btn-sm">
                    <Icon name="template" size={12} /> Templates
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <Icon name="image" size={12} /> Media
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="field">
                  <label className="label">Template variables</label>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {['{{first_name}}', '{{store_link}}', '{{order_id}}', '{{discount}}'].map((v) => (
                      <span key={v} className="tag" style={{ cursor: 'pointer' }}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label className="label">Body</label>
                  <textarea className="input" rows={9} value={body} onChange={(e) => setBody(e.target.value)} />
                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 11.5 }}>
                    <span className="muted">Markdown: *bold*, _italic_, ~strike~</span>
                    <span className="mono faint">{body.length} / 1024</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>4. Schedule</h3>
              </div>
              <div className="card-body">
                <div className="grid-2">
                  <div className="field">
                    <label className="label">Send at</label>
                    <input className="input mono" defaultValue="May 5, 2026 — 10:00 AM" />
                  </div>
                  <div className="field">
                    <label className="label">Throttle</label>
                    <select className="input">
                      <option>20 messages / minute (recommended)</option>
                      <option>40 messages / minute</option>
                      <option>Send as fast as possible</option>
                    </select>
                  </div>
                </div>
                <div
                  className="row"
                  style={{
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'color-mix(in srgb, var(--status-warn) 10%, var(--bg-subtle))',
                    border: '1px solid color-mix(in srgb, var(--status-warn) 25%, var(--border))',
                    fontSize: 12.5,
                    color: 'var(--fg-muted)',
                  }}
                >
                  <span style={{ color: 'var(--status-warn)' }}>
                    <Icon name="bell" size={14} />
                  </span>
                  Estimated delivery time: <strong style={{ color: 'var(--fg)' }}>~62 minutes</strong> at 20 msg/min.
                </div>
              </div>
            </div>
          </div>

          {/* Phone preview */}
          <div style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 13.5, fontWeight: 550 }}>Preview</h3>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  background: '#dad3cc',
                  padding: 14,
                  backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                  minHeight: 380,
                }}
              >
                <div
                  style={{
                    background: 'white',
                    padding: '8px 10px',
                    borderRadius: '0 12px 12px 12px',
                    marginRight: 30,
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: '#0a0a0b',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {previewBody}
                  <div
                    style={{
                      fontSize: 10,
                      color: '#999',
                      textAlign: 'right',
                      marginTop: 4,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    10:00 ✓✓
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 10, marginTop: 14, justifyContent: 'space-between' }}>
                <div>
                  <div className="mono faint" style={{ fontSize: 11 }}>
                    WHATSAPP COST
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>$24.80 USD</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono faint" style={{ fontSize: 11 }}>
                    RECIPIENTS
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.n.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
