const dash = (v: string): string => v.replace(/_/g, '-');

const buildRoute = (schema: string, entity: string): string => `/${dash(schema)}/${dash(entity)}`;

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Without NEXT_PUBLIC_* the app talks to the domain it was served from, so the
// same image works on any domain. Set them only when the backend lives
// elsewhere (local development).
const fromPage = (scheme: 'http' | 'ws', path: string): string => {
  if (typeof window === 'undefined') return '';
  const secure = window.location.protocol === 'https:';
  const proto = scheme === 'ws' ? (secure ? 'wss' : 'ws') : secure ? 'https' : 'http';
  return `${proto}://${window.location.host}${path}`;
};

export const ENVIRONMENT = {
  APP: {
    get URL(): string {
      return process.env.NEXT_PUBLIC_APP_URL || fromPage('http', BASE_PATH);
    },
  },

  API: {
    URL: (process.env.NEXT_PUBLIC_API_URL || '/api/wahub').replace(/\/$/, ''),
  },

  WS: {
    get URL(): string {
      return process.env.NEXT_PUBLIC_WS_URL || fromPage('ws', '/wsWahub/');
    },
  },

  USUARIO: {
    SCHEMA: 'acceso',
    ENTITY: 'usuarios',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  TOKEN: {
    SCHEMA: 'acceso',
    ENTITY: 'token',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  API_KEY: {
    SCHEMA: 'acceso',
    ENTITY: 'api_keys',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  WEBHOOK: {
    SCHEMA: 'acceso',
    ENTITY: 'webhooks',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  CONNECTION: {
    SCHEMA: 'wsp',
    ENTITY: 'connections',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  BOT: {
    SCHEMA: 'wsp',
    ENTITY: 'bots',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  CONVERSATION: {
    SCHEMA: 'wsp',
    ENTITY: 'conversations',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  MESSAGE_GROUP: {
    SCHEMA: 'wsp',
    ENTITY: 'message_groups',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  MESSAGE: {
    SCHEMA: 'wsp',
    ENTITY: 'messages',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  BROADCAST: {
    SCHEMA: 'wsp',
    ENTITY: 'broadcasts',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  AI_AGENT: {
    SCHEMA: 'wsp',
    ENTITY: 'ai_agents',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },

  FLOW: {
    SCHEMA: 'wsp',
    ENTITY: 'flows',
    get ROUTE() {
      return buildRoute(this.SCHEMA, this.ENTITY);
    },
  },
};
