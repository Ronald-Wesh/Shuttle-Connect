import type { AuthenticatedUser } from "../interfaces/auth.interface";
import type {
  CreateRouteInput,
  UpdateRouteInput
} from "../interfaces/route.interface";
import { ROLES } from "../constants/roles";
import {
  assertCompanyAccess,
  resolveCompanyId
} from "../middleware/company.middleware";
import { routeRepository } from "../repositories/route.repository";
import { auditService } from "./audit.service";
import { getPagination, getPaginationMeta } from "../utils/pagination";
import { notFound } from "../utils/httpError";

export class RouteService {
  async create(input: CreateRouteInput, user: AuthenticatedUser) {
    const companyId = resolveCompanyId(user, input.companyId);
    const route = await routeRepository.create({
      company_id: companyId,
      origin: input.origin,
      destination: input.destination,
      distance_km: input.distanceKm ?? null,
      estimated_duration_minutes: input.estimatedDurationMinutes ?? null
    });

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "route.created",
      entityType: "route",
      entityId: route.id
    });

    return route;
  }

  async list(
    user: AuthenticatedUser,
    query: Record<string, unknown> & {
      companyId?: string;
      search?: string;
      active?: boolean;
    }
  ) {
    const requestedCompanyId =
      user.role === ROLES.SUPER_ADMIN ? query.companyId : undefined;
    const companyId =
      user.role === ROLES.SUPER_ADMIN && !requestedCompanyId
        ? resolveCompanyId(user, undefined, { allowSuperAdminGlobal: true })
        : resolveCompanyId(user, requestedCompanyId);
    const { page, limit, from, to } = getPagination(query);
    const result = await routeRepository.findAll({
      companyId,
      search: query.search,
      active: query.active,
      from,
      to
    });

    return {
      routes: result.data,
      meta: getPaginationMeta(page, limit, result.count)
    };
  }

  async getById(id: string, user: AuthenticatedUser) {
    const companyId =
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user);
    const route = await routeRepository.findById(id, companyId);

    if (!route) {
      throw notFound("Route not found");
    }

    return route;
  }

  async update(
    id: string,
    input: UpdateRouteInput,
    user: AuthenticatedUser
  ) {
    const existingRoute = await routeRepository.findById(
      id,
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user)
    );

    if (!existingRoute) {
      throw notFound("Route not found");
    }

    assertCompanyAccess(user, existingRoute.company_id);
    const companyId = existingRoute.company_id as string;
    const payload: Record<string, unknown> = {};

    if (input.origin !== undefined) payload.origin = input.origin;
    if (input.destination !== undefined) payload.destination = input.destination;
    if (input.distanceKm !== undefined) payload.distance_km = input.distanceKm;
    if (input.estimatedDurationMinutes !== undefined) {
      payload.estimated_duration_minutes = input.estimatedDurationMinutes;
    }
    if (input.isActive !== undefined) payload.is_active = input.isActive;

    const route = await routeRepository.update(id, companyId, payload);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "route.updated",
      entityType: "route",
      entityId: id,
      metadata: payload
    });

    return route;
  }

  async delete(id: string, user: AuthenticatedUser) {
    const existingRoute = await routeRepository.findById(
      id,
      user.role === ROLES.SUPER_ADMIN ? undefined : resolveCompanyId(user)
    );

    if (!existingRoute) {
      throw notFound("Route not found");
    }

    assertCompanyAccess(user, existingRoute.company_id);
    const companyId = existingRoute.company_id as string;
    const route = await routeRepository.softDelete(id, companyId);

    await auditService.log({
      companyId,
      actorId: user.id,
      action: "route.deleted",
      entityType: "route",
      entityId: id
    });

    return route;
  }
}

export const routeService = new RouteService();
