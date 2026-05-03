'use client';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '@shared/i18n/I18nProvider';

interface Props {
  crumbs?: string[];
  actions?: ReactNode;
}

export const Topbar = ({ crumbs = [], actions }: Props) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  return (
    <div className="topbar">
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
