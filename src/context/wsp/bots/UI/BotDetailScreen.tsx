'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';
import { BigChart } from '@Dashboard/UI/BigChart';
import { MOCK_BOTS } from '../Infrastructure/mockBots';
import type { IBot } from '../Domain/IBot';

type Tab = 'overview' | 'config' | 'AI' | 'logs' | 'webhooks';

interface Props {
  botId: string;
}

const BEHAVIOR = [
  { k: 'AI auto-reply', d: 'Use Claude to handle conversations', on: true },
  { k: 'Read receipts', d: 'Mark messages as read', on: true },
  { k: 'Typing indicator', d: 'Show "typing..." while bot composes', on: true },
  { k: 'Human handoff', d: 'Transfer when AI is uncertain', on: true },
  { k: 'Out-of-hours autoresponder', d: 'Reply with hours when offline', on: false },
];

const LOGS = [
  { ts: '14:09:42', l: 'ok' as const, m: 'message sent → +52 55 1234 5678' },
  { ts: '14:09:39', l: 'info' as const, m: 'ai → generated reply (1.2s, 142 tok)' },
  { ts: '14:09:38', l: 'info' as const, m: 'message received ← <em>"A las 10am estoy ahí"</em>' },
  { ts: '14:09:12', l: 'ok' as const, m: 'message sent → +52 55 1234 5678' },
  { ts: '14:09:08', l: 'info' as const, m: 'tool → <em>products.search("botas Sierra negras 25")</em>' },
  { ts: '14:09:02', l: 'info' as const, m: 'ai → generated reply (1.4s, 98 tok)' },
  { ts: '14:09:01', l: 'info' as const, m: 'message received ← <em>"Negras, talla 25"</em>' },
  { ts: '14:08:23', l: 'warn' as const, m: 'rate limit warning: 89/100 msg/min' },
  { ts: '14:08:14', l: 'ok' as const, m: 'message sent → +52 81 8765 4321' },
  { ts: '14:08:11', l: 'info' as const, m: 'webhook delivered → /hooks/conversation.created (200)' },
  { ts: '14:08:11', l: 'info' as const, m: 'new conversation started: conv_a8f2b1' },
  { ts: '14:08:10', l: 'info' as const, m: 'message received ← <em>"¿Tienen disponible la talla M?"</em>' },
  { ts: '14:07:55', l: 'error' as const, m: 'tool → <em>orders.lookup</em> failed: timeout (3000ms)' },
  { ts: '14:07:42', l: 'ok' as const, m: 'session heartbeat ok' },
];

const WEBHOOKS = [
  { url: 'https://api.acme.com/hooks/whatsapp', events: 'message.received, message.sent', s: 'online' },
  { url: 'https://acme.zapier.com/hooks/wahub-orders', events: 'conversation.created', s: 'online' },
];

