export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    req.body = parsed.body;
    req.params = parsed.params;
    req.validated = parsed;

    return next();
  } catch (error) {
    return next(error);
  }
};
