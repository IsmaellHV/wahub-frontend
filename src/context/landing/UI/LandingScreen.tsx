'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@shared/i18n/I18nProvider';
import { Icon, type IconName } from '@shared/UI/components/Icon';
import { Logo } from '@shared/UI/components/Logo';
import { useTheme } from '@shared/UI/ThemeProvider';
import { AdapterStorage, STORAGE_KEYS } from '@shared/Infrastructure/AdapterStorage';
import Link from 'next/link';
import './landing.css';

export const LandingScreen = () => {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Si ya hay sesion activa, redirigir directo al dashboard. Evita que el
  // usuario logueado vea la landing publica al pegarle al logo o al root.
  useEffect(() => {
    const token = AdapterStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="landing">
      <div className="land-inner">
        <LandNav theme={theme} toggleTheme={toggleTheme} locale={locale} setLocale={setLocale} t={t} />
        <LandHero t={t} />
        <LandWorkflow t={t} />
        <LandAudience t={t} />
        <LandCTA t={t} />
        <LandFooter t={t} />
      </div>
    </div>
  );
};

// ---------- NAV ----------
interface NavProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  locale: 'en' | 'es';
  setLocale: (l: 'en' | 'es') => void;
  t: (k: string) => string;
}

const LandNav = ({ theme, toggleTheme, locale, setLocale, t }: NavProps) => (
  <nav className="land-nav">
    <Link href="/" className="land-brand">
      <Logo size={28} animated />
      <span>waHub</span>
    </Link>
    <div className="land-nav-links">
      <a href="#workflow">{t('landing.nav.product')}</a>
      <a href="#use-cases">{t('landing.nav.useCases')}</a>
    </div>
    <div className="land-nav-actions">
      <a href="https://github.com/IsmaellHV/wahub-frontend" target="_blank" rel="noopener" className="land-nav-btn">
        <Icon name="github" size={14} /> <span>{t('landing.nav.github')}</span>
      </a>
      <button className="land-nav-icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
      </button>
      <button className="land-nav-btn" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}>
        {locale === 'es' ? 'EN' : 'ES'}
      </button>
      <Link href="/login" className="land-nav-btn">
        {t('landing.nav.login')}
      </Link>
      <Link href="/signup" className="land-nav-cta">
        {t('landing.nav.signup')}
      </Link>
    </div>
  </nav>
);

// ---------- HERO ----------
const LandHero = ({ t }: { t: (k: string) => string }) => (
  <section className="land-section land-hero">
    <div className="land-hero-text">
      <span className="land-eyebrow">
        <span className="dot" /> {t('landing.hero.pill')} <Icon name="arrow_right" size={12} />
      </span>
      <h1 className="land-h1">
        {t('landing.hero.titlePre')}
        <br />
        {t('landing.hero.titleAuto')} <span className="green">{t('landing.hero.titleAccent')}</span>
      </h1>
      <p className="land-lead">{t('landing.hero.subtitle')}</p>
      <div className="hero-ctas">
        <Link href="/signup" className="btn-green">
          {t('landing.hero.ctaPrimary')} <Icon name="arrow_right" size={15} />
        </Link>
        <Link href="/login" className="btn-outline">
          {t('landing.hero.ctaSecondary')}
        </Link>
      </div>
      <div className="hero-badges">
        <span className="hero-badge">
          <span className="ico">
            <Icon name="check" size={13} stroke={2.5} />
          </span>{' '}
          {t('landing.hero.badges.noCard')}
        </span>
        <span className="hero-badge">
          <span className="ico">
            <Icon name="sparkles" size={13} />
          </span>{' '}
          {t('landing.hero.badges.fast')}
        </span>
        <span className="hero-badge">
          <span className="ico">
            <Icon name="github" size={13} />
          </span>{' '}
          {t('landing.hero.badges.open')}
        </span>
      </div>
      <HeroFeatures t={t} />
    </div>
    <HeroVisual t={t} />
  </section>
);

