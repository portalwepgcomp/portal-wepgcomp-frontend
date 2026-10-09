import { ProfileType, RoleType, RegistrationNumberType } from "@/models/user";

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  registrationNumber?: string;
  registrationNumberType?: RegistrationNumberType;
  linkLattes?: string;
  photoFilePath?: string;
  profile?: ProfileType;
  level?: RoleType;
}

/** Campos que o próprio usuário pode alterar (PATCH /users/me). */
export interface UpdateMeRequest {
  name?: string;
  /** String vazia remove o link. */
  linkLattes?: string;
  /** Só dígitos. Para apresentador/professor aprovado, exige nova aprovação. */
  registrationNumber?: string;
}

export interface UpdateUserResponse {
  id: string;
  name: string;
  email: string;
  registrationNumber: string | null;
  registrationNumberType: "CPF" | "MATRICULA" | null;
  photoFilePath: string | null;
  profile: "Presenter" | "Professor" | "Listener";
  level: "Admin" | "Default";
  isActive: boolean;
  isVerified: boolean;
  isTeacherActive: boolean;
  isPresenterActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
}
