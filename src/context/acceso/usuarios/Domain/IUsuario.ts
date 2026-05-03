export interface IUsuario {
  id: number;
  email: string;
  display_name: string;
  rol_id: number;
  estado: number;
  workspace_id?: number | null;
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
  email: string;
  password: string;
  displayName: string;
  workspaceName?: string;
}
