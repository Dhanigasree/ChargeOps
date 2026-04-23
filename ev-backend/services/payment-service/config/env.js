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
  port: Number(process.env.PORT) || 8005,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ev-payment-service",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  bookingServiceUrl: process.env.BOOKING_SERVICE_URL || "http://localhost:8004",
  internalServiceApiKey: process.env.INTERNAL_SERVICE_API_KEY || "internal-service-key",
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS)
};
