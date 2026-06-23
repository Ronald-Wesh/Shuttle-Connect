import type { AuthenticatedUser } from "../interfaces/auth.interface";
import { ROLES } from "../constants/roles";
import { forbidden } from "../utils/httpError";

interface ResolveCompanyOptions {
  allowSuperAdminGlobal?: boolean;
}

export const resolveCompanyId = (
  user: AuthenticatedUser,
  requestedCompanyId?: string,
  options: ResolveCompanyOptions = {}
) => {
  if (user.role === ROLES.SUPER_ADMIN && requestedCompanyId) {
    return requestedCompanyId;
  }

  if (user.role === ROLES.SUPER_ADMIN && options.allowSuperAdminGlobal) {
    return undefined;
  }

  if (user.role === ROLES.SUPER_ADMIN && user.companyId) {
    return user.companyId;
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    throw forbidden("companyId is required for this tenant-scoped action");
  }

  if (!user.companyId) {
    throw forbidden("This action requires an active company profile");
  }

  if (requestedCompanyId && requestedCompanyId !== user.companyId) {
    throw forbidden("You cannot access another company's data");
  }

  return user.companyId;
};

export const canAccessCompany = (
  user: AuthenticatedUser,
  companyId?: string | null
) => {
  if (!companyId) {
    return false;
  }

  return user.role === ROLES.SUPER_ADMIN || user.companyId === companyId;
};

export const assertCompanyAccess = (
  user: AuthenticatedUser,
  companyId?: string | null
) => {
  if (!canAccessCompany(user, companyId)) {
    throw forbidden("You cannot access another company's data");
  }
};
