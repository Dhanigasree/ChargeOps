import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  await mongoose.connect(env.mongoUri, {
    autoIndex: env.nodeEnv !== "production"
  });

  console.log("Review service connected to MongoDB");
};
