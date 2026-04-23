import { env } from "../config/env.js";
import { serviceClient } from "../config/serviceClient.js";
import AdminAuditLog from "../models/AdminAuditLog.js";

export const updateStationApproval = async (req, res) => {
  const authorization = req.headers.authorization;
  const payload = await serviceClient.put(
    `${env.stationServiceUrl}/api/stations/${req.params.id}`,
    authorization,
    { isApproved: req.body.isApproved }
  );

  await AdminAuditLog.create({
    adminUserId: req.user.id,
    action: req.body.isApproved ? "station_approved" : "station_rejected",
    entityType: "station",
    entityId: req.params.id,
    metadata: {
      isApproved: req.body.isApproved
    }
  });

  return res.status(200).json({
    success: true,
    message: req.body.isApproved ? "Station approved successfully" : "Station rejected successfully",
    data: payload.data
  });
};

export const getAllUsers = async (req, res) => {
  const payload = await serviceClient.get(`${env.userServiceUrl}/api/users`, req.headers.authorization);

  return res.status(200).json({
    success: true,
    data: payload.data
  });
};

export const getAllBookings = async (req, res) => {
  const payload = await serviceClient.get(`${env.bookingServiceUrl}/api/bookings/admin/all`, req.headers.authorization);

  return res.status(200).json({
    success: true,
    data: payload.data
  });
};

export const getAnalytics = async (req, res) => {
  const authorization = req.headers.authorization;
  const [usersPayload, bookingsPayload, paymentsPayload] = await Promise.all([
    serviceClient.get(`${env.userServiceUrl}/api/users`, authorization),
    serviceClient.get(`${env.bookingServiceUrl}/api/bookings/admin/all`, authorization),
    serviceClient.get(`${env.paymentServiceUrl}/api/payments/admin/all`, authorization)
  ]);

  const totalRevenue = paymentsPayload.data
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return res.status(200).json({
    success: true,
    data: {
      totalUsers: usersPayload.data.length,
      totalBookings: bookingsPayload.data.length,
      totalRevenue,
      successfulPayments: paymentsPayload.data.filter((payment) => payment.status === "success").length
    }
  });
};
