'use client';
import { useI18n } from '@shared/i18n/I18nProvider';
import { Icon } from '@shared/UI/components/Icon';
import { Logo } from '@shared/UI/components/Logo';
import { useTheme } from '@shared/UI/ThemeProvider';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import './landing.css';

export const LandingScreen = () => {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="landing">
      <Stars />
      <Aurora />

      {/* NAV */}
      <header className="nav">
        <Link href="/" className="brand">
          <Logo size={28} animated />
          <span>waHub</span>
        </Link>
        <div className="nav-actions">
          <a href="https://github.com/IsmaellHV/wahub-frontend" rel="noopener" target="_blank" className="nav-link nav-icon-link">
            <Icon name="github" size={15} />
            <span className="hide-sm">{t('landing.nav.github')}</span>
          </a>
          <button className="nav-link nav-icon-link" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          <button className="nav-link" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}>
            {locale === 'es' ? 'EN' : 'ES'}
          </button>
          <Link href="/login" className="nav-link hide-sm">
            {t('landing.nav.login')}
          </Link>
          <Link href="/signup" className="nav-cta">
            {t('landing.nav.signup')}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <Link href="/signup" className="hero-pill">
          <span className="pill-dot" /> {t('landing.hero.pill')} <Icon name="arrow_right" size={11} />
        </Link>
        <h1 className="hero-title">
          {t('landing.hero.title')} <br />
          {t('landing.hero.titleLine2')} <span className="title-accent">{t('landing.hero.titleAccent')}</span>.
        </h1>
        <p className="hero-sub">{t('landing.hero.subtitle')}</p>
        <div className="hero-ctas">
          <Link href="/signup" className="hero-cta">
            {t('landing.hero.ctaPrimary')} <Icon name="arrow_right" size={13} />
          </Link>
          <Link href="/login" className="hero-cta-ghost">
            {t('landing.hero.ctaSecondary')}
          </Link>
        </div>
      </section>

      <ScrollyPhone />

      {/* FINAL CTA */}
      <section className="final">
        <div className="final-glow" />
        <h2 className="final-title">{t('landing.final.title')}</h2>
        <p className="final-sub">{t('landing.final.subtitle')}</p>
        <Link href="/signup" className="hero-cta">
          {t('landing.final.cta')} <Icon name="arrow_right" size={13} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-brand">
          <Logo size={22} />
          <span>waHub</span>
        </div>
        <div className="foot-links">
          <a href="https://github.com/IsmaellHV/wahub-frontend" target="_blank" rel="noopener">
            {t('landing.footer.github')}
          </a>
          <Link href="/login">{t('landing.footer.login')}</Link>
          <Link href="/signup">{t('landing.footer.signup')}</Link>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} {t('landing.footer.copy')}{' '}
          <a href="https://ismaelhv.com" target="_blank" rel="noopener" className="copy-author">
            Ismael Hurtado
          </a>
        </div>
      </footer>
    </div>
  );
};

// ----------------- starfield (client-only) -----------------
interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  opacity: number;
}

