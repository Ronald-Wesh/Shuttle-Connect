import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { allowedOrigins, env } from "./config/env";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { apiRoutes } from "./routes";
import { ussdRoutes } from "./routes/ussd.routes";
import { smsCallbackRoutes } from "./routes/sms-callback.routes";

const app = express();

export const apiRootHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: "ShuttleConnect API",
    health: "/health",
    docs: "/api/docs"
  });
};

export const healthHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    message: "ShuttleConnect API is healthy",
    uptime: process.uptime()
  });
};

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(compression());
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  })
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", apiRootHandler);

app.get("/health", healthHandler);

// Root level routes for Africa's Talking
app.use("/", ussdRoutes);
app.use("/ussd", ussdRoutes);
app.use("/sms", smsCallbackRoutes);

app.use("/api", apiRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
