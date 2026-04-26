import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import gatewayRoutes from "./routes/index.js";

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.allowedOrigins.includes("*") || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS policy violation"));
  },
  credentials: true
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === "production" ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later"
  }
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use(gatewayRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, "0.0.0.0", () => {
  console.log(`API Gateway listening on port ${env.port}`);
});
