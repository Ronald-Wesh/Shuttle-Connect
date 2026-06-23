import type { AuthenticatedUser } from "../interfaces/auth.interface";
import type {
  CreatePassengerInput,
  UpdatePassengerInput
} from "../interfaces/passenger.interface";
import { ROLES } from "../constants/roles";
import {
  assertCompanyAccess,
  resolveCompanyId
} from "../middleware/company.middleware";
import { passengerRepository } from "../repositories/passenger.repository";
import { auditService } from "./audit.service";
import { getPagination, getPaginationMeta } from "../utils/pagination";
import { notFound } from "../utils/httpError";

export class PassengerService {
  async create(input: CreatePassengerInput, user: AuthenticatedUser) {
    const companyId = resolveCompanyId(user, input.companyId);
    const passenger = await passengerRepository.create({
      company_id: companyId,
      user_id: user.id,
      full_name: input.fullName,
      phone: input.phone,
      email: input.email ?? null,
      national_id: input.nationalId ?? null
    });

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "passenger.created",
      entityType: "passenger",
      entityId: passenger.id
    });

    return passenger;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & { companyId?: string; search?: string }
  ) {
    const companyId = resolveCompanyId(user, query.companyId) as string;
    const { page, limit, from, to } = getPagination(query);
    const result = await passengerRepository.findAll({
      companyId,
      search: query.search,
      from,
      to
    });

    return {
      passengers: result.data,
      meta: getPaginationMeta(page, limit, result.count)
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const companyId =
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
    const passenger = await passengerRepository.findById(id, companyId);

    if (!passenger) {
      throw notFound("Passenger not found");
    }

    assertCompanyAccess(user, passenger.company_id);

    return passenger;
  }

  async update(
    id: string,
    input: UpdatePassengerInput,
    user: AuthenticatedUser
  ) {
    const existingPassenger = await passengerRepository.findById(
      id,
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user)
    );

    if (!existingPassenger) {
      throw notFound("Passenger not found");
    }

    assertCompanyAccess(user, existingPassenger.company_id);
    const companyId = existingPassenger.company_id as string;
    const payload: Record<string, unknown> = {};

    if (input.fullName !== undefined) payload.full_name = input.fullName;
    if (input.phone !== undefined) payload.phone = input.phone;
    if (input.email !== undefined) payload.email = input.email;
    if (input.nationalId !== undefined) payload.national_id = input.nationalId;

    const passenger = await passengerRepository.update(id, companyId, payload);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "passenger.updated",
      entityType: "passenger",
      entityId: id,
      metadata: payload
    });

    return passenger;
  }
}

export const passengerService = new PassengerService();
