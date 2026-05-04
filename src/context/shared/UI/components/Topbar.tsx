'use client';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '@shared/i18n/I18nProvider';

interface Props {
  crumbs?: string[];
  actions?: ReactNode;
}

const toggleMobileSidebar = () => {
  const app = document.querySelector('.app');
  if (!app) return;
  const willOpen = !app.classList.contains('sidebar-open');
  app.classList.toggle('sidebar-open', willOpen);
  document.body.style.overflow = willOpen ? 'hidden' : '';
};

export const Topbar = ({ crumbs = [], actions }: Props) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  return (
    <div className="topbar">
      <button
        className="topbar-menu-btn icon-btn"
        onClick={toggleMobileSidebar}
        aria-label="Menu"
        title="Menu"
      >
        <Icon name="menu" size={18} />
      </button>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span className="crumb-sep">/</span>}
            <span className={`crumb ${i === crumbs.length - 1 ? 'active' : ''}`}>{c}</span>
          </span>
        ))}
      </div>
      <div className="topbar-actions">
        {actions}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
          aria-label={theme === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={16} />
        </button>
      </div>
    </div>
  );
};