const HeroFeatures = ({ t }: { t: (k: string) => string }) => {
  const items: { icon: IconName; key: string }[] = [
    { icon: 'sparkles', key: 'ai' },
    { icon: 'code', key: 'api' },
    { icon: 'webhook', key: 'webhooks' },
    { icon: 'chat', key: 'inbox' },
    { icon: 'flow', key: 'multi' },
  ];
  return (
    <div className="hero-features">
      {items.map((it) => (
        <div className="hero-feature" key={it.key}>
          <span className="ico">
            <Icon name={it.icon} size={18} />
          </span>
          <span className="lbl">{t(`landing.hero.features.${it.key}.lbl`)}</span>
          <span className="sub">{t(`landing.hero.features.${it.key}.sub`)}</span>
        </div>
      ))}
    </div>
  );
};

const HeroVisual = ({ t }: { t: (k: string) => string }) => (
  <div className="land-hero-visual">
    <div className="glow-orb" />
    <div className="phone-mock">
      <div className="phone-mock-screen">
        <div className="phone-statusbar">
          <span>9:41</span>
          <span className="phone-statusbar-icons">●●● ▲ ▮</span>
        </div>
        <div className="phone-chat-header">
          <button style={{ color: 'var(--land-fg-muted)', display: 'flex', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="back">
            <Icon name="chevron_left" size={18} />
          </button>
          <div className="av">w.</div>
          <div>
            <div className="name">
              {t('landing.hero.visual.chatTitle')}
              <span className="verify">
                <Icon name="check" size={12} stroke={2.8} />
              </span>
            </div>
            <div className="sub">{t('landing.hero.visual.chatSub')}</div>
          </div>
        </div>
        <div className="phone-messages">
          <div className="phone-msg in">
            {t('landing.hero.visual.msg1')} <div className="time">9:41 AM</div>
          </div>
          <div className="phone-msg out">
            {t('landing.hero.visual.msg2')} <div className="time">9:41 AM</div>
          </div>
          <div className="phone-msg in">
            {t('landing.hero.visual.msg3')} <div className="time">9:41 AM</div>
          </div>
          <div className="phone-product-card">
            <div className="thumb">
              <Icon name="sparkles" size={18} />
            </div>
            <div>
              <div className="pname">{t('landing.hero.visual.productName')}</div>
              <div className="pdesc">{t('landing.hero.visual.productDesc')}</div>
              <div className="pprice">{t('landing.hero.visual.productPrice')}</div>
            </div>
          </div>
        </div>
        <div className="phone-composer">
          <span className="ico">
            <Icon name="plus" size={16} />
          </span>
          <span className="input-fake">{t('landing.hero.visual.composer')}</span>
          <span className="ico">
            <Icon name="phone" size={14} />
          </span>
        </div>
      </div>
    </div>

    {/* Floating card: AI flow */}
    <div className="float-card fc-flow">
      <div className="fc-title">{t('landing.hero.visual.flowTitle')}</div>
      {(['message', 'ai', 'send', 'webhook'] as const).map((step) => (
        <FlowStep key={step} icon={step === 'message' ? 'chat' : step === 'ai' ? 'sparkles' : step === 'send' ? 'send' : 'webhook'} lbl={t(`landing.hero.visual.flowSteps.${step}.lbl`)} sub={t(`landing.hero.visual.flowSteps.${step}.sub`)} />
      ))}
    </div>

    {/* Floating card: Leads */}
    <div className="float-card fc-leads">
      <div className="fc-title">{t('landing.hero.visual.leadsTitle')}</div>
      <div>
        <span className="fc-num">{t('landing.hero.visual.leadsValue')}</span>
        <span className="fc-delta">{t('landing.hero.visual.leadsDelta')}</span>
      </div>
      <svg viewBox="0 0 200 50" style={{ width: '100%', marginTop: 10 }}>
        <path d="M0,40 Q20,30 40,32 T80,20 T120,28 T160,12 T200,8" fill="none" stroke="#2dd66c" strokeWidth="1.8" />
        <path d="M0,40 Q20,30 40,32 T80,20 T120,28 T160,12 T200,8 L200,50 L0,50 Z" fill="#2dd66c" opacity="0.15" />
      </svg>
    </div>

    {/* Floating card: Performance donut */}
    <div className="float-card fc-perf">
      <div className="fc-title">{t('landing.hero.visual.perfTitle')}</div>
      <div className="donut-row">
        <div className="donut">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="#2dd66c" strokeWidth="6" strokeDasharray={`${68 * 1.633} 200`} strokeDashoffset="0" transform="rotate(-90 32 32)" strokeLinecap="round" />
          </svg>
          <div className="donut-label">68%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="stat-mini">
            <span className="lbl">{t('landing.hero.visual.perfSent')}</span>
            <span className="v">12.4K</span>
          </div>
          <div className="stat-mini">
            <span className="lbl">{t('landing.hero.visual.perfDelivered')}</span>
            <span className="v">8.4K</span>
          </div>
          <div className="stat-mini">
            <span className="lbl">{t('landing.hero.visual.perfReplied')}</span>
            <span className="v">2.1K</span>
          </div>
        </div>
      </div>
    </div>

    {/* Floating tag */}
    <div className="float-card fc-tag">
      <div className="ico">
        <Icon name="phone" size={16} />
      </div>
      <div className="txt">
        <strong>{t('landing.hero.visual.tagStrong')}</strong>
        <span>{t('landing.hero.visual.tagSub')}</span>
      </div>
    </div>
  </div>
);

const FlowStep = ({ icon, lbl, sub }: { icon: IconName; lbl: string; sub: string }) => (
  <div className="flow-step">
    <span className="ico">
      <Icon name={icon} size={12} />
    </span>
    <div>
      <div className="lbl">{lbl}</div>
      <div className="sub">{sub}</div>
    </div>
  </div>
);

// ---------- WORKFLOW ----------
const LandWorkflow = ({ t }: { t: (k: string) => string }) => {
  const steps = [1, 2, 3, 4, 5] as const;
  return (
    <section className="land-section" id="workflow">
      <div className="workflow-head">
        <span className="land-eyebrow">
          <span className="dot" /> {t('landing.workflow.eyebrow')}
        </span>
        <h2 className="land-h2">
          {t('landing.workflow.title')} <span className="green">{t('landing.workflow.titleAccent')}</span>
        </h2>
        <p className="land-lead" style={{ textAlign: 'center', maxWidth: 600 }}>
          {t('landing.workflow.lead')}
        </p>
      </div>

      <div className="workflow-track">
        {steps.map((n) => (
          <div className="workflow-step-head" key={n}>
            <div className="num">{n}</div>
            <h3>{t(`landing.workflow.steps.s${n}.h`)}</h3>
            <p>{t(`landing.workflow.steps.s${n}.p`)}</p>
          </div>
        ))}
      </div>

      <div className="workflow-cards">
        {/* Card 1: QR */}
        <div className="land-card">
          <div className="land-card-head">
            <span className="ico">
              <Icon name="qr" size={13} />
            </span>{' '}
            {t('landing.workflow.cards.qr.head')}
          </div>
          <div className="qr-mini-wrap">
            <div className="desc">{t('landing.workflow.cards.qr.desc')}</div>
            <div className="qr-mini">
              <MiniQr size={120} />
            </div>
            <div className="connected-pill">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--land-green)', boxShadow: '0 0 6px var(--land-glow)' }} />
              {t('landing.workflow.cards.qr.pill')}
            </div>
          </div>
        </div>

        {/* Card 2: Agent */}
        <div className="land-card">
          <div className="land-card-head">
            <span className="ico">
              <Icon name="sparkles" size={13} />
            </span>{' '}
            {t('landing.workflow.cards.agent.head')}
          </div>
          <FieldRow
            label={t('landing.workflow.cards.agent.labels.name')}
            value={
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {t('landing.workflow.cards.agent.name')} <Icon name="sparkles" size={12} style={{ color: 'var(--land-green)' }} />
              </span>
            }
          />
          <FieldRow label={t('landing.workflow.cards.agent.labels.tone')} value={t('landing.workflow.cards.agent.tone')} chevron />
          <FieldRow label={t('landing.workflow.cards.agent.labels.model')} value={t('landing.workflow.cards.agent.model')} chevron />
          <FieldRow label={t('landing.workflow.cards.agent.labels.lang')} value={t('landing.workflow.cards.agent.lang')} chevron last />
        </div>

        {/* Card 3: Conversation flow */}
        <div className="land-card">
          <div className="land-card-head">
            <span className="ico">
              <Icon name="chat" size={13} />
            </span>{' '}
            {t('landing.workflow.cards.flow.head')}
          </div>
          <div className="fake-chat">
            <div className="fake-msg in">
              {t('landing.workflow.cards.flow.msgIn')}
              <div className="t">{t('landing.workflow.cards.flow.msgInTime')}</div>
            </div>
            <div className="fake-msg out">
              {t('landing.workflow.cards.flow.msgOut')}
              <div className="t">{t('landing.workflow.cards.flow.msgOutTime')}</div>
            </div>
            <div className="ai-handled">
              <div className="h">{t('landing.workflow.cards.flow.aiTitle')}</div>
              {[0, 1, 2].map((i) => (
                <div className="li" key={i}>
                  <span className="ico">
                    <Icon name="check" size={11} stroke={2.5} />
                  </span>
                  {t(`landing.workflow.cards.flow.aiSteps.${i}`)}
                </div>
              ))}
            </div>
            <div className="bot-orb">
              <Icon name="sparkles" size={16} />
            </div>
          </div>
        </div>

        {/* Card 4: API */}
        <div className="land-card">
          <div className="land-card-head">
            <span className="ico">
              <Icon name="code" size={13} />
            </span>{' '}
            {t('landing.workflow.cards.api.head')}
          </div>
          <div className="land-field">
            <div className="land-field-label">Endpoint</div>
            <div className="land-field-input" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              {t('landing.workflow.cards.api.endpoint')}
            </div>
          </div>
          <div className="land-field">
            <div className="land-field-label">curl</div>
            <div className="land-field-input" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t('landing.workflow.cards.api.curl')}
            </div>
          </div>
          <div className="lead-info" style={{ marginTop: 4 }}>
            <div className="row">
              <span className="k">{t('landing.workflow.cards.api.status')}</span>
              <span className="v tag">{t('landing.workflow.cards.api.sent')}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Scale */}
        <div className="land-card">
          <div className="land-card-head">
            <span className="ico">
              <Icon name="chart" size={13} />
            </span>{' '}
            {t('landing.workflow.cards.scale.head')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--land-fg-muted)' }}>{t('landing.workflow.cards.scale.metric')}</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', fontFeatureSettings: '"tnum"', color: 'var(--land-fg)' }}>
                12,842 <span style={{ color: 'var(--land-green)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{t('landing.workflow.cards.scale.delta')}</span>
              </div>
            </div>
            <div className="land-field-input" style={{ padding: '4px 8px', fontSize: 10.5 }}>
              {t('landing.workflow.cards.scale.range')} <Icon name="chevron_down" size={10} />
            </div>
          </div>
          <svg viewBox="0 0 200 60" className="scale-chart">
            <defs>
              <linearGradient id="scaleGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2dd66c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2dd66c" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,50 Q20,45 40,42 T80,30 T120,32 T160,18 T200,10" fill="none" stroke="#2dd66c" strokeWidth="1.5" />
            <path d="M0,50 Q20,45 40,42 T80,30 T120,32 T160,18 T200,10 L200,60 L0,60 Z" fill="url(#scaleGrad)" />
          </svg>
          <div className="scale-stats">
            {(['sessions', 'response', 'uptime'] as const).map((s) => {
              const icon: IconName = s === 'sessions' ? 'flow' : s === 'response' ? 'sparkles' : 'check';
              return (
                <div className="scale-stat" key={s}>
                  <span className="l">
                    <Icon name={icon} size={11} /> {t(`landing.workflow.cards.scale.stats.${s}.l`)}
                  </span>
                  <span>
                    <span className="v">{t(`landing.workflow.cards.scale.stats.${s}.v`)}</span>
                    <span className="delta"> {t(`landing.workflow.cards.scale.stats.${s}.delta`)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="trust-strip">
        {(['keys', 'noCode', 'open', 'scale'] as const).map((k) => {
          const icon: IconName = k === 'keys' ? 'key' : k === 'noCode' ? 'sparkles' : k === 'open' ? 'github' : 'chart';
          return (
            <div className="trust-item" key={k}>
              <div className="ico">
                <Icon name={icon} size={16} />
              </div>
              <div>
                <div className="h">{t(`landing.trust.${k}.h`)}</div>
                <div className="s">{t(`landing.trust.${k}.s`)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const FieldRow = ({ label, value, chevron, last }: { label: string; value: React.ReactNode; chevron?: boolean; last?: boolean }) => (
  <div className="land-field" style={last ? { marginBottom: 0 } : undefined}>
    <div className="land-field-label">{label}</div>
    <div className="land-field-input">
      {value}
      {chevron && <Icon name="chevron_down" size={12} />}
    </div>
  </div>
);

// Tiny static QR-ish pattern for the workflow card. Deterministic so it
// doesn't trigger SSR/CSR mismatch like Math.random would.
const QR_BITS = [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0];
const MiniQr = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges" style={{ display: 'block' }}>
    {QR_BITS.map((bit, i) => (bit ? <rect key={i} x={i % 8} y={Math.floor(i / 8)} width={1} height={1} fill="#000" /> : null))}
  </svg>
);

// ---------- AUDIENCE ----------
const LandAudience = ({ t }: { t: (k: string) => string }) => {
  const cases: { key: string; emoji: string }[] = [
    { key: 'agencies', emoji: '🏢' },
    { key: 'local', emoji: '🏪' },
    { key: 'sales', emoji: '💼' },
    { key: 'support', emoji: '🎧' },
    { key: 'builders', emoji: '🛠️' },
  ];
  return (
    <section className="land-section" id="use-cases">
      <div className="audience">
        <div className="audience-text">
          <span className="land-eyebrow">
            <span className="dot" /> {t('landing.audience.eyebrow')}
          </span>
          <h2 className="land-h2">
            {t('landing.audience.title')}
            <br />
            <span className="green">{t('landing.audience.titleAccent')}</span>
          </h2>
          <p className="land-lead">{t('landing.audience.lead')}</p>
        </div>
        <MockStack t={t} />
      </div>

      <div className="usecase-grid">
        {cases.map((c) => (
          <div className="usecase-card" key={c.key}>
            <div className="usecase-emoji">{c.emoji}</div>
            <h3>{t(`landing.audience.cases.${c.key}.h`)}</h3>
            <p>{t(`landing.audience.cases.${c.key}.p`)}</p>
            <div className="usecase-arrow">
              <Icon name="arrow_right" size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const MockStack = ({ t }: { t: (k: string) => string }) => (
  <div className="mock-stack">
    <div className="mock-glow" />
    <div className="mock-panel mock-stat">
      <div className="h">{t('landing.hero.visual.leadsTitle')}</div>
      <div>
        <span className="v">2,842</span>
        <span className="delta">+2.2%</span>
      </div>
      <svg viewBox="0 0 180 40" style={{ width: '100%' }}>
        <path d="M0,30 Q20,25 40,28 T80,20 T120,22 T160,8 T180,5" fill="none" stroke="#2dd66c" strokeWidth="1.5" />
      </svg>
    </div>
    <div className="mock-panel mock-auto">
      <span className="pulse-dot" />
      <div>
        <div className="h">Realtime</div>
        <div className="s">All systems running</div>
      </div>
    </div>
    <div className="mock-panel mock-nav">
      <div className="mock-nav-head">
        <div className="mark">w.</div>
        <div className="name">waHub</div>
      </div>
      <div className="mock-nav-item active">
        <Icon name="home" size={12} /> Dashboard
      </div>
      <div className="mock-nav-item">
        <Icon name="qr" size={12} /> Connect
      </div>
      <div className="mock-nav-item">
        <Icon name="bot" size={12} /> Sessions <span className="badge">3</span>
      </div>
      <div className="mock-nav-item">
        <Icon name="chat" size={12} /> Inbox <span className="badge">24</span>
      </div>
      <div className="mock-nav-item">
        <Icon name="sparkles" size={12} /> AI Agents
      </div>
      <div className="mock-nav-item">
        <Icon name="webhook" size={12} /> API
      </div>
      <div className="mock-nav-item">
        <Icon name="chart" size={12} /> Analytics
      </div>
    </div>
    <div className="mock-panel mock-chat">
      <div className="mock-chat-head">
        <div className="h">AI Agent</div>
        <span className="badge">Active</span>
      </div>
      <div className="mock-chat-msgs">
        <div className="mock-chat-msg in">¡Hola! ¿En qué te ayudo?</div>
        <div className="mock-chat-msg out">Quiero info del producto.</div>
        <div className="mock-chat-msg in">¡Claro! Te paso los detalles.</div>
      </div>
    </div>
  </div>
);

// ---------- CTA ----------
const LandCTA = ({ t }: { t: (k: string) => string }) => (
  <section className="land-cta">
    <div className="land-cta-inner">
      <span className="land-eyebrow">
        <span className="dot" /> {t('landing.cta.eyebrow')}
      </span>
      <h2>
        {t('landing.cta.title')} <span className="green">{t('landing.cta.titleAccent')}</span>
      </h2>
      <p>{t('landing.cta.body')}</p>
      <div className="hero-ctas">
        <Link href="/signup" className="btn-green">
          {t('landing.cta.primary')} <Icon name="arrow_right" size={15} />
        </Link>
        <a href="https://github.com/IsmaellHV/wahub-frontend" target="_blank" rel="noopener" className="btn-outline">
          <Icon name="github" size={15} /> {t('landing.cta.secondary')}
        </a>
      </div>
    </div>
  </section>
);

// ---------- FOOTER ----------
const LandFooter = ({ t }: { t: (k: string) => string }) => (
  <footer className="land-footer">
    <Link href="/" className="land-brand" style={{ fontSize: 15 }}>
      <Logo size={22} />
      <span>waHub</span>
    </Link>
    <span style={{ color: 'var(--land-fg-faint)', fontSize: 12.5 }}>
      © {new Date().getFullYear()} {t('landing.footer.by')}{' '}
      <a
        href="https://ismaelhv.com"
        target="_blank"
        rel="noopener"
        style={{ color: 'var(--land-fg-muted)', textDecoration: 'none', borderBottom: '1px solid color-mix(in srgb, var(--land-fg-muted) 30%, transparent)' }}
      >
        Ismael Hurtado
      </a>
    </span>
    <div className="land-footer-links">
      <a href="https://ismaelhv.com/#contact" target="_blank" rel="noopener">
        {t('landing.footer.contact')}
      </a>
    </div>
  </footer>
);
