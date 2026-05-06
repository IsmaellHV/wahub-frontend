'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@shared/UI/components/Logo';
import { Icon } from '@shared/UI/components/Icon';
import { useUsuario } from '../Application/useUsuario';
import { useI18n } from '@shared/i18n/I18nProvider';
import { useTheme } from '@shared/UI/ThemeProvider';

interface Props {
  mode: 'login' | 'signup';
}

export const AuthScreen = ({ mode }: Props) => {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { loading, error, login, signUp } = useUsuario();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [nombres, setNombres] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email, password });
        router.push('/connect');
      } else {
        await signUp({
          username: (username || email.split('@')[0]).trim(),
          email,
          password,
          nombres: nombres.trim(),
          primerApellido: primerApellido.trim(),
          segundoApellido: segundoApellido.trim(),
        });
        await login({ email, password });
        router.push('/connect');
      }
    } catch {
      /* error set by hook */
    }
  };

  return (
    <div className="auth">
      {/* Floating top-right toolbar: theme + locale toggles */}
      <div className="auth-toolbar">
        <button
          className="auth-tool-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
        <button
          className="auth-tool-btn auth-tool-locale"
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
          aria-label="Toggle language"
          title={locale === 'es' ? 'Switch to English' : 'Cambiar a español'}
        >
          {locale === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <form className="auth-form" onSubmit={onSubmit}>
          <Link href="/" className="brand" style={{ marginBottom: 32 }}>
            <Logo size={32} />
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>waHub</span>
          </Link>

          <h1>{mode === 'login' ? t('auth.login.title') : t('auth.signup.title')}</h1>
          <div className="lead">{mode === 'login' ? t('auth.login.lead') : t('auth.signup.lead')}</div>

          <div className="field">
            <label className="label" htmlFor="email">
              {t('auth.email')}
            </label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">
              {t('auth.password')}
            </label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {mode === 'signup' && (
            <>
              <div className="field">
                <label className="label" htmlFor="username">
                  {t('auth.username') ?? 'Usuario'}
                </label>
                <input
                  id="username"
                  className="input"
                  placeholder="diego.salinas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  maxLength={50}
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="nombres">
                  {t('auth.nombres') ?? 'Nombres'}
                </label>
                <input
                  id="nombres"
                  className="input"
                  placeholder="Diego"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="primerApellido">
                  {t('auth.primerApellido') ?? 'Primer apellido'}
                </label>
                <input
                  id="primerApellido"
                  className="input"
                  placeholder="Salinas"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="segundoApellido">
                  {t('auth.segundoApellido') ?? 'Segundo apellido'}
                </label>
                <input
                  id="segundoApellido"
                  className="input"
                  placeholder="Pérez"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  maxLength={100}
                />
              </div>
            </>
          )}

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: '8px 12px',
                borderRadius: 'var(--r-sm)',
                background: 'color-mix(in srgb, var(--status-error) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
                color: 'var(--status-error)',
                fontSize: 12.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-brand btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? t('common.pleaseWait') : mode === 'login' ? t('auth.login.cta') : t('auth.signup.cta')}
          </button>

          <div className="alt">
            {mode === 'login' ? (
              <>
                {t('auth.noAccount')} <Link href="/signup">{t('auth.createOne')}</Link>
              </>
            ) : (
              <>
                {t('auth.hasAccount')} <Link href="/login">{t('auth.signIn')}</Link>
              </>
            )}
          </div>
        </form>
      </div>

      <div className="auth-art">
        <div className="auth-art-grid" />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 420, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 4,
              borderRadius: 28,
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-500) 30%, transparent), transparent)',
              boxShadow: '0 0 60px color-mix(in srgb, var(--brand-500) 25%, transparent)',
            }}
          >
            <Logo size={88} />
          </div>
          <div
            style={{
              marginTop: 32,
              fontSize: 'clamp(24px, 2.4vw, 30px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--fg)',
              lineHeight: 1.15,
              textWrap: 'balance',
            }}
          >
            {t('auth.art.title')}
            <br />
            <span style={{ color: 'var(--brand-500)' }}>{t('auth.art.subtitle')}</span>
          </div>
          <div style={{ marginTop: 14, fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            {t('auth.art.body')}
          </div>
          <div className="auth-art-chips">
            <span className="auth-art-chip"><span className="ico"><Icon name="qr" size={13} /></span> QR pairing</span>
            <span className="auth-art-chip"><span className="ico"><Icon name="sparkles" size={13} /></span> AI agents</span>
            <span className="auth-art-chip"><span className="pulse" /> Realtime</span>
            <span className="auth-art-chip"><span className="ico"><Icon name="webhook" size={13} /></span> Webhooks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
