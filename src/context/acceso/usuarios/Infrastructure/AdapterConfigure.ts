import { ENVIRONMENT } from '@env';

// Single source of truth for this entity's API surface.
// Pulled from ENVIRONMENT so backend changes only need an env update.
export const AdapterConfigure = {
  SCHEMA: ENVIRONMENT.USUARIO.SCHEMA,
  ENTITY: ENVIRONMENT.USUARIO.ENTITY,
  ROUTE: ENVIRONMENT.USUARIO.ROUTE, // '/acceso/usuarios'

  ENDPOINT: {
    LOGIN: `${ENVIRONMENT.USUARIO.ROUTE}/login`,
    SIGNUP: `${ENVIRONMENT.USUARIO.ROUTE}/signup`,
    ME: `${ENVIRONMENT.USUARIO.ROUTE}/me`,
    UPDATE_PROFILE: `${ENVIRONMENT.USUARIO.ROUTE}/me`,
    CHANGE_PASSWORD: `${ENVIRONMENT.USUARIO.ROUTE}/me/password`,
  },
};
