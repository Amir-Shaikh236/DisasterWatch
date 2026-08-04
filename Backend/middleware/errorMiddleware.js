import AppError from '../utils/AppError.js'
/**
 * Custom Operational AppError Class.
 * Extends the native JavaScript Error object to cleanly distinguish between 
 * predictable operational errors (e.g., bad inputs) and system programmatic errors.
 */

export const errorHandler = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  error.message = err.message;

  if (error.isOperational) return res.status(error.statusCode).json({ status: error.status, message: error.message });

  console.error('CRITICAL UNHANDLED SYSTEM ERROR', err);

  return res.status(500).json({ status: 'error', message: 'An internal operational exception occurred. Please try again later.' });
};

