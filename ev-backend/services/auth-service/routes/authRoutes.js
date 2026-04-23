import express from "express";
import {
  getCurrentUser,
  listUsers,
  login,
  register,
  updateUserRole
} from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { loginSchema, registerSchema, updateRoleSchema } from "../middleware/validationSchemas.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth service is running"
  });
});

router.post("/register", validateRequest(registerSchema), asyncHandler(register));
router.post("/login", validateRequest(loginSchema), asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getCurrentUser));
router.get("/users", authenticate, authorize("admin"), asyncHandler(listUsers));
router.patch(
  "/users/:userId/role",
  authenticate,
  authorize("admin"),
  validateRequest(updateRoleSchema),
  asyncHandler(updateUserRole)
);

export default router;
