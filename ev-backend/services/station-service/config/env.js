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
  port: Number(process.env.PORT) || 8003,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ev-station-service",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS)
};
