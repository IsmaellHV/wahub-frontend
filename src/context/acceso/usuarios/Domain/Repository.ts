import type { IAuthSession, IDtoLogin, IDtoSignUp, IUsuario } from './IUsuario';

export interface IRepositoryUsuario {
  login(dto: IDtoLogin): Promise<IAuthSession>;
  signUp(dto: IDtoSignUp): Promise<IUsuario>;
  me(): Promise<IUsuario>;
  updateProfile(dto: { display_name?: string; username?: string }): Promise<IUsuario>;
  changePassword(dto: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }>;
}
