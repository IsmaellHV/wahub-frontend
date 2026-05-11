import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryUsuario } from '../Domain/Repository';
import type { IAuthSession, IDtoLogin, IDtoSignUp, IDtoUpdateProfile, IUsuario } from '../Domain/IUsuario';

// Backend renombró la PK numérica a `i` (Phase 3) y Postgres devuelve columnas
// en minúsculas (`primerapellido`, `segundoapellido`). Normalizamos en boundary.
const normalizeUser = (row: Record<string, unknown>): IUsuario => {
  const r = row as Record<string, unknown> & { i?: number; id?: number; primerapellido?: string; segundoapellido?: string };
  return {
    ...(row as unknown as IUsuario),
    id: r.id ?? r.i ?? 0,
    primerApellido: (r.primerApellido as string) ?? r.primerapellido ?? '',
    segundoApellido: (r.segundoApellido as string) ?? r.segundoapellido ?? '',
  } as IUsuario;
};

export class RepositoryUsuarioImpl implements IRepositoryUsuario {
  async login(dto: IDtoLogin): Promise<IAuthSession> {
    const res = await AdapterApi.post<{ user: Record<string, unknown>; accessToken: string; refreshToken: string; expIn: number }>(
      AdapterConfigure.ENDPOINT.LOGIN,
      dto,
      { auth: false },
    );
    return { ...res, user: normalizeUser(res.user) };
  }

  async signUp(dto: IDtoSignUp): Promise<IUsuario> {
    const row = await AdapterApi.post<Record<string, unknown>>(AdapterConfigure.ENDPOINT.SIGNUP, dto, { auth: false });
    return normalizeUser(row);
  }

  async me(): Promise<IUsuario> {
    const row = await AdapterApi.get<Record<string, unknown>>(AdapterConfigure.ENDPOINT.ME);
    return normalizeUser(row);
  }

  async updateProfile(dto: IDtoUpdateProfile): Promise<IUsuario> {
    const row = await AdapterApi.request<Record<string, unknown>>(AdapterConfigure.ENDPOINT.UPDATE_PROFILE, {
      method: 'PATCH',
      body: dto,
    });
    return normalizeUser(row);
  }

  changePassword(dto: { currentPassword: string; newPassword: string }): Promise<boolean> {
    return AdapterApi.put<boolean>(AdapterConfigure.ENDPOINT.CHANGE_PASSWORD, dto);
  }
}
