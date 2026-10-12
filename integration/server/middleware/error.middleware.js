export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    statusCode: 404,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
}

export function errorHandler(err, req, res, next) {
  console.error('[Unified Server Error]', err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || 'An internal server error occurred.',
    errors: err.errors || null,
    timestamp: new Date().toISOString(),
  });
}
