const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((error) => {
    const statusCode =
      error.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    res.status(statusCode).json({ message: error.message });
  });
};

export default asyncHandler;
