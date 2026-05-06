'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';
import { useI18n } from '@shared/i18n/I18nProvider';
import { useCurrentUser, initialsOf, displayNameOf } from '@acceso/usuarios/Application/useCurrentUser';
import { useUsuario } from '@acceso/usuarios/Application/useUsuario';

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
  dot?: boolean;
  beta?: boolean;
}

// Labels are translated at render time via useI18n; this list is just the structure.
const PRIMARY = (t: (k: string) => string): NavItem[] => [
  { href: '/dashboard', label: t('nav.dashboard'), icon: 'home' },
  { href: '/connect', label: t('nav.connect'), icon: 'qr' },
  { href: '/bots', label: t('nav.sessions'), icon: 'bot' },
  { href: '/inbox', label: t('nav.inbox'), icon: 'chat', dot: true },
  { href: '/messages', label: t('nav.sendMessage'), icon: 'send' },
  { href: '/agents', label: t('nav.aiAgents'), icon: 'sparkles', beta: true },
  { href: '/broadcast', label: t('nav.broadcast'), icon: 'send' },
  { href: '/contacts', label: t('nav.contacts'), icon: 'contacts' },
];

const BUILD = (t: (k: string) => string): NavItem[] => [
  { href: '/flows', label: t('nav.flows'), icon: 'flow', beta: true },
  { href: '/analytics', label: t('nav.analytics'), icon: 'chart' },
  { href: '/api', label: t('nav.api'), icon: 'webhook' },
];

const isActive = (pathname: string, href: string) => {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
};

const closeMobileSidebar = () => {
  const app = document.querySelector('.app');
  if (!app) return;
  app.classList.remove('sidebar-open');
  document.body.style.overflow = '';
};

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const user = useCurrentUser();
  const { logout } = useUsuario();

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    router.push('/login');
  };

  const primary = PRIMARY(t);
  const build = BUILD(t);

  return (
    <>
      <div
        className="sidebar-backdrop"
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="brand">
          <Logo size={26} />
          <span>waHub</span>
        </Link>
        <button
          className="workspace-switch"
          title={`Locale: ${locale}`}
          onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
        >
          {locale.toUpperCase()}
        </button>
      </div>

      <div className="sidebar-section">
        {primary.map((it) => (
          <Link key={it.href} href={it.href} onClick={closeMobileSidebar} className={`nav-item ${isActive(pathname, it.href) ? 'active' : ''}`}>
            <span className="nav-icon">
              <Icon name={it.icon} size={15} />
            </span>
            <span>{it.label}</span>
            {it.beta && <span className="beta-badge">BETA</span>}
            {it.dot && <span className="nav-dot" />}
            {it.badge && !it.dot && <span className="nav-badge">{it.badge}</span>}
          </Link>
        ))}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Build</div>
        {build.map((it) => (
          <Link key={it.href} href={it.href} onClick={closeMobileSidebar} className={`nav-item ${isActive(pathname, it.href) ? 'active' : ''}`}>
            <span className="nav-icon">
              <Icon name={it.icon} size={15} />
            </span>
            <span>{it.label}</span>
            {it.beta && <span className="beta-badge">BETA</span>}
          </Link>
        ))}
      </div>

      <div className="sidebar-section">
        <Link href="/profile" onClick={closeMobileSidebar} className={`nav-item ${isActive(pathname, '/profile') ? 'active' : ''}`}>
          <span className="nav-icon">
            <Icon name="user" size={15} />
          </span>
          <span>{t('nav.profile')}</span>
        </Link>
        <Link href="/settings" onClick={closeMobileSidebar} className={`nav-item ${isActive(pathname, '/settings') ? 'active' : ''}`}>
          <span className="nav-icon">
            <Icon name="settings" size={15} />
          </span>
          <span>{t('nav.settings')}</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <Link
          href="/profile"
          onClick={closeMobileSidebar}
          className="user-link"
          aria-label={t('nav.profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: 1,
            textDecoration: 'none',
            color: 'inherit',
            padding: '4px 8px',
            margin: '-4px -8px',
            borderRadius: 'var(--r-md)',
            transition: 'background .15s',
            minWidth: 0,
          }}
        >
          <div className="avatar">{initialsOf(user)}</div>
          <div className="user-meta" style={{ minWidth: 0 }}>
            <span
              className="name"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {displayNameOf(user) || '—'}
            </span>
            <span
              className="org"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user?.email ?? ''}
            </span>
          </div>
        </Link>
        <button
          className="icon-btn"
          onClick={handleLogout}
          title={t('nav.logout')}
          aria-label={t('nav.logout')}
          style={{ flexShrink: 0 }}
        >
          <Icon name="power" size={14} />
        </button>
      </div>
    </aside>
    </>
  );
};
