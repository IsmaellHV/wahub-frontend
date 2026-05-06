'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@shared/UI/components/Topbar';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { AdapterStorage, STORAGE_KEYS } from '@shared/Infrastructure/AdapterStorage';
import { RepositoryUsuarioImpl } from '../Infrastructure/RepositoryImpl';
import { useUsuario } from '../Application/useUsuario';
import { broadcastUserChanged, displayNameOf, initialsOf } from '../Application/useCurrentUser';
import type { IUsuario } from '../Domain/IUsuario';

const repo = new RepositoryUsuarioImpl();

export const ProfileScreen = () => {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const { logout } = useUsuario();
  const [user, setUser] = useState<IUsuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [nombres, setNombres] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    // Hydrate immediately from cache so the header isn't blank during the network roundtrip
    const hydrate = (u: IUsuario) => {
      setUser(u);
      setNombres(u.nombres ?? '');
      setPrimerApellido(u.primerApellido ?? '');
      setSegundoApellido(u.segundoApellido ?? '');
      setTelefono(u.telefono ?? '');
    };
    const cached = AdapterStorage.get(STORAGE_KEYS.USER);
    if (cached) {
      try {
        hydrate(JSON.parse(cached) as IUsuario);
      } catch {
        /* ignore */
      }
    }
    repo
      .me()
      .then((u) => {
        hydrate(u);
        AdapterStorage.set(STORAGE_KEYS.USER, JSON.stringify(u));
        broadcastUserChanged();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const saveProfile = async () => {
    if (!nombres.trim() || !primerApellido.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const updated = await repo.updateProfile({
        nombres: nombres.trim(),
        primerApellido: primerApellido.trim(),
        segundoApellido: segundoApellido.trim(),
        telefono: telefono.trim() || null,
      });
      setUser(updated);
      AdapterStorage.set(STORAGE_KEYS.USER, JSON.stringify(updated));
      broadcastUserChanged();
      setProfileMsg({ type: 'ok', text: t('profile.saved') });
    } catch (e) {
      setProfileMsg({ type: 'err', text: (e as { message?: string })?.message ?? 'Error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'err', text: 'Mínimo 6 caracteres' });
      return;
    }
    setSavingPwd(true);
    try {
      await repo.changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdMsg({ type: 'ok', text: t('profile.saved') });
    } catch (e) {
      setPwdMsg({ type: 'err', text: (e as { message?: string })?.message ?? 'Error' });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <>
      <Topbar crumbs={[t('profile.title')]} />
      <div className="page page-narrow fade-in">
        <div className="page-h">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div
              className="avatar"
              style={{
                width: 56,
                height: 56,
                fontSize: 18,
                background: 'linear-gradient(135deg, var(--brand-400), var(--brand-700))',
                boxShadow: '0 6px 16px -6px color-mix(in srgb, var(--brand-500) 50%, transparent)',
              }}
            >
              {initialsOf(user)}
            </div>
            <div>
              <h1 style={{ marginBottom: 4 }}>{displayNameOf(user) || t('profile.title')}</h1>
              <div className="sub">{user?.email ?? t('profile.subtitle')}</div>
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-secondary" onClick={handleLogout}>
              <Icon name="power" size={14} /> {t('nav.logout')}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--fg-muted)' }}>{t('common.loading')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Account */}
            <div className="card">
              <div className="card-h">
                <h3>{t('profile.account')}</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FieldLabel>{t('profile.changeEmail')}</FieldLabel>
                <input className="input" value={user?.email ?? ''} disabled style={{ opacity: 0.6 }} />

                <FieldLabel>{t('profile.nombres') ?? 'Nombres'}</FieldLabel>
                <input
                  className="input"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  maxLength={100}
                />

                <FieldLabel>{t('profile.primerApellido') ?? 'Primer apellido'}</FieldLabel>
                <input
                  className="input"
                  value={primerApellido}
                  onChange={(e) => setPrimerApellido(e.target.value)}
                  maxLength={100}
                />

                <FieldLabel>{t('profile.segundoApellido') ?? 'Segundo apellido'}</FieldLabel>
                <input
                  className="input"
                  value={segundoApellido}
                  onChange={(e) => setSegundoApellido(e.target.value)}
                  maxLength={100}
                />

                <FieldLabel>{t('profile.telefono') ?? 'Teléfono'}</FieldLabel>
                <input
                  className="input"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  maxLength={30}
                />

                <FieldLabel>{t('profile.language')}</FieldLabel>
                <select
                  className="input"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as 'en' | 'es')}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>

                {profileMsg && <Banner type={profileMsg.type}>{profileMsg.text}</Banner>}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-brand" onClick={saveProfile} disabled={savingProfile || !nombres.trim() || !primerApellido.trim()}>
                    <Icon name="check" size={14} /> {t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="card">
              <div className="card-h">
                <h3>{t('profile.changePassword')}</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FieldLabel>{t('profile.currentPassword')}</FieldLabel>
                <input
                  className="input"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  autoComplete="current-password"
                />

                <FieldLabel>{t('profile.newPassword')}</FieldLabel>
                <input
                  className="input"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  autoComplete="new-password"
                />

                <FieldLabel>{t('profile.confirmPassword')}</FieldLabel>
                <input
                  className="input"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  autoComplete="new-password"
                />

                {pwdMsg && <Banner type={pwdMsg.type}>{pwdMsg.text}</Banner>}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-brand"
                    onClick={savePassword}
                    disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
                  >
                    <Icon name="key" size={14} /> {t('profile.updatePassword')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 550, marginBottom: -8 }}>{children}</label>
);

const Banner = ({ type, children }: { type: 'ok' | 'err'; children: React.ReactNode }) => (
  <div
    style={{
      padding: '10px 14px',
      borderRadius: 'var(--r-md)',
      background:
        type === 'ok'
          ? 'color-mix(in srgb, var(--status-online) 10%, transparent)'
          : 'color-mix(in srgb, var(--status-error) 10%, transparent)',
      color: type === 'ok' ? 'var(--status-online)' : 'var(--status-error)',
      fontSize: 13,
    }}
  >
    {children}
  </div>
);
