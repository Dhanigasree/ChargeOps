import Review from "../models/Review.js";

export const createReview = async (req, res) => {
  const review = await Review.create({
    userId: req.user.id,
    stationId: req.body.stationId,
    rating: req.body.rating,
    comment: req.body.comment || ""
  });

  return res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: review.toSanitizedJSON()
  });
};

export const getReviewsByStation = async (req, res) => {
  const reviews = await Review.find({ stationId: req.params.stationId }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: reviews.map((review) => review.toSanitizedJSON())
  });
};

export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found"
    });
  }

  if (req.user.role !== "admin" && review.userId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this review"
    });
  }

  await review.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully"
  });
};
