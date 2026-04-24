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
  port: Number(process.env.PORT) || 8007,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27024/ev-admin-service",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:8002",
  stationServiceUrl: process.env.STATION_SERVICE_URL || "http://localhost:8003",
  bookingServiceUrl: process.env.BOOKING_SERVICE_URL || "http://localhost:8004",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL || "http://localhost:8005",
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS)
};
