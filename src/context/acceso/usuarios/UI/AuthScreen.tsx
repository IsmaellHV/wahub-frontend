'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@shared/UI/components/Logo';
import { useUsuario } from '../Application/useUsuario';
import { useI18n } from '@shared/i18n/I18nProvider';

interface Props {
  mode: 'login' | 'signup';
}

export const AuthScreen = ({ mode }: Props) => {
  const router = useRouter();
  const { t } = useI18n();
  const { loading, error, login, signUp } = useUsuario();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email, password });
        router.push('/connect');
      } else {
        await signUp({ email, password, displayName: displayName || email.split('@')[0], workspaceName });
        await login({ email, password });
        router.push('/connect');
      }
    } catch {
      /* error set by hook */
    }
  };

  return (
    <div className="auth">
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
                <label className="label" htmlFor="displayName">
                  {t('auth.displayName')}
                </label>
                <input
                  id="displayName"
                  className="input"
                  placeholder="Diego Salinas"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label" htmlFor="workspace">
                  {t('auth.workspace')}
                </label>
                <input
                  id="workspace"
                  className="input"
                  placeholder="Acme"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, textAlign: 'center' }}>
          <Logo size={88} />
          <div
            style={{
              marginTop: 32,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--fg)',
              lineHeight: 1.15,
            }}
          >
            {t('auth.art.title')}
            <br />
            <span style={{ color: 'var(--fg-muted)' }}>{t('auth.art.subtitle')}</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.6 }}>
            {t('auth.art.body')}
          </div>
        </div>
      </div>
    </div>
  );
};
