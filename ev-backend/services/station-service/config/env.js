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
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27020/ev-station-service",
  jwtSecret: process.env.JWT_SECRET || "",
  autoSeedStations: process.env.AUTO_SEED_STATIONS !== "false",
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGINS)
};
