'use client';
import { useState } from 'react';
import { Topbar } from '@shared/UI/components/Topbar';
import { Icon } from '@shared/UI/components/Icon';
import { useI18n } from '@shared/i18n/I18nProvider';
import { ApiKeysScreen } from './ApiKeysScreen';
import { WebhooksScreen } from '@acceso/webhooks/UI/WebhooksScreen';

type Tab = 'keys' | 'webhooks';

export const ApiHubScreen = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('keys');

  return (
    <>
      <Topbar crumbs={[t('nav.api')]} />
      <div className="page fade-in">
        <div className="row" style={{ gap: 4, marginBottom: 16 }}>
          <button
            onClick={() => setTab('keys')}
            className={`btn btn-sm ${tab === 'keys' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <Icon name="key" size={13} /> Claves de API
          </button>
          <button
            onClick={() => setTab('webhooks')}
            className={`btn btn-sm ${tab === 'webhooks' ? 'btn-secondary' : 'btn-ghost'}`}
          >
            <Icon name="webhook" size={13} /> Webhooks
          </button>
        </div>

        {tab === 'keys' ? <ApiKeysScreen /> : <WebhooksScreen />}
      </div>
    </>
  );
};
