import dotenv from "dotenv";

dotenv.config();

const parseOrigins = (value) =>
  value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : ["*"];

export const env = {
  port: Number(process.env.PORT) || 8004,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ev-booking-service",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  internalServiceApiKey: process.env.INTERNAL_SERVICE_API_KEY || "internal-service-key",
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS)
};
