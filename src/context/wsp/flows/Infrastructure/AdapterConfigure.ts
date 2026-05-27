import { ENVIRONMENT } from '@env';

export const AdapterConfigure = {
  SCHEMA: ENVIRONMENT.FLOW.SCHEMA,
  ENTITY: ENVIRONMENT.FLOW.ENTITY,
  ROUTE: ENVIRONMENT.FLOW.ROUTE,

  ENDPOINT: {
    LIST: ENVIRONMENT.FLOW.ROUTE,
    GET: (id: number | string) => `${ENVIRONMENT.FLOW.ROUTE}/${id}`,
    CREATE: ENVIRONMENT.FLOW.ROUTE,
    UPDATE: (id: number | string) => `${ENVIRONMENT.FLOW.ROUTE}/${id}`,
    TOGGLE: (id: number | string) => `${ENVIRONMENT.FLOW.ROUTE}/${id}/enabled`,
    REMOVE: (id: number | string) => `${ENVIRONMENT.FLOW.ROUTE}/${id}`,
  },
};
