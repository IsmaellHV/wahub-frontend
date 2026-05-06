import type { IAuditFields } from '@shared/Domain/ILogDocument';

export interface IUsuario extends IAuditFields {
  _id?: string | null;
  id?: number;
  username: string;
  primerApellido: string;
  segundoApellido: string;
  nombres: string;
  email: string;
  correo?: string;
  telefono?: string | null;
}

export interface IAuthSession {
  user: IUsuario;
  accessToken: string;
  refreshToken: string;
  expIn: number;
}

export interface IDtoLogin {
  email: string;
  password: string;
}

export interface IDtoSignUp {
  username: string;
  email: string;
  password: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  telefono?: string | null;
}

export interface IDtoUpdateProfile {
  nombres?: string;
  primerApellido?: string;
  segundoApellido?: string;
  telefono?: string | null;
}
