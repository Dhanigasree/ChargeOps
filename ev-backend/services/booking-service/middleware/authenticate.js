import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required"
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, env.jwtSecret);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
