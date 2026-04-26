import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  const maxRetries = Number.parseInt(process.env.MONGO_CONNECT_MAX_RETRIES ?? "60", 10);
  const retryDelayMs = Number.parseInt(process.env.MONGO_CONNECT_RETRY_DELAY_MS ?? "5000", 10);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, {
        autoIndex: env.nodeEnv !== "production",
        serverSelectionTimeoutMS: 5000
      });

      console.log("Auth service connected to MongoDB");
      return;
    } catch (error) {
      console.error(`Auth service MongoDB connection attempt ${attempt}/${maxRetries} failed`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};
