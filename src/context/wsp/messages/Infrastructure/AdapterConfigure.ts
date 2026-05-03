import { ENVIRONMENT } from '@env';

export const AdapterConfigure = {
  SCHEMA: ENVIRONMENT.MESSAGE.SCHEMA,
  ENTITY: ENVIRONMENT.MESSAGE.ENTITY,
  ROUTE: ENVIRONMENT.MESSAGE.ROUTE,

  ENDPOINT: {
    SEND: ENVIRONMENT.MESSAGE.ROUTE,
    LIST: (connectionId: number, limit?: number) =>
      `${ENVIRONMENT.MESSAGE.ROUTE}?connection_id=${connectionId}${limit ? `&limit=${limit}` : ''}`,
  },
};
