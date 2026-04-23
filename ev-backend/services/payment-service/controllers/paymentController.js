import { randomUUID } from "crypto";
import { env } from "../config/env.js";
import Payment from "../models/Payment.js";

const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  const response = await fetch(`${env.bookingServiceUrl}/api/bookings/${bookingId}/payment-status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-service-key": env.internalServiceApiKey
    },
    body: JSON.stringify({ paymentStatus }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const error = new Error(payload?.message || "Failed to update booking payment status");
    error.statusCode = response.status;
    throw error;
  }
};

export const createPayment = async (req, res) => {
  const existingPayment = await Payment.findOne({
    bookingId: req.body.bookingId,
    userId: req.user.id,
    status: "success"
  });

  if (existingPayment) {
    return res.status(409).json({
      success: false,
      message: "Booking is already marked as paid",
      data: existingPayment.toSanitizedJSON()
    });
  }

  const payment = await Payment.create({
    bookingId: req.body.bookingId,
    userId: req.user.id,
    amount: req.body.amount,
    paymentMethod: req.body.paymentMethod,
    transactionId: `txn_${randomUUID()}`,
    status: "pending"
  });

  try {
    await updateBookingPaymentStatus(payment.bookingId, "paid");
    payment.status = "success";
    await payment.save();
  } catch (error) {
    payment.status = "failed";
    await payment.save();
    throw error;
  }

  return res.status(201).json({
    success: true,
    message: "Payment processed successfully",
    data: payment.toSanitizedJSON()
  });
};

export const getPaymentById = async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found"
    });
  }

  if (req.user.role !== "admin" && payment.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to access this payment"
    });
  }

  return res.status(200).json({
    success: true,
    data: payment.toSanitizedJSON()
  });
};

export const getAllPayments = async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: payments.map((payment) => payment.toSanitizedJSON())
  });
};
