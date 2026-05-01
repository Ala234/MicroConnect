// ── 404 Handler ────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// ── Global Error Handler ───────────────────────────────
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Bad MongoDB ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      message: 'Invalid ID format',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // Duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists`,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(', '),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired, please login again',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  // Generic fallback
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };