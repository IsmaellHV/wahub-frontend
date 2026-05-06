'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@shared/UI/components/Icon';
import { Topbar } from '@shared/UI/components/Topbar';
import { useI18n } from '@shared/i18n/I18nProvider';
import { useCurrentUser } from '@acceso/usuarios/Application/useCurrentUser';
import { RepositoryConnectionImpl } from '@wsp/connections/Infrastructure/RepositoryImpl';
import type { IConnection } from '@wsp/connections/Domain/IConnection';

const connRepo = new RepositoryConnectionImpl();

export const DashboardScreen = () => {
  const { t } = useI18n();
  const user = useCurrentUser();
  const [connections, setConnections] = useState<IConnection[] | null>(null);

  useEffect(() => {
    let alive = true;
    connRepo
      .list()
      .then((list) => alive && setConnections(list))
      .catch(() => alive && setConnections([]));
    return () => {
      alive = false;
    };
  }, []);

  const total = connections?.length ?? 0;
  const connected = connections?.filter((c) => c.state === 'connected').length ?? 0;

  const displayName = user?.display_name?.trim() || user?.email?.split('@')[0] || '';
  const welcomeText = displayName
    ? t('dashboard.welcome').replace('{name}', displayName)
    : t('dashboard.welcomeFallback');

  return (
    <>
      <Topbar crumbs={[t('dashboard.crumbWorkspace'), t('dashboard.crumbDashboard')]} />
      <div className="page fade-in">
        <div className="page-h">
          <div>
            <h1>{t('dashboard.title')}</h1>
            <div className="sub">
              {welcomeText} — {t('dashboard.subtitleSuffix')}
            </div>
          </div>
          <div className="actions">
            <Link href="/connect" className="btn btn-brand">
              <Icon name="plus" size={14} /> {t('dashboard.connectCta')}
            </Link>
          </div>
        </div>

        {/* Stats — only `active sessions` is real; the rest are honest placeholders
            until the backend exposes aggregate endpoints. */}
        <div className="stat-grid">
          <StatCard
            label={t('dashboard.stats.activeSessions')}
            value={connections === null ? '—' : String(connected)}
            delta={connections === null ? '' : t('dashboard.stats.activeOf').replace('{n}', String(connected)).replace('{total}', String(total))}
            real
          />
          <StatCard label={t('dashboard.stats.messages24h')} value="—" delta={t('dashboard.stats.soon')} />
          <StatCard label={t('dashboard.stats.aiResponses')} value="—" delta={t('dashboard.stats.soon')} />
          <StatCard label={t('dashboard.stats.avgResponse')} value="—" delta={t('dashboard.stats.soon')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {/* Real session status from backend */}
          <div className="card">
            <div className="card-h">
              <h3>{t('dashboard.sessions.title')}</h3>
              <div className="actions">
                <Link href="/bots" className="btn btn-ghost btn-sm">
                  {t('dashboard.sessions.viewAll')}
                </Link>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {connections === null && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
                  {t('common.loading')}
                </div>
              )}
              {connections !== null && connections.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center' }}>
                  <div className="empty-icon" style={{ marginBottom: 8 }}>
                    <Icon name="bot" size={18} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginBottom: 14 }}>
                    {t('dashboard.sessions.empty')}
                  </div>
                  <Link href="/connect" className="btn btn-brand btn-sm">
                    <Icon name="plus" size={12} /> {t('dashboard.connectCta')}
                  </Link>
                </div>
              )}
              {connections?.slice(0, 5).map((c) => (
                <SessionRow key={c.id} c={c} />
              ))}
            </div>
          </div>

          {/* Quick actions — links to real flows */}
          <div className="card">
            <div className="card-h">
              <h3>{t('dashboard.quick.title')}</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <QuickAction href="/connect" icon="qr" h={t('dashboard.quick.connect.h')} s={t('dashboard.quick.connect.s')} />
              <QuickAction href="/messages" icon="send" h={t('dashboard.quick.send.h')} s={t('dashboard.quick.send.s')} />
              <QuickAction href="/api" icon="key" h={t('dashboard.quick.api.h')} s={t('dashboard.quick.api.s')} last />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  real?: boolean;
}

const StatCard = ({ label, value, delta, real }: StatCardProps) => (
  <div className="stat">
    <div className="label">{label}</div>
    <div className="value">{value}</div>
    {delta && (
      <div
        className="delta"
        style={
          real
            ? undefined
            : { color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500 }
        }
      >
        {delta}
      </div>
    )}
  </div>
);

const STATE_PILL: Record<IConnection['state'], { cls: string; label: string }> = {
  connected: { cls: 'online', label: 'connected' },
  scanning: { cls: 'warn', label: 'scanning' },
  revision: { cls: 'warn', label: 'revision' },
  connecting: { cls: 'warn', label: 'connecting' },
  idle: { cls: 'idle', label: 'idle' },
  disconnected: { cls: 'idle', label: 'disconnected' },
};

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
};

const SessionRow = ({ c }: { c: IConnection }) => {
  const pill = STATE_PILL[c.state];
  const dotPulse = c.state === 'connected' ? ' pulse' : '';
  return (
    <Link
      href={`/bots/${c.id}`}
      className="row"
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        gap: 12,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div className="bot-icon" style={{ width: 28, height: 28, fontSize: 11 }}>
        {initialsOf(c.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 550, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {c.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--fg-faint)', fontFamily: 'var(--font-mono)' }}>
          {c.number ?? c.code ?? c.session_id.slice(0, 12)}
        </div>
      </div>
      <span className={`pill pill-${pill.cls}`}>
        <span className={`dot dot-${pill.cls}${dotPulse}`} />
        {pill.label}
      </span>
    </Link>
  );
};

interface QuickActionProps {
  href: string;
  icon: IconName;
  h: string;
  s: string;
  last?: boolean;
}

const QuickAction = ({ href, icon, h, s, last }: QuickActionProps) => (
  <Link
    href={href}
    className="row"
    style={{
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      gap: 12,
      textDecoration: 'none',
      color: 'inherit',
      transition: 'background .12s',
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'color-mix(in srgb, var(--brand-500) 12%, transparent)',
        border: '1px solid color-mix(in srgb, var(--brand-500) 30%, transparent)',
        color: 'var(--brand-500)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={14} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 550, color: 'var(--fg)' }}>{h}</div>
      <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{s}</div>
    </div>
    <Icon name="arrow_right" size={14} style={{ color: 'var(--fg-faint)' }} />
  </Link>
);
