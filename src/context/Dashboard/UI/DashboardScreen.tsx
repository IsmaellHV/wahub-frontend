'use client';
import Link from 'next/link';
import { Icon, type IconName } from '@shared/UI/components/Icon';
import { Sparkline } from '@shared/UI/components/Sparkline';
import { Topbar } from '@shared/UI/components/Topbar';
import { MOCK_BOTS } from '@wsp/bots/Infrastructure/mockBots';
import { BigChart } from './BigChart';

interface ActivityItem {
  t: string;
  msg: string;
  kind: 'ai' | 'send' | 'user' | 'warn' | 'webhook';
  bot: string;
}

const ACTIVITY: ActivityItem[] = [
  { t: '2m', msg: 'AI handled conversation with María González', kind: 'ai', bot: 'Lunaría' },
  { t: '8m', msg: 'New broadcast "Promo May" sent to 1,240 contacts', kind: 'send', bot: 'Acme' },
  { t: '14m', msg: 'Sofía Ramírez requested human handoff', kind: 'user', bot: 'Acme' },
  { t: '26m', msg: 'Bot SkyRide reconnected after 12s downtime', kind: 'warn', bot: 'SkyRide' },
  { t: '1h', msg: 'API webhook delivered: order.created → /hooks/orders', kind: 'webhook', bot: '—' },
];

const ACTIVITY_ICON: Record<ActivityItem['kind'], IconName> = {
  ai: 'sparkles',
  send: 'send',
  user: 'user',
  warn: 'bell',
  webhook: 'webhook',
};

export const DashboardScreen = () => {
  const stats = [
    { label: 'Active bots', value: '5', delta: '+2 this week', up: true, spark: [3, 3, 3, 4, 4, 5, 5] },
    { label: 'Messages 24h', value: '25,950', delta: '+12.4%', up: true, spark: [120, 180, 220, 200, 260, 310, 290, 340, 380, 410, 450, 440] },
    { label: 'AI responses', value: '18,221', delta: '70.2% rate', up: true, spark: [40, 55, 60, 80, 90, 110, 140, 170, 200, 210, 240, 260] },
    { label: 'Avg. response', value: '1.4s', delta: '−0.3s', up: true, spark: [3, 2.8, 2.5, 2.2, 2, 1.8, 1.6, 1.5, 1.4, 1.4, 1.4, 1.4] },
  ];

  const intents = [
    { label: 'Pricing question', n: 1842, pct: 100 },
    { label: 'Order status', n: 1206, pct: 65 },
    { label: 'Schedule appointment', n: 824, pct: 45 },
    { label: 'Product availability', n: 612, pct: 33 },
    { label: 'Support / complaint', n: 298, pct: 16 },
    { label: 'Refund request', n: 142, pct: 8 },
  ];

  return (
    <>
      <Topbar crumbs={['Workspace', 'Dashboard']} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>Dashboard</h1>
            <div className="sub">Welcome back, Diego — here&apos;s what&apos;s happening across your bots.</div>
          </div>
          <div className="actions">
            <button className="btn btn-secondary">
              <Icon name="download" size={14} /> Export
            </button>
            <Link href="/connect" className="btn btn-brand">
              <Icon name="plus" size={14} /> Connect WhatsApp
            </Link>
          </div>
        </div>

        <div className="stat-grid">
          {stats.map((s, i) => (
            <div className="stat" key={i}>
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
              <div className={`delta ${s.up ? 'up' : 'down'}`}>{s.delta}</div>
              <Sparkline data={s.spark} />
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-h">
              <h3>Message volume</h3>
              <div className="actions">
                <button className="btn btn-ghost btn-sm">24h</button>
                <button className="btn btn-secondary btn-sm">7d</button>
                <button className="btn btn-ghost btn-sm">30d</button>
              </div>
            </div>
            <div className="card-body">
              <BigChart />
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>Bot status</h3>
              <div className="actions">
                <Link href="/bots" className="btn btn-ghost btn-sm">
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {MOCK_BOTS.slice(0, 4).map((b) => (
                <div key={b.id} className="row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', gap: 12 }}>
                  <div className="bot-icon" style={{ width: 28, height: 28, fontSize: 11 }}>
                    {b.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>{b.number}</div>
                  </div>
                  <span className={`pill pill-${b.status === 'online' ? 'online' : b.status === 'warn' ? 'warn' : 'idle'}`}>
                    <span className={`dot dot-${b.status === 'online' ? 'online pulse' : b.status === 'warn' ? 'warn' : 'idle'}`} />
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="card">
            <div className="card-h">
              <h3>Recent activity</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {ACTIVITY.map((a, i) => (
                <div
                  key={i}
                  className="row"
                  style={{ padding: '11px 16px', borderBottom: '1px solid var(--border-subtle)', gap: 12, fontSize: 13 }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'var(--bg-muted)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--fg-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={ACTIVITY_ICON[a.kind]} size={12} />
                  </div>
                  <span style={{ flex: 1, color: 'var(--fg-muted)' }}>{a.msg}</span>
                  <span className="mono faint" style={{ fontSize: 11 }}>
                    {a.bot}
                  </span>
                  <span className="mono faint" style={{ fontSize: 11, width: 32, textAlign: 'right' }}>
                    {a.t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>Top intents (last 24h)</h3>
              <div className="actions">
                <span className="pill pill-brand">
                  <Icon name="sparkles" size={10} /> AI
                </span>
              </div>
            </div>
            <div className="card-body">
              {intents.map((r, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div className="row-between" style={{ marginBottom: 4, fontSize: 12.5 }}>
                    <span>{r.label}</span>
                    <span className="mono faint">{r.n.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: r.pct + '%',
                        background: 'linear-gradient(90deg, var(--brand-500), var(--brand-400))',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
