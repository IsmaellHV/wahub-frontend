'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@shared/UI/components/Logo';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { useTheme } from '@shared/UI/ThemeProvider';

// Landing v5
//   - Warm dark canvas with green aurora behind hero (less gray, more identity)
//   - Pure white titles for max contrast (no faded gradient)
//   - Phone vertically centered in viewport via sticky `top: calc(50vh - 290px)`
//     so it visually anchors to the same spot regardless of scroll
//   - Mobile: phone hides, panels stack inline (full responsive flow)
export const LandingScreen = () => {
  const { locale, setLocale } = useI18n();
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
          <a
            href="https://github.com/IsmaellHV/wahub-frontend"
            rel="noopener"
            target="_blank"
            className="nav-link nav-icon-link"
          >
            <Icon name="github" size={15} />
            <span className="hide-sm">GitHub</span>
          </a>
          <button
            className="nav-link nav-icon-link"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
          </button>
          <button className="nav-link" onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}>
            {locale === 'es' ? 'EN' : 'ES'}
          </button>
          <Link href="/login" className="nav-link hide-sm">Log in</Link>
          <Link href="/signup" className="nav-cta">Sign up</Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <Link href="/signup" className="hero-pill">
          <span className="pill-dot" /> waHub está disponible <Icon name="arrow_right" size={11} />
        </Link>
        <h1 className="hero-title">
          La nueva forma <br />
          de automatizar <span className="title-accent">WhatsApp</span>.
        </h1>
        <p className="hero-sub">
          Conecta cualquier número, configura un agente con IA, deja que el bot trabaje por ti.
        </p>
        <div className="hero-ctas">
          <Link href="/signup" className="hero-cta">
            Empezar <Icon name="arrow_right" size={13} />
          </Link>
          <Link href="/login" className="hero-cta-ghost">
            Iniciar sesión
          </Link>
        </div>
      </section>

      <ScrollyPhone />

      {/* FINAL CTA */}
      <section className="final">
        <div className="final-glow" />
        <h2 className="final-title">Tu siguiente paso.</h2>
        <p className="final-sub">Conecta un número en 60 segundos.</p>
        <Link href="/signup" className="hero-cta">
          Empezar <Icon name="arrow_right" size={13} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-brand">
          <Logo size={22} />
          <span>waHub</span>
        </div>
        <div className="foot-links">
          <a href="https://github.com/IsmaellHV/wahub-frontend" target="_blank" rel="noopener">GitHub</a>
          <Link href="/login">Iniciar sesión</Link>
          <Link href="/signup">Crear cuenta</Link>
        </div>
        <div className="copy">
          © {new Date().getFullYear()} by{' '}
          <a href="https://ismaelhv.com" target="_blank" rel="noopener" className="copy-author">
            Ismael Hurtado
          </a>
        </div>
      </footer>

      <style jsx>{styles}</style>
    </div>
  );
};

// ----------------- starfield (client-only) -----------------
interface Star { left: number; top: number; size: number; delay: number; opacity: number; }

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
const PANELS = [
  { title: 'Conecta tu número', body: 'Escanea el QR desde tu WhatsApp. La sesión queda lista en segundos.', screen: 'connect' as const },
  { title: 'Configura tu agente IA', body: 'Dale personalidad, elige el modelo y conecta tu API key. Responde con tu tono.', screen: 'agent' as const },
  { title: 'Conversaciones en vivo', body: 'Tu bot lee, piensa y responde. Tú monitoreas todo desde el inbox.', screen: 'chat' as const },
  { title: 'Multi-sesión', body: 'Tantos números como necesites. Cada uno aislado, con su propio agente.', screen: 'multi' as const },
  { title: 'Tiempo real', body: 'WebSockets en cada vista. Mensajes, estados y eventos sincronizados al instante.', screen: 'realtime' as const },
  { title: 'Listo. Escala.', body: 'Multi-flujo, sin tocar el código. Crece sin fricción.', screen: 'done' as const },
];

