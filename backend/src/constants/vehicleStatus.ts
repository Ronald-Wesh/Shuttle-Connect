export const VEHICLE_STATUS = {
  ACTIVE: "active",
  MAINTENANCE: "maintenance",
  INACTIVE: "inactive"
} as const;

export type VehicleStatus =
  (typeof VEHICLE_STATUS)[keyof typeof VEHICLE_STATUS];
