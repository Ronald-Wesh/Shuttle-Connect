import { randomUUID } from "crypto";

export const generateBookingReference = () => {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();

  return `SC-${suffix}`;
};
