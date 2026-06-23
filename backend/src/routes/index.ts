import { Router } from "express";
import { auditRoutes } from "./audit.routes";
import { authRoutes } from "./auth.routes";
import { bookingRoutes } from "./booking.routes";
import { companyRoutes } from "./company.routes";
import { docsRoutes } from "./docs.routes";
import { notificationRoutes } from "./notification.routes";
import { passengerRoutes } from "./passenger.routes";
import { routeRoutes } from "./route.routes";
import { tripRoutes } from "./trip.routes";
import { vehicleRoutes } from "./vehicle.routes";
import { chatRoutes } from "./chat.routes";

export const apiRoutes = Router();

apiRoutes.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ShuttleConnect API",
    version: "0.1.0",
    docs: "/api/docs"
  });
});

apiRoutes.use("/docs", docsRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/companies", companyRoutes);
apiRoutes.use("/routes", routeRoutes);
apiRoutes.use("/vehicles", vehicleRoutes);
apiRoutes.use("/trips", tripRoutes);
apiRoutes.use("/bookings", bookingRoutes);
apiRoutes.use("/passengers", passengerRoutes);
apiRoutes.use("/notifications", notificationRoutes);
apiRoutes.use("/audit-logs", auditRoutes);
apiRoutes.use("/chat", chatRoutes);
