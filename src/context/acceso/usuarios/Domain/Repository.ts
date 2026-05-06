import type { IAuthSession, IDtoLogin, IDtoSignUp, IDtoUpdateProfile, IUsuario } from './IUsuario';

export interface IRepositoryUsuario {
  login(dto: IDtoLogin): Promise<IAuthSession>;
  signUp(dto: IDtoSignUp): Promise<IUsuario>;
  me(): Promise<IUsuario>;
  updateProfile(dto: IDtoUpdateProfile): Promise<IUsuario>;
  changePassword(dto: { currentPassword: string; newPassword: string }): Promise<boolean>;
}
