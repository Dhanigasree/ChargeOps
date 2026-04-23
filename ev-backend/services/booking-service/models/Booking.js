import mongoose from "mongoose";

export const BOOKING_STATUSES = ["booked", "cancelled", "completed"];
export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"];

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    stationId: {
      type: String,
      required: true,
      index: true
    },
    slotTime: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "booked"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "unpaid"
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index(
  { stationId: 1, slotTime: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "booked"
    }
  }
);

bookingSchema.methods.toSanitizedJSON = function toSanitizedJSON() {
  return {
    id: this._id,
    userId: this.userId,
    stationId: this.stationId,
    slotTime: this.slotTime,
    status: this.status,
    amount: this.amount,
    paymentStatus: this.paymentStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
