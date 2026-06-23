import type { NextFunction, Request, Response } from "express";
import { ROLES, type Role } from "../constants/roles";
import {
  hasAnyPermission,
  type Permission
} from "../constants/permissions";
import { supabase, supabaseAuth } from "../config/supabase";
import { asyncHandler } from "../utils/asyncHandler";
import { forbidden, unauthorized } from "../utils/httpError";

const profileSelect = "id,email,phone,full_name,role,company_id";

const getBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw unauthorized();
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw unauthorized();
  }

  return token;
};

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    throw unauthorized("Invalid or expired access token");
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    throw unauthorized("Could not load authenticated profile");
  }

  let profile = existingProfile;

  if (!profile) {
    const { data: createdProfile, error: createProfileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          email: data.user.email ?? null,
          phone: data.user.phone ?? null,
          role: ROLES.CUSTOMER
        },
        { onConflict: "id" }
      )
      .select(profileSelect)
      .single();

    if (createProfileError || !createdProfile) {
      throw unauthorized("Could not create authenticated profile");
    }

    profile = createdProfile;
  }

  req.user = {
    id: data.user.id,
    email: profile?.email ?? data.user.email ?? undefined,
    phone: profile?.phone ?? data.user.phone ?? undefined,
    fullName: profile?.full_name ?? undefined,
    role: (profile?.role ?? ROLES.CUSTOMER) as Role,
    companyId: profile?.company_id ?? undefined
  };

  next();
});

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw unauthorized();
    }

    if (req.user.role === ROLES.SUPER_ADMIN) {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw forbidden();
    }

    next();
  };

export const requirePermission =
  (...permissions: Permission[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw unauthorized();
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      throw forbidden("Your role cannot perform this action");
    }

    next();
  };
