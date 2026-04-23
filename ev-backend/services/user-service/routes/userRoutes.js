import express from "express";
import {
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile
} from "../controllers/userController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateProfileSchema } from "../middleware/validationSchemas.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User service is running"
  });
});

router.get("/me", authenticate, asyncHandler(getCurrentUserProfile));
router.put("/me", authenticate, validateRequest(updateProfileSchema), asyncHandler(updateCurrentUserProfile));
router.get("/", authenticate, authorize("admin"), asyncHandler(getAllUsers));

export default router;
