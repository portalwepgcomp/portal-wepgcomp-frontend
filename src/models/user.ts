export type ProfileType = "Professor" | "Presenter" | "Listener";
export type SubprofileType = "Doctorate" | "Master" | "Bachelor" | "Other";
export type RoleType = "Admin" | "Default";
export type StatusType = "Active" | "Inactive";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  registrationNumber: string;
  photoFilePath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lattesUrl?: string;
}

export interface GetUserParams {
  profiles?: ProfileType | ProfileType[] | string;
  subprofiles?: SubprofileType;
  roles?: RoleType | RoleType[] | string;
  status?: StatusType;
  /** Busca server-side por nome ou e-mail. */
  search?: string;
  /** Número da página (base 1) para paginação por envelope (P3.2). */
  page?: number;
  /** Quantidade de registros por página. */
  pageSize?: number;
  /** Se true, o backend responde com envelope PaginatedResponse. */
  paginated?: boolean;
}

export interface SetPermissionParams {
  requestUserId: string;
  targetUserId: string;
}

export interface RegisterUserParams {
  name: string;
  email: string;
  password: string;
  linkLattes?: string;
  photoFilePath?: string;
  profile: ProfileType;
  areaExpertise?: string;
  biography?: string;
  registrationNumber?: string;
  registrationNumberType?: "CPF" | "MATRICULA";
  subprofile?: SubprofileType | null;
}

export interface User extends RegisterUserParams {
  id: string;
  createdAt: Date;
  deletedAt: Date;
  updatedAt: Date;
  level: RoleType;
  isActive: boolean;
  isTeacherActive: boolean;
  isPresenterActive: boolean;
  hasSubmission: boolean;
}

export interface ResetPasswordSendEmailParams {
  email: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

export interface CreateProfessorByAdminParams {
  name: string;
  email: string;
  registrationNumber: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  name: string;
  profile: ProfileType;
  level: RoleType;
  isActive: boolean;
}

export interface RegistrationNumberType {
  CPF: "CPF";
  MATRICULA: "MATRICULA";
}
