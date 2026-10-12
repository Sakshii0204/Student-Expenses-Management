import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required. Authorization header missing.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_fallback_secret_student_expense_key';
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Unauthorized. Invalid or expired token.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
