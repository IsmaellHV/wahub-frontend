import { ENVIRONMENT } from '@env';

export const AdapterConfigure = {
  SCHEMA: ENVIRONMENT.BOT.SCHEMA,
  ENTITY: ENVIRONMENT.BOT.ENTITY,
  ROUTE: ENVIRONMENT.BOT.ROUTE,

  ENDPOINT: {
    LIST: ENVIRONMENT.BOT.ROUTE,
    BY_ID: (id: string | number) => `${ENVIRONMENT.BOT.ROUTE}/${id}`,
  },
};