const ScrollyPhone = () => {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
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
              ref={(el) => { refs.current[i] = el; }}
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

const QR_PATTERN = [1,0,1,1,0, 0,1,0,1,1, 1,1,1,0,0, 0,1,0,1,1, 1,0,1,1,0];

const ScreenConnect = () => (
  <div className="ph-screen ph-fade">
    <div className="ph-h">Conectar WhatsApp</div>
    <div className="ph-sub">Escanea con tu teléfono</div>
    <div className="ph-qr">
      <div className="qr-grid">
        {QR_PATTERN.map((v, i) => (<span key={i} style={{ background: v ? '#fff' : 'transparent' }} />))}
      </div>
    </div>
    <div className="ph-meta"><span className="ph-dot" /> esperando…</div>
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
      <div className="ph-input ph-prompt">
        Eres un asesor cálido y conciso. Responde en español, ofrece el plan que mejor encaje…
      </div>
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
        <div className="ph-sub ph-sub-xs"><span className="ph-dot" /> en línea</div>
      </div>
    </div>
    <div className="ph-chat">
      <div className="ph-msg ph-in">Hola! ¿Tienen plan pro?</div>
      <div className="ph-msg ph-out">¡Sí! Te paso los detalles.</div>
      <div className="ph-msg ph-in">¿Hay opción anual?</div>
      <div className="ph-msg ph-out">Claro, con descuento incluido.</div>
      <div className="ph-typing"><span /><span /><span /></div>
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
          <div className="ph-item-av" data-state={b.state}>{b.name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ph-item-name">{b.name}</div>
            <div className="ph-item-num">{b.code} · {b.num}</div>
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
      <div className="ph-done-ring"><div className="ph-done-check">✓</div></div>
      <div className="ph-h">Todo listo</div>
      <div className="ph-sub">Tu bot ya está respondiendo</div>
    </div>
    <div className="ph-stats">
      <div className="ph-stat"><div className="ph-stat-v">128</div><div className="ph-stat-l">Mensajes hoy</div></div>
      <div className="ph-stat"><div className="ph-stat-v">2.4s</div><div className="ph-stat-l">Respuesta avg</div></div>
    </div>
  </div>
);

// ----------------- styles -----------------
const styles = `
.landing {
  /* Themable scope — light & dark variants below */
  --land-accent: #22c55e;
  --land-accent-2: #14b8a6;
  --land-bg: #06080f;
  --land-elev: #0d111a;
  --land-fg: #f4f5f8;
  --land-mute: rgba(244, 245, 248, .62);
  --land-faint: rgba(244, 245, 248, .38);
  --land-border: rgba(255, 255, 255, .08);
  --land-border-soft: rgba(255, 255, 255, .05);
  --land-surface: rgba(255, 255, 255, .03);
  --land-cta-bg: var(--land-fg);
  --land-cta-fg: var(--land-bg);
  --land-aurora-1: rgba(34, 197, 94, .35);
  --land-aurora-2: rgba(20, 184, 166, .35);
  --land-aurora-3: rgba(34, 197, 94, .15);
  --land-star: #fff;
  background: var(--land-bg);
  color: var(--land-fg);
  min-height: 100vh;
  overflow-x: clip;
  position: relative;
  transition: background .3s, color .3s;
}

/* LIGHT VARIANT — invert canvas, keep green accent identity */
[data-theme='light'] .landing {
  --land-bg: #ffffff;
  --land-elev: #fafafa;
  --land-fg: #0a0a0b;
  --land-mute: rgba(10, 10, 11, .62);
  --land-faint: rgba(10, 10, 11, .38);
  --land-border: rgba(10, 10, 11, .1);
  --land-border-soft: rgba(10, 10, 11, .06);
  --land-surface: rgba(10, 10, 11, .025);
  --land-cta-bg: #0a0a0b;
  --land-cta-fg: #ffffff;
  --land-aurora-1: rgba(34, 197, 94, .25);
  --land-aurora-2: rgba(20, 184, 166, .2);
  --land-aurora-3: rgba(34, 197, 94, .1);
  --land-star: #0a0a0b;
}

/* base ambient gradient overlay */
.landing::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--land-accent) 14%, transparent), transparent 60%),
    radial-gradient(ellipse 90% 70% at 100% 100%, color-mix(in srgb, var(--land-accent-2) 10%, transparent), transparent 60%);
}

/* AURORA */
.aurora { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.aurora-blob { position: absolute; border-radius: 50%; filter: blur(110px); opacity: .35; }
.aurora-1 { width: 700px; height: 700px; top: -200px; left: -150px; background: radial-gradient(circle, var(--land-aurora-1) 0%, transparent 60%); animation: drift1 22s ease-in-out infinite; }
.aurora-2 { width: 600px; height: 600px; top: 20%; right: -200px; background: radial-gradient(circle, var(--land-aurora-2) 0%, transparent 60%); animation: drift2 28s ease-in-out infinite; }
.aurora-3 { width: 500px; height: 500px; bottom: -150px; left: 30%; background: radial-gradient(circle, var(--land-aurora-3) 0%, transparent 60%); animation: drift3 32s ease-in-out infinite; opacity: .2; }
@keyframes drift1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(60px, 80px); } }
@keyframes drift2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-80px, 40px); } }
@keyframes drift3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(40px, -60px); } }

/* STARS — visible only on dark; tint to fg in light keeps subtle dot speckle */
.stars { position: fixed; inset: 0; pointer-events: none; z-index: 1; }
.star { position: absolute; background: var(--land-star); border-radius: 50%; animation: twinkle 6s ease-in-out infinite; }
[data-theme='light'] .star { opacity: .25 !important; }
@keyframes twinkle { 0%, 100% { opacity: .3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }

/* NAV */
.nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 32px;
  backdrop-filter: blur(16px);
  background: color-mix(in srgb, var(--land-bg) 78%, transparent);
  border-bottom: 1px solid var(--land-border-soft);
}
.brand { display: flex; gap: 10px; align-items: center; font-weight: 600; font-size: 15.5px; letter-spacing: -0.02em; color: var(--land-fg); text-decoration: none; }
.nav-actions { display: flex; gap: 4px; align-items: center; }
.nav-link { color: var(--land-mute); text-decoration: none; font-size: 13.5px; font-weight: 500; background: transparent; border: none; cursor: pointer; padding: 8px 12px; border-radius: 8px; transition: background .18s, color .18s; display: inline-flex; align-items: center; gap: 6px; }
.nav-link:hover { background: color-mix(in srgb, var(--land-fg) 8%, transparent); color: var(--land-fg); }
.nav-cta { background: var(--land-cta-bg); color: var(--land-cta-fg); padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13.5px; text-decoration: none; transition: opacity .18s, transform .18s; margin-left: 6px; }
.nav-cta:hover { opacity: .88; transform: translateY(-1px); }

/* HERO — fills viewport so the phone never peeks above the fold */
.hero {
  position: relative; z-index: 2;
  text-align: center;
  padding: 100px 24px 80px;
  max-width: 1080px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.hero-pill {
  display: inline-flex; gap: 8px; align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px; font-weight: 500;
  background: color-mix(in srgb, var(--land-accent) 8%, transparent);
  color: var(--land-fg);
  border: 1px solid color-mix(in srgb, var(--land-accent) 30%, transparent);
  text-decoration: none;
  margin-bottom: 36px;
  transition: background .2s, border-color .2s;
}
.hero-pill:hover { background: color-mix(in srgb, var(--land-accent) 14%, transparent); border-color: color-mix(in srgb, var(--land-accent) 45%, transparent); }
.pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--land-accent); box-shadow: 0 0 8px var(--land-accent); }

.hero-title {
  font-size: clamp(46px, 7.4vw, 96px);
  line-height: 1.02;
  letter-spacing: -0.045em;
  font-weight: 600;
  margin: 0 0 28px;
  color: var(--land-fg);
}
.title-accent {
  background: linear-gradient(110deg, var(--land-accent) 0%, var(--land-accent-2) 60%, var(--land-accent) 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shineMove 8s linear infinite;
}
@keyframes shineMove { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }

.hero-sub {
  font-size: 18px;
  color: var(--land-mute);
  line-height: 1.55;
  max-width: 580px;
  margin: 0 auto 40px;
}
.hero-ctas { display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.hero-cta {
  display: inline-flex; gap: 8px; align-items: center;
  padding: 13px 26px;
  border-radius: 999px;
  background: var(--land-cta-bg);
  color: var(--land-cta-fg);
  font-weight: 600; font-size: 14.5px;
  text-decoration: none;
  transition: transform .18s, box-shadow .2s;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--land-cta-bg) 40%, transparent);
}
.hero-cta:hover { transform: translateY(-1px); box-shadow: 0 14px 32px -10px color-mix(in srgb, var(--land-cta-bg) 55%, transparent); }
.hero-cta-ghost {
  display: inline-flex; gap: 6px; align-items: center;
  padding: 13px 26px;
  border-radius: 999px;
  background: var(--land-surface);
  color: var(--land-fg);
  border: 1px solid var(--land-border);
  font-weight: 600; font-size: 14.5px;
  text-decoration: none;
  transition: background .18s, border-color .18s;
}
.hero-cta-ghost:hover { background: color-mix(in srgb, var(--land-fg) 8%, transparent); border-color: color-mix(in srgb, var(--land-fg) 24%, transparent); }

/* SCROLLYTELLING */
.scrolly { position: relative; z-index: 2; padding: 60px 24px; }
.scrolly-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
.scrolly-phone-wrap { position: relative; align-self: stretch; }
.scrolly-phone-sticky {
  position: sticky;
  /* Just below sticky nav. Predictable across viewport sizes. */
  top: 90px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* Cap to remaining viewport so phone is never clipped at the bottom */
  max-height: calc(100vh - 110px);
}
.scrolly-panels { display: flex; flex-direction: column; gap: 0; }
.scrolly-panel {
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 0;
  opacity: .25;
  transition: opacity .5s;
}
.scrolly-panel.active { opacity: 1; }
.panel-num { font-family: ui-monospace, monospace; font-size: 12px; color: var(--land-accent); letter-spacing: 0.1em; margin-bottom: 18px; font-weight: 600; }
.panel-title { font-size: clamp(28px, 3.4vw, 44px); letter-spacing: -0.025em; font-weight: 600; margin: 0 0 16px; color: var(--land-fg); }
.panel-body { font-size: 16px; color: var(--land-mute); line-height: 1.6; max-width: 440px; margin: 0; }
.panel-phone-mobile { display: none; margin-top: 28px; }

/* PHONE */
.phone {
  width: 320px;
  background: linear-gradient(180deg, #14171f 0%, #0d0f18 100%);
  border-radius: 44px;
  border: 1px solid rgba(255,255,255,.08);
  padding: 12px;
  box-shadow:
    0 50px 100px -30px rgba(0,0,0,.85),
    0 0 0 1px rgba(255,255,255,.02),
    0 0 0 8px rgba(34,197,94,.04),
    inset 0 1px 0 rgba(255,255,255,.06);
  position: relative;
}
.phone-notch { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: 96px; height: 22px; background: #000; border-radius: 999px; z-index: 2; }
.phone-status { display: flex; justify-content: space-between; padding: 10px 22px 12px; font-size: 11px; color: rgba(255,255,255,.65); font-weight: 600; }
.phone-icons { font-family: ui-monospace, monospace; letter-spacing: 1px; }
.phone-screen { background: #0a0c12; border-radius: 32px; height: clamp(420px, 60vh, 540px); overflow: hidden; padding: 18px 16px; position: relative; }

.ph-screen { display: flex; flex-direction: column; height: 100%; }
.ph-fade { animation: phFade .55s ease; }
@keyframes phFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.ph-h { font-weight: 700; font-size: 17px; color: #fff; letter-spacing: -0.01em; }
.ph-h-sm { font-size: 13.5px; }
.ph-sub { font-size: 12.5px; color: rgba(255,255,255,.55); margin-top: 2px; }
.ph-sub-xs { font-size: 11px; display: inline-flex; gap: 4px; align-items: center; }
.ph-dot { width: 6px; height: 6px; background: var(--land-accent); border-radius: 50%; box-shadow: 0 0 8px var(--land-accent); display: inline-block; }
.ph-qr { margin: 22px auto; width: 180px; height: 180px; border-radius: 14px; background: #fff; padding: 14px; }
.qr-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%; height: 100%; }
.qr-grid span { border-radius: 2px; }
.ph-meta { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,.55); margin-top: auto; padding-bottom: 12px; }
.ph-field { margin-top: 14px; }
.ph-field label { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,.45); font-weight: 600; }
.ph-input { margin-top: 6px; padding: 10px 12px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; font-size: 13px; color: #fff; }
.ph-prompt { font-size: 12px; line-height: 1.5; color: rgba(255,255,255,.78); }
.ph-toggle { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding: 12px; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); border-radius: 10px; font-size: 13px; color: #fff; font-weight: 500; }
.ph-switch { width: 32px; height: 18px; border-radius: 999px; background: rgba(255,255,255,.15); position: relative; }
.ph-switch.on { background: var(--land-accent); box-shadow: 0 0 8px rgba(34,197,94,.5); }
.ph-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #fff; border-radius: 50%; transition: transform .25s; }
.ph-switch.on::after { transform: translateX(14px); }
.ph-chat-bar { display: flex; gap: 10px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 12px; }
.ph-av { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #14b8a6); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; }
.ph-chat { display: flex; flex-direction: column; gap: 6px; }
.ph-msg { padding: 8px 12px; border-radius: 14px; font-size: 12.5px; line-height: 1.4; max-width: 78%; animation: phFade .4s ease; }
.ph-in { background: rgba(255,255,255,.06); color: #fff; align-self: flex-start; border-top-left-radius: 4px; }
.ph-out { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; align-self: flex-end; border-top-right-radius: 4px; box-shadow: 0 4px 12px -4px rgba(34,197,94,.5); }
.ph-typing { background: rgba(255,255,255,.06); width: 44px; padding: 9px; border-radius: 14px; align-self: flex-start; display: flex; gap: 3px; }
.ph-typing span { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.5); animation: typing 1.4s infinite; }
.ph-typing span:nth-child(2) { animation-delay: .2s; }
.ph-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes typing { 0%, 60%, 100% { transform: translateY(0); opacity: .35; } 30% { transform: translateY(-3px); opacity: 1; } }
.ph-done { text-align: center; padding: 40px 0 24px; }
.ph-done-ring { width: 80px; height: 80px; border-radius: 50%; background: rgba(34,197,94,.12); border: 2px solid rgba(34,197,94,.5); display: grid; place-items: center; margin: 0 auto 18px; box-shadow: 0 0 0 8px rgba(34,197,94,.06), 0 0 32px rgba(34,197,94,.3); animation: pulseRing 2.4s ease-in-out infinite; }
@keyframes pulseRing { 0%, 100% { box-shadow: 0 0 0 8px rgba(34,197,94,.06), 0 0 32px rgba(34,197,94,.3); } 50% { box-shadow: 0 0 0 14px rgba(34,197,94,.03), 0 0 44px rgba(34,197,94,.5); } }
.ph-done-check { font-size: 36px; color: var(--land-accent); }
.ph-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; }
.ph-stat { padding: 14px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; text-align: center; }
.ph-stat-v { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
.ph-stat-l { font-size: 10.5px; color: rgba(255,255,255,.5); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }

/* PHONE — multi list */
.ph-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
.ph-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; }
.ph-item-av { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #14b8a6); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 12px; flex-shrink: 0; position: relative; }
.ph-item-av[data-state="idle"] { background: linear-gradient(135deg, #f59e0b, #d97706); }
.ph-item-av::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; border-radius: 50%; background: var(--land-accent); border: 2px solid #0a0c12; }
.ph-item-av[data-state="idle"]::after { background: #f59e0b; }
.ph-item-name { font-weight: 600; font-size: 13px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-item-num { font-size: 11px; color: rgba(255,255,255,.5); font-family: ui-monospace, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-pill { font-size: 10px; padding: 3px 8px; border-radius: 999px; font-weight: 600; flex-shrink: 0; }
.ph-pill-online { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.3); }
.ph-pill-idle { background: rgba(245,158,11,.15); color: #fbbf24; border: 1px solid rgba(245,158,11,.3); }

/* PHONE — realtime feed */
.ph-feed { display: flex; flex-direction: column; gap: 6px; margin-top: 14px; }
.ph-evt { display: flex; align-items: center; gap: 10px; padding: 9px 10px; background: rgba(255,255,255,.03); border-left: 2px solid rgba(255,255,255,.1); border-radius: 6px; animation: phFade .4s ease; }
.ph-evt-in { border-left-color: #14b8a6; }
.ph-evt-out { border-left-color: var(--land-accent); }
.ph-evt-ai { border-left-color: #f59e0b; }
.ph-evt-sys { border-left-color: rgba(255,255,255,.3); }
.ph-evt-ic { width: 22px; height: 22px; border-radius: 6px; background: rgba(255,255,255,.06); color: #fff; display: grid; place-items: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.ph-evt-in .ph-evt-ic { background: rgba(20,184,166,.15); color: #14b8a6; }
.ph-evt-out .ph-evt-ic { background: rgba(34,197,94,.15); color: var(--land-accent); }
.ph-evt-ai .ph-evt-ic { background: rgba(245,158,11,.15); color: #fbbf24; }
.ph-evt-t { font-size: 12px; color: #fff; font-weight: 500; }
.ph-evt-s { font-size: 10.5px; color: rgba(255,255,255,.5); margin-top: 1px; font-family: ui-monospace, monospace; }
.ph-evt-time { font-size: 10px; color: rgba(255,255,255,.4); flex-shrink: 0; }

.kicker { display: inline-block; padding: 4px 12px; border-radius: 999px; background: color-mix(in srgb, var(--land-accent) 10%, transparent); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--land-accent); border: 1px solid color-mix(in srgb, var(--land-accent) 25%, transparent); margin-bottom: 18px; }
.section-title { font-size: clamp(36px, 4.6vw, 60px); letter-spacing: -0.035em; font-weight: 600; margin: 0 0 14px; color: var(--land-fg); }
.section-sub { font-size: 16px; color: var(--land-mute); max-width: 540px; margin: 0 auto 60px; line-height: 1.6; }

/* FINAL CTA */
.final { position: relative; z-index: 2; padding: 140px 24px; text-align: center; border-top: 1px solid var(--land-border-soft); overflow: hidden; }
.final-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, color-mix(in srgb, var(--land-accent) 14%, transparent), transparent 60%); pointer-events: none; }
.final-title { position: relative; font-size: clamp(36px, 5vw, 64px); letter-spacing: -0.04em; font-weight: 600; margin: 0 0 14px; color: var(--land-fg); }
.final-sub { position: relative; color: var(--land-mute); font-size: 17px; margin: 0 0 36px; }
.final .hero-cta { position: relative; }

/* FOOTER */
.foot {
  position: relative; z-index: 2;
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 48px;
  border-top: 1px solid var(--land-border-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.foot-brand { display: flex; gap: 10px; align-items: center; font-weight: 600; font-size: 15px; color: var(--land-fg); }
.foot-links { display: flex; gap: 24px; }
.foot-links a { font-size: 13.5px; color: var(--land-mute); text-decoration: none; transition: color .18s; }
.foot-links a:hover { color: var(--land-fg); }
.copy { font-size: 12.5px; color: var(--land-faint); }
.copy-author { color: var(--land-accent); text-decoration: none; font-weight: 600; transition: opacity .18s; }
.copy-author:hover { opacity: .8; text-decoration: underline; text-underline-offset: 3px; }

/* ---------- RESPONSIVE ---------- */

/* TABLET — phone shrinks slightly, gap reduces */
@media (max-width: 1100px) {
  .scrolly-inner { gap: 48px; }
  .phone { width: 290px; }
  .panel-title { font-size: clamp(26px, 3vw, 38px); }
}

/* MOBILE LANDSCAPE / SMALL TABLET — single column, phone inline per panel */
@media (max-width: 880px) {
  .nav { padding: 14px 20px; }
  .hero { padding: 80px 20px 60px; min-height: auto; }
  .hero-title { font-size: clamp(40px, 8vw, 64px); }
  .hero-sub { font-size: 16px; }
  .scrolly { padding: 40px 20px 80px; }
  .scrolly-inner { grid-template-columns: 1fr; gap: 0; }
  .scrolly-phone-wrap { display: none; }
  .scrolly-panel {
    min-height: auto;
    padding: 56px 0;
    opacity: 1;
    border-bottom: 1px solid var(--border-soft);
    align-items: center;
    text-align: center;
  }
  .scrolly-panel:last-child { border-bottom: none; }
  .panel-body { margin: 0 auto; }
  .panel-phone-mobile { display: flex; justify-content: center; margin-top: 32px; width: 100%; }
  .panel-phone-mobile .phone { transform: scale(.92); transform-origin: center top; }
  .final { padding: 80px 20px; }
  .foot { flex-direction: column; text-align: center; gap: 20px; padding: 32px 20px; }
  .foot-links { gap: 18px; flex-wrap: wrap; justify-content: center; }
}

/* PHONE — compact paddings, hide secondary nav links, smaller phone mock */
@media (max-width: 640px) {
  .nav { padding: 12px 16px; }
  .nav-cta { padding: 7px 14px; font-size: 12.5px; }
  .nav-link { padding: 7px 10px; font-size: 13px; }
  .hide-sm { display: none; }
  .hero { padding: 60px 16px 40px; }
  .hero-pill { font-size: 12px; padding: 5px 12px; margin-bottom: 28px; }
  .hero-title { font-size: clamp(34px, 9vw, 52px); letter-spacing: -0.035em; }
  .hero-sub { font-size: 15px; margin-bottom: 32px; }
  .hero-cta, .hero-cta-ghost { padding: 12px 22px; font-size: 14px; }
  .scrolly { padding: 24px 16px 60px; }
  .scrolly-panel { padding: 40px 0; }
  .panel-num { font-size: 11px; margin-bottom: 14px; }
  .panel-title { font-size: clamp(24px, 7vw, 32px); margin-bottom: 12px; }
  .panel-body { font-size: 14.5px; }
  .panel-phone-mobile .phone { transform: scale(.86); }
  .final { padding: 60px 16px; }
  .final-title { font-size: clamp(30px, 8vw, 42px); }
  .final-sub { font-size: 15px; }
}

/* SMALL PHONE — minimum supported width */
@media (max-width: 380px) {
  .nav { padding: 10px 14px; }
  .brand span { display: none; }
  .panel-phone-mobile .phone { transform: scale(.78); transform-origin: center top; }
  .phone { width: 280px; }
}
`;
