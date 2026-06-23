import { ROLES } from "../constants/roles";
import { supabase } from "../config/supabase";
import type {
  CreateCompanyInput,
  UpdateCompanyInput
} from "../interfaces/company.interface";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import { resolveCompanyId } from "../middleware/company.middleware";
import { companyRepository } from "../repositories/company.repository";
import { throwDatabaseError } from "../repositories/repositoryUtils";
import { auditService } from "./audit.service";
import { conflict, notFound } from "../utils/httpError";

export class CompanyService {
  async create(input: CreateCompanyInput, user: AuthenticatedUser) {
    if (user.companyId && user.role !== ROLES.SUPER_ADMIN) {
      throw conflict("Your profile is already attached to a company");
    }

    const company = await companyRepository.create({
      name: input.name,
      registration_number: input.registrationNumber ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      owner_id: user.role === ROLES.SUPER_ADMIN ? null : user.id
    });

    if (user.role !== ROLES.SUPER_ADMIN) {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_id: company.id,
          role: ROLES.COMPANY_OWNER
        })
        .eq("id", user.id);

      throwDatabaseError(error);
    }

    await auditService.log({
      companyId: company.id,
      actorId: user.id,
      action: "company.created",
      entityType: "company",
      entityId: company.id
    });

    return company;
  }

  async getById(id: string, user: AuthenticatedUser) {
    resolveCompanyId(user, id);
    const company = await companyRepository.findById(id);

    if (!company) {
      throw notFound("Company not found");
    }

    return company;
  }

  async update(id: string, input: UpdateCompanyInput, user: AuthenticatedUser) {
    const companyId = resolveCompanyId(user, id) as string;
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.registrationNumber !== undefined) {
      payload.registration_number = input.registrationNumber;
    }
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.email !== undefined) payload.email = input.email;
    if (input.isActive !== undefined) payload.is_active = input.isActive;

    const company = await companyRepository.update(companyId, payload);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "company.updated",
      entityType: "company",
      entityId: companyId,
      metadata: payload
    });

    return company;
  }
}

export const companyService = new CompanyService();
