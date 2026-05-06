export interface ILogUsuario {
  _id?: string | null;
  username?: string | null;
  primerApellido?: string;
  segundoApellido?: string;
  nombres?: string;
  correo?: string;
  email?: string;
  telefono?: string | null;
  estado?: boolean | null;
}

export interface ILogDocument {
  fecha: string | Date;
  origen: string;
  agente: unknown;
  ip: string;
  usuario: ILogUsuario;
}

export interface IAuditFields {
  registrar?: ILogDocument;
  actualizar?: ILogDocument | null;
  eliminar?: ILogDocument | null;
  estado?: boolean;
}
