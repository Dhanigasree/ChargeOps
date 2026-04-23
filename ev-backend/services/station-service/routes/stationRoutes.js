import express from "express";
import {
  createStation,
  deleteStation,
  getAllStations,
  getStationById,
  updateStation
} from "../controllers/stationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createStationSchema,
  stationFilterSchema,
  stationIdSchema,
  updateStationSchema
} from "../middleware/validationSchemas.js";

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Station service is running"
  });
});

router.get("/", validateRequest(stationFilterSchema), asyncHandler(getAllStations));
router.get("/:stationId", validateRequest(stationIdSchema), asyncHandler(getStationById));
router.post("/", authenticate, authorize("station", "admin"), validateRequest(createStationSchema), asyncHandler(createStation));
router.put(
  "/:stationId",
  authenticate,
  authorize("station", "admin"),
  validateRequest(updateStationSchema),
  asyncHandler(updateStation)
);
router.delete(
  "/:stationId",
  authenticate,
  authorize("station", "admin"),
  validateRequest(stationIdSchema),
  asyncHandler(deleteStation)
);

export default router;
