import express from "express";
import { createReview, deleteReview, getReviewsByStation } from "../controllers/reviewController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createReviewSchema, reviewIdSchema, stationReviewSchema } from "../middleware/validationSchemas.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Review service is running"
  });
});

router.post("/", authenticate, authorize("customer", "admin"), validateRequest(createReviewSchema), asyncHandler(createReview));
router.get("/:stationId", validateRequest(stationReviewSchema), asyncHandler(getReviewsByStation));
router.delete("/:id", authenticate, validateRequest(reviewIdSchema), asyncHandler(deleteReview));

export default router;
