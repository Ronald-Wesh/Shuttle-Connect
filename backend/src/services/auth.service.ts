import type { AuthenticatedUser } from "../interfaces/auth.interface";
import { supabase } from "../config/supabase";
import { throwDatabaseError } from "../repositories/repositoryUtils";
import { supabaseAuth } from "../config/supabase";
import type { AuthPayload, SignInInput, SignUpInput } from "../interfaces/auth.interface";
import { badRequest, unauthorized } from "../utils/httpError";

export class AuthService {
  async getCurrentUser(user: AuthenticatedUser) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, company:companies!profiles_company_id_fkey(*)")
      .eq("id", user.id)
      .maybeSingle();

    throwDatabaseError(error);

    return {
      ...user,
      profile: data
    };
  }

  async signIn(input: SignInInput): Promise<AuthPayload> {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });

    if (error || !data.user) {
      throw unauthorized(error?.message ?? "Invalid email or password");
    }

    return {
      session: data.session,
      user: data.user
    };
  }

  async signUp(input: SignUpInput): Promise<AuthPayload> {
    const { data, error } = await supabaseAuth.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName
        }
      }
    });

    if (error) {
      throw badRequest(error.message);
    }

    return {
      session: data.session,
      user: data.user
    };
  }
}

export const authService = new AuthService();
