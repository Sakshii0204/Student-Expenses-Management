export function errorHandler(err, req, res, next) {
  console.error('[Error Occurred]', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    timestamp: new Date().toISOString(),
  });
}
