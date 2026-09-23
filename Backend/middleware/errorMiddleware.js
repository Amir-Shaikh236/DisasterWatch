export const errorHandler = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // isOperational Make this error safe & predictabel
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.status = 'fail';
    const failedField = Object.keys(err.errors)[0];
    err.message = err.errors[failedField].message;
    err.isOperational = true
  }

  if (err.isOperational) return res.status(err.statusCode).json({ status: err.status, message: err.message });

  console.error('CRITICAL UNHANDLED SYSTEM ERROR', err);

  return res.status(500).json({ status: 'error', message: 'An internal operational exception occurred. Please try again later.' });
};

