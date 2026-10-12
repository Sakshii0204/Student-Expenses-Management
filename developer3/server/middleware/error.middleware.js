export function errorHandler(err, req, res, next) {
  console.error('[Developer 3 Error]', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'Internal Server Error',
    errors: err.errors || null,
    timestamp: new Date().toISOString(),
  });
}
