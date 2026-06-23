import type { Role } from "../constants/roles";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: Role;
  companyId?: string;
}

export interface AuthProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  role: Role;
  company_id?: string;
}

export interface AuthSessionUser {
  id: string;
  email?: string;
  phone?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

export interface AuthSessionData {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: AuthSessionUser | null;
}

export interface AuthPayload {
  session: AuthSessionData | null;
  user: AuthSessionUser | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  fullName: string;
}
