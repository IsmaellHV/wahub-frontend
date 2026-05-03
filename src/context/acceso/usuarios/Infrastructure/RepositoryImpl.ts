import { AdapterApi } from '@shared/Infrastructure/AdapterApi';
import { AdapterConfigure } from './AdapterConfigure';
import type { IRepositoryUsuario } from '../Domain/Repository';
import type { IAuthSession, IDtoLogin, IDtoSignUp, IUsuario } from '../Domain/IUsuario';

export class RepositoryUsuarioImpl implements IRepositoryUsuario {
  login(dto: IDtoLogin): Promise<IAuthSession> {
    return AdapterApi.post<IAuthSession>(AdapterConfigure.ENDPOINT.LOGIN, dto, { auth: false });
  }

  signUp(dto: IDtoSignUp): Promise<IUsuario> {
    return AdapterApi.post<IUsuario>(AdapterConfigure.ENDPOINT.SIGNUP, dto, { auth: false });
  }

  me(): Promise<IUsuario> {
    return AdapterApi.get<IUsuario>(AdapterConfigure.ENDPOINT.ME);
  }

  updateProfile(dto: { display_name?: string; username?: string }): Promise<IUsuario> {
    return AdapterApi.request<IUsuario>(AdapterConfigure.ENDPOINT.UPDATE_PROFILE, {
      method: 'PATCH',
      body: dto,
    });
  }

  changePassword(dto: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }> {
    return AdapterApi.put<{ ok: boolean }>(AdapterConfigure.ENDPOINT.CHANGE_PASSWORD, dto);
  }
}
