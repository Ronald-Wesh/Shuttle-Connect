export const ROLES = {
  SUPER_ADMIN: "super_admin",
  COMPANY_OWNER: "company_owner",
  MANAGER: "manager",
  AGENT: "agent",
  DRIVER: "driver",
  CUSTOMER: "customer"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const COMPANY_STAFF_ROLES: Role[] = [
  ROLES.COMPANY_OWNER,
  ROLES.MANAGER,
  ROLES.AGENT,
  ROLES.DRIVER
];

export const MANAGEMENT_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_OWNER,
  ROLES.MANAGER
];
