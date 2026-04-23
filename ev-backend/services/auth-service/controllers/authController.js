import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";

const createToken = (user) =>
  jwt.sign(
    {
      name: user.name,
      role: user.role,
      email: user.email
    },
    env.jwtSecret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtExpiresIn
    }
  );

const buildAuthResponse = (user) => ({
  user: user.toSanitizedJSON(),
  token: createToken(user)
});

export const register = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists"
    });
  }

  const user = await User.create(req.body);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: buildAuthResponse(user)
  });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");

  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is inactive"
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: buildAuthResponse(user)
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.id);

  return res.status(200).json({
    success: true,
    data: user?.toSanitizedJSON() || null
  });
};

export const listUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: users.map((user) => user.toSanitizedJSON())
  });
};

export const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  user.role = req.body.role;

  if (typeof req.body.isActive === "boolean") {
    user.isActive = req.body.isActive;
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user.toSanitizedJSON()
  });
};