export const BotDetailScreen = ({ botId }: Props) => {
  const b: IBot = MOCK_BOTS.find((x) => x.id === botId) ?? MOCK_BOTS[0];
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <>
      <Topbar crumbs={['Conexiones', b.name]} />
      <div className="page fade-in">
        <div className="page-h">
          <Link href="/bots" className="icon-btn" style={{ marginRight: 4 }}>
            <Icon name="chevron_left" size={16} />
          </Link>
          <div className="row" style={{ gap: 14 }}>
            <div className="bot-icon" style={{ width: 40, height: 40, fontSize: 14 }}>
              {b.initials}
            </div>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {b.name}
                <span className={`pill pill-${b.status === 'online' ? 'online' : b.status === 'warn' ? 'warn' : 'idle'}`}>
                  <span className={`dot dot-${b.status === 'online' ? 'online pulse' : b.status === 'warn' ? 'warn' : 'idle'}`} />
                  {b.status}
                </span>
              </h1>
              <div className="sub mono" style={{ fontSize: 12.5 }}>
                {b.number} · {b.id}
              </div>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-secondary">
              <Icon name="pause" size={13} /> Pause
            </button>
            <button className="btn btn-secondary">
              <Icon name="settings" size={13} />
            </button>
          </div>
        </div>

        <div className="tabs">
          {(['overview', 'config', 'AI', 'logs', 'webhooks'] as Tab[]).map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div>
            <div className="stat-grid">
              <div className="stat">
                <div className="label">Conversations</div>
                <div className="value">{b.conv.toLocaleString()}</div>
                <div className="delta up">+18 today</div>
              </div>
              <div className="stat">
                <div className="label">Messages 24h</div>
                <div className="value">{b.msg24.toLocaleString()}</div>
                <div className="delta up">+12.4%</div>
              </div>
              <div className="stat">
                <div className="label">AI accuracy</div>
                <div className="value">94.2%</div>
                <div className="delta up">+1.1%</div>
              </div>
              <div className="stat">
                <div className="label">Avg. response</div>
                <div className="value">1.4s</div>
                <div className="delta up">−0.2s</div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>Activity (last 24 hours)</h3>
              </div>
              <div className="card-body">
                <BigChart />
              </div>
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-h">
                <h3>Identity</h3>
              </div>
              <div className="card-body">
                <div className="field">
                  <label className="label">Connection name</label>
                  <input className="input" defaultValue={b.name} />
                </div>
                <div className="field">
                  <label className="label">WhatsApp number</label>
                  <input className="input mono" defaultValue={b.number} disabled />
                </div>
                <div className="field">
                  <label className="label">Greeting message</label>
                  <textarea
                    className="input"
                    rows={3}
                    defaultValue="¡Hola! 👋 Soy el asistente de Acme. ¿En qué te puedo ayudar?"
                  />
                </div>
                <div className="field">
                  <label className="label">Business hours</label>
                  <div className="row" style={{ gap: 8 }}>
                    <input className="input mono" defaultValue="09:00" style={{ width: 100 }} />
                    <span className="muted">to</span>
                    <input className="input mono" defaultValue="20:00" style={{ width: 100 }} />
                    <span className="muted">CST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-h">
                <h3>Behavior</h3>
              </div>
              <div className="card-body">
                {BEHAVIOR.map((s, i) => (
                  <div
                    key={i}
                    className="row-between"
                    style={{ padding: '10px 0', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.k}</div>
                      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s.d}</div>
                    </div>
                    <div className={`switch ${s.on ? 'on' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'AI' && (
          <div className="card">
            <div className="card-h">
              <h3>
                <Icon name="sparkles" size={14} /> AI assistant
              </h3>
              <div className="actions">
                <span className="pill pill-brand">claude-haiku-4-5</span>
              </div>
            </div>
            <div className="card-body">
              <div className="field">
                <label className="label">System prompt</label>
                <textarea
                  className="input mono"
                  rows={8}
                  style={{ fontSize: 12.5, lineHeight: 1.6 }}
                  defaultValue={`You are the WhatsApp assistant for ${b.name}.\n\n- Tone: warm, concise, helpful. Use emoji sparingly.\n- Language: respond in the customer's language (Spanish/English).\n- When unsure, ask one clarifying question.\n- For pricing, refer to the product catalog tool.\n- Hand off to a human agent for: refunds, complaints, custom orders.`}
                />
              </div>
              <div className="grid-3">
                <div className="field">
                  <label className="label">Temperature</label>
                  <input className="input mono" defaultValue="0.3" />
                </div>
                <div className="field">
                  <label className="label">Max tokens</label>
                  <input className="input mono" defaultValue="512" />
                </div>
                <div className="field">
                  <label className="label">Tools enabled</label>
                  <input className="input" defaultValue="catalog, orders, calendar" />
                </div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-brand">Save changes</button>
                <button className="btn btn-secondary">
                  <Icon name="play" size={13} /> Test in playground
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="card">
            <div className="card-h">
              <h3>Live logs</h3>
              <div className="actions">
                <span className="pill pill-online">
                  <span className="dot dot-online pulse" /> streaming
                </span>
                <button className="btn btn-ghost btn-sm">
                  <Icon name="download" size={12} /> Export
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="log-stream">
                {LOGS.map((line, i) => (
                  <div key={i} className="log-line">
                    <span className="ts">{line.ts}</span>
                    <span className={`lvl ${line.l}`}>{line.l.toUpperCase()}</span>
                    <span className="msg" dangerouslySetInnerHTML={{ __html: line.m }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'webhooks' && (
          <div className="card">
            <div className="card-h">
              <h3>Webhooks</h3>
              <div className="actions">
                <button className="btn btn-secondary btn-sm">
                  <Icon name="plus" size={12} /> Add endpoint
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {WEBHOOKS.map((w, i) => (
                <div key={i} style={{ padding: '14px 16px', borderTop: i ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div className="row-between">
                    <div>
                      <div className="mono" style={{ fontSize: 13 }}>
                        {w.url}
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {w.events}
                      </div>
                    </div>
                    <span className="pill pill-online">
                      <span className="dot dot-online pulse" /> {w.s}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
