import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ userId: 1, stationId: 1 }, { unique: true });

reviewSchema.methods.toSanitizedJSON = function toSanitizedJSON() {
  return {
    id: this._id,
    userId: this.userId,
    stationId: this.stationId,
    rating: this.rating,
    comment: this.comment,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
