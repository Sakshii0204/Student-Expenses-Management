import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Access denied. No authorization token provided.',
      errors: null,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_fallback_secret_student_expense_key';
    const decoded = jwt.verify(token, secret);

    // Attach basic claims from token
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    // If database connection is active, populate full fresh user record
    try {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) {
        req.user = dbUser.toSafeJSON();
      }
    } catch {
      // Allow token payload to proceed in decoupled environments
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired token. Please sign in again.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
