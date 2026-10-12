import jwt from 'jsonwebtoken';
import { User } from '../../../developer1/server/models/User.js';

export async function protect(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[AUTH CONFIG ERROR] JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Server security misconfiguration: JWT_SECRET must be defined in environment.',
      timestamp: new Date().toISOString(),
    });
  }

  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authentication required. Authorization header missing or malformed.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    // If database connection is active, populate full student profile
    try {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) {
        req.user = dbUser.toSafeJSON();
      }
    } catch {
      // In decoupled fallback mode, use token claims directly
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired authorization token.',
      errors: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
