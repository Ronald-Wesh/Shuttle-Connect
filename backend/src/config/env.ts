import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  ALLOWED_ORIGINS: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AFRICASTALKING_API_KEY: z.string().optional(),
  AFRICASTALKING_USERNAME: z.string().default("sandbox"),
  AFRICASTALKING_SENDER_ID: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DARAJA_CONSUMER_KEY: z.string().min(1, "DARAJA_CONSUMER_KEY is required"),
  DARAJA_CONSUMER_SECRET: z.string().min(1, "DARAJA_CONSUMER_SECRET is required"),
  DARAJA_SHORTCODE: z.string().min(1, "DARAJA_SHORTCODE is required"),
  DARAJA_PASSKEY: z.string().min(1, "DARAJA_PASSKEY is required"),
  DARAJA_CALLBACK_URL: z.string().url("DARAJA_CALLBACK_URL must be a valid URL"),
  DARAJA_ENV: z.enum(["sandbox", "production"]).default("sandbox")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formattedErrors = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${formattedErrors}`);
}

export const env = parsed.data;

export const allowedOrigins =
  env.ALLOWED_ORIGINS === "*"
    ? "*"
    : env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
