export const TRIP_STATUS = {
  SCHEDULED: "scheduled",
  BOARDING: "boarding",
  DEPARTED: "departed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];
