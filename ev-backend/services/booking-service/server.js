import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import bookingRoutes from "./routes/bookingRoutes.js";

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
  max: env.nodeEnv === "production" ? 250 : 1000,
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

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking service is healthy"
  });
});

app.use("/api/bookings", bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Booking service listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start booking service", error);
    process.exit(1);
  }
};

startServer();
