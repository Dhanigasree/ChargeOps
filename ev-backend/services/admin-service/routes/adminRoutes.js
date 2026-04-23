import express from "express";
import {
  getAllBookings,
  getAllUsers,
  getAnalytics,
  updateStationApproval
} from "../controllers/adminController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { updateStationApprovalSchema } from "../middleware/validationSchemas.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin service is running"
  });
});

router.put(
  "/stations/:id/approve",
  authenticate,
  authorize("admin"),
  validateRequest(updateStationApprovalSchema),
  asyncHandler(updateStationApproval)
);
router.get("/users", authenticate, authorize("admin"), asyncHandler(getAllUsers));
router.get("/bookings", authenticate, authorize("admin"), asyncHandler(getAllBookings));
router.get("/analytics", authenticate, authorize("admin"), asyncHandler(getAnalytics));

export default router;
