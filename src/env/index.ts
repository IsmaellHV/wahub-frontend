const dash = (v: string): string => v.replace(/_/g, '-');

const buildRoute = (schema: string, entity: string): string => `/${dash(schema)}/${dash(entity)}`;

export const ENVIRONMENT = {
  APP: {
    URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  API: {
    URL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api/wahub').replace(/\/$/, ''),
  },

  WS: {
    URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
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
};
