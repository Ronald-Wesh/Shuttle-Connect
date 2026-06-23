import { ROLES } from "../constants/roles";
import { VEHICLE_STATUS } from "../constants/vehicleStatus";
import type { AuthenticatedUser } from "../interfaces/auth.interface";
import type {
  CreateVehicleInput,
  UpdateVehicleInput
} from "../interfaces/vehicle.interface";
import {
  assertCompanyAccess,
  resolveCompanyId
} from "../middleware/company.middleware";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { auditService } from "./audit.service";
import { getPagination, getPaginationMeta } from "../utils/pagination";
import { notFound } from "../utils/httpError";

export class VehicleService {
  async create(input: CreateVehicleInput, user: AuthenticatedUser) {
    const companyId = resolveCompanyId(user, input.companyId);
    const vehicle = await vehicleRepository.create({
      company_id: companyId,
      name: input.name,
      plate_number: input.plateNumber.trim().toUpperCase(),
      model: input.model ?? null,
      seat_capacity: input.seatCapacity,
      status: input.status ?? VEHICLE_STATUS.ACTIVE
    });

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "vehicle.created",
      entityType: "vehicle",
      entityId: vehicle.id
    });

    return vehicle;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      search?: string;
      status?: string;
    }
  ) {
    const requestedCompanyId =
      user.role === ROLES.SUPER_ADMIN ? query.companyId : undefined;
    const companyId =
      user.role === ROLES.SUPER_ADMIN
        ? resolveCompanyId(user, requestedCompanyId, {
            allowSuperAdminGlobal: true
          })
        : resolveCompanyId(user, requestedCompanyId);
    const { page, limit, from, to } = getPagination(query);
    const result = await vehicleRepository.findAll({
      companyId,
      search: query.search,
      status: query.status,
      from,
      to
    });

    return {
      vehicles: result.data,
      meta: getPaginationMeta(page, limit, result.count)
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const companyId =
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
    const vehicle = await vehicleRepository.findById(id, companyId);

    if (!vehicle) {
      throw notFound("Vehicle not found");
    }

    assertCompanyAccess(user, vehicle.company_id);
    return vehicle;
  }

  async update(
    id: string,
    input: UpdateVehicleInput,
    user: AuthenticatedUser
  ) {
    const existingVehicle = await vehicleRepository.findById(
      id,
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user)
    );

    if (!existingVehicle) {
      throw notFound("Vehicle not found");
    }

    assertCompanyAccess(user, existingVehicle.company_id);
    const companyId = existingVehicle.company_id as string;
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.plateNumber !== undefined) {
      payload.plate_number = input.plateNumber.trim().toUpperCase();
    }
    if (input.model !== undefined) payload.model = input.model;
    if (input.seatCapacity !== undefined) payload.seat_capacity = input.seatCapacity;
    if (input.status !== undefined) payload.status = input.status;

    const vehicle = await vehicleRepository.update(id, companyId, payload);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "vehicle.updated",
      entityType: "vehicle",
      entityId: id,
      metadata: payload
    });

    return vehicle;
  }

  async delete(id: string, user: AuthenticatedUser) {
    return this.update(id, { status: VEHICLE_STATUS.INACTIVE }, user);
  }
}

export const vehicleService = new VehicleService();
