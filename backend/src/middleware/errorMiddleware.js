
export const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode >= 400
    ? res.statusCode
    : 500;

  let message = error.message || 'Internal server error';

  // Handle invalid MongoDB ObjectId
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  // Handle duplicate MongoDB records
  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : 'Duplicate record';
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
};
