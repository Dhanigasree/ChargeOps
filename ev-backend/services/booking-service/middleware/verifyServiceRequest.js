import { env } from "../config/env.js";

export const verifyServiceRequest = (req, res, next) => {
  const serviceKey = req.headers["x-service-key"];

  if (!serviceKey || serviceKey !== env.internalServiceApiKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid internal service credentials"
    });
  }

  return next();
};
