import express from "express";
import { createPayment, getAllPayments, getPaymentById } from "../controllers/paymentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createPaymentSchema, paymentIdSchema } from "../middleware/validationSchemas.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Payment service is running"
  });
});

router.post("/create", authenticate, authorize("customer", "admin"), validateRequest(createPaymentSchema), asyncHandler(createPayment));
router.get("/admin/all", authenticate, authorize("admin"), asyncHandler(getAllPayments));
router.get("/:id", authenticate, validateRequest(paymentIdSchema), asyncHandler(getPaymentById));

export default router;
