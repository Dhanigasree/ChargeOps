import express from "express";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getStationBookings,
  getUserBookings,
  updateBookingPaymentStatus
} from "../controllers/bookingController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  bookingIdSchema,
  createBookingSchema,
  stationBookingsSchema,
  updatePaymentStatusSchema
} from "../middleware/validationSchemas.js";
import { verifyServiceRequest } from "../middleware/verifyServiceRequest.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking service is running"
  });
});

router.post("/", authenticate, authorize("customer", "admin"), validateRequest(createBookingSchema), asyncHandler(createBooking));
router.patch("/:bookingId/cancel", authenticate, validateRequest(bookingIdSchema), asyncHandler(cancelBooking));
router.get("/me", authenticate, authorize("customer", "admin"), asyncHandler(getUserBookings));
router.get("/admin/all", authenticate, authorize("admin"), asyncHandler(getAllBookings));
router.get(
  "/station/:stationId",
  authenticate,
  authorize("station", "admin"),
  validateRequest(stationBookingsSchema),
  asyncHandler(getStationBookings)
);
router.patch(
  "/:bookingId/payment-status",
  verifyServiceRequest,
  validateRequest(updatePaymentStatusSchema),
  asyncHandler(updateBookingPaymentStatus)
);

export default router;
