import { ENVIRONMENT } from '@env';

export const AdapterConfigure = {
  SCHEMA: ENVIRONMENT.CONNECTION.SCHEMA,
  ENTITY: ENVIRONMENT.CONNECTION.ENTITY,
  ROUTE: ENVIRONMENT.CONNECTION.ROUTE, // '/wsp/connections'

  ENDPOINT: {
    LIST: ENVIRONMENT.CONNECTION.ROUTE,
    CREATE: ENVIRONMENT.CONNECTION.ROUTE,
    REMOVE: (id: number | string) => `${ENVIRONMENT.CONNECTION.ROUTE}/${id}`,
    REGENERATE: (id: number | string) => `${ENVIRONMENT.CONNECTION.ROUTE}/${id}/regenerate`,
    DISCONNECT: (id: number | string) => `${ENVIRONMENT.CONNECTION.ROUTE}/${id}/disconnect`,
    RENAME: (id: number | string) => `${ENVIRONMENT.CONNECTION.ROUTE}/${id}`,
  },

  WS: {
    // Read on every connect, not when the module loads: without NEXT_PUBLIC_WS_URL
    // it comes from window.location, which only exists in the browser.
    get URL(): string {
      return ENVIRONMENT.WS.URL;
    },
    EVENT_SUBSCRIBE: 'subscribe-connection',
    CHANNEL: (id: number) => `connection:${id}`,
  },
};