const Stars = () => {
  const [stars, setStars] = useState<Star[] | null>(null);
  useEffect(() => {
    setStars(
      Array.from({ length: 60 }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.15,
      })),
    );
  }, []);
  if (!stars) return null;
  return (
    <div className="stars" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// ----------------- aurora (subtle green/teal glow behind hero) -----------------
const Aurora = () => (
  <div className="aurora" aria-hidden>
    <div className="aurora-blob aurora-1" />
    <div className="aurora-blob aurora-2" />
    <div className="aurora-blob aurora-3" />
  </div>
);

// ----------------- scrollytelling -----------------
const SCREENS = ['connect', 'agent', 'chat', 'multi', 'realtime', 'done'] as const;
const PANEL_KEYS = ['one', 'two', 'three', 'four', 'five', 'six'] as const;

const ScrollyPhone = () => {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // Recompute when locale changes via t (memo keyed on first translated value).
  const PANELS = useMemo(
    () =>
      SCREENS.map((screen, i) => ({
        title: t(`landing.panels.${PANEL_KEYS[i]}.title`),
        body: t(`landing.panels.${PANEL_KEYS[i]}.body`),
        screen,
      })),
    [t],
  );

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = refs.current.indexOf(visible[0].target as HTMLDivElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="scrolly">
      <div className="scrolly-inner">
        <div className="scrolly-phone-wrap">
          <div className="scrolly-phone-sticky">
            <Phone screen={PANELS[active].screen} />
          </div>
        </div>

        <div className="scrolly-panels">
          {PANELS.map((p, i) => (
            <div
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`scrolly-panel ${i === active ? 'active' : ''}`}
            >
              <div className="panel-num">0{i + 1}</div>
              <h3 className="panel-title">{p.title}</h3>
              <p className="panel-body">{p.body}</p>
              {/* Mobile: inline phone preview shown only on small screens */}
              <div className="panel-phone-mobile">
                <Phone screen={p.screen} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ----------------- phone -----------------
type Screen = 'connect' | 'agent' | 'chat' | 'multi' | 'realtime' | 'done';

const Phone = ({ screen }: { screen: Screen }) => (
  <div className="phone">
    <div className="phone-notch" />
    <div className="phone-status">
      <span>9:41</span>
      <span className="phone-icons">●●● 5G ▮</span>
    </div>
    <div className="phone-screen">
      {screen === 'connect' && <ScreenConnect />}
      {screen === 'agent' && <ScreenAgent />}
      {screen === 'chat' && <ScreenChat />}
      {screen === 'multi' && <ScreenMulti />}
      {screen === 'realtime' && <ScreenRealtime />}
      {screen === 'done' && <ScreenDone />}
    </div>
  </div>
);

const QR_PATTERN = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0];

const ScreenConnect = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-h">Conectar WhatsApp</div>
    <div className="ph-sub">Escanea con tu teléfono</div>
    <div className="ph-qr">
      <div className="qr-grid">
        {QR_PATTERN.map((v, i) => (
          <span key={i} style={{ background: v ? '#fff' : 'transparent' }} />
        ))}
      </div>
    </div>
    <div className="ph-meta">
      <span className="ph-dot" /> esperando…
    </div>
  </div>
);

const ScreenAgent = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-h">Tu agente IA</div>
    <div className="ph-sub">Asistente de ventas</div>
    <div className="ph-field">
      <label>Modelo</label>
      <div className="ph-input">claude-sonnet-4-5</div>
    </div>
    <div className="ph-field">
      <label>Personalidad</label>
      <div className="ph-input ph-prompt">Eres un asesor cálido y conciso. Responde en español, ofrece el plan que mejor encaje…</div>
    </div>
    <div className="ph-toggle">
      <span>Activo</span>
      <span className="ph-switch on" />
    </div>
  </div>
);

const ScreenChat = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-chat-bar">
      <div className="ph-av">M</div>
      <div>
        <div className="ph-h ph-h-sm">María · Cliente</div>
        <div className="ph-sub ph-sub-xs">
          <span className="ph-dot" /> en línea
        </div>
      </div>
    </div>
    <div className="ph-chat">
      <div className="ph-msg ph-in">Hola! ¿Tienen plan pro?</div>
      <div className="ph-msg ph-out">¡Sí! Te paso los detalles.</div>
      <div className="ph-msg ph-in">¿Hay opción anual?</div>
      <div className="ph-msg ph-out">Claro, con descuento incluido.</div>
      <div className="ph-typing">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

const ScreenMulti = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-h">Tus sesiones</div>
    <div className="ph-sub">3 bots activos</div>
    <div className="ph-list">
      {[
        { code: 'WSP-A7K2', name: 'Ventas', num: '+51 999 ··· 190', state: 'online' },
        { code: 'WSP-B9X3', name: 'Soporte', num: '+52 55 ··· 432', state: 'online' },
        { code: 'WSP-C4M1', name: 'Recordatorios', num: '+57 320 ··· 887', state: 'idle' },
      ].map((b) => (
        <div key={b.code} className="ph-item">
          <div className="ph-item-av" data-state={b.state}>
            {b.name[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ph-item-name">{b.name}</div>
            <div className="ph-item-num">
              {b.code} · {b.num}
            </div>
          </div>
          <span className={`ph-pill ph-pill-${b.state}`}>{b.state}</span>
        </div>
      ))}
    </div>
  </div>
);

const ScreenRealtime = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-h">Tiempo real</div>
    <div className="ph-sub">Eventos en vivo</div>
    <div className="ph-feed">
      {[
        { ic: '↓', t: 'Mensaje recibido', sub: '+51 999 ··· 432', tone: 'in' },
        { ic: '✨', t: 'Agente generó respuesta', sub: '420ms · 138 tokens', tone: 'ai' },
        { ic: '↑', t: 'Mensaje enviado', sub: '+51 999 ··· 432', tone: 'out' },
        { ic: '●', t: 'Bot Soporte conectado', sub: 'WSP-B9X3', tone: 'sys' },
        { ic: '↓', t: 'Mensaje recibido', sub: '+52 55 ··· 211', tone: 'in' },
      ].map((e, i) => (
        <div key={i} className={`ph-evt ph-evt-${e.tone}`}>
          <div className="ph-evt-ic">{e.ic}</div>
          <div style={{ flex: 1 }}>
            <div className="ph-evt-t">{e.t}</div>
            <div className="ph-evt-s">{e.sub}</div>
          </div>
          <div className="ph-evt-time">ahora</div>
        </div>
      ))}
    </div>
  </div>
);

const ScreenDone = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-done">
      <div className="ph-done-ring">
        <div className="ph-done-check">✓</div>
      </div>
      <div className="ph-h">Todo listo</div>
      <div className="ph-sub">Tu bot ya está respondiendo</div>
    </div>
    <div className="ph-stats">
      <div className="ph-stat">
        <div className="ph-stat-v">128</div>
        <div className="ph-stat-l">Mensajes hoy</div>
      </div>
      <div className="ph-stat">
        <div className="ph-stat-v">2.4s</div>
        <div className="ph-stat-l">Respuesta avg</div>
      </div>
    </div>
  </div>
);
