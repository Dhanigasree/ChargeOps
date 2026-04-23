export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

export const errorHandler = (error, req, res, next) => {
  if (error.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.errors.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "You have already reviewed this station"
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
};
